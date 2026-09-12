/* =============================================================
   SHELL — the frame around the game.

   Main menu, save slots, options. Everything here is about a
   session rather than about the Commonwealth: the engine and the
   UI neither know nor care that this file exists.

   Saves live in localStorage, which can be absent, full, or throw
   outright (private windows, blocked site data). Every access goes
   through read()/write() and degrades to an in-memory store, so a
   player with storage disabled still gets a playable game — they
   just lose slots when the tab closes, and the menu says so.

   Engine.save/Engine.load do the versioning. This file never
   inspects the shape of a state object; it only moves strings.
   ============================================================= */

const Shell = (function () {
  "use strict";

  const SLOTS = 4, KEY = n => "wm.slot." + n, OPTS = "wm.opts";
  let C = null, current = null, memory = {}, storageOK = true;

  /* ---------- storage that cannot throw ---------- */
  function read(k) {
    try { const v = localStorage.getItem(k); return v; }
    catch (e) { storageOK = false; return memory[k] == null ? null : memory[k]; }
  }
  function write(k, v) {
    try { localStorage.setItem(k, v); memory[k] = v; }
    catch (e) { storageOK = false; memory[k] = v; }
  }
  function drop(k) {
    try { localStorage.removeItem(k); } catch (e) { storageOK = false; }
    delete memory[k];
  }

  /* ---------- options ----------

     THE LINE BETWEEN THIS AND THE SAVE: anything describing the PLAYER
     lives here, in localStorage; anything describing the WORLD lives in
     the save. Mute, volumes and animation are facts about the person at
     the terminal and the machine they are at. Carry them in the save and
     importing a friend's game silences your speakers.

     Keys are flat rather than nested because stored options are merged
     over the defaults SHALLOWLY: one nested object written by an older
     build would replace the whole default and take its missing keys with
     it, and the failure would be a volume of undefined. */
  const DEFAULTS = {
    autosave: true, motion: true, confirmDestructive: true,
    mute: false, roomTone: true,
    gainUi: 0.55, gainRoom: 0.3, gainEvent: 0.7,
    /* Text arrives a character at a time. Normal by default: fast reads
       as a flicker rather than as typing, and the point of the effect is
       that the terminal is saying something to you. Anyone who finds it
       slow has a speed control one panel away. */
    stream: true, streamSpeed: "normal",
    /* The terminal explaining itself. On by default because the terminal
       is full of abbreviations that carry rules. */
    tips: true
  };
  /* MUTATED IN PLACE, NEVER REASSIGNED. `options` below hands this object
     out; reassigning it on load would leave every holder pointing at the
     defaults for the rest of the session. */
  const opts = Object.assign({}, DEFAULTS);
  function loadOpts() {
    let stored = {};
    try { stored = JSON.parse(read(OPTS) || "{}") || {}; } catch (e) { stored = {}; }
    Object.keys(opts).forEach(k => delete opts[k]);
    Object.assign(opts, DEFAULTS, stored);
    applyOpts();
  }
  function saveOpts() { write(OPTS, JSON.stringify(opts)); applyOpts(); }
  function applyOpts() {
    document.body.classList.toggle("no-motion", !opts.motion);
    /* Audio is optional at every level: the module may not be loaded, and
       if it is it may have no graph yet. Both are silence, not an error. */
    if (typeof Sound !== "undefined") Sound.apply();
  }
  function opt(k) { return opts[k]; }
  function setOpt(k, v) { opts[k] = v; saveOpts(); }

  /* ---------- slots ---------- */
  function slot(n) {
    const raw = read(KEY(n));
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function writeSlot(n, name, stateStr) {
    let sitting = 0, chapter = 1, date = "";
    try {
      const s = JSON.parse(stateStr);
      sitting = s.sitting || 0; chapter = s.chapter || 1; date = s.date || "";
    } catch (e) {}
    write(KEY(n), JSON.stringify({
      name: name, at: Date.now(), sitting: sitting, chapter: chapter,
      date: date, state: stateStr
    }));
  }
  function when(ms) {
    const d = new Date(ms);
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }) + " " +
           d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  /* ---------- the menu ---------- */
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- the standing board ----------

     THE TERMINAL WAS LEFT ON. The menu is a departmental status board
     that is already displaying the position when the player arrives, with
     a small panel of controls in the corner. The board is a DISPLAY and
     not a dashboard: nothing on it is clickable, nothing hovers, and
     js/tips.js is told to ignore everything inside #menu, because an
     explanation on a board nobody can act on is noise.

     EVERY VALUE IS DERIVED FROM THE OPENING STATE, never written down
     here, so the board cannot drift as content changes. Engine.newGame()
     is pure and repeatable - two calls serialise identically - so the
     board can build the opening position, read it, and never start it.
     Built once and cached: it is a hundred lines of construction plus a
     roll reconciliation, and the idle timer must not pay for it.

     It must never read as a game in progress, which is why it is headed
     as the standing position at the opening of the session and carries
     its own date line. */
  let opening = null;
  function openingState() {
    if (!opening && C && typeof Engine !== "undefined") {
      try { opening = Engine.newGame(C); } catch (e) { opening = null; }
    }
    return opening;
  }

  /* The bill before the House: the live bill that has got furthest, by
     the engine's own stage order. Not "the first in the file", which
     would be arbitrary and would move when content is reordered. */
  function billBeforeHouse(st) {
    const order = (typeof Engine !== "undefined" && Engine.STAGE_ORDER) || [];
    let best = null, bestAt = -1;
    (C.bills || []).forEach(b => {
      const bs = st.bills[b.id];
      if (!bs || bs.dead || bs.stage === "withdrawn") return;
      const at = order.indexOf(bs.stage);
      if (at > bestAt) { bestAt = at; best = b; }
    });
    return best;
  }

  /* THE TICKER IS THE ORDER PAPER, not press copy. A standing board in a
     government office shows the business before the House; it does not
     invent headlines. st.wire is empty at the opening state, so anything
     drawn from it would scroll nothing on a fresh install - which is
     exactly when the menu matters most. */
  function ticker(st) {
    const order = (typeof Engine !== "undefined" && Engine.STAGE_ORDER) || [];
    const out = [];
    (C.bills || []).forEach(b => {
      const bs = st.bills[b.id];
      if (!bs || bs.dead) return;
      const d = Engine.division(st, C, b.id);
      out.push(`${b.ref ? b.ref + " · " : ""}${b.title.toUpperCase()} — ` +
        `${String(bs.stage).replace(/_/g, " ")} · ` +
        (b.dualMajority ? "dual majority required" : "simple majority") +
        ` · ${d.popular.aye} of ${d.popular.need} on the popular benches`);
    });
    (C.instruments || []).forEach(si => {
      const s = st.instruments[si.id];
      if (s && s.inForce) out.push(`${si.number} — in force`);
    });
    if (!out.length) out.push("No business before the House.");
    return out;
  }

  function boardHTML() {
    const st = openingState();
    if (!st) return "";
    const maj = Engine.majority(st), conf = Engine.confidence(st);
    const bill = billBeforeHouse(st);
    const posts = ticker(st);

    const meters = [
      ["Party loyalty", "party_loyalty"], ["Public standing", "public_standing"],
      ["Consumables", "consumables"], ["Thermal margin", "thermal_margin"],
      ["Treasury", "treasury"]
    ].map(([lab, k]) => {
      const v = st.scalars[k];
      return `<div class="meterrow"><label>${lab}</label>` +
        `<div class="meter ${v <= 20 ? "warn" : v >= 65 ? "good" : ""}">` +
        `<i style="width:${v}%"></i></div><output>${v}</output></div>`;
    }).join("");

    const sessions = log();

    return `<div class="board" id="board">
      <div class="board-head">
        ${Artifacts.render("crest")}
        <div class="board-title">
          <b>Circumterrestrial Commonwealth &mdash; Office of the Prime Minister</b>
          <span>Standing position at the opening of Session ${st.session}
            &middot; ${esc(st.date)} &middot; no sitting in progress</span>
        </div>
        ${Artifacts.render("department_mark")}
      </div>

      <div class="board-grid">
        <div class="panel"><h2>The chamber</h2><div class="pbody">
          <div class="kv"><dt>Seats</dt><dd>${Engine.chamberTotal(st)}</dd>
            <dt>District</dt><dd>${st.law.tier_ratio_district}</dd>
            <dt>List</dt><dd>${st.law.tier_ratio_list}</dd>
            <dt>Functional</dt><dd>${Engine.functionalTotal(st)}</dd>
            <dt>Majority</dt><dd>${maj}</dd>
            <dt>Confidence</dt><dd>${conf} &middot; margin ${conf - maj >= 0 ? "+" : ""}${conf - maj}</dd></div>
        </div></div>

        <div class="panel"><h2>Standing indicators</h2>
          <div class="pbody">${meters}</div></div>

        <div class="panel"><h2>Before the House</h2><div class="pbody">
          ${bill ? `<div class="board-bill"><b>${esc(bill.title)}</b>
            <i>${esc(bill.ref || "")} &middot; ${esc(String(st.bills[bill.id].stage).replace(/_/g, " "))}
               &middot; ${bill.dualMajority ? "dual majority" : "simple majority"}</i></div>
            <div class="note">${esc(bill.summary || "")}</div>`
          : `<div class="note">Nothing before the House.</div>`}
        </div></div>

        <div class="panel"><h2>System notice</h2><div class="pbody">
          ${Artifacts.render("notice_plate", "wide")}
          ${typeof NOTICE !== "undefined" && NOTICE
            ? `<div class="note"><b>${esc(NOTICE.ref || "")}</b>
                 ${NOTICE.from ? "&middot; " + esc(NOTICE.from) : ""}</div>
               <div class="note">${esc(NOTICE.text || "")}</div>`
            : ""}
        </div></div>

        <div class="panel board-log"><h2>Session log</h2><div class="pbody">
          ${sessions.length
            ? sessions.slice(0, 6).map(s =>
                `<div class="note"><b>${esc(s.name)}</b> &middot; sitting ${s.sitting}
                   &middot; ${esc(s.date || "")} &mdash; ${esc(s.end)}</div>`).join("")
            : `<div class="note">No completed session on this terminal.</div>`}
        </div></div>
      </div>

      <div class="ticker" id="board-ticker"><div class="tk">${
        posts.concat(posts).map(p => `<span>${esc(p)}</span>`).join("")
      }</div></div>
    </div>`;
  }

  function menuShell(inner, view) {
    return boardHTML() + `<div class="menu-plate" id="menu-plate">
      <div class="menu-title"><span class="w">Ways</span><span class="a">&amp;</span><span class="m">Means</span></div>
      <div class="menu-tag">A Space Story About Politics and Governance</div>
      <div class="menu-body">${inner}</div>
      ${storageOK ? "" : `<div class="menu-warn">Browser storage is unavailable, so slots will not
        survive closing this tab. Use <b>Export to file</b> in Options to keep a game.</div>`}
    </div>`;
  }

  function showMenu(view) {
    const m = document.getElementById("menu");
    m.classList.add("on");
    document.body.classList.add("menu-on");
    /* a tiling field rather than an element, so it is applied and not
       rendered; empty leaves the CSS ground exactly as it was */
    if (typeof Artifacts !== "undefined") Artifacts.applyBackdrop(m);
    m.innerHTML = menuShell(
      view === "load"    ? slotList("load")
    : view === "new"     ? slotList("new")
    : view === "credits" ? credits()
    : view === "options" ? menuOptions()
    : root(), view);
    wireMenu(m, view);
    idle.arm();
  }

  /* ---------- the session log ----------

     Outside every save, on purpose. wm.opts is a different localStorage
     key from wm.slot.N and deleting a slot never touches it, so the log
     survives deleting every game. It is an ARRAY under a flat key, which
     is safe against the shallow merge that makes nested objects
     dangerous here: a stored array replaces the default wholesale and an
     array has no keys to lose. */
  function log() { return Array.isArray(opts.sessions) ? opts.sessions : []; }
  function record(entry) {
    const l = log().slice();
    l.unshift({
      /* the caller knows the world; this file knows which slot it was */
      at: Date.now(), name: entry.name || (current && current.name) || "Unnamed government",
      sitting: entry.sitting || 0, chapter: entry.chapter || 1,
      date: entry.date || "", end: entry.end || "ended"
    });
    opts.sessions = l.slice(0, 20);
    saveOpts();
  }

  /* The most recent save by when it was written, which is what
     "Continue" has to mean. */
  function latest() {
    let best = null;
    for (let i = 1; i <= SLOTS; i++) {
      const s = slot(i);
      if (s && (!best || (s.at || 0) > (best.at || 0))) best = Object.assign({ n: i }, s);
    }
    return best;
  }

  /* ---------- the controls ----------

     Plain language, no metaphor, no in-world renaming. The atmosphere is
     on the board behind this panel; a control that has to be decoded is
     a control between the player and the game.

     Continue is ABSENT rather than disabled when there is nothing to
     continue: a disabled button is a thing you are being refused, and on
     a first run there is nothing to refuse. */
  function root() {
    const last = latest();
    const any = !!last;
    return `<div class="menu-btns">
      ${last ? `<button class="mbtn wide" data-cont="${last.n}">Continue
          <i>${esc(last.name)} &middot; sitting ${last.sitting} &middot; chapter ${last.chapter}${
            last.date ? " &middot; " + esc(last.date) : ""}</i></button>` : ""}
      <button class="mbtn" data-go="new">New Government</button>
      <button class="mbtn${any ? "" : " off"}" data-go="load"${any ? "" : " disabled"}>Load</button>
      <button class="mbtn" data-go="options">Options</button>
      <button class="mbtn" data-go="credits">Credits</button>
    </div>`;
  }

  /* The same Control Panel as the topbar's, rendered here rather than
     forked. The three session buttons at the bottom of it are omitted:
     there is no game to export and nowhere to return to. */
  function menuOptions() {
    return `<div class="menu-sub">Options</div>
      <div class="optpanel-inline">${optionsHTML(false)}</div>
      <div class="menu-btns row"><button class="mbtn" data-go="root">Back</button></div>`;
  }

  function slotList(mode) {
    let rows = "";
    for (let i = 1; i <= SLOTS; i++) {
      const s = slot(i);
      rows += `<div class="slot${s ? "" : " empty"}">
        <div class="sl-n">${i}</div>
        <div class="sl-b">
          <div class="sl-name">${s ? esc(s.name) : "Empty"}</div>
          <div class="sl-meta">${s ? `Sitting ${s.sitting} &middot; Chapter ${s.chapter} &middot; ${when(s.at)}`
                                  : "No game in this slot"}</div>
        </div>
        <div class="sl-a">
          ${mode === "load"
            ? (s ? `<button class="mbtn sm" data-load="${i}">Load</button>
                    <button class="mbtn sm danger" data-del="${i}">Delete</button>` : "")
            : `<button class="mbtn sm" data-new="${i}">${s ? "Overwrite" : "Start here"}</button>`}
        </div></div>`;
    }
    return `<div class="menu-sub">${mode === "load" ? "Load a save" : "Choose a slot"}</div>
      <div class="slots">${rows}</div>
      <div class="menu-btns row"><button class="mbtn" data-go="root">Back</button></div>`;
  }

  function credits() {
    return `<div class="menu-sub">Credits</div>
      <div class="menu-text">
        <p><b>Ways &amp; Means</b> — a narrative political thriller with real
        electoral mechanics, set in the Circumterrestrial Commonwealth.</p>
        <p>Written and designed by Harper.</p>
        <p>Engine, editor and tooling built with Claude Code. Prose in this build
        is placeholder pending a full content pass.</p>
        <p class="dim">Parallel voting, dual-majority functional constituencies and
        the divergence threshold are the load-bearing mechanics. Nothing in the
        resolution is random.</p>
      </div>
      <div class="menu-btns row"><button class="mbtn" data-go="root">Back</button></div>`;
  }

  function wireMenu(m, view) {
    if (view === "options") wireOptions(m, false);

    m.querySelectorAll("[data-go]").forEach(b =>
      b.addEventListener("click", () => {
        /* New Government confirms only when there is something to lose. */
        if (b.dataset.go === "new" && latest() && opts.confirmDestructive &&
            !confirm("Start a new government? Your existing saves are kept; " +
                     "you will choose a slot next.")) return;
        showMenu(b.dataset.go === "root" ? null : b.dataset.go);
      }));

    m.querySelectorAll("[data-cont]").forEach(b => b.addEventListener("click", () => {
      const n = +b.dataset.cont, sv = slot(n);
      if (sv) start(n, sv.name, sv.state);
    }));

    /* Continue takes focus when it exists, so Enter resumes. When it does
       not exist the first control does, which is New Government - never a
       disabled button and never nothing. */
    const first = m.querySelector("[data-cont]") || m.querySelector(".menu-btns .mbtn:not([disabled])");
    if (first && first.focus) first.focus({ preventScroll: true });

    m.querySelectorAll("[data-new]").forEach(b => b.addEventListener("click", () => {
      const n = +b.dataset.new, existing = slot(n);
      if (existing && opts.confirmDestructive &&
          !confirm(`Overwrite "${existing.name}"? This cannot be undone.`)) return;
      const name = (prompt("Name this game", existing ? existing.name : "New government") || "").trim();
      if (!name) return;
      start(n, name, null);
    }));

    m.querySelectorAll("[data-load]").forEach(b => b.addEventListener("click", () => {
      const n = +b.dataset.load, s = slot(n);
      if (!s) return;
      start(n, s.name, s.state);
    }));

    m.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => {
      const n = +b.dataset.del, s = slot(n);
      if (s && opts.confirmDestructive &&
          !confirm(`Delete "${s.name}"? This cannot be undone.`)) return;
      drop(KEY(n)); showMenu("load");
    }));
  }

  /* ---------- idle ----------

     THE SCREENSAVER IS THE MENU WITH THE UI REMOVED, not a separate
     mode. After ninety seconds the control panel fades and the board
     stays, ticker still running, because the board is the thing worth
     looking at. Any input brings the panel back.

     It respects `motion`. A player who has turned animations off has
     said what they want from transitions, and a fade that ignores that
     is a bug against a setting they already set - so with motion off the
     panel simply stays. */
  const idle = (function () {
    let timer = null, wired = false, hidden = false;
    const IDLE_MS = 90000;

    function panel() { return document.getElementById("menu-plate"); }
    function show() {
      if (!hidden) return;
      hidden = false;
      const p = panel(); if (p) p.classList.remove("idle");
    }
    function hide() {
      const m = document.getElementById("menu");
      if (!m || !m.classList.contains("on") || !opts.motion) return;
      const p = panel(); if (!p) return;
      hidden = true; p.classList.add("idle");
    }
    function arm() {
      show();
      clearTimeout(timer);
      if (typeof document === "undefined" || !opts.motion) return;
      timer = setTimeout(hide, IDLE_MS);
    }
    function wire() {
      if (wired || typeof document === "undefined") return;
      wired = true;
      ["pointerdown", "pointermove", "keydown", "wheel"].forEach(ev =>
        document.addEventListener(ev, () => {
          const m = document.getElementById("menu");
          if (m && m.classList.contains("on")) arm();
        }, true));
    }
    return { arm, wire, hidden: () => hidden };
  })();

  /* ---------- starting and saving ---------- */
  function start(n, name, stateStr) {
    let state;
    try { state = stateStr ? Engine.load(stateStr, C) : Engine.newGame(C); }
    catch (e) { alert("That save could not be read: " + e.message); return; }
    current = { n: n, name: name };
    document.getElementById("menu").classList.remove("on");
    document.body.classList.remove("menu-on");
    document.getElementById("shell").classList.add("on");
    /* A different game is a different set of rows; carrying the last
       one's selection into it points at things that may not exist. */
    if (typeof Focus !== "undefined") Focus.reset();
    if (typeof Papers !== "undefined") Papers.reset();
    UI.boot(state, C);
    if (!stateStr) saveNow(true);
    stampSlot();
  }

  function stampSlot() {
    const t = document.getElementById("tb-slot");
    if (t) t.textContent = current ? `${current.name} — slot ${current.n}` : "";
  }

  function saveNow(quiet) {
    if (!current) return;
    writeSlot(current.n, current.name, Engine.save(UI.state()));
    if (!quiet) flash("Saved to slot " + current.n);
  }

  /* Called by the UI after anything that advances the game. */
  function autosave() { if (opts.autosave && current) saveNow(true); }

  function flash(msg) {
    const f = document.getElementById("tb-flash");
    if (!f) return;
    f.textContent = msg; f.classList.add("on");
    clearTimeout(flash._t);
    flash._t = setTimeout(() => f.classList.remove("on"), 1800);
  }

  /* ---------- options menu ----------

     ONE PANEL, TWO PLACES. The topbar popover and the menu's Options view
     render the same HTML and are wired by the same function; forking it
     is how two settings screens end up disagreeing about what a setting
     is called. `inGame` drops the three session buttons, because from the
     main menu there is no game to export and nowhere to return to. */
  function optionsHTML(inGame) {
    const row = (k, label, note) => `<label class="opt"><input type="checkbox" data-opt="${k}"
      ${opts[k] ? "checked" : ""}><span><b>${label}</b><i>${note}</i></span></label>`;
    const slider = (k, label) => `<label class="optlvl"><span>${label}</span>
      <input type="range" data-lvl="${k}" min="0" max="100" step="5"
        value="${Math.round((opts[k] || 0) * 100)}" aria-label="${label} volume"></label>`;
    return `<div class="opt-title">Options</div>
      ${row("autosave", "Autosave", "Write to the current slot after every sitting")}
      ${row("motion", "Animations", "The signature ceremony and other transitions")}
      ${row("confirmDestructive", "Confirm overwrites", "Ask before replacing or deleting a save")}
      ${row("tips", "Explain the readouts", "Hover a column, a flag or a meter. Press ? to tab through them.")}
      <div class="opt-sep"></div>
      <div class="opt-title">Sound</div>
      ${row("mute", "Mute", "Silence everything, without losing the levels below")}
      ${row("roomTone", "Room tone", "The air handling, a long way off")}
      ${slider("gainUi", "Terminal")}
      ${slider("gainRoom", "Room")}
      ${slider("gainEvent", "Events")}
      <div class="opt-sep"></div>
      <div class="opt-title">Text</div>
      ${row("stream", "Type text out", "New text arrives a character at a time. Any key skips it.")}
      <label class="optlvl"><span>Speed</span>
        <select data-pick="streamSpeed" aria-label="Streaming speed">
          ${(typeof Stream !== "undefined" ? Stream.speeds : ["slow", "normal", "fast"])
            .map(v => `<option value="${v}"${opts.streamSpeed === v ? " selected" : ""}>` +
                      v.charAt(0).toUpperCase() + v.slice(1) + `</option>`).join("")}
        </select></label>
      ${inGame === false ? "" : `<div class="opt-sep"></div>
      <button class="mbtn sm wide" data-act="export">Export to file</button>
      <button class="mbtn sm wide" data-act="import">Import from file</button>
      <div class="opt-sep"></div>
      <button class="mbtn sm wide danger" data-act="menu">Return to main menu</button>`}`;
  }

  function wireOptions(p, inGame) {
    p.querySelectorAll("[data-opt]").forEach(cb => cb.addEventListener("change", () => {
      opts[cb.dataset.opt] = cb.checked; saveOpts(); applyOpts();
    }));
    /* change, not input: a select lands when it lands. */
    p.querySelectorAll("[data-pick]").forEach(sel => sel.addEventListener("change", () => {
      setOpt(sel.dataset.pick, sel.value);
    }));
    /* input, not change: a volume slider that only lands when you let go is
       a slider you cannot aim. */
    p.querySelectorAll("[data-lvl]").forEach(sl => sl.addEventListener("input", () => {
      opts[sl.dataset.lvl] = (+sl.value || 0) / 100; saveOpts(); applyOpts();
    }));
    if (inGame === false) return;
    p.querySelector('[data-act="export"]').addEventListener("click", exportFile);
    p.querySelector('[data-act="import"]').addEventListener("click", () =>
      document.getElementById("file-load").click());
    p.querySelector('[data-act="menu"]').addEventListener("click", () => {
      if (opts.confirmDestructive && !confirm("Return to the main menu? Unsaved progress is lost.")) return;
      toggleOptions(false);
      document.getElementById("shell").classList.remove("on");
      current = null; showMenu(null);
    });
  }

  function toggleOptions(force) {
    const p = document.getElementById("tb-optpanel");
    const open = force != null ? force : !p.classList.contains("on");
    p.classList.toggle("on", open);
    if (!open) {
      /* Shutting a popover under the keyboard leaves focus on a hidden node
         and the next Tab starts again from the top of the document. Put it
         back on the control that opened it. */
      const b = document.getElementById("tb-options");
      if (b && p.contains(document.activeElement)) b.focus();
      return;
    }
    p.innerHTML = optionsHTML(true);
    wireOptions(p, true);
  }

  function exportFile() {
    const blob = new Blob([Engine.save(UI.state())], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (current ? current.name.replace(/[^\w-]+/g, "_") : "ways-and-means") + ".json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  /* ---------- boot ---------- */
  /* Idempotent: a second boot must not double-register the topbar handlers,
     or every toggle fires twice and the options panel opens and shuts again. */
  let wired = false;

  function boot(content) {
    C = content;
    loadOpts();
    if (wired) { current = null; showMenu(null); return; }
    wired = true;
    document.getElementById("tb-save").addEventListener("click", () => saveNow(false));
    document.getElementById("tb-load").addEventListener("click", () => {
      toggleOptions(false);
      document.getElementById("shell").classList.remove("on");
      showMenu("load");
    });
    document.getElementById("tb-options").addEventListener("click", e => {
      e.stopPropagation(); toggleOptions();
    });
    document.addEventListener("keydown", e => {
      if (e.key !== "Escape") return;
      const p = document.getElementById("tb-optpanel");
      if (p && p.classList.contains("on")) toggleOptions(false);
    });
    /* The audio bus only installs its unlock listener here. It builds no
       graph and makes no sound until the player's first click or keypress,
       because every browser refuses to start one before that anyway. */
    if (typeof Sound !== "undefined") Sound.init();
    idle.wire();
    document.addEventListener("click", e => {
      const p = document.getElementById("tb-optpanel");
      if (p.classList.contains("on") && !p.contains(e.target)) toggleOptions(false);
    });
    document.getElementById("file-load").addEventListener("change", e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const state = Engine.load(r.result, C);
          if (typeof Papers !== "undefined") Papers.reset();
          document.getElementById("menu").classList.remove("on");
          document.body.classList.remove("menu-on");
          document.getElementById("shell").classList.add("on");
          if (!current) current = { n: 1, name: f.name.replace(/\.json$/i, "") };
          UI.boot(state, C); stampSlot(); flash("Imported " + f.name);
        } catch (err) { alert("That file could not be read: " + err.message); }
      };
      r.readAsText(f);
      e.target.value = "";
    });
    showMenu(null);
  }

  return { boot: boot, autosave: autosave, save: saveNow, options: opts,
           opt: opt, setOpt: setOpt, flash: flash,
           /* the session log: written when a government ends, read by the
              board. Outside every save on purpose. */
           record: record, sessions: log };
})();
