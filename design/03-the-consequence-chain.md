# 03 — THE CONSEQUENCE CHAIN

**The largest gap in the build, and much the cheapest to close.** It is not a
missing system. It is a chain that the bible specifies in full, that the engine
already runs three quarters of, and that has almost nothing at the end of it.

---

## 1. What §7.9 locks

```
decision  ->  price  ->  station conditions  ->  event
```

> Stations answer to the substrate price weighted by exposure `0.75 − closure`,
> so poor habitats feel it first. A station that cannot pay does not economise;
> it sheds people, and the shed order says which.
>
> Worked, and in content: pass the Substrate (Public Stake) Bill and Homestead
> has roughly 1,400 fewer suspended residents twenty-six sittings later. Do
> nothing and the index climbs until **the crisis event fires at about sitting
> 19**. Inaction is a decision — the drift is upward by default.
>
> **Design rule: a `price` effect with no event gated on it is a number nobody
> sees; an event gated on a price nothing moves will never fire.**

## 2. What the build does

The first three links work, and were measured (`loop-brief.md` §1.4):

| run, 40 sittings from a fresh game | substrate | suspended | change |
|---|---|---|---|
| no policy at all | 117 | 79,221 | **+7,791** |
| `substrate_public_share: 0` | 138 | 89,325 | **+17,895** |
| `substrate_public_share: 1` | 79 | 60,925 | **−10,505** |

The fourth link is missing. Twelve events exist; **one** is gated on a price
(`substrate_price_bite`), and **none** on a station's condition or a suspended
count. The crisis at sitting 19 does not fire, because content is exhausted at
sitting 9.

So `loop-brief.md`'s finding — *"nothing reads `suspended` back"* — was correctly
measured and wrongly framed. The reader was never supposed to be the engine.
§7.6 forbids that explicitly: suspended counts are *"per-station data that events
read, not a simulation that runs."* **The engine does not need feedback. Content
needs eyes, and it does not have them.**

## 3. The engine's whole share of this

Two conditions. That is the entire engine change in this document.

```js
suspendedAbove: (st, v) => Object.keys(v).every(k =>
  (k === "federal" ? federalSuspended(st) : st.stations[k].suspended) > v[k]),
suspendedBelow: (st, v) => Object.keys(v).every(k =>
  (k === "federal" ? federalSuspended(st) : st.stations[k].suspended) < v[k]),
```

with `federalSuspended(st)` summing the roster — derived, never stored, for the
same reason `apportionment_ratio` is derived: a total stored beside its parts
diverges from them, and this project has already been bitten by exactly that.

`stationBelow` already exists and covers closure and the rest. With these two,
content can gate on every link in the chain.

## 4. The escalation ladder

The suspension critique in `loop-brief.md` §4.1 is right about one thing the
bible does not yet say: **there is no ladder.** The price moves and people go
under. §6.6's four pathways (voluntary, penal, default, emergency triage) are
categories of suspension, not steps before it.

The ladder is **content, not engine** — instruments and bills the player can
reach for, each cheaper politically and dearer fiscally than the one below:

| rung | instrument or bill | pays with |
|---|---|---|
| 1 | voluntary conservation appeal | `public_standing` |
| 2 | clock-rate reduction order | the emulated blocs' patience |
| 3 | deferred-computation scheduling | consumables, and the guilds |
| 4 | emergency thermal appropriation | `treasury` |
| 5 | quota purchase on the open market | `treasury`, hard |
| 6 | substrate-insurance drawdown | the third rail (§7.4) |
| 7 | lowered performance standards | the licensing board (§4.6.4) |
| 8 | emergency powers | §3.7, and the fight is termination not declaration |
| 9 | involuntary suspension | everything above, having failed |

Each rung is a statutory instrument or a bill in `content/instruments.js` and
`content/bills.js`, gated on the rung above having been tried. **Nine content
entries, zero engine changes.** That is the shape this project is supposed to
have, and it is worth noticing that the most-discussed design problem in the
whole game turns out to need no code.

### 4.1 The balance rule, made testable

*Suspension must never be the efficient answer.* Stated as an assertion:

> **A9 —** For any state reachable in the smoke test, the total political cost of
> reaching rung 9 exceeds the cost of any rung above it that would relieve the
> same amount of price pressure.

This currently fails trivially, because rung 9 costs nothing at all. It becomes
meaningful once the ladder exists and once events are gated on
`suspendedAbove` — and it belongs in `test.js` from the day rung 1 lands, failing
loudly, rather than being added when convenient.

## 5. The design-rule audit

§7.9's design rule is a rule nobody enforces. Make it mechanical, in
`tools/lint.js`, as a hard failure beside the artifact shape check:

```
CONSEQUENCE CHAIN
  substrate  moved by 4 effects, gated by 1 event                    ok
  thermal    moved by 2 effects, gated by 0 events            NUMBER NOBODY SEES
  volume     moved by 0 effects, gated by 1 event               EVENT NEVER FIRES
  transit    moved by 0 effects, gated by 0 events                    inert
```

Walk `content/events.js` and `content/instruments.js` for every effect that moves
a price, a scalar or a station field, and every `when` that reads one. Report the
two failure modes the bible names. This is invariant **I5** from `01`, and it is
the one check that would have caught the state this document describes.

`inert` is a note, not a failure — a price nothing moves and nothing reads is
merely unused. The failures are the asymmetric cases.

## 6. What content owes

opencode's lane, and the reason this document is joint:

1. **The sitting-19 crisis event the bible already promises.** Gated on
   `priceAbove: {substrate: …}`, written to arrive as a shed order rather than a
   headline. It is named in canon and does not exist.
2. **Events on `suspendedAbove`**, at least one federal and one per exposed
   station, so that the number the engine has been quietly moving since the first
   build becomes something the player is told about by somebody.
3. **The nine ladder rungs** in §4.
4. **A thermal chain**, because thermal is moved by effects and gated by nothing
   — the first row the audit will fail on.

`js/coverage.js` already reports what to write next from the content itself. Run
it rather than guessing; as of `sweep-brief.md` it reports 31 of 33 stations
appearing in no event, which is the same gap seen from the other side.

## 7. Acceptance

- `suspendedAbove` / `suspendedBelow` gate an event in both directions, federal
  and per-station.
- `federalSuspended()` is derived and stored nowhere — asserted by mutating a
  station and re-reading the total.
- `tools/lint.js` prints the consequence-chain table and exits non-zero on a
  moved-but-ungated number; the current build must fail it before the content in
  §6 lands, and pass after.
- A9 exists in `test.js` from the first rung, and is allowed to fail loudly until
  the ladder is complete.
