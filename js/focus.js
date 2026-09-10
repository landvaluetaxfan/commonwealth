/* =============================================================
   FOCUS — what survives a re-render.

   THE PROBLEM THIS FILE EXISTS FOR:

     drawAll() replaces twenty-five containers with fresh innerHTML on
     every state change. Everything inside them is destroyed and rebuilt,
     which means the node that had focus is gone and focus falls to
     document.body. Measured, not assumed: focus a row in the orbit
     table, advance the sitting, and document.activeElement is the body.
     A keyboard player loses their place on every single decision.

   THE RULE: IDENTITY, NEVER A NODE AND NEVER AN INDEX.

     A node captured before the render does not exist after it, so
     holding one is holding a corpse. An index is worse than useless: the
     row at position four after the render may be a different bill, so
     restoring by index silently moves the player somewhere they did not
     ask to be, which is harder to notice than losing focus outright.
     What is recorded is the row's DATA KEY — the bill id, the station
     id, the document id — and the row is found again by asking the
     freshly rendered table which of its rows has that key.

     Position is recorded too, but ONLY as a fallback for the case below.

   WHEN THE THING IS GONE:

     nearest surviving sibling, then the panel itself, and never
     document.body without saying so. An instrument that was revoked
     between renders takes its row with it; the player's place should
     land beside where it was, not at the top of the document.

   ONE SELECTION STORE.

     Selection used to live in four places in three mechanisms — a
     dataset on #bill-detail, a dataset on #station-detail, a closure
     variable in Papers, and cxCurrent in ui.js. Nothing coordinated
     them, which is how the order paper came to hardcode its highlight
     to one bill and mark the wrong row for the whole of a game. SEL
     below is the only selection store. Renderers ask it what is
     selected; nothing else writes it.

   WHAT THIS FILE DOES NOT DO: draw anything, know what a bill is, or
   make a sound. It moves focus and it remembers keys.
   ============================================================= */
const Focus = (function () {
  "use strict";

  /* Every scrollable box in the shell. These elements are NEVER replaced
     — only their children are — so unlike focus, scroll can be captured
     against the node itself. The loss it repairs is narrow and real:
     innerHTML replacement is atomic, so scrollTop normally survives on
     its own, but when the new content is SHORTER the browser clamps the
     scroll position and nothing puts it back. */
  const SCROLLERS = "#viewport,.pbody,#cx-body,#cx-side,#pp-doc,.callsheet,#tabstrip";

  const REG = Object.create(null);   /* regionId -> spec */
  const SEL = Object.create(null);   /* regionId -> selected key. The store. */
  let depth = 0, wired = false;

  /* ---------- regions ----------
     A region is a container whose rows are controls: clicking one does
     something. Three qualify — the order paper, the station roster and
     the register — and they are exactly the three tables that carry
     .sel. A display-only table is not a region and never becomes one. */
  function region(id, spec) { REG[id] = spec; }

  function box(id) { return document.getElementById(id); }

  /* Rows are made focusable HERE rather than in the renderers, so that a
     renderer cannot forget. tabindex="-1" is deliberate: the row can be
     focused by script and by the arrow keys, and is NOT a tab stop. A
     table of thirty-four stations that each took a tab stop would take
     thirty-four presses to walk past. */
  function rowsIn(id) {
    const c = box(id);
    if (!c) return [];
    const rows = [].slice.call(c.querySelectorAll(REG[id].rows));
    rows.forEach(r => { if (!r.hasAttribute("tabindex")) r.setAttribute("tabindex", "-1"); });
    return rows;
  }
  function rowFor(id, key) {
    if (key == null) return null;
    return rowsIn(id).filter(r => REG[id].key(r) === key)[0] || null;
  }

  /* What is selected, or what the content says to select when nothing is
     yet. The fallback is asked of the region rather than named here:
     this file knows no bill and no station. */
  function selected(id) {
    const s = REG[id];
    if (SEL[id] != null) return SEL[id];
    return s && s.fallback ? s.fallback() : null;
  }
  /* Write the selection WITHOUT rendering. For a renderer that has just
     discovered its selection no longer exists and is choosing another. */
  function seed(id, key) { SEL[id] = key; }

  /* ---------- capture ---------- */

  function selectorFor(el) {
    if (el.id) return "#" + el.id;
    /* A control rebuilt by a renderer — a Make button, a Grant button, a
       whip slider. Its data attribute is its identity for the same
       reason a row's is. */
    const keys = el.dataset ? Object.keys(el.dataset) : [];
    if (!keys.length) return null;
    const k = keys[0];
    return el.tagName.toLowerCase() +
      '[data-' + k.replace(/[A-Z]/g, m => "-" + m.toLowerCase()) +
      '="' + el.dataset[k] + '"]';
  }

  function mark() {
    const a = document.activeElement;
    if (!a || a === document.body || a === document.documentElement) return null;
    for (const id in REG) {
      const c = box(id);
      if (!c || !c.contains(a)) continue;
      const row = a.closest ? a.closest(REG[id].rows) : null;
      if (!row) return { region: id };                 /* the container itself */
      const rows = rowsIn(id);
      /* `at` is the FALLBACK-ONLY position. It is never used to identify
         the row; it is used to find a neighbour when the row is gone. */
      return { region: id, key: REG[id].key(row), at: rows.indexOf(row) };
    }
    const sel = selectorFor(a);
    return sel ? { sel: sel } : null;
  }

  function scrolls() {
    return [].slice.call(document.querySelectorAll(SCROLLERS))
      .map(n => [n, n.scrollTop, n.scrollLeft]);
  }

  /* ---------- restore ---------- */

  /* PUT FOCUS BACK WITHOUT MOVING THE PAGE.

     .focus() scrolls its target into view, which is right when the player
     asked to go somewhere and wrong when we are handing them back the
     place they already had. Measured: with the station roster scrolled to
     the top, a plain .focus() on its thirtieth row jumps the panel to
     676; the same call with preventScroll leaves it at 0. Restoring
     focus would therefore undo the scroll restore standing right next to
     it. Focus is put back silently here; around() scrolls afterwards,
     and only when the move was one the player asked for. */
  function put(n) { if (n) n.focus({ preventScroll: true }); return n; }

  function land(m) {
    if (!m) return null;
    if (m.sel) return put(document.querySelector(m.sel));
    const c = box(m.region);
    if (!c) return null;
    if (m.key == null) return put(c);
    const rows = rowsIn(m.region);
    let n = rows.filter(r => REG[m.region].key(r) === m.key)[0];
    if (!n && rows.length) {
      /* THE ROW IS GONE. Nearest surviving sibling, by where it used to
         be — clamped, because the table may now be shorter than the
         position we remembered. */
      n = rows[Math.min(m.at == null ? 0 : m.at, rows.length - 1)];
    }
    return put(n || c);     /* the panel, if the table emptied entirely */
  }

  function unscroll(list) {
    list.forEach(([n, t, l]) => {
      if (!n.isConnected) return;
      if (n.scrollTop !== t) n.scrollTop = t;
      if (n.scrollLeft !== l) n.scrollLeft = l;
    });
  }

  /* ---------- the one wrapper ----------

     Everything that re-renders goes through here. `want` overrides where
     focus lands, for the case where the render was caused by the player
     deliberately moving — arrowing down the order paper should end on
     the new row, not back on the old one. */
  function around(fn, want) {
    if (depth++) { try { return fn(); } finally { depth--; } }
    const m = mark(), s = scrolls();
    try { return fn(); }
    finally {
      depth--;
      /* Every region's rows are made focusable on every render, not only
         on the one being restored into. Otherwise a table nobody has
         touched yet has no focusable rows, and whether it does depends on
         where focus happened to be - which is the kind of state that
         works until the day it does not. */
      for (const id in REG) rowsIn(id);
      const n = land(want || m);
      /* Scroll is restored AFTER focus, because focus is the thing that
         would otherwise move it. */
      unscroll(s);
      /* ...and only a deliberate move scrolls, so arrowing off the bottom
         of a long table still follows the player down. */
      if (want && n && n.scrollIntoView) n.scrollIntoView({ block: "nearest" });
    }
  }

  /* ---------- selecting ----------

     set()      change the selection and redraw. Focus stays where it is.
     activate() the same, and put focus on the row. This is what a click
                and an Enter both call, so they are one path and not two.
     There is no third. */
  function set(id, key) {
    SEL[id] = key;
    around(() => REG[id].activate(key));
  }
  function activate(id, key) {
    const rows = rowsIn(id);
    const at = Math.max(0, rows.map(r => REG[id].key(r)).indexOf(key));
    SEL[id] = key;
    around(() => REG[id].activate(key), { region: id, key: key, at: at });
  }

  /* ---------- keyboard ----------

     The table is one tab stop, not one per row. Tab lands on the table;
     the arrows walk it; Enter and Space activate. Selection follows
     focus, because in all three of these tables selecting a row IS what
     the row does — there is nothing to confirm afterwards. */
  function key(id, e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const spec = REG[id], rows = rowsIn(id);
    if (!rows.length) return;
    const cur = e.target && e.target.closest ? e.target.closest(spec.rows) : null;
    let i = cur ? rows.indexOf(cur)
                : Math.max(0, rows.map(r => spec.key(r)).indexOf(selected(id)));
    let to;
    switch (e.key) {
      case "ArrowDown": case "Down":  to = Math.min(rows.length - 1, i + 1); break;
      case "ArrowUp":   case "Up":    to = Math.max(0, i - 1); break;
      case "Home":                    to = 0; break;
      case "End":                     to = rows.length - 1; break;
      case "Enter": case " ": case "Spacebar":
        /* THE SAME CALL A CLICK MAKES. Not a copy of it. */
        e.preventDefault();
        if (cur) activate(id, spec.key(cur));
        return;
      default: return;
    }
    e.preventDefault();
    activate(id, spec.key(rows[to]));
  }

  function wire() {
    if (wired) return;
    wired = true;
    for (const id in REG) {
      const c = box(id);
      if (!c) continue;
      /* ONE tab stop for the whole table. Never a positive value: a
         positive tabindex jumps ahead of the entire document and
         reorders everything after it. */
      if (!c.hasAttribute("tabindex")) c.setAttribute("tabindex", "0");
      c.addEventListener("keydown", e => key(id, e));
    }

    /* THE CONCORDANCE, keyboard-reachable through the handler it already
       has. Its links are <a> with no href, so they are not focusable and
       not activatable by default; tabindex makes them reachable and
       .click() sends them down the SAME delegated path the mouse uses.
       Writing a second activation path here is how the Concordance ended
       up rendering every article twice — a delegated capture listener in
       ui.js and a per-node bubble listener in encyclopedia.js, both
       firing on one click. There is one now. */
    document.addEventListener("keydown", e => {
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
      const t = e.target;
      if (!t || !t.matches || !t.matches("[data-go],[data-anchor]")) return;
      e.preventDefault();
      t.click();
    });
  }

  function reset() { for (const k in SEL) delete SEL[k]; }

  return { region, around, set, activate, selected, seed, reset, wire,
           rows: rowsIn, rowFor,
           /* for the checks */ store: SEL };
})();
