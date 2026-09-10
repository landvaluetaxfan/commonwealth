# Working on this repo

A text-based narrative political thriller with real electoral mechanics, set in a
federated republic of orbital habitats. No build step, no framework, no bundler.
Open `index.html` in a browser to play, `editor.html` to author.

## Finding things without reading everything

`bible.md` is ~1,700 lines and `textbook.md` ~750. Reading either in full to
answer one question is the most expensive habit available here.

- `bible.md` carries a generated section index at the top, with a line number
  per section. Read the index, then the range: `sed -n '274,296p' bible.md`.
  `npm run toc` rebuilds it; `npm run tocheck` (part of `npm run check`) fails
  if it has gone stale. Never hand-edit the index block.
- `node tools/toc.js --index textbook.md` prints the same thing for the
  textbook without touching the file. Its `## CONTENTS` is in-world prose
  written by Charnock and takes no line numbers.
- Section status is in the index: **LOCKED** is settled canon, **OPEN** is
  genuinely undecided, **LEANING** is a working answer that may move.

Where the answer lives, when it is not obvious:

| Question | Look in |
|---|---|
| what a rule *is* | `bible.md`, via the index |
| what a number *is* | `bible.md` §11 named canon, or the content file itself |
| how it *reads* in-world | `textbook.md` |
| which seats exist, who holds them | `content/constituencies.js` — the roll |
| what a station is | `content/stations.js` |
| what an effect verb does | `js/schema.js`, then `EFFECTS` in `js/engine.js` |
| what is being built now | `sweep-brief.md` |

## Before changing anything

Read the relevant sections of `bible.md`. It is canon and it is long. In
particular:

- **§2.7 generation drift** — the station roster, the person roster and the
  glossary are frozen lists. Do not invent a station, a character or a setting
  term. Add to canon deliberately, in the content files, not in passing.
- **§1.5 engine constraints** — six or seven orthogonal scalars, deterministic
  resolution. **Do not add randomness to event selection.** Determinism is what
  makes balance testable.
- **§2.6 explanation cost** — one concept cluster per event. `tools/lint.js`
  enforces it.

`textbook.md` is in-world and knows nothing about the game. Where it disagrees
with the bible on a number, the bible wins. Where it disagrees on tone, it wins.

## The one architectural rule

**`js/engine.js` names no event, no party, no station.** Content is data in
`content/*.js`, conforming to schemas the engine defines. If you find yourself
editing the engine to add content, stop — the thing you want is a new entry in a
content file, or rarely a new verb in `EFFECTS`/`CONDITIONS` plus a matching
entry in `js/schema.js` so the editor can author it.

Content is `.js` rather than `.json` on purpose: `fetch()` is blocked on
`file://`, `<script src>` is not, so the game opens from disk with no server.

## Run the checks

```
npm install      # once, for jsdom
npm run check    # all eight, about two seconds
```

| | |
|---|---|
| `test.js` | chamber arithmetic against the bible, tier reconciliation, instrument acceptance, 40-sitting smoke test |
| `tools/lint.js` | legibility: concept load per event, terms used before taught |
| `tools/cxcheck.js` | Concordance links, see-alsos, banners |
| `tools/roundtrip.js` | editor fidelity: serialise → reload → identical play |
| `tools/renametest.js` | renaming an id preserves behaviour exactly |
| `tools/edtest.js` | editor boots and every tab works |
| `tools/uitest.js` | menu into a running game, every screen renders, saves round-trip |
| `tools/toc.js --check` | the bible's section index is current |

**Run them after any content change.** They are the only playtester this project
has until a human one arrives.

## Layout

```
index.html            the game
editor.html           the content editor
bible.md              canon, out-of-world. Read this first.
textbook.md           canon, in-world. Charnock's primer.
sweep-brief.md        the current build phase
content/*.js          everything authored
js/engine.js          rules. Names nothing concrete.
js/ui.js              game rendering
js/editor.js          the editor
js/schema.js          the content vocabulary, machine-readable
js/refs.js            reference tracking for safe rename
js/coverage.js        what-to-do-next analysis
js/orbitchart.js      the habitat schematic
js/shell.js           main menu, save slots, options, player preferences
js/audio.js           the sound bus. Read its header before adding a cue.
tools/                checks, index generator, image pipeline, bundle
```

## Things that have already gone wrong

Kept here because they will otherwise happen again.

- A form function was referenced in the editor but never defined, and nothing
  caught it. `tools/edtest.js` exists because of that.
- `payWhips` clears the whip plan, and a caller computed the division *after*
  paying, so whipping cost capital and did nothing. Always use `Engine.divide()`.
- `apportionment_ratio` was stored alongside seats and population and the three
  silently diverged. It is now derived and never stored.
- The district tier summed to 56 while parties held 140 district seats. `test.js`
  now reconciles both directions.
- `STATE_VERSION` was left at 2 while a migration branch tested `< 3`, so saves
  never migrated. Bump the constant when you add a migration.
- Migration guards were written descending, so a v1 save matched `< 4`, was
  stamped 4, and skipped every earlier block. They are ascending now, one
  block per bump, and `test.js` walks a save forward from every version.
- Adding a station left older saves with a hole in `st.stations`; the orbital
  chart read `.band` off `undefined`, threw, and rendered a blank tab with no
  error a player could see. `Engine.reconcile()` now runs on every load and
  brings a save's station roster and district roll into line with content.
  Content owns identity (name, band, form, seats), the save owns simulation
  (closure, suspended, attested).
- A blank screen is invisible to every static check. `tools/uitest.js` asserts
  each screen actually put content on the page.
- `#s-orb.screen{display:block}` was written to make the orbit screen a
  full-height column. An id outranks `.screen{display:none}`, so the habitat
  map appeared on every tab at once and every static check still passed,
  because each screen was rendering its own content correctly. Any rule whose
  *subject* is a `#s-…` screen must include `.on`. `tools/uitest.js` reads the
  stylesheet as text and fails on one that does not.
- An inline `<svg>` with a viewBox and no `width` fills its container, so
  shrinking the coordinate space only magnifies the drawing. `drawChamber()`
  sets width and height in px; the CSS scales it down and never up.
- Setting `scrollbar-color` or `scrollbar-width` on an element makes Chromium
  ignore every `::-webkit-scrollbar` rule for it, silently, and hand back the
  default rounded overlay bar. The standard properties are fenced behind
  `@supports not selector(::-webkit-scrollbar)` so only Gecko sees them.
- `overflow-x:auto` forces `overflow-y` to `auto` as well. With real
  (non-overlay) scrollbars that reserved a 16px vertical bar down the side of
  the tab strip. Anything that scrolls in one axis says so in both.
- Player preferences go in `Shell.opts`, in localStorage; world state goes in
  the save. Mute in a save file silences somebody else's machine on import.
  `tools/uitest.js` asserts the audio preferences are in one and not the other.
- A CSS class named for an appearance gets borrowed for whatever wants that
  appearance. `.sel` was a pale tint, so it came to mean four things at once:
  the row you picked, a disloyal current, an instrument in force, and a vacant
  post. Restyling selection would have made three of those loud and wrong.
  `.sel` now means selection and only selection; `.warn`, `.inforce`,
  `.vacant` and the editor's `.here` say what they mean, and each differs from
  the others in form as well as hue. `tools/uitest.js` fails if a row carries
  `.sel` without being clickable, or if a fourth `"sel"` literal appears.

- Sound is triggered by engine effects and user actions ONLY. Nothing reachable
  from `drawAll()` may make a noise — a redraw happens on a tab switch, on a
  load and on a mirrored panel repainting, so a cue fired from a draw function
  fires four times for no reason. `tools/uitest.js` proves it by spying on
  `Sound.play` across a full redraw.

## Authoring

See `CONTENT_GUIDE.md`. The short version: copy an existing entry in
`content/events.js` and change it. Effects and conditions are a closed
vocabulary — if it grows past about twenty verbs, content is leaking into the
engine.
