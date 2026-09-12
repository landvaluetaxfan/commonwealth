/* =============================================================
   THE HEADLESS HARNESS — one jsdom, shared by the two DOM checks.

   tools/uitest.js  does the game render, save and screen checks.
   tools/uxtest.js  does focus, tips, audio, streaming and the division.

   They were one file of 780 lines, which is past the size where adding an
   assertion means reading the whole thing to find out where it goes. The
   split is by question rather than by feature: uitest asks "did it draw
   and does it survive a save", uxtest asks "can a person use it".

   Each runs in its own process with its own window, so neither can leave
   state behind that the other depends on - which was already true by
   accident and is now true by construction.

   Needs jsdom:  npm install jsdom
   Skips cleanly if it is not installed.
   ============================================================= */
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
  "js/audio.js","js/focus.js","js/stream.js","js/wait.js","js/dialog.js","js/tips.js","js/engine.js","js/orbitchart.js","js/papers.js","js/encyclopedia.js",
  "js/ui.js","js/shell.js"];
FILES.forEach(f => {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) return;
  const s = w.document.createElement("script");
  s.textContent = fs.readFileSync(p, "utf8");
  w.document.body.appendChild(s);
});

/* The terminal draws its own dialogs now (js/dialog.js), so the shell and
   the editor answer through Dialog's callbacks rather than the window's.
   Answering them the moment they open is what keeps the menu booting into
   a game without a click. */
w.eval(`
  Dialog.confirm = function (m, o, cb) { (typeof o === "function" ? o : cb)(true); };
  Dialog.prompt  = function (m, o, cb) { (typeof o === "function" ? o : cb)("Test ministry"); };
  Dialog.alert   = function (m, o, cb) { var f = typeof o === "function" ? o : cb; if (f) f(); };
`);

let fail = 0;
const ok = (label, cond, extra) => {
  if (!cond) fail++;
  console.log((cond ? "  ok   " : "  FAIL ") + label + (extra ? "  " + extra : ""));
};
const $ = s => w.document.querySelector(s);

/* Both files start from the same place: a booted shell on the main menu,
   then a new game in slot one. uitest asserts its way through those steps;
   uxtest just needs them to have happened. */
function boot() {
  try { w.eval("Shell.boot(CONTENT)"); return true; }
  catch (e) { ok("Shell.boot()", false, e.message); process.exit(1); }
}
function newGame() {
  $('[data-go="new"]').click();
  $('[data-new="1"]').click();
}

/* `const CONTENT` inside a script is a lexical global, not a window
   property, so it has to be read through eval rather than off w. */
const CONTENT = w.eval("CONTENT");

function banner(title) {
  console.log(title);
  console.log("=".repeat(56));
}

/* Window errors are counted as failures: an exception thrown inside a
   render leaves a blank panel and no other check can see it. */
function finish(healthy) {
  console.log("");
  const uniq = [...new Set(errs.map(e => String(e).replace(/^Uncaught \[?|\]$/g, "")))];
  if (uniq.length) { console.log("WINDOW ERRORS:"); uniq.forEach(e => console.log("  " + e)); fail += uniq.length; }
  console.log(fail ? fail + " FAILURES" : healthy);
  process.exit(fail ? 1 : 0);
}

module.exports = { fs, path, root, w, $, ok, CONTENT, JSDOM, boot, newGame, banner, finish };
