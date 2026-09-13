# 12 — THE SITTING SCREEN

*The expanded choice, cabinet advice, the confirmation, and the docket that ties
a decision to the screen where it gets carried out.*

The interface half of `02`. That document specifies the mechanism; this one
specifies what the player actually sees, because a mechanism the player cannot
read is not a mechanism.

---

## 1. What a choice is today

```js
{ label: "Say publicly that the government stands behind it",
  effects: [ … ],
  result: "The Substrate Left is delighted. Thirty-one of your own members were
            not consulted." }
```

and it renders as a button with the label on it. Clicking applies the effects
instantly and prints the result.

Four consequences, all of them costing the game something:

1. **You cannot see what a choice does before you do it.** The only signal is the
   label, so labels have to carry everything and are drifting toward sentences.
2. **There is no cost visible anywhere.** Order-paper time is the currency §7.7
   builds the whole coalition economy on, and no choice mentions it.
3. **There is no confirmation**, so one misclick is irreversible in a game whose
   entire subject is irreversible decisions.
4. **Nobody in your government has an opinion.** There is a cabinet with holders
   and titles, eleven parties with positions, and currents inside your own
   caucus, and the player hears from none of them at the moment of decision.

---

## 2. The docket — how a decision reaches the other screens

The question this document exists to answer: *if Sitting and Government are not
hard-connected, what connects them?*

**The order paper.** And it is already there — the Government screen carries
`<h2>Order paper <em>select a bill</em></h2>` over `#gov-bills`. Today it lists
bills. An order paper in any real parliament lists **the business**, and that is
the whole change.

> **Promising something puts an item on the order paper. The order paper is
> where you go to carry it out.** Nothing else connects the two screens, and
> nothing else needs to.

| item on the order paper | put there by | discharged by |
|---|---|---|
| a bill at its stage | content | granting it time, dividing on it |
| **an undertaking** | **a choice in Sitting** (`02`) | **doing the thing it named** |
| an instrument awaiting signature | a choice, or content | signing it |
| a prayer window open against an order | making the order | letting it close, or being prayed against |
| a paper to be laid | a choice, or content | laying it |

This is better than a task list for a reason worth stating plainly: **an order
paper is an in-world document, and a task list is a game convention.** The player
is not being given objectives. They are looking at the business of the House,
which includes the thing they said they would do in front of the Guild Bench on
Tuesday. That is also why it must show items the player did not create — bills,
prayers, other people's business — because a docket containing only your own
promises is a to-do list wearing a hat.

**The status bar carries the count of outstanding items**, which is what makes
"Rise until the next sitting" stop being free.

### 2.1 Discharge is never a button

Restated from `02` §2 because it is the part most likely to be built wrong: the
player does not tick anything. They lay the order **on the screen that lays
orders**, using the button that already exists, and the engine notices. If a
"mark as done" control ever appears, the mechanic has been misbuilt.

---

## 3. The expanded choice

A choice becomes a **row that expands**, not a button that fires.

```
┌────────────────────────────────────────────────────────────┐
│ ▸ Say publicly that the government stands behind it        │
│   costs an order-paper slot · commits you to a date        │
└────────────────────────────────────────────────────────────┘
```

Expanded:

```
┌────────────────────────────────────────────────────────────┐
│ ▾ Say publicly that the government stands behind it        │
│                                                            │
│   WHAT THIS DOES                                           │
│   Improves how the government is seen. Costs you with the  │
│   New Progressive Party and with your own maintenance      │
│   members. Puts a statement on the wire.                   │
│                                                            │
│   YOU WOULD BE UNDERTAKING                                 │
│   To lay the shed order before the House by the sixth      │
│   sitting. The Guild Bench will be watching for it.        │
│                                                            │
│   THE CABINET                                              │
│   Ceyhan (Life Support) — for. "Say it now or the          │
│     engineering authority says it for you."                │
│   Marin (Persons and Continuity) — against. "You will      │
│     be asked what the government intends to do about the   │
│     eleven thousand, and you will not have an answer."     │
│                                                            │
│   [ Say it ]                                               │
└────────────────────────────────────────────────────────────┘
```

### 3.1 "What this does" is derived, not written

**The engine renders it from the effects themselves.** `js/schema.js` already
describes every verb well enough for the editor to build a form from it; the same
description builds a sentence.

This is not a labour-saving choice, it is a correctness one: **a hand-written
description drifts from the effects it describes, and then it lies to the
player.** A derived one cannot.

**Direction and who, never the number.** `{loyalty:{psa:-9}}` renders as *"costs
you with the New Progressive Party"*, not *"−9 loyalty"*. Three reasons:

- §7.6's test — the player should hold the state in their head, not do sums;
- exact numbers turn a decision into an optimisation, which is the same failure
  as a bloc meter in `04`;
- the brief for this was **semi-detailed, not fully detailed**, and that instinct
  is right.

Magnitude appears as banding, not digits: *costs you a little / costs you /
costs you badly*, from thresholds the schema declares per verb.

An optional authored `detail` field may add what the effects cannot say — context,
implication, what it means for somebody. **It never contradicts the derived
line**, and content review should treat a contradiction as a bug.

### 3.2 Cabinet advice: derived selection, authored voice

Advice must not be authored per choice per minister — that is N × M writing and
it will not get done.

**The engine picks who speaks.** A choice touches a brief (from the effects: a
law value, a station, a price, a bill), and the ministry that owns that brief has
a holder. The engine selects that minister, plus **one who disagrees**, using the
axis distance already computed for divisions.

**Content supplies the voice**, as a small stance library per character rather
than per choice — a handful of lines each, selected by whether they are for or
against and how strongly. A named minister with six stances covers every choice
in a chapter.

Where a choice deserves bespoke advice, it carries an authored `advice` block and
that wins. The user's own framing was right: **advice from your cabinet *if the
option is necessary*** — most choices need none.

**Two views or none.** One adviser is a hint and reads as the game telling you
the answer. Two who disagree is a decision. If only one minister has a view, show
none and let the prose carry it.

Silence is also content. A minister who has nothing to say about a decision in
their own brief is saying something.

### 3.3 The confirmation, and when not to have one

A confirm on every choice becomes a reflex click within twenty minutes and then
protects nothing.

**Confirm only when the choice is grave**, by a rule the engine applies rather
than an author remembering:

- it creates an undertaking, or
- it spends capital or an order-paper slot, or
- it changes a value in `law`, or
- it carries `grave: true`.

Everywhere else, expanding the row *is* the deliberation and the single click
inside it is the commitment. The confirm's label is the act, never the word
"Confirm" — **[ Say it ]**, **[ Lay the order ]**, **[ Tell her no ]**. The
terminal does not ask you whether you are sure; you either do the thing or you
do not.

### 3.4 The document on the right

When a choice concerns an instrument, a bill clause or a paper, expanding it
swaps the right-hand stack — currently Indicators and Wire — for **the document
itself**, drawn with the Papers screen's own renderer (`#pp-doc`).

No new component, and the point of it: the thing you are deciding about is a real
object in the world with a reference number, and you can read it before you sign
it. The Indicators return when the row collapses.

---

## 4. The engine changes this needs

Small, and two of them are worth having for their own sake.

**`when` on a choice.** Choices currently have no availability condition, so
content cannot write a choice that appears only if you can afford it, only if you
hold an amendment (`07`), or only if you know something (`09`). This is one line
in `choose`'s neighbourhood and it unlocks a great deal of content.

```js
{ label: "Offer the licensure carve-out",
  when: { amended: {divergence: ["licensure_carveout"]} },
  effects: [ … ] }
```

An unavailable choice is **absent, not disabled** — the same rule the menu's
Continue button already follows. A disabled control is a thing you are being
refused; a choice you cannot reach was never on the table.

**`cost` on a choice**, declared rather than buried in effects, so the collapsed
row can show it and the engine can refuse it:

```js
cost: { slot: 1 }        // or { capital: {psa: 2} }
```

**`Engine.describe(effects, C)`** — the derived reading in §3.1. Pure, no state
mutation, returns clauses rather than a string so the renderer decides the
punctuation.

**`Engine.briefsTouched(effects, C)`** — which ministries a choice concerns, for
§3.2. Derived from the effects and the cabinet, naming no minister in the engine
(T3).

Nothing else. No new state, no save-version bump: this document adds one state
field only through `02`.

---

## 5. Two things this must not do

**It must not make a sound or reveal text from the renderer.** CLAUDE.md's rule
stands: sound comes from engine effects and user actions only, never from
`drawAll()` or anything reachable from it. Expanding a row is a user action and
may cue; drawing the expanded row may not.

**The preview must use the fallible forecast, not the true one.** Once `08` §8
lands, the House's likely reaction is an estimate with a stated source. If the
expanded choice quietly shows the true number while the whip panel shows the
estimate, the player will learn to read the choice panel instead and the whole
information mechanic is dead. **One number, one provenance, everywhere it
appears.**

---

## 6. What this does to the density problem

An earlier pass on Sitting found it simultaneously too sparse and too crowded:
one long prose body, then a stack of long-sentence buttons.

The expanded choice fixes both, because it moves the load off the labels. Labels
get **short** — *"Stand behind it"*, *"Read the count first"*, *"Say nothing that
can be repeated"* — and the detail moves inside, where the player asks for it
rather than reading all of it three times. That is §2.6's explanation cost paid
at the moment of use instead of up front.

---

## 7. Acceptance

- A choice row expands and collapses by keyboard and pointer, and `js/focus.js`
  restores the expanded row across a re-render by data key.
- `Engine.describe()` is pure: called twice on the same effects it returns
  identical clauses, and it mutates nothing (asserted against `Engine.save()`).
- Every effect verb has a description; a verb with none fails
  `tools/lint.js`, so the consolidation in `01` cannot silently drop one.
- No description states a raw number.
- A grave choice cannot be committed without the confirm step; a plain one has no
  confirm — both asserted by driving the real controls.
- A choice whose `when` fails is absent from the DOM, not disabled.
- A choice whose `cost` exceeds what is available is absent, and the reason is
  legible somewhere on the screen (the slot counter already says it).
- Expanding a choice fires no audio cue and no streamer reveal; committing one
  fires exactly one cue — the existing spy pattern in `tools/uxtest.js`.
- The order paper lists undertakings alongside bills, and discharging one on the
  Government or Papers screen removes it, with **no control anywhere that marks
  an undertaking done directly**.
