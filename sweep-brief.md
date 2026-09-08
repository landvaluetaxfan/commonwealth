# SWEEP BRIEF — INSTRUMENTS, CABINET, INDUCTION, CHAPTERS 1–2

**For execution in Claude Code against the repo. Companion to `bible.md` v3.**
Where this brief and the bible disagree on a number, the bible wins and this
brief is wrong — raise it rather than silently diverging.

This is one bounded phase. The closed list is: **instruments (bills + SIs),
the effect system, cabinet, induction, and chapters 1–2 content.** Nothing
else is in scope. Items deliberately excluded are listed in Part G.

---

## PART 0 — PRECONDITIONS

Before writing anything, read in this order and report what is actually there,
because this brief was written without sight of the code:

1. `js/engine.js` — current state object, tick loop, effect application
2. `content/bills.js` (or equivalent) — how bills are currently shaped
3. `content/events.js` — the current event schema and how choices resolve
4. `tools/lint.js` — how terms-taught tracking currently works
5. `test.js` — what chamber arithmetic is already asserted

**Report before implementing:** which of the five systems below already exist
in some form, and where this brief contradicts what the code actually does.
Do not begin until that reconciliation is done.

---

## PART A — INSTRUMENTS

Two kinds. The distinction is the point: a bill needs a majority and cannot be
undone; an instrument needs no majority and can be revoked. The player learns
that the fast tool is the deniable one and the slow tool is the permanent one.

### A.1 Bills

```
{
  id:            "hc_4_117",
  short_title:   "Divergence Threshold (Amendment)",
  number:        "HC 4/117",
  owner:         "commons_union",        // party id; drives capital on slots
  priority:      false,                  // partner flagged priority -> +3 not +2
  stage:         "committee",
  test:          "dual",                 // "simple" | "dual" | "charter"
  threshold:     121,                    // popular seats needed
  functional_threshold: 21,              // only if test !== "simple"
  effects_on_assent: [ ... ],            // effect objects, see Part B
  stances:       { party_id: "for" | "against" | "abstain" | {for: n} },
  referrable:    true                    // president may refer for review
}
```

**Stage ladder.** `drafting → first_reading → committee → report →
third_reading → upper_house → assent`. One order-paper slot advances one
stage. Divisions occur at `third_reading` only; earlier stages are procedural
and consume a slot without a vote. `upper_house` is a delay stage of 1–3
sittings (upper house powers are THIN in the bible — implement as pure delay
and leave a TODO).

**Division resolution.** Per §7.8, unchanged:

```
delivered(party) = seats * (0.75 + 0.25 * loyalty/100)
```

rounded down. An explicit `{for: n}` stance is a stated count, taken at face
value, not scaled. Whipping commits members before the division using the
alignment table in §7.8 — movable fraction and cost per seat by axis distance.
Own party costs `party_loyalty`, not capital. Parties outside the coalition
cannot be whipped at all.

**Dual majority.** A `dual` bill must carry separately among the 240 popular
and the 40 functional members. Both counts are shown side by side at all times
(§4.6.7). A `charter` test is dual plus a two-thirds popular requirement.

**Assent.** On carrying the final division, the bill goes to the President.
The President either signs — which fires the signature ceremony, see A.3 — or
refers it for constitutional review under §3.3. Referral is not a veto: it
delays by 4–8 sittings and returns a verdict. Osric Tenaya has privately
indicated a threshold bill carried on a contested dual majority would be
referred (§11.2); implement that as a condition on referral probability, not a
random roll.

Once assented, `effects_on_assent` apply and the bill is **irreversible**.
There is no repeal mechanic in this phase.

### A.2 Statutory instruments

```
{
  id:              "si_2287_44",
  title:           "Life Support Engineering (Licensing) Order 2287",
  author:          "minister_attestation",   // a cabinet post id — required
  procedure:       "negative",               // "negative" | "affirmative"
  effects:         [ ... ],
  revocable:       true,
  prayer_window:   6,                        // sittings, negative procedure only
  political_cost:  { ... }                   // capital/loyalty deltas on making
}
```

**Negative procedure** (the default, and the interesting one): the instrument
takes effect **immediately** on being made. It stands unless the House prays
against it within `prayer_window` sittings. A prayer is a motion needing a
simple popular majority — no functional test, no dual majority. So an
instrument is fast, unilateral, and vulnerable to a chamber that notices.

**Affirmative procedure**: requires a simple popular majority *before* taking
effect. Reserve for instruments touching life-support integrity.

**Revocation** is itself an instrument, so an SI can be undone by a successor —
which is exactly why it does not get the signature ceremony.

**The licensing board instrument is the spine of chapter one.** Board
composition under §4.6.4 is set by negative-procedure SI made by the Minister
for Attestation and the Registry. Widening the Life Support Engineering
electorate (4,100 licensed) or the Legal electorate (5,200) shifts functional
seats without legislation. This is the only available answer to the HC 4/117
functional trap and it must be discoverable, costly, and ugly:

- it moves functional seats over 2–4 sittings, not instantly
- it costs Guild Bench relations permanently (they will not divide with a
  government that has done this — see §11.5)
- it hands Halloran a weapon: +signatures toward the leadership ballot
- it is prayable, so the opposition gets one chance to kill it in the open

### A.3 The signature ceremony

Per §12.8, reserve it. Fires **only** on presidential assent to a bill, and
only for bills with `test !== "simple"` — so roughly six to eight times a
playthrough. A single `stroke-dashoffset` animation over the in-world document
in the Papers register, with the file number and routing stamps visible.

Statutory instruments get a **made stamp** instead: a dated, numbered block,
no animation. The visual asymmetry is the teaching device — the player learns
which acts are permanent by which ones are ceremonious.

---

## PART B — THE EFFECT SYSTEM

**Decisions must move variables. A choice with no declared effect is a bug.**

### B.1 Effect vocabulary

Declarative objects, applied in list order, no scripting in content files:

```
{ meter: "public_standing", delta: -4 }
{ meter: "party_loyalty",   delta: -6 }
{ capital: { public_substrate_association: +2 } }
{ loyalty: { root_and_vessel: -5 } }
{ current: { halloran_group: -8 } }        // internal faction loyalty
{ price:  { substrate: +6 } }              // index points, pre-drift
{ station: { ashfield_cans: { suspended: +900 } } }
{ flag:   { board_packed: true } }
{ bill:   { hc_4_117: "committee" } }      // force a stage
{ si:     "si_2287_44" }                   // make an instrument
{ signatures: +2 }                          // Halloran's ballot counter
{ chapter: 2 }
```

### B.2 Condition vocabulary

Mirror image, used for event gating and choice availability:

```
{ flag: "board_packed" }
{ price: { substrate: { gt: 118 } } }
{ meter: { thermal_margin: { lt: 30 } } }
{ chapter: 2 }
{ bill_stage: { hc_4_117: "assented" } }
{ not: { ... } }
{ any: [ ... ] }   { all: [ ... ] }
```

### B.3 The consequence chain

§7.9, unchanged and now actually wired:

```
decision  ->  price  ->  station conditions  ->  event
```

Prices drift one fifth per sitting toward the policy-implied value. Stations
answer to the substrate price weighted by exposure `0.75 − closure`, so poor
habitats feel it first. A station that cannot pay sheds people, and the shed
order says which. Worked case already in canon: Substrate (Public Stake)
passes, Ashfield has ~1,400 fewer suspended residents 26 sittings later.
Inaction drifts the index upward and fires the crisis at ~sitting 19.

### B.4 New lint rule — dead choices

Add to `tools/lint.js`: **fail** on any choice with an empty or absent effects
list, and **warn** on any choice whose only effect is a flag no condition
reads. Also warn on any `price` effect with no event gated on that index, and
any event gated on a price nothing moves — the §7.9 design rule, enforced.

---

## PART C — CABINET AS DATA

Small object, high leverage. Unlocks a dead presidential reserve power and
gives instruments an author.

```
posts: {
  life_support:    { holder: "iren_vellan",  party: "commons_union" },
  substrate_thermal: { holder: null, party: null },
  consumables_agriculture: { ... },
  volume_housing: { ... },
  transit_orbital: { ... },
  attestation_registry: { ... },
  persons_continuity: { ... },
  external_relations: { ... },
  treasury:        { ... }        // reports to the PM, sits apart (§3.9)
}
```

**Appointment.** Vacancies arise from resignation or dismissal. The player
nominates; the President may refuse (§3.3, power 4), costing a second choice
and coalition capital. Portfolio allocation is a coalition currency in its own
right — giving Persons and Continuity to Root & Vessel is worth capital.

**Resignation.** A minister whose party's loyalty falls below a threshold, or
whose portfolio is directly contradicted by an instrument or bill, resigns.
This is the chapter-two-scale crisis and the cheap precursor to the leadership
challenge. Iren Vellan resigning from Life Support is a governmental event, not
a personnel note.

**Authorship.** Every SI names a post. If the post is vacant, the instrument
cannot be made. If the holder's party opposes the instrument's effects, making
it costs that party loyalty and may trigger resignation. This is the interlock
that justifies building cabinet now: the appointment fight and the board fight
become the same fight.

**Summons.** Life Support is the only Ministry whose Minister may be summoned
*by* the engineering authority (§3.9). Implement as an event hook available
from chapter two.

---

## PART D — INDUCTION

**Not a tutorial overlay. An in-world induction pack plus inline gloss.**
No yellow boxes, no arrows, no modal wizard — those read as consumer software
and break §12.3.

### D.1 First-use gloss

Every glossary term gains `taught_in: <chapter|null>` and `gloss: <one line>`.
On a term's first appearance in played text, it renders underlined with a
dotted rule; clicking opens the Concordance article inline without leaving the
screen. After first use it renders plain. Track seen terms in save state.

`tools/lint.js` already tracks terms-used-before-taught — extend it to fail
when an event uses a term with no Concordance article, and to report the
per-chapter concept load against the §2.6 budget (one concept cluster per
event).

### D.2 The induction pack

A document in **Papers**, styled as the Cabinet Office briefing folder handed
to an incoming Prime Minister. Sections, each written in-world:

- *Reading the Order Paper* — slots, stages, ownership, priority
- *Divisions and the Second Majority* — the dual test, the functional tier
- *The Indices* — what thermal quota, substrate rent, volume and transit are,
  and why they are legislative outputs rather than market prices
- *Coalition Accounts* — the capital ledger, why nothing decays
- *Instruments* — the distinction between a bill and an order

Written in Charnock's register or the state printing office's, never the
game's. It must be readable as a document by someone who is not being taught
anything, because half its job is worldbuilding.

### D.3 Contextual referral

When a screen first shows a number the player has not met, a single-line
status-bar note names the relevant induction-pack section. One line, in chrome,
dismissible, never modal.

---

## PART E — CHAPTERS ONE AND TWO

### E.1 Chapter one — the functional trap

**Opens:** 11 April 2287, session 4, week 112. HC 4/117 in committee. Popular
forecast 128 of 240 (needs 121, carries). Functional forecast 12 of 40 (needs
21, fails). Coalition at 141 exactly.

**Teaches:** order-paper slots, divisions, the second majority, the capital
ledger, the whip table, and the fact that a comfortable majority is not enough.

**The problem:** the bill cannot pass on the arithmetic as it stands. All
twelve functional coalition members already vote for it; there is no headroom.
The Guild Bench will not divide with the government on any measure touching
licensure and money will not move them.

**The routes out**, all of which must be reachable and none of which is clean:

1. **Pack a licensing board by SI.** Fast, deniable, moves functional seats
   over 2–4 sittings. Costs the Guild Bench permanently, adds Halloran
   signatures, and is prayable.
2. **Amend the bill upward.** Move the threshold from 40 toward 80–100 hours
   and some functional members become movable. Costs Public Substrate
   Association loyalty severely — it is their bill in spirit — and fork-labour
   remains cheap, which is a §10.5 outcome nobody in the chamber will name.
3. **Trade order-paper time.** Give slots to Root & Vessel's Continuity of
   Person (Registration) and Public Substrate's Uprating, buy loyalty, and
   whip harder. Slow, expensive, may not close the gap at all.
4. **Let it fail.** Survivable. Costs the platform commitment, hands Halloran
   a different weapon, and opens chapter two from a weaker position.

**Advances when:** the bill assents, fails a division, or is withdrawn.
`{chapter: 2}` on the resolving choice — never on a timer (§1.7).

**Content target:** 14–18 events plus 3 prologue events.

### E.2 Chapter two — the price of that

**Opens:** with the consequence. Prices have drifted; substrate rent is above
110 if nothing was done. Ashfield Cans (closure 0.31, exposure 0.44, 11,400
suspended) is the worked case and the chapter's centre of gravity.

**Teaches:** the consequence chain end to end — that a decision three chapters
of prose ago became an index, became a station condition, became a person
being shed. Also cabinet, resignation, and the President as an actor rather
than a portrait.

**The spine:** Shed Order (Civilian Oversight) is currently blocked at 134
popular and 9 functional on a dual test — the same trap, now with a body count
attached, and the player already knows what the ugly solution costs because
they either used it or refused it. If they packed a board in chapter one, the
Guild Bench is unreachable and route 1 is closed. **The chapter is a different
game depending on chapter one's answer, using the same content.**

**Also live:** Substrate (Public Stake) drafting, which takes the public share
0.35 → 0.6 and knocks 26 points off the substrate index. The Halloran group's
signature counter becomes visible. At least one ministerial resignation is
reachable.

**Advances when:** the shed-order question resolves, either by instrument, by
bill, or by a crisis that settles it without the player.

**Content target:** 16–20 events plus 3 prologue events.

### E.3 Terminal state — DECIDE BEFORE WRITING

The bible defines how chapters advance (§1.7) but not how many exist or where
the campaign stops. Fix this before content volume grows. Proposal, to be
confirmed: **five chapters, ending at the general election**, with the
election as chapter five rather than an epilogue. Record the answer in the
bible under Part I.

---

## PART F — ACCEPTANCE

The existing six checks must all pass, plus:

| check | assertion |
|---|---|
| `test.js` | division arithmetic matches §7.8 for every seated party at loyalty 0, 50, 100 |
| `test.js` | HC 4/117 fails the functional test on opening state, and passes it after a board-packing SI has been in force 4 sittings |
| `test.js` | an SI made by a vacant post is rejected |
| `test.js` | a prayed-against SI is revoked and its effects reversed |
| `lint.js` | no choice has an empty effects list |
| `lint.js` | no event uses a term with no Concordance article |
| `cxcheck.js` | every induction-pack section is linked from at least one first-use gloss |
| `roundtrip.js` | instruments, cabinet, and chapter state survive serialise → reload |

Two new smoke tests: a 40-sitting run that packs a board, and one that does
not. Both must reach chapter two without an unhandled state.

---

## PART G — EXPLICITLY OUT OF SCOPE

Not in this phase, regardless of how naturally they arise:

- **Elections and seat allocation.** Chapter five. Large, and it needs its own
  phase with the district-tier method (SNTV, deferred) settled first.
- **The leadership challenge.** Chapter three or four. Signatures accumulate
  now; the ballot does not fire yet.
- **Lobbying.** Benches outside the coalition remain unwhippable. Instruments
  are the chapter-one answer instead, deliberately.
- **Confidence votes and life-support cascade.** The other two loss conditions.
- **Upper house powers.** Delay stage only; still THIN in the bible.
- **Repeal.** Bills are irreversible in this phase.
- **Foreign affairs.** Deferred until chapter one has ~25 events.

Anything encountered that belongs in a later phase goes into a new
`engine_wishlist` section at the foot of `bible.md`, not into this build.

---

## PART H — SAVE MIGRATION

This phase changes the state object substantially. Before any of the above:

- add `state.version` if absent
- write `migrate(state)` with a case per version bump, even though there is
  currently one version
- `roundtrip.js` must load a pre-sweep save and produce a valid post-sweep one

This is cheap now and is the named project-killer at event 150 (§15.3.2).
