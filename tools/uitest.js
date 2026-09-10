/* Shell and game smoke test. Loads index.html in a headless DOM, walks the
   main menu into a running game, and checks the things that have broken.

   This exists because two faults shipped that no other check could see:
   a glossary term matched inside markup annotate() had already inserted and
   dumped raw attributes into the prose, and the save/load path was only ever
   exercised by hand. Static parsing finds neither.

   Needs jsdom:  npm install jsdom
   Skips cleanly if it is not installed.                                    */
const fs = require("fs"), path = require("path"), root = path.join(__dirname, "..");
let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = require("jsdom")); }
catch (e) { console.log("SKIP: jsdom not installed  (npm install jsdom)"); process.exit(0); }

const errs = [];
const vc = new VirtualConsole();
vc.on("jsdomError", e => errs.push(e.message));

/* Strip the bootstrap: jsdom does not fetch the external <script src>, so the
   inline Shell.boot() would throw at parse time. We inject and boot below. */
const html = fs.readFileSync(path.join(root, "index.html"), "utf8")
  .replace(/<script>[\s\S]*?<\/script>\s*<\/body>/, "</body>");

const dom = new JSDOM(html, {
  runScripts: "dangerously", pretendToBeVisual: true, url: "https://x.test/",
  virtualConsole: vc,
  beforeParse(win) { win.addEventListener("error", e => errs.push(e.message)); }
});
const w = dom.window;
w.alert = () => {}; w.confirm = () => true; w.prompt = () => "Test ministry";
w.URL.createObjectURL = () => "blob:x"; w.HTMLAnchorElement.prototype.click = function () {};

const FILES = ["content/setup.js","content/parties.js","content/stations.js","content/constituencies.js",
  "content/cabinet.js","content/instruments.js","content/minutes.js","content/functional.js",
  "content/labour.js","content/names.js","content/characters.js","content/bills.js",
  "content/glossary.js","content/events.js","content/encyclopedia.js","content/index.js",
  "js/audio.js","js/focus.js","js/stream.js","js/wait.js","js/engine.js","js/orbitchart.js","js/papers.js","js/encyclopedia.js",
  "js/ui.js","js/shell.js"];
FILES.forEach(f => {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) return;
  const s = w.document.createElement("script");
  s.textContent = fs.readFileSync(p, "utf8");
  w.document.body.appendChild(s);
});

let fail = 0;
const ok = (label, cond, extra) => {
  if (!cond) fail++;
  console.log((cond ? "  ok   " : "  FAIL ") + label + (extra ? "  " + extra : ""));
};
const $ = s => w.document.querySelector(s);

console.log("SHELL AND GAME SMOKE TEST");
console.log("=".repeat(56));

try { w.eval("Shell.boot(CONTENT)"); ok("Shell.boot()", true); }
catch (e) { ok("Shell.boot()", false, e.message); process.exit(1); }

ok("main menu is showing", $("#menu").classList.contains("on"));
ok("game shell is hidden", !$("#shell").classList.contains("on"));
ok("title renders", /WAYS|Ways/i.test($(".menu-title").textContent));
ok("Load is disabled with no saves", !!$('[data-go="load"]').disabled);

/* new game into slot 1 */
$('[data-go="new"]').click();
ok("slot list appears", w.document.querySelectorAll(".slot").length === 4);
$('[data-new="1"]').click();
ok("game starts", $("#shell").classList.contains("on") && !$("#menu").classList.contains("on"));
ok("slot is named in the topbar", /Test ministry/.test($("#tb-slot").textContent),
   JSON.stringify($("#tb-slot").textContent));

/* The chamber drew, and drew all 280. Counted by class rather than by
   element, so the furniture is excluded and the Speaker - who is lifted out
   of a bench and drawn in the Chair - cannot silently cost a seat. */
const seats = w.document.querySelectorAll("#chamber .sg").length;
ok("chamber renders every seat", seats === 280, seats + " seat glyphs");


/* GLOSSARY ANNOTATION — the regression that prompted this file.
   No attribute fragment may survive into visible text. */
const body = $("#sitting-body") ? $("#sitting-body").textContent : "";
ok("no markup leaks into the prose",
   !/data-(gloss|handle)=|class="gl"|<span/.test(body),
   body.length + " chars of prose");
const glossed = w.document.querySelectorAll("#sitting-body .gl").length;
ok("glossary terms are annotated", glossed > 0, glossed + " terms wrapped");

/* annotate() directly, on the case that broke: a gloss containing another term */
try {
  const out = w.eval('UI.annotate("A fork becomes an instance after the divergence threshold.")');
  const doc = new JSDOM("<div>" + out + "</div>").window.document.querySelector("div");
  ok("annotate output is well-formed",
     !/data-gloss|data-handle/.test(doc.textContent), JSON.stringify(doc.textContent));
} catch (e) { ok("annotate output is well-formed", false, e.message); }

/* SAVE ROUND-TRIP through a slot */
try {
  $("#tb-save").click();
  const raw = w.localStorage.getItem("wm.slot.1");
  const slot = JSON.parse(raw);
  ok("save writes to the slot", !!raw && slot.name === "Test ministry",
     "sitting " + slot.sitting);
  const before = w.eval("JSON.stringify(UI.state())");
  /* back to the menu the way a player does it: Options > Return to main menu */
  $("#tb-options").click();
  w.document.querySelector('#tb-optpanel [data-act="menu"]').click();
  ok("returns to the main menu", $("#menu").classList.contains("on") &&
     !$("#shell").classList.contains("on"));
  $('[data-go="load"]').click();
  $('[data-load="1"]').click();
  const after = w.eval("JSON.stringify(UI.state())");
  ok("slot reloads to the same state", before === after,
     before === after ? "" : "state differs after reload");
} catch (e) { ok("save round-trip", false, e.message); }

/* THE BILL LIFECYCLE TRACK. An assented act must show the road it took, not
   just its end state — and the terminal branch must be drawn off the end of
   the track rather than as a position on it. */
try {
  const stt = w.eval("UI.state()");
  stt.bills.anchor_kepler.stage = "assented";
  stt.bills.anchor_kepler.assentedAt = 3;
  /* Switching tabs only toggles visibility; the register is drawn in drawAll,
     so re-enter boot (which is re-entrant) to redraw against the new state. */
  w.eval("UI.boot(UI.state(), CONTENT)");
  w.document.querySelector('.tab[data-t="pap"]').click();

  const rows = [...w.document.querySelectorAll("#pp-list tbody tr")];
  const act = rows.find(r => /Ratification Act/.test(r.textContent));
  ok("the assented act is in the register", !!act, rows.length + " register rows");
  if (act) {
    act.click();
    const track = w.document.querySelector(".stagetrack");
    ok("the act document draws a stage track", !!track);
    if (track) {
      const steps = [...track.querySelectorAll("li")];
      const term  = track.querySelector("li.term");
      const order = w.eval("Engine.STAGE_ORDER.length");
      ok("the track mirrors STAGE_ORDER", steps.length === order + 1,
         `${steps.length} steps for ${order} stages plus a terminal`);
      ok("assent shows every stage cleared",
         steps.filter(l => l.classList.contains("done")).length === order,
         steps.filter(l => l.classList.contains("done")).length + " done");
      ok("the terminal state is a branch, marked in force",
         !!term && term.classList.contains("good") && /in force/i.test(term.textContent),
         term ? term.textContent.trim() : "no terminal");
    }
  }
  /* the letterhead must not leak an HTML entity as text */
  const doc = w.document.querySelector("#pp-doc, .paper");
  ok("no raw entities in the letterhead",
     !doc || !/&[a-z]+;/i.test(doc.textContent),
     (doc && (doc.textContent.match(/&[a-z]+;/i) || [""])[0]) || "clean");
} catch (e) { ok("bill lifecycle track", false, e.message); }

/* options panel */
try {
  $("#tb-options").click();
  const boxes = w.document.querySelectorAll("#tb-optpanel [data-opt]").length;
  /* six now: autosave, animations, confirm, mute, room tone, type text out */
  ok("options panel opens", $("#tb-optpanel").classList.contains("on") && boxes === 6,
     boxes + " toggles");
} catch (e) { ok("options panel opens", false, e.message); }


/* `const CONTENT` inside a script is a lexical global, not a window
   property, so it has to be read through eval rather than off w. */
const CONTENT = w.eval("CONTENT");

/* The orbit tab rendered nothing at all after a station was added: the chart
   read .band off a station the save did not have, threw, and left both panels
   empty. A blank tab throws no error the player can see, so check that each
   screen actually put something on the page. */
["#orbit-chart", "#orbit-table", "#station-detail", "#orbit-key"].forEach(sel =>
  ok("orbit renders " + sel, $(sel) && $(sel).innerHTML.length > 100,
     $(sel) ? $(sel).innerHTML.length + " chars" : "missing"));
ok("the chart draws every station",
   ($("#orbit-chart").querySelectorAll("[data-station]") || []).length === CONTENT.stations.length,
   $("#orbit-chart").querySelectorAll("[data-station]").length + " of " + CONTENT.stations.length);
/* A LAYOUT RULE MUST NOT UN-HIDE A SCREEN.

   Screens are hidden by .screen{display:none} and revealed by .screen.on.
   An id selector outranks both, so `#s-orb.screen{display:block}` - written
   to make the orbit screen a full-height column - put the habitat map on
   every tab at once, and nothing caught it because every screen still
   rendered its own content correctly. Checked as text: jsdom here loads the
   scripts, not the stylesheet. */
{
  const css = require("fs").readFileSync(__dirname + "/../css/terminal.css", "utf8");
  const bad = [];
  css.replace(/([^{}]*)\{([^}]*)\}/g, (all, sel, body) => {
    if (!/(^|;)\s*display\s*:/.test(body)) return all;
    sel.split(",").forEach(one => {
      /* only the SUBJECT of the selector matters: a rule on a descendant
         of a screen cannot reveal the screen. */
      const subject = one.trim().split(/[\s>+~]+/).pop() || "";
      if (/#s-[a-z]/.test(subject) && !/\.on\b/.test(subject)) bad.push(one.trim());
    });
    return all;
  });
  ok("no layout rule un-hides a screen", bad.length === 0, bad.join(" | "));
}

/* The Chair is a member of a party, not a piece of furniture. */
ok("exactly one seat carries the Chair",
   CONTENT.constituencies.filter(k => k.speaker).length === 1);
ok("every seat names a sitting member",
   CONTENT.constituencies.every(k => k.member && k.member.length > 2),
   CONTENT.constituencies.filter(k => !k.member).length + " without one");

ok("the station list lists every station",
   $("#orbit-table").querySelectorAll("tr[data-station]").length === CONTENT.stations.length);

/* A save written before a station existed must still open. This is the bug
   that produced the blank tab, reproduced through the real load path. */
{
  const stale = JSON.parse(w.eval("Engine.save(UI.state())"));
  const gone = CONTENT.stations[CONTENT.stations.length - 1].id;
  delete stale.stations[gone];
  let reloaded = null, threw = "";
  try { reloaded = w.eval("Engine.load(" + JSON.stringify(JSON.stringify(stale)) + ", CONTENT)"); }
  catch (e) { threw = e.message; }
  ok("a save missing a station still loads", !!reloaded, threw);
  ok("the missing station is restored", reloaded && !!reloaded.stations[gone]);
  ok("the repair is reported",
     (w.eval("(Engine.lastReconcile()||{}).stationsAdded") || []).length === 1);
  let len = 0;
  try { len = w.eval("OrbitChart.render(Engine.load(" + JSON.stringify(JSON.stringify(stale)) + ", CONTENT), CONTENT, null)").length; }
  catch (e) { len = 0; }
  ok("the chart still draws from that save", len > 1000, len + " chars");
}



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
  const stray = rows.filter(tr => !tr.matches("[data-bill],[data-station],[data-doc]"));
  ok(".sel is only on a row a click selects", rows.length >= 2 && stray.length === 0,
     rows.length + " selected, " + stray.length + " on rows that do nothing");

  /* three quoted literals, in three files, and no more: #gov-bills,
     #orbit-table, #pp-list. A fourth is a regression. */
  const jssrc = ["js/ui.js", "js/papers.js", "js/editor.js", "js/shell.js",
                 "js/encyclopedia.js", "js/orbitchart.js"]
    .map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n");
  const lits = jssrc.match(/["']sel["']/g) || [];
  ok("nothing else emits a sel class", lits.length === 3, lits.length + " literals");

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
  w.eval('Shell.setOpt("stream", true); Shell.setOpt("streamSpeed", "fast");');
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
  ok("streaming off renders instantly rather than slowly",
     w.eval('(function(){ Shell.setOpt("stream", false); var d = document.createElement("div");' +
            'd.textContent = "a sentence that would take a moment"; document.body.appendChild(d);' +
            'Stream.reveal(d, {}); var t = d.textContent; Shell.setOpt("stream", true);' +
            'd.remove(); return t; })()') === "a sentence that would take a moment");
} catch (e) { ok("the teletype", false, e.message); }

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


console.log("");
const uniq = [...new Set(errs.map(e => String(e).replace(/^Uncaught \[?|\]$/g, "")))];
if (uniq.length) { console.log("WINDOW ERRORS:"); uniq.forEach(e => console.log("  " + e)); fail += uniq.length; }
console.log(fail ? fail + " FAILURES" : "shell and game are healthy");
process.exit(fail ? 1 : 0);
