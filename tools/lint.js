/* =============================================================
   LEGIBILITY LINT
   -------------------------------------------------------------
   The bible calls legibility this project's whole risk, and says a
   designer cannot see their own legibility failures. This is the
   part of that a machine CAN see:

     1. terms used before the event that introduces them
     2. events dropping more than one new term at once
     3. glossary terms that are never introduced anywhere
     4. terms used in prose that are not in the glossary at all

   It cannot tell you whether an event is clear. It can tell you
   when you have stacked four unfamiliar nouns in one paragraph,
   which is the failure that actually happens.

   Run:  node tools/lint.js
   ============================================================= */

const fs = require("fs"), vm = require("vm"), path = require("path");
const root = path.join(__dirname, "..");
const files = ["setup", "parties", "stations", "constituencies", "cabinet", "instruments", "minutes", "characters", "bills", "events", "glossary", "encyclopedia"]
  .map(f => path.join(root, "content", f + ".js"));
vm.runInThisContext(files.map(f => fs.readFileSync(f, "utf8")).join("\n") +
  "\n;globalThis.__G = {EVENTS, GLOSSARY, BILLS, PARTIES, CHARACTERS, STATIONS};");
const { EVENTS, GLOSSARY, BILLS, PARTIES, CHARACTERS, STATIONS } = globalThis.__G;

const MAX_NEW_CLUSTERS = 1;  // per event. Raise this and you are choosing to confuse people.

/* Order events the way a player actually meets them: prologue first, then weight. */
const ordered = [
  ...EVENTS.filter(e => e.prologue).sort((a, b) => a.prologue - b.prologue),
  ...EVENTS.filter(e => !e.prologue).sort((a, b) => (b.weight || 1) - (a.weight || 1) || (a.id < b.id ? -1 : 1))
];

const taught = new Set(GLOSSARY.filter(g => g.assumed).map(g => g.term.toLowerCase()));
const byTerm = GLOSSARY.reduce((m, g) => (m[g.term.toLowerCase()] = g, m), {});
const problems = { early: [], overload: [], orphan: [], untaught: [] };

/* Proper nouns are not vocabulary. "Public Substrate Association" is a party
   name, not a lesson about substrate, so strip known names before matching. */
const PROPER = [...(typeof PARTIES !== "undefined" ? PARTIES.flatMap(p => [p.name, ...(p.aliases || [])]) : []),
                ...(typeof CHARACTERS !== "undefined" ? CHARACTERS.map(c => c.name) : []),
                ...(typeof STATIONS !== "undefined" ? STATIONS.map(s => s.name) : []),
                ...(typeof BILLS !== "undefined" ? BILLS.map(b => b.title) : [])]
  .sort((a, b) => b.length - a.length);

function textOf(e) {
  let t = [e.title, e.body, ...(e.choices || []).flatMap(c => [c.label, c.result || ""])].join(" ");
  PROPER.forEach(n => { t = t.split(n).join(" \u00b7 "); });
  return t.toLowerCase();
}
function termsIn(text) {
  return GLOSSARY.filter(g => {
    const t = g.term.toLowerCase();
    return new RegExp("\\b" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "s?\\b").test(text);
  }).map(g => g.term.toLowerCase());
}

ordered.forEach((e, i) => {
  const text = textOf(e);
  const used = termsIn(text);
  const here = GLOSSARY.filter(g => g.introduced === e.id);
  const introducesHere = here.map(g => g.term.toLowerCase());
  const clustersHere = [...new Set(here.map(g => g.cluster || g.term))];

  const novel = used.filter(t => !taught.has(t) && !introducesHere.includes(t));
  if (novel.length) problems.early.push({ pos: i + 1, id: e.id, terms: novel });

  if (clustersHere.length > MAX_NEW_CLUSTERS)
    problems.overload.push({ pos: i + 1, id: e.id, count: clustersHere.length, terms: clustersHere });

  introducesHere.forEach(t => taught.add(t));
  used.forEach(t => taught.add(t));
});

GLOSSARY.forEach(g => {
  if (g.assumed) return;
  if (g.introduced === null) return;
  if (!EVENTS.some(e => e.id === g.introduced))
    problems.orphan.push(g.term + " → introduced by \"" + g.introduced + "\", which does not exist");
});
GLOSSARY.filter(g => !g.assumed && g.introduced === null).forEach(g =>
  problems.orphan.push(g.term + " → no introducing event"));

/* Terms that appear in prose but are in no glossary at all. Crude: capitalised
   multiword phrases and a hand list of setting nouns the glossary should own. */
const SUSPECT = ["closure ratio","apportionment","spin-up","uplift","synthetic",
                 "backup","running hot","clock rate","volume rationing",
                 "prayer","statutory instrument","list member"];
const known = new Set(GLOSSARY.map(g => g.term.toLowerCase()));
const seenSuspect = {};
EVENTS.forEach(e => {
  const t = textOf(e);
  SUSPECT.forEach(s => { if (t.includes(s) && !known.has(s)) (seenSuspect[s] ||= []).push(e.id); });
});

/* ---------- report ---------- */
const R = [];
R.push("LEGIBILITY LINT");
R.push("=".repeat(60));
R.push("");
R.push("PLAYER'S PATH THROUGH THE VOCABULARY");
const taught2 = new Set(GLOSSARY.filter(g => g.assumed).map(g => g.term.toLowerCase()));
ordered.slice(0, 10).forEach((e, i) => {
  const hereG = GLOSSARY.filter(g => g.introduced === e.id);
  const intro = hereG.map(g => g.term);
  const cl = [...new Set(hereG.map(g => g.cluster || g.term))];
  intro.forEach(t => taught2.add(t.toLowerCase()));
  R.push(`  ${String(i + 1).padStart(2)}. ${(e.prologue ? "[P" + e.prologue + "] " : "      ") + e.title}`);
  if (intro.length) R.push(`        teaches [${cl.join("+")}]: ${intro.join(", ")}`);
});
R.push("");

function section(title, arr, fmt) {
  R.push(title);
  if (!arr.length) { R.push("  none"); R.push(""); return 0; }
  arr.forEach(x => R.push("  " + fmt(x)));
  R.push("");
  return arr.length;
}
let n = 0;
n += section("TERMS USED BEFORE THEY ARE TAUGHT", problems.early,
  x => `#${x.pos} ${x.id}: ${x.terms.join(", ")}`);
n += section(`EVENTS INTRODUCING MORE THAN ${MAX_NEW_CLUSTERS} NEW CONCEPT CLUSTER`, problems.overload,
  x => `#${x.pos} ${x.id}: ${x.count} — ${x.terms.join(", ")}`);
n += section("GLOSSARY TERMS WITH NO INTRODUCING EVENT", problems.orphan, x => x);
const sus = Object.keys(seenSuspect);
n += section("IN PROSE BUT NOT IN THE GLOSSARY", sus,
  s => `"${s}" — used in ${seenSuspect[s].join(", ")}`);

R.push("=".repeat(60));
R.push(n ? `${n} legibility issues` : "no legibility issues");
console.log(R.join("\n"));
