/* Headless check: does the division calculator reproduce the bible's numbers? */
const fs = require("fs"), vm = require("vm");
const files = ["content/setup.js","content/parties.js","content/stations.js","content/constituencies.js","content/cabinet.js","content/instruments.js","content/minutes.js",
               "content/characters.js","content/bills.js","content/events.js","content/glossary.js","content/encyclopedia.js","content/index.js"];
const src = files.map(f => fs.readFileSync(f,"utf8")).join("\n") + "\n;globalThis.__C = CONTENT;";
vm.runInThisContext(src);
const CONTENT = globalThis.__C;
const Engine = require("./js/engine.js");

const st = Engine.newGame(CONTENT);
console.log("chamber", Engine.chamberTotal(st), "| popular", Engine.popularTotal(st),
            "| functional", Engine.functionalTotal(st));
console.log("majority", Engine.majority(st), "| confidence", Engine.confidence(st));

const d = Engine.division(st, CONTENT, "divergence");
console.log("\nDIVERGENCE THRESHOLD BILL");
console.log("  popular   ", d.popular.aye + "/" + d.popular.total,
            "need " + d.popular.need, d.popular.carries ? "CARRIES" : "FAILS");
console.log("  functional", d.functional.aye + "/" + d.functional.total,
            "need " + d.functional.need, d.functional.carries ? "CARRIES" : "FAILS");
console.log("  result    ", d.carries ? "PASSES" : "DEFEATED");

let fails = 0;
const expect = (label, got, want) => {
  const ok = got === want; if (!ok) fails++;
  console.log((ok ? "  ok  " : "  FAIL") + " " + label + " = " + got + (ok ? "" : " (want " + want + ")"));
};
console.log("\nAGAINST THE BIBLE:");
expect("chamber", Engine.chamberTotal(st), 280);
expect("majority", Engine.majority(st), 141);
expect("confidence", Engine.confidence(st), 141);
expect("popular total", d.popular.total, 240);
expect("functional total", d.functional.total, 40);
expect("popular aye", d.popular.aye, 128);
expect("functional aye", d.functional.aye, 12);
expect("popular need", d.popular.need, 121);
expect("functional need", d.functional.need, 21);

console.log("\nFIRST FIVE SITTINGS (deterministic):");
let s = Engine.newGame(CONTENT);
for (let i=0;i<5;i++){
  const e = Engine.nextEvent(s, CONTENT);
  if(!e){ console.log("  sitting "+s.sitting+": (no eligible event)"); Engine.advance(s); continue; }
  console.log("  sitting "+s.sitting+": "+e.title+"  ["+e.choices.length+" choices]");
  Engine.choose(s, CONTENT, e, 0);
  Engine.advance(s);
}
console.log("\nloss check:", JSON.stringify(Engine.checkLoss(s, CONTENT)));
console.log(fails ? "\n"+fails+" FAILURES" : "\nall assertions pass");

/* Smoke test: play 40 sittings choosing every branch in rotation, look for crashes. */
console.log("\nSMOKE TEST (40 sittings, rotating choices):");
let z = Engine.newGame(CONTENT), fired = 0, k = 0, ended = null;
for (let i = 0; i < 40; i++) {
  const loss = Engine.checkLoss(z, CONTENT);
  if (loss.lost) { ended = "sitting " + z.sitting + ": " + loss.reason; break; }
  const e = Engine.nextEvent(z, CONTENT);
  if (e) { Engine.choose(z, CONTENT, e, (k++) % e.choices.length); fired++; }
  Engine.advance(z);
}
console.log("  events fired:", fired, "| wire items:", z.wire.length, "| queued:", z.queue.length);
console.log("  ended:", ended || "survived 40 sittings");
console.log("  final scalars:", JSON.stringify(z.scalars));
const rt = Engine.load(Engine.save(z));
console.log("  save/load round-trip:", rt.sitting === z.sitting && rt.log.length === z.log.length ? "ok" : "MISMATCH");

/* The district tier must equal the sum of constituency magnitudes, and each
   station must equal the sum of its own. Nothing checked this before and the
   two had drifted by 84 seats. */
console.log("\nTIER RECONCILIATION:");
(function(){
  const K = CONTENT.constituencies || [];
  const consSeats = K.reduce((n,c)=>n+c.magnitude,0);
  const partyDist = CONTENT.parties.reduce((n,p)=>n+p.seats.district,0);
  const stnSeats  = CONTENT.stations.reduce((n,s)=>n+s.seats,0);
  let bad = 0;
  const ok = (l,a,b)=>{ const g=a===b; if(!g)bad++;
    console.log((g?"  ok  ":"  FAIL")+" "+l+" = "+a+(g?"":" (want "+b+")")); };
  ok("constituencies", K.length, 56);
  ok("constituency seats", consSeats, 140);
  ok("party district seats", partyDist, 140);
  ok("station seats", stnSeats, 140);
  CONTENT.stations.forEach(s=>{
    const m = K.filter(k=>k.station===s.id).reduce((n,k)=>n+k.magnitude,0);
    if (m !== s.seats) { bad++; console.log("  FAIL "+s.id+": "+s.seats+" seats vs "+m+" from constituencies"); }
  });
  if (!bad) console.log("  ok   every station reconciles with its constituencies");
  const ap = Engine.apportionment(CONTENT);
  const vals = Object.values(ap);
  console.log("  apportionment ratios derived: " + vals.length +
    ", range " + Math.min(...vals).toFixed(2) + "–" + Math.max(...vals).toFixed(2));
  if (bad) { console.log("\n"+bad+" TIER FAILURES"); process.exitCode = 1; }
})();

/* Acceptance tests from sweep-brief.md Part F. */
console.log("\nINSTRUMENTS AND CABINET (sweep brief, Part F):");
(function(){
  let bad = 0;
  const ok = (l, c, extra) => { if (!c) bad++;
    console.log((c ? "  ok   " : "  FAIL ") + l + (extra ? "  " + extra : "")); };

  let s = Engine.newGame(CONTENT);
  const d0 = Engine.division(s, CONTENT, "divergence");
  ok("HC 4/117 fails the functional test on opening state",
     !d0.functional.carries, d0.functional.aye + "/" + d0.functional.need);

  Engine.makeInstrument(s, CONTENT, "si_2287_44");
  Engine.makeInstrument(s, CONTENT, "si_2287_47");
  const d1 = Engine.division(s, CONTENT, "divergence");
  ok("board-packing moves functional seats", d1.functional.aye > d0.functional.aye,
     d0.functional.aye + " -> " + d1.functional.aye);
  ok("packing costs the Guild Bench permanently", s.parties.gb.loyalty === 0);
  ok("packing hands Halloran signatures", s.signatures >= 5, String(s.signatures));

  let v = Engine.newGame(CONTENT);
  Engine.vacate(v, CONTENT, "attestation_registry");
  ok("an SI made by a vacant post is rejected", !Engine.canMake(v, CONTENT, "si_2287_44").ok);

  let p = Engine.newGame(CONTENT);
  Engine.makeInstrument(p, CONTENT, "si_2287_44");
  const beforeFn = Engine.division(p, CONTENT, "divergence").functional.aye;
  p.parties.cl.loyalty = 100; p.parties.hul.loyalty = 100;
  p.parties.gb.loyalty = 100; p.parties.fh.loyalty = 100;
  p.coalition = ["cu"]; p.confidenceSupply = [];
  const pr = Engine.prayAgainst(p, CONTENT, "si_2287_44");
  const afterFn = Engine.division(p, CONTENT, "divergence").functional.aye;
  ok("a prayed-against SI is revoked and its effects reversed",
     pr.carried && afterFn < beforeFn, beforeFn + " -> " + afterFn);

  let w = Engine.newGame(CONTENT);
  Engine.makeInstrument(w, CONTENT, "si_2287_44");
  w.sitting = 40;
  ok("praying after the window closes is refused",
     !Engine.prayAgainst(w, CONTENT, "si_2287_44").ok);

  let g = Engine.newGame(CONTENT);
  g.bills.divergence.stage = Engine.DIVIDES_AT;
  ok("a slot cannot advance a bill awaiting a division",
     !Engine.grantSlot(g, CONTENT, "divergence").ok);

  ok("cabinet is data", Object.keys(Engine.newGame(CONTENT).cabinet).length === 9);
  ok("state version is current", Engine.newGame(CONTENT).version === Engine.STATE_VERSION,
     "v" + Engine.STATE_VERSION);

  if (bad) { console.log("\n" + bad + " ACCEPTANCE FAILURES"); process.exitCode = 1; }
})();
