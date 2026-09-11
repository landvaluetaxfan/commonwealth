# Ways & Means

*A Space Story About Politics and Governance.*

A text-based narrative political thriller with a real electoral simulation, set
in the Circumterrestrial Commonwealth — a federated republic of thirty-four
orbital habitats, population 7,006,000. You lead a party in a 280-seat House of
Delegates. Bills carry on a **dual majority**: they must pass among the elected
members *and* separately among the forty functional members, who are returned by
trade licence and corporate franchise rather than by place. Your majority is not
a majority. That is the trap the first chapter is built around.

---

## Run it

[Play in the browser](https://landvaluetaxfan.github.io/commonwealth/). Saves are
per browser, per slot. Or download the single inlined file from
[Releases](../../releases).

From a clone, open `index.html`. `file://` is supported, which is why content is
`.js` and not `.json`: `fetch()` is blocked on `file://` and `<script src>` is
not. No framework, no bundler, nothing to compile before playing. `npm run
build` is optional and only produces the single-file release.

| | |
|---|---|
| `index.html` | the game |
| `editor.html` | the content editor |
| `npm run build` | writes `dist/ways-and-means.html`, everything inlined |

GitHub Pages needs enabling once at **Settings → Pages → Source: GitHub
Actions**; the `pages` workflow deploys on every push to `main` after that.

## State

| | |
|---|---|
| Engine | Complete for chapters one and two: divisions, whipping against per-partner capital, statutory instruments with prayer windows, cabinet vacancies, scarcity prices, save migration. |
| Interface | Seven screens, keyboard-navigable, with a synthesised audio bus, text streaming and a tooltip layer. |
| Content | Placeholder. 12 events against canon that supports hundreds. |
| Canon | 1,881 lines in `bible.md`, plus `textbook.md`, an in-world primer. |

Canon describes 34 stations, 11 parties and 140 constituencies. Content reaches
a fraction of that. `js/coverage.js` reports what is unwritten from the content
itself.

## Rules

Read `CLAUDE.md`, then `bible.md`.

1. `js/engine.js` names no event, no party, no station. Content is data in
   `content/*.js`.
2. No randomness in event selection. Resolution is deterministic.
3. The station, person and glossary rosters are frozen lists (§2.7).
4. One concept cluster per event (§2.6). `tools/lint.js` enforces it.
5. Bump `STATE_VERSION` and add an ascending migration block when the state
   object changes shape.

Two agents split the repo per `AGENTS.md`: Claude Code takes `js/`, `tools/` and
tests; opencode takes `content/*.js` and prose.

## Checks

```
npm install      # once, for jsdom
npm run check    # all eight, about three seconds
```

| | |
|---|---|
| `test.js` | chamber arithmetic against the bible, tier reconciliation, instruments, save migration from every past version, 40-sitting smoke test |
| `tools/lint.js` | concept load per event, terms used before taught |
| `tools/cxcheck.js` | Concordance links, see-alsos, banners |
| `tools/roundtrip.js` | serialise → reload → identical play |
| `tools/renametest.js` | renaming an id preserves behaviour |
| `tools/edtest.js` | the editor boots and every tab works |
| `tools/uitest.js` | every screen renders, saves round-trip, focus and audio rules hold |
| `tools/toc.js --check` | the bible's section index is current |

Run them after any change.

## Layout

```
index.html            the game
editor.html           the content editor
bible.md              canon, out-of-world
textbook.md           canon, in-world
sweep-brief.md        the current build phase
CONTENT_GUIDE.md      how to author
content/*.js          everything authored
js/engine.js          rules. Names nothing concrete.
js/ui.js              game rendering
js/shell.js           menu, save slots, options, player preferences
js/focus.js           focus, selection and scroll across a re-render
js/tips.js            what the readouts mean
js/stream.js          text arriving a character at a time
js/wait.js            progress dialogs and the division
js/audio.js           the synthesised sound bus
js/orbitchart.js      the habitat schematic
js/encyclopedia.js    the Concordance
js/papers.js          instruments and the register
js/editor.js          the editor
js/schema.js          the content vocabulary, machine-readable
js/serialise.js       writing content files back out of the editor
js/refs.js            reference tracking for safe rename
js/coverage.js        what-to-do-next analysis
tools/                checks, build, index generator, image pipeline
```
