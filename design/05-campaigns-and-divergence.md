# 05 — CAMPAIGNS AND DIVERGENCE

*How strict the storyline is, how many paths there are, and what depth of
simulation would actually buy more of them.*

This document exists because "multiple campaigns" means three different things
that cost wildly different amounts, and conflating them is how a project of this
shape dies — either by authoring a branching tree it cannot finish, or by adding
simulation depth that buys texture rather than divergence.

---

## 1. Three things the phrase means

| | what it is | engine cost | content cost |
|---|---|---|---|
| **A. Replay variance** | the same campaign, different texture: crises in a different order, at different pressures | **near zero** — `06` already specifies it | zero |
| **B. Multiple campaigns** | different starts: another party, another opening crisis, opposition instead of government | **small** — mostly already built | **a chapter each** |
| **C. Divergent settlements** | one campaign, several stable constitutional destinations | **small** — see §4 | one ending each, plus refraction |

They are usually asked for as one thing. They should be built as three, in that
order, and only A and C should be *finished* before the first campaign ships.

## 2. A — replay variance is already paid for

The seeded PRNG in `06`, threshold events off the existing `when` vocabulary, and
the bloc derivation in `04` together mean two playthroughs of the same campaign
diverge in which crises arrive, when, and against which aggrieved interests.
Nothing further is needed and nothing further should be added for this purpose.

**This is the trap in "go slightly deeper on simulation".** Depth reliably buys
*texture* — more varied numbers, more varied timing — and it is easy to mistake
texture for divergence because it feels different every time. It is still the
same game. Depth buys divergence only under the condition in §4, and most
proposals to deepen the model do not meet it.

## 3. B — multiple campaigns are nearly free in the engine and expensive in prose

The engine is already most of the way there and this is worth knowing before
anyone plans work for it:

- `playerParty` is state, not a constant.
- `inGovernment` has been in the state object since day one, exactly as §3.6
  instructed, *specifically* so opposition could be retrofitted without pain.
- All eleven parties, thirty stations and the full roll are content.
- Chapters already exist (§1.7) and `nextPrologue()` selects an authored opening
  sequence per chapter.

So a campaign is: a `content/setup.js` variant naming a different party,
coalition and opening state, plus a chapter-one event set. **The engine changes
required are: setup becomes a list rather than a singleton, and the menu picks
one.** That is an afternoon.

The content is a chapter each, and chapter one took the project its whole life so
far. `sweep-brief.md` Part D is unambiguous that content is the binding
constraint — twelve events, thirty-one of thirty-three stations appearing in
none.

**Therefore: make the engine campaign-shaped now, because it is cheap now and
expensive after `content/setup.js` has been assumed singular in fifty places.
Author the second campaign after the first is finished, not before.** The most
likely second is the opposition campaign §3.6 already sketches, because it reuses
the same world and inverts the verbs.

## 4. C — what depth actually buys divergence

Here is the condition, and it is the useful part of this document.

> **Divergence is bounded by what the state can represent.** Two playthroughs
> differ meaningfully only where they differ in state that later content reads.
> Everything else is texture.

So the question is not "how deep is the simulation" but "how much of the state is
player-mutable and consequential". Ranked by how much divergence each buys per
unit of work:

**1. The electorate — the deepest lever in the game, and it is data.**
§4.7 already separates apportionment population from voting population. Who votes
is not simulated; it is the roll plus the franchise rules in `law`. Change those
and *the same authored event produces different politics*, because the arithmetic
under it differs. Part XVI has three of these open right now — franchise
weighting (§4.13), redistricting (§4.15), and where emulations vote — and each is
a genuine constitutional fork that costs no simulation at all.

**2. The law object.** Six-plus values, already player-mutable, already read by
conditions. A playthrough that ends with `divergence_threshold_hours` at 40 and
one that ends at 168 are different countries.

**3. The composition of the chamber.** The roll is authoritative and four verbs
move seats. A chamber built by defections and by-elections is different from one
built by an election.

**4. Bloc position** (`04`), because it is derived from 1–3 and so inherits their
divergence for free.

**Not on this list, deliberately:** a deeper price model, a labour-market
simulation, a supply chain. Each would make the numbers richer and none would let
content say anything it cannot say now. §7.6 forbids them anyway; the point here
is that even if it did not, they would be the wrong purchase.

## 5. The recommended shape

**A fixed spine, a systemic middle, a divergent settlement.**

| | strictness | why |
|---|---|---|
| **Chapter one** | fully authored, fixed order | §2.6: explanation cost is the real budget. The teaching chapter cannot be shuffled — one concept cluster at a time, in an order somebody chose. `nextPrologue()` already enforces this. |
| **Chapters two to N** | systemic | crises arrive from thresholds, the seed and bloc pressure. Which you meet depends on how you have governed. Authored events, unauthored order. |
| **The election** | a chapter transition | `sweep-brief.md` C.4 records the intent: **one general election, mid-game**, not a recurring cycle. It is where the state you have built becomes the chamber you must govern with. |
| **The settlement** | divergent, few, and stable | see below |

### 5.1 The settlements

**Four, not six.** Each is a *reachable state of the existing state object* — a
law configuration plus a flag set — not an authored ending with its own branch.

| settlement | is, in state | reached by |
|---|---|---|
| **Restriction** | threshold high, franchise biological | conceding to the functional bench and the maintenance benches |
| **Substrate neutrality** | threshold low, franchise substrate-blind | carrying the dual majority, which requires `07`'s lobbying |
| **Graduated personhood** | a tribunal in `law`, threshold administratively set | the technocratic compromise; probably the most interesting and the most horrifying |
| **Federal fudge** | stations set their own rule | preserving the union at the cost of internal migration |

Closure and dissolution are **failure modes, not settlements** — they are what
happens when none of the four is reached, and they attach to the existing loss
conditions (§3.5) rather than needing their own arc.

The ending is *written* once per settlement. The path to it is not written at
all — it is the state you arrived in. That is what makes the content scale
linearly instead of combinatorially, and it is the single most important
structural decision in this document.

### 5.2 The mechanism that makes the election matter

**The electorate changes between parliaments according to what you did.**
Whatever you conceded on franchise or apportionment before the election
determines the chamber after it, which determines which settlements remain
reachable. Some paths close. The player is not told which.

This is nothing but state — §4 item 1, applied at the one moment the game
recomputes the chamber — and it is the strongest argument for building `10`
sooner rather than later. It turns Election Night from a scoreboard into the
consequence of the whole first half.

## 6. How many paths, honestly

Count paths at the settlement, not at the choice. Four settlements, each
reachable from many play patterns, each arrived at with a chamber you built and a
law you wrote. That is more genuine variety than a branching tree with forty
nodes, and it is finishable.

The number to resist is the one that comes from counting choices. Twelve events
with three choices each is 531,441 "paths" and none of them mean anything.

## 7. What this document changes elsewhere

- `06` (variance) — the seed is scoped per campaign, so a campaign id joins the
  save.
- `10` (the election) — the changed electorate is promoted from a nice idea to
  the mechanism the settlements depend on.
- `content/setup.js` becomes a list. That is the one engine change this document
  asks for on its own account, and it should land with `01` while it is cheap.

## 8. Acceptance

- `content/setup.js` exposes more than one campaign and `Engine.newGame(C, id)`
  selects between them; with one campaign present, behaviour is byte-identical to
  today (I1 preserved).
- The save records which campaign it belongs to, and a save from one campaign
  refuses to load content for another rather than half-loading it.
- A settlement is detectable from state alone: `Engine.settlement(st, C)` returns
  one of the four or `null`, is derived, and stores nothing.
- Two playthroughs that reach the same settlement by different routes produce the
  same `settlement()` answer — the destination is a state, not a path.
