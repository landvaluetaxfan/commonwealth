# 04 — BLOCS AND OPINION

`material_interest` exists on thirty stations, a hundred and forty-one
constituencies and every archetype. The engine reads none of it
(`loop-brief.md` §1.3). This document makes it load-bearing **without adding a
single field to the state object**, because the obvious version of this feature
is forbidden by canon and the forbidden version is also the worse one.

---

## 1. What not to build

The tempting design is an opinion model: a stored number per bloc, moved by
effects, decaying over time, feeding `public_standing`. Reject it, on two grounds.

**§7.6 is LOCKED.** *"Shallow simulation, deep consequence. No supply-chain or
price solver."* And the test: *"if the player would need a second window to
compute the right answer, the model is too deep."* Six blocs with stored,
decaying standing is a spreadsheet.

**`sweep-brief.md` C.5 proposes a sixth scalar** for electoral standing. Rejected
here for the same reason — a sixth number the player must track is the wrong
answer to "the model cannot see blocs". The right answer is a derivation the
player can read on demand and never has to hold in their head.

## 2. What to build: a derivation

A bloc's standing is **computed when asked, from data that already exists**, and
stored nowhere.

```js
/* Engine.blocView(st, C) -> [{ id, name, aggrieved, because }] */
```

Three inputs, all present today:

1. **`material_interest` tags** — what this bloc's welfare depends on. Already
   authored on every station, constituency and archetype.
2. **The four prices** — how those things are going.
3. **The law object** — `divergence_threshold_hours`, `substrate_public_share`,
   `civic_clock_minimum`, `suspension_debt_accrual` and the rest.

A bloc is *aggrieved* when the things it depends on have moved against it since
the opening of the session. That is a comparison, not a simulation: no
integration, no decay, no hidden accumulator. Re-derive it and you get the same
answer from the same state, which keeps I1 and I2 intact for free.

`because` is the important field and the one that keeps this honest: the
derivation must be able to say *which* interest moved and by how much, in one
clause, or it is too deep. If it cannot be explained in a sentence the player
could have worked out themselves, cut it until it can.

## 3. The blocs

Named in the bible, currently invisible to the chamber. This list is the
setting's, not the engine's — it lives in `content/blocs.js` and the engine
learns it from there (T3).

| bloc | interest | canon |
|---|---|---|
| embodied labour | volume, transit, wage exposure | §10.3, §10.3.1 |
| the emulated poor | substrate, thermal, clock minimum | §6.10.2 |
| the long-lived emulated | substrate insurance, backups | §6.10.2, §7.4 |
| fork-rentiers | the divergence threshold | §10.5, and Part XVI: 210k people with a direct interest and **no parliamentary voice** |
| guild licensees | licensure, standards | §4.6.4 |
| consortium shareholders | anchors, tether traffic, quota | §10.10 |

§6.10.1 is the load-bearing one and the engine must not flatten it: **the real
class axis is exposure, not substrate.** A bloc model that sorts people into
biological and emulated has reproduced the mistake the bible spent a section
warning against. Exposure — `0.75 − closure`, the same weighting §7.9 already
uses for stations — cuts across substrate and is what actually predicts who
suffers.

## 4. The condition

```js
when: { blocAggrieved: ["fork_rentiers", "emulated_poor"] }
```

One condition. It is the whole point of the derivation: under §7.9 the chain must
terminate in an event, so what content needs is not a number to read but a gate
to hang an event on.

## 5. Where it surfaces

**Not as a meter.** Meters invite optimisation and §7.6's test rules them out
here. Two places, both on demand:

- **The Chamber screen**, as a column or an overlay: which benches answer to
  which aggrieved interest. This is where it earns its keep, because it turns
  "the functional bench will not carry this" from a fact into a reason.
- **A constituency's expanded row**, which already exists (`consOpen`,
  `constituencyDetail()`), naming the interests that seat answers to and whether
  they are currently moving against it.

## 6. What this unlocks

The fork-rentier problem Part XVI raises — *210,000 people with a direct interest
in the threshold and no expression in the chamber* — becomes stateable once blocs
are derivable. It stays a **political** problem rather than becoming a mechanical
one: the bloc is visible, aggrieved, and structurally unable to vote, which is
the setting's argument rather than a bug in it.

The same derivation is what `09` needs to change the electorate between
parliaments, and what `06` needs to price an amendment's cost in bloc terms
rather than in raw loyalty.

## 7. Acceptance

- `Engine.blocView()` adds nothing to `Engine.save()` output — asserted by
  calling it and comparing byte-for-byte.
- Called twice on identical state it returns identical results; called after a
  price move it returns different ones.
- `because` is present and non-empty for every aggrieved bloc.
- `blocAggrieved` gates an event in both directions.
- `content/blocs.js` round-trips through the editor (`tools/roundtrip.js`), and
  `js/refs.js` follows bloc ids so a rename reaches them.
- `grep -E 'fork_rentier|emulated|guild' js/engine.js` returns nothing (T3).
