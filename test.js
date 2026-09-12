/* Headless check: does the division calculator reproduce the bible's numbers? */
const fs = require("fs"), vm = require("vm");
const files = ["content/setup.js","content/parties.js","content/stations.js","content/constituencies.js","content/cabinet.js","content/instruments.js","content/minutes.js",
               "content/functional.js","content/labour.js",
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
  /* A non-voting seat (the capital territory) returns a member but is not
     part of the district tier: it is excluded from every count here. */
  const voting = K.filter(k => !k.nonVoting);
  const consSeats = voting.reduce((n,c)=>n+c.magnitude,0);
  const partyDist = CONTENT.parties.reduce((n,p)=>n+p.seats.district,0);
  const stnSeats  = CONTENT.stations.reduce((n,s)=>n+s.seats,0);
  let bad = 0;
  const ok = (l,a,b)=>{ const g=a===b; if(!g)bad++;
    console.log((g?"  ok  ":"  FAIL")+" "+l+" = "+a+(g?"":" (want "+b+")")); };
  /* 140 single-member voting seats, plus the capital's non-voting delegate.
     Every district returns one member by first past the post; the
     multi-member constituencies they were subdivided from survive as each
     seat's `parent`. */
  ok("constituencies", K.length, 141);
  ok("voting constituencies", voting.length, 140);
  ok("every district is single-member",
     K.filter(k => k.magnitude !== 1).length, 0);
  ok("voting constituency seats", consSeats, 140);
  ok("party district seats", partyDist, 140);
  ok("station seats", stnSeats, 141);
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

  /* THE DISTRICT ROLL. Every district seat lives in st.roll and every
     district total is derived from it. Two numbers for one fact is the
     apportionment_ratio mistake; these assertions are what stop it. */
  {
    const r = Engine.newGame(CONTENT);

    /* content side: held must sum to magnitude, and to each party's total */
    let magBad = [];
    CONTENT.constituencies.forEach(k => {
      const sum = Object.values(k.held || {}).reduce((a, b) => a + b, 0);
      if (sum !== k.magnitude) magBad.push(`${k.id} ${sum}/${k.magnitude}`);
    });
    ok("every constituency is fully returned", magBad.length === 0, magBad.join(", "));

    /* At-large means exactly one thing: the station returns a single
       constituency, so the seat is the whole station. */
    const perStation = {};
    CONTENT.constituencies.forEach(k => perStation[k.station] = (perStation[k.station] || 0) + 1);
    const alBad = CONTENT.constituencies
      .filter(k => !!k.at_large !== (perStation[k.station] === 1))
      .map(k => k.id);
    ok("at-large marks exactly the single-constituency stations",
       alBad.length === 0, alBad.join(", "));

    let partyBad = [];
    CONTENT.parties.forEach(p => {
      const rolled = Engine.partyDistrict(r, p.id);
      if (rolled !== p.seats.district) partyBad.push(`${p.id} ${rolled}/${p.seats.district}`);
    });
    ok("the roll reproduces every authored district total",
       partyBad.length === 0, partyBad.join(", "));
    ok("the roll reconciles both ways", Engine.tierCheck(r, CONTENT).ok);

    /* The functional roll, on the same terms: content's per-constituency held
       must reproduce each party's authored functional total, and a move must
       land in the roll rather than on the stored count. */
    let fnBad = [];
    CONTENT.parties.forEach(p => {
      const rolled = Object.keys(r.functional || {}).reduce(
        (n, fid) => n + ((r.functional[fid].held || {})[p.id] || 0), 0);
      if (rolled !== p.seats.functional) fnBad.push(`${p.id} ${rolled}/${p.seats.functional}`);
    });
    ok("the functional roll reproduces every authored functional total",
       fnBad.length === 0, fnBad.join(", "));
    {
      const s = Engine.newGame(CONTENT);
      const before = s.parties.cu.seats.functional;
      Engine.makeInstrument(s, CONTENT, "si_2287_44");
      ok("a functional seat moves inside the roll, and the derived total follows",
         s.parties.cu.seats.functional === before + 2 &&
         s.functional.fc_lifesupport.held.cu === 2 &&
         s.functional.fc_lifesupport.held.gb === 3,
         JSON.stringify(s.functional.fc_lifesupport.held));
    }

    /* a vacancy costs the government a vote and is not quietly absorbed */
    const conf0 = Engine.confidence(r);
    Engine.vacateSeat(r, CONTENT, "tier_four", "cu", "test");
    ok("a vacancy costs a vote", Engine.confidence(r) === conf0 - 1,
       conf0 + " -> " + Engine.confidence(r));
    ok("a vacancy still counts toward the tier", Engine.tierCheck(r, CONTENT).ok,
       JSON.stringify(Engine.tierCheck(r, CONTENT)));
    ok("derived and cached district agree after a vacancy",
       Engine.partyDistrict(r, "cu") === r.parties.cu.seats.district);

    const be = Engine.byElection(r, CONTENT, "tier_four");
    ok("a by-election fills the vacancy", be.ok && Engine.vacantSeats(r) === 0);
    ok("the chamber is whole again", Engine.tierCheck(r, CONTENT).ok);

    /* crossing the floor moves a seat without changing the chamber size */
    const before = Engine.partyDistrict(r, "cu");
    Engine.crossFloor(r, CONTENT, "the_cans", "cu", "hul", 1);
    ok("crossing the floor moves one seat",
       Engine.partyDistrict(r, "cu") === before - 1 && Engine.tierCheck(r, CONTENT).ok);
    ok("a refused crossing changes nothing",
       !Engine.crossFloor(r, CONTENT, "the_bourse", "cu", "hul", 1).ok &&
       Engine.tierCheck(r, CONTENT).ok);

    /* a district seats effect must be refused, not silently undone */
    const d0 = Engine.partyDistrict(r, "cu");
    Engine.apply(r, CONTENT, [{ seats: { cu: { district: 5 } } }]);
    /* a member and their seat must agree, in both directions. The seat has to
       exist on the roll and the roll has to show their party holding it — a
       renamed constituency otherwise leaves a member sitting for nowhere. */
    let seatBad = [];
    CONTENT.characters.filter(c => c.seat).forEach(c => {
      const k = CONTENT.constituencies.find(x => x.name === c.seat);
      if (!k) seatBad.push(`${c.name}: no seat "${c.seat}"`);
      else if (!k.held[c.party]) seatBad.push(`${c.name} (${c.party}) sits for ${c.seat}, held by ${Object.keys(k.held)[0]}`);
    });
    /* Every district electorate is its station's share of the adult roll, so
       the 140 must sum back to it exactly. They were uniform at ~28,040 once,
       which made every apportionment ratio ~1.04 and quietly deleted the
       malapportionment that bible 4.7 and 4.10 are about. */
    const districtRoll = CONTENT.constituencies.filter(k => !k.nonVoting)
                           .reduce((n, k) => n + k.electorate, 0);
    ok("district electorates sum to the adult roll", districtRoll === 4149803,
       districtRoll + " vs 4149803");

    const ratios = Object.values(Engine.apportionment(CONTENT));
    const spread = Math.max(...ratios) / Math.min(...ratios);
    ok("apportionment is not flat", spread > 2,
       "ratio " + Math.min(...ratios) + " to " + Math.max(...ratios));

    ok("every member sits for a seat their party holds",
       seatBad.length === 0, seatBad.join("; "));

    ok("a seats effect cannot write district seats",
       Engine.partyDistrict(r, "cu") === d0 &&
       r.parties.cu.seats.district === d0);
  }

  /* THE GENERAL ELECTION. Deterministic (1.5), parallel not compensatory
     (4.1), and the list threshold has both of 4.8's carve-outs. */
  {
    const a = Engine.load(Engine.save(Engine.newGame(CONTENT)), CONTENT);
    const b = Engine.load(Engine.save(Engine.newGame(CONTENT)), CONTENT);
    const r1 = Engine.generalElection(a, CONTENT);
    Engine.generalElection(b, CONTENT);
    ok("the same state elects the same chamber twice",
       JSON.stringify(a.roll) === JSON.stringify(b.roll) &&
       JSON.stringify(a.parties) === JSON.stringify(b.parties));

    ok("the chamber is still 280", Engine.chamberTotal(a) === 280,
       String(Engine.chamberTotal(a)));
    ok("the election reconciles the tiers", Engine.tierCheck(a, CONTENT).ok,
       JSON.stringify(Engine.tierCheck(a, CONTENT)));
    ok("the district tier is still the authored size",
       Engine.partyDistrict(a, "cu") + CONTENT.parties.filter(p => p.id !== "cu")
         .reduce((n, p) => n + Engine.partyDistrict(a, p.id), 0) === a.law.tier_ratio_district);
    const listTot = Object.values(a.parties).reduce((n, p) => n + p.seats.list, 0);
    ok("the list tier is still the authored size", listTot === a.law.tier_ratio_list,
       listTot + "/" + a.law.tier_ratio_list);

    /* 4.3: a pure-list party must survive. Deriving the list vote from
       district strength once wiped the PSA, which is the opposite of canon. */
    ok("a pure-list party survives the election", a.parties.psa.seats.list > 10,
       "PSA list " + a.parties.psa.seats.list);
    /* 4.8: the single-category carve-out saves a party under the threshold */
    ok("the carve-out saves a sub-threshold party",
       a.parties.upl.seats.list > 0 && r1.barred.indexOf("upl") < 0,
       "UPL " + a.parties.upl.seats.list + ", barred: " + (r1.barred.join(",") || "none"));
    ok("a party with no carve-out and no district seat is barred",
       r1.barred.indexOf("geo") >= 0, r1.barred.join(",") || "none");
  }

  /* ORDER-PAPER TIME. Slots are the scarce good that generates capital
     (bible 7.7), so granting one must always move a bill. A stage the engine
     did not recognise fell through every branch and burned the slot in
     silence — content had a bill parked at "lords", which is neither in
     STAGE_ORDER nor the name this setting uses for the upper house. */
  {
    let burned = [], sl = Engine.newGame(CONTENT);
    CONTENT.bills.forEach(b => {
      const before = sl.bills[b.id].stage, used = sl.slots.used;
      const r = Engine.grantSlot(sl, CONTENT, b.id);
      if (r.ok && sl.bills[b.id].stage === before && sl.slots.used > used)
        burned.push(`${b.id} (${before})`);
    });
    ok("a granted slot always advances a bill", burned.length === 0,
       burned.length ? "slot burned on " + burned.join(", ") : "");

    let u = Engine.newGame(CONTENT);
    u.bills[CONTENT.bills[0].id].stage = "not_a_real_stage";
    const before = u.slots.used;
    const r = Engine.grantSlot(u, CONTENT, CONTENT.bills[0].id);
    ok("an unknown stage is refused, not charged",
       !r.ok && u.slots.used === before, r.reason || "");

    /* every stage content ships must be one the engine can advance */
    const known = Engine.STAGE_ORDER.concat(["blocked"]);
    const strays = CONTENT.bills.filter(b => !known.includes(b.stage))
                                .map(b => `${b.id}:"${b.stage}"`);
    ok("every authored stage is in STAGE_ORDER", strays.length === 0, strays.join(", "));
  }

  ok("cabinet is data",
     Object.keys(Engine.newGame(CONTENT).cabinet).length === CONTENT.cabinet.length,
     CONTENT.cabinet.length + " posts");
  /* Content keeps moving after a save is written. A station added to the
     roster left older saves with a hole in st.stations, and the orbital
     chart read .band off undefined and drew nothing — a blank tab, with no
     error a player could see. load() now reconciles, so check both
     directions: what content adds appears, what content drops goes. */
  {
    const fresh = Engine.newGame(CONTENT);
    const last = CONTENT.stations[CONTENT.stations.length - 1];
    const firstSeat = CONTENT.constituencies[0];
    delete fresh.stations[last.id];
    delete fresh.roll[firstSeat.id];
    fresh.stations.ghost = { id:"ghost", name:"Gone", band:"low", seats:2,
      population:1, closure:0.5, suspended:0, attested:0.5 };
    fresh.roll.ghost_seat = { held:{ cu:1 }, vacant:0 };
    const back = Engine.load(Engine.save(fresh), CONTENT);
    ok("a save missing a station regains it", !!back.stations[last.id]);
    ok("a save missing a seat regains it", !!back.roll[firstSeat.id]);
    ok("a station content has dropped is dropped", !back.stations.ghost);
    ok("a seat content has dropped is dropped", !back.roll.ghost_seat);
    ok("the reconciled roll still reconciles", Engine.tierCheck(back, CONTENT).ok,
       JSON.stringify(Engine.tierCheck(back, CONTENT)));
  }

  /* The same hole one layer up: a party added to content left older saves
     without st.parties[id], and the chamber, the orbit chart and the
     Concordance all iterate C.parties and read the save — so they threw and
     drew blank panels. load() must backfill it, and say so. */
  {
    const fresh = Engine.newGame(CONTENT);
    const lastParty = CONTENT.parties[CONTENT.parties.length - 1];
    delete fresh.parties[lastParty.id];
    const back = Engine.load(Engine.save(fresh), CONTENT);
    ok("a save missing a party regains it", !!back.parties[lastParty.id]);
    ok("the party is reported as added",
       ((Engine.lastReconcile() || {}).partiesAdded || []).indexOf(lastParty.id) >= 0);
    ok("every content party is present after load",
       CONTENT.parties.every(p => back.parties[p.id]));
  }

  /* The cabinet lives in the save, so a recast in content leaves an old holder
     id behind and the panel prints the raw id. load() must repair it, and a
     ministry content has added must appear. */
  {
    const fresh = Engine.newGame(CONTENT);
    const post = CONTENT.cabinet[1];
    fresh.cabinet[post.id] = { id: post.id, holder: "nobody_at_all", party: post.party };
    delete fresh.cabinet[CONTENT.cabinet[2].id];
    const back = Engine.load(Engine.save(fresh), CONTENT);
    ok("a stale cabinet holder is repaired", back.cabinet[post.id].holder === post.holder);
    ok("the repair is reported",
       ((Engine.lastReconcile() || {}).cabinetRepaired || []).indexOf(post.id) >= 0);
    ok("a save missing a ministry regains it", !!back.cabinet[CONTENT.cabinet[2].id]);
  }

  /* Content owns a station's identity; the save owns what play has moved.
     A renamed or resized station must show its current name and return its
     current seats, or the map and the chamber arithmetic disagree — but a
     closure figure the player has spent four sittings moving is theirs. */
  {
    const drifted = Engine.newGame(CONTENT);
    const s = CONTENT.stations[0];
    drifted.stations[s.id].name = "Stale Name";
    drifted.stations[s.id].seats = s.seats + 9;
    drifted.stations[s.id].closure = 0.123;
    const back = Engine.load(Engine.save(drifted), CONTENT);
    ok("content wins on a station's name", back.stations[s.id].name === s.name,
       back.stations[s.id].name);
    ok("content wins on a station's seats", back.stations[s.id].seats === s.seats,
       back.stations[s.id].seats + " vs " + s.seats);
    ok("the save wins on simulated figures", back.stations[s.id].closure === 0.123,
       String(back.stations[s.id].closure));
  }

  /* Reconciling must not leave a fingerprint on the state, or a save stops
     round-tripping to an identical one and tools/roundtrip.js is lying. */
  {
    const a = Engine.load(Engine.save(Engine.newGame(CONTENT)), CONTENT);
    ok("reconciling leaves no trace on the state",
       Engine.save(a) === Engine.save(Engine.load(Engine.save(a), CONTENT)));
  }

  ok("state version is current", Engine.newGame(CONTENT).version === Engine.STATE_VERSION,
     "v" + Engine.STATE_VERSION);

  /* SAVE MIGRATION (bible 15.3.2, sweep brief Part H).
     Every version bump adds fields; a save written before that bump must come
     back with all of them. This regressed once: the guards were written in
     descending order, so a v1 save hit `< 4` first, was stamped 4, and skipped
     the blocks that add prices, capital, slots and whips. It loaded, then threw
     on the first division. Walk every old version forward, not just the newest. */
  const FIELDS_BY_VERSION = {
    2: ["capital", "slots", "whips"],
    3: ["prices", "priceHistory"],
    4: ["cabinet", "instruments", "signatures"]
  };
  const ALL_ADDED = Object.values(FIELDS_BY_VERSION).flat();

  for (let from = 1; from < Engine.STATE_VERSION; from++) {
    const old = JSON.parse(Engine.save(Engine.newGame(CONTENT)));
    old.version = from;
    /* strip everything introduced after `from`, as a real save of that age would lack */
    Object.keys(FIELDS_BY_VERSION).forEach(v => {
      if (Number(v) > from) FIELDS_BY_VERSION[v].forEach(f => delete old[f]);
    });

    const m = Engine.load(JSON.stringify(old));
    const missing = ALL_ADDED.filter(f => m[f] === undefined);
    ok(`v${from} save migrates to v${Engine.STATE_VERSION}`,
       m.version === Engine.STATE_VERSION && missing.length === 0,
       missing.length ? "missing " + missing.join(", ") : "all fields present");

    /* and it must actually be playable, not merely well-shaped */
    let played = true, why = "";
    try {
      Engine.division(m, CONTENT, "divergence");
      Engine.whipCost(m, CONTENT, "divergence");
    } catch (e) { played = false; why = e.message; }
    ok(`v${from} migrated save is playable`, played, why);
  }

  /* LABOUR RECONCILIATION.
     content/labour.js says the licensed counts in functional.js "are the hard
     constraint" and derives everything from population, adult roll and the
     franchise split. Nothing loaded the file, so nothing enforced that. These
     three sums are the whole claim; if a content pass edits an electorate,
     this is what notices. */
  if (typeof LABOUR !== "undefined" && typeof FUNCTIONAL !== "undefined") {
    const T = LABOUR.totals;
    const licensed = FUNCTIONAL.filter(f => f.franchise !== "residual")
                               .reduce((n, f) => n + (f.electorate || 0), 0);
    const residual = FUNCTIONAL.filter(f => f.franchise === "residual")
                               .reduce((n, f) => n + (f.electorate || 0), 0);
    ok("functional electorates sum to the franchise total",
       licensed === T.functionalFranchise, licensed + " vs " + T.functionalFranchise);
    ok("residual constituency matches the labour table",
       residual === T.residual, residual + " vs " + T.residual);
    ok("franchise + residual = adult roll",
       licensed + residual === T.adultRoll, (licensed + residual) + " vs " + T.adultRoll);
    /* ELECTOR ROLLS. Each functional constituency names who is actually on
       its roll; those counts must sum to the electorate the bible fixes, or
       the two numbers are a divergence waiting to happen. The residual is
       exempt: it is the complement of the other ten and nobody registers. */
    const rollBad = [], noGate = [];
    FUNCTIONAL.forEach(f => {
      if (f.complement) return;
      if (!f.electors) { rollBad.push(f.id + " has no roll"); return; }
      const sum = f.electors.reduce((n, e) => n + e.count, 0);
      if (sum !== f.electorate) rollBad.push(`${f.id} ${sum}/${f.electorate}`);
      if (!f.gatekeeper || !f.gatekeeper.board) noGate.push(f.id);
    });
    ok("every elector roll sums to its electorate", rollBad.length === 0, rollBad.join(", "));
    ok("every roll has a gatekeeper", noGate.length === 0, noGate.join(", "));

    /* A person who sits for a functional constituency must name a real one. */
    const badFn = (CONTENT.characters || [])
      .filter(c => c.functional && !(CONTENT.functionalById || {})[c.functional])
      .map(c => c.id + " → " + c.functional);
    ok("every functional seat a person sits for exists", badFn.length === 0, badFn.join(", "));

    /* Every functional seat has a named member, party for party, against the
       authored held. Districts name everyone; this is the functional roster. */
    const memBad = [];
    FUNCTIONAL.forEach(f => {
      const ms = f.members || [];
      if (ms.length !== f.seats) { memBad.push(`${f.id} ${ms.length}/${f.seats}`); return; }
      const by = {};
      ms.forEach(m => by[m.party] = (by[m.party] || 0) + 1);
      Object.keys(f.held).forEach(pid => {
        if ((by[pid] || 0) !== f.held[pid]) memBad.push(`${f.id} ${pid} ${by[pid] || 0}/${f.held[pid]}`);
      });
    });
    ok("every functional seat has a named member, party for party",
       memBad.length === 0, memBad.join(", "));

    /* Every seat carries a unique reference, like LS-1 for Life Support. */
    const refs = [];
    FUNCTIONAL.forEach(f => (f.members || []).forEach(m => refs.push(m.ref)));
    const dupRef = refs.filter((r, i) => refs.indexOf(r) !== i);
    ok("every functional seat has a unique reference",
       dupRef.length === 0 && refs.every(Boolean), dupRef.join(", "));

    const gov = FUNCTIONAL.filter(f => f.gatekeeper &&
                  f.gatekeeper.appointed_by === "government");
    ok("the government appoints most of the boards", gov.length >= 5,
       gov.length + " of " + FUNCTIONAL.length + " reachable by regulation");

    /* the residual really is the complement, not a roll of its own */
    const enrolled = FUNCTIONAL.filter(f => !f.complement)
                       .reduce((n, f) => n + f.electorate, 0);
    const resid = FUNCTIONAL.filter(f => f.complement)
                    .reduce((n, f) => n + f.electorate, 0);
    ok("enrolled plus residual is the adult roll",
       enrolled + resid === LABOUR.totals.adultRoll,
       `${enrolled} + ${resid} = ${enrolled + resid}`);

    /* every party declares how it contests seats */
    const noKind = CONTENT.parties.filter(p => !p.kind).map(p => p.id);
    ok("every party declares a kind", noKind.length === 0, noKind.join(", "));
    ok("the functional tier is not purely partisan",
       CONTENT.parties.some(p => p.kind === "professional"),
       CONTENT.parties.filter(p => p.kind === "professional").map(p => p.id).join(", "));

    ok("adult roll is a plausible share of population",
       T.adultRoll < T.population && T.adultRoll / T.population > 0.5,
       (100 * T.adultRoll / T.population).toFixed(1) + "% of " + T.population);
  } else {
    ok("labour table is loaded", false, "LABOUR or FUNCTIONAL missing from the harness");
  }

  if (bad) { console.log("\n" + bad + " ACCEPTANCE FAILURES"); process.exitCode = 1; }
})();
