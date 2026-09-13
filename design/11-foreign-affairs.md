# 11 — FOREIGN AFFAIRS

**Last, and gated.** Part XVI is explicit: *"Not before chapter one has ~25
events (§15.3.6)."* It has twelve. This document exists so the shape is decided
before anyone builds it, not so anyone builds it now.

---

## 1. The organising axis is light-lag

Part XVI already made the important decision, and it is a good one:

> When built, the organising axis should be **light-lag**, the way the orbital
> chart's is altitude: a map ordered by delay is a map of how alien each
> relationship is. Actors: Earth states holding the anchors, Mars, the belt, and
> the metanationals as quasi-sovereign.

The consequence for the engine is one rule, and everything else follows from it:

> **A foreign fact is never current.** Every foreign reading the player sees is
> as of when it was sent, and the interface says so.

Not a fog of war, not hidden information — a *dated* one. You know exactly what
Mars said; you know it was eleven sittings ago; you do not know what Mars thinks
now. That is a different and better anxiety than uncertainty, it is physically
honest, and it costs one field.

## 2. State

```js
st.foreign = {                    // actorId -> as-of-last-heard
  earth_anchor_state: { relationship: 62, lastHeard: 14 },
  mars:               { relationship: 40, lastHeard: 3  }
};
st.dispatches = [                 // in flight
  { to: "mars", text: "…", arrives: 19 }
];
```

`relationship` is the value **as of `lastHeard`**, never a live figure. The
engine must not expose a current one, because it does not have one and pretending
otherwise destroys the whole mechanic.

Actors are content (`content/foreign.js`) with a `lag` in sittings. `Engine.reconcile()`
backfills new actors into old saves, exactly as it already does for stations —
the same code path, extended.

## 3. Verb and condition

```js
{dispatch: {to: "mars", text: "…", arrives: 19}}
when: { relationBelow: {earth_anchor_state: 40} }
```

`advance()` delivers dispatches whose time has come, as `foreign`-class events
(`06` §3). One block, beside the undertaking breach check.

`relationBelow` reads the last-heard figure, which means **content can be gated on
stale information** — an event fires because the last thing you heard was bad,
and it may no longer be true. That is not a bug to be worked around. It is the
setting.

## 4. The three pressures

§10.10, LOCKED, and each maps to a different mechanic already in the plan:

**Anchors on someone else's ground.** *"A dozen space elevators anchored in the
sovereign territory of Earth states. The lifeline is in foreign hands, so foreign
policy stops being flavour."* An anchor state changing its terms moves `transit`
and `volume` — which is the §7.9 chain (`03`) with a foreign origin, needing no
new machinery. This is the main line and everything else is secondary.

**Kessler risk as commons tragedy.** *"An environmental politics whose failure
mode is fast and can physically sever the polity into disconnected pieces."*
Severance is the interesting part and it is a **station** mechanic, not a foreign
one: a cut station cannot be reached, its members cannot attend, and the roll has
to cope. That is the dual majority's arithmetic under physical stress, and it is
the most dramatic thing in this document.

**Metanationals.** *"Elevator consortiums, substrate providers, consumables
cartels as actors with near party-tier power, not lobbyists in the margins."*
They belong in `st.foreign`, not in `st.parties`, and the distinction is the
point: they are quasi-sovereign, they cannot be whipped, and `07`'s lobbying runs
in *both* directions — they lobby the chamber, and the player is not the only
one buying functional seats.

## 5. What not to build

**No world simulation.** No Earth politics running in the background, no Martian
economy. Foreign actors have a relationship, a lag, and a position on the axes
the game already uses. §7.6 applies with full force and the light-lag rule gives
a principled reason to keep it thin: **the game cannot show what it does not know,
and it does not know what Mars is doing.** The fiction pays for the shallowness.

**No diplomacy minigame.** Dispatches are events with a delay. Reaching an
agreement is prose and a `law` change, as with everything else.

**No second map.** The orbital chart already orders by altitude; the foreign view
orders the same actors by delay. It should read as the same instrument with a
different axis, not a new screen with a new visual language.

## 6. The gate, restated

Do not build this until chapter one has about twenty-five events. §15.3.6 names
the failure it is protecting against — *a magnificent setting document attached
to nothing* — and foreign affairs is the single most tempting way to make that
worse. It is the most exciting unbuilt system and the least urgent, and those two
facts are related.

## 7. Acceptance

- No engine path returns a current foreign relationship; every read carries
  `lastHeard`, asserted by grepping the surface for an unqualified accessor.
- A dispatch arrives on the sitting it says and not before, across a save/load in
  between.
- A new foreign actor added to content appears in an old save via
  `Engine.reconcile()`.
- `relationBelow` gates on the last-heard value, asserted by moving the true
  value and confirming the gate does not change until delivery.
- A severed station's members are excluded from divisions, and the dual majority
  recomputes — asserted against the bible's arithmetic, because this is the one
  foreign mechanic that can change who governs.
