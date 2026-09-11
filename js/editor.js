/* =============================================================
   EDITOR — authoring tool.
   Reads the same content files the game reads, edits them in
   memory, writes them back out in the same format. No server, no
   database, no second source of truth.
   ============================================================= */

const Editor = (function () {
  "use strict";

  let M = null;              // the editable model
  let sel = { tab: "events", id: null };

  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));

  /* ---------- model ---------- */

  /* ---------- undo ----------
     A snapshot before every destructive action. Cheap at this scale and
     it removes the fear that stops people experimenting. */
  const UNDO = []; const UNDO_MAX = 40;
  function snapshot(label) {
    UNDO.push({ label, model: JSON.stringify(M), sel: JSON.parse(JSON.stringify(sel)) });
    if (UNDO.length > UNDO_MAX) UNDO.shift();
    const b = document.getElementById("ed-undo");
    if (b) { b.disabled = false; b.textContent = "Undo " + label; }
  }
  function undo() {
    const u = UNDO.pop(); if (!u) return;
    M = JSON.parse(u.model); sel = u.sel;
    const b = document.getElementById("ed-undo");
    b.disabled = !UNDO.length;
    b.textContent = UNDO.length ? "Undo " + UNDO[UNDO.length - 1].label : "Undo";
    draw();
  }

  function load() {
    M = {
      events: clone(EVENTS), parties: clone(PARTIES), currents: clone(CURRENTS),
      stations: clone(STATIONS), characters: clone(CHARACTERS),
      bills: clone(BILLS), glossary: clone(GLOSSARY),
      constituencies: clone(typeof CONSTITUENCIES !== "undefined" ? CONSTITUENCIES : []),
      functional: clone(typeof FUNCTIONAL !== "undefined" ? FUNCTIONAL : []),
      encyclopedia: clone(ENCYCLOPEDIA)
    };
  }

  /* every enumeration the forms draw from, computed live off the model */
  function vocab(src) {
    if (Array.isArray(src)) return src.map(v => [v, v]);
    const V = SCHEMA.vocab;
    switch (src) {
      case "scalars": return V.scalars.map(v => [v, v.replace(/_/g, " ")]);
      case "prices": return V.prices.map(v => [v, v]);
      case "laws": return V.laws.map(v => [v, v.replace(/_/g, " ")]);
      case "tiers": return V.tiers.map(v => [v, v]);
      case "stationFields": return V.stationFields.map(v => [v, v]);
      case "billFields": return V.billFields.map(v => [v, v]);
      case "parties": return M.parties.map(p => [p.id, p.name]);
      case "stations": return M.stations.map(s => [s.id, s.name]);
      case "bands": return SCHEMA.vocab.bands.map(v => [v, v]);
      case "bills": return M.bills.map(b => [b.id, b.title]);
      case "functional": return (M.functional || []).map(f => [f.id, f.name]);
      case "events": return M.events.map(e => [e.id, e.title]);
      case "characters": return M.characters.map(c => [c.id, c.name]);
      case "archetypes": return [["", "— none —"]].concat(
        (typeof ARCHETYPES !== "undefined" ? ARCHETYPES : []).map(a => [a.id, a.name]));
      case "franchise": return [["licensure","Licensure — individuals with a professional licence"],
        ["corporate","Corporate — companies vote, not employees"],
        ["union_bloc","Union bloc — a union casts for its members"],
        ["residual","Residual — everyone in no recognised sector"]];
      case "cxArticles": {
        const gen = M.parties.map(p => [p.id, p.name])
          .concat(M.stations.map(s => [s.id, s.name]))
          .concat(M.bills.map(b => ["bill_" + b.id, b.title]))
          .concat(M.characters.map(c => ["person_" + c.id, c.name]))
          .concat(M.glossary.map(g => ["term_" + g.term.toLowerCase().replace(/\s+/g, "_"), g.term]));
        return M.encyclopedia.articles.map(a => [a.id, a.title + " §"]).concat(gen);
      }
      case "loyaltyTargets": return M.parties.map(p => [p.id, p.name])
        .concat(M.currents.map(c => [c.id, "  ↳ " + c.name]));
      case "relTargets": return [["president", "The President"]]
        .concat(M.characters.map(c => [c.id, c.name]));
      default: return [];
    }
  }

  function allFlags() {
    const f = new Set();
    M.events.forEach(e => {
      (e.when?.flags || []).forEach(x => f.add(x));
      (e.when?.flagsAbsent || []).forEach(x => f.add(x));
      (e.choices || []).forEach(c => [].concat(c.effects || []).forEach(eff => {
        [].concat(eff.flag || []).forEach(x => f.add(x));
        [].concat(eff.unflag || []).forEach(x => f.add(x));
      }));
    });
    return [...f].sort();
  }

  /* ---------- small form helpers ---------- */

  function sel_(name, src, cur, cls) {
    const opts = vocab(src).map(([v, l]) =>
      `<option value="${esc(v)}"${v === cur ? " selected" : ""}>${esc(l)}</option>`).join("");
    return `<select class="ed-f ${cls || ""}" data-f="${name}">${opts}</select>`;
  }
  function num_(name, cur, w) {
    return `<input class="ed-f ed-num" data-f="${name}" type="number" value="${cur == null ? "" : cur}" style="width:${w || 54}px">`;
  }
  function txt_(name, cur, ph, w) {
    return `<input class="ed-f" data-f="${name}" type="text" value="${esc(cur)}" placeholder="${esc(ph || "")}"${w ? ` style="width:${w}px"` : ""}>`;
  }
  function flag_(name, cur) {
    return `<input class="ed-f" data-f="${name}" type="text" value="${esc(cur)}" list="ed-flags" placeholder="flag_name">`;
  }

  /* =========================================================
     EFFECTS — read an effect object into form rows, and back
     ========================================================= */

  function effToRow(eff) {
    const verb = Object.keys(eff)[0], v = eff[verb], d = SCHEMA.effects[verb];
    if (!d) return { verb, key: "", field: "", value: JSON.stringify(v), delta: "" };
    const r = { verb, key: "", field: "", value: "", delta: "" };
    switch (d.shape) {
      case "keyed":     r.key = Object.keys(v)[0]; r.delta = v[r.key]; break;
      case "keyedSet":  r.key = Object.keys(v)[0]; r.value = v[r.key]; break;
      case "nested":    r.key = Object.keys(v)[0]; r.field = Object.keys(v[r.key])[0];
                        r.delta = v[r.key][r.field]; break;
      case "nestedSet": r.key = Object.keys(v)[0]; r.field = Object.keys(v[r.key])[0];
                        r.value = v[r.key][r.field]; break;
      case "scalarVal": r.value = [].concat(v)[0]; break;
      case "coalition": r.field = Object.keys(v)[0]; r.value = [].concat(v[r.field])[0]; break;
      case "queue":     { const q = [].concat(v)[0]; r.value = q.event; r.delta = q.after || 1; break; }
    }
    return r;
  }

  function rowToEff(r) {
    const d = SCHEMA.effects[r.verb]; if (!d) return null;
    const n = x => x === "" || x == null ? 0 : (isNaN(+x) ? x : +x);
    switch (d.shape) {
      case "keyed":     return { [r.verb]: { [r.key]: n(r.delta) } };
      case "keyedSet":  return { [r.verb]: { [r.key]: n(r.value) } };
      case "nested":    return { [r.verb]: { [r.key]: { [r.field]: n(r.delta) } } };
      case "nestedSet": return { [r.verb]: { [r.key]: { [r.field]: n(r.value) } } };
      case "scalarVal": return { [r.verb]: r.verb === "chapter" ? (+r.value || 1) : r.value };
      case "coalition": return { [r.verb]: { [r.field]: [r.value] } };
      case "queue":     return { [r.verb]: [{ event: r.value, after: +r.delta || 1 }] };
    }
  }

  function effRow(eff, ci, ei) {
    const r = effToRow(eff), d = SCHEMA.effects[r.verb] || { args: [] };
    const verbSel = `<select class="ed-f ed-verb" data-f="verb">` +
      Object.keys(SCHEMA.effects).map(k =>
        `<option value="${k}"${k === r.verb ? " selected" : ""}>${esc(SCHEMA.effects[k].label)}</option>`).join("") +
      `</select>`;
    const fields = d.args.map(a => {
      const cur = r[a.k];
      if (a.type === "enum") return `<label>${esc(a.label)} ${sel_(a.k, a.src, cur)}</label>`;
      if (a.type === "int" || a.type === "num") return `<label>${esc(a.label)} ${num_(a.k, cur)}</label>`;
      if (a.type === "flag") return `<label>${esc(a.label)} ${flag_(a.k, cur)}</label>`;
      return `<label>${esc(a.label)} ${txt_(a.k, cur, a.hint, 220)}</label>`;
    }).join("");
    return `<div class="ed-eff" data-ci="${ci}" data-ei="${ei}">${verbSel}${fields}` +
      `<button class="btn ed-x" data-act="eff-del" data-ci="${ci}" data-ei="${ei}">×</button></div>`;
  }

  /* =========================================================
     CONDITIONS
     ========================================================= */

  function condRows(when) {
    when = when || {};
    return Object.keys(when).map(k => {
      const d = SCHEMA.conditions[k]; if (!d) return "";
      let inner = "";
      if (d.form === "int") inner = num_("v", when[k], 60);
      else if (d.form === "bool")
        inner = `<select class="ed-f" data-f="v"><option value="true"${when[k] ? " selected" : ""}>yes</option>` +
                `<option value="false"${!when[k] ? " selected" : ""}>no</option></select>`;
      else if (d.form === "flagList")
        inner = txt_("v", (when[k] || []).join(", "), "flag_a, flag_b", 300);
      else if (d.form === "map") {
        const key = Object.keys(when[k])[0], v = when[k][key];
        inner = sel_("k", d.src, key) +
          (d.vtype === "stage" ? sel_("v", SCHEMA.vocab.billStages, v) : num_("v", v, 70));
      }
      return `<div class="ed-cond" data-c="${k}"><b>${esc(d.label)}</b>${inner}` +
             `<button class="btn ed-x" data-act="cond-del" data-c="${k}">×</button></div>`;
    }).join("");
  }

  function readConds(scope) {
    const when = {};
    scope.querySelectorAll(".ed-cond").forEach(n => {
      const k = n.dataset.c, d = SCHEMA.conditions[k];
      const g = f => n.querySelector(`[data-f="${f}"]`);
      if (d.form === "int") when[k] = +g("v").value;
      else if (d.form === "bool") when[k] = g("v").value === "true";
      else if (d.form === "flagList")
        when[k] = g("v").value.split(",").map(s => s.trim()).filter(Boolean);
      else if (d.form === "map") {
        const v = g("v").value;
        when[k] = { [g("k").value]: d.vtype === "stage" ? v : +v };
      }
    });
    return Object.keys(when).length ? when : undefined;
  }

  /* =========================================================
     EVENT FORM
     ========================================================= */

  function eventForm(e) {
    const speakers = [["", "— none —"]].concat(vocab("characters"));
    return `
    <div class="ed-grid">
      <label class="ed-w">Id ${txt_("id", e.id, "unique_id", 200)}<button class="btn ed-add" data-act="rename">rename…</button></label>
      <label class="ed-w">Title ${txt_("title", e.title, "", 340)}</label>
      <label>Speaker <select class="ed-f" data-f="speaker">${speakers.map(([v, l]) =>
        `<option value="${esc(v)}"${v === (e.speaker || "") ? " selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
      <label>Chapter ${num_("chapter", e.chapter == null ? "" : e.chapter)}
        <span class="ed-hint">blank = any</span></label>
      <label>Weight ${num_("weight", e.weight == null ? 50 : e.weight)}</label>
      <label>Prologue ${num_("prologue", e.prologue == null ? "" : e.prologue)}
        <span class="ed-hint">ordered opening of its chapter</span></label>
      <label class="ed-chk"><input type="checkbox" class="ed-f" data-f="once" ${e.once ? "checked" : ""}> once only</label>
      <label class="ed-chk"><input type="checkbox" class="ed-f" data-f="queuedOnly" ${e.queuedOnly ? "checked" : ""}> queued only</label>
    </div>

    <div class="rulehead">Conditions <button class="btn ed-add" data-act="cond-add">+ condition</button></div>
    <div id="ed-conds">${condRows(e.when)}</div>

    <div class="rulehead">Image</div>
    <div class="ed-grid">
      <label class="ed-w">File ${txt_("img_src", e.image?.src || "", "vantage_radiator.png", 220)}</label>
      <label>Palette ${sel_("img_palette", SCHEMA.vocab.palettes, e.image?.palette || "registry")}</label>
      <label class="ed-w">Caption ${txt_("img_caption", e.image?.caption || "", "", 260)}</label>
      <label>Credit ${txt_("img_credit", e.image?.credit || "", "", 150)}</label>
    </div>

    <div class="rulehead">Body</div>
    <textarea class="ed-f ed-body" data-f="body" rows="12" spellcheck="true">${esc(e.body)}</textarea>

    <div class="rulehead">Choices <button class="btn ed-add" data-act="choice-add">+ choice</button></div>
    <div id="ed-choices">${(e.choices || []).map((c, i) => choiceBlock(c, i)).join("")}</div>`;
  }

  function choiceBlock(c, i) {
    return `<div class="ed-choice" data-ci="${i}">
      <div class="ed-choicehd">
        <span class="ed-cnum">${i + 1}</span>
        <input class="ed-f ed-label" data-f="label" type="text" value="${esc(c.label)}" placeholder="What the button says">
        <button class="btn ed-x" data-act="choice-del" data-ci="${i}">×</button>
      </div>
      <label class="ed-res">Result <input class="ed-f" data-f="result" type="text" value="${esc(c.result || "")}" placeholder="Line shown after the choice"></label>
      <div class="ed-effhd">Effects <button class="btn ed-add" data-act="eff-add" data-ci="${i}">+ effect</button></div>
      <div class="ed-effs">${[].concat(c.effects || []).map((eff, ei) => effRow(eff, i, ei)).join("")}</div>
    </div>`;
  }

  function readEvent() {
    const g = f => document.querySelector(`#ed-form [data-f="${f}"]`);
    const e = {
      id: g("id").value.trim(),
      title: g("title").value,
      body: g("body").value
    };
    const ch = g("chapter").value;
    if (ch !== "") e.chapter = +ch;
    const pro = g("prologue").value;
    if (pro !== "") e.prologue = +pro; else e.weight = +g("weight").value;
    if (g("once").checked) e.once = true;
    if (g("queuedOnly").checked) e.queuedOnly = true;
    if (g("speaker").value) e.speaker = g("speaker").value;
    const when = readConds(document.getElementById("ed-conds"));
    if (when) e.when = when;
    if (g("img_src").value.trim()) e.image = {
      src: g("img_src").value.trim(), palette: g("img_palette").value,
      caption: g("img_caption").value, credit: g("img_credit").value
    };
    e.choices = [...document.querySelectorAll("#ed-choices .ed-choice")].map(n => {
      const q = f => n.querySelector(`:scope > * [data-f="${f}"], :scope > [data-f="${f}"]`);
      const ch = { label: n.querySelector('[data-f="label"]').value,
                   effects: [], result: n.querySelector('[data-f="result"]').value || undefined };
      n.querySelectorAll(".ed-eff").forEach(en => {
        const r = { verb: en.querySelector('[data-f="verb"]').value };
        en.querySelectorAll("[data-f]").forEach(f => { if (f.dataset.f !== "verb") r[f.dataset.f] = f.value; });
        const eff = rowToEff(r); if (eff) ch.effects.push(eff);
      });
      if (!ch.effects.length) delete ch.effects;
      return ch;
    });
    return e;
  }

  /* =========================================================
     ROSTER FORMS  (parties, stations, characters, bills, glossary)
     ========================================================= */

  function partyForm(p) {
    const A = SCHEMA.vocab.axes;
    return `<div class="ed-grid">
      <label>Id ${txt_("id", p.id, "", 90)}<button class="btn ed-add" data-act="rename">rename…</button></label>
      <label class="ed-w">Name ${txt_("name", p.name, "", 300)}</label>
      <label>Short ${txt_("short", p.short || "", "", 70)}</label>
      <label class="ed-w">Aliases ${txt_("aliases", (p.aliases || []).join(", "), "press nicknames", 220)}</label>
      <label>Colour ${txt_("colour", p.colour, "", 130)}</label>
      <label>Loyalty ${num_("loyalty", p.loyalty)}</label>
      <label class="ed-w">Logo ${txt_("logo", p.logo || "", "cu.png", 150)}
        ${p.logo ? `<img class="dith ed-logopv" src="img/logos/${esc(p.logo)}" onerror="this.style.display='none'">` : ""}
        <button class="btn ed-add" data-act="logo-make">Make from image…</button></label>
    </div>
    <div class="rulehead">Seats</div>
    <div class="ed-grid">
      <label>District ${num_("district", p.seats.district)}</label>
      <label>List ${num_("list", p.seats.list)}</label>
      <label>Functional ${num_("functional", p.seats.functional)}</label>
      <label class="ed-note">Total <b>${p.seats.district + p.seats.list + p.seats.functional}</b></label>
    </div>
    <div class="rulehead">Axes</div>
    <div class="ed-grid">${Object.keys(A).map(k =>
      `<label>${k} <select class="ed-f" data-f="ax_${k}">` +
      `<option value=""${!p.axes[k] ? " selected" : ""}>— none —</option>` +
      A[k].map(v => `<option value="${v}"${p.axes[k] === v ? " selected" : ""}>${v}</option>`).join("") +
      `</select></label>`).join("")}</div>
    <div class="rulehead">Note</div>
    <textarea class="ed-f ed-body" data-f="note" rows="3">${esc(p.note || "")}</textarea>`;
  }

  function stationForm(s) {
    return `<div class="ed-grid ed-arch">
      <label class="ed-w">Archetype ${sel_("archetype", "archetypes", s.archetype || "")}</label>
      <button class="btn" data-act="arch-roll">Roll from archetype</button>
      <button class="btn" data-act="arch-reroll">Reroll numbers only</button>
      <span class="ed-hint">sets band, form, population, ratio, closure, suspended, attestation and seats together</span>
    </div>
    <div class="ed-grid">
      <label>Id ${txt_("id", s.id, "", 100)}<button class="btn ed-add" data-act="rename">rename…</button></label>
      <label class="ed-w">Name ${txt_("name", s.name, "", 260)}<button class="btn ed-add" data-act="roll-name">roll</button></label>
      <label>Band ${sel_("band", SCHEMA.vocab.bands, s.band)}</label>
      <label>Type ${sel_("type", SCHEMA.vocab.stationTypes, s.type)}</label>
      <label>Form ${sel_("form", SCHEMA.vocab.stationForms, s.form || "cylinder")}
        <span class="ed-hint">glyph on the chart</span></label>
      <label>Settlements ${num_("settlements", s.settlements == null ? "" : s.settlements)}</label>
      <label>Seats ${num_("seats", s.seats)}</label>
      <label>Population ${num_("population", s.population, 100)}</label>
      <label>Closure ${num_("closure", s.closure)}</label>
      <label>Suspended ${num_("suspended", s.suspended, 90)}</label>
      <label>Attested ${num_("attested", s.attested)}</label>
    </div>
    <div class="rulehead">Composition <span class="ed-hint">share of adults by legal category; should sum to 1</span></div>
    <div class="ed-grid">${["biological","emulation","uplift","synthetic"].map(k =>
      `<label>${k} ${num_("comp_" + k, (s.composition || {})[k] == null ? 0 : s.composition[k])}</label>`).join("")}
      <label class="ed-note">Sum <b>${["biological","emulation","uplift","synthetic"]
        .reduce((n, k) => n + ((s.composition || {})[k] || 0), 0).toFixed(2)}</b></label>
    </div>
    <div class="rulehead">Material interest <span class="ed-hint">comma separated tags</span></div>
    ${txt_("material_interest", (s.material_interest || []).join(", "), "", 520)}
    <div class="rulehead">Dependency <span class="ed-hint">what it needs from the centre</span></div>
    <textarea class="ed-f ed-body" data-f="dependency" rows="2">${esc(s.dependency)}</textarea>
    <div class="rulehead">Grievance <span class="ed-hint">what it holds against the centre</span></div>
    <textarea class="ed-f ed-body" data-f="grievance" rows="2">${esc(s.grievance)}</textarea>`;
  }

  function characterForm(c) {
    return `<div class="ed-grid">
      <label>Id ${txt_("id", c.id, "", 110)}<button class="btn ed-add" data-act="rename">rename…</button></label>
      <label class="ed-w">Name ${txt_("name", c.name, "", 300)}<button class="btn ed-add" data-act="roll-name">roll</button></label>
      <label class="ed-w">Role ${txt_("role", c.role, "", 240)}</label>
      <label>Office <select class="ed-f" data-f="office"><option value="">— none —</option>${
        ["pm","minister","opposition","shadow","leader","whip"].map(o =>
          `<option value="${o}"${c.office === o ? " selected" : ""}>${o}</option>`).join("")
      }</select></label>
      <label>Party <select class="ed-f" data-f="party"><option value="">— none —</option>${
        M.parties.map(p => `<option value="${p.id}"${c.party === p.id ? " selected" : ""}>${esc(p.name)}</option>`).join("")
      }</select></label>
      <label class="ed-w">Seat ${txt_("seat", c.seat || "", "", 240)}</label>
      <label>Functional <select class="ed-f" data-f="functional"><option value="">— none —</option>${
        (M.functional || []).map(f => `<option value="${f.id}"${c.functional === f.id ? " selected" : ""}>${esc(f.name)}</option>`).join("")
      }</select></label>
      <label>Relationship ${num_("relationship", c.relationship)}</label>
      <label class="ed-w">Portrait ${txt_("portrait", c.portrait || "", "name.png", 180)}</label>
    </div>
    <div class="rulehead">Note</div>
    <textarea class="ed-f ed-body" data-f="note" rows="3">${esc(c.note || "")}</textarea>`;
  }

  function billForm(b) {
    const rows = M.parties.map(p => {
      const s = (b.stances || {})[p.id];
      const split = s && typeof s === "object" && (s.popular != null || s.functional != null);
      return `<tr data-p="${p.id}">
        <td><i class="swatch" style="background:${p.colour}"></i>${esc(p.name)}</td>
        <td>${stanceCell("pop", split ? s.popular : s)}</td>
        <td>${stanceCell("fun", split ? s.functional : s)}</td>
      </tr>`;
    }).join("");
    return `<div class="ed-grid">
      <label>Id ${txt_("id", b.id, "", 110)}<button class="btn ed-add" data-act="rename">rename…</button></label>
      <label>Ref ${txt_("ref", b.ref, "", 90)}</label>
      <label class="ed-w">Title ${txt_("title", b.title, "", 380)}<button class="btn ed-add" data-act="roll-name">roll</button></label>
      <label>Stage ${sel_("stage", SCHEMA.vocab.billStages, b.stage)}</label>
      <label>Owner <select class="ed-f" data-f="owner"><option value=""${!b.owner ? " selected" : ""}>— government —</option>${
        M.parties.map(p => `<option value="${p.id}"${b.owner === p.id ? " selected" : ""}>${esc(p.name)}</option>`).join("")
      }</select></label>
      <label class="ed-chk"><input type="checkbox" class="ed-f" data-f="priority" ${b.priority ? "checked" : ""}> priority for them</label>
      <label class="ed-chk"><input type="checkbox" class="ed-f" data-f="dualMajority" ${b.dualMajority ? "checked" : ""}> dual majority</label>
    </div>
    <div class="rulehead">Summary</div>
    <textarea class="ed-f ed-body" data-f="summary" rows="4">${esc(b.summary)}</textarea>
    <div class="rulehead">Estimated effect</div>
    ${txt_("effectNote", b.effectNote || "", "", 520)}
    <div class="rulehead">Stances <span class="ed-hint">blank = inferred from axis agreement</span></div>
    <table class="ed-stance"><thead><tr><th>Party</th><th>Elected bench</th><th>Functional bench</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div id="ed-forecast" class="ed-forecast"></div>`;
  }

  function stanceCell(which, s) {
    let kind = "", n = "";
    if (s === "for" || s === "against" || s === "abstain") kind = s;
    else if (s && typeof s === "object") {
      if (s.free) kind = "free";
      else if (s.forPct != null) { kind = "percent"; n = s.forPct; }
      else if (s.for != null) { kind = "count"; n = s.for; }
    }
    const opts = [["", "— infer —"]].concat(SCHEMA.vocab.stanceForms.map(v => [v, v]));
    return `<select class="ed-f ed-st" data-f="${which}_kind">${opts.map(([v, l]) =>
      `<option value="${v}"${v === kind ? " selected" : ""}>${l}</option>`).join("")}</select>` +
      `<input class="ed-f ed-num" data-f="${which}_n" type="number" step="any" value="${n}" style="width:56px${
        (kind === "count" || kind === "percent") ? "" : ";visibility:hidden"}">`;
  }

  function readStances() {
    const st = {};
    document.querySelectorAll(".ed-stance tbody tr").forEach(tr => {
      const pid = tr.dataset.p;
      const mk = which => {
        const k = tr.querySelector(`[data-f="${which}_kind"]`).value;
        const n = tr.querySelector(`[data-f="${which}_n"]`).value;
        if (!k) return undefined;
        if (k === "count") return { for: +n || 0 };
        if (k === "percent") return { forPct: +n || 0 };
        if (k === "free") return { free: true };
        return k;
      };
      const p = mk("pop"), f = mk("fun");
      if (p === undefined && f === undefined) return;
      st[pid] = JSON.stringify(p) === JSON.stringify(f) ? p : { popular: p, functional: f };
    });
    return st;
  }

  function glossForm(g) {
    const clusters = [...new Set(M.glossary.map(x => x.cluster).filter(Boolean))];
    return `<div class="ed-grid">
      <label class="ed-w">Term ${txt_("term", g.term, "", 220)}</label>
      <label class="ed-w">Cluster ${txt_("cluster", g.cluster || "", "copies, cold, heat…", 160)}
        <span class="ed-hint">${clusters.join(" · ")}</span></label>
      <label>Introduced <select class="ed-f" data-f="introduced"><option value="">— none —</option>${
        M.events.map(e => `<option value="${e.id}"${g.introduced === e.id ? " selected" : ""}>${esc(e.title)}</option>`).join("")
      }</select></label>
      <label class="ed-chk"><input type="checkbox" class="ed-f" data-f="assumed" ${g.assumed ? "checked" : ""}> assumed (needs no teaching)</label>
    </div>
    <div class="rulehead">Gloss <span class="ed-hint">one line. If it needs two, the concept is too big.</span></div>
    ${txt_("gloss", g.gloss, "", 620)}
    <div class="rulehead">Handle <span class="ed-hint">the familiar real-world shape it hangs on</span></div>
    ${txt_("handle", g.handle || "", "", 620)}`;
  }


  /* ---------- functional constituency form ---------- */
  function fcForm(f) {
    const rows = M.parties.filter(p => (f.held || {})[p.id] != null || p.seats.functional > 0)
      .map(p => `<label>${esc(p.short || p.id)} ${num_("held_" + p.id, (f.held || {})[p.id] || 0, 46)}</label>`).join("");
    const total = Object.values(f.held || {}).reduce((a, b) => a + b, 0);
    const per = f.seats ? Math.round(f.electorate / f.seats) : 0;
    return `<div class="ed-grid">
      <label>Id ${txt_("id", f.id, "", 130)}</label>
      <label class="ed-w">Sector ${txt_("name", f.name, "", 300)}</label>
      <label>Seats ${num_("seats", f.seats)}</label>
      <label class="ed-w">Franchise ${sel_("franchise", "franchise", f.franchise)}</label>
    </div>
    <div class="ed-grid">
      <label>Electorate ${num_("electorate", f.electorate, 100)}</label>
      <label class="ed-note">Per seat <b>${per.toLocaleString()}</b>
        <span class="ed-hint">a district averages ~130,000</span></label>
      <label class="ed-w">Licensing board ${txt_("board", f.board || "", "none — not a licensure seat", 260)}</label>
    </div>
    ${f.franchise === "licensure" ? `<div class="ed-warnbox">Franchise runs through licensure and the
      government appoints the board. Widening or narrowing the licence changes who votes here, by
      regulation, with no bill before Parliament.</div>` : ""}
    ${f.franchise === "corporate" ? `<div class="ed-warnbox">Companies vote, not employees. Whoever
      controls the company controls the seat, and subsidiaries can be incorporated to manufacture
      votes. If instances are persons, an entity can register instances as voters.</div>` : ""}
    ${f.franchise === "residual" ? `<div class="ed-warnbox">Everyone in no recognised sector.
      Enormous, powerless, and the line that makes the absurdity of the tier legible.</div>` : ""}
    <div class="rulehead">Held by <span class="ed-hint">must total ${f.seats} — currently ${total}${total === f.seats ? "" : " ⚠"}</span></div>
    <div class="ed-grid">${rows}</div>
    <div class="rulehead">Material interest <span class="ed-hint">comma separated tags</span></div>
    ${txt_("interest", (f.interest || []).join(", "), "", 520)}
    <div class="rulehead">Note</div>
    <textarea class="ed-f ed-body" data-f="note" rows="3">${esc(f.note || "")}</textarea>`;
  }

  /* ---------- constituency form ---------- */
  function conForm(k) {
    const st = M.stations.find(s => s.id === k.station);
    const sib = M.constituencies.filter(c => c.station === k.station);
    const sum = sib.reduce((n, c) => n + c.magnitude, 0);
    const totalSeats = M.constituencies.reduce((n, c) => n + c.magnitude, 0);
    const totalEl = M.constituencies.reduce((n, c) => n + c.electorate, 0);
    const ratio = totalEl ? ((k.magnitude / k.electorate) / (totalSeats / totalEl)) : 0;
    return `<div class="ed-grid">
      <label>Id ${txt_("id", k.id, "", 170)}<button class="btn ed-add" data-act="rename">rename…</button></label>
      <label class="ed-w">Name ${txt_("name", k.name, "", 300)}</label>
      <label>Station ${sel_("station", "stations", k.station)}</label>
      <label>Band ${sel_("band", "bands", k.band)}</label>
    </div>
    <div class="ed-grid">
      <label>Magnitude ${num_("magnitude", k.magnitude)}
        <span class="ed-hint">members returned</span></label>
      <label>Electorate ${num_("electorate", k.electorate, 90)}
        <span class="ed-hint">attested adults, not population</span></label>
      <label class="ed-note">Derived ratio <b>${ratio.toFixed(2)}</b>
        <span class="ed-hint">${ratio > 1 ? "over" : "under"}-represented</span></label>
    </div>
    ${st ? `<div class="${sum === st.seats ? "ed-arch" : "ed-warnbox"}">
      ${esc(st.name)}: <b>${sum}</b> seats across ${sib.length} constituencies` +
      (sum === st.seats ? ` — reconciles.` :
       ` but the station record says <b>${st.seats}</b>. These must match.`) + `</div>` : ""}
    <div class="rulehead">Material interest <span class="ed-hint">comma separated tags</span></div>
    ${txt_("material_interest", (k.material_interest || []).join(", "), "", 520)}
    <div class="rulehead">Sibling constituencies</div>
    <table><tbody>${sib.map(c =>
      `<tr${c.id === k.id ? ' class="here"' : ""}><td>${esc(c.name)}</td>` +
      `<td class="n">${c.magnitude}</td><td class="n">${c.electorate.toLocaleString()}</td></tr>`).join("")}</tbody></table>`;
  }

  /* =========================================================
     CONCORDANCE ARTICLE FORM
     ========================================================= */

  function cxForm(a) {
    const B = SCHEMA.vocab.banners, on = new Set(a.banners || []);
    return `<div class="ed-grid">
      <label>Id ${txt_("id", a.id, "", 150)}</label>
      <label class="ed-w">Title ${txt_("title", a.title, "", 320)}</label>
      <label>Category ${sel_("category", SCHEMA.vocab.cxCategories, a.category)}</label>
    </div>
    <div class="rulehead">Maintenance banners <span class="ed-hint">the banners are the characterisation</span></div>
    <div class="ed-grid">${B.map(b =>
      `<label class="ed-chk"><input type="checkbox" class="ed-f" data-f="ban_${b}" ${on.has(b) ? "checked" : ""}> ${b}</label>`).join("")}</div>
    <div class="rulehead">Edit record</div>
    <div class="ed-grid">
      <label class="ed-w">Last edited by ${txt_("ed_by", (a.edited && a.edited.by) || "", "multiple", 220)}</label>
      <label class="ed-chk"><input type="checkbox" class="ed-f" data-f="ed_att" ${!a.edited || a.edited.attested !== false ? "checked" : ""}> attested</label>
      <label class="ed-w">Note ${txt_("ed_note", (a.edited && a.edited.note) || "", "142 revisions this session", 260)}</label>
    </div>
    <div class="rulehead">Summary <span class="ed-hint">shown as the lede</span></div>
    <textarea class="ed-f ed-body" data-f="summary" rows="4">${esc(a.summary)}</textarea>
    <div class="rulehead">Sections <button class="btn ed-add" data-act="sec-add">+ section</button>
      <span class="ed-hint">links: [[id]] or [[id|text]]</span></div>
    <div id="ed-secs">${(a.sections || []).map((s, i) => `
      <div class="ed-choice" data-si="${i}">
        <div class="ed-choicehd">
          <span class="ed-cnum">${i + 1}</span>
          <input class="ed-f ed-label" data-f="h" type="text" value="${esc(s.h || "")}" placeholder="Heading (blank for none)">
          <button class="btn ed-x" data-act="sec-del" data-si="${i}">&times;</button>
        </div>
        <textarea class="ed-f ed-body" data-f="body" rows="6" style="border:none">${esc(s.body)}</textarea>
      </div>`).join("")}</div>
    <div class="rulehead">See also</div>
    <div id="ed-see">${(a.see || []).map((id, i) =>
      `<div class="ed-cond" data-si="${i}">${sel_("see", "cxArticles", id)}` +
      `<button class="btn ed-x" data-act="see-del" data-si="${i}">&times;</button></div>`).join("")}
      <button class="btn ed-add" data-act="see-add">+ see also</button></div>`;
  }

  /* =========================================================
     RENDER
     ========================================================= */

  const KIND = {
    events: { arr: "events", label: e => e.title, sub: e => e.prologue ? "P" + e.prologue : "w" + (e.weight || 50),
              form: eventForm, blank: () => ({ id: "new_event", title: "Untitled", weight: 50, body: "", choices: [{ label: "Continue", effects: [] }] }) },
    parties: { arr: "parties", label: p => p.name, sub: p => p.seats.district + p.seats.list + p.seats.functional + " seats",
              form: partyForm, blank: () => ({ id: "new", name: "New Party", short: "NEW", colour: "var(--p-gb)", loyalty: 50, seats: { district: 0, list: 0, functional: 0 }, axes: {}, note: "" }) },
    stations: { arr: "stations", label: s => s.name, sub: s => s.seats + " seats · " + s.band,
              form: stationForm, blank: () => ({ id: "new", name: "New Station", band: "middle", type: "single", seats: 1, population: 100000, closure: 0.5, suspended: 0, attested: 0.8, material_interest: [], dependency: "", grievance: "", party_leans: {} }) },
    characters: { arr: "characters", label: c => c.name, sub: c => c.role,
              form: characterForm, blank: () => ({ id: "new", name: "New Person", role: "", party: null, relationship: 50, note: "" }) },
    bills: { arr: "bills", label: b => b.title, sub: b => b.ref + " · " + b.stage,
              form: billForm, blank: () => ({ id: "new", ref: "HC 0/000", title: "New Bill", stage: "drafting", summary: "", dualMajority: false, axes: {}, stances: {}, onPass: [], onFail: [] }) },
    constituencies: { arr: "constituencies", label: k => k.name,
              sub: k => k.magnitude + (k.magnitude === 1 ? " seat · " : " seats · ") + k.station,
              form: conForm, blank: () => ({ id:"new_seat", name:"New Constituency",
                station:"anselm", band:"ring", magnitude:1, electorate:30000, material_interest:[] }) },
    functional: { arr: "functional", label: f => f.name,
              sub: f => f.seats + " seats · " + f.electorate.toLocaleString(),
              form: fcForm, blank: () => ({ id:"fc_new", name:"New Sector", seats:1,
                franchise:"licensure", electorate:1000, board:"", held:{}, interest:[], note:"" }) },
    images: { arr: "images", label: () => "", sub: () => "",
              form: imagesForm, blank: () => ({}) },
    concordance: { arr: "cxArticles", label: a => a.title, sub: a => a.category,
              form: cxForm, blank: () => ({ id: "new_article", title: "New Article",
                category: "Institutions", banners: [], edited: { by: "unattributed", attested: true, note: "" },
                summary: "", sections: [{ h: "", body: "" }], see: [] }) },
    glossary: { arr: "glossary", label: g => g.term, sub: g => g.cluster || (g.assumed ? "assumed" : "—"),
              form: glossForm, blank: () => ({ term: "new term", gloss: "", handle: "", cluster: "", introduced: null }) }
  };

  function idOf(kind, o) { return kind === "glossary" ? o.term : o.id; }
  function arrOf(kind) {
    if (kind === "concordance") return M.encyclopedia.articles;
    if (kind === "images") return [];
    return M[KIND[kind].arr];
  }

  function draw() {
    document.querySelectorAll(".tab").forEach(t =>
      t.setAttribute("aria-selected", t.dataset.t === sel.tab ? "true" : "false"));
    document.getElementById("ed-graphwrap").style.display = sel.tab === "graph" ? "" : "none";
    document.getElementById("ed-main").style.display = sel.tab === "graph" ? "none" : "";
    if (sel.tab === "graph") { drawGraph(); drawStatus(); return; }

    const K = KIND[sel.tab], arr = arrOf(sel.tab);
    if (sel.tab === "images") {
      document.getElementById("ed-list").innerHTML =
        `<div class="ed-item"><b>Image processor</b></div>`;
      document.getElementById("ed-count").textContent = "";
      document.getElementById("ed-form").innerHTML = imagesForm();
      if (IMG.canvas) document.getElementById("ed-imgprev").appendChild(IMG.canvas);
      drawStatus();
      return;
    }
    if (!arr.some(o => idOf(sel.tab, o) === sel.id)) sel.id = arr.length ? idOf(sel.tab, arr[0]) : null;

    const q = (document.getElementById("ed-filter").value || "").toLowerCase();
    const shown = q ? arr.filter(o => {
      const id = idOf(sel.tab, o);
      return (id + " " + K.label(o) + " " + K.sub(o) + " " +
              JSON.stringify(o)).toLowerCase().includes(q);
    }) : arr;
    document.getElementById("ed-list").innerHTML = shown.map(o => {
      const id = idOf(sel.tab, o);
      return `<div class="ed-item${id === sel.id ? " on" : ""}" data-id="${esc(id)}">
        <b>${esc(K.label(o))}</b><span>${esc(K.sub(o))}</span></div>`;
    }).join("") + (q && !shown.length ? `<div class="ed-item"><b>no matches</b></div>` : "");
    document.getElementById("ed-count").textContent =
      q ? shown.length + " of " + arr.length : arr.length + "";

    const cur = arr.find(o => idOf(sel.tab, o) === sel.id);
    document.getElementById("ed-form").innerHTML = cur ? K.form(cur) : `<div class="note">Nothing selected.</div>`;
    document.getElementById("ed-flags").innerHTML = allFlags().map(f => `<option value="${esc(f)}">`).join("");
    if (sel.tab === "bills") forecast();
    drawStatus();
  }

  function commit() {
    if (sel.tab === "graph") return;
    const K = KIND[sel.tab], arr = arrOf(sel.tab);
    const i = arr.findIndex(o => idOf(sel.tab, o) === sel.id);
    if (i < 0) return;
    const g = f => document.querySelector(`#ed-form [data-f="${f}"]`);
    if (!g("id") && !g("term")) return;

    if (sel.tab === "events") { arr[i] = readEvent(); sel.id = arr[i].id; }
    else if (sel.tab === "parties") {
      const p = arr[i];
      p.id = g("id").value.trim(); p.name = g("name").value; p.short = g("short").value;
      p.colour = g("colour").value; p.loyalty = +g("loyalty").value; p.note = g("note").value;
      const lg = g("logo").value.trim(); if (lg) p.logo = lg; else delete p.logo;
      const al = g("aliases").value.split(",").map(s => s.trim()).filter(Boolean);
      if (al.length) p.aliases = al; else delete p.aliases;
      p.seats = { district: +g("district").value, list: +g("list").value, functional: +g("functional").value };
      p.axes = {}; Object.keys(SCHEMA.vocab.axes).forEach(k => p.axes[k] = g("ax_" + k).value || null);
      sel.id = p.id;
    }
    else if (sel.tab === "stations") {
      const s = arr[i];
      ["id","name","band","type","form","dependency","grievance"].forEach(k => s[k] = g(k).value);
      const ar = g("archetype").value; if (ar) s.archetype = ar; else delete s.archetype;
      ["seats","population","suspended"].forEach(k => s[k] = +g(k).value);
      ["closure","attested"].forEach(k => s[k] = +g(k).value);
      const st = g("settlements").value; if (st !== "") s.settlements = +st; else delete s.settlements;
      s.material_interest = g("material_interest").value.split(",").map(x => x.trim()).filter(Boolean);
      s.composition = {};
      ["biological","emulation","uplift","synthetic"].forEach(k => s.composition[k] = +g("comp_" + k).value);
      sel.id = s.id;
    }
    else if (sel.tab === "characters") {
      const c = arr[i];
      ["id","name","role","seat","note"].forEach(k => c[k] = g(k).value);
      c.party = g("party").value || null; c.relationship = +g("relationship").value;
      const po = g("portrait").value.trim(); if (po) c.portrait = po; else delete c.portrait;
      const of = g("office").value; if (of) c.office = of; else delete c.office;
      const fn = g("functional").value; if (fn) c.functional = fn; else delete c.functional;
      if (!c.seat) delete c.seat;
      sel.id = c.id;
    }
    else if (sel.tab === "bills") {
      const b = arr[i];
      ["id","ref","title","stage","summary"].forEach(k => b[k] = g(k).value);
      b.dualMajority = g("dualMajority").checked;
      b.owner = g("owner").value || null;
      if (g("priority").checked) b.priority = true; else delete b.priority;
      const en = g("effectNote").value; if (en) b.effectNote = en; else delete b.effectNote;
      b.stances = readStances();
      sel.id = b.id;
    }
    else if (sel.tab === "constituencies") {
      const k = arr[i];
      ["id","name","station","band"].forEach(f => k[f] = g(f).value);
      k.magnitude = +g("magnitude").value; k.electorate = +g("electorate").value;
      k.material_interest = g("material_interest").value.split(",").map(x => x.trim()).filter(Boolean);
      sel.id = k.id;
    }
    else if (sel.tab === "functional") {
      const f = arr[i];
      ["id","name","franchise","board","note"].forEach(k => f[k] = g(k).value);
      f.seats = +g("seats").value; f.electorate = +g("electorate").value;
      if (!f.board) f.board = null;
      f.held = {};
      M.parties.forEach(p => {
        const n = g("held_" + p.id); if (n && +n.value > 0) f.held[p.id] = +n.value;
      });
      f.interest = g("interest").value.split(",").map(x => x.trim()).filter(Boolean);
      sel.id = f.id;
    }
    else if (sel.tab === "concordance") {
      const a = arr[i];
      a.id = g("id").value.trim(); a.title = g("title").value; a.category = g("category").value;
      a.banners = SCHEMA.vocab.banners.filter(b => g("ban_" + b).checked);
      if (!a.banners.length) delete a.banners;
      a.edited = { by: g("ed_by").value || "unattributed", attested: g("ed_att").checked };
      if (g("ed_note").value) a.edited.note = g("ed_note").value;
      a.summary = g("summary").value;
      a.sections = [...document.querySelectorAll("#ed-secs .ed-choice")].map(n => {
        const o = { h: n.querySelector('[data-f="h"]').value, body: n.querySelector('[data-f="body"]').value };
        if (!o.h) delete o.h;
        return o;
      });
      a.see = [...document.querySelectorAll('#ed-see [data-f="see"]')].map(n => n.value);
      if (!a.see.length) delete a.see;
      sel.id = a.id;
    }
    else if (sel.tab === "glossary") {
      const t = arr[i];
      t.term = g("term").value; t.gloss = g("gloss").value; t.handle = g("handle").value;
      const cl = g("cluster").value.trim(); if (cl) t.cluster = cl; else delete t.cluster;
      t.introduced = g("introduced").value || null;
      if (g("assumed").checked) t.assumed = true; else delete t.assumed;
      sel.id = t.term;
    }
  }

  /* ---------- live division forecast while editing a bill ---------- */
  function forecast() {
    const b = M.bills.find(x => x.id === sel.id); if (!b) return;
    const tmp = clone(b); tmp.stances = readStances(); tmp.dualMajority = !!document.querySelector('[data-f="dualMajority"]')?.checked;
    const C = fakeContent(); C.billById[tmp.id] = tmp;
    const st = Engine.newGame(C);
    let d; try { d = Engine.division(st, C, tmp.id); } catch (e) { return; }
    document.getElementById("ed-forecast").innerHTML =
      `<div class="rulehead">Forecast</div>` +
      bar("Elected", d.popular) + (tmp.dualMajority ? bar("Functional", d.functional) : "") +
      `<div class="note">${d.carries ? "<b>Carries.</b>" :
        (tmp.dualMajority && d.popular.carries && !d.functional.carries
          ? "<b>Carries on the elected benches and fails on the functional.</b>" : "<b>Fails.</b>")}</div>`;
  }
  function bar(label, r) {
    return `<div class="dm"><b>${label}</b><div class="dmbar">` +
      `<i class="yes" style="width:${Math.min(100, r.aye / r.total * 100)}%;background:${r.carries ? "var(--ok)" : "var(--alert)"}"></i>` +
      `<span class="thr" style="left:${r.need / r.total * 100}%"></span>` +
      `<span class="lbl">${r.aye} / ${r.total} · need ${r.need}</span></div></div>`;
  }

  function fakeContent() {
    const C = { setup: SETUP, parties: M.parties, currents: M.currents, stations: M.stations,
                characters: M.characters, bills: M.bills, events: M.events, glossary: M.glossary };
    const idx = a => a.reduce((m, o) => (m[o.id] = o, m), {});
    C.partyById = idx(M.parties); C.currentById = idx(M.currents); C.stationById = idx(M.stations);
    C.characterById = idx(M.characters); C.billById = idx(M.bills); C.eventById = idx(M.events);
    return C;
  }



  function pickImage() {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/*";
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      const img = new Image();
      img.onload = () => {
        IMG.src = img;
        if (!IMG.name) IMG.name = f.name.replace(/\.[^.]+$/, "") + ".png";
        reprocess();
      };
      img.src = URL.createObjectURL(f);
    };
    inp.click();
  }
  function reprocess() {
    if (!IMG.src) { draw(); return; }
    IMG.canvas = processImage(IMG.src, IMG.kind, IMG.palette, IMG.dither);
    IMG.canvas.className = "dith";
    draw();
  }
  function saveImage() {
    if (!IMG.canvas) return;
    const name = IMG.name || "image.png";
    IMG.canvas.toBlob(b => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b); a.download = name; a.click();
      alert("Saved " + name + " to your downloads.\n\nMove it into " +
            IMG_KINDS[IMG.kind].dir + "/ and reference it by filename.");
    });
  }

  /* =========================================================
     NAME ROLLING
     ========================================================= */

  function rollName(entity) {
    if (typeof Names === "undefined") { alert("content/names.js is not loaded."); return; }
    snapshot("roll name");
    if (sel.tab === "characters") {
      const earth = confirm("Earth-born?\n\nOK for an unblended family name — which everyone notices.\nCancel for an orbital-born blend.");
      entity.name = Names.person({ earthborn: earth }) + " MP";
    } else if (sel.tab === "stations") {
      entity.name = Names.station();
    } else if (sel.tab === "bills") {
      entity.title = Names.bill();
    } else if (sel.tab === "parties") {
      entity.name = Names.roll("consortium");
    }
    touch(); draw();
  }

  /* =========================================================
     RENAME
     Ids are referenced from a dozen places and most of them fail
     silently when one changes. So renaming finds every reference,
     shows the count, and rewrites them together.
     ========================================================= */

  function doRename(entity) {
    const kind = sel.tab;
    const from = idOf(kind, entity);
    const hits = Refs.find(M, kind, from);
    const soft = Refs.loose(M, kind, from);
    const preview = hits.length
      ? hits.slice(0, 14).map(h => "  · " + h.where).join("\n") +
        (hits.length > 14 ? `\n  · …and ${hits.length - 14} more` : "")
      : "  (no references anywhere)";
    const softNote = soft.length
      ? `\n\nNOT changed — these merely share the name:\n` +
        soft.slice(0, 6).map(s => "  · " + s).join("\n")
      : "";
    const to = prompt(
      `Rename "${from}" to what?\n\n` +
      `${hits.length} reference${hits.length === 1 ? "" : "s"} will be updated:\n${preview}${softNote}`,
      from);
    if (!to || to === from) return;
    const clean = to.trim();
    if (!/^[a-z0-9_]+$/.test(clean) && kind !== "glossary") {
      alert("Ids should be lowercase letters, numbers and underscores.");
      return;
    }
    const taken = arrOf(kind).some(o => o !== entity && idOf(kind, o) === clean);
    if (taken) { alert(`"${clean}" is already taken.`); return; }
    snapshot("rename");
    const n = Refs.rename(M, kind, from, clean, entity);
    sel.id = clean;
    touch(); draw();
    setTimeout(() => alert(`Renamed. ${n} reference${n === 1 ? "" : "s"} updated.`), 20);
  }

  /* =========================================================
     ARCHETYPE ROLL
     The numbers in an archetype are correlated: a low-closure
     industrial can has a high suspended count and low attestation
     because those are one fact seen three ways. Rolling them
     independently produces places that do not make sense, so the
     archetype rolls them together.
     ========================================================= */

  const rnd = (a, b) => a + Math.random() * (b - a);
  const rndInt = (a, b) => Math.round(rnd(a, b));
  const round = (n, dp) => Math.round(n * 10 ** dp) / 10 ** dp;

  function rollStation(arch, into) {
    const A = (typeof ARCHETYPES !== "undefined" ? ARCHETYPES : []).find(x => x.id === arch);
    if (!A) return;
    const pop = rndInt(A.pop[0], A.pop[1]);
    into.band = A.band; into.form = A.form; into.type = A.type;
    into.population = Math.round(pop / 1000) * 1000;
    into.closure = round(rnd(A.closure[0], A.closure[1]), 2);
    into.suspended = Math.round(pop / 10000 * rnd(A.suspPer10k[0], A.suspPer10k[1]) / 10) * 10;
    into.attested = round(rnd(A.att[0], A.att[1]), 3);
    into.seats = Math.max(1, Math.round(pop / A.seatsPer));
    if (A.settlements) into.settlements = rndInt(A.settlements[0], A.settlements[1]);
    else delete into.settlements;
    into.material_interest = A.interest.slice();
    if (A.composition) {
      const c = {}, r = (a, b2) => Math.round(rnd(a, b2) * 100) / 100;
      c.biological = r(A.composition[0], A.composition[1]);
      c.uplift = 0.04; c.synthetic = Math.round((1 - c.biological) * 0.13 * 100) / 100;
      c.emulation = Math.round((1 - c.biological - c.uplift - c.synthetic) * 100) / 100;
      into.composition = c;
    }
    if (!into.dependency || into.dependency === "") into.dependency = A.dependency;
    if (!into.grievance || into.grievance === "") into.grievance = A.grievance;
    into.archetype = arch;
  }

  /* =========================================================
     LOGO MAKER
     Palette-reduces an image in the browser using the same
     palettes as tools/dither.sh, then downloads it. Drop the
     result in img/logos/. Works for party emblems, and for
     mastheads and anything else that later needs one.
     ========================================================= */

  const PALETTE_HEX = {
    registry:  ["#12150f","#3f4a37","#6e7167","#93a184","#c8c9c0","#f2f2ec"],
    newsprint: ["#191712","#4e4838","#8a3222","#b7ae95","#cfc9b8","#f6f3e9"],
    broadcast: ["#0f1014","#2b2f3a","#5f4a52","#8c6a45","#a8452e","#c9a227","#93a184","#e4e5de"],
    deck:      ["#14180f","#2f3f22","#5d7350","#8aa06a","#c2c48f","#efeee0"]
  };
  const rgb = h => [1,3,5].map(i => parseInt(h.substr(i,2),16));

  /* Bayer 4x4 — an ordered dither reads as machine output, which is
     right for an emblem printed by a state press. */
  const BAYER = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];

  /* Output kinds. Each pins an aspect and a width because the CSS pins them
     too — an image that arrives the wrong shape gets cropped again in the
     browser and you lose control of the framing. */
  const IMG_KINDS = {
    portrait: { dir:"img/portraits", w:160, aspect:[4,5],  pal:"registry",  dither:"ordered",
                label:"Portrait", note:"registry palette, 4:5. Below ~120px wide, faces turn to noise." },
    plate:    { dir:"img/events",    w:640, aspect:[12,5], pal:"newsprint", dither:"diffusion",
                label:"Event plate", note:"12:5 band. A 12:5 crop from a 16:9 source loses about a quarter of its height." },
    logo:     { dir:"img/logos",     w:64,  aspect:[1,1],  pal:"registry",  dither:"ordered",
                label:"Logo / mark", note:"Square. Renders at 11px in game, so keep the shape simple." }
  };

  /* Ordered dither reads as machine output — right for a registry scan or a
     state-press emblem. Error diffusion reads as photographic. */
  function ditherToPalette(cv, cols, mode) {
    const cx = cv.getContext("2d"), W = cv.width, H = cv.height;
    const d = cx.getImageData(0, 0, W, H), px = d.data;
    const near = (r, g, b) => {
      let best = 0, bd = 1e9;
      for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        const dd = (c[0]-r)**2 + (c[1]-g)**2 + (c[2]-b)**2;
        if (dd < bd) { bd = dd; best = i; }
      }
      return cols[best];
    };
    if (mode === "ordered") {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4, bias = (BAYER[y & 3][x & 3] / 16 - 0.5) * 42;
        const c = near(px[i] + bias, px[i+1] + bias, px[i+2] + bias);
        px[i] = c[0]; px[i+1] = c[1]; px[i+2] = c[2];
      }
    } else {
      const buf = new Float32Array(W * H * 3);
      for (let i = 0, j = 0; i < px.length; i += 4, j += 3) {
        buf[j] = px[i]; buf[j+1] = px[i+1]; buf[j+2] = px[i+2];
      }
      const push = (x, y, er, eg, eb, f) => {
        if (x < 0 || x >= W || y >= H) return;
        const j = (y * W + x) * 3;
        buf[j] += er * f; buf[j+1] += eg * f; buf[j+2] += eb * f;
      };
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const j = (y * W + x) * 3;
        const c = near(buf[j], buf[j+1], buf[j+2]);
        const er = buf[j] - c[0], eg = buf[j+1] - c[1], eb = buf[j+2] - c[2];
        const i = (y * W + x) * 4;
        px[i] = c[0]; px[i+1] = c[1]; px[i+2] = c[2];
        push(x+1, y,   er, eg, eb, 7/16); push(x-1, y+1, er, eg, eb, 3/16);
        push(x,   y+1, er, eg, eb, 5/16); push(x+1, y+1, er, eg, eb, 1/16);
      }
    }
    cx.putImageData(d, 0, 0);
  }

  /* Fill-crop to the target box, never letterbox and never squash. */
  function processImage(img, kind, palette, dither) {
    const K = IMG_KINDS[kind];
    const W = K.w, H = Math.round(K.w * K.aspect[1] / K.aspect[0]);
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const cx = cv.getContext("2d");
    cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = "high";
    const scale = Math.max(W / img.width, H / img.height);
    const dw = img.width * scale, dh = img.height * scale;
    cx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    /* slight desaturation before quantising, as the CLI pipeline does */
    const d0 = cx.getImageData(0, 0, W, H), p0 = d0.data;
    for (let i = 0; i < p0.length; i += 4) {
      const g = (p0[i] * 0.299 + p0[i+1] * 0.587 + p0[i+2] * 0.114);
      p0[i] = p0[i] * 0.88 + g * 0.12;
      p0[i+1] = p0[i+1] * 0.88 + g * 0.12;
      p0[i+2] = p0[i+2] * 0.88 + g * 0.12;
    }
    cx.putImageData(d0, 0, 0);
    ditherToPalette(cv, (PALETTE_HEX[palette] || PALETTE_HEX.registry).map(rgb), dither);
    return cv;
  }

  /* The Images tab keeps its own scratch state. */
  const IMG = { kind:"portrait", palette:"registry", dither:"ordered", src:null, name:"", canvas:null };

  function makeLogo(party) {
    sel.tab = "images"; sel.id = null;
    IMG.kind = "logo"; IMG.palette = "registry"; IMG.dither = "ordered";
    IMG.name = (party.id || "logo") + ".png";
    draw();
  }

  function imagesForm() {
    const K = IMG_KINDS[IMG.kind];
    const H = Math.round(K.w * K.aspect[1] / K.aspect[0]);
    return `<div class="ed-grid ed-arch">
      <label>Kind <select class="ed-f" data-f="img_kind">${Object.keys(IMG_KINDS).map(k =>
        `<option value="${k}"${k === IMG.kind ? " selected" : ""}>${IMG_KINDS[k].label}</option>`).join("")}</select></label>
      <label>Palette <select class="ed-f" data-f="img_pal">${Object.keys(PALETTE_HEX).map(p =>
        `<option value="${p}"${p === IMG.palette ? " selected" : ""}>${p}</option>`).join("")}</select></label>
      <label>Dither <select class="ed-f" data-f="img_dither">
        <option value="ordered"${IMG.dither === "ordered" ? " selected" : ""}>ordered — reads as machine output</option>
        <option value="diffusion"${IMG.dither === "diffusion" ? " selected" : ""}>diffusion — reads as photographic</option>
      </select></label>
      <button class="btn" data-act="img-pick">Choose image…</button>
      <span class="ed-hint">${K.w}&times;${H} &middot; ${K.aspect[0]}:${K.aspect[1]} &middot; ${K.dir}/</span>
    </div>
    <div class="ed-warnbox">${esc(K.note)}</div>
    <div class="ed-grid">
      <label class="ed-w">Filename ${txt_("img_name", IMG.name, "name.png", 240)}</label>
      <button class="btn" data-act="img-save"${IMG.canvas ? "" : " disabled"}>Download PNG</button>
      <span class="ed-hint">then move it into <b>${K.dir}/</b></span>
    </div>
    <div class="rulehead">Preview</div>
    <div class="imgprev" id="ed-imgprev">${IMG.canvas
      ? "" : `<div class="note">Choose an image to see it in the palette.</div>`}</div>
    <div class="rulehead">Palette</div>
    <div class="palrow">${(PALETTE_HEX[IMG.palette] || []).map(h =>
      `<i style="background:${h}" title="${h}"></i>`).join("")}</div>
    <div class="note" style="margin-top:6px">
      Palettes live in <b>tools/palettes/</b>. Edit one and re-run the batch and every image in the
      game restyles at once — which is the main reason to do this rather than ship photographs.
    </div>`;
  }

  /* =========================================================
     BRANCH GRAPH — how events reach one another
     ========================================================= */

  function graphEdges() {
    const setters = {}, E = [];
    M.events.forEach(e => (e.choices || []).forEach(c =>
      [].concat(c.effects || []).forEach(eff => {
        [].concat(eff.flag || []).forEach(f => (setters[f] ||= []).push(e.id));
      })));
    M.events.forEach(e => (e.choices || []).forEach((c, ci) =>
      [].concat(c.effects || []).forEach(eff => {
        if (eff.queue) [].concat(eff.queue).forEach(q =>
          E.push({ from: e.id, to: q.event, kind: "queue", label: "choice " + (ci + 1) + " · +" + (q.after || 1) }));
        if (eff.chapter != null) M.events
          .filter(t => t.chapter === eff.chapter && t.prologue === 1)
          .forEach(t => E.push({ from: e.id, to: t.id, kind: "chapter", label: "chapter " + eff.chapter }));
      })));
    M.events.forEach(e => {
      (e.when?.flags || []).forEach(f => (setters[f] || []).forEach(src =>
        E.push({ from: src, to: e.id, kind: "unlock", label: f })));
      (e.when?.flagsAbsent || []).forEach(f => (setters[f] || []).forEach(src =>
        E.push({ from: src, to: e.id, kind: "block", label: f })));
    });
    return E;
  }

  function drawGraph() {
    const E = graphEdges();
    const order = [...M.events].sort((a, b) =>
      ((a.chapter == null ? 1 : a.chapter) - (b.chapter == null ? 1 : b.chapter)) ||
      (a.prologue || 99) - (b.prologue || 99) || (b.weight || 0) - (a.weight || 0));
    const pos = {}, W = 940, colW = 300, rowH = 46;
    order.forEach((e, i) => {
      const col = e.prologue ? 0 : (e.queuedOnly ? 2 : 1);
      pos[e.id] = { col, e };
    });
    const byCol = [[], [], []];
    order.forEach(e => byCol[pos[e.id].col].push(e.id));
    byCol.forEach((ids, c) => ids.forEach((id, r) => {
      pos[id].x = 24 + c * colW; pos[id].y = 46 + r * rowH;
    }));
    const H = Math.max(...Object.values(pos).map(p => p.y)) + 60;

    const edges = E.filter(x => pos[x.from] && pos[x.to]).map(x => {
      const a = pos[x.from], b = pos[x.to];
      const ax = a.x + 250, ay = a.y + 14, bx = b.x, by = b.y + 14;
      const mid = (ax + bx) / 2;
      const col = x.kind === "queue" ? "#8a3222" : x.kind === "unlock" ? "#3d5c33"
                : x.kind === "chapter" ? "#2b4a7a" : "#9a9c92";
      const dash = x.kind === "block" ? ' stroke-dasharray="3 3"' : "";
      const wid = x.kind === "chapter" ? 2.2 : 1.2;
      return `<path d="M${ax} ${ay} C${mid} ${ay}, ${mid} ${by}, ${bx} ${by}" fill="none" stroke="${col}" stroke-width="${wid}"${dash}/>` +
             `<circle cx="${bx}" cy="${by}" r="2.4" fill="${col}"/>`;
    }).join("");

    const nodes = order.map(e => {
      const p = pos[e.id];
      const tag = "ch" + (e.chapter == null ? 1 : e.chapter) + " " +
                  (e.prologue ? "P" + e.prologue : e.queuedOnly ? "Q" : "w" + (e.weight || 50));
      return `<g class="ed-node" data-id="${esc(e.id)}">
        <rect x="${p.x}" y="${p.y}" width="250" height="28" fill="var(--field)" stroke="var(--rule)"/>
        <text x="${p.x + 6}" y="${p.y + 18}" style="font:11px var(--f-ui);fill:var(--ink)">${esc(e.title.slice(0, 34))}</text>
        <text x="${p.x + 244}" y="${p.y + 18}" text-anchor="end" style="font:9px var(--f-data);fill:var(--ink-soft)">${tag}</text>
      </g>`;
    }).join("");

    document.getElementById("ed-graph").innerHTML =
      `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto">
        <text x="24" y="22" style="font:9px var(--f-ui);letter-spacing:.12em;fill:var(--ink-soft)">PROLOGUE</text>
        <text x="324" y="22" style="font:9px var(--f-ui);letter-spacing:.12em;fill:var(--ink-soft)">WEIGHTED POOL</text>
        <text x="624" y="22" style="font:9px var(--f-ui);letter-spacing:.12em;fill:var(--ink-soft)">QUEUED ONLY</text>
        ${edges}${nodes}</svg>`;
    document.querySelectorAll(".ed-node").forEach(n => n.addEventListener("click", () => {
      sel.tab = "events"; sel.id = n.dataset.id; draw();
    }));
  }

  /* =========================================================
     VALIDATION — the linter, inline
     ========================================================= */

  function validate() {
    const P = [];
    const ids = M.events.map(e => e.id);
    ids.forEach((id, i) => { if (ids.indexOf(id) !== i) P.push(["dup", "duplicate event id: " + id]); });
    M.events.forEach(e => {
      if (!e.choices || !e.choices.length) P.push(["err", e.id + ": no choices"]);
      if (!e.body || e.body.length < 40) P.push(["warn", e.id + ": body is very short"]);
      (e.choices || []).forEach((c, i) => {
        [].concat(c.effects || []).forEach(eff => {
          const v = Object.keys(eff)[0];
          if (!SCHEMA.effects[v]) P.push(["err", e.id + " choice " + (i + 1) + ": unknown verb " + v]);
          if (eff.queue) [].concat(eff.queue).forEach(q => {
            if (!ids.includes(q.event)) P.push(["err", e.id + ": queues missing event " + q.event]);
            const t = M.events.find(x => x.id === q.event);
            if (t && !t.queuedOnly) P.push(["warn", q.event + " is queued but not marked queuedOnly"]);
          });
        });
      });
      Object.keys(e.when || {}).forEach(k => {
        if (!SCHEMA.conditions[k]) P.push(["err", e.id + ": unknown condition " + k]);
      });
    });
    /* one concept cluster per event */
    const byEvent = {};
    M.glossary.forEach(g => { if (g.introduced) (byEvent[g.introduced] ||= new Set()).add(g.cluster || g.term); });
    Object.keys(byEvent).forEach(id => {
      if (byEvent[id].size > 1) P.push(["warn", id + ": introduces " + byEvent[id].size + " concept clusters"]);
    });
    M.glossary.forEach(g => {
      if (!g.assumed && !g.introduced) P.push(["warn", "glossary '" + g.term + "': no introducing event"]);
    });
    /* is every chapter reachable, and does every chapter have an opening? */
    const declared = new Set([1]);
    M.events.forEach(e => { if (e.chapter != null) declared.add(e.chapter); });
    const reached = new Set([1]);
    M.events.forEach(e => (e.choices || []).forEach(c =>
      [].concat(c.effects || []).forEach(f => { if (f.chapter != null) reached.add(f.chapter); })));
    [...declared].forEach(ch => {
      if (!reached.has(ch)) P.push(["err", "chapter " + ch + " has events but nothing advances to it"]);
      const opens = M.events.filter(e => (e.chapter == null ? 1 : e.chapter) === ch && e.prologue);
      const pool = M.events.filter(e => (e.chapter == null ? 1 : e.chapter) === ch && !e.prologue && !e.queuedOnly);
      if (!opens.length && !pool.length) P.push(["warn", "chapter " + ch + ": no openable events"]);
    });
    P.push(["info", "chapters: " + [...declared].sort((a,b)=>a-b).join(", ")]);

    /* the district tier must equal the sum of constituency magnitudes */
    if (M.constituencies && M.constituencies.length) {
      const cons = M.constituencies.reduce((n, c) => n + c.magnitude, 0);
      const dist = M.parties.reduce((n, p) => n + p.seats.district, 0);
      if (cons !== dist)
        P.push(["err", "district tier: " + cons + " constituency seats vs " + dist + " party seats"]);
      M.stations.forEach(s => {
        const m = M.constituencies.filter(c => c.station === s.id).reduce((n, c) => n + c.magnitude, 0);
        if (m !== s.seats)
          P.push(["err", s.id + ": station says " + s.seats + " seats, constituencies say " + m]);
      });
      P.push(["info", M.constituencies.length + " constituencies returning " + cons + " members"]);
    }

    /* functional seats must reconcile between parties.js and functional.js */
    if (M.functional && M.functional.length) {
      const held = {};
      M.functional.forEach(f => Object.keys(f.held || {}).forEach(p => held[p] = (held[p] || 0) + f.held[p]));
      M.functional.forEach(f => {
        const t = Object.values(f.held || {}).reduce((a, b) => a + b, 0);
        if (t !== f.seats) P.push(["err", f.id + ": " + f.seats + " seats but " + t + " allocated"]);
      });
      M.parties.forEach(p => {
        const a = p.seats.functional, b = held[p.id] || 0;
        if (a !== b) P.push(["err", p.id + ": parties says " + a + " functional, sectors say " + b]);
      });
      const fs = M.functional.reduce((n, f) => n + f.seats, 0);
      const pf = M.parties.reduce((n, p) => n + p.seats.functional, 0);
      if (fs !== pf) P.push(["err", "functional tier: " + fs + " sector seats vs " + pf + " party seats"]);
    }

    const seats = M.parties.reduce((n, p) => n + p.seats.district + p.seats.list + p.seats.functional, 0);
    const dist = M.parties.reduce((n, p) => n + p.seats.district, 0);
    const list = M.parties.reduce((n, p) => n + p.seats.list, 0);
    const func = M.parties.reduce((n, p) => n + p.seats.functional, 0);
    P.push(["info", `chamber ${seats} — ${dist} district, ${list} list, ${func} functional · majority ${Math.floor(seats / 2) + 1}`]);
    return P;
  }

  function drawCoverage() {
    const box = document.getElementById("ed-coverage");
    if (!box || typeof Coverage === "undefined") return;
    const C2 = fakeContent();
    let st2 = null; try { st2 = Engine.newGame(C2); } catch (e) {}
    const F = Coverage.analyse(M, Engine, C2, st2);
    const v = Coverage.verdict(M, F);
    box.innerHTML =
      `<div class="cv-verdict"><b>${esc(v.state)}</b>${esc(v.line)}</div>` +
      (F.length
        ? F.map(f => `<div class="cv cv-s${f.sev}">
             <b>${esc(f.title)}</b>
             <p>${esc(f.detail)}</p>
             <em>&rarr; ${esc(f.action)}</em></div>`).join("")
        : `<div class="cv cv-s4"><b>Nothing outstanding</b><p>Write more events.</p></div>`);
  }

  function drawStatus() {
    drawCoverage();
    const P = validate();
    const errs = P.filter(p => p[0] === "err").length, warns = P.filter(p => p[0] === "warn").length;
    document.getElementById("ed-status").innerHTML =
      P.map(([k, t]) => `<div class="ed-p ed-${k}">${esc(t)}</div>`).join("");
    document.getElementById("sb-valid").textContent =
      errs ? errs + " ERRORS" : warns ? warns + " WARNINGS" : "VALID";
    document.getElementById("sb-valid").style.color = errs ? "var(--alert)" : "";
    document.getElementById("sb-counts").textContent =
      `${M.events.length} EVENTS · ${M.parties.length} PARTIES · ${M.stations.length} STATIONS · ${M.bills.length} BILLS`;
  }


  /* =========================================================
     DRAFTS — the editor holds everything in memory, so a closed
     tab used to lose the session. A draft is written on every
     change and restored on open. It is NOT a substitute for
     exporting: only exported files reach the game.
     ========================================================= */

  const DRAFT_KEY = "orbital.editor.draft.v1";
  let dirty = false, draftTimer = null;

  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ at: Date.now(), model: M }));
      stampDraft("draft saved " + new Date().toLocaleTimeString());
    } catch (e) { stampDraft("draft unavailable in this browser"); }
  }
  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY); if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }
  function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }
  function stampDraft(t) {
    const n = document.getElementById("ed-file"); if (n) n.textContent = t;
  }
  function touch() {
    dirty = true;
    document.getElementById("sb-dirty").textContent = "UNEXPORTED CHANGES";
    document.getElementById("sb-dirty").style.color = "var(--alert)";
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => { commit(); saveDraft(); }, 900);
  }

  /* =========================================================
     EXPORT
     ========================================================= */

  function download(name, text) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
    a.download = name; a.click();
  }
  function exportAll() {
    commit();
    dirty = false;
    document.getElementById("sb-dirty").textContent = "EXPORTED";
    document.getElementById("sb-dirty").style.color = "";
    download("events.js", Serialise.file("events", M.events));
    setTimeout(() => download("parties.js", Serialise.partiesFile(M.parties, M.currents)), 120);
    setTimeout(() => download("stations.js", Serialise.file("stations", M.stations)), 240);
    setTimeout(() => download("characters.js", Serialise.file("characters", M.characters)), 360);
    setTimeout(() => download("bills.js", Serialise.file("bills", M.bills)), 480);
    setTimeout(() => download("glossary.js", Serialise.file("glossary", M.glossary)), 600);
    setTimeout(() => download("encyclopedia.js", Serialise.encyclopediaFile(M.encyclopedia)), 720);
    setTimeout(() => download("functional.js", Serialise.file("functional", M.functional)), 840);
    setTimeout(() => download("constituencies.js", Serialise.file("constituencies", M.constituencies)), 960);
  }
  function exportOne() {
    commit();
    if (sel.tab === "parties") download("parties.js", Serialise.partiesFile(M.parties, M.currents));
    else if (sel.tab === "concordance") download("encyclopedia.js", Serialise.encyclopediaFile(M.encyclopedia));
    else if (KIND[sel.tab]) download(sel.tab + ".js", Serialise.file(sel.tab, M[KIND[sel.tab].arr]));
  }
  function preview() {
    commit();
    const kind = sel.tab === "graph" ? "events" : sel.tab;
    const text = kind === "parties" ? Serialise.partiesFile(M.parties, M.currents)
               : kind === "concordance" ? Serialise.encyclopediaFile(M.encyclopedia)
               : Serialise.file(kind, M[KIND[kind].arr]);
    document.getElementById("ed-preview").textContent = text;
    document.getElementById("ed-previewwrap").style.display = "";
  }

  /* =========================================================
     WIRING
     ========================================================= */

  function boot() {
    load();
    const d = loadDraft();
    if (d && d.model) {
      const when = new Date(d.at).toLocaleString();
      if (confirm("A draft from " + when + " was found.\n\nRestore it?\n\n" +
                  "Cancel loads the content files on disk instead.")) {
        M = d.model;
        stampDraft("restored draft from " + when);
      } else { clearDraft(); }
    }
    window.addEventListener("beforeunload", e => {
      if (!dirty) return;
      e.preventDefault(); e.returnValue = "";
    });
    document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
      commit(); sel.tab = t.dataset.t; sel.id = null; draw();
    }));
    document.getElementById("ed-list").addEventListener("click", e => {
      const it = e.target.closest(".ed-item"); if (!it) return;
      commit(); sel.id = it.dataset.id; draw();
    });
    document.getElementById("ed-form").addEventListener("click", e => {
      const b = e.target.closest("[data-act]"); if (!b) return;
      if (b.dataset.act === "img-pick") pickImage();
      if (b.dataset.act === "img-save") saveImage();
    });
    document.getElementById("ed-form").addEventListener("change", e => {
      if (sel.tab !== "images") return;
      const f = e.target.dataset.f;
      if (f === "img_kind") { IMG.kind = e.target.value;
        IMG.palette = IMG_KINDS[IMG.kind].pal; IMG.dither = IMG_KINDS[IMG.kind].dither; reprocess(); }
      if (f === "img_pal") { IMG.palette = e.target.value; reprocess(); }
      if (f === "img_dither") { IMG.dither = e.target.value; reprocess(); }
      if (f === "img_name") IMG.name = e.target.value;
    });
    document.getElementById("ed-form").addEventListener("input", touch);
    document.getElementById("ed-form").addEventListener("change", e => {
      touch();
      if (e.target.classList.contains("ed-verb") || e.target.classList.contains("ed-st")) { commit(); draw(); }
      else if (sel.tab === "bills") { forecast(); }
      else drawStatus();
    });
    document.getElementById("ed-form").addEventListener("click", e => {
      const b = e.target.closest("[data-act]"); if (!b) return;
      const act = b.dataset.act, ev = M.events.find(x => x.id === sel.id);
      commit();
      const cur = arrOf(sel.tab).find(o => idOf(sel.tab, o) === sel.id);
      if (act === "choice-add") cur.choices.push({ label: "New choice", effects: [] });
      if (act === "choice-del") cur.choices.splice(+b.dataset.ci, 1);
      if (act === "eff-add") (cur.choices[+b.dataset.ci].effects ||= []).push({ scalar: { public_standing: 0 } });
      if (act === "eff-del") cur.choices[+b.dataset.ci].effects.splice(+b.dataset.ei, 1);
      if (act === "cond-add") {
        const k = prompt("Condition:\n\n" + Object.keys(SCHEMA.conditions).join("\n"));
        if (k && SCHEMA.conditions[k]) {
          cur.when ||= {};
          const d = SCHEMA.conditions[k];
          cur.when[k] = d.form === "int" ? 1 : d.form === "bool" ? true : d.form === "flagList" ? []
                      : { [vocab(d.src)[0][0]]: d.vtype === "stage" ? "committee" : 0 };
        }
      }
      if (act === "cond-del") delete cur.when[b.dataset.c];
      if (act === "sec-add") (cur.sections ||= []).push({ h: "", body: "" });
      if (act === "sec-del") cur.sections.splice(+b.dataset.si, 1);
      if (act === "see-add") (cur.see ||= []).push(vocab("cxArticles")[0][0]);
      if (act === "see-del") cur.see.splice(+b.dataset.si, 1);
      if (act === "logo-make") makeLogo(cur);
      if (act === "rename") doRename(cur);
      if (act === "roll-name") rollName(cur);
      if (act === "arch-roll" || act === "arch-reroll") {
        const a = document.querySelector('#ed-form [data-f="archetype"]').value;
        if (!a) { alert("Pick an archetype first."); }
        else {
          if (act === "arch-reroll") { cur.dependency = ""; cur.grievance = ""; }
          rollStation(a, cur);
          touch();
        }
      }
      draw();
    });
    document.getElementById("ed-new").addEventListener("click", () => {
      commit(); snapshot("new");
      const o = KIND[sel.tab].blank();
      arrOf(sel.tab).push(o); sel.id = idOf(sel.tab, o); draw();
    });
    document.getElementById("ed-dup").addEventListener("click", () => {
      commit(); snapshot("duplicate");
      const cur = arrOf(sel.tab).find(o => idOf(sel.tab, o) === sel.id);
      if (!cur) return;
      const o = clone(cur);
      if (sel.tab === "glossary") o.term += " copy"; else o.id += "_copy";
      arrOf(sel.tab).push(o); sel.id = idOf(sel.tab, o); draw();
    });
    document.getElementById("ed-del").addEventListener("click", () => {
      if (!confirm("Delete this entry?")) return;
      snapshot("delete");
      if (sel.tab === "concordance")
        M.encyclopedia.articles = M.encyclopedia.articles.filter(o => o.id !== sel.id);
      else M[KIND[sel.tab].arr] = M[KIND[sel.tab].arr].filter(o => idOf(sel.tab, o) !== sel.id);
      sel.id = null; draw();
    });
    document.getElementById("ed-undo").addEventListener("click", undo);
    document.getElementById("ed-filter").addEventListener("input", draw);
    document.getElementById("ed-export").addEventListener("click", exportAll);
    document.getElementById("ed-discard").addEventListener("click", () => {
      if (!confirm("Discard the draft and reload from the content files on disk?")) return;
      clearDraft(); location.reload();
    });
    document.getElementById("ed-exportone").addEventListener("click", exportOne);
    document.getElementById("ed-previewbtn").addEventListener("click", preview);
    document.getElementById("ed-closepreview").addEventListener("click", () =>
      document.getElementById("ed-previewwrap").style.display = "none");
    draw();
  }

  return { boot };
})();
