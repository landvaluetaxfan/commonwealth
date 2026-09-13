# FINISHING THE ENGINE — THE COMPLETION PLAN

**13 September 2026.** Fifteen documents specifying every remaining engine system,
in dependency order, to the point where `js/engine.js` is done and the project is
content work plus interface work and nothing else.

**Read this file first.** It defines what "finished" means, and the three tests
every proposal in the other fourteen had to pass. Several obvious-sounding features
are specified here as *smaller* than they sound, because canon forbids the large
version — that is not caution, it is the design.

---

## 0. How this relates to the other documents

| file | what it is | authority |
|---|---|---|
| `bible.md` | canon, out-of-world | **wins over everything here** |
| `textbook.md` | canon, in-world | wins on tone |
| `sweep-brief.md` | **the current build phase** — closing the consequence chain | the phase; its gap list is now these documents |
| `loop-brief.md` | measurements of what the build does | the evidence these plans rest on |
| `design/*` | **the plans to finish the engine** | subordinate to the bible |

Where a document here disagrees with the bible on a rule or a number, the bible
wins and the document is wrong. Raise it rather than silently diverging.

---

## 1. What "finished" means

**Not "simulates everything."** §7.6 is LOCKED and says so directly:

> Shallow simulation, deep consequence. No supply-chain or price solver. […]
> Everything richer — closure ratios, apportionment ratios, suspended counts,
> thermal capacity per station — is **per-station data that events read**, not a
> simulation that runs.
>
> **The test:** if the player would need a second window to compute the right
> answer, the model is too deep. If they can hold the whole state in their head
> and still be surprised, it is right.

And §7.9 fixes where every causal chain must end:

> `decision -> price -> station conditions -> event`
>
> Design rule: a `price` effect with no event gated on it is a number nobody
> sees; an event gated on a price nothing moves will never fire.

**The terminus is an event.** Not a scalar, not a meter, not a derived index the
engine feeds back into itself. So:

> **The engine is finished when every system the bible names has the state it
> needs, the conditions content needs to see that state, and the verbs content
> needs to change it — and not one function more.**

This is a much smaller target than "build the systems", and it is the reason
these documents keep specifying a condition where a simulation was expected.
Most of what looks missing is missing *eyes*, not missing machinery.

## 2. The three tests

Every proposal in `01`–`13` had to pass all three. Anything that fails one is
either cut or reduced until it passes, and where something was reduced the
document says so.

**T1 — The §7.6 depth test.** Could the player hold this in their head? If the
answer requires a spreadsheet, it is too deep. Derived readouts are free;
simulated state is expensive and mostly forbidden.

**T2 — The §7.9 terminus test.** Does this end in an event a player reads? A
system whose output no event is gated on is a number nobody sees. Every new
condition in these documents exists so that content can terminate a chain.

**T3 — The §15.5 separation test.** Does `js/engine.js` still name no event, no
party and no station? A verb that encodes a specific thing has failed; the thing
belongs in `content/`.

## 3. The vocabulary budget, and how it is paid for

The build carries **24 effect verbs and 25 conditions**. `sweep-brief.md` Part A
already flagged this: *"Approaching the twenty-verb line §15.5 warns about; the
next addition should displace one rather than extend the list."*

These plans need roughly **six new effects and eight new conditions**. That is
not affordable by extension. It is affordable by consolidation, and `01` sets out
the trades in full. The short version:

- **Five number-movers collapse into one.** `scalar`, `loyalty`, `relationship`,
  `price` and `capital` are the same operation — clamp-and-add against a keyed
  target — differing only in which table they reach into. One `move` verb with
  namespaced keys does all five. **−4 verbs.**
- **`unflag` folds into `flag`** taking a false value. **−1.**
- **`byelection` folds into `vacate_seat`** with a `then: "byelection"` option,
  since a by-election is what a vacancy causes. **−1.**

That is six recovered before anything is added, which pays for the additions with
room left. The rule going forward, stated once here and enforced in `01`:

> **A new verb is allowed only if it cannot be expressed as data passed to an
> existing verb.** Count is the symptom; near-duplicates are the disease.

The consolidation is not free — it touches every event, the schema, the editor
and `roundtrip.js`. `01` specifies the migration, and it is the first work in the
order below precisely because doing it later means doing it to more content.

## 4. Dependency order

Nothing here is a schedule. Arrows are hard dependencies.

```
01 vocabulary + state ──┬──> 02 undertakings ──────> 08 actors ──┐
                        │                                        │
                        ├──> 03 consequence chain ──> 04 blocs ──┼──> 10 election
                        │                               │        │
                        │                               ▼        │
                        │                        05 campaigns    │
                        │                                        │
                        ├──> 06 variance                         │
                        │                                        │
                        ├──> 07 bargaining ──────────────────────┘
                        │
                        ├──> 09 knowledge ──────> 11 foreign affairs
                        │
                        ├──> 12 the sitting screen   (the interface half of 02)
                        │
                        └──> 13 money and supply ────────────> 10 election
```

`05` is a framing document rather than a build: it decides how strict the
storyline is and how divergence is paid for, and `10` is where its mechanism
lands. Read it before planning any of `06`–`11`.

**`01` first, and alone.** Every other document assumes the consolidated
vocabulary. Landing it against twelve events is a morning; landing it against
a hundred and fifty is a week.

**`03` before `04`.** The consequence chain has exactly one terminus today
(`substrate_price_bite`). Wiring blocs before the chain that feeds them produces
more numbers nobody sees.

**One thing from `05` lands early**, with `01`: `content/setup.js` becomes a list
rather than a singleton. It is an afternoon now and a week after fifty places
have assumed it is singular.

**`13` is a canon decision before it is an engine change.** Lock §7.5.3, name the
unit, and amend §7.6's treasury line in `bible.md` first. It shares the
escalation ladder with `03` and it must land before `10`, because an election
fought with no budget in the record is an election about nothing.

**`11` last**, and Part XVI is explicit about why: not before chapter one has
about twenty-five events. It has twelve.

## 5. What this supersedes in `sweep-brief.md`

Part C's gap list is absorbed and expanded, not replaced:

| sweep-brief | now specified in |
|---|---|
| C.1 amendments | `07-bargaining.md` |
| C.2 leadership ballot | `08-actors.md` |
| C.3 scandal and the thriller spine | `09-knowledge.md` |
| C.4 wiring the election in | `10-the-election.md` |
| C.5 upper house | `08-actors.md` |
| C.5 opposition mode | `08-actors.md` (and `05` — it is a campaign, not a system) |
| C.5 lobbying | `07-bargaining.md` |
| C.5 attestation on the wire | `09-knowledge.md` |
| C.5 a sixth scalar | **rejected** — see `04`; the need it names is served by a derivation, and §7.6's test says a sixth number the player must track is the wrong answer |

Parts 0, B, D, E, F and G of the sweep brief stand unchanged. In particular
**Part D stands over all of this**: content is the project, twelve events is the
binding constraint, and no document here should be built as a block ahead of it.

## 6. The index

| | | lane |
|---|---|---|
| `01-vocabulary-and-state.md` | the verb consolidation, the target state shape, `STATE_VERSION` 8–12, the invariants | Claude |
| `02-undertakings.md` | a choice undertakes rather than performs; the loop spine | Claude |
| `03-the-consequence-chain.md` | closing §7.9's loop; the escalation ladder; the audit that enforces the design rule | Claude + opencode |
| `04-blocs-and-opinion.md` | `material_interest` made load-bearing as a derivation, not a simulation | Claude |
| `05-campaigns-and-divergence.md` | how strict the storyline is; what depth actually buys divergence; four settlements | framing |
| `06-variance.md` | the seeded PRNG, event classes, arrival channels, simultaneity | Claude |
| `07-bargaining.md` | amendments, lobbying, and solving the functional trap | Claude |
| `08-actors.md` | opposition, cabinet, caucus, partners, the President, the upper house, imperfect information | Claude |
| `09-knowledge.md` | secrets, scandal, the distribution list, attestation | Claude |
| `10-the-election.md` | dissolution, the campaign, Election Night, the changed electorate | Claude |
| `11-foreign-affairs.md` | light-lag as the organising axis; anchors, Kessler severance, metanationals | Claude |
| `12-the-sitting-screen.md` | the expanded choice, cabinet advice, the confirmation rule, the order paper as the docket | Claude |
| `13-money-and-supply.md` | the fiscal currency, the Appropriation Bill, what confidence-and-supply means | canon, then Claude |
| `14-the-player-character.md` | how malleable Flash is, what must already be true about her, what the player is expected to do | the narrative pass |

Every document ends with an **Acceptance** section naming the assertions that
must exist in `npm run check` before it can be called done. That is the project's
only playtester and these plans do not get an exemption.
