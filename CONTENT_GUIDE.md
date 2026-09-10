# CONTENT GUIDE

How to add things without touching the engine. If you find yourself editing
`js/engine.js` to add content, stop — the thing you want is nearly always a new
entry in `/content`.

## Running it

Open `index.html` in a browser. No server needed. Content files are plain `.js`,
not `.json`, precisely so this works from disk — `fetch()` on a `file://` URL is
blocked by the browser, `<script src>` is not.

Run `node test.js` to check the arithmetic and smoke-test 40 sittings.

## The files

```
index.html          shell and script order
css/terminal.css    all styling — the mockup, unchanged
js/engine.js        rules. Names no event, party, or station.
js/ui.js            rendering. Contains no rules.
content/setup.js      opening state
content/parties.js    parties and internal currents
content/stations.js   the station roster
content/characters.js the fixed cast
content/bills.js      bills and how each party votes on them
content/events.js     ← you will live here
```

---

## Adding an event

Copy an entry in `content/events.js`. Nothing else changes.

```js
{ id:"unique_id",
  weight:70,              // higher fires first among eligible events
  once:true,              // omit to allow repeats
  queuedOnly:true,        // omit unless it should ONLY fire from a queue effect
  when:{ minSitting:3, flagsAbsent:["already_done"] },
  title:"Shown in the header and the record",
  speaker:"halloran",     // a character id, or null
  body:`Prose. Blank lines become paragraphs.`,
  choices:[
    { label:"What the button says",
      effects:[ {scalar:{public_standing:-4}}, {flag:"already_done"} ],
      result:"One or two lines shown after the choice." }
  ]}
```

### Conditions (`when`)

| key | example |
|---|---|
| `minSitting` / `maxSitting` | `minSitting:5` |
| `flags` / `flagsAbsent` | `flags:["shed_order_promised"]` |
| `scalarAbove` / `scalarBelow` | `scalarBelow:{thermal_margin:20}` |
| `lawIs` / `lawAbove` / `lawBelow` | `lawBelow:{divergence_threshold_hours:100}` |
| `loyaltyAbove` / `loyaltyBelow` | `loyaltyBelow:{cu_halloran:20}` — works on parties or currents |
| `stationBelow` | `stationBelow:{ashfield:{closure:0.35}}` |
| `billStage` | `billStage:{divergence:"committee"}` |
| `inGovernment` | `inGovernment:false` |

All conditions in a `when` must hold. Omit `when` for always-eligible.

### Effects

| verb | example | notes |
|---|---|---|
| `scalar` | `{scalar:{party_loyalty:-6}}` | clamped 0–100 |
| `loyalty` | `{loyalty:{psa:-9, cu_halloran:12}}` | party or current |
| `law` | `{law:{divergence_threshold_hours:40}}` | sets, does not add |
| `station` | `{station:{vantage:{closure:0.03}}}` | numbers add, strings set |
| `seats` | `{seats:{cu:{district:-1}}}` | defections, by-elections |
| `flag` / `unflag` | `{flag:"gb_approached"}` | string or array |
| `bill` | `{bill:{shedorder:{stage:"second_reading"}}}` | |
| `relationship` | `{relationship:{president:-8}}` | `president` or a character id |
| `coalition` | `{coalition:{remove:["rv"]}}` | also `add` |
| `wire` | `{wire:"HEADLINE IN CAPS"}` | appears in the wire panel |
| `queue` | `{queue:[{event:"followup", after:4}]}` | fires in N sittings |

To add a new verb, add it to `EFFECTS` in `engine.js`. Keep the list short —
if the vocabulary grows past twenty, content is leaking into the engine.

---

## Adding a bill

`content/bills.js`. A bill's `stances` object says how each party votes; parties
you leave out are inferred from axis agreement, so you never have to list all
eleven.

```js
stances:{
  cu:  { popular:{for:68}, functional:"for" },   // splits by bench
  psa: "for",
  sc:  { free:true },        // splits on party loyalty
  cl:  { forPct:0.3 },
  hul: "against"
}
```

Stance forms: `"for"` · `"against"` · `"abstain"` · `{for:n}` (n seats in that
bench) · `{forPct:0..1}` · `{free:true}` · `{popular:…, functional:…}`.

Set `dualMajority:true` for bills touching life-support integrity or amending the
charter. Those must carry separately on both benches — the trap the campaign is
built on.

`onPass` and `onFail` are effect arrays, same vocabulary as events.

---

## Adding a party or a station

Add an object to `content/parties.js` or `content/stations.js`. Seat totals,
the hemicycle, the legend, division maths, and the constituency table all update
from the data — no rendering code to touch.

Station roster is **frozen canon**. Adding one is a deliberate act, not something
a content pass does.

---

## Rules that keep this working

1. The engine names nothing. No event id, party id, or station id appears in
   `js/engine.js`.
2. Event selection is deterministic — same state, same event, always. That is
   what makes balance testable. Do not add randomness.
3. `queuedOnly:true` on every follow-up event, or it will fire before the thing
   it follows.
4. Version the state object before changing its shape. `migrate()` in
   `engine.js` has the slot for it. Schema changes that break old saves are the
   thing that kills projects like this.
5. Run `node test.js` after content edits. It asserts the chamber arithmetic
   against the bible and plays 40 sittings looking for crashes.

---

## Images

Optional throughout. Every image reference degrades to nothing if the file is
missing, so you can write content that names an image before you have made it.

### The rule

Images are **not decoration, they are evidence of a source.** The palette says
who rendered the picture, before the player reads the caption:

| palette | source in world | use for |
|---|---|---|
| `registry` | the government system itself | character portraits, ID photos, official records |
| `newsprint` | *The Spindle* | press photographs |
| `broadcast` | Ring Network | broadcast stills, live footage |
| `deck` | civilian, agricultural decks | warmth, the human register |

This is the split visual language from the bible applied to photography. The
system chrome is drab; the images carry their origin in their colour.

### Processing

```bash
./tools/dither.sh registry  160 4:5  src/halloran.jpg img/portraits/
./tools/dither.sh newsprint 640 12:5 src/*.jpg        img/events/
```

Args: `<palette> <width> <aspect> <inputs...> <outdir>`. Output is an indexed
PNG8 — a portrait lands around 2 KB, a plate around 11 KB.

**Aspect is not optional.** The CSS pins both shapes, so an image that arrives
the wrong shape gets cropped again in the browser and you lose control of the
framing:

| | aspect | width | why |
|---|---|---|---|
| portraits | `4:5` | 160 | an ID photo shape; renders at 96×120 |
| plates | `12:5` | 640 | a still frame band; never eats the reading column |

The crop fills and centre-crops rather than letterboxing, so a 12:5 plate from a
16:9 source loses roughly a quarter of its height. Centre anything that matters,
or crop the source yourself first.

A square image with `width:100%` and no height constraint renders as tall as the
panel is wide, which is how this was originally wrong.

The pipeline is `-resize` → slight desaturate → `-posterize 6` →
`-dither Riemersma` → `-remap palette.png`. Posterize must come **before**
remap; running it after re-quantizes colours that were already snapped to the
palette and can push them back off it.

### Wiring it up

A character portrait:
```js
{ id:"halloran", portrait:"halloran.png", name:"Tarrin Halloran MP", ... }
```

An event plate:
```js
image:{ src:"vantage_radiator.png", palette:"broadcast",
        caption:"Radiator array 4, Vantage High", credit:"Ring Network" }
```

### Practical notes

- Portraits below about 120px wide turn faces into noise. 160px is the floor.
- `image-rendering: pixelated` is set in the CSS. Without it browsers smooth the
  upscale and the whole effect dies.
- A saturated spot colour in a palette pulls a lot of midtones onto it. If
  `newsprint` reds are dominating a photograph, desaturate harder before remap
  rather than editing the palette.
- Riemersma is organic and painterly. For an image that should read as
  *machine-generated* — a registry scan, a sensor capture — swap
  `-dither Riemersma` for `-ordered-dither o4x4`, which gives a regular Bayer
  grid and looks like output from a system rather than from a camera.
- Edit `tools/palettes/*.png` and re-run the batch to restyle every image in the
  game at once. That single point of control is the main reason to do this at all.

---

## Scarcity prices — making consequences visible

Four index numbers, 100 at the opening of the series: **thermal quota**,
**substrate rent**, **volume**, **transit**.

Deliberately not a stock market. There is no point pricing equities in an economy
where goods are nearly free, and §7.5 warns against any model the player would
need a second window to solve. These are the four things that are actually
scarce, and every one is a **legislative output rather than a market outcome** —
§2.3's rule applied to the economy.

### The causal chain

This is the whole point, and it is the answer to "do my decisions matter":

```
decision  →  price  →  station conditions  →  event
```

Worked example, currently in content:

- The **Substrate (Public Stake) Bill** sets `substrate_public_share` to 0.6 and
  knocks 26 points off the substrate index.
- Each sitting, `Engine.tick()` drifts prices a fifth of the way toward what the
  current policy implies — so prices *lag* policy, and politics happens in the lag.
- Stations answer to the substrate price, weighted by exposure `0.75 − closure`,
  so low-closure habitats feel it first. A station that cannot pay does not
  economise; it sheds people, and the shed order says which.
- `substrate_price_bite` fires on `priceAbove: {substrate: 112}`.

Play it out: **do nothing** and the index climbs to 112 by sitting 19, the event
fires, and Ashfield reaches 12,295 suspended. **Pass the bill** and the index
settles at 97, the event never fires, and Ashfield sits at 10,931.

Fourteen hundred people, attributable to one division. That is what consequence
means here — not a meter moving, but a named place with a different number in it
because of something you did twenty sittings ago.

Note also that **inaction is a decision**. The drift is upward by default.

### Authoring with prices

| | |
|---|---|
| effect `price` | `{price:{substrate:-26}}` — index points |
| condition `priceAbove` / `priceBelow` | `{priceAbove:{substrate:112}}` |

Put a `price` effect on any bill that changes what something costs, and gate
events on the result. A price effect without an event gated on it is a number
nobody sees; an event gated on a price nothing moves will never fire.

The panel shows a sparkline per price, so the player can see the shape of what
they did rather than only its current value.

---

## Coalition capital, order-paper time, and the whip

Three mechanics, one loop. Loyalty is how a partner **feels** about you — slow,
driven by policy alignment, decides whether they rebel. Capital is what you
**owe or are owed** — fast, transactional, decides whether they do you a favour
they don't want to do. A partner can dislike you and still owe you.

### The ledger

`st.capital` is one signed number per partner. Positive means they owe you;
negative means you owe them. **Nothing decays and nothing is forgiven.** It is
shown exactly, because this game is for people who want the arithmetic.

### Where capital comes from

Time on the order paper. A session has a fixed number of slots
(`setup.slotsPerSession`, currently 6) and every one you give a partner is one
you don't get. Granting a slot advances that bill one stage and, if a partner
owns it, puts them in your debt: **+2**, or **+3** if it's flagged `priority`.

Bills therefore carry `owner` and `priority`. Time is the right currency because
unlike money it cannot be topped up.

### Discipline

A bare `"for"` stance is a party *position*, not a guarantee of turnout. What it
actually delivers is `seats × (0.75 + 0.25 × loyalty/100)` — full loyalty
delivers everyone, no loyalty still delivers three quarters. **The gap between
position and delivery is exactly what the whip buys back.** An explicit
`{for: n}` is a stated count and is taken at face value, which is how the
divergence bill's forecast numbers stay fixed at 128 and 12.

### The whip

Before a division you can commit members. What you can move, and what it costs,
both depend on axis distance from the bill:

| alignment | movable | cost |
|---|---|---|
| broadly agrees (> +0.25) | 100% of the gap | 0.5 / seat |
| no strong view | 50% | 1.0 / seat |
| fundamentally opposed (< −0.25) | 15% | 2.5 / seat |

That table is what keeps the four axes load-bearing rather than decorative: you
cannot buy a party out of its own position, only out of its apathy.

Your **own** party costs `party_loyalty`, not capital — you don't owe yourself,
you spend internal discipline. Parties **outside the coalition cannot be
whipped at all**; moving those benches is lobbying, a different activity with a
different currency, and the panel says so.

Going into debt is allowed. Overdrawing costs that partner **2 loyalty per
capital point overdrawn**, because calling in credit you don't have is a favour
rather than a transaction.

Whipping is a plan until you divide. Nothing is charged until then, so it can be
revised or cleared.

**Always call `Engine.divide(st, C, billId)`** rather than sequencing it
yourself. The result must be computed while the plan is still attached, because
paying for it clears it — getting that order wrong is silent, and costs the
player capital for nothing.

### What it does not fix

The divergence bill's functional trap is untouched by all of this, deliberately.
The coalition holds 12 of 40 functional seats and needs 21; there is no headroom
to whip because every one of those 12 is already voting for it. The whip panel
says so in as many words. That is a structural problem with a political
solution, not a whipping problem.

### New verbs and conditions

| | |
|---|---|
| effect `capital` | `{capital:{psa:+3}}` — move a debt |
| effect `slots` | `{slots:{total:+1}}` or `{slots:{refill:true}}` |
| condition `capitalAbove` / `capitalBelow` | `{capitalAbove:{rv:0}}` |
| condition `slotsLeft` | `{slotsLeft:2}` |

---

## Functional constituencies

`content/functional.js` — the forty seats elected by profession and industry
rather than place. Bible §4.6.

`franchise` is the field that matters, because each type plays completely
differently:

| franchise | how a seat is won | example |
|---|---|---|
| `licensure` | individuals holding a professional licence | Life Support Engineering, 4,100 electors |
| `corporate` | companies vote, not employees | Elevator Consortiums, **62** electors |
| `union_bloc` | a union casts for its members | Maintenance and Trades, 214,000 |
| `residual` | everyone in no recognised sector | 3,910,000 electors, **one seat** |

Two of these are levers rather than flavour. A **licensure** seat has a
government-appointed board, so widening or narrowing the licence changes who
votes there by regulation, with no bill before the House. A **corporate** seat
is controlled by whoever controls the companies, and subsidiaries can be
incorporated to manufacture votes — which collides with personhood law the
moment instances count as persons.

`held` must reconcile with each party's `functional` count in `parties.js`. The
editor's validation panel errors if they drift, in both directions.

---

## Chapters and branching

Four routes exist for getting an event in front of the player. Understanding
which one you want is most of authoring.

### 1. Chapter

`chapter: 2` on an event means it cannot fire until the game is in chapter 2.
An event with **no** `chapter` is available in every chapter — useful for
recurring pressure events, dangerous for anything story-specific.

The game starts in chapter 1. Nothing advances automatically: a choice must
apply `{chapter: 2}`. That is deliberate — chapters turn on a decision, not on a
timer.

### 2. Prologue — the authored opening of a chapter

`prologue: 1`, `prologue: 2`… fire in order, one per sitting, at the head of
**their own chapter**. They skip any whose `when` fails. This is where you
control what the player meets first and in what order, which is how the
one-concept-cluster-per-event rule gets enforced in practice.

### 3. The weighted pool

Everything with neither `prologue` nor `queuedOnly`. Each sitting the engine
takes every event whose `chapter` matches and whose `when` passes, and fires the
highest `weight`. Ties break on id, so it is fully deterministic — same state,
same event, always. **Do not add randomness**; determinism is what makes balance
testable.

### 4. Queued

`queuedOnly: true` means unreachable except when a choice fires
`{queue:[{event:"…", after:3}]}`. This is how consequences land later. Always
mark follow-ups `queuedOnly`, or they fire before the thing they follow — the
linter will tell you.

### Threading it together with flags

A choice sets `{flag:"shed_order_promised"}`; later events gate on
`flags:["shed_order_promised"]` or `flagsAbsent:[…]`. That is the whole
branching mechanism. The **Branches** tab in the editor draws all four edge
types: chapter advances (blue, thick), queues (red), flag unlocks (green), flag
blocks (grey dashed).

### Worked example — adding chapter 3

1. In the editor, open the event that should end chapter 2. On every choice that
   should close the act, add the effect **Advance to chapter → 3**.
2. Write the opening: a new event with **Chapter 3**, **Prologue 1**. This fires
   the sitting after the advance.
3. Write the body of the chapter: events with **Chapter 3** and a weight,
   gated on whatever flags chapter 2 set.
4. Follow-ups get **Chapter 3** and **queued only**.
5. Check the validation panel. It errors if a chapter has events but nothing
   advances to it, and warns if a chapter has no openable events.

Chapter 2 in the shipped content is a worked example: `gb_approach` closes
chapter 1 on every branch, `ch2_open` is its prologue, `ch2_carveout_price`
gates on a flag set in chapter 1, and `ch2_psa_conference` is queued from a
choice inside it.

---

## The Concordance (encyclopedia)

An in-world reference work, not a manual. It is **a view over content that
already exists**: every party, station, bill, character and glossary term gets
an article generated from its own data, with seat counts, closure ratios and
division forecasts read live from state. A new party gets an article for free,
and no number in the encyclopedia can ever disagree with the game.

You only hand-write an article when you want prose the data cannot produce:
history, controversy, the argument about the thing.

Currently 7 hand-written, 56 generated.

### It is not neutral

The banners are the point. Bible §9.4 says ideologies should be refracted rather
than presented; a maintenance banner is refraction you can read at a glance.

| banner | says |
|---|---|
| `neutrality` | the article is disputed |
| `contested` | an active political fight, changing fast |
| `single` | relies largely on one source |
| `protected` | attested accounts of standing only |
| `stub` | nobody has wanted to write this |
| `cleanup` | below standard |
| `orphan` | few articles link here |

The article on the failed revolution of 2251 is a stub, disputed,
single-sourced, edited by an unattributed unattested account, and reverted nine
times this session. That tells the player more about the politics of memory
than three paragraphs of history would.

### Writing an article

```js
{ id:"the_permanent_emergency", title:"The permanent emergency",
  category:"Constitutional theory",
  banners:["neutrality","contested"],
  edited:{ by:"multiple", attested:true, note:"142 revisions this session" },
  summary:"One paragraph. Shown as the lede.",
  sections:[ { h:"The argument for", body:"…" },
             { h:"The argument against", body:"…" } ],
  see:["engineering_authority","shed_order","hul"] }
```

Links are `[[id]]` or `[[id|shown text]]`. A link to an id that does not exist
renders red, exactly as it should. Generated ids: parties and stations use their
own id (`cu`, `ashfield`), bills use `bill_<id>`, characters `person_<id>`,
glossary terms `term_<slug>` or the bare slug.

Run `node tools/cxcheck.js` to confirm every link, see-also and banner resolves.

### Editing it

The **Concordance** tab in the editor edits the hand-written articles: title,
category, banners, the edit record, summary, sections, and see-alsos. Generated
articles are not editable and should not be — they come from the data, which is
the point. To change what the article on a party says, change the party.

### Why it is exempt from the legibility lint

`tools/lint.js` governs prose the player is **forced** to read — events. The
Concordance is prose the player **pulls**. Different contract: an event may
introduce one concept cluster, an encyclopedia article may assume the reader
came looking. Do not let encyclopedia coverage become an excuse for dense
events; the lint still governs those.

---

## The editor

Open `editor.html`. Same government chrome, no server, no database.

It reads the same `content/*.js` files the game reads, edits them in memory, and
writes them back out in the same format. There is one source of truth and it is
the content files — the editor is a convenience over them, never a replacement.
`node tools/roundtrip.js` proves it: serialise everything, re-evaluate it, play
40 sittings, and confirm the trace, scalars and divisions are identical.

### Tabs

**Events** — id, title, speaker, weight or prologue position, once/queuedOnly,
image, body, and choices. Effects and conditions are **pickable, not typed**:
the dropdowns are built from `js/schema.js`, so you never have to remember the
verb vocabulary or which parties exist. Flag fields autocomplete from every flag
already used anywhere in the content.

**Bills** — a stance grid, one row per party, one column per bench. Change a
stance and the division forecast recomputes live underneath, using the real
engine. This is how you tune a bill to sit exactly on the knife edge.

**Concordance** — hand-written encyclopedia articles: banners, edit record,
sections, see-alsos.

**Functional** — the forty sector seats, with franchise-specific warnings and
live reconciliation against party seat counts.

**Stations** — includes an **archetype roll**. Pick an archetype and the editor
generates band, form, population, apportionment ratio, closure, suspended count,
attestation and seat count *together*. That matters: a low-closure industrial can
has a high suspended count and low attestation because those are one fact seen
three ways. Rolling them independently produces places that do not make sense.
Ten archetypes ship in `content/archetypes.js` and they are ordinary content —
edit the ranges, add your own.

**Parties · Characters · Glossary** — plain forms. You name the
constituencies, the parties, the currents, the people. Party seat totals sum as
you type; the chamber total and majority update in the validation panel.

**Branches** — the event graph. Three columns (prologue, weighted pool, queued
only) with edges for what queues what, what a flag unlocks, and what a flag
blocks. Click any node to jump to editing it.

### Validation

The right-hand panel runs continuously: duplicate ids, unknown verbs or
conditions, choices with no effects, events queueing something that doesn't
exist, events queued but not marked `queuedOnly`, glossary terms with no
introducing event, and the one-concept-cluster-per-event rule. Chamber
arithmetic is shown at the bottom so you notice immediately if seat edits have
broken the majority.

### Adding a new effect verb

1. Implement it in `EFFECTS` in `js/engine.js`.
2. Describe it in `effects` in `js/schema.js`.

The editor gains a form for it with no further work. That two-step is the whole
extension story, and it is why the vocabulary should stay small.

### Renaming an id

**Never edit an id in the text field.** Ids are referenced from a dozen places —
bill stances and owners, effect and condition keys, functional `held` blocks,
`party_leans`, setup arrays, Concordance links and see-alsos — and most of those
fail *silently*. A stance keyed to a party that no longer exists falls through to
axis inference and the division quietly comes out different.

Use **rename…** next to the Id field. It finds every reference, shows you the
count and the first dozen sites, and rewrites them together. `node
tools/renametest.js` proves it: rename all 54 entities, play 40 sittings, and
confirm the trace, scalars, ledger, loyalties and divisions are identical.

Strings that merely *look* like the id — a `material_interest` tag that shares a
word with a bill — are listed separately and never rewritten, because a tag
meaning "this sector cares about substrate insurance" is not a reference to the
bill of that name.

### Undo and filter

**Undo** snapshots before every new, duplicate, delete and rename. Forty deep.

**Filter** searches ids, names, and the whole serialised entry, so you can find
an event by a phrase in its body. Irrelevant at 11 events, essential at 200.

### What to do next

The third panel runs a coverage analysis over the actual content and returns
prioritised, actionable findings rather than metrics. It exists to catch one
failure in particular: **content clustering on crisis.** If every event fires
when an indicator is low and none fires when it is high, the player who manages
well finds the game goes quiet, and reads that as a bug.

It also tracks thin chapters, chapters with no opening, choices with no effects,
one-choice events, stations and parties that never appear, bills with no owner,
glossary terms never taught, and missing art. The verdict line at the top names
the current milestone — skeleton, one chapter, gaps, building.

### Drafts and the export trap

The editor holds everything in memory. A **draft is written to this browser**
every second or so, and offered back when you reopen the page, so a closed tab
no longer loses a session. **Discard draft & reload** throws it away and reloads
from disk.

But the draft is not the game. Only exported files reach it:

Edit → **Export all content files** → move them from **Downloads** into
`content/` → reload `index.html`.

The status bar shows **UNEXPORTED CHANGES** until you export, and the browser
warns before you close with unsaved work. Use **Preview file** to see exactly
what will be written. Keep `content/` in git and the exports diff cleanly.

### Images, without the command line

The **Images** tab processes any image into the game's palettes in the browser.
No ImageMagick, no terminal. Choose a kind, pick a file, see it in the palette,
download it, move it into the folder named on screen.

| kind | size | aspect | folder |
|---|---|---|---|
| Portrait | 160 | 4:5 | `img/portraits/` |
| Event plate | 640 | 12:5 | `img/events/` |
| Logo / mark | 64 | 1:1 | `img/logos/` |

Aspect and size are pinned because the CSS pins them too — an image that arrives
the wrong shape gets cropped again in the browser and you lose control of the
framing. The processor fill-crops rather than letterboxing or squashing.

**Two dithers, and the choice carries meaning.** *Ordered* (Bayer grid) reads as
machine output, which is right for a registry scan, an ID photo, or an emblem
from a state press. *Diffusion* (Floyd–Steinberg) reads as photographic, which is
right for a press or broadcast still. The tab defaults sensibly per kind and you
can override.

`tools/dither.sh` still exists and is better for batches. The tab is for one
image at a time, which is most of the time.

### Namelists

`content/names.js` holds pools for people, stations, consortiums, press titles
and bill titles. **Roll** buttons sit next to the name field on characters,
stations and bills.

Naming here is not neutral. Two centuries of habitation blended the founding
populations, so given and family names cross freely and a name says little about
origin — which is the point. What does carry information is the `family_earthborn`
list: **an unblended family name reads as Earth-born**, nobody says so out loud,
and everybody notices. That is §10.2's inverted nativism showing up in a name.

Station names split by era: the founding generation named habitats for people and
instruments (`station_founding`), the industrial expansion named them for what
they did (`station_industrial`). Rolling a station picks an era, so the roster
stays historically stratified without anyone tracking it.

```js
Names.person()                  // Adaeze Rasheed
Names.person({earthborn:true})  // Cosima Moreau
Names.station()                 // Wickstead Anchorage
Names.bill()                    // Shed Order (Registration) Bill
Names.roll("press")             // The Perigee Review
Names.setSeed(4711)             // deterministic — a rolled roster regenerates identically
```

## Making a division stop

A division is read out party by party in a modal dialog, and the bar can be
made to **stall at a named point** — the count halts, the segment turns red,
and the dialog says why. It fires from a flag and from nothing else; there is
no roll behind it, so a stall is always something the fiction chose:

```js
effects:[ { flag:"division_stalled" } ]
```

Set it and the next division pauses on the bell while the Clerk recounts the
functional bench. Clear it with `{unflag:"division_stalled"}` when the scene
that wanted it is over — nothing clears it for you, and a permanent stall is
just a slow game.

## Whose voice a block is in

Text arrives a character at a time, with a key-press sound pitched to the
**register** of whoever is speaking. The register comes from the speaker by
default — the press sounds like a press wire, the House sounds like a room,
the President makes no sound at all — so most blocks need nothing. Override it
on the block when the default is wrong:

```js
{ id:"...", speaker:"ceyhan", register:"broadcast", body:`...` }
```

`office` · `press` · `primer` · `broadcast` · `silent`. Use `silent` when the
text should land without a voice; it is a choice, not an absence.
