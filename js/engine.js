/* =============================================================
   ENGINE
   -------------------------------------------------------------
   This file contains NO content. It names no event, no party,
   no station, no character. Everything it operates on comes from
   the files in /content.

   If you find yourself editing this file to add content, stop:
   the thing you want is almost certainly a new entry in a content
   file, or — rarely — a new verb in EFFECTS / CONDITIONS below.
   ============================================================= */

const Engine = (function () {
  "use strict";

  const STATE_VERSION = 5;   // 3 prices, 4 cabinet and instruments, 5 the district roll

  /* ---------------------------------------------------------
     1. STATE
     --------------------------------------------------------- */

  function newGame(C) {
    const st = {
      version: STATE_VERSION,
      sitting: 1,
      chapter: 1,
      session: 4,
      date: C.setup.startDate,
      inGovernment: true,
      pm: C.setup.pm,
      playerParty: C.setup.playerParty,

      scalars: Object.assign({}, C.setup.scalars),
      law: Object.assign({}, C.setup.law),

      parties: {},
      currents: {},
      stations: {},
      characters: {},
      bills: {},

      coalition: C.setup.coalition.slice(),
      confidenceSupply: C.setup.confidenceSupply.slice(),

      /* Signed ledger, one entry per partner. Positive means they owe you;
         negative means you owe them. Debts are never forgiven and never decay
         — a coalition remembers. */
      capital: {},

      /* Time on the order paper is the scarce good that generates capital.
         A session has a finite number of slots and every one you give a
         partner is one you do not get. */
      slots: { total: C.setup.slotsPerSession || 6, used: 0 },

      /* Halloran needs nine more names for a leadership ballot. Things the
         player does add to the counter; §3.5's second loss condition reads it. */
      signatures: 0,

      /* Cabinet. A post with no holder cannot make an instrument, which is the
         interlock that turns the appointment fight and the board fight into the
         same fight. */
      cabinet: {},

      /* Statutory instruments: made, in force, prayed against, revoked. */
      instruments: {},

      /* Planned whipping, per bill. Not spent until the division is called,
         so it can be revised or cleared. */
      whips: {},

      /* PRICES — index numbers, 100 at the founding of the current series.
         Not a market simulation and deliberately not equities: there is no
         point pricing shares in an economy where goods are nearly free. These
         are the four things that are actually scarce, and every one of them is
         a legislative output rather than a market outcome. A thermal
         appropriation moves the quota price; the quota price decides whether a
         poor station can afford to keep its people running.

         This is the causal chain the player is meant to watch:
         decision -> price -> station conditions -> event. */
      prices: { thermal: 100, substrate: 100, volume: 100, transit: 100 },
      priceHistory: { thermal: [100], substrate: [100], volume: [100], transit: [100] },

      president: Object.assign({}, C.setup.president),

      flags: {},
      queue: [],      // [{eventId, dueSitting}]
      seen: {},       // eventId -> times fired
      wire: [],       // [{sitting, text}]
      log: []         // [{sitting, text}]
    };

    C.parties.forEach(p => st.parties[p.id] = {
      id: p.id, loyalty: p.loyalty == null ? 100 : p.loyalty,
      seats: Object.assign({}, p.seats)
    });
    C.currents.forEach(c => st.currents[c.id] = { id: c.id, loyalty: c.loyalty, members: c.members });
    C.stations.forEach(s => st.stations[s.id] = JSON.parse(JSON.stringify(s)));
    C.characters.forEach(c => st.characters[c.id] = { id: c.id, relationship: c.relationship == null ? 50 : c.relationship, alive: true });
    C.bills.forEach(b => st.bills[b.id] = { id: b.id, stage: b.stage, dead: false, amendments: [] });
    (C.cabinet || []).forEach(p => st.cabinet[p.id] = {
      id: p.id, holder: p.holder || null, party: p.party || null });
    (C.instruments || []).forEach(i => st.instruments[i.id] = {
      id: i.id, made: false, inForce: false, revoked: false,
      madeAt: null, prayerCloses: null, effectApplied: false });
    st.coalition.concat(st.confidenceSupply).forEach(p => {
      if (p !== st.playerParty) st.capital[p] = (C.setup.capital || {})[p] || 0;
    });

    seedRoll(st, C);
    return st;
  }

  /* Save migration. Add a case per version bump; never delete one. */
  function migrate(st) {
    if (!st.version) st.version = 1;
    if (st.chapter == null) st.chapter = 1;   // saves from before chapters existed

    /* ASCENDING, one block per bump, each stamping only its own version.
       Descending order silently skips every earlier block: a v1 save hits
       `< 4`, is stamped 4, and never gets prices, capital, slots or whips,
       so the first division throws. Keep these in order and never delete one. */
    if (st.version < 2) {                     // capital, slots and whipping
      st.capital = st.capital || {};
      st.coalition.concat(st.confidenceSupply).forEach(p => {
        if (p !== st.playerParty && st.capital[p] == null) st.capital[p] = 0;
      });
      st.slots = st.slots || { total: 6, used: 0 };
      st.whips = st.whips || {};
      st.version = 2;
    }
    if (st.version < 3) {                     // scarcity prices
      st.prices = st.prices || { thermal:100, substrate:100, volume:100, transit:100 };
      st.priceHistory = st.priceHistory ||
        { thermal:[100], substrate:[100], volume:[100], transit:[100] };
      st.version = 3;
    }
    if (st.version < 4) {                     // cabinet and instruments
      st.cabinet = st.cabinet || {};
      st.instruments = st.instruments || {};
      if (st.signatures == null) st.signatures = 0;
      st.version = 4;
    }
    if (st.version < 5) {                     // the district roll
      /* Saves from before the roll existed carry only a district count per
         party. There is no way to recover which constituency each seat was,
         so the roll is reseeded from content and the count is whatever the
         roll says. A pre-roll save therefore returns to the authored map,
         which is the only honest reconstruction available. */
      st.rollReseeded = true;
      st.electionsHeld = st.electionsHeld || 0;
      st.version = 5;
    }
    return st;
  }

  /* ---------------------------------------------------------
     1b. THE DISTRICT ROLL — who sits for which constituency

     Every district seat lives here, in one place, and every district
     total in the game is DERIVED from it. Storing a party's district
     count alongside the roll is the apportionment_ratio mistake in
     CLAUDE.md: two numbers for one fact, drifting quietly apart. The
     count on st.parties[id].seats.district is a projection refreshed
     by syncRoll() after every change, and test.js asserts the two
     agree in both directions.

     A seat moves in exactly four ways, which is the whole point:
       vacateSeat   a member dies, resigns or is disqualified
       byElection   the vacancy is filled, on current opinion
       crossFloor   a member changes party without an election
       generalElection  everything is returned at once

     Vacancies are real. The chamber stays 280 seats and the majority
     stays 141, so an empty seat is a vote you do not have.
     --------------------------------------------------------- */

  function seedRoll(st, C) {
    st.roll = {};
    (C.constituencies || []).forEach(k => {
      st.roll[k.id] = { held: Object.assign({}, k.held || {}), vacant: 0 };
    });
    syncRoll(st, C);
  }

  /* Refresh the derived district counts. The only writer. */
  function syncRoll(st, C) {
    Object.keys(st.parties).forEach(id => { st.parties[id].seats.district = 0; });
    Object.keys(st.roll).forEach(cid => {
      const h = st.roll[cid].held;
      Object.keys(h).forEach(pid => {
        if (st.parties[pid]) st.parties[pid].seats.district += h[pid];
      });
    });
    return st;
  }

  function partyDistrict(st, id) {
    return Object.keys(st.roll || {}).reduce(
      (n, cid) => n + (st.roll[cid].held[id] || 0), 0);
  }
  function vacantSeats(st) {
    return Object.keys(st.roll || {}).reduce((n, cid) => n + st.roll[cid].vacant, 0);
  }
  function seatsFor(st, cid) { return st.roll[cid] || { held: {}, vacant: 0 }; }

  function vacateSeat(st, C, cid, party, why) {
    const r = st.roll[cid];
    if (!r || !r.held[party]) return { ok: false, reason: "no such seat" };
    r.held[party] -= 1;
    if (!r.held[party]) delete r.held[party];
    r.vacant += 1;
    syncRoll(st, C);
    const k = C.constituencyById[cid];
    st.log.unshift({ sitting: st.sitting,
      text: `Seat vacated: ${k ? k.name : cid} (${party})${why ? " — " + why : ""}` });
    return { ok: true };
  }

  function crossFloor(st, C, cid, from, to, n) {
    n = n || 1;
    const r = st.roll[cid];
    if (!r || (r.held[from] || 0) < n) return { ok: false, reason: "seats not held" };
    if (!st.parties[to]) return { ok: false, reason: "no such party" };
    r.held[from] -= n;
    if (!r.held[from]) delete r.held[from];
    r.held[to] = (r.held[to] || 0) + n;
    syncRoll(st, C);
    const k = C.constituencyById[cid];
    st.log.unshift({ sitting: st.sitting,
      text: `Crossed the floor: ${n} seat${n === 1 ? "" : "s"} for ` +
            `${k ? k.name : cid}, ${from} to ${to}` });
    return { ok: true, seats: n };
  }

  /* ---- votes ----------------------------------------------------

     Deterministic, per 1.5. A constituency's strength is its current
     roll; a party's national strength is its list bench. Blending the
     two means a party holding nothing here still has a floor to grow
     from, which is what makes a by-election worth watching rather
     than a foregone conclusion. */
  function shares(st, C, cons) {
    const roll = seatsFor(st, cons.id);
    const natTotal = Object.values(st.parties)
      .reduce((n, p) => n + (p.seats.list || 0), 0) || 1;
    const out = {};
    C.parties.forEach(p => {
      const local = (roll.held[p.id] || 0) / cons.magnitude;
      const nat = (st.parties[p.id].seats.list || 0) / natTotal;
      out[p.id] = 0.68 * local + 0.32 * nat;
    });
    return out;
  }

  /* Swing. Government carries the standing of the government; the
     opposition picks up a fraction of what it drops. */
  function swing(st) { return (st.scalars.public_standing - 50) / 100; }

  function swungShares(st, C, cons) {
    const s = shares(st, C, cons), k = swing(st);
    const gov = st.coalition.concat(st.confidenceSupply);
    let tot = 0;
    Object.keys(s).forEach(id => {
      s[id] *= gov.includes(id) ? (1 + k) : (1 - k * 0.4);
      if (s[id] < 0) s[id] = 0;
      tot += s[id];
    });
    if (tot > 0) Object.keys(s).forEach(id => s[id] /= tot);
    return s;
  }

  /* THE LIST IS A SECOND BALLOT (4.1), not a projection of the first.

     Deriving it from constituency strength quietly makes a pure-list party
     impossible — and 4.3 states the opposite, that a party strong nationally
     with no roots is viable and is the shape of the Public Substrate
     Association and the Georgists. So national standing carries the list,
     with a quarter weight on district strength to represent ticket-splitting
     in the other direction (4.3 puts it at 21.4%), which is also what lets a
     district-rooted party with no list bench win one. */
  function nationalShares(st, C) {
    const listTot = Object.values(st.parties)
      .reduce((n, p) => n + (p.seats.list || 0), 0) || 1;
    const distTot = Object.values(st.parties)
      .reduce((n, p) => n + (p.seats.district || 0), 0) || 1;
    const gov = st.coalition.concat(st.confidenceSupply), k = swing(st);
    const out = {}; let sum = 0;
    C.parties.forEach(p => {
      const nat = (st.parties[p.id].seats.list || 0) / listTot;
      const loc = (st.parties[p.id].seats.district || 0) / distTot;
      let v = 0.75 * nat + 0.25 * loc;
      v *= gov.includes(p.id) ? (1 + k) : (1 - k * 0.4);
      out[p.id] = v < 0 ? 0 : v; sum += out[p.id];
    });
    if (sum > 0) Object.keys(out).forEach(i => out[i] /= sum);
    return out;
  }

  /* Highest averages. Ties break on party id so a rerun is identical. */
  /* Highest averages. Over a single seat this is plurality — first past
     the post — which is what every district now is, so "fptp" needs no
     separate branch and is accepted as a name for that case. */
  function divisorAllocate(sh, seats, method) {
    const ids = Object.keys(sh).filter(i => sh[i] > 0).sort();
    const won = {}; ids.forEach(i => won[i] = 0);
    for (let n = 0; n < seats; n++) {
      let best = null, bestQ = -Infinity;
      ids.forEach(i => {
        const d = method === "sainte_lague" ? (2 * won[i] + 1) : (won[i] + 1);
        const q = sh[i] / d;
        if (q > bestQ + 1e-12) { bestQ = q; best = i; }
      });
      if (best === null) break;
      won[best] += 1;
    }
    Object.keys(won).forEach(i => { if (!won[i]) delete won[i]; });
    return won;
  }

  /* A by-election fills every vacancy in one constituency on current
     opinion. The seat is not returned to whoever lost it. */
  function byElection(st, C, cid) {
    const r = st.roll[cid];
    const k = C.constituencyById[cid];
    if (!r || !k) return { ok: false, reason: "no such constituency" };
    if (!r.vacant) return { ok: false, reason: "no vacancy" };
    const before = Object.assign({}, r.held);
    const won = divisorAllocate(swungShares(st, C, k), r.vacant,
                                st.law.district_divisor);
    Object.keys(won).forEach(pid => r.held[pid] = (r.held[pid] || 0) + won[pid]);
    const filled = r.vacant; r.vacant = 0;
    syncRoll(st, C);
    const gains = Object.keys(won).filter(p => (before[p] || 0) === 0);
    st.log.unshift({ sitting: st.sitting,
      text: `By-election, ${k.name}: ${filled} seat${filled === 1 ? "" : "s"} filled` +
            (gains.length ? ` — gain for ${gains.join(", ")}` : " — no change of hands") });
    st.wire.unshift({ sitting: st.sitting,
      text: `BY-ELECTION ${k.name.toUpperCase()} — ` +
            Object.keys(won).map(p => `${p.toUpperCase()} ${won[p]}`).join(", ") });
    return { ok: true, filled: filled, won: won, gains: gains };
  }

  /* The general election. District races run constituency by
     constituency; the list runs once, nationally, and does not
     compensate for district results (4.1, parallel not MMP).

     The threshold (4.8) bites on the list only, and exempts a party
     that won a district seat — the German carve-out canon adopts. */
  function generalElection(st, C) {
    const districtResults = {};
    Object.keys(st.roll).forEach(cid => {
      const k = C.constituencyById[cid];
      const won = divisorAllocate(swungShares(st, C, k), k.magnitude,
                                  st.law.district_divisor);
      districtResults[cid] = won;
    });

    const before = {};
    C.parties.forEach(p => before[p.id] = {
      district: partyDistrict(st, p.id), list: st.parties[p.id].seats.list || 0
    });

    Object.keys(districtResults).forEach(cid => {
      st.roll[cid] = { held: Object.assign({}, districtResults[cid]), vacant: 0 };
    });

    const nat = nationalShares(st, C);

    /* The threshold (4.8) bites on the list only. Two exemptions, both canon:
       a party that won a district seat (the German carve-out), and a party
       representing a single station or a single legal-person category, as
       minority protection. The second is declared in content, because which
       parties qualify is a political question and not the engine's to decide. */
    const cut = (st.law.threshold_pct || 0) / 100;
    const wonDistrict = id => Object.keys(districtResults)
      .some(cid => districtResults[cid][id]);
    const carved = id => !!(C.partyById[id] && C.partyById[id].carve_out);
    const eligibleList = {};
    Object.keys(nat).forEach(id => {
      if (nat[id] >= cut || wonDistrict(id) || carved(id)) eligibleList[id] = nat[id];
    });
    const listSeats = st.law.tier_ratio_list || 100;
    const listWon = divisorAllocate(eligibleList, listSeats, st.law.list_divisor);
    C.parties.forEach(p => st.parties[p.id].seats.list = listWon[p.id] || 0);

    syncRoll(st, C);
    st.lastElection = { sitting: st.sitting, nat: nat, threshold: cut,
                        barred: Object.keys(nat).filter(id => !eligibleList[id] && nat[id] > 0),
                        saved: Object.keys(eligibleList).filter(id =>
                          nat[id] < cut && (wonDistrict(id) || carved(id))) };
    st.electionsHeld = (st.electionsHeld || 0) + 1;

    const after = {};
    C.parties.forEach(p => after[p.id] = {
      district: partyDistrict(st, p.id), list: st.parties[p.id].seats.list
    });
    st.log.unshift({ sitting: st.sitting, text: "GENERAL ELECTION" });
    C.parties.forEach(p => {
      const d = (after[p.id].district + after[p.id].list) -
                (before[p.id].district + before[p.id].list);
      if (d) st.log.unshift({ sitting: st.sitting,
        text: `  ${p.id}: ${d > 0 ? "+" : ""}${d} (${after[p.id].district} district, ${after[p.id].list} list)` });
    });
    return { ok: true, before: before, after: after, national: nat,
             barred: st.lastElection.barred };
  }

  /* ---------------------------------------------------------
     2. SEAT ARITHMETIC
     --------------------------------------------------------- */

  const POPULAR_TIERS = ["district", "list"];

  function tierTotal(st, tier) {
    return Object.values(st.parties).reduce((n, p) => n + (p.seats[tier] || 0), 0);
  }
  function popularTotal(st) { return POPULAR_TIERS.reduce((n, t) => n + tierTotal(st, t), 0); }
  function functionalTotal(st) { return tierTotal(st, "functional"); }
  function chamberTotal(st) { return popularTotal(st) + functionalTotal(st); }

  function partyPopular(st, id) {
    const p = st.parties[id]; if (!p) return 0;
    return POPULAR_TIERS.reduce((n, t) => n + (p.seats[t] || 0), 0);
  }
  function partyFunctional(st, id) {
    const p = st.parties[id]; return p ? (p.seats.functional || 0) : 0;
  }
  function partyTotal(st, id) { return partyPopular(st, id) + partyFunctional(st, id); }

  /* Confidence is derived, never stored. */
  function confidence(st) {
    let n = 0;
    st.coalition.forEach(id => n += partyTotal(st, id));
    st.confidenceSupply.forEach(id => n += partyTotal(st, id));
    return n;
  }
  function majority(st) { return Math.floor(chamberTotal(st) / 2) + 1; }

  /* ---------------------------------------------------------
     3. THE DIVISION CALCULATOR
     -------------------------------------------------------------
     Returns support tier by tier. A bill declares `stances`
     keyed by party id. A stance is one of:

       "for" | "against" | "abstain"
       { for: n }                      // n seats aye, rest against
       { forPct: 0..1 }                // proportion aye
       { free: true }                  // splits on current loyalty

     Parties not listed fall back to axis inference against the
     bill's own `axes`, so a new bill need not enumerate all of them.
     --------------------------------------------------------- */

  const AXES = ["ownership", "personhood", "sovereignty", "closure"];

  /* Full loyalty delivers every member; none still delivers three quarters,
     because a party is not a coalition of strangers. */
  function discipline(st, partyId) {
    const p = st.parties[partyId];
    const loy = p ? p.loyalty : 60;
    return 0.75 + 0.25 * (loy / 100);
  }

  function axisAgreement(partyAxes, billAxes) {
    let score = 0, counted = 0;
    AXES.forEach(a => {
      if (billAxes[a] == null || partyAxes[a] == null) return;
      counted++;
      score += (partyAxes[a] === billAxes[a]) ? 1 : -1;
    });
    return counted ? score / counted : 0;   // -1 .. +1
  }

  function resolveStance(st, C, bill, partyId, tier) {
    const seats = tier === "functional" ? partyFunctional(st, partyId) : partyPopular(st, partyId);
    if (!seats) return 0;

    let s = bill.stances && bill.stances[partyId];
    if (s == null) s = inferStance(st, C, bill, partyId);

    // A stance may be split by bench: { popular: ..., functional: ... }
    if (s && typeof s === "object" && (s.popular != null || s.functional != null)) {
      s = (tier === "functional" ? s.functional : s.popular);
      if (s == null) return 0;
    }

    /* A bare "for" is a party POSITION, not a guarantee of turnout. What it
       actually delivers depends on discipline, and discipline is loyalty.
       The gap between position and delivery is exactly what whipping buys
       back — without it the whip has nothing to do. An explicit {for:n} is
       a stated count and is taken at face value. */
    if (s === "for") return Math.round(seats * discipline(st, partyId));
    if (s === "against" || s === "abstain") return 0;
    if (typeof s === "object") {
      if (s.free) {
        const loy = st.parties[partyId] ? st.parties[partyId].loyalty : 50;
        return Math.min(seats, Math.round(seats * (loy / 100)));
      }
      if (s.forPct != null) return Math.min(seats, Math.round(seats * s.forPct));
      if (s.for != null) return Math.min(seats, s.for);   // seats in THIS bench
    }
    return 0;
  }

  function inferStance(st, C, bill, partyId) {
    const def = C.partyById[partyId];
    if (!def || !bill.axes) return "against";
    const a = axisAgreement(def.axes, bill.axes);
    if (a > 0.25) return "for";
    if (a < -0.25) return "against";
    return { forPct: 0.5 };
  }

  /* ---------------------------------------------------------
     WHIPPING

     What you can move, and what it costs, both depend on how far the
     bill sits from the party's own position on the four axes. A partner
     who broadly agrees is cheap and can be moved a long way. One who
     fundamentally disagrees can be moved barely at all, at any price —
     which is what keeps the axes load-bearing rather than decorative.

     You cannot whip a party outside your coalition. Moving those benches
     is lobbying, which is a different activity with a different currency.
     --------------------------------------------------------- */

  const WHIP_BANDS = [
    { min:  0.25, movable: 1.00, cost: 0.5 },   // broadly agrees
    { min: -0.25, movable: 0.50, cost: 1.0 },   // no strong view
    { min: -9.99, movable: 0.15, cost: 2.5 }    // fundamentally opposed
  ];

  function whipBand(st, C, bill, partyId) {
    const def = C.partyById[partyId];
    const a = def && bill.axes ? axisAgreement(def.axes, bill.axes) : 0;
    return WHIP_BANDS.find(b => a >= b.min);
  }

  function whippable(st, C, billId, partyId, tier) {
    const bill = C.billById[billId];
    const inGov = st.coalition.includes(partyId) || st.confidenceSupply.includes(partyId);
    const own = partyId === st.playerParty;
    if (!inGov && !own) return { max: 0, costPerSeat: 0, reason: "outside the coalition — lobbying, not whipping" };

    const seats = tier === "functional" ? partyFunctional(st, partyId) : partyPopular(st, partyId);
    const already = resolveStance(st, C, bill, partyId, tier);
    const headroom = seats - already;
    if (headroom <= 0) return { max: 0, costPerSeat: 0, reason: "already voting aye to a member" };

    const band = whipBand(st, C, bill, partyId);
    const max = Math.floor(headroom * band.movable);
    return {
      max: max,
      costPerSeat: band.cost,
      currency: own ? "loyalty" : "capital",
      reason: max ? null : "cannot be moved on this measure"
    };
  }

  function whipsFor(st, billId) { return (st.whips[billId] ||= {}); }

  function setWhip(st, C, billId, partyId, tier, seats) {
    const cap = whippable(st, C, billId, partyId, tier);
    const w = whipsFor(st, billId);
    w[partyId] ||= { popular: 0, functional: 0 };
    w[partyId][tier] = Math.max(0, Math.min(cap.max, Math.round(seats)));
    return w[partyId][tier];
  }

  /* Total price of the plan currently attached to a bill. */
  function whipCost(st, C, billId) {
    const bill = C.billById[billId], w = st.whips[billId] || {};
    const out = { capital: {}, loyalty: 0, seats: 0 };
    Object.keys(w).forEach(pid => {
      ["popular", "functional"].forEach(tier => {
        const n = w[pid][tier] || 0; if (!n) return;
        const band = whipBand(st, C, bill, pid);
        const price = Math.ceil(n * band.cost);
        out.seats += n;
        if (pid === st.playerParty) out.loyalty += price;
        else out.capital[pid] = (out.capital[pid] || 0) + price;
      });
    });
    return out;
  }

  /* Spend it. Going into debt is allowed and costs loyalty with that partner,
     because calling in credit you do not have is a favour, not a transaction. */
  function payWhips(st, C, billId) {
    const cost = whipCost(st, C, billId);
    if (cost.loyalty) {
      st.scalars.party_loyalty = clamp(st.scalars.party_loyalty - cost.loyalty, 0, 100);
    }
    Object.keys(cost.capital).forEach(pid => {
      const before = st.capital[pid] || 0;
      const after = before - cost.capital[pid];
      st.capital[pid] = after;
      if (after < 0) {
        const overdrawn = Math.min(cost.capital[pid], -after);
        if (st.parties[pid]) st.parties[pid].loyalty = clamp(st.parties[pid].loyalty - overdrawn * 2, 0, 100);
      }
    });
    delete st.whips[billId];
    return cost;
  }

  function clearWhips(st, billId) { delete st.whips[billId]; }

  /* Call the division. Order matters and getting it wrong is silent: the
     result must be computed while the whip plan is still attached, because
     paying for it clears it. Callers use this rather than sequencing it
     themselves. */
  function divide(st, C, billId) {
    const b = C.billById[billId];
    const result = division(st, C, billId);     // whips still in place
    const paid = payWhips(st, C, billId);       // now charge for them
    const bs = st.bills[billId];

    if (!result.carries) {
      apply(st, C, b.onFail);
      bs.stage = "defeated"; bs.dead = true;
      st.log.unshift({ sitting: st.sitting, text: "Division: " + b.title + " — defeated" +
        (paid.seats ? " (" + paid.seats + " whipped)" : "") });
      return { result: result, paid: paid, assent: null };
    }

    /* Carrying is not the end. The bill goes to the President, who signs or
       refers it for constitutional review. Referral is not a veto — it delays
       and returns a verdict — but it is the reserve power with the sharpest
       teeth, and Tenaya has privately indicated he would use it on a threshold
       bill carried on a contested dual majority. */
    bs.stage = "awaiting_assent";
    bs.carriedAt = st.sitting;
    bs.contested = !!(b.dualMajority && result.functional.aye < result.functional.need + 3);
    st.log.unshift({ sitting: st.sitting, text: "Division: " + b.title + " — carried" +
      (paid.seats ? " (" + paid.seats + " whipped)" : "") });
    const a = presidentDecides(st, C, billId, result);
    return { result: result, paid: paid, assent: a };
  }

  /* ---------------------------------------------------------
     PRESIDENTIAL ASSENT

     Deterministic, per the brief: referral is a condition on the state,
     never a random roll. Three things make it likely — a cold
     relationship, a bill the office has signalled about, and a dual
     majority carried on a narrow functional margin.
     --------------------------------------------------------- */

  function referralRisk(st, C, billId) {
    const b = C.billById[billId], bs = st.bills[billId];
    if (!b.referrable) return { willRefer: false, reasons: [] };
    const reasons = [];
    if (st.president.relationship < 35) reasons.push("relations with the office are cold");
    if (bs.contested) reasons.push("carried on a contested dual majority");
    if (b.signalled) reasons.push("the office signalled it would refer this measure");
    if (st.flags.board_packed || st.flags.legal_board_packed)
      reasons.push("licensing boards were altered by order during its passage");
    return { willRefer: reasons.length >= 2, reasons: reasons };
  }

  function presidentDecides(st, C, billId, result) {
    const b = C.billById[billId], bs = st.bills[billId];
    const risk = referralRisk(st, C, billId);
    if (risk.willRefer) {
      bs.stage = "referred";
      bs.returnsAt = st.sitting + 4 + (bs.contested ? 4 : 0);
      st.log.unshift({ sitting: st.sitting, text: "Referred for constitutional review: " + b.title });
      st.wire.unshift({ sitting: st.sitting,
        text: "PRESIDENT REFERS " + b.title.toUpperCase() + " FOR CONSTITUTIONAL REVIEW" });
      return { referred: true, reasons: risk.reasons, returnsAt: bs.returnsAt };
    }
    return assent(st, C, billId);
  }

  /* Signing is where the effects land, and where the ceremony fires. */
  function assent(st, C, billId) {
    const b = C.billById[billId], bs = st.bills[billId];
    apply(st, C, b.onPass);
    bs.stage = "assented"; bs.dead = true; bs.assentedAt = st.sitting;
    st.log.unshift({ sitting: st.sitting, text: "Assented: " + b.title });
    /* The ceremony is reserved for acts that cannot be undone, so it fires only
       on a bill that needed more than a simple majority. Six or eight times a
       playthrough, not on every division. */
    const ceremony = !!b.dualMajority;
    if (ceremony) st.pendingCeremony = billId;
    return { referred: false, assented: true, ceremony: ceremony };
  }

  /* Referred bills come back. The verdict is deterministic too: a measure that
     was carried narrowly on a packed bench does not survive review. */
  function reviewReturns(st, C) {
    const out = [];
    Object.keys(st.bills).forEach(id => {
      const bs = st.bills[id];
      if (bs.stage !== "referred" || bs.returnsAt == null) return;
      if (st.sitting < bs.returnsAt) return;
      const b = C.billById[id];
      const struck = bs.contested && (st.flags.board_packed || st.flags.legal_board_packed);
      if (struck) {
        bs.stage = "struck"; bs.dead = true;
        apply(st, C, b.onFail);
        st.log.unshift({ sitting: st.sitting, text: "Struck on review: " + b.title });
        st.wire.unshift({ sitting: st.sitting, text: "COURT STRIKES " + b.title.toUpperCase() });
        out.push({ bill: id, struck: true });
      } else {
        assent(st, C, id);
        st.wire.unshift({ sitting: st.sitting, text: "REVIEW UPHOLDS " + b.title.toUpperCase() + "; ACT SIGNED" });
        out.push({ bill: id, struck: false });
      }
    });
    return out;
  }

  /* ---------------------------------------------------------
     ORDER PAPER SLOTS

     A session has a finite number of slots. Giving one to a partner's
     bill advances it and puts them in your debt. Giving one to your own
     advances nothing but your programme.
     --------------------------------------------------------- */

  /* A bill walks the ladder one order-paper slot at a time. Divisions happen at
     third reading only; earlier stages are procedural and consume a slot without
     a vote. The upper house is a pure delay — its powers are still THIN. */
  const STAGE_ORDER = ["drafting","first_reading","second_reading","committee",
                       "report","third_reading","upper_house","assent"];
  const DIVIDES_AT = "third_reading";

  function grantSlot(st, C, billId) {
    if (st.slots.used >= st.slots.total) return { ok: false, reason: "no slots left this session" };
    const b = C.billById[billId], bs = st.bills[billId];
    if (!b || bs.dead) return { ok: false, reason: "not before Parliament" };
    if (bs.stage === DIVIDES_AT) return { ok: false, reason: "awaiting a division" };
    /* Order-paper time is the scarce good that generates capital, so a slot
       must never be consumed without moving something. A stage the engine
       does not recognise used to fall through every branch below and burn
       the slot in silence — content had a bill sitting at "lords", which is
       not in STAGE_ORDER and is not the name this setting uses either. */
    const i = STAGE_ORDER.indexOf(bs.stage);
    if (bs.stage === "blocked") { bs.stage = "second_reading"; }
    else if (i === STAGE_ORDER.length - 1) return { ok: false, reason: "already awaiting assent" };
    else if (i >= 0) { bs.stage = STAGE_ORDER[i + 1]; }
    else return { ok: false, reason: 'unknown stage "' + bs.stage + '"' };
    st.slots.used += 1;
    let gained = 0;
    const owner = b.owner;
    if (owner && owner !== st.playerParty && st.capital[owner] != null) {
      gained = b.priority ? 3 : 2;
      st.capital[owner] += gained;
    }
    st.log.unshift({ sitting: st.sitting,
      text: "Slot granted: " + b.title + (gained ? " (+" + gained + " with " + owner + ")" : "") });
    return { ok: true, gained: gained, owner: owner, stage: bs.stage };
  }

  /* ---------------------------------------------------------
     STATUTORY INSTRUMENTS

     The distinction is the point. A bill needs a majority and cannot be
     undone; an instrument needs no majority and can be revoked. The
     player learns that the fast tool is the deniable one and the slow
     tool is the permanent one.

     NEGATIVE procedure — the default, and the interesting one. Takes
     effect immediately on being made and stands unless the House prays
     against it within the window. A prayer needs a simple popular
     majority: no functional test, no dual majority. So an instrument is
     fast, unilateral, and vulnerable to a chamber that notices.

     AFFIRMATIVE — needs a simple popular majority BEFORE taking effect.
     Reserved for instruments touching life-support integrity.

     Every instrument names a cabinet post. A vacant post cannot make
     one.
     --------------------------------------------------------- */

  function canMake(st, C, siId) {
    const si = (C.instrumentById || {})[siId], s = st.instruments[siId];
    if (!si || !s) return { ok: false, reason: "no such instrument" };
    if (s.made && !s.revoked) return { ok: false, reason: "already made" };
    const post = st.cabinet[si.author];
    if (!post) return { ok: false, reason: "names no cabinet post" };
    if (!post.holder) return { ok: false, reason: "the post of " +
      si.author.replace(/_/g, " ") + " is vacant" };
    return { ok: true, post: post };
  }

  function makeInstrument(st, C, siId) {
    const chk = canMake(st, C, siId);
    if (!chk.ok) return chk;
    const si = C.instrumentById[siId], s = st.instruments[siId];
    s.made = true; s.revoked = false; s.madeAt = st.sitting;
    if (si.procedure === "affirmative") { s.inForce = false; s.awaitingApproval = true; }
    else {
      s.inForce = true; s.effectApplied = true;
      s.prayerCloses = st.sitting + (si.prayer_window || 6);
      apply(st, C, si.effects);
    }
    if (si.political_cost) apply(st, C, si.political_cost);
    st.log.unshift({ sitting: st.sitting, text: "Instrument made: " + si.title });
    return { ok: true, inForce: s.inForce };
  }

  function prayerForecast(st, C, siId) {
    const si = C.instrumentById[siId];
    const total = popularTotal(st), need = Math.floor(total / 2) + 1;
    let aye = 0;
    Object.keys(st.parties).forEach(pid => {
      const seats = partyPopular(st, pid);
      const inGov = st.coalition.includes(pid) || st.confidenceSupply.includes(pid);
      const stance = (si.prayer_stances || {})[pid];
      /* A coalition partner angry enough votes to annul its own government's
         instrument. That is what makes an order vulnerable to "a chamber that
         notices" rather than merely to the opposition. */
      if (stance && typeof stance === "object" && stance.ifLoyaltyBelow != null) {
        if ((st.parties[pid] ? st.parties[pid].loyalty : 100) < stance.ifLoyaltyBelow)
          aye += Math.round(seats * discipline(st, pid));
        return;
      }
      if (stance === "for") aye += seats;
      else if (stance === "against") return;
      else if (!inGov) aye += Math.round(seats * discipline(st, pid));
    });
    return { aye: aye, total: total, need: need, carries: aye >= need };
  }

  function prayAgainst(st, C, siId) {
    const si = C.instrumentById[siId], s = st.instruments[siId];
    if (!s || !s.made || s.revoked) return { ok: false, reason: "not in force" };
    if (s.prayerCloses != null && st.sitting > s.prayerCloses)
      return { ok: false, reason: "the praying window has closed" };
    const f = prayerForecast(st, C, siId);
    if (f.carries) {
      s.revoked = true; s.inForce = false;
      if (s.effectApplied && si.reverse) { apply(st, C, si.reverse); s.effectApplied = false; }
      st.log.unshift({ sitting: st.sitting, text: "Prayer carried: " + si.title + " revoked" });
      st.wire.unshift({ sitting: st.sitting, text: "HOUSE PRAYS AGAINST " + si.title.toUpperCase() });
    } else st.log.unshift({ sitting: st.sitting, text: "Prayer defeated: " + si.title + " stands" });
    return { ok: true, carried: f.carries, forecast: f };
  }

  function revokeInstrument(st, C, siId) {
    const si = C.instrumentById[siId], s = st.instruments[siId];
    if (!s || !s.inForce) return { ok: false, reason: "not in force" };
    if (!si.revocable) return { ok: false, reason: "not revocable" };
    s.revoked = true; s.inForce = false;
    if (s.effectApplied && si.reverse) { apply(st, C, si.reverse); s.effectApplied = false; }
    st.log.unshift({ sitting: st.sitting, text: "Instrument revoked: " + si.title });
    return { ok: true };
  }

  function instrumentsInForce(st) {
    return Object.keys(st.instruments).filter(k => st.instruments[k].inForce);
  }

  /* ---------------------------------------------------------
     CABINET
     --------------------------------------------------------- */

  function appoint(st, C, postId, holderId, partyId) {
    const p = st.cabinet[postId];
    if (!p) return { ok: false, reason: "no such post" };
    p.holder = holderId; p.party = partyId || null;
    st.log.unshift({ sitting: st.sitting, text: "Appointment: " + postId.replace(/_/g, " ") });
    return { ok: true };
  }

  function vacate(st, C, postId, reason) {
    const p = st.cabinet[postId];
    if (!p || !p.holder) return { ok: false };
    p.holder = null;
    st.log.unshift({ sitting: st.sitting,
      text: "Ministerial vacancy: " + postId.replace(/_/g, " ") + (reason ? " — " + reason : "") });
    return { ok: true };
  }

  /* ---------------------------------------------------------
     APPORTIONMENT

     Derived, never stored. A constituency's ratio is its seats per
     attested voter against the chamber mean. Storing it alongside
     seats and population let the three drift apart, and they did.

     Because the electorate is attested adults, an attestation bill
     moves the malapportionment. The civil-liberties fight and the
     electoral one are the same fight.
     --------------------------------------------------------- */

  function apportionment(C) {
    const cons = C.constituencies || [];
    if (!cons.length) return {};
    const seats = cons.reduce((n, c) => n + c.magnitude, 0);
    const el = cons.reduce((n, c) => n + c.electorate, 0);
    const mean = seats / el;
    const out = {};
    cons.forEach(c => out[c.id] = Math.round(((c.magnitude / c.electorate) / mean) * 100) / 100);
    return out;
  }

  /* The district tier must equal the sum of constituency magnitudes.
     Nothing checked this before and the two had drifted by 84 seats. */
  function tierCheck(st, C) {
    const cons = (C.constituencies || []).reduce((n, c) => n + c.magnitude, 0);
    const party = Object.values(st.parties).reduce((n, p) => n + (p.seats.district || 0), 0)
                + vacantSeats(st);   /* an empty seat is still a seat in the tier */
    return { constituencies: cons, party: party, ok: cons === party };
  }

  function division(st, C, billId) {
    const bill = C.billById[billId];
    if (!bill) throw new Error("unknown bill: " + billId);

    const rows = [];
    let popAye = 0, funcAye = 0;

    const w = st.whips[billId] || {};
    Object.keys(st.parties).forEach(pid => {
      const wp = w[pid] || {};
      const pBase = resolveStance(st, C, bill, pid, "popular");
      const fBase = resolveStance(st, C, bill, pid, "functional");
      const pAye = Math.min(partyPopular(st, pid), pBase + (wp.popular || 0));
      const fAye = Math.min(partyFunctional(st, pid), fBase + (wp.functional || 0));
      popAye += pAye; funcAye += fAye;
      rows.push({
        party: pid,
        popularSeats: partyPopular(st, pid), popularAye: pAye, popularWhipped: wp.popular || 0,
        functionalSeats: partyFunctional(st, pid), functionalAye: fAye, functionalWhipped: wp.functional || 0
      });
    });

    const popTotal = popularTotal(st), funcTotal = functionalTotal(st);
    const popNeed = Math.floor(popTotal / 2) + 1;
    const funcNeed = Math.floor(funcTotal / 2) + 1;

    const dual = !!bill.dualMajority;
    const popCarries = popAye >= popNeed;
    const funcCarries = funcAye >= funcNeed;

    return {
      bill: billId, dual: dual, rows: rows,
      popular:   { aye: popAye,  total: popTotal,  need: popNeed,  carries: popCarries },
      functional:{ aye: funcAye, total: funcTotal, need: funcNeed, carries: funcCarries },
      carries: dual ? (popCarries && funcCarries) : popCarries
    };
  }

  /* ---------------------------------------------------------
     4. CONDITIONS — the closed vocabulary events may test
     --------------------------------------------------------- */

  const CONDITIONS = {
    minSitting:   (st, v) => st.sitting >= v,
    maxSitting:   (st, v) => st.sitting <= v,
    flags:        (st, v) => v.every(f => !!st.flags[f]),
    flagsAbsent:  (st, v) => v.every(f => !st.flags[f]),
    scalarBelow:  (st, v) => Object.keys(v).every(k => st.scalars[k] < v[k]),
    scalarAbove:  (st, v) => Object.keys(v).every(k => st.scalars[k] > v[k]),
    lawIs:        (st, v) => Object.keys(v).every(k => st.law[k] === v[k]),
    lawBelow:     (st, v) => Object.keys(v).every(k => st.law[k] < v[k]),
    lawAbove:     (st, v) => Object.keys(v).every(k => st.law[k] > v[k]),
    loyaltyBelow: (st, v) => Object.keys(v).every(k =>
                    ((st.currents[k] || st.parties[k] || {}).loyalty ?? 100) < v[k]),
    loyaltyAbove: (st, v) => Object.keys(v).every(k =>
                    ((st.currents[k] || st.parties[k] || {}).loyalty ?? 0) > v[k]),
    stationBelow: (st, v) => Object.keys(v).every(id =>
                    Object.keys(v[id]).every(f => st.stations[id][f] < v[id][f])),
    billStage:    (st, v) => Object.keys(v).every(id => st.bills[id] && st.bills[id].stage === v[id]),
    signaturesAtLeast: (st, v) => (st.signatures || 0) >= v,
    siInForce:      (st, v) => [].concat(v).every(k => st.instruments[k] && st.instruments[k].inForce),
    siNotMade:      (st, v) => [].concat(v).every(k => st.instruments[k] && !st.instruments[k].made),
    postVacant:     (st, v) => [].concat(v).every(k => st.cabinet[k] && !st.cabinet[k].holder),
    priceAbove:     (st, v) => Object.keys(v).every(k => st.prices[k] > v[k]),
    priceBelow:     (st, v) => Object.keys(v).every(k => st.prices[k] < v[k]),
    capitalAbove:   (st, v) => Object.keys(v).every(k => (st.capital[k] || 0) > v[k]),
    capitalBelow:   (st, v) => Object.keys(v).every(k => (st.capital[k] || 0) < v[k]),
    slotsLeft:      (st, v) => (st.slots.total - st.slots.used) >= v,
    chapterIs:      (st, v) => st.chapter === v,
    chapterAtLeast: (st, v) => st.chapter >= v,
    inGovernment:   (st, v) => st.inGovernment === v
  };

  function matches(st, when) {
    if (!when) return true;
    return Object.keys(when).every(k => {
      if (!CONDITIONS[k]) throw new Error("unknown condition: " + k);
      return CONDITIONS[k](st, when[k]);
    });
  }

  /* ---------------------------------------------------------
     5. EFFECTS — the closed vocabulary choices may apply
     --------------------------------------------------------- */

  const EFFECTS = {
    scalar: (st, C, v) => Object.keys(v).forEach(k => {
      st.scalars[k] = clamp((st.scalars[k] || 0) + v[k], 0, 100);
    }),
    loyalty: (st, C, v) => Object.keys(v).forEach(k => {
      const t = st.currents[k] || st.parties[k];
      if (t) t.loyalty = clamp(t.loyalty + v[k], 0, 100);
    }),
    law: (st, C, v) => Object.assign(st.law, v),
    station: (st, C, v) => Object.keys(v).forEach(id => {
      Object.keys(v[id]).forEach(f => {
        const d = v[id][f];
        st.stations[id][f] = (typeof d === "number" && typeof st.stations[id][f] === "number")
          ? st.stations[id][f] + d : d;
      });
    }),
    seats: (st, C, v) => Object.keys(v).forEach(pid => {
      Object.keys(v[pid]).forEach(t => {
        /* district is derived from the roll; setting it here would be undone
           by the next syncRoll without saying so. Use cross/vacate_seat. */
        if (t === "district") {
          st.log.unshift({ sitting: st.sitting, text:
            "IGNORED: a seats effect tried to set district seats for " + pid +
            ". District seats live in the roll — use cross or vacate_seat." });
          return;
        }
        st.parties[pid].seats[t] += v[pid][t];
      });
    }),
    flag:   (st, C, v) => [].concat(v).forEach(f => st.flags[f] = true),
    unflag: (st, C, v) => [].concat(v).forEach(f => delete st.flags[f]),
    bill:   (st, C, v) => Object.keys(v).forEach(id => Object.assign(st.bills[id], v[id])),
    relationship: (st, C, v) => Object.keys(v).forEach(k => {
      if (k === "president") st.president.relationship = clamp(st.president.relationship + v[k], 0, 100);
      else if (st.characters[k]) st.characters[k].relationship = clamp(st.characters[k].relationship + v[k], 0, 100);
    }),
    coalition: (st, C, v) => {
      if (v.remove) st.coalition = st.coalition.filter(p => !v.remove.includes(p));
      if (v.add) v.add.forEach(p => { if (!st.coalition.includes(p)) st.coalition.push(p); });
    },
    wire: (st, C, v) => [].concat(v).forEach(t => st.wire.unshift({ sitting: st.sitting, text: t })),
    queue: (st, C, v) => [].concat(v).forEach(q =>
      st.queue.push({ eventId: q.event, dueSitting: st.sitting + (q.after || 1) })),
    signatures: (st, C, v) => { st.signatures = Math.max(0, (st.signatures || 0) + v); },
    si: (st, C, v) => [].concat(v).forEach(id => makeInstrument(st, C, id)),
    cabinet: (st, C, v) => Object.keys(v).forEach(post => {
      if (v[post] === null) vacate(st, C, post, "resigned");
      else appoint(st, C, post, v[post].holder, v[post].party);
    }),
    price: (st, C, v) => Object.keys(v).forEach(k => {
      st.prices[k] = clamp((st.prices[k] || 100) + v[k], 20, 400);
    }),
    capital: (st, C, v) => Object.keys(v).forEach(k => {
      if (st.capital[k] == null) st.capital[k] = 0;
      st.capital[k] += v[k];
    }),
    slots: (st, C, v) => {
      if (v.total != null) st.slots.total += v.total;
      if (v.refill) { st.slots.used = 0; }
    },
    /* Seats move by these four verbs and no other. Writing a district count
       directly would desynchronise it from the roll on the next syncRoll,
       silently, which is the failure this whole section exists to prevent. */
    cross: (st, C, v) => [].concat(v).forEach(x =>
      crossFloor(st, C, x.constituency, x.from, x.to, x.seats || 1)),
    vacate_seat: (st, C, v) => [].concat(v).forEach(x =>
      vacateSeat(st, C, x.constituency, x.party, x.why)),
    byelection: (st, C, v) => [].concat(v).forEach(cid => byElection(st, C, cid)),
    election: (st, C, v) => { if (v) generalElection(st, C); },

    chapter: (st, C, v) => {
      if (v === st.chapter) return;
      st.chapter = v;
      st.log.unshift({ sitting: st.sitting, text: "— Chapter " + v + " —", chapterMark: true });
    }
  };

  function apply(st, C, effects) {
    if (!effects) return;
    [].concat(effects).forEach(eff => {
      Object.keys(eff).forEach(k => {
        if (!EFFECTS[k]) throw new Error("unknown effect: " + k);
        EFFECTS[k](st, C, eff[k]);
      });
    });
  }

  /* ---------------------------------------------------------
     6. EVENT SELECTION
     -------------------------------------------------------------
     Deterministic. Queued events first, then the highest-weight
     eligible event. Ties break on id, so a given state always
     produces the same sitting. Makes balance testable.
     --------------------------------------------------------- */

  function eligible(st, C) {
    const out = [];
    C.events.forEach(e => {
      const fired = st.seen[e.id] || 0;
      if (e.queuedOnly) return;          // reachable only via a queue effect
      if (e.prologue) return;            // handled by the authored opening sequence
      if (e.chapter != null && e.chapter !== st.chapter) return;
      if (e.once && fired) return;
      if (e.maxFires && fired >= e.maxFires) return;
      if (!matches(st, e.when)) return;
      out.push(e);
    });
    return out;
  }

  /* A prologue is an authored sequence at the head of a CHAPTER — not a weighted
     pool. It exists so the player meets one new idea at a time instead of five in
     the first paragraph. Events fire in `prologue` order, skipping any whose
     `when` fails. An event with no `chapter` belongs to chapter 1's opening. */
  function nextPrologue(st, C) {
    const pro = C.events
      .filter(e => e.prologue && (e.chapter == null ? 1 : e.chapter) === st.chapter)
      .sort((a, b) => a.prologue - b.prologue);
    for (const e of pro) {
      if (st.seen[e.id]) continue;
      if (!matches(st, e.when)) continue;
      return e;
    }
    return null;
  }

  function nextEvent(st, C) {
    const due = st.queue.filter(q => q.dueSitting <= st.sitting);
    if (due.length) {
      const q = due[0];
      st.queue = st.queue.filter(x => x !== q);
      return C.eventById[q.eventId];
    }
    const pro = nextPrologue(st, C);
    if (pro) return pro;
    const pool = eligible(st, C);
    if (!pool.length) return null;
    pool.sort((a, b) => (b.weight || 1) - (a.weight || 1) || (a.id < b.id ? -1 : 1));
    return pool[0];
  }

  function choose(st, C, event, choiceIndex) {
    const ch = event.choices[choiceIndex];
    apply(st, C, ch.effects);
    st.seen[event.id] = (st.seen[event.id] || 0) + 1;
    st.log.unshift({ sitting: st.sitting, text: event.title + " — " + ch.label });
    return ch.result || null;
  }

  /* ---------------------------------------------------------
     THE TICK

     Runs once per sitting. Shallow by design — no solver, no
     equilibrium, no spreadsheet. Prices drift toward what the current
     policy settings imply, and stations respond to prices.

     The point is not economic realism. It is that a bill passed in
     sitting four is still visibly doing something in sitting thirty,
     to a place with a name.
     --------------------------------------------------------- */

  /* Move a fifth of the way toward the implied level, so prices lag policy
     rather than snapping to it. Politics happens in the lag. */
  function drift(now, target) { return (target - now) * 0.2; }

  function tick(st, C) {
    const P = st.prices, marks = [];

    /* thermal: scarce when the federal margin is thin */
    const pressure = (35 - st.scalars.thermal_margin) * 1.2;
    P.thermal = clamp(P.thermal + drift(P.thermal, 100 + pressure), 20, 400);

    /* substrate: cheaper the more of it is publicly held, dearer as thermal rises */
    const pub = st.law.substrate_public_share == null ? 0.35 : st.law.substrate_public_share;
    P.substrate = clamp(P.substrate + drift(P.substrate,
      70 + (1 - pub) * 60 + (P.thermal - 100) * 0.4), 20, 400);

    /* volume: pressurised cubic metres, capped by construction schedule */
    P.volume = clamp(P.volume + drift(P.volume,
      100 + (st.scalars.treasury < 40 ? 14 : -4)), 20, 400);

    /* transit: launch windows and delta-v */
    P.transit = clamp(P.transit + drift(P.transit,
      100 - (st.scalars.treasury - 50) * 0.3), 20, 400);

    Object.keys(P).forEach(k => {
      P[k] = Math.round(P[k] * 10) / 10;
      const h = st.priceHistory[k] || (st.priceHistory[k] = []);
      h.push(P[k]); if (h.length > 60) h.shift();
    });

    /* Stations answer to the substrate price. A habitat that cannot pay does
       not economise — it sheds people, and the shed order says which. */
    const strain = (P.substrate - 100) / 100;
    if (Math.abs(strain) > 0.06) {
      C.stations.forEach(s0 => {
        const s = st.stations[s0.id];
        const exposure = Math.max(0, 0.75 - s.closure);      // poor stations feel it first
        const delta = Math.round(strain * exposure * s.population * 0.0012);
        if (!delta) return;
        const before = s.suspended;
        s.suspended = Math.max(0, s.suspended + delta);
        if (delta > 0 && before < 10000 && s.suspended >= 10000)
          marks.push(s.name + " passes ten thousand suspended");
        if (delta < 0 && before >= 10000 && s.suspended < 10000)
          marks.push(s.name + " falls below ten thousand suspended");
      });
    }
    return marks;
  }

  function advance(st, C) {
    st.sitting += 1;
    if (C) reviewReturns(st, C);
    if (C) tick(st, C).forEach(m =>
      st.wire.unshift({ sitting: st.sitting, text: m.toUpperCase() }));
  }

  /* ---------------------------------------------------------
     7. LOSS CONDITIONS
     --------------------------------------------------------- */

  function checkLoss(st, C) {
    if (confidence(st) < majority(st)) return { lost: true, reason: "confidence" };
    if (st.scalars.party_loyalty <= C.setup.thresholds.leadershipChallenge)
      return { lost: true, reason: "leadership" };
    if (st.scalars.thermal_margin <= 0) return { lost: true, reason: "cascade" };
    return { lost: false };
  }

  /* ---------------------------------------------------------
     8. UTIL / SAVE
     --------------------------------------------------------- */

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function save(st) { return JSON.stringify(st); }
  /* load takes content so a migration that needs it can run. Pre-roll saves
     have no constituency map to restore and must be reseeded from content. */
  function load(str, C) {
    const st = migrate(JSON.parse(str));
    if (C && (st.rollReseeded || !st.roll)) { seedRoll(st, C); delete st.rollReseeded; }
    return st;
  }

  /* Every chapter referenced by content, in order. */
  function chapters(C) {
    const s = new Set([1]);
    C.events.forEach(e => { if (e.chapter != null) s.add(e.chapter); });
    C.events.forEach(e => (e.choices || []).forEach(c =>
      [].concat(c.effects || []).forEach(f => { if (f.chapter != null) s.add(f.chapter); })));
    return [...s].sort((a, b) => a - b);
  }

  return {
    STATE_VERSION, newGame, migrate, save, load, chapters,
    confidence, majority, chamberTotal, popularTotal, functionalTotal,
    partyPopular, partyFunctional, partyTotal,
    division, matches, apply, eligible, nextEvent, choose, advance, tick, checkLoss,
    apportionment, tierCheck, DIVIDES_AT, STAGE_ORDER,
    seedRoll, syncRoll, partyDistrict, nationalShares, vacantSeats, seatsFor,
    vacateSeat, crossFloor, byElection, generalElection, shares, swungShares,
    divisorAllocate,
    assent, presidentDecides, referralRisk, reviewReturns,
    canMake, makeInstrument, prayAgainst, prayerForecast, revokeInstrument,
    instrumentsInForce, appoint, vacate,
    whippable, setWhip, whipCost, payWhips, clearWhips, divide, grantSlot, STAGE_ORDER,
    CONDITIONS, EFFECTS
  };
})();

if (typeof module !== "undefined") module.exports = Engine;
