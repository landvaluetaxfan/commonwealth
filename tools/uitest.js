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
  "js/engine.js","js/orbitchart.js","js/papers.js","js/encyclopedia.js","js/ui.js","js/shell.js"];
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

/* the chamber drew, and drew all 280 */
const seats = w.document.querySelectorAll("#chamber circle, #chamber rect, #chamber path").length;
ok("chamber renders every seat", seats > 280, seats + " glyphs (280 seats plus furniture)");

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

/* options panel */
try {
  $("#tb-options").click();
  const boxes = w.document.querySelectorAll("#tb-optpanel [data-opt]").length;
  ok("options panel opens", $("#tb-optpanel").classList.contains("on") && boxes === 3,
     boxes + " toggles");
} catch (e) { ok("options panel opens", false, e.message); }

console.log("");
const uniq = [...new Set(errs.map(e => String(e).replace(/^Uncaught \[?|\]$/g, "")))];
if (uniq.length) { console.log("WINDOW ERRORS:"); uniq.forEach(e => console.log("  " + e)); fail += uniq.length; }
console.log(fail ? fail + " FAILURES" : "shell and game are healthy");
process.exit(fail ? 1 : 0);
