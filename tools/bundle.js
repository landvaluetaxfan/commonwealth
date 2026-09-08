/* =============================================================
   BUNDLE — one file describing the whole project state.

   Written so a new chat can be handed a single artefact and know
   exactly what the content currently is, without relying on anyone
   remembering what was in the last zip.

   Two sections:
     1. A DIGEST — counts, chamber arithmetic, chapter structure,
        rosters, open validation issues. Readable in ten seconds.
     2. The full content files, verbatim, fenced.

   Run:  node tools/bundle.js        → writes orbital.bundle.md
   Then: upload it to the project knowledge base, replacing the old
   one. Re-run and re-upload whenever the content changes.
   ============================================================= */

const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const CF = ["setup","parties","stations","functional","characters","bills",
            "constituencies","glossary","archetypes","names","events","encyclopedia"];

const ctx = {};
const src = CF.map(f => {
  const p = path.join(root, "content", f + ".js");
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}).join("\n");
vm.runInNewContext(src + `;__G={SETUP,PARTIES,CURRENTS,STATIONS,CHARACTERS,BILLS,EVENTS,GLOSSARY,
  ENCYCLOPEDIA, FUNCTIONAL: typeof FUNCTIONAL!=="undefined"?FUNCTIONAL:[],
  CONSTITUENCIES: typeof CONSTITUENCIES!=="undefined"?CONSTITUENCIES:[],
  ARCHETYPES: typeof ARCHETYPES!=="undefined"?ARCHETYPES:[]};`, ctx);
const G = ctx.__G;

const idx = a => a.reduce((m, o) => (m[o.id] = o, m), {});
const C = { setup:G.SETUP, parties:G.PARTIES, currents:G.CURRENTS, stations:G.STATIONS,
  characters:G.CHARACTERS, bills:G.BILLS, events:G.EVENTS, glossary:G.GLOSSARY,
  partyById:idx(G.PARTIES), currentById:idx(G.CURRENTS), stationById:idx(G.STATIONS),
  characterById:idx(G.CHARACTERS), billById:idx(G.BILLS), eventById:idx(G.EVENTS) };
const Engine = require("../js/engine.js");
const st = Engine.newGame(C);

const L = [];
const p = s => L.push(s);

p("# ORBITAL — PROJECT STATE BUNDLE");
p("");
p("Generated " + new Date().toISOString().slice(0, 16).replace("T", " ") +
  " by `node tools/bundle.js`.");
p("");
p("This file is the authoritative snapshot of the game's content. If it");
p("disagrees with anything remembered from a previous conversation, **this file");
p("is right**. Regenerate and re-upload after any content change.");
p("");
p("---");
p("");
p("## DIGEST");
p("");

/* chamber */
const dist = Engine.popularTotal(st) - G.PARTIES.reduce((n,x)=>n+x.seats.list,0);
p("### Chamber");
p("");
p("| | |");
p("|---|---|");
p(`| Total seats | ${Engine.chamberTotal(st)} |`);
p(`| Majority | ${Engine.majority(st)} |`);
p(`| District / list / functional | ${dist} / ${G.PARTIES.reduce((n,x)=>n+x.seats.list,0)} / ${Engine.functionalTotal(st)} |`);
p(`| Government confidence | ${Engine.confidence(st)} |`);
p(`| Coalition | ${st.coalition.join(", ")} |`);
p(`| Confidence & supply | ${st.confidenceSupply.join(", ")} |`);
p("");

p("### Parties");
p("");
p("| id | name | dist | list | func | total | loyalty |");
p("|---|---|---|---|---|---|---|");
G.PARTIES.forEach(x => p(`| ${x.id} | ${x.name} | ${x.seats.district} | ${x.seats.list} | ${x.seats.functional} | ${Engine.partyTotal(st,x.id)} | ${x.loyalty} |`));
p("");

p("### Stations");
p("");
p("| id | name | band | form | seats | cons | pop | closure | susp |");
p("|---|---|---|---|---|---|---|---|---|");
const CONS = typeof G.CONSTITUENCIES !== "undefined" ? G.CONSTITUENCIES : [];
G.STATIONS.forEach(s => p(`| ${s.id} | ${s.name} | ${s.band} | ${s.form||"—"} | ${s.seats} | ${CONS.filter(k=>k.station===s.id).length} | ${s.population.toLocaleString()} | ${s.closure} | ${s.suspended.toLocaleString()} |`));
p("");

if (G.FUNCTIONAL.length) {
  p("### Functional constituencies");
  p("");
  p("| id | sector | seats | franchise | electorate | held |");
  p("|---|---|---|---|---|---|");
  G.FUNCTIONAL.forEach(f => p(`| ${f.id} | ${f.name} | ${f.seats} | ${f.franchise} | ${f.electorate.toLocaleString()} | ${Object.entries(f.held||{}).map(([k,v])=>k+":"+v).join(" ")} |`));
  p("");
}

p("### Chapters and events");
p("");
const chs = Engine.chapters(C);
chs.forEach(ch => {
  const inCh = G.EVENTS.filter(e => (e.chapter == null ? 1 : e.chapter) === ch);
  p(`**Chapter ${ch}** — ${inCh.filter(e=>e.prologue).length} prologue, ` +
    `${inCh.filter(e=>!e.prologue&&!e.queuedOnly).length} pool, ` +
    `${inCh.filter(e=>e.queuedOnly).length} queued`);
  p("");
  inCh.sort((a,b)=>(a.prologue||99)-(b.prologue||99)||(b.weight||0)-(a.weight||0))
    .forEach(e => p(`- \`${e.id}\` ${e.prologue?"**P"+e.prologue+"**":e.queuedOnly?"_queued_":"w"+(e.weight||50)} — ${e.title}`));
  p("");
});

p("### Bills");
p("");
G.BILLS.forEach(b => {
  const d = Engine.division(st, C, b.id);
  p(`- \`${b.id}\` **${b.title}** (${b.ref}) — ${b.stage}${b.dualMajority?", dual test":""}. ` +
    `Elected ${d.popular.aye}/${d.popular.need}` +
    (b.dualMajority?`, functional ${d.functional.aye}/${d.functional.need}`:"") +
    ` → **${d.carries?"carries":"fails"}**`);
});
p("");

p("### Other rosters");
p("");
p(`- Characters: ${G.CHARACTERS.map(c=>c.id).join(", ")}`);
p(`- Glossary terms: ${G.GLOSSARY.length} (${[...new Set(G.GLOSSARY.map(g=>g.cluster).filter(Boolean))].join(", ")})`);
p(`- Concordance hand-written articles: ${G.ENCYCLOPEDIA.articles.map(a=>a.id).join(", ")}`);
p(`- Station archetypes: ${G.ARCHETYPES.map(a=>a.id).join(", ")}`);
p("");
p("---");
p("");
p("## CONTENT FILES");
p("");
p("Verbatim. These are the source of truth.");
p("");

CF.forEach(f => {
  const fp = path.join(root, "content", f + ".js");
  if (!fs.existsSync(fp)) return;
  p(`### content/${f}.js`);
  p("");
  p("```javascript");
  p(fs.readFileSync(fp, "utf8").trimEnd());
  p("```");
  p("");
});

const out = path.join(root, "orbital.bundle.md");
fs.writeFileSync(out, L.join("\n"));
const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log("wrote orbital.bundle.md  (" + kb + " KB)");
console.log("  chamber " + Engine.chamberTotal(st) + ", majority " + Engine.majority(st) +
            ", confidence " + Engine.confidence(st));
console.log("  " + G.EVENTS.length + " events across chapters " + chs.join(", "));
console.log("  upload this to the project knowledge base, replacing the previous one");
