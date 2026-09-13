# THE GAMEPLAY LOOP — DIAGNOSIS AND PLAN

**13 September 2026.** Companion to `bible.md` (canon) and `sweep-brief.md` (the
current build phase). This file is neither: it is the argument for what the game
*does*, written after measuring what it currently does.

Everything in Part 1 was measured against the build at `6874312`, not inferred.
The commands are given so the numbers can be re-taken when they change.

---

## PART 1 — WHAT THE BUILD ACTUALLY DOES

### 1.1 The loop, as built

Two halves that never touch.

**The event half.** `drawSitting()` asks `Engine.nextEvent()`, prints the body,
prints the choices. Clicking a choice calls `Engine.choose()`, which applies the
effects immediately and returns the result line. Then "Rise until the next
sitting" calls `Engine.advance()`. That is the entire cycle.

**The government half.** The Government screen can grant order-paper slots, make
statutory instruments and pray against them; a bill page can set whips and
divide. Every one of these is a real mechanic with real arithmetic behind it.

**Nothing in the first half ever requires anything in the second.** An event
choice that says the government will lay an order does not create an order to be
laid; it applies `{si: [...]}` and the order is simply in force. The Government
screen is therefore optional in the strict sense: a player who never opens it
sees the same states as one who lives there. That is the "shiny toys that do
nothing" feeling, and it is structural, not cosmetic.

### 1.2 Content exhausts at sitting 9

```
events: 12 | prologue: 5 | queuedOnly: 4 | chaptered: 4
content exhausted at sitting 9
distinct events fired: 8 of 12
```

Twelve events exist. A playthrough that always takes the first choice sees eight
of them and runs out of order paper in nine sittings. **There is no loop to
diagnose yet — there is a demo.** Every structural fix below is worth doing, but
none of them substitutes for the event count going up by an order of magnitude.
Both halves of this document assume that.

### 1.3 `material_interest` is decorative

Thirty stations, a hundred and forty-one constituencies and every archetype carry
a `material_interest` array. The engine reads none of them:

```
$ grep -rn 'material_interest' js/
js/ui.js:1302        (renders it)
js/ui.js:1410        (renders it)
js/refs.js:214,221   (rename tracking)
js/editor.js:...     (edits it)
```

No condition tests it. No effect consumes it. A station whose material interest
is `tether_traffic` behaves identically to one whose interest is
`substrate_supply` under every bill in the game. The tags are a promise the
engine does not keep — which matters because they are also the natural raw
material for the bloc model in Part 3.

### 1.4 Suspension is free

This is the sharpest finding, and it is the one the ChatGPT assessment guessed at
without being able to see the code.

`tick()` runs on every `advance()` and moves people into suspension as a direct
function of the substrate price:

```js
const strain = (P.substrate - 100) / 100;
const exposure = Math.max(0, 0.75 - s.closure);   // poor stations feel it first
const delta = Math.round(strain * exposure * s.population * 0.0012);
s.suspended = Math.max(0, s.suspended + delta);
```

Measured over forty sittings from a fresh game (`node` against the engine, no
events fired — see `tools/` for the harness pattern):

| run | substrate price | suspended | change |
|---|---|---|---|
| opening state | 100 | 71,430 | — |
| 40 quiet sittings, no policy at all | 117 | 79,221 | **+7,791** |
| 40 with `thermal_margin` held at 12 | 120 | 80,306 | +8,876 |
| 40 with `thermal_margin` held at 5 | 123 | 81,686 | +10,256 |
| 40 with `substrate_public_share: 0` | 138 | 89,325 | **+17,895** |
| 40 with `substrate_public_share: 1` | 79 | 60,925 | **−10,505** |

Two things follow.

**Doing nothing suspends 7,791 people.** The equilibrium is not neutral: a player
who never legislates still sheds eight thousand people in forty sittings, because
the price drifts up on its own.

**One law value swings 28,420 people** between its extremes — about 0.4% of the
population — and this happens with no ladder, no appeal, no announcement beyond a
wire line when a single station crosses ten thousand.

And then:

```
$ grep -rn 'suspended' js/engine.js
1408,1409   (writes it)
1410-1413   (a wire mark at the 10,000 threshold)
```

**Nothing reads it back.** Not a scalar, not a seat, not a loyalty value, not a
price, not an election. Suspending twenty-eight thousand people costs the player
nothing and gains them nothing. It is the single largest gap between what the
setting says it is about and what the machine does.

### 1.5 Perfect information

`Engine.division()` returns exact counts and the whip panel shows the true cost
of every block before it is committed. The player never acts on an estimate. That
makes a division arithmetic rather than judgement, and it removes the thing that
makes whipping dramatic in reality: not knowing whether your own side will turn
up.

---

## PART 2 — THE FIX: UNDERTAKINGS

The question was whether a decision in Sitting should route to Government or
Papers so the action can be carried out there. Yes — but routing is the least
important part of it, and building it as navigation would be a mistake. A button
that jumps you to another tab and then does the same thing is still a button that
does a thing.

**The mechanic is that a choice does not perform the act. It undertakes to.**

An undertaking is a first-class object in the save:

```js
{ id: "lay_the_shed_order",
  text: "Lay the shed order before the House",
  owed_to: "gb",                // who is watching; null for the public
  by: 6,                        // sitting number
  discharge: { si: "shed_order_2287" },   // what discharges it
  onBreach: "gb_withdraws_support" }      // event queued if the deadline passes
```

- The **Sitting** screen creates it. The choice's result line names it.
- The **Government / Papers / Chamber** screen discharges it, by the player
  actually making the instrument, carrying the division, or laying the paper.
  The engine notices the discharge; the player is not asked to tick anything.
- **Breach fires the named event** and costs whatever that event says.
- The **status bar** carries the count of outstanding undertakings, which is the
  first thing that makes "Rise until the next sitting" feel expensive.

This is a small engine change — one array in state, one condition (`owes`), one
effect (`undertake`), one hook in the places that already mutate instruments,
bills and papers — and it fixes five problems at once:

1. Choices have weight, because a choice is a promise and promises can be broken.
2. The Government screen becomes the place where governing happens, not a museum.
3. Order-paper time bites, because discharging costs slots you were saving.
4. Deadlines create the pressure the loop has no other source of.
5. Breaches are a *generator* of exogenous events rather than authored one-offs.

### 2.1 The split window

The proposed layout — the instrument on the right, advisor feedback at the bottom,
a longer description in a dropdown, semi-detailed impacts — is right. Two notes
on what goes in it.

**The bottom panel should be disagreement, not a readout.** "Party loyalty −9" is
a number the player will learn to optimise. Two named ministers who want opposite
things, one of whom is right, is a decision. The cabinet is already data
(`content/cabinet.js`, holders and titles); an advisor line keyed on the minister
whose brief the decision touches costs nothing structural and is worth more than
any impact table.

**The impact preview must be somebody's estimate, not the truth.** Label it as the
whips' count or the department's view, derive it with a deliberate error term, and
let it be wrong. This is the fix for §1.5 and it is what turns the preview from a
spoiler into a source of tension. It is also cheap: the true number is already
computed; the display just needs a stated provenance and a fuzz.

---

## PART 3 — EVERYTHING MISSING

Ordered by what unblocks the most. Items marked *(canon)* are already specified in
`bible.md` and merely unbuilt; items marked *(open)* are undecided there too.

### 3.1 Forcing functions — why nothing has weight

1. **Undertakings** — Part 2. Nothing else on this list matters as much.
2. **A cost to inaction.** "Rise until the next sitting" is free and unlimited.
   A session should have a length, and rising should spend something.
3. **Simultaneity.** Events arrive one at a time, so there is never a choice
   between two crises — only a choice inside one. Two live events with one slot
   is the cheapest drama in the game.
4. **Opposition agency.** The opposition never acts: no censure motion, no urgent
   question, no amendment, no wrecking timetable. Currently it is scenery with
   seat counts.
5. **Cabinet agency.** Ministers are data and never resign, brief against you, or
   fail. A resignation the player did not choose is the strongest possible
   consequence of a broken undertaking.
6. **Caucus agency.** The leadership challenge is a loss condition
   (`party_loyalty <= threshold`) with no visible approach. It should have a
   named challenger, a count, and a warning.
7. **Coalition-partner agency.** Partners never issue an ultimatum or walk.
   `st.coalition` is a list that only the player edits.
8. **Imperfect information** — §1.5 above.

### 3.2 Absent systems

9. **Foreign affairs** *(open, deferred with a design)*. Part XVI already says the
   organising axis should be **light-lag**, the way the orbital chart's is
   altitude, with Earth states holding the anchors, Mars, the belt, and the
   metanationals as quasi-sovereign. The bible defers it until chapter one has
   ~25 events; chapter one has twelve. It is the obvious missing screen and it is
   correctly queued behind content.
10. **Lobbying** *(canon, explicitly unbuilt)*. §7.8: parties outside the
    coalition cannot be whipped at all, and moving those benches "is lobbying, a
    different activity with a different currency, and not yet built." The
    divergence bill's functional trap — 12 of 40, needing 21, all 12 already
    voting for — is *unsolvable* by any mechanic currently in the game. That is
    the single most load-bearing missing verb.
11. **A budget.** There is no appropriations cycle. A parliamentary game without a
    budget is missing its heartbeat: the recurring, unavoidable, coalition-testing
    piece of business that structures a session.
12. **Courts** *(canon in prose, §10.8)*. Judicial review of statutory instruments
    is the natural counterweight to SI abuse, which is currently the fastest and
    cheapest tool in the game with only the prayer to check it.
13. **An active President** *(canon, §3.3)*. Refusal and referral exist as gates
    with a relationship score. The office has no motives of its own.
14. **The upper house** *(open)*. Undefined in Part XVI, yet `content/minutes.js`
    already references it. Either define its powers or stop naming it.
15. **Committees.** Bills have a committee stage that is a string. Amendments,
    witnesses and chair patronage are all missing.
16. **Media** *(canon, §10.7)*. The Wire is output-only. No leak, no interview, no
    lobby briefing, no choosing when to announce.
17. **Scandal** *(canon, §13.1 taxonomy)*. A taxonomy with no mechanic.
18. **Election Night** *(canon, §12.5)*. `generalElection()` exists in the engine
    and works; there is no UI, so an election currently resolves invisibly. This
    is a large, well-specified, self-contained build.
19. **By-election campaigns.** The effect exists; the campaign does not.
20. **Coalition formation and exit** as a mechanic rather than a list.
21. **Patronage.** The `cabinet` effect can appoint and vacate; the player cannot
    reshuffle as an action.
22. **The thriller spine** *(canon, §13.2 LEANING)*. Backup coercion, held in
    reserve for a late arc. Nothing built.

### 3.3 Simulation depth

23. **Public opinion is one scalar.** `public_standing` covers seven million
    people across thirty stations, four axes and every bloc. This is the biggest
    modelling gap after foreign affairs, and it is what makes the electorate
    unable to respond to anything specific the player does.
24. **`material_interest` is inert** — §1.3. Wiring it is the cheapest possible
    route to a bloc model, because the tags already exist on every station,
    constituency and archetype.
25. **Suspension has no feedback** — §1.4.
26. **No bloc model.** The setting names the blocs and the chamber cannot see
    them: fork-rentiers (210k, and Part XVI already flags that they have no
    parliamentary voice), embodied labour, the emulated poor, the long-lived
    emulated, guild licensees, consortium shareholders.
27. **The axes are categorical.** Four axes with two values each. The five signed
    axes with agreement-as-distance are written and sitting unlanded on
    `opencode/party-rename-and-economy`. Landing them is prerequisite to any
    honest bloc arithmetic.
28. **Prices feed stations and stop.** `tick()` moves prices and prices move
    suspension; nothing returns to opinion, loyalty or seats.
29. **Closure is uncontested.** Every station has a closure number that no bill,
    event or actor argues about.
30. **`labour.js` is display-only**, like `material_interest`. It also disagrees
    with the bible (~68% embodied against §6.10's 46%) — a known open item.

### 3.4 Exogenous events

**Threshold events already work and need no engine change.** `when` accepts
`priceAbove`, `scalarBelow`, `stationBelow`, `capitalAbove`, `signaturesAtLeast`
and the rest. An event with `when: {priceAbove: {substrate: 140}}` fires when the
substrate price crosses 140 and not before. The gap here is content, not
capability, and it is the cheapest lever on this whole document: the consequence
chain the bible describes in §7.9 can be written today.

**Random events need one engine change and a bible amendment.** §1.5 forbids
randomness in event selection, and the reason given is that determinism is what
makes balance testable. That reason is fully served by a **seeded PRNG stored in
the save**: the seed is generated once at `newGame`, lives in state, and is
advanced by every draw. A given save then always replays identically —
`test.js`, `roundtrip.js` and the byte-identical division proof all keep working
— while two different games differ. This preserves the property the constraint
protects and drops the one it does not. It is an engine change, so it is Claude's
lane, and it needs §1.5 amended rather than ignored.

**The categories, each of which wants its own arrival channel** — where a thing
appears is half of what it means:

| class | arrives as | examples |
|---|---|---|
| governmental | the order paper | a department fails to deliver; an instrument is found defective |
| chamber | the dispatch box | an urgent question, a censure motion, a rebellion |
| national | the Wire | a strike, a court ruling, a price shock, a station referendum |
| station | the orbital chart | a radiator failure, a closure dispute, a shed order |
| foreign | a dispatch, delayed by light-lag | an anchor state changes terms; a Kessler event |
| party | private | a challenger declares; a current defects |
| personal | private | the thriller spine |

The last two should never appear on a public screen, and the foreign ones should
arrive **stale** — the light-lag is the mechanic, not the flavour.

---

## PART 4 — THE TWO ASSESSMENTS

### 4.1 On suspension

The assessment is right, and the code makes it stronger than it knew: the failure
it warns about — "substrate prices went up 8%, therefore 14,000 people were
suspended" — is not a risk, it is the current implementation, measured in §1.4.

Most of its *prescriptions*, though, are already canon. The four pathways
(voluntary, penal, default, emergency triage) are §6.6. The consequence chain is
§7.9. "The untouchable third rail" is §7.4's own phrase. It is describing the
bible back to itself, which is a good sign for the bible.

Two things in it are genuinely new and worth taking:

**The escalation ladder as a mechanic.** Conservation, clock reduction, deferred
computation, emergency appropriation, quota purchase, transfers, lowered
standards, emergency powers, and only then involuntary suspension. Each rung
should be a thing the player can reach for, with its own price, and suspension
should be reachable only from the bottom of the ladder. Today there is no ladder:
the price moves and people go under.

**"Do not make suspension economically efficient"** is a balance rule that can be
written as a test. Something like: *no policy path may relieve a scarcity price
by suspending people at a lower total political cost than the alternatives on the
ladder.* That assertion belongs in `test.js`. It currently fails trivially,
because the political cost of suspension is exactly zero.

### 4.2 On the story structure

The structural core is right and matches the engine's grain: **authored crises,
systemic resolution, a finite set of settlements** — not a branching tree. The
engine/content split pays off exactly when content scales linearly, and a tree is
the one shape that makes it stop paying off.

Three corrections.

**Its headline recommendation is already decided.** It says to decide the dual
majority's second leg first, because everything downstream waits on it. §4.6.1 is
LOCKED: the second leg is the functional members, 21 of 40, scoped to bills
touching life-support integrity and charter amendments. Nothing is waiting.

**Six settlements is too many for v1.** Three or four, and each should be a
*reachable state of the existing state object* — a law value plus a flag set —
rather than an authored ending. Restriction, substrate neutrality, graduated
personhood and the federal fudge cover the interesting space; closure and
dissolution can be reached later or folded in as failure modes.

**Its best idea is the cheap one.** *The electorate changes between parliaments
according to what you did.* Whatever you conceded on franchise or apportionment
in term one determines the chamber you govern with in term two, which determines
which settlements stay reachable. That is nothing but state, it makes Election
Night a consequence rather than a scoreboard, and it is the strongest argument
for building Election Night sooner rather than later.

---

## PART 5 — ORDER OF WORK

Nothing here is a schedule; it is a dependency order.

**Now, and cheap:**
- Content volume. Twelve events is the binding constraint on every other item.
- Threshold events off the existing `when` vocabulary — the §7.9 consequence
  chain, written as content, no engine change.
- Give suspension a political cost. One or two conditions and an opinion hook.

**Next, and structural (engine, so Claude's lane):**
- Undertakings (Part 2).
- The seeded PRNG, with §1.5 amended.
- Wire `material_interest` into a bloc model; land the five signed axes.
- Imperfect information on forecasts.

**Then, in roughly this order:**
- Lobbying — it is the only route past the functional trap.
- Election Night, which turns the above into a consequence.
- A budget cycle.
- Opposition and cabinet agency.
- Foreign affairs, once chapter one has the events the bible asks for.

---

*Part 1's numbers were measured at `6874312`. Re-take them before trusting them
against a later build.*
