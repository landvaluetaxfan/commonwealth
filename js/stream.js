/* =============================================================
   STREAM — text arriving a character at a time.

   WHY THIS IS NOT IN A DRAW FUNCTION, AND MUST NEVER BE:

     js/audio.js's hard rule is that sound comes from engine effects and
     user actions only. Typing makes noise, so streaming is a user action
     and not a rendering concern. A redraw happens on a tab switch, on a
     load, and on a mirrored panel repainting; if the streamer ran from
     drawSitting() the same paragraph would retype itself every time you
     looked at another tab, with sound, four times over.

     So: the renderer puts the finished text on the page, complete and
     silent, exactly as it did before. The ACTION HANDLERS - choosing,
     rising, arriving at a new decision - then ask this module to reveal
     it. Streaming is an animation played over already-correct DOM, which
     is also why skipping it can never leave the screen wrong: the words
     were all there before the first one appeared.

   HOW IT REVEALS

     Not by writing characters into innerHTML - that would type out the
     tags, and the glossary annotations in an event body are real spans
     with real listeners. The full HTML is rendered first; the text nodes
     are then emptied and refilled a few characters at a time. Markup,
     listeners and layout are untouched, and the paragraph does not
     reflow as it fills because the space was already claimed.

   THE RATE

     One cue per three characters at the very most, and never more than
     fifteen a second whatever the speed - a keyboard, not a buzzer. Both
     caps are checked; at any speed above about 45 characters a second the
     second one is the one that binds.

     Default is normal. Fast reads as a flicker rather than as typing,
     and a player who wants it out of the way has a speed control in the
     options panel and a key that skips the block outright.
   ============================================================= */
const Stream = (function () {
  "use strict";

  /* characters per second. The default is `normal`; see js/shell.js. */
  const SPEED = { slow: 220, normal: 420, fast: 700 };
  const CUE_MIN_CHARS = 3;
  const CUE_MAX_PER_SEC = 15;

  /* Whose voice, when content has not said. A speaker's register is a
     property of who they are, so it belongs beside them rather than
     repeated on every block they appear in; content overrides it with a
     `register` field on the block whenever the default is wrong. */
  const BY_SPEAKER = {
    tenaya:   "silent",      /* the President. Nothing. */
    ceyhan:   "press",
    ansar:    "broadcast",
    halloran: "office",
    gb_chair: "office"
  };
  const DEFAULT_REGISTER = "office";

  let live = null;          /* the run in progress, if any */
  let wired = false;

  function opt(k, dflt) {
    if (typeof Shell === "undefined" || !Shell.opt) return dflt;
    const v = Shell.opt(k);
    return v === undefined ? dflt : v;
  }

  function registerFor(block) {
    if (block && block.register) return block.register;
    if (block && block.speaker && BY_SPEAKER[block.speaker]) return BY_SPEAKER[block.speaker];
    return DEFAULT_REGISTER;
  }

  /* Every text node under el, with the text it is supposed to end up
     holding. Collected before anything is emptied, because emptying
     changes what a walk would find. */
  function harvest(el) {
    const out = [];
    const walk = n => {
      for (let c = n.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) { if (c.nodeValue.length) out.push([c, c.nodeValue]); }
        else if (c.nodeType === 1) walk(c);
      }
    };
    walk(el);
    return out;
  }

  /* ---------- the one public entry point ----------

     reveal(el, block) types out whatever is already inside el. It returns
     a promise, but nothing has to wait for it: the DOM is correct from the
     first frame either way. */
  function reveal(el, block) {
    finish();                                   /* one at a time */
    if (!el) return Promise.resolve();

    const reg = registerFor(block);
    const on = opt("stream", true);
    const cps = SPEED[opt("streamSpeed", "normal")] || SPEED.normal;
    const raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame : null;

    /* Streaming off, or a document with no animation frames at all (a
       headless check): the text is already right, so there is nothing to
       do but say so. */
    if (!on || !raf) return Promise.resolve();

    const nodes = harvest(el);
    const total = nodes.reduce((n, p) => n + p[1].length, 0);
    if (!total) return Promise.resolve();

    /* CLAIM THE SPACE BEFORE EMPTYING IT. Blanking the text collapses
       every paragraph to nothing, so without this the decision buttons
       underneath jump up and then walk back down a line at a time as the
       block fills - which is both ugly and a moving target for a mouse.
       The height is measured while the text is still there. */
    const held = el.offsetHeight;
    if (held) el.style.minHeight = held + "px";
    nodes.forEach(p => { p[0].nodeValue = ""; });
    el.classList.add("streaming");

    return new Promise(resolve => {
      let i = 0, at = 0, done = 0;
      let sinceCue = 0, lastCue = 0, last = null, caret = null;

      /* The caret follows the text rather than sitting at the end of the
         block. A block cursor parked under three empty paragraphs is not
         a cursor, it is a bullet point. */
      const moveCaret = node => {
        const p = node.parentElement;
        if (p === caret) return;
        if (caret) caret.classList.remove("typing");
        caret = p;
        if (caret) caret.classList.add("typing");
      };

      const stop = () => {
        nodes.forEach(p => { p[0].nodeValue = p[1]; });
        el.classList.remove("streaming");
        el.style.minHeight = "";
        if (caret) caret.classList.remove("typing");
        live = null;
        resolve();
      };

      live = { stop: stop };

      const tick = now => {
        if (live === null) return;              /* finished under us */
        if (last === null) last = now;
        let budget = Math.max(1, Math.round((now - last) / 1000 * cps));
        last = now;

        while (budget > 0 && i < nodes.length) {
          const [node, text] = nodes[i];
          moveCaret(node);
          const take = Math.min(budget, text.length - at);
          at += take; budget -= take; done += take; sinceCue += take;
          node.nodeValue = text.slice(0, at);
          if (at >= text.length) { i++; at = 0; }
        }

        /* BOTH caps, every frame: three characters of text AND a
           sixty-six millisecond gap. */
        if (sinceCue >= CUE_MIN_CHARS && now - lastCue >= 1000 / CUE_MAX_PER_SEC) {
          sinceCue = 0; lastCue = now;
          if (typeof Sound !== "undefined") Sound.type(reg);
        }

        if (i >= nodes.length || done >= total) stop();
        else raf(tick);
      };
      raf(tick);
    });
  }

  /* INSTANT SKIP. Any key, any click. Registered once at the document in
     the capture phase so that a control which stops propagation cannot
     leave a half-typed paragraph on the screen. It does not swallow the
     event: the click that skipped the text is still the click that
     pressed the button, which is what a player who is hammering the
     space bar expects. */
  function finish() { if (live) live.stop(); }
  function running() { return !!live; }

  function wire() {
    if (wired || typeof document === "undefined") return;
    wired = true;
    document.addEventListener("keydown", finish, true);
    document.addEventListener("pointerdown", finish, true);
  }

  return { reveal, finish, running, wire,
           speeds: Object.keys(SPEED), registerFor,
           /* for the checks */ bySpeaker: BY_SPEAKER };
})();
