/* =============================================================
   WAIT — the three ways this terminal says it is thinking.

   The machine in this game is a 2287 government terminal, and the one
   thing such a machine never does is finish instantly and say nothing.
   Three tiers, and which tier a thing gets is a judgement about how much
   it matters, not about how long it actually takes:

     1  BRIEF     a cursor, under about six hundred milliseconds. Purely
                  cosmetic. Granting a slot, making an order. The work is
                  already done when the cursor appears.

     2  DIALOG    a modal with a SEGMENTED bar. Discrete chunks, one per
                  sub-step, each labelled with what it is doing. Never a
                  smooth fill: a smooth bar is a lie about a process
                  nobody is measuring, and a chunked one is an honest
                  list of things that have to happen.

     3  STALL     the bar stops at a named point and says why. Fired from
                  a CONTENT FLAG and never from a random roll - a stall
                  the player cannot cause and cannot avoid is just an
                  annoyance, and one the fiction chose is a scene.

   THE ORDER OF EVENTS, WHICH IS THE WHOLE DESIGN:

     the state resolves FIRST, then the dialog narrates what already
     happened. Nothing here computes anything. That is what makes the
     skip safe - skipping cannot change an outcome that was decided
     before the first chunk lit - and it is why muting the audio and
     turning off streaming cannot move a number.
   ============================================================= */
const Wait = (function () {
  "use strict";

  let live = null, wired = false;

  /* ---------- tier 1 ---------- */

  /* Cosmetic, and honest about it: the caller has already done the work.
     Capped, because a cursor that stays busy is a hang. */
  function brief(ms) {
    if (typeof document === "undefined") return;
    const b = document.body;
    b.classList.add("busy");
    clearTimeout(brief.t);
    brief.t = setTimeout(() => b.classList.remove("busy"),
                         Math.min(600, Math.max(80, ms || 260)));
  }

  /* ---------- tier 2 and 3 ---------- */

  function host() {
    let h = document.getElementById("waitdlg");
    if (!h) {
      h = document.createElement("div");
      h.id = "waitdlg";
      document.body.appendChild(h);
    }
    return h;
  }

  /* spec = {
       title, sub,
       steps:  [{ label, ms, run, stall: { flag, label, ms } }],
       stalled: flagName => boolean,   // the caller asks the state; this
                                       // module never sees a flag
       mount:  el => {}                // the caller's own panel inside
     }                                 // the dialog, filled by its steps
     -> Promise, resolved when the last chunk lands or the player skips. */
  function run(spec) {
    if (live) live.skip();
    const steps = (spec.steps || []).filter(Boolean);
    if (typeof document === "undefined" || !steps.length) {
      steps.forEach(s => { if (s.run) s.run(); });
      return Promise.resolve();
    }

    const opener = document.activeElement;
    const h = host();
    h.innerHTML =
      '<div class="wait-back"><div class="wait-dlg panel" role="dialog" aria-modal="true"' +
      ' aria-label="' + esc(spec.title || "Working") + '" tabindex="-1">' +
        '<h2>' + esc(spec.title || "Working") +
          (spec.sub ? '<em>' + esc(spec.sub) + '</em>' : '') + '</h2>' +
        '<div class="pbody">' +
          '<div class="wait-seg">' +
            steps.map((s, i) => '<i data-i="' + i + '"></i>').join("") +
          '</div>' +
          '<div class="wait-step" id="wait-step">&nbsp;</div>' +
          '<div class="wait-body" id="wait-body"></div>' +
          '<div class="note wait-skip">Any key or click to skip</div>' +
        '</div>' +
      '</div></div>';

    const segs = [].slice.call(h.querySelectorAll(".wait-seg i"));
    const label = h.querySelector("#wait-step");
    const body = h.querySelector("#wait-body");
    const dlg = h.querySelector(".wait-dlg");
    if (dlg.focus) dlg.focus({ preventScroll: true });
    if (spec.mount) spec.mount(body);

    return new Promise(resolve => {
      let i = 0, timer = null, over = false;

      function close() {
        if (over) return;
        over = true;
        clearTimeout(timer);
        h.innerHTML = "";
        live = null;
        /* Back to whatever opened the dialog, while it is still on the
           page. The caller's redraw comes after this, and js/focus.js
           carries it through that by id. */
        if (opener && opener.isConnected && opener.focus) opener.focus({ preventScroll: true });
        resolve();
      }

      /* SKIP RUNS THE REST, IT DOES NOT CANCEL THEM. Every step's run()
         is a piece of the caller's presentation - a row appended, a total
         updated - and the screen has to end up where it would have ended
         up. Only the waiting is skipped. */
      function skip() {
        if (over) return;
        clearTimeout(timer);
        for (; i < steps.length; i++) if (steps[i].run) steps[i].run();
        segs.forEach(s => s.className = "done");
        close();
      }

      function step() {
        if (over) return;
        if (i >= steps.length) { close(); return; }
        const s = steps[i];
        segs[i].className = "on";
        label.textContent = s.label || "";
        if (s.run) s.run();

        /* THE SCRIPTED STALL. Only ever because the state says so. */
        const st = s.stall;
        const stalling = st && spec.stalled && spec.stalled(st.flag);
        if (stalling) {
          segs[i].className = "stall";
          label.textContent = st.label || s.label || "";
        }
        const ms = (s.ms == null ? 160 : s.ms) + (stalling ? (st.ms || 900) : 0);

        timer = setTimeout(() => {
          if (over) return;
          segs[i].className = "done";
          i++;
          step();
        }, ms);
      }

      live = { skip: skip };
      step();
    });
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function skip() { if (live) live.skip(); }
  function running() { return !!live; }

  /* Same capture-phase listeners as the text streamer, and for the same
     reason: a dialog you cannot get out of because a child element ate
     the click is worse than no dialog. */
  function wire() {
    if (wired || typeof document === "undefined") return;
    wired = true;
    document.addEventListener("keydown", skip, true);
    document.addEventListener("pointerdown", skip, true);
  }

  return { brief, run, skip, running, wire };
})();
