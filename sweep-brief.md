# SWEEP BRIEF — THE SEAT SYSTEM, AND WHAT IS STILL MISSING

**For execution against the repo. Companion to `bible.md` v4.**
Where this brief and the bible disagree on a number, the bible wins and this
brief is wrong — raise it rather than silently diverging.

This supersedes the instruments/cabinet/induction brief, which is closed out in
Part A. Read Part 0 first: it is the honest state of the build, including the
parts of the last brief that were never delivered.

---

## PART 0 — WHERE THE BUILD ACTUALLY IS

| | |
|---|---|
| Engine | Substantially complete for governing. Divisions with dual majority, whipping against a per-partner capital ledger, statutory instruments with prayer windows and reversal, cabinet vacancies gating instruments, scarcity prices, order-paper slots, save migration, and now the district roll and elections. |
| Content | **12 events.** Chapter one is playable, chapter two is four events. This is the project, and it is barely begun. |
| Canon | ~2,400 lines across `bible.md` and `textbook.md`. |

**The ratio is the risk.** §15.3.6 names it: a magnificent setting document
attached to nothing. Every engine system added without content widens that gap.
Nothing in Part C should be built as a block before Part D is under way.

`js/coverage.js` reports what to write next from the content itself. Run it
rather than guessing. As of this brief: chapter two is thin, **31 of 33 stations
appear in no event**, and six of eleven parties never appear — including the
Commons Union, which the player leads.

---

## PART A — WHAT THE LAST SWEEP CLOSED

Delivered and asserted by the checks:

- **Bills and statutory instruments**, with the made/in-force/prayed/revoked
  lifecycle, prayer windows, and reversal of effects on revocation.
- **The effect and condition vocabulary**, now 23 effect verbs and 25
  conditions. Approaching the twenty-verb line §15.5 warns about; the next
  addition should displace one rather than extend the list.
- **Cabinet as data.** A post with no holder cannot make an instrument, which
  is what the President's appointment-refusal power bites on. Left §16 in
  bible v4.
- **The signature ceremony**, reserved by §12.8 for acts that cannot be undone.
- **Chapters one and two** exist as a mechanism; chapter two lacks content.

**Not delivered, and still open: Part D, induction.** There are zero references
to an induction pack anywhere in `js/` or `content/`. The first-use gloss *is*
built (`UI.annotate`, with the Concordance behind it), but the pack itself and
contextual referral were never written. This matters more now than it did then:
the concept load is unchanged and the player still meets fork, instance,
divergence threshold, substrate, closure, thermal margin, dual majority and
licensure inside five events. **Carry Part D forward into this phase.**

---

## PART B — WHAT JUST LANDED: THE SEAT SYSTEM

All 140 district seats are allocated across the 56 constituencies as
`held:{party:seats}` in `content/constituencies.js`, reproducing every authored
party total exactly. The Georgists and Uplift Caucus hold no district seat,
which is what §4.3 means by a pure-list party.

### B.1 The roll is the only source of truth

`st.roll` holds every district seat. Every district total is **derived** from
it; `st.parties[id].seats.district` is a projection refreshed by `syncRoll()`,
and `test.js` reconciles the two in both directions. Storing them independently
is the `apportionment_ratio` mistake in `CLAUDE.md`. A `seats` effect that tries
to write district seats is refused with a log line rather than silently undone.

### B.2 Four ways a seat moves, and no others

| verb | effect | what it costs |
|---|---|---|
| `vacateSeat` | death, resignation, disqualification | **A vacancy is a vote you do not have.** The chamber stays 280 and the majority stays 141, so vacating one Commons Union seat takes confidence from 141 to 140. |
| `byElection` | fills the vacancy on current opinion | The seat is not returned to whoever lost it. |
| `crossFloor` | a member changes party between elections | Nothing structural; everything politically. |
| `generalElection` | the whole chamber returned at once | See B.3. |

Content reaches all four through `cross`, `vacate_seat`, `byelection` and
`election`, with schema entries so the editor can author them.

### B.3 Elections

Deterministic per §1.5: the same state elects the same chamber twice. Parallel
and non-compensatory per §4.1 — the list runs separately and does not correct
district results. The divisor is a **law variable, not a constant**, because
§4.10 makes the choice of divisor a bill.

Two things canon corrected during the build, recorded so they are not undone:

1. **The list is a second ballot, not a projection of the first.** Deriving the
   list vote from constituency strength cost the Public Substrate Association
   16 seats on the first run — the exact opposite of §4.3, which makes a
   rootless nationally-strong party explicitly viable. National standing now
   carries the list, with a quarter weight on district strength standing in for
   ticket-splitting (§4.3: 21.4%), which is also what lets a district-rooted
   party with no list bench win one.
2. **The threshold has two carve-outs, not one.** §4.8 exempts a party that
   won a district seat *and* one representing a single station or single
   legal-person category. The second is declared in content (`carve_out`),
   because which parties qualify is a political question and not the engine's.
   Uplift survives on it; the Georgists, with no roots and no category, are
   eliminated.

### B.4 A check that was not checking

`tools/renametest.js` built its model without `CONSTITUENCIES`, and `refs.js`
knew about `held` only on functional constituencies. Renaming a party left dead
ids in the district roll and its seats vanished from every total, silently,
while the test reported "behaviour-preserving". Both fixed; references rewritten
per run went 217 → 320. **Whenever a content file gains a field that holds an
id, check `refs.js` knows about it and that `renametest`'s model contains it.**

---

## PART C — THE GAP LIST

Ordered by value per unit of work, not by size. Do not build these as a block:
interleave with Part D.

### C.1 Amendments — FIRST, and the cheapest large win

`st.bills[id].amendments = []` is initialised and **never written to**.
`committee` is in `STAGE_ORDER` and does nothing a stage counter does not.

So a bill has two fates: advance unchanged, or die. There is no way to *change
a bill to buy a vote* — which is the central currency of real legislative
bargaining and the obvious partner to the whip system that already exists.

Build: an amendment is an object with an axis shift, a capital price, and a set
of parties whose stance it moves. Committee stage is where they attach.
Conceding a clause should be able to carry the functional bench and lose you
the Substrate Left in the same division.

### C.2 The leadership ballot — the plumbing is already there, unused

§3.5 calls this the best loss condition: it makes your own caucus the
antagonist. It is currently implemented as `party_loyalty <= 15` — a meter,
not a mechanic.

Everything else exists already: `st.signatures`, the `signaturesAtLeast`
condition, and the Halloran events built around nine more names. Nobody ever
holds a ballot. Build the ballot: a threshold of signatures triggers it, the
caucus divides on loyalty and on what you have paid each faction, and losing it
ends the game.

**Connect it to the roll.** §4.5 says revenants owe their seat to the party and
whip perfectly — "a caucus full of them is loyal and brittle, a fact for a PM to
discover at the wrong moment." That is a leadership-ballot mechanic waiting for
the seat system that now exists.

### C.3 Scandal, and the thriller spine

Grep for "scandal" across `js/` and `content/`: **zero hits in both.** Part XIII
is LOCKED canon and entirely unbuilt. There is no information asymmetry
anywhere in the state object — no secrets, no dirt, no model of who knows what.

This is currently a competent governance simulator. The thriller half does not
exist.

The state-object decision — what knowledge is and who holds it — is far cheaper
to make now than at event 150. §12.8 already points at the shape: the
distribution list is the artefact, and the minutes already render a cc line with
a struck-through recipient. It is decorative; make it load-bearing.

### C.4 Wiring the election in

The machinery works; **nothing calls it.** Missing: a dissolution trigger,
presidential dissolution and government formation (two of the four reserve
powers in §3.3, against referral and appointments which are built), a campaign,
and election night (§12.5).

Revenants (§4.5) need district races to record **margins** so best-loser
resurrection can rank them. Small addition, but only once there is a campaign
to hang it on.

The user's intent: **one general election, mid-game.** Treat it as a chapter
transition with content around it, not a recurring cycle.

### C.5 Smaller, and genuinely optional

- **The upper house cannot say no.** `upper_house` is a stage with no actor and
  no rejection path. §16: powers still undefined.
- **Opposition mode.** `inGovernment` is in the state object from day one as
  §3.6 instructed; there is no opposition action economy behind it.
- **Lobbying.** §16: impossible by design, needs its own currency.
- **Attestation markers on the wire** (§12.9), so manufactured consensus is
  visible rather than ambient.
- **Five scalars, not six or seven.** §1.5 allows more. Nothing models
  information or electoral standing — either would serve C.3 and C.4.

---

## PART D — CONTENT, AND IT IS THE PROJECT

opencode's lane, per `AGENTS.md`. Engine work above is worthless without it.

1. **Chapter two to eight events.** It has four.
2. **One event per cold station**, keyed off its own grievance. Thirty-one
   stations have a name, a population, a dependency and a grievance already
   written and appear nowhere. This is transcription, not invention, and it is
   the highest-yield content work available.
3. **Give the Commons Union a moment.** The player's own party never appears.
4. **Per-constituency holders are now visible in the UI** and read
   "unrecorded" for district seats because only `held` counts exist, not named
   members. If a constituency should have a named member, the character roster
   is the place — do not invent people in passing (§2.7).
5. **Carry Part D of the previous brief forward**: the induction pack and
   contextual referral, never built. See Part A.

---

## PART E — ACCEPTANCE

The eight checks must all pass. Added by this phase and not to be regressed:

| check | assertion |
|---|---|
| `test.js` | every constituency is fully returned; the roll reproduces every authored district total |
| `test.js` | a vacancy costs a vote and still counts toward the tier |
| `test.js` | derived and cached district counts agree after every mutation |
| `test.js` | a `seats` effect cannot write district seats |
| `test.js` | the same state elects the same chamber twice |
| `test.js` | a pure-list party survives an election (§4.3) |
| `test.js` | the carve-out saves a sub-threshold party; a party without one is barred (§4.8) |
| `renametest.js` | the model contains `constituencies`; renaming a party rewrites the roll |
| `uitest.js` | the lifecycle track mirrors `STAGE_ORDER`; no markup leaks into prose |

For C.1–C.4, each needs a smoke test that reaches the end of chapter two
without an unhandled state, as the instruments phase did.

---

## PART F — EXPLICITLY OUT OF SCOPE

- **Repeal.** Acts remain irreversible; instruments are the reversible thing.
- **Foreign affairs.** §16 defers it until chapter one has ~25 events. It has 8.
- **Redistricting** (§4.15), **franchise weighting** (§4.13), **compulsory
  voting** (§4.14). All still OPEN in the bible; none should be settled by
  implementation.
- **Recurring elections.** One, mid-game.

Anything encountered that belongs to a later phase goes to `engine_wishlist` at
the foot of `bible.md`, not into this build.

---

## PART G — SAVE MIGRATION

`STATE_VERSION` is **5**. The roll arrived in 5; a pre-roll save has no
constituency map to recover, so it is reseeded from content on load, which is
the only honest reconstruction available. `Engine.load` now takes content.

The guards are **ascending**, one block per bump, each stamping only its own
version. They were once descending, which meant the first block stamped every
old save current and the rest became unreachable — a v1 save loaded looking
valid, without prices, capital, slots or whips, and threw on the first division.
`test.js` now walks every version forward and asserts the result is *playable*,
not merely well-shaped. Bump the constant and add a block; never reorder them.

---

## PART H — OPEN DECISIONS THIS PHASE RAISED

Both need a human answer; neither should be settled by whoever writes the code.

1. **The within-district method.** The previous brief named **SNTV** as the
   deferred district-tier method. SNTV appears nowhere in the bible — it was a
   brief-level assumption, not canon. The implementation uses highest-averages
   (D'Hondt by default, Sainte-Laguë selectable) per constituency, sourced from
   §4.10, which settles the divisor question for apportionment and list
   allocation but is silent on what happens *inside* a multi-member district.

   These play very differently. SNTV is factional and chaotic — it punishes
   parties that misjudge how many candidates to run, and it is what Japan used
   before 1994, which is the same source §4.5 draws `sekihairitsu` from.
   Highest-averages is orderly and proportional. **The current build is not
   canon-breaking, but it is a choice, and it should be an explicit one.**

2. **Whether the functional tier is ever elected.** `generalElection` returns
   the district and list tiers only. Functional seats are returned by licence
   and corporate franchise on their own cycles, which is defensible and matches
   §4.6 — but it means a general election cannot change the bench that holds
   the dual-majority veto. That may be exactly right, and it may be the single
   most important political fact in the game. It should be deliberate.
