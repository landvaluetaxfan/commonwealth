/* =============================================================
   AUDIO — the bus.

   THE HARD RULE, AND THE REASON THIS FILE HAS A HEADER AT ALL:

     Sound is triggered by ENGINE EFFECTS and USER ACTIONS only.
     No play() call may originate from drawAll(), or from any
     draw* function, directly or transitively.

   A redraw happens for reasons that have nothing to do with the
   player: switching tabs, loading a slot, a mirrored panel
   repainting itself through a MutationObserver, a test harness
   re-entering UI.boot(). A cue fired from a draw function is a
   cue that fires at random, four times in a row, or while the
   main menu is open. Cues therefore live at the point where the
   player did something or where the Engine decided something,
   and nowhere else. tools/uitest.js reads this file and js/ui.js
   and fails the build if that stops being true.

   NO ASSETS. There is no build step and no audio pipeline, so
   every cue here is synthesised from oscillators and one noise
   buffer. That is a constraint rather than a preference, but it
   suits the setting: this is a terminal in a government office,
   not a film.

   NOTHING HERE MAY THROW. Web Audio is absent in jsdom, blocked
   in some embedded browsers, and refuses to start before a user
   gesture everywhere. Every entry point checks and returns.

   PREFERENCES LIVE IN Shell.opts, NOT IN THE SAVE. Mute and the
   per-category gains describe the PLAYER; the save describes the
   WORLD. A save that carried a mute flag would silence a
   different machine on import.
   ============================================================= */

/* Not `Audio`: that name is taken by the HTMLAudioElement
   constructor, and shadowing it is the kind of thing that works
   until somebody writes new Audio(). */
const Sound = (function () {
  "use strict";

  const CATS = ["ui", "room", "event"];
  /* flat keys, not a nested {gain:{ui:…}} object, because Shell merges
     stored options over the defaults SHALLOWLY: one nested object from an
     older build would replace the whole default and take its missing keys
     with it. */
  const GAIN_KEY = { ui: "gainUi", room: "gainRoom", event: "gainEvent" };

  let ctx = null, master = null, bus = {}, noise = null;
  let roomNodes = null, unlocked = false, dead = false;

  /* Shell may not be loaded (the editor, a headless check). Defaults then. */
  const FALLBACK = { mute: false, gainUi: 0.55, gainRoom: 0.3, gainEvent: 0.7, roomTone: true };
  function pref(k) {
    if (typeof Shell !== "undefined" && Shell.opt) {
      const v = Shell.opt(k);
      if (v !== undefined) return v;
    }
    return FALLBACK[k];
  }

  /* ---------- the graph ----------
     master -> destination, one gain per category hanging off it. Mute is a
     gain of zero on master rather than a disconnect, so a cue fired while
     muted still runs its envelope and stops; nothing accumulates. */
  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { dead = true; return false; }
    try { ctx = new AC(); } catch (e) { dead = true; return false; }
    master = ctx.createGain();
    master.gain.value = pref("mute") ? 0 : 1;
    master.connect(ctx.destination);
    CATS.forEach(c => {
      bus[c] = ctx.createGain();
      bus[c].gain.value = clamp(pref(GAIN_KEY[c]));
      bus[c].connect(master);
    });
    /* one second of white noise, reused by every cue that needs air */
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  const clamp = v => Math.max(0, Math.min(1, typeof v === "number" ? v : 0.5));
  /* !!ctx, not ctx: this is read by the checks as well as internally, and a
     function called available() must answer true or false, never null. */
  const live = () => !dead && !!ctx && ctx.state !== "closed";

  /* ---------- unlocking ----------
     An AudioContext created before a user gesture starts suspended and stays
     that way. init() only installs the listener; the context is built on the
     first real interaction, which is also the first moment we are allowed to
     make noise. */
  function init() {
    if (unlocked || dead || typeof window === "undefined") return;
    const go = () => {
      if (unlocked || dead) return;
      unlocked = true;
      if (!build()) return;
      if (ctx.state === "suspended" && ctx.resume) { try { ctx.resume(); } catch (e) {} }
      if (pref("roomTone")) room(true);
    };
    ["pointerdown", "keydown"].forEach(ev =>
      window.addEventListener(ev, go, { once: true, capture: true }));
  }

  /* ---------- cues ----------
     Every cue is a shape rather than a sample: a frequency, a curve and a
     duration. Kept deliberately dry and short. This is office equipment. */
  function blip(cat, f, dur, type, peak, f2) {
    if (!live()) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus[cat] || master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function thud(cat, dur, cut, peak) {
    if (!live()) return;
    const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(),
          g = ctx.createGain();
    s.buffer = noise;
    s.playbackRate.value = 1;
    f.type = "lowpass"; f.frequency.setValueAtTime(cut, t);
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(bus[cat] || master);
    s.start(t); s.stop(t + dur + 0.02);
  }

  const CUES = {
    /* the terminal answering you */
    click:  () => blip("ui", 1420, 0.028, "square", 0.055, 1180),
    tab:    () => blip("ui", 880, 0.034, "square", 0.045, 760),
    /* a control that refused */
    deny:   () => blip("ui", 190, 0.09, "square", 0.06, 150),
    /* a signature, a seal, a slot granted: something struck paper */
    stamp:  () => { thud("event", 0.13, 900, 0.16); blip("event", 240, 0.05, "triangle", 0.05, 190); },
    /* a division carried, and a division lost */
    aye:    () => { blip("event", 392, 0.13, "triangle", 0.07);
                    setTimeout(() => blip("event", 587.33, 0.2, "triangle", 0.06), 90); },
    nay:    () => { blip("event", 233.08, 0.16, "triangle", 0.07);
                    setTimeout(() => blip("event", 174.61, 0.32, "triangle", 0.06), 110); },
    /* the government has fallen */
    knell:  () => { blip("event", 110, 0.9, "sine", 0.1); thud("event", 0.5, 300, 0.09); }
  };

  function play(name) {
    if (!live() || !CUES[name]) return;
    try { CUES[name](); } catch (e) { /* a cue is never worth an exception */ }
  }

  /* ---------- the teletype ----------

     One short key-press per few characters while a block of text is being
     typed onto the screen. The REGISTER says whose voice it is, and each
     register sits in its own narrow band, so the reader learns to hear the
     difference between the House, the press and a broadcast before they
     read the byline.

     "silent" is a register like any other and is spelt out in the table as
     nothing, rather than left out of it: the President's text makes no
     sound, and that is a decision somebody made, not an omission.

     THIS IS STILL SUBJECT TO THE HARD RULE AT THE TOP OF THE FILE. It is
     called by the streamer, which is started by a player action - arriving
     at a decision, choosing, rising - and never by a draw function. A
     redraw re-renders the text complete and silent. */
  const BAND = {
    office:    1240,   /* the House and its members */
    press:     880,    /* a paper, in a hurry */
    primer:    1560,   /* the induction pack, teaching */
    broadcast: 660,    /* a voice from a deck, over a link */
    silent:    0       /* the presidency. Deliberate. */
  };

  function type(register) {
    const f = BAND[register];
    if (!live() || !f) return;
    /* plus or minus three per cent, so a run of characters is a texture
       rather than one note held down. */
    blip("ui", f * (0.97 + Math.random() * 0.06), 0.011, "square", 0.02);
  }

  /* ---------- room tone ----------
     Air handling, a long way off, through a bulkhead. Filtered noise for the
     plant and a low sine for the structure. It is meant to be noticed only
     when it stops, so it sits under everything.

     THE GAINS BELOW LOOK TOO HIGH AND ARE NOT. DO NOT "TIDY" THEM DOWN.

     A gain of 0.055 is a sensible peak for a CUE, which is a full-band
     oscillator: a 0.055 square through the 0.55 ui bus lands at -30 dBFS.
     The same number on the plant means something completely different,
     because the plant is white noise with a 220Hz lowpass in front of it
     and that filter throws away almost all of the signal:

       uniform noise            RMS 0.5774   (measured 0.5771 - the model holds)
       x lowpass 220 over 22k   x 0.1053     = 0.0608
       x 0.055 x room bus 0.3               = 0.00100  = -60 dBFS

     -60 dBFS is silence. The tone was running correctly and inaudibly for
     every player, thirty decibels under its own click, which is roughly a
     factor of eight in loudness. At 0.30 it lands at -45 dBFS: fifteen
     under the click, present in a quiet room, still gone the moment
     anything else happens.

     The 52Hz sine is a separate problem and only half fixable. Most laptop
     and monitor speakers reproduce nothing at 52Hz at all, so on that
     hardware the plant has to carry the whole effect; on headphones the
     sine is what makes it a large pressurised object rather than a hiss.
     0.05 is as far as it can go before it muddies the cues. */
  function room(on) {
    if (!live()) { return; }
    if (!on) {
      if (roomNodes) {
        try { roomNodes.forEach(n => n.stop && n.stop()); } catch (e) {}
        roomNodes = null;
      }
      return;
    }
    if (roomNodes) return;
    try {
      const t = ctx.currentTime;
      const s = ctx.createBufferSource(), lp = ctx.createBiquadFilter(),
            hp = ctx.createBiquadFilter(), g = ctx.createGain(),
            o = ctx.createOscillator(), og = ctx.createGain();
      s.buffer = noise; s.loop = true;
      lp.type = "lowpass";  lp.frequency.value = 220;
      hp.type = "highpass"; hp.frequency.value = 40;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.30, t + 2.5);    /* fade in, never a cut */
      o.type = "sine"; o.frequency.value = 52;
      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(0.05, t + 2.5);
      s.connect(lp); lp.connect(hp); hp.connect(g); g.connect(bus.room);
      o.connect(og); og.connect(bus.room);
      s.start(t); o.start(t);
      roomNodes = [s, o];
    } catch (e) { roomNodes = null; }
  }

  /* ---------- preferences ----------
     Shell owns the storage. These only move the value into the graph, so a
     headless run with no graph is a no-op and not an error. */
  function setMute(on) {
    if (!live()) return;
    try { master.gain.setTargetAtTime(on ? 0 : 1, ctx.currentTime, 0.02); } catch (e) {}
  }
  function setGain(cat, v) {
    if (!live() || !bus[cat]) return;
    try { bus[cat].gain.setTargetAtTime(clamp(v), ctx.currentTime, 0.02); } catch (e) {}
  }
  function apply() {
    setMute(!!pref("mute"));
    CATS.forEach(c => setGain(c, pref(GAIN_KEY[c])));
    room(!!pref("roomTone"));
  }

  return {
    init: init, play: play, type: type, room: room,
    registers: Object.keys(BAND),
    setMute: setMute, setGain: setGain, apply: apply,
    categories: CATS, gainKey: GAIN_KEY,
    /* for the checks: is there a graph at all */
    available: () => live()
  };
})();
