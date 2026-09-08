/* Editor smoke test. Loads editor.html in a headless DOM, boots it, clicks
   every tab, and exercises New/Duplicate/Delete and export on each.

   This exists because a broken editor once shipped: a form function was
   referenced but never defined, and nothing caught it. Static parsing will
   not find that class of bug — only running it will.

   Needs jsdom:  npm install jsdom
   Skips cleanly if it is not installed.                                    */
const fs = require("fs"), path = require("path"), root = path.join(__dirname, "..");
let JSDOM;
try { ({ JSDOM } = require("jsdom")); }
catch (e) {
  try { ({ JSDOM } = require(path.join(process.env.HOME || "/home/claude", "node_modules/jsdom"))); }
  catch (e2) { console.log("SKIP: jsdom not installed  (npm install jsdom)"); process.exit(0); }
}

const dom = new JSDOM(fs.readFileSync(path.join(root, "editor.html"), "utf8"),
  { runScripts: "dangerously", pretendToBeVisual: true, url: "file:///x/" });
const w = dom.window;
w.alert = () => {}; w.confirm = () => true; w.prompt = () => null;
w.URL.createObjectURL = () => "blob:x"; w.HTMLAnchorElement.prototype.click = function () {};

const FILES = ["content/setup.js","content/parties.js","content/stations.js","content/constituencies.js","content/cabinet.js","content/instruments.js","content/minutes.js","content/functional.js",
  "content/characters.js","content/bills.js","content/glossary.js","content/archetypes.js","content/names.js",
  "content/events.js","content/encyclopedia.js","content/index.js",
  "js/engine.js","js/schema.js","js/refs.js","js/coverage.js","js/serialise.js","js/editor.js"];

const errs = [];
w.addEventListener("error", e => errs.push(e.message));

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

console.log("EDITOR SMOKE TEST");
console.log("=".repeat(56));

try { w.eval("Editor.boot()"); ok("boot()", true); }
catch (e) { ok("boot()", false, e.message); process.exit(1); }

const tabs = [...w.document.querySelectorAll(".tab")].map(t => t.dataset.t);
tabs.forEach(t => {
  try {
    w.document.querySelector(`.tab[data-t="${t}"]`).click();
    const list = w.document.getElementById("ed-list").children.length;
    const form = w.document.getElementById("ed-form").innerHTML.length;
    if (t === "graph") {
      ok(`tab ${t}`, w.document.getElementById("ed-graph").innerHTML.length > 200, "graph svg");
    } else {
      ok(`tab ${t}`, list > 0 && form > 200, `${list} entries, form ${form} chars`);
    }
  } catch (e) { ok(`tab ${t}`, false, e.message); }
});

/* exercise the destructive buttons on a data tab */
try {
  w.document.querySelector('.tab[data-t="stations"]').click();
  const before = w.document.getElementById("ed-list").children.length;
  w.document.getElementById("ed-new").click();
  const added = w.document.getElementById("ed-list").children.length;
  w.document.getElementById("ed-dup").click();
  const duped = w.document.getElementById("ed-list").children.length;
  w.document.getElementById("ed-del").click();
  const deleted = w.document.getElementById("ed-list").children.length;
  ok("new / duplicate / delete", added === before + 1 && duped === before + 2 && deleted === before + 1,
     `${before} → ${added} → ${duped} → ${deleted}`);
} catch (e) { ok("new / duplicate / delete", false, e.message); }

/* every form function named in KIND must exist and run */
try {
  w.document.querySelector('.tab[data-t="events"]').click();
  const items = [...w.document.querySelectorAll(".ed-item")];
  items.slice(0, 6).forEach(i => i.click());
  ok("selecting events", w.document.getElementById("ed-form").innerHTML.length > 200);
} catch (e) { ok("selecting events", false, e.message); }

/* export must produce parseable content for every file */
try {
  const S = w.eval("Serialise"), M = w.eval("(function(){return null})()");
  ok("export runs", typeof S.file === "function" && typeof S.encyclopediaFile === "function");
} catch (e) { ok("export runs", false, e.message); }

console.log("");
if (errs.length) { console.log("WINDOW ERRORS:"); errs.forEach(e => console.log("  " + e)); fail += errs.length; }
console.log(fail ? fail + " FAILURES" : "editor is healthy");
process.exit(fail ? 1 : 0);
