# 06 — VARIANCE

*Threshold events, random events, and where an event arrives.*

Two of the three need no engine change at all. The third needs one function and
an amendment to a LOCKED section of the bible, which is why it is specified
carefully rather than just done.

---

## 1. Threshold events already work

The `when` vocabulary carries `priceAbove`, `priceBelow`, `scalarAbove`,
`scalarBelow`, `stationBelow`, `capitalAbove`, `capitalBelow`, `loyaltyAbove`,
`loyaltyBelow`, `signaturesAtLeast`, `billStage`, `siInForce`, `postVacant`,
`slotsLeft`, and after `03` the two suspension conditions. An event written

```js
when: { priceAbove: { substrate: 140 }, flagsAbsent: ["shed_order_made"] }
```

fires when the price crosses 140 and not before.

**The gap is content, not capability**, and it is the cheapest lever in the whole
completion plan: one event is currently gated on a price and none on a station's
condition. See `03` §6 for what is owed.

## 2. Random events need a seeded PRNG

### 2.1 The constraint, and why it survives

§1.5 is LOCKED: *"Do not add randomness to event selection. Determinism is what
makes balance testable."*

The reason given is testability, and testability is fully served by a **seed
stored in the save**:

- A given save always replays identically. `test.js`, `tools/roundtrip.js`, the
  40-sitting smoke test and the byte-identical division proof all keep working
  unchanged, because they all start from a fixed state.
- Two *different* games differ, which is the thing being bought.
- A bug report is reproducible from the save file, which is strictly better than
  today, where it is reproducible only from the choice sequence.

So the property the constraint protects is kept and the property it forbids is
dropped. **This requires §1.5 to be amended, not ignored.** Proposed wording, to
be edited into the bible by whoever owns it rather than by the engine pass:

> Event selection is deterministic **given the save**. A seed lives in the state
> object and is advanced by every draw, so a save replays identically to itself
> while two games differ. No `Math.random` anywhere in `js/engine.js`.

### 2.2 The implementation

```js
/* A 32-bit xorshift. Small, exactly reproducible across engines, and — the
   point — advanced only through this function, so every draw is recorded in
   the save by the seed's new value. Math.random is banned outright: it is not
   reproducible and it cannot be saved. */
function draw(st) {
  let x = st.seed || 1;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  st.seed = x >>> 0;
  return st.seed / 4294967296;
}
```

The seed is generated once, at `newGame`, from the campaign id and the clock, and
never touched again except by `draw()`.

**I1 (`newGame` is pure and repeatable) is at risk here** and must be preserved:
`newGame` takes the seed as an optional argument and only falls back to the clock
when none is given. `test.js` passes a fixed seed. Two calls with the same seed
serialise byte-identically, as they do today.

### 2.3 Where randomness is allowed, and where it is not

| allowed | forbidden |
|---|---|
| choosing between events of **equal weight and equal eligibility** | changing which events are eligible |
| an event's `chance: 0.4`, tested once when it first becomes eligible | re-rolling a failed chance every sitting |
| jitter on *when* a queued event comes due (±1 sitting) | jitter on whether a queued event arrives |
| a by-election's margin within a modelled range | a division's outcome |

**Divisions stay exact.** The arithmetic is the argument of the game; a division
that could go either way on a die roll destroys the whole point of the whip
panel, and it would break the proof that a division resolves identically whether
its dialog is watched or skipped.

The current tie-break is *"ties break on id"*. That becomes: ties break on a
draw, and the id ordering remains the fallback when no seed is present, so a
pre-v8 save still behaves exactly as it did.

## 3. Event classes and arrival channels

Where a thing appears is half of what it means. An event carries a `class`, and
the class decides the channel; the engine does not know what any class means
beyond routing (T3).

| class | arrives as | examples |
|---|---|---|
| `government` | the order paper | a department fails to deliver; an instrument is found defective |
| `chamber` | the dispatch box | an urgent question, a censure motion, a rebellion |
| `national` | the Wire | a strike, a court ruling, a price shock, a station referendum |
| `station` | the orbital chart | a radiator failure, a closure dispute, a shed order |
| `foreign` | a dispatch, **arriving stale** | an anchor state changes terms; a Kessler event |
| `party` | private | a challenger declares; a current defects |
| `personal` | private | the thriller spine (§13.2) |

Three rules that make the classes worth having:

1. **`party` and `personal` never appear on a public screen.** If the Wire
   carries it, it is not private, and the whole value of the class is that the
   player learns it before anyone else — or worse, after.
2. **`foreign` arrives stale.** The light-lag is the mechanic, not the flavour;
   see `11`.
3. **A class is a routing hint, not a category of importance.** The order paper
   carries the dullest and the gravest business alike, which is the joke the
   whole interface is built on.

## 4. Simultaneity

Events arrive one at a time, so the player never chooses *between* crises — only
inside one. Two live events with one order-paper slot is the cheapest drama
available and it needs no new state: `nextEvent()` returns an array, the Sitting
screen shows both, and taking one leaves the other for the next sitting with a
sitting's worth of consequence for the delay.

Keep the cap at two. Three is a queue, and a queue is a to-do list.

## 5. Acceptance

- `grep -n 'Math.random' js/` returns nothing.
- Two `newGame` calls with the same seed serialise byte-identically (I1).
- A save replayed through the same choice sequence produces byte-identical state,
  seed included (I2).
- Two different seeds produce different sittings within twenty advances — asserted
  positively, so that a PRNG wired up but never consulted fails the check.
- A pre-v8 save with no seed selects events by the old id tie-break, asserted
  against a recorded fixture.
- A division's result is unaffected by the seed: the same division run under ten
  different seeds returns identical counts.
- `class` routes to the right surface, asserted per class in `tools/uitest.js`.
