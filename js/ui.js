/* =============================================================
   UI — rendering only. No game rules live here.
   Reads state, writes DOM, calls Engine for anything decided.
   ============================================================= */

const UI = (function () {
  "use strict";

  let st, C, currentEvent = null, lastResult = null, cxCurrent = "perigee_charter";

  const $ = s => document.querySelector(s);
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
  const sw = col => `<i class="swatch" style="background:${col}"></i>`;
  /* a party mark: its logo if one exists, otherwise the colour swatch */
  const mark = id => {
    const p = C.partyById[id];
    if (p && p.logo) return `<img class="dith plogo" src="img/logos/${p.logo}" alt=""` +
      ` onerror="this.replaceWith(Object.assign(document.createElement('i'),` +
      `{className:'swatch',style:'background:${p.colour}'}))">`;
    return sw(pc(id));
  };
  const pc = id => (C.partyById[id] || {}).colour || "var(--chrome-dk)";
  const pn = id => (C.partyById[id] || {}).name || id;

  /* Autosave. Shell owns slots; if it is not loaded (the editor, a test
     harness) this is a no-op rather than an error. */
  const saved = () => { if (typeof Shell !== "undefined") Shell.autosave(); };

  let wired = false;

  function boot(state, content) {
    st = state; C = content;
    currentEvent = null; lastResult = null;
    if (wired) { drawAll(); return; }   /* Shell re-boots on every load */
    wired = true;
    document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(o => o.setAttribute("aria-selected", "false"));
      t.setAttribute("aria-selected", "true");
      document.querySelectorAll(".screen").forEach(s => s.classList.remove("on"));
      $("#s-" + t.dataset.t).classList.add("on");
      $("#viewport").scrollTop = 0;
    }));
    /* Saving, loading and starting a game belong to Shell now — they are
       session concerns, not rendering ones, and they live in the topbar. */
    const goSearch = () => {
      const hit = Concordance.search($("#cx-q").value);
      if (hit) { cxCurrent = hit; Concordance.render(st, C, cxCurrent, true); $("#cx-body").scrollTop = 0; }
      else $("#cx-q").select();
    };
    $("#cx-goto").addEventListener("click", goSearch);
    $("#cx-q").addEventListener("keydown", e => { if (e.key === "Enter") goSearch(); });
    document.getElementById("cx-body").addEventListener("click", e => {
      const g = e.target.closest("[data-go]");
      if (g) { cxCurrent = g.dataset.go; Concordance.render(st, C, cxCurrent, true); $("#cx-body").scrollTop = 0; }
    }, true);
    $("#cx-back").addEventListener("click", () => {
      const prev = Concordance.back();
      if (prev) { cxCurrent = prev; Concordance.render(st, C, cxCurrent, false); $("#cx-body").scrollTop = 0; }
    });
    document.getElementById("cx-nav").addEventListener("click", e => {
      const g = e.target.closest("[data-go]");
      if (g) { cxCurrent = g.dataset.go; Concordance.render(st, C, cxCurrent, true); $("#cx-body").scrollTop = 0; }
    });

    drawAll();
  }

  function drawAll() {
    drawTitle(); drawPrices(); drawGovernment(); drawSitting(); drawChamber(); drawFunctional(); drawOrbit(); drawLog(); drawStatus();
    if (typeof Concordance !== "undefined") Concordance.render(st, C, cxCurrent, false);
    if (typeof Papers !== "undefined") Papers.render(st, C);
  }

  /* ---------- title / status ---------- */
  function drawTitle() {
    $("#tb-sys").textContent = `SESS ${st.session} / SITTING ${String(st.sitting).padStart(3, "0")} / ${st.date}`;
  }
  function drawStatus() {
    const conf = Engine.confidence(st), maj = Engine.majority(st);
    $("#sb-conf").textContent = `CONFIDENCE ${conf}/${Engine.chamberTotal(st)}`;
    $("#sb-margin").textContent = `MARGIN ${conf - maj >= 0 ? "+" : ""}${conf - maj}`;
    $("#sb-thermal").textContent = `THERMAL ${st.scalars.thermal_margin}%`;
    $("#sb-chapter").textContent = `CHAPTER ${st.chapter}`;
    $("#sb-slots").textContent = `SLOTS ${st.slots.total - st.slots.used}/${st.slots.total}`;
    $("#sb-sig").textContent = `SIGNATURES ${st.signatures || 0}/9`;
    $("#sb-sig").style.color = (st.signatures || 0) >= 7 ? "var(--alert)" : "";
    const loss = Engine.checkLoss(st, C);
    $("#sb-state").textContent = loss.lost ? "GOVERNMENT FALLEN — " + loss.reason.toUpperCase() : "READY";
    $("#sb-state").style.color = loss.lost ? "var(--alert)" : "";
  }

  /* ---------- scarcity prices ----------
     Four index numbers and their histories. Not a market to play; a readout
     of what your legislation did to the cost of existing. */

  const PRICE_META = [
    { k:"thermal",   label:"Thermal quota", unit:"per MW-year rejected" },
    { k:"substrate", label:"Substrate rent", unit:"per mind-year, standard clock" },
    { k:"volume",    label:"Volume",         unit:"per pressurised m³, annual" },
    { k:"transit",   label:"Transit",        unit:"per tonne to the ring" }
  ];

  function spark(hist, w, h) {
    if (!hist || hist.length < 2) return "";
    const lo = Math.min(...hist), hi = Math.max(...hist), span = (hi - lo) || 1;
    const pts = hist.map((v, i) =>
      `${(i / (hist.length - 1) * w).toFixed(1)},${(h - (v - lo) / span * h).toFixed(1)}`).join(" ");
    const last = hist[hist.length - 1], first = hist[0];
    const col = last > first ? "var(--alert)" : last < first ? "var(--ok)" : "var(--rule)";
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="sparkline">` +
      `<polyline points="${pts}" fill="none" stroke="${col}" stroke-width="1.2"/></svg>`;
  }

  function drawPrices() {
    const box = $("#gov-prices"); if (!box) return;
    box.innerHTML = PRICE_META.map(m => {
      const v = st.prices[m.k], h = st.priceHistory[m.k] || [v];
      const base = h[0], chg = v - base;
      const cls = chg > 2 ? "up" : chg < -2 ? "down" : "";
      return `<div class="prow">
        <div class="plab">${m.label}<em>${m.unit}</em></div>
        ${spark(h.slice(-40), 76, 18)}
        <div class="pval ${cls}">${v.toFixed(0)}<span>${chg >= 0 ? "+" : ""}${chg.toFixed(0)}</span></div>
      </div>`;
    }).join("") +
    `<div class="note" style="margin-top:4px">Index, 100 at the opening of the series. ` +
    `Every one of these is set by legislation rather than by a market.</div>`;
  }

  /* ---------- government ---------- */
  function drawGovernment() {
    const conf = Engine.confidence(st), maj = Engine.majority(st);
    $("#gov-coalition-hdr").textContent = `${conf}/${Engine.chamberTotal(st)}`;

    let h = "<thead><tr><th>Party</th><th class='n'>Seats</th><th class='n'>Loy</th></tr></thead><tbody>";
    st.coalition.forEach(id => {
      h += `<tr><td>${mark(id)}${pn(id)} ${id === st.playerParty ? "<span class='flag'>GOV</span>" : ""}</td>` +
           `<td class="n">${Engine.partyTotal(st, id)}</td><td class="n">${id === st.playerParty ? "&mdash;" : st.parties[id].loyalty}</td></tr>`;
    });
    st.confidenceSupply.forEach(id => {
      h += `<tr><td>${mark(id)}${pn(id)} <span class="flag">C&amp;S</span></td>` +
           `<td class="n">${Engine.partyTotal(st, id)}</td><td class="n">${st.parties[id].loyalty}</td></tr>`;
    });
    h += "</tbody>";
    $("#gov-coalition").innerHTML = h;
    $("#gov-margin").innerHTML = conf - maj === 0
      ? "Working majority of nil. Confidence carries on the exact number."
      : `Working majority of ${conf - maj}. Majority is ${maj}.`;

    let ch = "<thead><tr><th>Current</th><th class='n'>MPs</th><th class='n'>Loy</th></tr></thead><tbody>";
    C.currents.filter(c => c.party === st.playerParty).forEach(c => {
      const s = st.currents[c.id];
      ch += `<tr class="${s.loyalty < 20 ? "sel" : ""}"><td>${c.name}</td><td class="n">${s.members}</td><td class="n">${s.loyalty}</td></tr>`;
    });
    $("#gov-currents").innerHTML = ch + "</tbody>";

    let bh = "<thead><tr><th>Bill</th><th>Stage</th><th class='n'>Pop.</th><th class='n'>Func.</th><th>Test</th></tr></thead><tbody>";
    C.bills.forEach(b => {
      const bs = st.bills[b.id];
      const d = Engine.division(st, C, b.id);
      const dead = bs.dead || bs.stage === "withdrawn";
      bh += `<tr class="${b.id === "divergence" ? "sel" : ""}" data-bill="${b.id}" style="cursor:pointer">` +
        `<td>${b.title.replace(/ Bill$/, "")}</td><td>${dead ? "Withdrawn" : bs.stage.replace(/_/g, " ")}</td>` +
        `<td class="n">${d.popular.aye}</td><td class="n">${b.dualMajority ? d.functional.aye : "&mdash;"}</td>` +
        `<td><span class="flag ${b.dualMajority ? "bad" : ""}">${b.dualMajority ? "DUAL" : "SIMPLE"}</span></td></tr>`;
    });
    $("#gov-bills").innerHTML = bh + "</tbody>";
    $("#gov-bills").querySelectorAll("tr[data-bill]").forEach(tr =>
      tr.addEventListener("click", () => drawBill(tr.dataset.bill)));

    drawBill($("#bill-detail").dataset.bill || "divergence");

    const meters = [
      ["Party loyalty", "party_loyalty", 15], ["Public standing", "public_standing", 20],
      ["Consumables", "consumables", 25], ["Thermal margin", "thermal_margin", 20],
      ["Treasury", "treasury", 15]
    ];
    $("#gov-meters").innerHTML = meters.map(([lab, k, warn]) => {
      const v = st.scalars[k];
      const cls = v <= warn ? "warn" : v >= 65 ? "good" : "";
      return `<div class="meterrow"><label>${lab}</label><div class="meter ${cls}"><i style="width:${v}%"></i></div><output>${v}</output></div>`;
    }).join("");

    /* the ledger: signed, permanent, and shown exactly */
    const partners = st.coalition.concat(st.confidenceSupply).filter(p => p !== st.playerParty);
    $("#gov-ledger").innerHTML =
      "<thead><tr><th>Partner</th><th class='n'>Ledger</th><th class='n'>Loy</th></tr></thead><tbody>" +
      partners.map(id => {
        const c = st.capital[id] || 0;
        const cls = c > 0 ? "good" : c < 0 ? "bad" : "";
        return `<tr><td>${mark(id)}${pn(id)}</td>` +
          `<td class="n"><span class="flag ${cls}">${c > 0 ? "+" : ""}${c}</span></td>` +
          `<td class="n">${st.parties[id].loyalty}</td></tr>`;
      }).join("") + "</tbody>";
    $("#gov-ledger-note").innerHTML =
      "Positive means they owe you. Negative means you owe them. Nothing here decays.";

    const left = st.slots.total - st.slots.used;
    $("#gov-slots").innerHTML =
      `<div class="slotbar">${Array.from({length: st.slots.total}, (_, i) =>
        `<i class="${i < st.slots.used ? "spent" : ""}"></i>`).join("")}</div>` +
      `<div class="note" style="margin-top:4px">${left} of ${st.slots.total} slots left this session. ` +
      `Giving a partner's bill time puts them in your debt. Giving your own advances nothing but your programme.</div>` +
      `<table><tbody>${C.bills.filter(b => !st.bills[b.id].dead).map(b =>
        `<tr><td>${b.owner ? mark(b.owner) : "<i class='swatch' style='background:var(--chrome-dk)'></i>"}${b.title.replace(/ Bill$/, "")}` +
        `${b.priority ? " <span class='flag'>PRIORITY</span>" : ""}</td>` +
        `<td class="n">${b.owner && b.owner !== st.playerParty ? "+" + (b.priority ? 3 : 2) : "&mdash;"}</td>` +
        `<td class="n"><button class="btn slotbtn" data-slot="${b.id}"${left ? "" : " disabled"}>Grant</button></td></tr>`
      ).join("")}</tbody></table>`;
    $("#gov-slots").querySelectorAll(".slotbtn").forEach(btn =>
      btn.addEventListener("click", () => { Engine.grantSlot(st, C, btn.dataset.slot); drawAll(); }));

    /* ---- instruments: the fast, deniable tool ---- */
    $("#gov-si").innerHTML = (C.instruments || []).map(si => {
      const s = st.instruments[si.id];
      const chk = Engine.canMake(st, C, si.id);
      const window = s.inForce && s.prayerCloses != null ? (s.prayerCloses - st.sitting) : null;
      let status, cls = "";
      if (s.revoked) { status = "revoked"; cls = "bad"; }
      else if (s.inForce) { status = window > 0 ? "in force · prayable " + window : "in force"; cls = "good"; }
      else if (s.awaitingApproval) { status = "awaiting approval"; }
      else status = si.procedure === "affirmative" ? "affirmative" : "negative";
      return `<tr data-si="${si.id}" class="${s.inForce ? "sel" : ""}">
        <td>${si.title.replace(/ Order 2287$/, "")}<div class="note">${si.number} &middot; ${si.author.replace(/_/g,' ')}</div></td>
        <td class="n"><span class="flag ${cls}">${status}</span></td>
        <td class="n">${s.made ? "" :
          `<button class="btn sibtn" data-make="${si.id}"${chk.ok ? "" : " disabled title='" + esc(chk.reason) + "'"}>Make</button>`}
          ${s.inForce && window > 0 ? `<button class="btn sibtn" data-pray="${si.id}">Pray</button>` : ""}</td>
      </tr>`;
    }).join("");
    $("#gov-si").querySelectorAll("[data-make]").forEach(b => b.addEventListener("click", () => {
      const r = Engine.makeInstrument(st, C, b.dataset.make);
      if (!r.ok) alert(r.reason); drawAll();
    }));
    $("#gov-si").querySelectorAll("[data-pray]").forEach(b => b.addEventListener("click", () => {
      const f = Engine.prayerForecast(st, C, b.dataset.pray);
      if (!confirm(`Pray against this order?\n\nForecast ${f.aye} of ${f.total}, needs ${f.need}.\n` +
        (f.carries ? "The prayer would carry and the order would be annulled." :
                     "The prayer would be defeated and the order would stand."))) return;
      Engine.prayAgainst(st, C, b.dataset.pray); drawAll();
    }));

    /* ---- cabinet ---- */
    $("#gov-cabinet").innerHTML = (C.cabinet || []).map(p => {
      const s = st.cabinet[p.id];
      const ch = s.holder ? C.characterById[s.holder] : null;
      return `<tr class="${s.holder ? "" : "sel"}">
        <td>${p.name}${p.senior ? " <span class='flag'>SENIOR</span>" : ""}</td>
        <td>${s.holder ? (ch ? ch.name.replace(/^Rt\. Hon\. /, "") : s.holder.replace(/_/g," "))
                       : "<span class='flag bad'>VACANT</span>"}</td>
        <td class="n">${s.party ? mark(s.party) : ""}</td></tr>`;
    }).join("");

    $("#gov-pres").innerHTML =
      `<div class="kv"><dt>Incumbent</dt><dd>${C.characterById.tenaya.name.replace("President ", "")}</dd>` +
      `<dt>Relations</dt><dd>${st.president.relationship}</dd></div>` +
      `<div class="rulehead">Reserve powers</div>` +
      `<table><tbody>${st.president.powers.map(p =>
        `<tr><td style="text-transform:capitalize">${p}</td><td class="n"><span class="flag ${st.president.relationship < 35 ? "bad" : ""}">${st.president.relationship < 35 ? "LIVE" : "DORMANT"}</span></td></tr>`
      ).join("")}</tbody></table>`;

    $("#gov-wire").innerHTML = st.wire.length
      ? st.wire.slice(0, 8).map(w => `<div class="post"><div class="meta">SITTING ${w.sitting}</div><p>${w.text}</p></div>`).join("")
      : `<div class="pbody"><div class="note">No traffic this session.</div></div>`;
  }

  function drawBill(id) {
    const b = C.billById[id], bs = st.bills[id], d = Engine.division(st, C, id);
    const det = $("#bill-detail");
    det.dataset.bill = id;
    $("#bill-hdr").textContent = b.title;
    $("#bill-ref").textContent = b.ref;
    det.innerHTML =
      `<div class="note" style="margin-bottom:6px">${b.summary}</div>` +
      (b.effectNote ? `<div class="rulehead">Effect</div><div class="note">${b.effectNote}</div>` : "") +
      `<div class="rulehead">Division forecast</div>` +
      benchBar("Popular", d.popular) +
      (b.dualMajority ? benchBar("Functional", d.functional) : "") +
      `<div class="note" style="margin-top:5px">${
        d.carries ? "<b>Carries.</b>" :
        (b.dualMajority && d.popular.carries && !d.functional.carries
          ? "<b>Carries on the popular benches and fails on the functional.</b> The dual test applies: bills touching life-support integrity and charter amendments must carry separately among functional members."
          : "<b>Fails.</b>")}</div>` +
      whipPanel(id, b, d) +
      `<div class="btnrow">
         <button class="btn" id="btn-divide"${bs.dead ? " disabled" : ""}>Move to a division</button>
         <button class="btn" id="btn-breakdown">Party breakdown</button>
       </div>
       <div id="breakdown"></div>`;

    $("#btn-breakdown").addEventListener("click", () => {
      const bd = $("#breakdown");
      if (bd.innerHTML) { bd.innerHTML = ""; return; }
      bd.innerHTML = `<div class="rulehead">By party</div><table><thead><tr><th>Party</th>` +
        `<th class="n">Pop aye</th><th class="n">of</th><th class="n">Func aye</th><th class="n">of</th></tr></thead><tbody>` +
        d.rows.filter(r => r.popularSeats + r.functionalSeats > 0).map(r =>
          `<tr><td>${sw(pc(r.party))}${(C.partyById[r.party] || {}).short || r.party}</td>` +
          `<td class="n">${r.popularAye}${r.popularWhipped ? `<span class="wh">+${r.popularWhipped}</span>` : ""}</td><td class="n">${r.popularSeats}</td>` +
          `<td class="n">${r.functionalAye}${r.functionalWhipped ? `<span class="wh">+${r.functionalWhipped}</span>` : ""}</td><td class="n">${r.functionalSeats}</td></tr>`).join("") +
        `</tbody></table>`;
    });
    det.querySelectorAll(".whipslide").forEach(sl => sl.addEventListener("input", () => {
      Engine.setWhip(st, C, id, sl.dataset.wp, sl.dataset.wt, +sl.value);
      drawBill(id); drawStatus();
    }));
    const clr = $("#btn-clearwhip");
    if (clr) clr.addEventListener("click", () => { Engine.clearWhips(st, id); drawBill(id); });

    $("#btn-divide").addEventListener("click", () => {
      Engine.divide(st, C, id);
      drawAll();
    });
  }

  /* ---------- the whip ----------
     What you can move depends on how far the bill sits from the party's own
     position, which is what keeps the four axes load-bearing. What it costs
     comes out of the ledger, and overdrawing costs loyalty. */
  function whipPanel(billId, b, d) {
    if (st.bills[billId].dead) return "";
    const partners = [st.playerParty].concat(
      st.coalition.concat(st.confidenceSupply).filter(p => p !== st.playerParty));
    const tiers = b.dualMajority ? ["popular", "functional"] : ["popular"];
    const w = st.whips[billId] || {};

    let rows = "";
    partners.forEach(pid => {
      tiers.forEach(tier => {
        const cap = Engine.whippable(st, C, billId, pid, tier);
        const cur = (w[pid] || {})[tier] || 0;
        if (!cap.max && !cur) return;
        rows += `<tr><td>${mark(pid)}${(C.partyById[pid] || {}).short || pid}</td>` +
          `<td>${tier === "functional" ? "func" : "elected"}</td>` +
          `<td class="n">${cur} / ${cap.max}</td>` +
          `<td class="n">${cap.costPerSeat}&thinsp;${cap.currency === "loyalty" ? "loy" : "cap"}</td>` +
          `<td><input class="whipslide" type="range" min="0" max="${cap.max}" value="${cur}" ` +
          `data-wp="${pid}" data-wt="${tier}"></td></tr>`;
      });
    });

    if (!rows) return `<div class="rulehead">The whip</div>` +
      `<div class="note">No headroom. Every member of the coalition who can be brought to this ` +
      `measure is already voting for it. ${b.dualMajority && !d.functional.carries
        ? "The functional bench cannot be whipped — the government holds " +
          d.rows.reduce((n, r) => n + (st.coalition.includes(r.party) ? r.functionalSeats : 0), 0) +
          " of " + d.functional.total + " and needs " + d.functional.need + ". This is not a whipping problem."
        : ""}</div>`;

    const cost = Engine.whipCost(st, C, billId);
    const capLines = Object.keys(cost.capital).map(p => {
      const after = (st.capital[p] || 0) - cost.capital[p];
      return `${(C.partyById[p] || {}).short || p} &minus;${cost.capital[p]}` +
             `<span class="${after < 0 ? "od" : ""}"> (${after > 0 ? "+" : ""}${after})</span>`;
    }).join(" &middot; ");

    return `<div class="rulehead">The whip</div>` +
      `<table class="whiptab"><thead><tr><th>Party</th><th>Bench</th><th class="n">Seats</th>` +
      `<th class="n">Rate</th><th>Move</th></tr></thead><tbody>${rows}</tbody></table>` +
      (cost.seats
        ? `<div class="whipcost">Plan: <b>${cost.seats}</b> seats. ` +
          (capLines ? "Capital " + capLines + ". " : "") +
          (cost.loyalty ? `Own party loyalty &minus;${cost.loyalty}. ` : "") +
          `Charged when the division is called.` +
          `<button class="btn ed-x" id="btn-clearwhip">clear</button></div>`
        : `<div class="note">Drag to commit members. Nothing is charged until you divide.</div>`);
  }

  function benchBar(label, r) {
    const pct = Math.min(100, r.aye / r.total * 100);
    return `<div class="dm"><b>${label}</b><div class="dmbar">` +
      `<i class="yes" style="width:${pct}%;background:${r.carries ? "var(--ok)" : "var(--alert)"}"></i>` +
      `<span class="thr" style="left:${r.need / r.total * 100}%"></span>` +
      `<span class="lbl">${r.aye} / ${r.total} &middot; need ${r.need}</span></div></div>`;
  }

  /* ---------- glossary annotation ----------
     First use of a term in a given event gets a dotted underline and a
     one-line gloss with its familiar handle. Opt-in, not a wall of text,
     and diegetic: government software has footnotes. */

  /* Wrap the first occurrence of each glossary term in a gloss span.

     Only text outside tags is eligible. Matching inside a tag inserts a
     <span> into an attribute value and destroys the markup, which is exactly
     what happened: several glosses are written using other glossary terms
     ("instance" is defined as "A fork that is still legally the same person
     as its root"), so annotating `fork` tore open the span already wrapped
     around `instance` and dumped the raw attributes into the prose.

     After each insertion the segments are re-split, so a term can never land
     inside markup added moments earlier by another term. */
  function annotate(html) {
    const terms = (C.glossary || []).filter(g => !g.assumed)
      .sort((a, b) => b.term.length - a.term.length);
    const done = new Set();
    let parts = html.split(/(<[^>]*>)/);

    terms.forEach(g => {
      if (done.has(g.term)) return;
      const re = new RegExp("\\b(" + g.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")\\b", "i");
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].charAt(0) === "<" || !re.test(parts[i])) continue;
        parts[i] = parts[i].replace(re, m =>
          `<span class="gl" tabindex="0" data-gloss="${esc(g.gloss)}"` +
          ` data-handle="${esc(g.handle || "")}">${m}</span>`);
        done.add(g.term);
        parts = parts.join("").split(/(<[^>]*>)/);
        break;
      }
    });
    return parts.join("");
  }
  /* Attribute-safe. & must go first or it double-escapes the entities below. */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function bindGlossary(scope) {
    scope.querySelectorAll(".gl").forEach(n => {
      const show = () => {
        scope.querySelectorAll(".glbox").forEach(b => b.remove());
        const box = el("span", "glbox",
          `<b>${n.textContent}</b> ${n.dataset.gloss}` +
          (n.dataset.handle ? `<em>${n.dataset.handle}</em>` : ""));
        n.after(box);
      };
      n.addEventListener("click", show);
      n.addEventListener("focus", show);
    });
  }

  /* ---------- images ----------
     Both helpers return "" when there is no image, and both hide
     themselves if the file 404s. Content can reference an image that
     has not been made yet without breaking the build. */

  function portrait(ch) {
    if (!ch || !ch.portrait) return "";
    return `<div class="portrait">` +
      `<img class="dith" src="img/portraits/${ch.portrait}" alt="${ch.name}"` +
      ` onerror="this.closest('.portrait').remove()">` +
      `<div class="cap">REGISTRY</div></div>`;
  }

  function plate(img) {
    if (!img || !img.src) return "";
    return `<div class="plate-img">` +
      `<img class="dith" src="img/events/${img.src}" alt="${img.caption || ""}"` +
      ` onerror="this.closest('.plate-img').remove()">` +
      `<div class="cap"><span>${img.caption || ""}</span><em>${img.credit || ""}</em></div></div>`;
  }

  /* ---------- sitting ---------- */
  function drawSitting() {
    const box = $("#sitting-body");
    const loss = Engine.checkLoss(st, C);
    if (loss.lost) {
      box.innerHTML = `<div class="waiting"><b>The government has fallen.</b><br>` +
        `Reason: ${loss.reason}. Sitting ${st.sitting}.</div>`;
      return;
    }
    if (!currentEvent) currentEvent = Engine.nextEvent(st, C);
    if (!currentEvent) {
      box.innerHTML = `<div class="note">Nothing on the order paper demands a decision this sitting.</div>` +
        `<div class="btnrow"><button class="btn" id="btn-advance">Rise until the next sitting</button></div>`;
      $("#btn-advance").addEventListener("click", () => { Engine.advance(st, C); currentEvent = null; lastResult = null; drawAll(); saved(); });
      return;
    }
    const e = currentEvent;
    const spk = e.speaker ? C.characterById[e.speaker] : null;
    $("#sitting-hdr").textContent = e.title;
    box.innerHTML =
      plate(e.image) +
      (spk ? portrait(spk) + `<div class="rulehead">${spk.name} &mdash; ${spk.role}</div>` : "") +
      `<div class="prose">${annotate(e.body.split(/\n\n/).map(p => `<p>${p.replace(/\n/g, " ")}</p>`).join(""))}</div>` +
      `<div style="clear:both"></div>` +
      (lastResult
        ? `<div class="decl" style="margin-top:8px"><b>Outcome</b><br>${lastResult}</div>
           <div class="btnrow"><button class="btn" id="btn-advance">Rise until the next sitting</button></div>`
        : `<div class="rulehead">Decision</div>` +
          e.choices.map((c, i) => `<div class="btnrow" style="margin-top:3px"><button class="btn choice" data-i="${i}" style="text-align:left">${c.label}</button></div>`).join(""));

    if (lastResult) {
      bindGlossary(box);
      $("#btn-advance").addEventListener("click", () => { Engine.advance(st, C); currentEvent = null; lastResult = null; drawAll(); saved(); });
    } else {
      bindGlossary(box);
      box.querySelectorAll(".choice").forEach(b => b.addEventListener("click", () => {
        lastResult = Engine.choose(st, C, e, +b.dataset.i) || "Noted.";
        saved();
        drawAll();
      }));
    }
  }

  /* ---------- chamber ---------- */

  /* WESTMINSTER, NOT A HEMICYCLE (bible 12.7, revised).

     A semicircle renders parliament as a spectrum, which is exactly the wrong
     reading of this chamber: confidence is binary and the whip panel next door
     spends capital moving whole benches across a floor. Facing benches make
     "who is in government" the first thing the diagram says.

     Three bodies, because there are three:
       government   coalition plus confidence-and-supply, above the floor
       opposition   everyone else, below it
       the bench    every functional member, crosswise at the Bar

     Functional members sit apart whatever party badge they wear, because under
     dual majority they are a separate electorate that must carry a measure
     separately. Seating them with their party would hide the one fact the
     player most needs: that a government majority is not a majority.

     Glyph shape still carries tier (12.2's split visual language):
     circle district, square list, triangle functional. */
  function drawChamber() {
    const govIds = st.coalition.concat(st.confidenceSupply);

    /* Largest party nearest the floor, so the front bench reads as the
       despatch box rather than as an arbitrary content order. */
    const bySize = ids => ids.slice().sort((a, b) =>
      Engine.partyTotal(st, b) - Engine.partyTotal(st, a));

    const gov = [], opp = [], cross = [];
    const popular = (id, into) => {
      const s = st.parties[id].seats, col = C.partyById[id].colour;
      for (let i = 0; i < s.district; i++) into.push({ c: col, t: "d", p: id });
      for (let i = 0; i < s.list; i++)     into.push({ c: col, t: "l", p: id });
    };
    const allIds = C.parties.map(p => p.id);
    bySize(allIds.filter(id => govIds.includes(id))).forEach(id => popular(id, gov));
    bySize(allIds.filter(id => !govIds.includes(id))).forEach(id => popular(id, opp));
    bySize(allIds).forEach(id => {
      const s = st.parties[id].seats, col = C.partyById[id].colour;
      for (let i = 0; i < s.functional; i++) cross.push({ c: col, t: "f", p: id });
    });

    const glyph = (x, y, s) => {
      const st_ = ` fill="${s.c}" stroke="#2c2f28" stroke-width=".6"`;
      if (s.t === "d") return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4"${st_}/>`;
      if (s.t === "l") return `<rect x="${(x-3.5).toFixed(1)}" y="${(y-3.5).toFixed(1)}" width="7" height="7"${st_}/>`;
      return `<path d="M${x.toFixed(1)} ${(y-4.4).toFixed(1)}L${(x+4.2).toFixed(1)} ${(y+3.2).toFixed(1)}` +
             `L${(x-4.2).toFixed(1)} ${(y+3.2).toFixed(1)}Z"${st_}/>`;
    };

    /* PARTIES STACK HORIZONTALLY. Seats fill column by column, five deep,
       so a party occupies a contiguous block of columns and you read the
       chamber left to right as party, party, party — which is how the
       benches actually work. Filling row-major instead made each party a
       horizontal band and stacked the parties vertically, which reads as a
       bar chart lying on its side rather than as a chamber. */
    const ROWS = 5, CW = 12, RH = 13;
    const cols = n => Math.ceil(n / ROWS);

    function bench(seats, x0, yFront, dir) {
      let out = "";
      seats.forEach((s, i) => {
        const c = Math.floor(i / ROWS), r = i % ROWS;
        out += glyph(x0 + c * CW, yFront + dir * r * RH, s);
      });
      return out;
    }

    /* The bench at the Bar sits crosswise, so it fills the other way. */
    function crossbench(seats, x0, yTop) {
      let out = "", COLS = 5, CS = 15, RS = 14;
      seats.forEach((s, i) => {
        out += glyph(x0 + (i % COLS) * CS, yTop + Math.floor(i / COLS) * RS, s);
      });
      return out;
    }

    /* Everything is derived from the seat counts, so the diagram tightens
       when a party crosses the floor rather than leaving a hole. */
    const govCols = Math.max(1, cols(gov.length));
    const oppCols = Math.max(1, cols(opp.length));
    const benchW = Math.max(govCols, oppCols) * CW;
    const crossRows = Math.max(1, Math.ceil(cross.length / 5));

    const X0 = 104;                                   // clear of the Speaker
    const GAP = 34;                                   // floor to front bench
    const FLOOR = 30 + (ROWS - 1) * RH + GAP;   // headroom for the label
    const govFront = FLOOR - GAP, oppFront = FLOOR + GAP;
    const govTop = govFront - (ROWS - 1) * RH;
    const oppBot = oppFront + (ROWS - 1) * RH;

    const CX = X0 + benchW / 2 - CW / 2;              // bench centre
    const TW = Math.min(benchW - 40, 300), TX = CX - TW / 2;

    const crossX = X0 + benchW + 38;
    const crossTop = FLOOR - ((crossRows - 1) * 14) / 2;
    const crossBot = crossTop + (crossRows - 1) * 14;

    const W = crossX + 5 * 15 + 18;
    const H = Math.max(oppBot + 30, crossBot + 30) + 10;
    const svg = document.getElementById("chamber").ownerSVGElement ||
                document.getElementById("chamber").parentNode;
    svg.setAttribute("viewBox", `0 0 ${Math.round(W)} ${Math.round(H)}`);

    const label = (x, y, t, cls) =>
      `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" text-anchor="middle" class="chlab${cls ? " " + cls : ""}">${t}</text>`;

    $("#chamber").innerHTML =
      /* the table of the House, centred on the benches, and the mace on it */
      `<rect x="${TX.toFixed(0)}" y="${FLOOR-9}" width="${TW.toFixed(0)}" height="18" fill="#b9bcae" stroke="#75776e" stroke-width=".8"/>` +
      `<line x1="${(TX+22).toFixed(0)}" y1="${FLOOR}" x2="${(TX+TW*0.45).toFixed(0)}" y2="${FLOOR}" stroke="#8a6d24" stroke-width="2.2" stroke-linecap="round"/>` +
      `<circle cx="${(TX+22).toFixed(0)}" cy="${FLOOR}" r="3.4" fill="#8a6d24"/>` +
      /* the two lines, two sword-lengths apart */
      `<line x1="${X0-8}" y1="${FLOOR-20}" x2="${(X0+benchW-4).toFixed(0)}" y2="${FLOOR-20}" stroke="#8c3a32" stroke-dasharray="5 4" stroke-width=".9"/>` +
      `<line x1="${X0-8}" y1="${FLOOR+20}" x2="${(X0+benchW-4).toFixed(0)}" y2="${FLOOR+20}" stroke="#8c3a32" stroke-dasharray="5 4" stroke-width=".9"/>` +
      /* the Speaker holds the end */
      `<rect x="44" y="${FLOOR-22}" width="30" height="44" rx="3" fill="#5d6152" stroke="#2c2f28" stroke-width="1"/>` +
      `<rect x="50" y="${FLOOR-12}" width="18" height="24" rx="2" fill="#7d8271"/>` +
      label(59, FLOOR + 36, "SPEAKER") +
      bench(gov, X0, govFront, -1) +
      bench(opp, X0, oppFront, +1) +
      crossbench(cross, crossX, crossTop) +
      label(CX, govTop - 12, "GOVERNMENT") +
      label(CX, oppBot + 22, "OPPOSITION") +
      label(crossX + 30, crossTop - 14, "THE BENCH") +
      label(crossX + 30, crossBot + 22, "functional tier", "sub");

    const seatLine = (n, of) => `${n}<span class="of">/${of}</span>`;
    const govN = gov.length, oppN = opp.length, crossN = cross.length;
    $("#chamber-tally").innerHTML =
      `<span class="ct gov">Government ${seatLine(govN, Engine.popularTotal(st))}</span>` +
      `<span class="ct opp">Opposition ${seatLine(oppN, Engine.popularTotal(st))}</span>` +
      `<span class="ct cross">Functional ${crossN}</span>` +
      `<span class="ct">Majority ${Engine.majority(st)}</span>`;

    $("#chamber-legend").innerHTML = C.parties.map(p =>
      `<span>${mark(p.id)}${p.name} ${Engine.partyTotal(st, p.id)}` +
      `${govIds.includes(p.id) ? ' <i class="ingov">gov</i>' : ""}</span>`).join("");

    $("#comp-table").innerHTML =
      "<thead><tr><th>Party</th><th class='n'>Dist</th><th class='n'>List</th><th class='n'>Func</th><th class='n'>Tot</th></tr></thead><tbody>" +
      C.parties.map(p => { const s = st.parties[p.id].seats;
        return `<tr${govIds.includes(p.id) ? ' class="govrow"' : ""}><td>${sw(p.colour)}${p.name}</td>` +
               `<td class="n">${s.district}</td><td class="n">${s.list}</td>` +
               `<td class="n">${s.functional}</td><td class="n"><b>${Engine.partyTotal(st, p.id)}</b></td></tr>`;
      }).join("") + "</tbody>";
  }

  /* ---------- orbit ---------- */
  function drawOrbit() {
    const selId = $("#station-detail").dataset.station || "ashfield";
    $("#orbit-chart").innerHTML = OrbitChart.render(st, C, selId);
    $("#orbit-key").innerHTML = OrbitChart.key();
    $("#orbit-chart").querySelectorAll("[data-station]").forEach(n => {
      const go = () => { drawStation(n.dataset.station); drawOrbit(); };
      n.addEventListener("click", go);
      n.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    const bands = [["ring", "Ring — geostationary"], ["far", "Far band"], ["middle", "Middle band"], ["low", "Low band — industrial"], ["external", "External"]];
    /* Two columns. The band, ratio, closure and suspension figures moved to
       the detail panel: six numeric columns crowded the chart off the screen
       and were unreadable as a table anyway, being six unrelated scales. */
    $("#orbit-table").innerHTML =
      "<thead><tr><th>Station</th><th class='n'>Seats</th></tr></thead><tbody>" +
      C.stations.map(s0 => { const s = st.stations[s0.id];
        return `<tr data-station="${s.id}"${s.id === selId ? ' class="sel"' : ""} style="cursor:pointer">` +
          `<td><b>${s.name}</b><i class="sub">${s.band}</i></td>` +
          `<td class="n">${s.seats}</td></tr>`;
      }).join("") + "</tbody>";
    $("#orbit-table").querySelectorAll("tr[data-station]").forEach(tr =>
      tr.addEventListener("click", () => { drawStation(tr.dataset.station); drawOrbit(); }));
    drawStation(selId);
  }

  /* population-weighted mean of a station's constituency ratios */
  function stationRatio(sid) {
    const ap = Engine.apportionment(C);
    const mine = (C.constituencies || []).filter(k => k.station === sid);
    if (!mine.length) return 1;
    const seats = mine.reduce((n, k) => n + k.magnitude, 0);
    return mine.reduce((n, k) => n + ap[k.id] * k.magnitude, 0) / seats;
  }

  function drawStation(id) {
    const s = st.stations[id];
    const d = $("#station-detail"); d.dataset.station = id;
    $("#station-hdr").textContent = s.name;
    $("#station-sub").textContent = s.type === "bundled" ? `bundled, ${s.settlements} settlements` : s.type;
    d.innerHTML =
      `<div class="kv">
        <dt>Population</dt><dd>${s.population.toLocaleString()}</dd>
        <dt>Seats</dt><dd>${s.seats}</dd>
        <dt>Band</dt><dd>${s.band}</dd>
        <dt>Apportionment</dt><dd>${stationRatio(s.id).toFixed(2)} &mdash;
          ${stationRatio(s.id) > 1.15 ? "over-represented" :
            stationRatio(s.id) < 0.85 ? "under-represented" : "near parity"}</dd>
        <dt>Closure</dt><dd>${s.closure.toFixed(2)}</dd>
        <dt>Suspended</dt><dd>${s.suspended.toLocaleString()} (counted, non-voting)</dd>
        <dt>Attested</dt><dd>${(s.attested * 100).toFixed(1)}% of adult roll</dd>
        <dt>Form</dt><dd>${s.form || "—"}</dd>
      </div>
      ${s.composition ? `<div class="rulehead">Composition</div>
      <div class="compbar">${["biological","emulation","uplift","synthetic"].map(k =>
        s.composition[k] ? `<i class="c-${k}" style="width:${s.composition[k]*100}%" title="${k} ${(s.composition[k]*100).toFixed(0)}%"></i>` : ""
      ).join("")}</div>
      <div class="note">biological ${(s.composition.biological*100).toFixed(0)}% &middot;
        emulation ${(s.composition.emulation*100).toFixed(0)}% &middot;
        uplift ${(s.composition.uplift*100).toFixed(0)}% &middot;
        synthetic ${(s.composition.synthetic*100).toFixed(0)}%</div>` : ""}
      <div class="rulehead">Constituencies</div>
      ${constituencyList(s.id)}
      <div class="rulehead">Material interest</div><div class="note">${s.material_interest.join(" &middot; ")}</div>
      <div class="rulehead">Dependency</div><div class="note">${s.dependency}</div>
      <div class="rulehead">Grievance</div><div class="note">${s.grievance}</div>`;
  }

  /* Every constituency returned by a station, with who holds it.

     `held` is optional and currently absent from every district seat:
     content/constituencies.js carries magnitude and electorate but no
     holder, and the engine tracks seats per party per TIER rather than per
     seat, so there is nothing to derive it from. The moment a constituency
     gains held:{party:seats} this lights up without further work. Until
     then it says so, rather than inventing a member. */
  function constituencyList(sid) {
    const mine = (C.constituencies || []).filter(k => k.station === sid);
    if (!mine.length) return `<div class="note">No constituency returns this station directly.</div>`;
    const ap = Engine.apportionment(C);
    const rows = mine.map(k => {
      const held = k.held ? Object.keys(k.held).sort((a, b) => k.held[b] - k.held[a]) : [];
      return `<tr><td><b>${k.name}</b><i class="sub">${k.magnitude} seat${k.magnitude === 1 ? "" : "s"}` +
        ` &middot; ${k.electorate.toLocaleString()} electors &middot; ratio ${ap[k.id].toFixed(2)}</i></td>` +
        `<td class="n">${held.length
          ? held.map(pid => `${mark(pid)}<span class="hn">${k.held[pid]}</span>`).join(" ")
          : '<i class="sub">unrecorded</i>'}</td></tr>`;
    }).join("");
    return `<table class="conslist">${rows}</table>` +
      (mine.some(k => k.held) ? "" :
       `<div class="note dim">Holders are not recorded per constituency yet &mdash;
        seats are tracked by party and tier. Adding <code>held</code> in
        content/constituencies.js fills this in.</div>`);
  }

  /* The functional tier in full. Every seat here is held by a named party,
     so unlike the district list this one is complete. */
  function drawFunctional() {
    const F = C.functional || [];
    if (!F.length || !$("#func-table")) return;
    const FR = { licensure:"licence", corporate:"companies", union_bloc:"union bloc", residual:"residual" };
    $("#func-table").innerHTML =
      "<thead><tr><th>Constituency</th><th class='n'>Seats</th><th>Held by</th></tr></thead><tbody>" +
      F.map(f => {
        const held = Object.keys(f.held || {}).sort((a, b) => f.held[b] - f.held[a]);
        return `<tr><td><b>${f.name}</b><i class="sub">${FR[f.franchise] || f.franchise}` +
          ` &middot; ${f.electorate.toLocaleString()} electors</i></td>` +
          `<td class="n">${f.seats}</td><td class="hcell">${held.length
            ? held.map(pid => `${mark(pid)}<span class="hn">${f.held[pid]}</span>`).join(" ")
            : "&mdash;"}</td></tr>`;
      }).join("") + "</tbody>";

    const seats = F.reduce((n, f) => n + f.seats, 0);
    const licensed = F.filter(f => f.franchise !== "residual")
                      .reduce((n, f) => n + f.electorate, 0);
    const resid = F.filter(f => f.franchise === "residual")
                   .reduce((n, f) => n + f.electorate, 0);
    $("#func-note").innerHTML =
      `${seats} seats. <b>${licensed.toLocaleString()}</b> electors hold a functional ` +
      `franchise across ${F.length - 1} licensed constituencies; ` +
      `<b>${resid.toLocaleString()}</b> sit in the residual constituency and return ` +
      `${F.filter(f => f.franchise === "residual").reduce((n, f) => n + f.seats, 0)}. ` +
      `A measure touching life-support integrity or the Charter must carry here separately.`;
  }

  /* ---------- log ---------- */
  function drawLog() {
    $("#log-body").innerHTML = st.log.length
      ? "<tbody>" + st.log.slice(0, 40).map(l => `<tr><td class="n">${l.sitting}</td><td>${l.text}</td></tr>`).join("") + "</tbody>"
      : "<tbody><tr><td>No decisions recorded.</td></tr></tbody>";
  }

  return { boot, state: () => st, annotate };
})();
