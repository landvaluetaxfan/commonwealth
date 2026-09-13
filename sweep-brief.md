# SWEEP BRIEF — CLOSING THE CONSEQUENCE CHAIN

**For execution against the repo. Companion to `bible.md` v4 and `design/`.**
Where this brief and the bible disagree on a number, the bible wins and this
brief is wrong — raise it rather than silently diverging.

This supersedes the seat-system brief, closed out in Part A. Its gap list is now
`design/`, mapped document by document in `design/README.md` §5.

---

## PART 0 — WHERE THE BUILD IS

| | |
|---|---|
| Engine | Substantially complete for governing, and now for deciding. Divisions with dual majority, whipping against a per-partner ledger, statutory instruments with prayer and reversal, cabinet vacancies gating instruments, scarcity prices, order-paper slots, the district and functional rolls, elections, save migration to v9, **undertakings**, a **seeded PRNG**, and the **derived reading of what a choice does**. |
| Content | **12 events.** Chapter one is playable, chapter two is four events. This is the project and it is barely begun. |
| Plan | `design/` — fourteen documents specifying the rest of the engine. |

**The ratio is still the risk** (§15.3.6). Nothing in Part C should be built as a
block ahead of Part D.

---

## PART A — WHAT THE LAST TWO SWEEPS CLOSED

- **The seat system**: the roll is the only source of truth, four verbs move a
  seat, elections reconcile both directions, `nonVoting` carries the capital.
- **The sitting screen**: a choice is a row that expands, carrying a derived
  reading of its own effects, the undertaking it would create, the cabinet's
  reaction, and a commit button that names the act. `when` and `cost` on a
  choice. The decision figure and the hourglass.
- **Undertakings and the docket**: a choice does not perform an act, it
  undertakes to; the act is carried out on the screen that owns it and
  `settle()` notices. No control anywhere marks one done, and `tools/uxtest.js`
  asserts there never will be.
- **The seed**: selection is deterministic given the save. Ties break on a draw,
  `chance` is tested once and remembered, divisions stay exact.
- **`suspendedAbove` / `suspendedBelow`**: the last link of §7.9's chain.
- **The consequence-chain audit** in `tools/lint.js`.

**Vocabulary: 26 effects, 27 conditions.** Over the twenty-verb line §15.5 warns
about. `design/01` sets out the consolidation that pays for it —
five number-movers into one `move` — and **that decision is outstanding and is
the author's**, because it trades legibility in content for room to build. Until
it is made, no new verb should land.

---

## PART B — THE PHASE: CLOSE THE CHAIN

§7.9 is LOCKED and states both the chain and a design rule about it:

```
decision  ->  price  ->  station conditions  ->  event
```

> a `price` effect with no event gated on it is a number nobody sees; an event
> gated on a price nothing moves will never fire.

The first three links work. The fourth barely exists. `npm run lint` now reports
it, and the current build breaks the rule six ways:

```
law.divergence_threshold_hours    moved by 1   gated by 0   NUMBER NOBODY SEES
price.thermal                     moved by 1   gated by 0   NUMBER NOBODY SEES
scalar.party_loyalty              moved by 6   gated by 0   NUMBER NOBODY SEES
scalar.public_standing            moved by 17  gated by 0   NUMBER NOBODY SEES
scalar.treasury                   moved by 3   gated by 0   NUMBER NOBODY SEES
station                           moved by 3   gated by 0   NUMBER NOBODY SEES
```

**Seventeen effects move public standing and nothing in the game is gated on it.**
That is the phase: make the numbers the game already moves into things that
happen to the player.

**This is mostly a content phase.** The engine's share is done.

---

## PART C — OPENCODE'S LANE

`content/*.js`. In priority order.

### C.1 The crisis the bible already promises

§7.9, worked in canon: *"Do nothing and the index climbs until the crisis event
fires at about sitting 19."* It does not exist. Write it: gated on
`priceAbove: {substrate: …}`, arriving as a shed order rather than a headline.

### C.2 One event per broken row above

Six rows, six gates. They need not be six new events — an existing event gaining
a `when` closes a row as well as a new one does. Priorities:

- **`public_standing`** first, since seventeen effects move it. What happens to a
  government nobody supports, and what happens to one everybody does?
- **`price.thermal`**, which is moved and watched by nothing, and is the index the
  whole setting is about.
- **`station`** — `stationBelow` and the new `suspendedAbove` both work now. §7.9's
  worked example is Homestead; `js/coverage.js` reports 31 of 33 stations
  appearing in no event.

### C.3 The escalation ladder

`design/03` §4. Nine rungs before involuntary suspension, each a statutory
instrument or a bill, each gated on the rung above having been tried. **Nine
content entries and zero engine changes** — the most-discussed design problem in
the game turns out to need no code.

Suspension must never be the efficient answer. Today it is free: the engine sheds
7,791 people over forty quiet sittings and nothing reads the number back.

### C.4 Chapter two, and the player character

Chapter two has four events. And before the narrative pass proper, `design/14`
asks for decisions that gate everything else:

- her **record** — three to five acts an opponent could read out;
- the **brief** — what she was elected to do, stated once, in-world, in the first
  two sittings. The game currently has four ways to lose and states no purpose.
- fix her seat: `content/characters.js` says First Spin, §11.2 says Anselm Ring.

### C.5 Two rewordings owed

`content/events.js` carries two mechanical demonstrations flagged in place. The
undertaking's `text` is what the order paper prints and the wording is prose.

---

## PART D — CLAUDE'S LANE

Small, and none of it blocks Part C.

- **The `move` consolidation** (`design/01`), once the author decides. It touches
  every event and the editor, and it gets more expensive with every event
  written.
- **A `brief` field on `content/cabinet.js`** so cabinet advice keys on the
  ministry that owns a subject rather than only on party. Schema entry plus the
  reader; the values are content.
- **Make the chain audit a hard failure** once Part C closes the rows. It reports
  loudly and passes today, because a check that fails from the day it lands gets
  disabled rather than fixed.
- **Amend §1.5** for the seed, in the words `design/06` §2.1 proposes. The engine
  is already deterministic-given-the-save; the bible has not been told.

---

## PART E — ACCEPTANCE

- `npm run check` green, and `npm run lint`'s consequence-chain table showing no
  `NUMBER NOBODY SEES` and no `EVENT NEVER FIRES`.
- A playthrough that does nothing for twenty sittings meets a crisis.
- Suspension has a political cost that an event delivers, not a scalar.
- `js/coverage.js` reports fewer than twenty stations appearing in no event.

---

## PART F — OUT OF SCOPE THIS PHASE

Foreign affairs (`design/11` — gated on chapter one reaching ~25 events),
lobbying and amendments (`design/07`), the election (`design/10`), knowledge and
scandal (`design/09`), money and supply (`design/13` — a canon decision first).

---

## PART G — SAVE MIGRATION

`STATE_VERSION` is 9. Blocks 8 (undertakings) and 9 (the seed) are ascending and
each stamps only its own version. **Never delete one and never reorder them** — a
descending guard once let a v1 save match `< 4`, get stamped 4, and skip every
earlier block.

---

## PART H — OPEN DECISIONS THIS PHASE RAISES

- **The `move` consolidation.** The author's call; the vocabulary is over budget
  until it is made.
- **§7.5.3 money.** LEANING, and `design/13` recommends locking it, naming the
  unit, and amending §7.6's treasury line. Everything fiscal waits on it.
- **The upper house.** `upper_house` is a stage with no actor. `design/08` §7
  proposes a delay power rather than a veto, and it is a canon decision.
- **What the player is expected to do**, per `design/14` §4. The game has four
  loss conditions and no stated purpose.
