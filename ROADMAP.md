# ROADMAP

What is built, what is missing, and the order to build it in.

Each phase names which agent should do it and what "done" means. The structure
follows `sweep-brief.md`, which worked: a bounded scope, an explicit exclusion
list, and acceptance criteria that are checks rather than opinions.

**The rule that governs all of it:** `js/engine.js` names no event, party or
station. Engine work is a phase of its own; content work never touches it.

---

## THE SPLIT

| | Claude Code | opencode |
|---|---|---|
| **does** | engine, schema, UI, anything in `js/` | content in `content/`, drafts, prose |
| **because** | a wrong edit is silent and expensive | six checks catch a wrong edit immediately |
| **hand-off** | writes the spec | executes it |

Claude Code should produce a spec before opencode writes content: which file,
which schema verbs, which conditions, which checks. A request is not a spec.

Neither may invent a station, character or glossary term (§2.7). If a draft
references something that does not exist, the correct behaviour is to stop and
report it.

---

## BUILT

- Parallel voting across three tiers, with the dual-majority trap
- 33 stations, 56 constituencies returning 140 members, apportionment derived
- 11 functional sectors including the residual super-seat
- Five numeric axes: economic, authority, personhood, sovereignty, trade
- Coalition capital as a permanent signed per-partner ledger
- Order-paper slots as the currency that generates it
- Whipping bounded by axis distance, priced against the ledger
- Scarcity prices and the consequence chain: decision → price → station → event
- The productive economy: participation, trade balance, private share
- Chapters, with authored prologues
- Statutory instruments: negative and affirmative procedure, prayer windows,
  revocation, cabinet authorship
- Cabinet as data, with vacancy blocking instruments
- Presidential assent, deterministic referral, constitutional review
- The Papers register, signature ceremony, made stamps, distribution lists
- The Concordance, generated from content
- An editor with safe rename, archetypes, image processing, coverage analysis
- Six checks and CI

## MISSING

Ordered by what hurts most.

| | why it matters |
|---|---|
| Leadership challenge | loss condition 2. Signatures accumulate and nothing fires. |
| Confidence votes | loss condition 1. No mechanic at all. |
| Elections | loss condition 3, and the marquee UI moment. |
| Lobbying | non-coalition benches cannot be moved by any means except instruments. |
| Coalition negotiation | no partner can threaten to walk. |
| Dissolution | the President can refuse it; you cannot request it. |
| Induction pack | sweep-brief Part D, never built. |
| Foreign affairs | zero, and it now has an economic hook. |
| Opposition mode | `in_government` is not in the state object. |
| Terminal state | undecided. Blocks every content decision downstream. |

---

## PHASE 0 — Decide the terminal state

**Before anything else, and it takes ten minutes.**

How many chapters, and does the campaign end *at* the general election or after
it. `sweep-brief.md` Part E.3 proposes five chapters ending at the election.

Every event written before this is decided is written without knowing what it
builds toward. Record the answer in `bible.md` Part I and delete the item from
Part XVI.

**Agent:** neither. This is a design decision.

---

## PHASE 1 — The leadership challenge

**Claude Code.** Small, and it is the loss condition that makes your own caucus
an antagonist rather than a resource.

The signatures counter already exists and already moves — packing two boards
puts you at five of nine. Nothing reads it.

Build:
- A ballot fires when `signatures >= 9`
- The challenger is `halloran`; her support is the Halloran group plus any
  current whose loyalty is below a threshold, weighted by size
- The player spends `party_loyalty` and capital to move currents before the vote
- Losing ends the run under §3.5 condition 2
- Winning costs the currents that backed the challenger permanently

Acceptance:
- `test.js` asserts a ballot cannot fire below 9 signatures
- `test.js` asserts a ballot with every current at full loyalty is survivable,
  and one with the maintenance bloc below 20 is not
- The Record shows the ballot as an event, not a modal

---

## PHASE 2 — Confidence and coalition collapse

**Claude Code**, then **opencode** for the content.

Confidence is derived and never tested. A partner cannot leave.

Build:
- A confidence motion: simple popular majority, opposition-tabled, fires on
  conditions rather than on a timer
- Coalition partners with loyalty below a red line withdraw, which recomputes
  confidence and may end the run
- `red_lines` per party in `content/parties.js`: a law value or flag that, if
  crossed, triggers withdrawal
- The player may renegotiate: offer a Ministry, a slot, or capital

Acceptance:
- Root & Vessel withdraw if the divergence threshold falls below 60 hours
  while their loyalty is under 25
- Losing a confidence motion ends the run
- `roundtrip.js` still passes with red lines in party data

---

## PHASE 3 — Lobbying

**Claude Code.** Currently the Guild Bench is unreachable except by instruments,
which makes the chapter-one trap feel like a puzzle with one solution.

Lobbying is whipping for benches you do not control, with a different currency
and worse odds. The bible flags it as needing its own currency; the obvious
candidate is order-paper time, since a promise of a slot next session is exactly
what an opposition bench wants.

Build:
- `lobby(party, bill)` moving a small fraction of an opposition bench
- Cost paid in future slots, creating a debt against next session
- Refused outright where axis distance exceeds a threshold — some benches are
  not for sale
- Visible in the whip panel as a separate, more expensive column

---

## PHASE 4 — Chapters three to five

**opencode, from drafts.** The largest phase and the actual project.

The coverage panel currently reports a skeleton. Twelve of thirty-three stations
appear in no event. Each already carries a `dependency` and a `grievance`, which
is an event brief written in advance.

Work in blocks:
1. One event per cold station, keyed off its own grievance
2. Thirty events gated on `scalarAbove` — the coverage panel exists to catch
   content clustering on crisis, and it will
3. Chapter three, four and five skeletons, then prose

Use `AUTHORING_FORMAT.md`. Run `npm run check` after every block.

Acceptance:
- Coverage reports no chapter below eight events
- No cold stations
- `lint.js` clean: one concept cluster per event

---

## PHASE 5 — Elections

**Claude Code.** Large enough for its own phase, and it needs Phase 0 settled
and the electoral system decided first.

The open question: **SNTV or 140 single-member districts.** Magnitudes currently
run 1 to 4 and track electorate, which makes magnitude bookkeeping rather than
political geography. Two coherent answers:

- **SNTV.** Each voter picks one candidate, top *m* win. Japan pre-1994, which
  matters because Japan is already the parallel-voting model. Produces the
  pathology worth having: a party must nominate exactly the right number and
  split its vote evenly, so co-partisans in the same seat are rivals — which
  gives the currents mechanic teeth.
- **140 single-member seats.** Cleanest, most disproportionate, and 140
  constituencies to name.

Decide, record it in the bible, then build. Election night is the marquee UI
moment (§12.5) and parallel voting hands you the three-act pacing for free.

---

## PHASE 6 — Induction

**Claude Code** for the mechanism, **opencode** for the pack.

`sweep-brief.md` Part D, never built. First-use gloss exists; the induction pack
does not.

An in-world Cabinet Office briefing folder in Papers, written in Charnock's
register: reading the order paper, divisions and the second majority, the
indices, coalition accounts, instruments. No modal, no arrows, no yellow boxes.

---

## PHASE 7 — Foreign affairs

**Both.** Deferred until chapter one has ~25 events (§15.3.6), and it now has an
economic hook it lacked: compute exports, the trade balance, the anchors.

The organising insight is in the bible: **light-lag as the axis**, the way the
orbital chart's is altitude. A map ordered by delay is a map of how alien each
relationship is. Earth states hold the anchors; Mars and the belt are far enough
that you exchange positions rather than negotiate; the metanationals are
quasi-sovereign and belong on the same map.

---

## PHASE 8 — Opposition mode

**Claude Code.** §3.6 warns that retrofitting `in_government` is painful, and it
is still not in the state object. Every phase that passes makes this worse.

Cheapest version now: add the flag, gate existing actions on it, and write the
opposition prologue later. That costs an hour and removes the retrofit risk.

---

## NOT IN SCOPE

- Real-time persistence (§1.6). Compatible with everything above, assumed by
  none of it. The deciding question is whether push notifications are required.
- Multiplayer, in any form.
- A second campaign. Finish one.

---

## THE THING THAT MATTERS MORE THAN ANY PHASE

The coverage panel says *skeleton*. It will say *one chapter* at about twelve
more events. **That is the point to stop building and hand it to a playtester** —
the visual-novel one first, because legibility is the named risk and they are the
ones who will tell you whether the prologue works.

Run a session every twenty events rather than when it feels ready. It will not
feel ready.
