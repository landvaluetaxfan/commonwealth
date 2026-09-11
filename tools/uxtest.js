/* CAN A PERSON USE IT.

   The half of the DOM checks that is not about whether the game drew: the
   status bar, the audio bus, focus restoration across a re-render, one
   activation path, the division dialog, text streaming, and the tooltip
   layer. Rendering and saves are in tools/uitest.js; both share
   tools/harness.js.                                                      */
const H = require("./harness.js");
const { fs, path, root, w, $, ok, CONTENT } = H;

H.banner("INTERFACE AND INTERACTION");
H.boot();
H.newGame();

/* =============================================================
   UI-0: THE STATUS BAR, THE AUDIO BUS, FOCUS AND TAB ORDER
   ============================================================= */

/* THE AUDIO BUS MUST SURVIVE HAVING NO AUDIO.

   jsdom implements no AudioContext, which is exactly the condition a
   locked-down or embedded browser presents. Every entry point has to be a
   no-op rather than an exception: a player with no Web Audio still has a
   game, they just have a quiet one. Any throw here also surfaces as a
   window error at the bottom of this file. */
try {
  ok("audio module loaded", w.eval("typeof Sound") === "object");
  ok("no audio context in this environment", w.eval("Sound.available()") === false);
  w.eval('Sound.init(); Sound.play("click"); Sound.play("aye"); Sound.play("nope");');
  w.eval('Sound.room(true); Sound.room(false); Sound.apply();');
  w.eval('Sound.setMute(true); Sound.setGain("ui", 0.4);');
  ok("a headless run with no audio context does not throw", true);
} catch (e) { ok("a headless run with no audio context does not throw", false, e.message); }

/* NO SOUND MAY COME OUT OF A REDRAW.

   This is the rule at the top of js/audio.js, tested rather than inspected.
   A redraw happens for reasons that have nothing to do with the player -
   switching tabs, loading a slot, a mirrored panel repainting itself - so a
   cue fired from a draw function fires at random and four times over. The
   spy replaces Sound.play at the module boundary, which catches a call made
   transitively through Papers or the Concordance as readily as a direct one.

   Sound.type is spied too. The teletype is a second way to make a noise and
   would otherwise be a second way to break the rule: the text streamer is
   started by an action and never by a renderer, and this is what holds it
   to that. */
try {
  w.eval('window.__cues = []; Sound.play = function (n) { window.__cues.push(n); };' +
         'Sound.type = function (r) { window.__cues.push("type:" + r); };');
  w.eval('window.__cues.length = 0; UI.boot(UI.state(), CONTENT);');
  const fromDraw = w.eval("window.__cues.slice()");
  ok("a full redraw makes no sound", fromDraw.length === 0, fromDraw.join(", "));

  /* and the spy is live, so the assertion above means something */
  w.eval('window.__cues.length = 0;');
  w.document.querySelector('.tab[data-t="cham"]')
   .dispatchEvent(new w.MouseEvent("pointerdown", { bubbles: true }));
  ok("a player action does make one", w.eval("window.__cues.length") === 1,
     w.eval("JSON.stringify(window.__cues)"));
} catch (e) { ok("audio fires from actions and not from redraws", false, e.message); }

/* THE STATUS LINE. One writer, three levels, transient on top. */
try {
  w.document.querySelector('.tab[data-t="cham"]').click();
  const ambient = $("#sb-msg").textContent;
  ok("the status line carries an ambient message", ambient.length > 10,
     JSON.stringify(ambient));
  w.eval('UI.setStatus("A DIVISION HAS BEEN CALLED", "transient")');
  ok("a transient message wins", $("#sb-msg").textContent === "A DIVISION HAS BEEN CALLED" &&
     $("#sb-msg").classList.contains("live"));
  w.eval('UI.setStatus("", "transient")');
  ok("and the ambient one comes back", $("#sb-msg").textContent === ambient &&
     !$("#sb-msg").classList.contains("live"));

  /* setStatus is called from more than one place. Counted in the source
     rather than at runtime: most of the call sites need a division or a
     signature to reach, and the acceptance is about the shape of the code. */
  const uisrc = fs.readFileSync(path.join(root, "js/ui.js"), "utf8");
  const sites = (uisrc.match(/setStatus\(/g) || []).length -
                (uisrc.match(/function setStatus\(/g) || []).length;
  ok("setStatus is called from at least three sites", sites >= 3, sites + " calls");
} catch (e) { ok("the status line", false, e.message); }

/* PLAYER PREFERENCES LIVE IN Shell.opts, NOT IN THE SAVE.

   Mute describes the person at the terminal; the save describes the
   Commonwealth. Asserted here rather than in roundtrip.js, which tests
   content serialisation and has no view of a browser's storage at all. */
try {
  $("#tb-options").click();
  const mute = w.document.querySelector('#tb-optpanel [data-opt="mute"]');
  const lvl  = w.document.querySelector('#tb-optpanel [data-lvl="gainEvent"]');
  ok("the options panel offers sound", !!mute && !!lvl);
  mute.checked = true;
  mute.dispatchEvent(new w.Event("change", { bubbles: true }));
  lvl.value = "25";
  lvl.dispatchEvent(new w.Event("input", { bubbles: true }));

  const stored = JSON.parse(w.localStorage.getItem("wm.opts") || "{}");
  ok("mute and gains are written to Shell.opts",
     stored.mute === true && stored.gainEvent === 0.25, JSON.stringify(stored));

  const save = JSON.parse(w.eval("Engine.save(UI.state())"));
  ok("and never to the save state",
     !("mute" in save) && !("gainEvent" in save) && !("opts" in save));

  /* across a reload: Shell.boot re-reads localStorage */
  w.eval("Shell.boot(CONTENT)");
  ok("they survive a reload", w.eval('Shell.opt("mute")') === true &&
     w.eval('Shell.opt("gainEvent")') === 0.25);
} catch (e) { ok("audio preferences persist in Shell.opts", false, e.message); }

/* SELECTION MEANS ONE THING.

   .sel is the solid inverted block, and it belongs only to a row that a click
   selects. It used to be borrowed for three other meanings - a disloyal
   current, an instrument in force, a vacant post - which is exactly the kind
   of drift a check should catch the second time it happens. Both halves are
   asserted: what is on the page, and what the source is allowed to emit. */
try {
  const rows = [...w.document.querySelectorAll("tr.sel")];
  const stray = rows.filter(tr => !tr.matches("[data-bill],[data-station],[data-doc],[data-cons]"));
  ok(".sel is only on a row a click selects", rows.length >= 2 && stray.length === 0,
     rows.length + " selected, " + stray.length + " on rows that do nothing");

  /* four quoted literals, in the four tables that select a row: #gov-bills,
     #orbit-table, #pp-list, #cons-table. A fifth is a regression. */
  const jssrc = ["js/ui.js", "js/papers.js", "js/editor.js", "js/shell.js",
                 "js/encyclopedia.js", "js/orbitchart.js"]
    .map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n");
  const lits = jssrc.match(/["']sel["']/g) || [];
  ok("nothing else emits a sel class", lits.length === 4, lits.length + " literals");

  /* the three replacements differ in form as well as hue - a gutter, a hatch,
     a ghost - so they cannot be read as paler selections */
  const css2 = fs.readFileSync(path.join(root, "css/terminal.css"), "utf8");
  ["tr.warn td", "tr.inforce td", "tr.vacant td"].forEach(sel =>
    ok("a rule of its own for " + sel, css2.includes(sel)));
  ok("selection is distinct from all three",
     /tr\.sel td\{background:var\(--bar\)/.test(css2));

  /* NOTHING ABOUT PICKING A ROW FADES. A selection that eases in is one you
     are not sure you made, and the same goes for focus. */
  const anim = (css2.match(/[^}]*\.(sel|warn|inforce|vacant)[^{}]*\{[^}]*transition[^}]*\}/g) || [])
    .concat(css2.match(/[^}]*:focus[a-z-]*[^{}]*\{[^}]*transition[^}]*\}/g) || []);
  ok("no transition on a selection or a focus state", anim.length === 0, anim.join(" | "));
} catch (e) { ok("selection semantics", false, e.message); }

/* FOCUS RESTORATION.

   drawAll() replaces twenty-five containers on every state change, so
   before this phase focus went to document.body every single time. These
   are the two cases that matter: the row is still there, and the row is
   gone. */
try {
  /* --- the row survives --- */
  w.eval(`
    var rows = Focus.rows("orbit-table");
    window.__key = rows[8].dataset.station;
    Focus.activate("orbit-table", window.__key);
    window.__before = document.activeElement.getAttribute("data-station");
  `);
  ok("activating a row puts focus on it",
     w.eval("window.__before") === w.eval("window.__key"), w.eval("window.__before"));

  w.eval("Engine.advance(UI.state(), CONTENT); UI.boot(UI.state(), CONTENT);");
  const after = w.eval('document.activeElement.getAttribute && document.activeElement.getAttribute("data-station")');
  ok("focus is on the same logical row after a full state advance",
     after === w.eval("window.__key"),
     "wanted " + w.eval("window.__key") + ", got " +
     (w.document.activeElement === w.document.body ? "document.body" : after));
  ok("and the selection is on that row too",
     w.eval('Focus.selected("orbit-table")') === w.eval("window.__key"));

  /* --- the row is gone ---
     The register is state-shaped: making an instrument adds a row and
     unmaking it takes that row away. Focus should land beside where it
     was, never on the body. */
  w.eval(`
    var st = UI.state();
    window.__si = Object.keys(st.instruments)[0];
    st.instruments[window.__si].made = true;
    st.instruments[window.__si].madeAt = st.sitting;
    UI.boot(st, CONTENT);
    Focus.activate("pp-list", window.__si);
    window.__had = document.activeElement.getAttribute("data-doc");
    window.__siblings = Focus.rows("pp-list").length;
  `);
  ok("the register carries the instrument, and it has focus",
     w.eval("window.__had") === w.eval("window.__si") && w.eval("window.__siblings") > 1,
     w.eval("window.__had") + " of " + w.eval("window.__siblings") + " rows");

  w.eval(`
    var st2 = UI.state();
    st2.instruments[window.__si].made = false;
    Engine.advance(st2, CONTENT);
    UI.boot(st2, CONTENT);
  `);
  const gone = w.document.activeElement;
  ok("the row is gone", w.eval(`Focus.rowFor("pp-list", window.__si)`) === null);
  ok("focus landed on a surviving sibling, not the body",
     gone !== w.document.body && !!gone.closest && !!gone.closest("#pp-list"),
     gone === w.document.body ? "document.body" : gone.tagName + " " + (gone.id || gone.className));

  /* --- scroll ---
     Reproduces the real failure deterministically: a render clobbers the
     scroll position (a browser clamps it when the new content is
     shorter), and the wrapper has to put it back. */
  const scrollers = w.eval(`
    (function () {
      var ns = [].slice.call(document.querySelectorAll(
        "#viewport,.pbody,#cx-body,#cx-side,#pp-doc,.callsheet,#tabstrip"));
      ns.forEach(function (n, i) { n.scrollTop = 40 + i; });
      Focus.around(function () { ns.forEach(function (n) { n.scrollTop = 0; }); });
      return ns.filter(function (n, i) { return n.scrollTop !== 40 + i; }).length +
             "/" + ns.length;
    })()
  `);
  ok("scroll survives a re-render on every scrollable panel",
     scrollers.split("/")[0] === "0" && +scrollers.split("/")[1] > 4,
     scrollers.split("/")[1] + " panels, " + scrollers.split("/")[0] + " lost");
} catch (e) { ok("focus restoration", false, e.message); }

/* THE CONCORDANCE WITHOUT A MOUSE.

   101 links against 3 focusable controls before this phase: the article
   links are <a> with no href, which are not focusable and not
   activatable. tabindex makes them reachable and Enter sends them down
   the delegated click path the mouse already uses - not a second one. */
try {
  /* the harness stubs anchor clicks so that a download link cannot throw;
     deleting the override falls back to HTMLElement's real one. */
  delete w.HTMLAnchorElement.prototype.click;

  const links = [...w.document.querySelectorAll("#s-cx [data-go], #s-cx [data-anchor]")];
  const unreachable = links.filter(a => a.getAttribute("tabindex") !== "0");
  ok("every Concordance link is a tab stop", links.length > 50 && unreachable.length === 0,
     links.length + " links, " + unreachable.length + " unreachable");

  const nav = w.document.querySelector("#cx-nav .cx-navlink:not(.on)[data-go]");
  const want = nav.dataset.go;
  nav.focus();
  ok("a Concordance link can take focus", w.document.activeElement === nav);
  nav.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  ok("Enter follows the link", !!w.document.querySelector('#cx-nav .cx-navlink.on[data-go="' + want + '"]'),
     "wanted " + want);
  ok("and focus moves into the article it opened",
     w.document.activeElement === w.document.getElementById("cx-article"),
     w.document.activeElement.id || w.document.activeElement.tagName);

  /* ONE ACTIVATION PATH. #cx-body links used to be bound twice - a
     delegated capture listener in ui.js and a per-node bubble listener in
     encyclopedia.js - so a single click rendered the article twice. */
  const src = fs.readFileSync(path.join(root, "js/encyclopedia.js"), "utf8");
  ok("the Concordance binds [data-go] in exactly one file",
     !/querySelectorAll\("#cx-body \[data-go\]"\)/.test(src));
} catch (e) { ok("Concordance keyboard navigation", false, e.message); }

/* ENTER AND A CLICK REACH THE SAME HANDLER, ONCE EACH.

   The failure this guards against is a keyboard path that both calls the
   handler and synthesises a click, so one press does the thing twice. */
try {
  w.eval(`
    window.__hits = [];
    Focus.region("pp-list", { rows: "tr[data-doc]", key: function (tr) { return tr.dataset.doc; },
                              activate: function (k) { window.__hits.push(k); } });
    var rows = Focus.rows("pp-list");
    window.__pick = rows[rows.length - 1].dataset.doc;
    window.__hits.length = 0;
    rows[rows.length - 1].click();
  `);
  ok("a click fires the handler exactly once",
     w.eval("window.__hits.length") === 1 && w.eval("window.__hits[0]") === w.eval("window.__pick"),
     JSON.stringify(w.eval("window.__hits")));

  w.eval(`
    window.__hits.length = 0;
    var r = Focus.rowFor("pp-list", window.__pick);
    r.focus();
    r.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  `);
  ok("and Enter fires the same handler exactly once",
     w.eval("window.__hits.length") === 1 && w.eval("window.__hits[0]") === w.eval("window.__pick"),
     JSON.stringify(w.eval("window.__hits")));

  w.eval(`
    window.__hits.length = 0;
    var r2 = Focus.rowFor("pp-list", window.__pick);
    r2.focus();
    r2.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
  `);
  ok("an arrow key moves selection by one, once",
     w.eval("window.__hits.length") === 1 && w.eval("window.__hits[0]") !== w.eval("window.__pick"),
     JSON.stringify(w.eval("window.__hits")));

  /* put the real region back */
  w.eval(`Focus.region("pp-list", { rows: "tr[data-doc]",
     key: function (tr) { return tr.dataset.doc; },
     activate: function () { Papers.render(UI.state(), CONTENT); } });`);
} catch (e) { ok("one activation path", false, e.message); }

/* UI-1: TIME, STREAMING AND THE DIVISION.

   The whole design of the division dialog is that THE STATE RESOLVES
   FIRST and the dialog reads out numbers that are already final. So the
   test that matters is not "does the animation look right" - it is
   whether the presentation can move a number. It cannot, and here is why
   that is checkable: the same division run twice from the same save, once
   with sound and streaming on and once with both off, has to produce
   byte-identical state, and skipping it has to produce that same state
   again. The engine has no Math.random in it, so identical is the
   standard, not "close enough". */
try {
  w.eval('window.__snap = Engine.save(UI.state()); window.__bill = CONTENT.bills[0].id;');

  const divide = (mute, stream, skip, flag) => w.eval(`
    (function () {
      Shell.setOpt("mute", ${mute}); Shell.setOpt("stream", ${stream});
      var st = Engine.load(window.__snap, CONTENT);
      ${flag ? 'st.flags["' + flag + '"] = true;' : ""}
      UI.boot(st, CONTENT);
      Focus.activate("gov-bills", window.__bill);
      var b = document.getElementById("btn-divide");
      if (!b) return "NO DIVIDE BUTTON";
      b.click();
      window.__pop = document.getElementById("dv-pop");
      window.__stalled = !!document.querySelector(".wait-seg i.stall");
      ${skip ? "Wait.skip();" : "Wait.skip();"}
      return Engine.save(UI.state());
    })()
  `);

  const loud = divide(false, true, false);
  ok("the division resolves at all", loud !== "NO DIVIDE BUTTON" && loud.length > 100,
     String(loud).slice(0, 60));
  const quiet = divide(true, false, false);
  ok("muted and unstreamed reaches the same final state, byte for byte",
     quiet === loud, quiet === loud ? "" : "the presentation moved a number");
  const skipped = divide(false, true, true);
  ok("an instant skip reaches it too", skipped === loud);

  /* The screen has to agree with the engine after a skip, not just the
     state. Skip runs every remaining step and only then detaches the
     dialog, so the node still carries what it was left showing. */
  const shownPop = w.eval("window.__pop && window.__pop.textContent");
  const want = w.eval(`
    (function () {
      var d = Engine.division(Engine.load(window.__snap, CONTENT), CONTENT, window.__bill);
      return d.popular.aye + " / " + d.popular.need;
    })()
  `);
  ok("and the running total on screen is the engine's own number",
     shownPop === want, "screen " + shownPop + ", engine " + want);

  /* TIER 3. A stall the player cannot cause is an annoyance; one the
     fiction chose is a scene. It fires from a content flag and from
     nothing else - there is no roll to get lucky on. */
  divide(false, true, true);
  ok("no stall without the flag", w.eval("window.__stalled") === false);
  divide(false, true, true, "division_stalled");
  ok("the stall fires from its flag", w.eval("window.__stalled") === true);

  const src = fs.readFileSync(path.join(root, "js/wait.js"), "utf8");
  ok("and nothing in the dialog rolls dice", !/Math\.random/.test(src));
} catch (e) { ok("the division dialog", false, e.message); }

/* STREAMING IS A PLAYER PREFERENCE, so it lives in Shell.opts with the
   audio levels and not in the save. Same rule, same place, same test. */
try {
  w.eval('Shell.setOpt("stream", false); Shell.setOpt("streamSpeed", "slow");');
  const stored = JSON.parse(w.localStorage.getItem("wm.opts") || "{}");
  const save = JSON.parse(w.eval("Engine.save(UI.state())"));
  ok("streaming settings are written to Shell.opts",
     stored.stream === false && stored.streamSpeed === "slow", JSON.stringify(stored));
  ok("and never to the save state",
     !("stream" in save) && !("streamSpeed" in save) && !("opts" in save));
  w.eval("Shell.boot(CONTENT)");
  ok("they survive a reload",
     w.eval('Shell.opt("stream")') === false && w.eval('Shell.opt("streamSpeed")') === "slow");
  w.eval('Shell.setOpt("stream", true); Shell.setOpt("streamSpeed", "normal");');
} catch (e) { ok("streaming preferences", false, e.message); }

/* THE TELETYPE'S REGISTERS. "silent" is a register, spelt out, not an
   omission - the President's text makes no sound because somebody decided
   that, and the table has to say so out loud or the next person to touch
   it will "fix" the gap. */
try {
  ok("silent is a register the audio bus knows",
     w.eval("Sound.registers").indexOf("silent") >= 0, w.eval("Sound.registers").join(" "));
  ok("the President is silent", w.eval('Stream.registerFor({ speaker: "tenaya" })') === "silent");
  ok("the press is not", w.eval('Stream.registerFor({ speaker: "ceyhan" })') === "press");
  ok("and content can override a speaker's default",
     w.eval('Stream.registerFor({ speaker: "ceyhan", register: "broadcast" })') === "broadcast");
  ok("an unattributed block still has a voice",
     w.eval("Stream.registerFor({})") === "office");

  /* The rate caps are the difference between a keyboard and a buzzer, so
     they are written down as constants rather than tuned inline. */
  const ssrc = fs.readFileSync(path.join(root, "js/stream.js"), "utf8");
  ok("the cue rate is capped in both directions",
     /CUE_MIN_CHARS\s*=\s*3/.test(ssrc) && /CUE_MAX_PER_SEC\s*=\s*15/.test(ssrc));
  /* The two files have to agree about the default, and they are not in a
     position to check each other at run time: Shell owns the stored value
     and Stream owns the fallback for when there is no Shell at all. */
  const shsrc = fs.readFileSync(path.join(root, "js/shell.js"), "utf8");
  const shellDefault = (shsrc.match(/streamSpeed:\s*"(\w+)"/) || [])[1];
  const streamFallback = (ssrc.match(/opt\("streamSpeed",\s*"(\w+)"\)/) || [])[1];
  ok("the streaming default agrees in both files",
     shellDefault === streamFallback && !!shellDefault,
     "shell " + shellDefault + ", stream " + streamFallback);
  ok("and it is a speed that exists",
     w.eval("Stream.speeds").indexOf(shellDefault) >= 0, shellDefault);
  ok("streaming off renders instantly rather than slowly",
     w.eval('(function(){ Shell.setOpt("stream", false); var d = document.createElement("div");' +
            'd.textContent = "a sentence that would take a moment"; document.body.appendChild(d);' +
            'Stream.reveal(d, {}); var t = d.textContent; Shell.setOpt("stream", true);' +
            'd.remove(); return t; })()') === "a sentence that would take a moment");
} catch (e) { ok("the teletype", false, e.message); }

/* THE TERMINAL EXPLAINING ITSELF.

   The failure this guards against is a data-tip attribute pointing at a
   key nobody wrote, which shows nothing and looks exactly like a token
   that simply has no explanation yet. Every annotation on the page has to
   resolve, and every article a tip names has to exist. */
try {
  const anchors = [...w.document.querySelectorAll("#shell [data-tip]")];
  const keys = [...new Set(anchors.map(a => a.getAttribute("data-tip")))];
  ok("the readouts are annotated", anchors.length > 20 && keys.length > 10,
     anchors.length + " anchors, " + keys.length + " distinct keys");

  const dangling = keys.filter(k => !w.eval('Tips.find("' + k + '")'));
  ok("every annotation resolves to an explanation", dangling.length === 0,
     dangling.join(", "));

  /* AND EVERY EXPLANATION IS REACHABLE. A key nobody anchors is a tip
     nobody will ever see; it reads as coverage and is not. `prayer` is
     the one legitimate exception - its flag only exists while an order is
     in force - so it is proved separately below rather than excused. */
  const anchored = new Set(anchors.map(a => a.getAttribute("data-tip")));
  const orphan = w.eval("Tips.keys()").filter(k => !anchored.has(k) && k !== "prayer");
  ok("and every explanation is anchored to something", orphan.length === 0,
     orphan.join(", "));

  w.eval(`
    var st = UI.state(), k = Object.keys(st.instruments)[0];
    st.instruments[k].made = true; st.instruments[k].inForce = true;
    st.instruments[k].prayerCloses = st.sitting + 3;
    UI.boot(st, CONTENT);
  `);
  ok("the prayer window explains itself once there is one",
     !!w.document.querySelector('[data-tip="prayer"]'));

  /* NO SCREEN SHIPS WITH NOTHING. The Concordance is the deliberate
     exception: it is in-world, on white paper, in a serif, and it is
     something civilians made. Terminal chrome does not belong inside it. */
  const bare = [...w.document.querySelectorAll(".screen")]
    .filter(sc => sc.id !== "s-cx" && !sc.querySelector("[data-tip]"))
    .map(sc => sc.id);
  ok("every screen but the Concordance explains something", bare.length === 0,
     bare.join(", "));
  ok("and the Concordance explains nothing, on purpose",
     w.document.querySelectorAll("#s-cx [data-tip]").length === 0);

  /* A tip may hand off to the Concordance rather than restate it. If it
     names an article, the article has to be there. */
  const bad = w.eval(`
    (function () {
      return Tips.keys().map(function (k) {
        var t = Tips.find(k);
        if (!t || !t.go) return null;
        return CONTENT.encyclopediaById[t.go] ? null : k + " -> " + t.go;
      }).filter(Boolean).join(", ");
    })()
  `);
  ok("every Concordance hand-off names a real article", bad === "", bad);

  /* THE FALLTHROUGH: the terminal explains the terminal, the world
     explains the world. An entry with no body of its own has to come back
     with the glossary's or the Concordance's words. */
  const dual = w.eval('Tips.find("dual")');
  ok("a world term falls through to the Concordance",
     dual && dual.body.length > 30 && dual.go === "dual_majority",
     dual && dual.body.slice(0, 50));
  const closure = w.eval('Tips.find("closure")');
  ok("and to the glossary when that is where it lives",
     closure && closure.body.length > 20, closure && closure.body.slice(0, 50));
  const loyalty = w.eval('Tips.find("loyalty")');
  ok("a terminal term is explained here, in terms of the engine",
     loyalty && /75/.test(loyalty.body) && /100/.test(loyalty.body),
     loyalty && loyalty.body.slice(0, 50));

  /* KEYBOARD PARITY, and the mode that buys it. A tooltip only a mouse
     can reach is a reward for owning a mouse; a column heading that is
     permanently in the tab order is fifty stops between the player and
     the button they wanted. ? is the trade. */
  w.eval('Shell.setOpt("tips", true);');
  /* Only the screen you are looking at is marked - putting a hidden tab's
     headings into the tab order would be worse than not marking them. */
  w.document.querySelector('.tab[data-t="gov"]').click();
  const th = w.document.querySelector("#gov-bills th[data-tip]");
  ok("a heading is not a tab stop by default", th.getAttribute("tabindex") === null);

  w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "?", bubbles: true }));
  ok("? puts the readouts into the tab order",
     w.eval("Tips.explaining()") === true && th.getAttribute("tabindex") === "0",
     "tabindex " + th.getAttribute("tabindex"));
  const marked = [...w.document.querySelectorAll('[data-tip][tabindex="0"]')];
  ok("all of the ones on screen, and none with a positive value", marked.length > 12 &&
     marked.every(n => n.getAttribute("tabindex") === "0"), marked.length + " marked");
  const hidden = [...w.document.querySelectorAll('.screen:not(.on) [data-tip][tabindex]')];
  ok("and nothing on a screen you cannot see", hidden.length === 0, hidden.length + " marked");

  th.focus();
  const cardShown = w.document.getElementById("tipcard");
  ok("focusing an annotated readout shows the card",
     !!cardShown && cardShown.hidden === false,
     !cardShown ? "no card" : cardShown.hidden ? "still hidden" : "");
  ok("and the card says which readout it is describing",
     th.getAttribute("aria-describedby") === "tipcard");

  /* The mode has to survive a redraw, because a redraw replaces every one
     of the nodes it just marked. */
  w.eval("UI.boot(UI.state(), CONTENT)");
  const th2 = w.document.querySelector("#gov-bills th[data-tip]");
  ok("and the mode survives a re-render", th2.getAttribute("tabindex") === "0");

  w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  ok("Escape leaves the mode and takes the tab stops with it",
     w.eval("Tips.explaining()") === false &&
     w.document.querySelector("#gov-bills th[data-tip]").getAttribute("tabindex") === null);
  ok("and the card is down", w.document.getElementById("tipcard").hidden === true);

  /* The card must never become a place focus can land. */
  const css = fs.readFileSync(path.join(root, "css/terminal.css"), "utf8");
  ok("the card cannot be hovered or clicked", /#tipcard\{[^}]*pointer-events:none/.test(css));
  const tsrc = fs.readFileSync(path.join(root, "js/tips.js"), "utf8");
  ok("and is never given a tabindex", !/tipcard[\s\S]{0,300}tabindex/.test(tsrc));

  /* Off means off. */
  w.eval('Shell.setOpt("tips", false);');
  w.eval("Tips.hide()");
  th.focus();
  ok("turning them off turns them off",
     w.document.getElementById("tipcard").hidden === true);
  const stored = JSON.parse(w.localStorage.getItem("wm.opts") || "{}");
  ok("and that is a player preference, not save state", stored.tips === false);
  w.eval('Shell.setOpt("tips", true);');
} catch (e) { ok("tips", false, e.message); }

/* TAB ORDER AND FOCUS.

   Every control the player can reach with a pointer this phase is a real
   button or input, so tab order is document order and needs no tabindex to
   arrange it. A POSITIVE tabindex is the thing that breaks that: it jumps
   ahead of the whole document and reorders everything after it. */
try {
  const src = ["index.html", "js/ui.js", "js/shell.js", "js/papers.js",
               "js/encyclopedia.js", "js/orbitchart.js"]
    .map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n");
  const pos = src.match(/tabindex\s*=\s*["'`]?\s*[1-9]/g) || [];
  ok("no positive tabindex reorders the document", pos.length === 0, pos.join(" "));

  /* one rule owns focus, and it is dotted so that it can never be confused
     with a selected row */
  const css = fs.readFileSync(path.join(root, "css/terminal.css"), "utf8");
  ok("focus is a dotted outline", /:focus-visible\{outline:1px dotted/.test(css));
  const solid = (css.match(/:focus[a-z-]*\{[^}]*outline:\s*\d+px solid/g) || []);
  ok("nothing else draws a solid focus ring", solid.length === 0, solid.join(" | "));

  /* The shell's own chrome: three in the topbar, seven tabs, and the
     Concordance's back and go. All twelve are real buttons, so they are in
     tab order by being in the document, and none of them needs arranging.
     jsdom has no layout, so this counts them rather than measuring them. */
  const chrome = [...w.document.querySelectorAll(
    "#titlebar button, #tabstrip button, #cx-side button")]
    .filter(b => !b.closest("#tb-optpanel"));   /* the popover is not chrome */
  ok("every control in the shell chrome is a real button",
     chrome.length === 12 && chrome.every(b => b.tagName === "BUTTON"),
     chrome.length + " buttons");
  ok("the search field is a real input",
     (w.document.querySelector("#cx-q") || {}).tagName === "INPUT");
  const bad = [...w.document.querySelectorAll('#shell [role="button"], #shell [onclick]')];
  ok("nothing is an improvised control", bad.length === 0,
     bad.map(n => n.tagName).join(" "));
} catch (e) { ok("tab order and focus", false, e.message); }


H.finish("the interface is healthy");
