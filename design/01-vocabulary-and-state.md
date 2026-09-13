# 01 — VOCABULARY AND STATE

**Do this one first and alone.** Every other document assumes the vocabulary
below. It touches every event, `js/schema.js`, the editor and `roundtrip.js`, and
the cost of it scales with the content that exists when it lands. Twelve events
is the cheapest this will ever be.

---

## 1. The consolidation

### 1.1 Five number-movers become one

`scalar`, `loyalty`, `relationship`, `price` and `capital` are the same
operation: clamp-and-add against a keyed target. They differ only in which table
they reach into and what the bounds are.

```js
/* before — five verbs */
{scalar:{treasury:-5}}, {loyalty:{psa:8}}, {relationship:{gb_chair:12}},
{price:{substrate:-10}}, {capital:{psa:3}}

/* after — one verb, namespaced keys */
{move:{ "treasury":-5, "loyalty.psa":8, "rel.gb_chair":12,
        "price.substrate":-10, "capital.psa":3 }}
```

A bare key is a scalar, because scalars are much the commonest case and the
prefix would be noise on every event in the game. Everything else takes a
namespace. The engine keeps the per-namespace bounds it already has: scalars and
loyalty clamp 0–100, prices clamp 20–400, capital is unbounded and signed
(§7.6 — nothing decays and nothing is forgiven).

**This is the only consolidation that costs legibility**, and it is worth
arguing about before it lands. `{loyalty:{psa:8}}` reads better than
`{move:{"loyalty.psa":8}}`. The case for doing it anyway: it recovers four
verbs, the editor renders it from the schema either way so authors never type
it, and the alternative is refusing four features later for want of budget.

**If it is rejected**, the budget must be found elsewhere and the additions in
§2 must be cut to fit. Say which; do not land the additions and leave the
arithmetic broken.

### 1.2 `unflag` folds into `flag`

```js
{flag:"read_the_count"}                  // unchanged, still sets true
{flag:{read_the_count:false}}            // replaces unflag
```

### 1.3 `byelection` folds into `vacate_seat`

A by-election is what a vacancy causes, not an independent act. One verb, with
the consequence as an option:

```js
{vacate_seat:{constituency:"anselm_4", party:"cu", why:"death",
              then:"byelection"}}
```

`then` may be `"byelection"` or omitted for a seat that stays empty. The
distinction matters: §4.5 and the roll already treat a vacancy and a contested
return as different things.

### 1.4 Net

| | effects | conditions |
|---|---|---|
| today | 24 | 25 |
| after consolidation | **18** | 25 |
| after the additions in §2 | **24** | **33** |

Effects end where they started; conditions grow, and that is the right shape.
**A condition is content's eyes and an effect is content's hands** — under §7.9
the engine's job is mostly to let content *see*, so conditions should outnumber
effects and the gap should widen as the game is finished, not narrow.

The conditions count is the one to watch. If it passes forty, the likely cause is
near-duplicates (`xAbove`/`xBelow` pairs) and the fix is a comparison argument,
not a cull.

---

## 2. The additions

Every one is justified in the document named, and every one fails to be
expressible as data passed to an existing verb. Nothing here names an event, a
party or a station (T3).

### Effects (+6)

| verb | shape | document |
|---|---|---|
| `undertake` | `{id, text, owed_to, by, discharge, onBreach}` | `02` |
| `discharge` | `id` — closes an undertaking without the act, for content that resolves it another way | `02` |
| `amend` | `{bill, amendment}` — attaches a drafted amendment at committee | `06` |
| `lobby` | `{party, hours}` — spends substrate-hours outside the coalition | `06` |
| `learn` | `{who, secret}` — moves a fact into somebody's knowledge | `08` |
| `dispatch` | `{to, text, arrives}` — a message that lands late | `10` |

### Conditions (+8)

| condition | asks | document |
|---|---|---|
| `owes` | is this undertaking outstanding | `02` |
| `breached` | was it broken | `02` |
| `suspendedAbove` / `suspendedBelow` | a station's or the federation's suspended count | `03` |
| `blocAggrieved` | is a named bloc's interest currently damaged | `04` |
| `amended` | does this bill carry this amendment | `06` |
| `knows` | does this person hold this secret | `08` |
| `relationBelow` | a foreign relationship | `10` |

`suspendedAbove`/`suspendedBelow` are the pair that closes the largest gap in the
build and they are two lines each. See `03`.

---

## 3. The target state shape

Additions only; everything currently in `newGame()` stays. Each is annotated with
the version that introduces it and the document that specifies it.

```js
{
  /* ... everything at STATE_VERSION 7 ... */

  seed: 0,              // v8  · 05 · the PRNG's cursor. Save-scoped, so a
                        //             given save always replays identically.
  undertakings: [],     // v9  · 02 · [{id, text, owed_to, by, discharge,
                        //             onBreach, state:"open"|"kept"|"broken"}]
  lobbying: {},         // v10 · 06 · partyId -> substrate-hours spent this session
  knows: {},            // v11 · 08 · personId -> { secretId: sitting-learnt }
  foreign: {},          // v12 · 10 · actorId -> { relationship, lastHeard }
  dispatches: []        // v12 · 10 · [{to, text, arrives}] — in flight
}
```

Five bumps. **One block per bump, ascending, each stamping only its own version.**
The trap is recorded in `CLAUDE.md` and it has already bitten this project once:
a descending guard let a v1 save match `< 4`, get stamped 4, and skip every
earlier block.

```js
if (st.version < 8)  { st.seed = st.seed || 0;            st.version = 8;  }
if (st.version < 9)  { st.undertakings = st.undertakings || []; st.version = 9;  }
if (st.version < 10) { st.lobbying = st.lobbying || {};   st.version = 10; }
if (st.version < 11) { st.knows = st.knows || {};         st.version = 11; }
if (st.version < 12) { st.foreign = st.foreign || {};
                       st.dispatches = st.dispatches || []; st.version = 12; }
```

**No bump for blocs.** `04` adds no state at all — bloc standing is derived on
demand from data that already exists. That is the point of it.

**Content owns identity, the save owns simulation.** A new foreign actor must
reach old saves the way a new station does, through `Engine.reconcile()`, which
already backfills parties, currents and stations from content on every load. `10`
extends it; nothing else here needs to.

---

## 4. Invariants

Five properties the engine must keep. Each is an assertion, not a comment, and
each names where it lives.

| # | invariant | asserted in |
|---|---|---|
| I1 | `Engine.newGame(C)` is pure and repeatable — two calls serialise byte-identically | `test.js` |
| I2 | A save replays identically to itself, seed included; two *different* seeds may diverge | `test.js` |
| I3 | Seats move only by `cross`, `vacate_seat`, `functional` and `election`; district and functional totals always reconcile with their rolls in both directions | `test.js` |
| I4 | Every effect verb round-trips through the editor unchanged | `tools/roundtrip.js` |
| I5 | **No price, station field or scalar is moved by any effect unless some event's `when` is gated on it** — §7.9's design rule, made mechanical | `tools/lint.js` (new; see `03`) |

I5 is the one that does not exist yet and matters most. It is the difference
between a consequence engine and a set of numbers that drift.

---

## 5. Acceptance

- `npm run check` green with the consolidated vocabulary, and `tools/renametest.js`
  still passing — the namespaced keys in `move` are references and the rename
  tracker in `js/refs.js` must follow them.
- `tools/roundtrip.js` proves every consolidated verb survives serialise→reload.
- A v7 save loads into the current build and plays, asserted for each bump.
- `js/schema.js` describes `move` well enough that the editor renders a picker
  per namespace rather than a free-text key. An author must never type
  `"loyalty.psa"` by hand.
- `grep -E '"(cu|psa|gb|anselm|divergence)"' js/engine.js` returns nothing (T3).
