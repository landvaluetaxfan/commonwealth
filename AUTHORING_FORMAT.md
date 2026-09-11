# AUTHORING FORMAT

A plain-text format for writing content by hand. An agent converts it into
`content/*.js`. You never have to touch JavaScript syntax, and the agent never
has to invent structure.

Write these into `drafts/`. They are not loaded by the game — they are source
for a conversion step.

---

## Why a separate format

Writing directly into `content/events.js` means fighting quoting, escaping,
trailing commas and the effect vocabulary all at once. Writing prose in markdown
and converting it means you think about the event and the agent thinks about the
schema.

It also makes the two-agent split work. You draft, Claude Code writes the spec,
opencode does the conversion, and the six checks catch anything wrong. Nobody
touches the engine.

---

## EVENT

```markdown
## EVENT bellows_strike_threat
chapter: 2
weight: 78
once
when: scalarBelow thermal_margin 25; flagsAbsent bellows_handled
speaker: ansar
image: bellows_plant.png / broadcast / "Atmosphere plant 2, Bellows" / Ring Network
teaches: none

Bellows runs the atmosphere plant for four stations and is paid as though it
runs a warehouse. The integrity local has voted, and the vote was not close.

They have not said strike. They have said that the maintenance schedule will be
observed exactly as written, which everyone understands to be worse.

--- Concede the schedule and find the money
+ scalar treasury -12
+ loyalty cu_maintenance 11
+ station bellows closure 0.03
+ flag bellows_handled
> The money comes out of the yard programme, which has its own members.

--- Invoke essential services and order them back
+ scalar public_standing -7
+ loyalty cu_maintenance -18; gb 6
+ flag bellows_handled; bellows_coerced
+ signatures 2
> Lawful, immediate, and the reason the grievance was unhealed in the first place.

--- Say nothing and let the schedule be observed
+ price thermal 11
+ queue bellows_cascade after 3
> Four stations discover what exactly-as-written means.
```

**Rules the converter follows**

| line | becomes |
|---|---|
| `## EVENT <id>` | the event id |
| `chapter:` / `weight:` / `prologue:` | those fields |
| `once` / `queuedOnly` on their own line | boolean flags |
| `when:` | conditions, `;` separated, `key arg arg` |
| `speaker:` | character id, must exist |
| `image:` | `file / palette / caption / credit` |
| `teaches:` | glossary terms this event introduces, or `none` |
| body until first `---` | the prose |
| `--- <label>` | a choice |
| `+ <verb> <args>` | an effect |
| `> <line>` | the result line |

Effects use the same verbs as the schema: `scalar loyalty capital price economy
law station seats flag unflag bill si cabinet relationship coalition wire queue
chapter signatures`. Multiple targets on one line separate with `;`.

---

## CHAPTER SKELETON

For blocking out a chapter before writing it. The converter produces real events
with placeholder prose and correct structure, so the graph and the checks work
immediately and you fill in the writing later.

```markdown
# CHAPTER 3 — The price of that
advances_from: chapter 2, on any choice in ch2_carveout_price
opens_with: the substrate index above 112

## SKELETON
- ch3_open / prologue 1 / the morning after
- ch3_ashfield_delegation / w80 / when: priceAbove substrate 112
- ch3_vellan_resigns / queued / minister resignation, from ch3_open choice 2
- ch3_halloran_moves / w95 / when: signaturesAtLeast 9
- ch3_shed_order_returns / w70 / the blocked bill, now with a body count
```

Each line is `id / firing rule / one-line intent`. The converter writes a valid
event for each with `TODO` prose and two placeholder choices carrying one effect
apiece, so `npm run check` passes and the coverage panel counts them.

Then you replace the prose one at a time, in any order, without the game ever
being broken.

---

## MINUTE

```markdown
## MINUTE PM/4/2287/134
subject: Thermal diversion — Vantage High
from: The Prime Minister
to: Minister for Life Support
copy: Cabinet Secretary; Law Officer
struck: Minister for Substrate and Thermal
not copied: Coalition liaison (Public Substrate Association)
classification: Restricted — ministerial
on sign: flag thermal_direction; relationship gb_chair 4

The array has been below reserve for eleven days and the replacement is behind a
loop upgrade nobody has ever been able to explain.

1. I want the procurement queue for Vantage in front of me by Thursday.
2. If the authority intends to shed the tier-four register, I want to be told
   before it happens rather than after.
3. This minute is a record. Treat it as one.
```

The distribution list is the point (§12.8). `struck` and `not copied` are plot,
not formatting.

---

## INSTRUMENT

```markdown
## INSTRUMENT SI 2287/62
title: Consumables (Agricultural Standards) Order 2287
author: consumables_agriculture
procedure: negative
prayer window: 6
revocable: yes

summary: Widens the Consumables and Agriculture licence to admit deck
cooperativists certified by their own syndicates, adding 2,300 electors to a
constituency of 8,900.

effect note: A third board, and the point at which the chamber stops calling it
a manoeuvre.

+ seats cu functional 1; fh functional -1
+ flag consumables_board_packed
+ loyalty gb -12; fh -15; cu_deck 14
+ signatures 4
reverse: seats cu functional -1; fh functional 1; unflag consumables_board_packed
cost: scalar public_standing -11
prayer: cu ifLoyaltyBelow 28; psa against; gb for; fh for; hul for
```

---

## The conversion prompt

Paste into opencode, or have Claude Code write a fuller version:

> Read `AUTHORING_FORMAT.md` and `CONTENT_GUIDE.md`. Convert every file in
> `drafts/` into entries appended to the correct file in `content/`. Follow the
> schema in `js/schema.js` exactly — do not invent effect verbs, conditions,
> station ids, character ids or glossary terms. Do not touch anything in `js/`.
> Where a draft names something that does not exist, stop and list it rather
> than creating it. Then run `npm run check` and report.

The constraint that matters is the last one. §2.7 says no pass may invent a
station, a character or a setting term — so the converter reports a missing
reference rather than helpfully inventing one.
