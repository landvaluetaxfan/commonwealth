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

  const STATE_VERSION = 4;   // 3 added prices, 4 adds cabinet and instruments

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

    return st;
  }

  /* Save migration. Add a case per version bump; never delete one. */
  function migrate(st) {
    if (!st.version) st.version = 1;
    if (st.chapter == null) st.chapter = 1;   // saves from before chapters existed
    if (st.version < 4) {                     // cabinet and instruments
      st.cabinet = st.cabinet || {};
      st.instruments = st.instruments || {};
      if (st.signatures == null) st.signatures = 0;
      st.version = 4;
    }
    if (st.version < 3) {                     // scarcity prices
      st.prices = st.prices || { thermal:100, substrate:100, volume:100, transit:100 };
      st.priceHistory = st.priceHistory ||
        { thermal:[100], substrate:[100], volume:[100], transit:[100] };
      st.version = 3;
    }
    if (st.version < 2) {                     // capital, slots and whipping
      st.capital = st.capital || {};
      st.coalition.concat(st.confidenceSupply).forEach(p => {
        if (p !== st.playerParty && st.capital[p] == null) st.capital[p] = 0;
      });
      st.slots = st.slots || { total: 6, used: 0 };
      st.whips = st.whips || {};
      st.version = 2;
    }
    // while (st.version < STATE_VERSION) { switch (st.version) { case 1: ...; st.version = 2; break; } }
    return st;
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
    apply(st, C, result.carries ? b.onPass : b.onFail);
    st.bills[billId].stage = result.carries ? "passed" : "defeated";
    st.bills[billId].dead = true;
    st.log.unshift({ sitting: st.sitting,
      text: "Division: " + b.title + " — " + (result.carries ? "carried" : "defeated") +
            (paid.seats ? " (" + paid.seats + " whipped)" : "") });
    return { result: result, paid: paid };
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
    const i = STAGE_ORDER.indexOf(bs.stage);
    if (bs.stage === "blocked") { bs.stage = "second_reading"; }
    else if (i >= 0 && i < STAGE_ORDER.length - 1) { bs.stage = STAGE_ORDER[i + 1]; }
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
    const party = Object.values(st.parties).reduce((n, p) => n + (p.seats.district || 0), 0);
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
      Object.keys(v[pid]).forEach(t => st.parties[pid].seats[t] += v[pid][t]);
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
  function load(str) { return migrate(JSON.parse(str)); }

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
    canMake, makeInstrument, prayAgainst, prayerForecast, revokeInstrument,
    instrumentsInForce, appoint, vacate,
    whippable, setWhip, whipCost, payWhips, clearWhips, divide, grantSlot, STAGE_ORDER,
    CONDITIONS, EFFECTS
  };
})();

if (typeof module !== "undefined") module.exports = Engine;
