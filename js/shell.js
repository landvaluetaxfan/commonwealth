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
    gainUi: 0.55, gainRoom: 0.3, gainEvent: 0.7
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
    let sitting = 0, chapter = 1;
    try { const s = JSON.parse(stateStr); sitting = s.sitting || 0; chapter = s.chapter || 1; }
    catch (e) {}
    write(KEY(n), JSON.stringify({
      name: name, at: Date.now(), sitting: sitting, chapter: chapter, state: stateStr
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

  function menuShell(inner) {
    return `<div class="menu-plate">
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
    m.innerHTML = menuShell(
      view === "load"    ? slotList("load")
    : view === "new"     ? slotList("new")
    : view === "credits" ? credits()
    : root());
    wireMenu(m, view);
  }

  function root() {
    const any = [...Array(SLOTS).keys()].some(i => slot(i + 1));
    return `<div class="menu-btns">
      <button class="mbtn" data-go="new">Start New Save</button>
      <button class="mbtn${any ? "" : " off"}" data-go="load"${any ? "" : " disabled"}>Load Save</button>
      <button class="mbtn" data-go="credits">Credits</button>
    </div>`;
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
    m.querySelectorAll("[data-go]").forEach(b =>
      b.addEventListener("click", () => showMenu(b.dataset.go === "root" ? null : b.dataset.go)));

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

  /* ---------- starting and saving ---------- */
  function start(n, name, stateStr) {
    let state;
    try { state = stateStr ? Engine.load(stateStr, C) : Engine.newGame(C); }
    catch (e) { alert("That save could not be read: " + e.message); return; }
    current = { n: n, name: name };
    document.getElementById("menu").classList.remove("on");
    document.body.classList.remove("menu-on");
    document.getElementById("shell").classList.add("on");
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

  /* ---------- options menu ---------- */
  function optionsHTML() {
    const row = (k, label, note) => `<label class="opt"><input type="checkbox" data-opt="${k}"
      ${opts[k] ? "checked" : ""}><span><b>${label}</b><i>${note}</i></span></label>`;
    const slider = (k, label) => `<label class="optlvl"><span>${label}</span>
      <input type="range" data-lvl="${k}" min="0" max="100" step="5"
        value="${Math.round((opts[k] || 0) * 100)}" aria-label="${label} volume"></label>`;
    return `<div class="opt-title">Options</div>
      ${row("autosave", "Autosave", "Write to the current slot after every sitting")}
      ${row("motion", "Animations", "The signature ceremony and other transitions")}
      ${row("confirmDestructive", "Confirm overwrites", "Ask before replacing or deleting a save")}
      <div class="opt-sep"></div>
      <div class="opt-title">Sound</div>
      ${row("mute", "Mute", "Silence everything, without losing the levels below")}
      ${row("roomTone", "Room tone", "The air handling, a long way off")}
      ${slider("gainUi", "Terminal")}
      ${slider("gainRoom", "Room")}
      ${slider("gainEvent", "Events")}
      <div class="opt-sep"></div>
      <button class="mbtn sm wide" data-act="export">Export to file</button>
      <button class="mbtn sm wide" data-act="import">Import from file</button>
      <div class="opt-sep"></div>
      <button class="mbtn sm wide danger" data-act="menu">Return to main menu</button>`;
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
    p.innerHTML = optionsHTML();
    p.querySelectorAll("[data-opt]").forEach(cb => cb.addEventListener("change", () => {
      opts[cb.dataset.opt] = cb.checked; saveOpts();
    }));
    /* input, not change: a volume slider that only lands when you let go is
       a slider you cannot aim. */
    p.querySelectorAll("[data-lvl]").forEach(sl => sl.addEventListener("input", () => {
      opts[sl.dataset.lvl] = (+sl.value || 0) / 100; saveOpts();
    }));
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
           opt: opt, setOpt: setOpt, flash: flash };
})();
