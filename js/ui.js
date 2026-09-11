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

  /* Office badges. An office is a one-word mark on the seat table, not a job
     title — `role` carries the title. The key belongs to content; the label
     and the class are presentation's, which is why this map lives here and not
     in the engine. The Speaker is not in it: the Chair is a property of the
     seat (`speaker:true`), because it belongs to the House, not the person. */
  const OFFICE = {
    pm:         ["PM", "pm"],
    minister:   ["Minister", "min"],
    opposition: ["Opposition Leader", "opp"],
    shadow:     ["Shadow", "shadow"],
    leader:     ["Leader", "leader"],
    whip:       ["Whip", "whip"]
  };

  /* Autosave. Shell owns slots; if it is not loaded (the editor, a test
     harness) this is a no-op rather than an error. */
  const saved = () => { if (typeof Shell !== "undefined") Shell.autosave(); };

  let wired = false;

  function boot(state, content) {
    st = state; C = content;
    currentEvent = null; lastResult = null;
    if (wired) { drawAll(); reveal(); return; }   /* Shell re-boots on every load */
    wired = true;
    document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(o => o.setAttribute("aria-selected", "false"));
      t.setAttribute("aria-selected", "true");
      document.querySelectorAll(".screen").forEach(s => s.classList.remove("on"));
      $("#s-" + t.dataset.t).classList.add("on");
      $("#viewport").scrollTop = 0;
      screen = t.dataset.t;
      setStatus(ambient(), "ambient");
    }));

    /* THE TERMINAL'S OWN CLICK, delegated once.

       Every control in the game is a real button or a row with a click
       handler, so one listener at the document gives all of them a voice
       and keeps the audio bus out of every render function. Registered on
       pointerdown rather than click so the sound lands with the press, and
       in the capture phase so a handler that stops propagation is still
       audible. A disabled control answers differently, which is the only
       feedback a disabled control can give. */
    document.addEventListener("pointerdown", e => {
      const t = e.target.closest && e.target.closest(
        "button, [data-station], [data-bill], [data-doc], [data-go]");
      if (!t) return;
      cue(t.disabled ? "deny" : t.classList.contains("tab") ? "tab" : "click");
    }, true);
    /* Saving, loading and starting a game belong to Shell now — they are
       session concerns, not rendering ones, and they live in the topbar. */

    /* THE THREE TABLES WHOSE ROWS ARE CONTROLS. A region is the container,
       how to find its rows, what identifies one, and what activating it
       does. Focus owns the selection and the keyboard from here; this
       file keeps the knowledge of what a bill or a station is, which is
       the only reason the fallbacks are functions and not strings. */
    Focus.region("gov-bills", {
      rows: "tr[data-bill]",
      key: tr => tr.dataset.bill,
      fallback: () => (C.bills[0] || {}).id,
      /* The whole panel, not just the detail. drawBill renders #bill-detail
         alone, so activating from it left the list's own highlight on the
         previous row - which is how the hardcoded one went unnoticed for so
         long. The renderer owns .sel; the way to move it is to re-render. */
      /* drawStatus too: the ambient line names the open bill, so a
         selection that does not refresh it leaves the status bar
         describing the bill you just navigated away from. */
      activate: () => { drawGovernment(); drawStatus(); }
    });
    Focus.region("orbit-table", {
      rows: "tr[data-station]",
      key: tr => tr.dataset.station,
      fallback: () => (C.stations[0] || {}).id,
      activate: id => pickStation(id)
    });
    Focus.wire();
    /* Both capture their own skip listeners; both are no-ops without a
       document. Neither is ever called from a draw function. */
    if (typeof Stream !== "undefined") Stream.wire();
    if (typeof Wait !== "undefined") Wait.wire();
    if (typeof Tips !== "undefined") Tips.wire();

    /* THE CONCORDANCE, in one function instead of four copies of it.
       Every way of getting to an article - a link in the body, a link in
       the nav, the search box, the back button - ends here, and the
       article takes focus afterwards so a keyboard reader lands at the
       top of what they just opened rather than at the top of the page. */
    const goCx = (id, push) => {
      if (!id) return;
      cxCurrent = id;
      Focus.around(() => Concordance.render(st, C, cxCurrent, push));
      $("#cx-body").scrollTop = 0;      /* after the restore, deliberately */
      const a = $("#cx-article"); if (a) a.focus({ preventScroll: true });
    };
    const goSearch = () => {
      const hit = Concordance.search($("#cx-q").value);
      if (hit) goCx(hit, true); else $("#cx-q").select();
    };
    $("#cx-goto").addEventListener("click", goSearch);
    $("#cx-q").addEventListener("keydown", e => { if (e.key === "Enter") goSearch(); });
    /* Capture, because the article this is on is about to be replaced. */
    document.getElementById("cx-body").addEventListener("click", e => {
      const g = e.target.closest("[data-go]");
      if (g) goCx(g.dataset.go, true);
    }, true);
    $("#cx-back").addEventListener("click", () => goCx(Concordance.back(), false));
    document.getElementById("cx-nav").addEventListener("click", e => {
      const g = e.target.closest("[data-go]");
      if (g) goCx(g.dataset.go, true);
    });

    drawAll();
    reveal();     /* AFTER drawAll, and outside it. Once per event. */
  }

  /* EVERY REDRAW GOES THROUGH Focus.around. This is the one place that
     needs to know it: twenty-five containers are about to be replaced,
     and whatever the player had hold of has to be given back afterwards.
     Nested redraws - a bill detail inside a government redraw - are
     absorbed by the wrapper's own depth count, so the capture happens
     once on the outside and not four times. */
  function drawAll() {
    Focus.around(() => {
      /* A tip is positioned in viewport coordinates against a node that is
         about to be replaced. Take it down first. */
      if (typeof Tips !== "undefined") Tips.hide();
      drawTitle(); drawPrices(); drawGovernment(); drawSitting(); drawChamber(); drawFunctional(); drawOrbit(); drawLog(); drawStatus();
      if (typeof Concordance !== "undefined") Concordance.render(st, C, cxCurrent, false);
      if (typeof Papers !== "undefined") Papers.render(st, C);
      /* the annotated nodes are all new, so explain mode has to be put
         back onto them */
      if (typeof Tips !== "undefined") Tips.remark();
    });
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
    setStatus(ambient(), "ambient");
  }

  /* ---------- the status line ----------

     One line, three sources, in a fixed priority. Deciding the priority
     once, here, is the point of the whole thing: without it every feature
     that wants to say something writes over whatever the last one said.

       1  transient   what the player just did. Wins, briefly.
       2  referral    D.3 contextual referral - the section of the induction
                      pack that covers what is on screen. NOTHING WRITES
                      THIS YET. Part D has never been built, so the slot is
                      a hook and not a feature: it exists so that when the
                      induction pack lands it has a defined place in the
                      priority, rather than a fight with the ambient line.
       3  ambient     what the terminal is looking at.

     setStatus is the only writer of #sb-msg, and each level has exactly one
     owner: transient is written by the handlers for player actions, ambient
     by drawStatus, referral by nobody. Two writers on one level is how a
     status bar turns into a race. */
  const STATUS = { transient: "", referral: "", ambient: "" };
  let statusTimer = null, screen = "sit";

  function setStatus(text, level) {
    const k = level === "transient" || level === "referral" ? level : "ambient";
    STATUS[k] = text || "";
    if (k === "transient") {
      clearTimeout(statusTimer);
      /* setTimeout is absent in no browser, but a headless harness may run
         without a live timer queue; the line simply stays up if so. */
      if (typeof setTimeout === "function")
        statusTimer = setTimeout(() => { STATUS.transient = ""; paintStatus(); }, 4500);
    }
    paintStatus();
  }

  function paintStatus() {
    const m = $("#sb-msg");
    if (!m) return;
    m.textContent = STATUS.transient || STATUS.referral || STATUS.ambient;
    m.classList.toggle("live", !!STATUS.transient);
  }

  /* what the current screen is for, plus the one live legislative fact that
     screen is about. Derived, never stored. */
  const SCREEN_NOTE = {
    sit:  "One decision, then the House rises",
    gov:  "Coalition, order paper and the whip",
    cham: "280 seats \u00b7 a bill needs 141, and a dual bill needs 21 of the functional 40",
    orb:  "Thirty-four habitats by altitude band and closure",
    pap:  "Instruments in force, and the register of what has been done",
    cx:   "Public reference \u00b7 attestation is a political act",
    log:  "Every decision this government has taken"
  };

  function ambient() {
    const note = SCREEN_NOTE[screen] || "";
    if (screen !== "gov" && screen !== "cham") return note;
    const id = Focus.selected("gov-bills");
    const b = (C.bills || []).find(x => x.id === id);
    if (!b) return note;
    return b.title + " \u2014 " + (b.dualMajority ? "dual test applies" : "simple majority");
  }

  /* ---------- cues ----------
     The ONLY place in this file that names the audio bus, apart from one
     delegated listener in boot(). Audio follows actions and outcomes; see
     the header of js/audio.js for why a draw function may never reach here. */
  function cue(name) { if (typeof Sound !== "undefined") Sound.play(name); }

  /* Called after anything that moved the game on. A government falls once,
     so the knell is edge-triggered rather than drawn from the current state
     - which is also why this cannot live in drawStatus. */
  let fallen = false;
  function afterAction() {
    const loss = Engine.checkLoss(st, C);
    if (loss.lost && !fallen) {
      fallen = true;
      cue("knell");
      setStatus("The government has fallen \u2014 " + loss.reason, "transient");
    } else if (!loss.lost) fallen = false;
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
        <div class="plab" data-tip="scarcity">${m.label}<em>${m.unit}</em></div>
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

    let h = "<thead><tr><th>Party</th><th class='n' data-tip='seats'>Seats</th>" +
      "<th class='n' data-tip='loyalty'>Loy</th></tr></thead><tbody>";
    st.coalition.forEach(id => {
      h += `<tr><td>${mark(id)}${pn(id)} ${id === st.playerParty ? "<span class='flag' data-tip='gov'>GOV</span>" : ""}</td>` +
           `<td class="n">${Engine.partyTotal(st, id)}</td><td class="n">${id === st.playerParty ? "&mdash;" : st.parties[id].loyalty}</td></tr>`;
    });
    st.confidenceSupply.forEach(id => {
      h += `<tr><td>${mark(id)}${pn(id)} <span class="flag" data-tip="cs">C&amp;S</span></td>` +
           `<td class="n">${Engine.partyTotal(st, id)}</td><td class="n">${st.parties[id].loyalty}</td></tr>`;
    });
    h += "</tbody>";
    $("#gov-coalition").innerHTML = h;
    $("#gov-margin").innerHTML = conf - maj === 0
      ? "Working majority of nil. Confidence carries on the exact number."
      : `Working majority of ${conf - maj}. Majority is ${maj}.`;

    let ch = "<thead><tr><th>Current</th><th class='n' data-tip='mps'>MPs</th>" +
      "<th class='n' data-tip='loyalty'>Loy</th></tr></thead><tbody>";
    C.currents.filter(c => c.party === st.playerParty).forEach(c => {
      const s = st.currents[c.id];
      ch += `<tr class="${s.loyalty < 20 ? "warn" : ""}"><td>${c.name}</td><td class="n">${s.members}</td><td class="n">${s.loyalty}</td></tr>`;
    });
    $("#gov-currents").innerHTML = ch + "</tbody>";

    /* WHICH BILL IS OPEN. This used to be the string "divergence", hard
       coded, so the order paper marked the same row for the whole of a
       game however many other bills you opened. The renderer asks the
       selection store, and the store asks content for its default. */
    const sel = Focus.selected("gov-bills");
    let bh = "<thead><tr><th>Bill</th><th data-tip='stage'>Stage</th>" +
      "<th class='n' data-tip='popular'>Pop.</th><th class='n' data-tip='functional'>Func.</th>" +
      "<th data-tip='dual'>Test</th></tr></thead><tbody>";
    C.bills.forEach(b => {
      const bs = st.bills[b.id];
      const d = Engine.division(st, C, b.id);
      const dead = bs.dead || bs.stage === "withdrawn";
      bh += `<tr class="${b.id === sel ? "sel" : ""}" data-bill="${b.id}" style="cursor:pointer">` +
        `<td>${b.title.replace(/ Bill$/, "")}</td><td>${dead ? "Withdrawn" : bs.stage.replace(/_/g, " ")}</td>` +
        `<td class="n">${d.popular.aye}</td><td class="n">${b.dualMajority ? d.functional.aye : "&mdash;"}</td>` +
        `<td><span class="flag ${b.dualMajority ? "bad" : ""}" data-tip="${b.dualMajority ? "dual" : "simple"}">` +
        `${b.dualMajority ? "DUAL" : "SIMPLE"}</span></td></tr>`;
    });
    $("#gov-bills").innerHTML = bh + "</tbody>";
    /* ONE activation path. A click and an Enter both land in
       Focus.activate, which sets the selection, redraws, and leaves
       focus on the row it just opened. */
    $("#gov-bills").querySelectorAll("tr[data-bill]").forEach(tr =>
      tr.addEventListener("click", () => Focus.activate("gov-bills", tr.dataset.bill)));

    drawBill(sel);

    const meters = [
      ["Party loyalty", "party_loyalty", 15], ["Public standing", "public_standing", 20],
      ["Consumables", "consumables", 25], ["Thermal margin", "thermal_margin", 20],
      ["Treasury", "treasury", 15]
    ];
    $("#gov-meters").innerHTML = meters.map(([lab, k, warn]) => {
      const v = st.scalars[k];
      const cls = v <= warn ? "warn" : v >= 65 ? "good" : "";
      return `<div class="meterrow"><label data-tip="${k}">${lab}</label>` +
        `<div class="meter ${cls}"><i style="width:${v}%"></i></div><output>${v}</output></div>`;
    }).join("");

    /* the ledger: signed, permanent, and shown exactly */
    const partners = st.coalition.concat(st.confidenceSupply).filter(p => p !== st.playerParty);
    $("#gov-ledger").innerHTML =
      "<thead><tr><th>Partner</th><th class='n' data-tip='ledger'>Ledger</th>" +
      "<th class='n' data-tip='loyalty'>Loy</th></tr></thead><tbody>" +
      partners.map(id => {
        const c = st.capital[id] || 0;
        const cls = c > 0 ? "good" : c < 0 ? "bad" : "";
        return `<tr><td>${mark(id)}${pn(id)}</td>` +
          `<td class="n"><span class="flag ${cls}" data-tip="ledger">${c > 0 ? "+" : ""}${c}</span></td>` +
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
        `${b.priority ? " <span class='flag' data-tip='priority'>PRIORITY</span>" : ""}</td>` +
        `<td class="n">${b.owner && b.owner !== st.playerParty ? "+" + (b.priority ? 3 : 2) : "&mdash;"}</td>` +
        `<td class="n"><button class="btn slotbtn" data-slot="${b.id}"${left ? "" : " disabled"}>Grant</button></td></tr>`
      ).join("")}</tbody></table>`;
    $("#gov-slots").querySelectorAll(".slotbtn").forEach(btn =>
      btn.addEventListener("click", () => {
        const b = C.bills.find(x => x.id === btn.dataset.slot);
        Engine.grantSlot(st, C, btn.dataset.slot);
        cue("stamp"); if (typeof Wait !== "undefined") Wait.brief(240);
        setStatus("Order paper time granted to " + (b ? b.title : btn.dataset.slot) +
                  " \u00b7 " + (st.slots.total - st.slots.used) + " of " +
                  st.slots.total + " slots left", "transient");
        drawAll(); afterAction();
      }));

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
      return `<tr data-si="${si.id}" class="${s.inForce ? "inforce" : ""}">
        <td>${si.title.replace(/ Order 2287$/, "")}<div class="note">${si.number} &middot; ${si.author.replace(/_/g,' ')}</div></td>
        <td class="n"><span class="flag ${cls}" data-tip="${s.inForce ? "prayer" : "instrument"}">${status}</span></td>
        <td class="n">${s.made ? "" :
          `<button class="btn sibtn" data-make="${si.id}"${chk.ok ? "" : " disabled title='" + esc(chk.reason) + "'"}>Make</button>`}
          ${s.inForce && window > 0 ? `<button class="btn sibtn" data-pray="${si.id}">Pray</button>` : ""}</td>
      </tr>`;
    }).join("");
    $("#gov-si").querySelectorAll("[data-make]").forEach(b => b.addEventListener("click", () => {
      const si = (C.instruments || []).find(x => x.id === b.dataset.make);
      const r = Engine.makeInstrument(st, C, b.dataset.make);
      if (!r.ok) { cue("deny"); setStatus(r.reason, "transient"); alert(r.reason); }
      else {
        cue("stamp"); if (typeof Wait !== "undefined") Wait.brief(320);
        setStatus((si ? si.number : b.dataset.make) + " made \u2014 in force at once, and prayable",
                  "transient");
      }
      drawAll(); afterAction();
    }));
    $("#gov-si").querySelectorAll("[data-pray]").forEach(b => b.addEventListener("click", () => {
      const f = Engine.prayerForecast(st, C, b.dataset.pray);
      if (!confirm(`Pray against this order?\n\nForecast ${f.aye} of ${f.total}, needs ${f.need}.\n` +
        (f.carries ? "The prayer would carry and the order would be annulled." :
                     "The prayer would be defeated and the order would stand."))) return;
      Engine.prayAgainst(st, C, b.dataset.pray);
      cue(f.carries ? "aye" : "nay"); if (typeof Wait !== "undefined") Wait.brief(320);
      setStatus("Prayer against " + b.dataset.pray.replace(/_/g, " ") +
                (f.carries ? " carried \u2014 the order is annulled"
                           : " defeated \u2014 the order stands"), "transient");
      drawAll(); afterAction();
    }));

    /* ---- cabinet ---- */
    $("#gov-cabinet").innerHTML = (C.cabinet || []).map(p => {
      const s = st.cabinet[p.id];
      const ch = s.holder ? C.characterById[s.holder] : null;
      return `<tr class="${s.holder ? "" : "vacant"}">
        <td>${p.name}${p.senior ? " <span class='flag' data-tip='senior'>SENIOR</span>" : ""}</td>
        <td>${s.holder ? (ch ? ch.name.replace(/^Rt\. Hon\. /, "") : s.holder.replace(/_/g," "))
                       : "<span class='flag bad' data-tip='vacant'>VACANT</span>"}</td>
        <td class="n">${s.party ? mark(s.party) : ""}</td></tr>`;
    }).join("");

    $("#gov-pres").innerHTML =
      `<div class="kv"><dt>Incumbent</dt><dd>${C.characterById.tenaya.name.replace("President ", "")}</dd>` +
      `<dt>Relations</dt><dd>${st.president.relationship}</dd></div>` +
      `<div class="rulehead">Reserve powers</div>` +
      `<table><tbody>${st.president.powers.map(p =>
        `<tr><td style="text-transform:capitalize">${p}</td><td class="n"><span class="flag ${st.president.relationship < 35 ? "bad" : ""}" data-tip="live">${st.president.relationship < 35 ? "LIVE" : "DORMANT"}</span></td></tr>`
      ).join("")}</tbody></table>`;

    $("#gov-wire").innerHTML = st.wire.length
      ? st.wire.slice(0, 8).map(w => `<div class="post"><div class="meta">SITTING ${w.sitting}</div><p>${w.text}</p></div>`).join("")
      : `<div class="pbody"><div class="note">No traffic this session.</div></div>`;
  }

  function drawBill(id) {
    const b = C.billById[id], bs = st.bills[id], d = Engine.division(st, C, id);
    const det = $("#bill-detail");
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
      /* THE DIVISION RESOLVES HERE, ON THE CLICK, BEFORE ANYTHING IS
         SHOWN. Engine.divide pays the whips, moves the stage, logs it and
         puts the bill in front of the President; the dialog that follows
         reads out numbers that are already final. That is deliberate and
         it is what makes the whole thing safe to skip: there is no state
         left inside the animation to lose. Presentation only - the
         arithmetic is untouched. */
      const out = Engine.divide(st, C, id) || {};
      const r = out.result || {};
      divisionTheatre(b, out).then(() => {
        /* A dual bill can carry the House and still fall, which is the
           whole argument of the game, so the line names BOTH tests and not
           just the verdict. Assent is a third gate again: carrying sends it
           to the President, who may refer it rather than sign. */
        const tally = (r.popular ? " \u00b7 popular " + r.popular.aye + "/" + r.popular.need : "") +
          (b.dualMajority && r.functional
            ? " \u00b7 functional " + r.functional.aye + "/" + r.functional.need : "");
        setStatus(b.title + " \u2014 " +
                  (!r.carries ? "not carried"
                    : out.assent && out.assent.referred ? "carried, and referred for review"
                    : "carried") + tally, "transient");
        drawAll(); afterAction();
      });
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
      `<th class="n" data-tip="whip">Rate</th><th data-tip="whip">Move</th></tr></thead><tbody>${rows}</tbody></table>` +
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

  /* ---------- the division, read out ----------

     §4.6.7: both majorities on screen throughout. A dual bill can carry
     the popular benches and fall on the functional forty, and a player
     who only ever sees the verdict never learns that. So the two columns
     fill side by side, and the functional one fills SLOWER - it is the
     smaller number, it is the one that kills bills, and it should be the
     one you are still watching when the popular column has finished.

     Every number here comes out of the result Engine.divide already
     returned. Nothing is recomputed and nothing is rounded again. */
  function divisionTheatre(b, out) {
    const r = out.result || {};
    const rows = (r.rows || []).filter(x => x.popularSeats + x.functionalSeats > 0);
    if (!rows.length || typeof Wait === "undefined") return Promise.resolve();

    const dual = !!b.dualMajority;
    let popRun = 0, funcRun = 0, shown = 0;
    let tbody = null, popCell = null, funcCell = null, verdict = null;

    const paint = () => {
      if (!popCell) return;
      popCell.textContent = popRun + " / " + r.popular.need;
      popCell.className = "n " + (popRun >= r.popular.need ? "ok" : "");
      funcCell.textContent = dual ? funcRun + " / " + r.functional.need : "\u2014";
      funcCell.className = "n " + (dual && funcRun >= r.functional.need ? "ok" : "");
    };

    const steps = [];

    /* The bell. The same bell the government hears when it falls, which is
       not an economy: a division is the thing that can end you. */
    steps.push({
      label: "The House divides",
      ms: 300,
      run: () => cue("knell"),
      /* TIER 3. Only from a flag content set, never from a roll. Nothing
         in content sets this yet; that is the point of it being a hook. */
      stall: { flag: "division_stalled",
               label: "The Clerk is recounting the functional bench",
               ms: 1100 }
    });

    rows.forEach((row, i) => steps.push({
      label: pn(row.party) + " reports",
      ms: 105,
      run: () => {
        popRun += row.popularAye;
        /* THE FUNCTIONAL COLUMN LAGS, one party behind every second
           report, and is squared off by the catch-up step below. */
        if (i % 2 === 1 || i === rows.length - 1) {
          while (shown <= i) { funcRun += rows[shown].functionalAye; shown++; }
        }
        if (tbody) tbody.insertAdjacentHTML("beforeend",
          `<tr><td>${mark(row.party)}${pn(row.party)}</td>` +
          `<td class="n">${row.popularAye}<i>/${row.popularSeats}</i></td>` +
          `<td class="n">${dual ? row.functionalAye + "<i>/" + row.functionalSeats + "</i>" : "\u2014"}</td></tr>`);
        paint();
      }
    }));

    steps.push({
      label: dual ? "The functional benches are counted separately" : "The count is complete",
      ms: 420,
      run: () => {
        /* Squared off against the engine's own totals rather than the
           running sum, so a skip can never leave a different number on
           screen from the one that resolved. */
        popRun = r.popular.aye;
        while (shown < rows.length) { funcRun += rows[shown].functionalAye; shown++; }
        funcRun = r.functional.aye;
        paint();
      }
    });

    steps.push({
      label: "The result",
      ms: 520,
      run: () => {
        cue(r.carries ? "aye" : "nay");
        if (!verdict) return;
        verdict.textContent = r.carries
          ? (out.assent && out.assent.referred
              ? "Carried \u2014 and referred for constitutional review"
              : "Carried")
          : (dual && r.popular.carries && !r.functional.carries
              ? "Not carried \u2014 the House was with you and the functional bench was not"
              : "Not carried");
        verdict.className = "wait-verdict " + (r.carries ? "ok" : "bad");
      }
    });

    return Wait.run({
      title: "Division",
      sub: b.title,
      /* This module asks the state; Wait never sees a flag. */
      stalled: f => !!(st.flags && st.flags[f]),
      steps: steps,
      mount: el => {
        el.innerHTML =
          `<table class="divtally"><thead><tr><th>Party</th>` +
          `<th class="n">Popular</th><th class="n">Functional</th></tr></thead>` +
          `<tbody></tbody><tfoot><tr><th>Running</th>` +
          `<th class="n" id="dv-pop">0 / ${r.popular.need}</th>` +
          `<th class="n" id="dv-func">${dual ? "0 / " + r.functional.need : "\u2014"}</th>` +
          `</tr></tfoot></table><div class="wait-verdict" id="dv-verdict">&nbsp;</div>`;
        tbody = el.querySelector("tbody");
        popCell = el.querySelector("#dv-pop");
        funcCell = el.querySelector("#dv-func");
        verdict = el.querySelector("#dv-verdict");
      }
    });
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

  /* ---------- text arriving ----------

     STREAMING IS AN ACTION, NOT A RENDER. drawSitting() always puts the
     finished text on the page, complete and silent; these two functions
     are called by the handlers for choosing, rising and arriving, and by
     boot() once for the decision you open on. Nothing reachable from
     drawAll() can get here, which is what keeps js/audio.js's hard rule
     true - a tab switch would otherwise retype the paragraph, with sound,
     every time you looked away and back.

     `shown` is session memory, not save state: it describes what this
     player has watched arrive, not anything about the world. */
  const shown = Object.create(null);

  function revealNode(el, block) {
    if (typeof Stream === "undefined" || !el) return;
    Stream.reveal(el, block);
  }
  function reveal() {
    const e = currentEvent;
    if (!e || shown[e.id]) return;
    shown[e.id] = true;
    revealNode($("#sitting-prose"), e);
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
      $("#btn-advance").addEventListener("click", () => {
        Engine.advance(st, C); currentEvent = null; lastResult = null;
        setStatus("The House rises \u00b7 sitting " + st.sitting, "transient");
        drawAll(); saved(); afterAction(); reveal();
      });
      return;
    }
    const e = currentEvent;
    const spk = e.speaker ? C.characterById[e.speaker] : null;
    $("#sitting-hdr").textContent = e.title;
    box.innerHTML =
      plate(e.image) +
      (spk ? portrait(spk) + `<div class="rulehead">${spk.name} &mdash; ${spk.role}</div>` : "") +
      `<div class="prose" id="sitting-prose">${annotate(e.body.split(/\n\n/).map(p => `<p>${p.replace(/\n/g, " ")}</p>`).join(""))}</div>` +
      `<div style="clear:both"></div>` +
      (lastResult
        ? `<div class="decl" style="margin-top:8px"><b>Outcome</b><br><span id="sitting-outcome">${lastResult}</span></div>
           <div class="btnrow"><button class="btn" id="btn-advance">Rise until the next sitting</button></div>`
        : `<div class="rulehead">Decision</div>` +
          e.choices.map((c, i) => `<div class="btnrow" style="margin-top:3px"><button class="btn choice" data-i="${i}" style="text-align:left">${c.label}</button></div>`).join(""));

    if (lastResult) {
      bindGlossary(box);
      $("#btn-advance").addEventListener("click", () => {
        Engine.advance(st, C); currentEvent = null; lastResult = null;
        setStatus("The House rises \u00b7 sitting " + st.sitting, "transient");
        drawAll(); saved(); afterAction(); reveal();
      });
    } else {
      bindGlossary(box);
      box.querySelectorAll(".choice").forEach(b => b.addEventListener("click", () => {
        lastResult = Engine.choose(st, C, e, +b.dataset.i) || "Noted.";
        cue("stamp");
        setStatus(e.title + " \u2014 " + lastResult.replace(/\s+/g, " ").slice(0, 120), "transient");
        saved();
        drawAll(); afterAction();
        /* The outcome is new text, so it arrives the way new text arrives.
           The body above it does not retype: you have read that already. */
        revealNode($("#sitting-outcome"), e);
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

    /* No outline. A stroke on a 3px mark is a third of its area, so 280 of
       them read as a grey mesh with colour trapped inside it. Bare fills
       let the benches read as blocks of party at a glance, which is the
       only thing this diagram is for. */
    const glyph = (x, y, s) => {
      const st_ = ` class="sg" fill="${s.c}"`;
      if (s.t === "d") return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4"${st_}/>`;
      if (s.t === "l") return `<rect x="${(x-3).toFixed(1)}" y="${(y-3).toFixed(1)}" width="6" height="6"${st_}/>`;
      return `<path d="M${x.toFixed(1)} ${(y-3.8).toFixed(1)}L${(x+3.6).toFixed(1)} ${(y+2.7).toFixed(1)}` +
             `L${(x-3.6).toFixed(1)} ${(y+2.7).toFixed(1)}Z"${st_}/>`;
    };

    /* PARTIES STACK HORIZONTALLY. Seats fill column by column, five deep,
       so a party occupies a contiguous block of columns and you read the
       chamber left to right as party, party, party — which is how the
       benches actually work. Filling row-major instead made each party a
       horizontal band and stacked the parties vertically, which reads as a
       bar chart lying on its side rather than as a chamber. */
    const ROWS = 5, CW = 9, RH = 10;
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
      let out = "", COLS = 5, CS = 11, RS = 10.5;
      seats.forEach((s, i) => {
        out += glyph(x0 + (i % COLS) * CS, yTop + Math.floor(i / COLS) * RS, s);
      });
      return out;
    }

    /* THE CHAIR. One constituency in content carries `speaker:true`; the
       member for it takes the Chair. The glyph is the same district circle
       as everyone else's, in the colour of whichever party holds that seat
       on the roll — impartial in the House, partisan on the map, which is
       the true state of affairs. Drawing it as a piece of furniture said
       the chamber contained a chair; drawing it as a member says the
       chamber contains a member who is not on either bench.

       The seat is moved out of its bench rather than added, so the plan
       still shows 280 marks for 280 seats. */
    const govN = gov.length, oppN = opp.length, crossN = cross.length;
    const spkSeat = (C.constituencies || []).find(k => k.speaker);
    let chair = null, chairParty = null, chairName = spkSeat ? spkSeat.member : null;
    if (spkSeat) {
      const held = Engine.seatsFor(st, spkSeat.id).held;
      chairParty = Object.keys(held).sort((a, b) => held[b] - held[a])[0] || null;
      const ch = (C.characters || []).find(c => c.seat === spkSeat.name);
      if (ch) chairName = ch.name;
      const take = arr => {
        const i = arr.findIndex(g => g.p === chairParty && g.t === "d");
        return i >= 0 ? arr.splice(i, 1)[0] : null;
      };
      chair = take(gov) || take(opp);
    }

    /* Everything is derived from the seat counts, so the diagram tightens
       when a party crosses the floor rather than leaving a hole. */
    const govCols = Math.max(1, cols(gov.length));
    const oppCols = Math.max(1, cols(opp.length));
    const benchW = Math.max(govCols, oppCols) * CW;
    const crossRows = Math.max(1, Math.ceil(cross.length / 5));

    const X0 = 66;                                    // clear of the Chair
    /* THE FLOOR IS EMPTY. There was a table of the House with the mace on
       it and two dashed sword lines, and none of it carried information:
       the diagram already says who is in government by which side of the
       gap they sit on. The gap is now narrow enough to read as facing
       benches rather than as two unrelated blocks. */
    const GAP = 17;                                   // floor to front bench
    const FLOOR = 24 + (ROWS - 1) * RH + GAP;   // headroom for the label
    const govFront = FLOOR - GAP, oppFront = FLOOR + GAP;
    const govTop = govFront - (ROWS - 1) * RH;
    const oppBot = oppFront + (ROWS - 1) * RH;

    const CX = X0 + benchW / 2 - CW / 2;              // bench centre

    const crossX = X0 + benchW + 30;
    const crossTop = FLOOR - ((crossRows - 1) * 10.5) / 2;
    const crossBot = crossTop + (crossRows - 1) * 10.5;

    const W = crossX + 5 * 11 + 14;
    const H = Math.max(oppBot + 26, crossBot + 26) + 8;
    /* An inline <svg> with a viewBox and no width defaults to the width of
       its container, so shrinking the coordinate space only magnified the
       drawing. Sizing it at 1:1 is what actually makes it smaller; the CSS
       lets it scale down again on a narrow screen and no further. */
    const svg = document.getElementById("chamber").ownerSVGElement ||
                document.getElementById("chamber").parentNode;
    svg.setAttribute("viewBox", `0 0 ${Math.round(W)} ${Math.round(H)}`);
    /* 1.35, not 1: at true 1:1 a 9px label is 9px and the whole House is
       450px wide in a 1280px panel, which reads as an afterthought rather
       than as the diagram the tab is named for. */
    svg.setAttribute("width", Math.round(W * 1.35));
    svg.setAttribute("height", Math.round(H * 1.35));

    const label = (x, y, t, cls) =>
      `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" text-anchor="middle" class="chlab${cls ? " " + cls : ""}">${t}</text>`;

    $("#chamber").innerHTML =
      /* the Chair holds the end, one member and not a piece of furniture */
      (chair ? glyph(30, FLOOR, chair) : "") +
      label(30, FLOOR + 17, "SPEAKER") +
      bench(gov, X0, govFront, -1) +
      bench(opp, X0, oppFront, +1) +
      crossbench(cross, crossX, crossTop) +
      label(CX, govTop - 12, "GOVERNMENT") +
      label(CX, oppBot + 22, "OPPOSITION") +
      label(crossX + 30, crossTop - 14, "THE BENCH") +
      label(crossX + 30, crossBot + 22, "functional tier", "sub");

    const seatLine = (n, of) => `${n}<span class="of">/${of}</span>`;
    $("#chamber-tally").innerHTML =
      `<span class="ct gov" data-tip="government">Government ${seatLine(govN, Engine.popularTotal(st))}</span>` +
      `<span class="ct opp" data-tip="opposition">Opposition ${seatLine(oppN, Engine.popularTotal(st))}</span>` +
      `<span class="ct cross" data-tip="functional">Functional ${crossN}</span>` +
      `<span class="ct" data-tip="majority">Majority ${Engine.majority(st)}</span>` +
      (chairName ? `<span class="ct" data-tip="speaker">Speaker ${chairParty ? mark(chairParty) : ""}` +
                   `${esc(chairName)}<i class="of"> ${esc(spkSeat.name)}</i></span>` : "");

    $("#chamber-legend").innerHTML = C.parties.map(p =>
      `<span>${mark(p.id)}${p.name} ${Engine.partyTotal(st, p.id)}` +
      `${govIds.includes(p.id) ? ' <i class="ingov">gov</i>' : ""}</span>`).join("");

    $("#comp-table").innerHTML =
      "<thead><tr><th>Party</th><th class='n' data-tip='district'>Dist</th>" +
      "<th class='n' data-tip='list'>List</th><th class='n' data-tip='functional'>Func</th>" +
      "<th class='n' data-tip='seats'>Tot</th></tr></thead><tbody>" +
      C.parties.map(p => { const s = st.parties[p.id].seats;
        return `<tr${govIds.includes(p.id) ? ' class="govrow"' : ""}><td>${sw(p.colour)}${p.name}</td>` +
               `<td class="n">${s.district}</td><td class="n">${s.list}</td>` +
               `<td class="n">${s.functional}</td><td class="n"><b>${Engine.partyTotal(st, p.id)}</b></td></tr>`;
      }).join("") + "</tbody>";
  }

  /* ---------- orbit ---------- */
  /* Three levels - band, station, constituency - and three panels, one per
     level. The schematic places a station in its band; the list names every
     station at once and never scrolls; the seat table gives the selected
     station's constituencies with the member who sits for each. An earlier
     pass folded the third level into the second as a dropdown, which meant
     the panel headed "Stations" was sometimes a list of constituencies and
     the one thing that never varies - the roster of thirty-four - moved
     every time you clicked. */
  function drawOrbit() {
    /* No hardcoded content id here: the engine names no station and neither
       should the renderer. */
    const selId = Focus.selected("orbit-table");
    $("#orbit-chart").innerHTML = OrbitChart.render(st, C, selId);
    $("#orbit-key").innerHTML = OrbitChart.key();
    /* The schematic's chips select a station without stealing focus: the
       player clicked a chip, not a row, and dragging their place into a
       table they were not looking at is not help. */
    $("#orbit-chart").querySelectorAll("[data-station]").forEach(n =>
      n.addEventListener("click", () => Focus.set("orbit-table", n.dataset.station)));

    const seats = C.stations.reduce((n, s0) => n + s0.seats, 0);
    $("#orbit-count").textContent = `${C.stations.length} \u00b7 ${seats} seats`;

    $("#orbit-table").innerHTML =
      "<thead><tr><th>Station</th><th class='n'>Seats</th></tr></thead><tbody>" +
      C.stations.map(s0 => {
        const s = st.stations[s0.id];
        return `<tr data-station="${s.id}"${s.id === selId ? ' class="sel"' : ""}` +
          ` style="cursor:pointer">` +
          `<td><b>${esc(s.name)}</b><i class="sub">${esc(s.band)}</i></td>` +
          `<td class="n">${s.seats}</td></tr>`;
      }).join("") + "</tbody>";
    $("#orbit-table").querySelectorAll("tr[data-station]").forEach(tr =>
      tr.addEventListener("click", () => Focus.activate("orbit-table", tr.dataset.station)));

    drawStation(selId);
    drawSeats(selId);
  }

  /* The orbit region's activate. A player action, not a redraw: it may
     make a sound and it may write the status line. drawOrbit(), which it
     calls, may do neither. */
  function pickStation(id) {
    drawStation(id); drawSeats(id); drawOrbit();
    const s = st.stations[id];
    if (s) setStatus(s.name + " \u00b7 " + s.band + " band \u00b7 " + s.seats +
                     (s.seats === 1 ? " seat" : " seats"), "transient");
  }

  /* population-weighted mean of a station's constituency ratios */
  function stationRatio(sid) {
    const ap = Engine.apportionment(C);
    const mine = (C.constituencies || []).filter(k => k.station === sid);
    if (!mine.length) return 1;
    const seats = mine.reduce((n, k) => n + k.magnitude, 0);
    return mine.reduce((n, k) => n + ap[k.id] * k.magnitude, 0) / seats;
  }

  /* The station dossier. The seats live in their own panel, which is also
     what stops this one changing height with the seat count. */
  function drawStation(id) {
    const s = st.stations[id];
    const d = $("#station-detail");
    $("#station-hdr").textContent = s.name;
    /* innerHTML rather than textContent so the form and the band can each
       carry their own explanation; both are encoded in the schematic next
       door and neither is obvious from the word. */
    $("#station-sub").innerHTML =
      esc(s.type === "bundled" ? `bundled, ${s.settlements} settlements` : s.type) +
      ` \u00b7 <span data-tip="form">${esc(s.form)}</span>` +
      ` \u00b7 <span data-tip="band">${esc(s.band)} band</span>`;
    const r = stationRatio(s.id);
    /* A stat strip rather than eight rows of label over value. The same
       figures, a quarter of the height, and the ones that carry an argument
       (closure, apportionment) get the emphasis. */
    d.innerHTML =
      `<div class="ostats">
        <span><b>${s.population.toLocaleString()}</b><i>population</i></span>
        <span><b>${s.seats}</b><i>seats</i></span>
        <span><b>${s.closure.toFixed(2)}</b><i>closure</i></span>
        <span><b>${r.toFixed(2)}</b><i>${r > 1.15 ? "over-represented" :
            r < 0.85 ? "under-represented" : "near parity"}</i></span>
        <span><b>${s.suspended.toLocaleString()}</b><i>suspended, non-voting</i></span>
        <span><b>${(s.attested * 100).toFixed(1)}%</b><i>attested</i></span>
      </div>
      ${s.composition ? `<div class="compbar">${["biological","emulation","uplift","synthetic"].map(k =>
        s.composition[k] ? `<i class="c-${k}" style="width:${s.composition[k]*100}%" title="${k} ${(s.composition[k]*100).toFixed(0)}%"></i>` : ""
      ).join("")}</div>
      <div class="note">biological ${(s.composition.biological*100).toFixed(0)}% &middot;
        emulation ${(s.composition.emulation*100).toFixed(0)}% &middot;
        uplift ${(s.composition.uplift*100).toFixed(0)}% &middot;
        synthetic ${(s.composition.synthetic*100).toFixed(0)}%</div>` : ""}
      <div class="rulehead">Material interest</div><div class="note">${esc(s.material_interest.join(" \u00b7 "))}</div>
      <div class="rulehead">Dependency</div><div class="note">${esc(s.dependency)}</div>
      <div class="rulehead">Grievance</div><div class="note">${esc(s.grievance)}</div>`;
  }

  /* Every constituency a station returns, with the member who sits for it
     and who holds it NOW.

     Holders come from st.roll, not from the authored `held` in content.
     Content is the state of the map at the opening of play; the roll is
     what by-elections, floor-crossings and the general election have made
     of it since, and it is the only thing the chamber arithmetic reads.
     Showing the authored value would quietly contradict the chamber the
     moment a member crossed the floor.

     The member comes from the roster where a roster character sits for the
     seat, and otherwise from the seat's own `member`. A backbencher's name
     is not a character: it is the difference between "Coldwater One, CU"
     and somebody losing their job.

     A vacant seat is shown as vacant rather than omitted. The chamber stays
     280 and the majority stays 141, so an empty seat is a vote the
     government does not have, and the map should say so. */
  function drawSeats(sid) {
    const s = st.stations[sid];
    const mine = (C.constituencies || []).filter(k => k.station === sid);
    $("#cons-hdr").textContent = s.name;
    $("#cons-sub").textContent = mine.length
      ? `${mine.length} ${mine.length === 1 ? "seat" : "seats"} \u00b7 first past the post`
      : "no district seat";
    if (!mine.length) {
      $("#cons-table").innerHTML = `<tbody><tr><td class="note">` +
        `No constituency returns this station directly. Its electors vote in ` +
        `the list tier, and in the functional tier where they hold a licence.` +
        `</td></tr></tbody>`;
      return;
    }
    const ap = Engine.apportionment(C);
    $("#cons-table").innerHTML =
      "<thead><tr><th>Constituency and member</th><th class='n'>Electors</th>" +
      "<th class='n' data-tip='ratio'>Ratio</th><th class='n' data-tip='held'>Held</th>" +
      "</tr></thead><tbody>" +
      mine.map(k => {
        const r = Engine.seatsFor(st, k.id);
        const held = Object.keys(r.held).sort((a, b) => r.held[b] - r.held[a]);
        const ch = (C.characters || []).find(c => c.seat === k.name);
        /* The Chair first — it is the seat's office — then the member's. */
        const off = !r.vacant && ch && OFFICE[ch.office];
        const badge = k.speaker
          ? ` <i class="chair">Speaker</i>`
          : off ? ` <i class="office o-${off[1]}">${off[0]}</i>` : "";
        return `<tr><td><b>${esc(k.name)}</b>${badge}` +
          `<i class="mp">${r.vacant
            ? `<span class="hn vac">vacant</span>`
            : esc(ch ? ch.name : (k.member
                ? (/MP$/.test(k.member) ? k.member : k.member + " MP")
                : "\u2014"))}` +
            `${!r.vacant && ch && ch.role ? ` <span class="det">${esc(ch.role)}</span>` : ""}</i></td>` +
          `<td class="n">${k.electorate.toLocaleString()}</td>` +
          `<td class="n">${ap[k.id].toFixed(2)}</td>` +
          `<td class="n">${held.map(pid => mark(pid)).join(" ")}</td></tr>`;
      }).join("") + "</tbody>";
  }

  /* The functional tier in full. Every seat here is held by a named party,
     so unlike the district list this one is complete. */
  function drawFunctional() {
    const F = C.functional || [];
    if (!F.length || !$("#func-table")) return;
    const FR = { licensure:"licence", corporate:"companies", union_bloc:"union bloc", residual:"residual" };
    $("#func-table").innerHTML =
      "<thead><tr><th>Constituency</th><th class='n' data-tip='functional'>Seats</th>" +
      "<th data-tip='held'>Held by</th></tr></thead><tbody>" +
      F.map(f => {
        const held = Object.keys(f.held || {}).sort((a, b) => f.held[b] - f.held[a]);
        /* i.sub is display:block, so both halves stay inside ONE of them and
           take a span each; two i.sub would put the franchise and the
           electorate on separate lines. */
        return `<tr><td><b>${f.name}</b><i class="sub">` +
          `<span data-tip="franchise">${FR[f.franchise] || f.franchise}</span>` +
          ` &middot; <span data-tip="electors">${f.electorate.toLocaleString()} electors</span></i></td>` +
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

  /* setStatus is exported so that Shell and, later, the induction pack can
     write the line without reaching into #sb-msg themselves. */
  return { boot, state: () => st, annotate, setStatus };
})();
