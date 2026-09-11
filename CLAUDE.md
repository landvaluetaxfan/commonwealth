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
npm run check    # all nine, about three seconds
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
| `tools/uxtest.js` | focus, tips, audio, streaming, the division dialog |
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
js/focus.js           what survives a re-render: focus, selection, scroll.
                      The only selection store. Read its header first.
js/stream.js          text arriving a character at a time. Never called
                      from a renderer; see its header for why.
js/wait.js            the three ways the terminal says it is thinking.
js/tips.js            what the abbreviations mean. Explains the TERMINAL;
                      defers to the Concordance for the WORLD.
tools/harness.js      one jsdom, shared by uitest and uxtest
tools/                checks, index generator, image pipeline, bundle
```

## Things that have already gone wrong

One line each, kept because they will otherwise happen again. The long
version of any of them is in the header of the file it names.

**Content and state**

- `payWhips` clears the plan, so a caller that divided afterwards charged for
  nothing. Always use `Engine.divide()`.
- `apportionment_ratio` was stored beside seats and population and the three
  diverged. Derived, never stored.
- The district tier summed to 56 while parties held 140. `test.js` reconciles
  both directions.
- Bump `STATE_VERSION` when the state shape changes, and write the migration
  guard ASCENDING, one block per bump — a descending guard let a v1 save match
  `< 4`, get stamped 4, and skip every earlier block.
- Content owns identity (name, band, form, seats); the save owns simulation
  (closure, suspended, attested). `Engine.reconcile()` runs on every load
  because a new station used to leave older saves with a hole in `st.stations`.
- Player preferences go in `Shell.opts`; world state goes in the save. Mute in
  a save file silences somebody else's machine on import.
- `CONTENT.encyclopedia` is an object — `meta`, `banners`, `articles` — not a
  list.

**CSS and layout traps, every one found by measuring rather than reading**

- An id outranks `.screen{display:none}`, so `#s-orb.screen{display:block}` put
  the habitat map on every tab at once. Any rule whose subject is a `#s-…`
  screen must include `.on`.
- Setting `scrollbar-color` or `scrollbar-width` makes Chromium silently ignore
  every `::-webkit-scrollbar` rule for that element. The standard properties are
  fenced behind `@supports not selector(::-webkit-scrollbar)`.
- `overflow-x:auto` forces `overflow-y:auto` too. Anything that scrolls in one
  axis says so in both.
- An inline `<svg>` with a viewBox and no width fills its container, so
  shrinking the coordinate space only magnifies the drawing.
- A class named for an appearance gets borrowed for anything wanting that
  appearance: `.sel` came to mean four things at once. It now means selection
  only; `.warn`, `.inforce`, `.vacant` and the editor's `.here` say what they
  mean, and differ in form as well as hue.

**Interface**

- Renderers replace containers wholesale, so focus falls to `document.body` on
  every state change. `js/focus.js` restores it by DATA KEY, never by index, and
  owns the only selection store — selection used to live in four places and the
  order paper hardcoded its highlight as a result.
- `.focus()` scrolls its target into view and will undo a scroll restore
  standing next to it. Restore with `{preventScroll:true}`, scroll after, and
  `scrollIntoView` only on a move the player asked for.
- Two listeners for one action is not twice as safe: `[data-go]` was bound in
  both `js/ui.js` and `js/encyclopedia.js` and every click rendered twice,
  invisibly. A keyboard path reaches the existing handler (`el.click()`).
- Sound comes from engine effects and user actions ONLY — never from `drawAll()`
  or anything reachable from it. Streaming text obeys this too: the renderer
  puts the finished text up silently and the ACTION HANDLERS reveal it.
- A division resolves on the click, before its dialog opens. That is what makes
  skipping safe and "muted reaches the same state" testable.
- Blanking text to type it out collapses the block; measure and hold the height.
- `js/tips.js` explains the TERMINAL; the Concordance and glossary explain the
  WORLD, and a tip with no body falls through to them, so nothing restates canon
  (§2.7). `?` is the keyboard trade: annotated readouts enter the tab order on
  the visible screen only.
- There is NO ASSET LOADING and cannot easily be: on `file://`, `fetch()` and
  `XMLHttpRequest` both fail. Base64 in a `.js` file through `atob` into
  `decodeAudioData` is the route that works.

Every one of these is asserted somewhere in `npm run check`. Two of the checks
exist because of a specific miss: `tools/edtest.js` because a form function was
referenced in the editor and never defined, and `tools/uitest.js` because a
blank screen is invisible to every static check.

## Authoring

See `CONTENT_GUIDE.md`. The short version: copy an existing entry in
`content/events.js` and change it. Effects and conditions are a closed
vocabulary — if it grows past about twenty verbs, content is leaking into the
engine.
