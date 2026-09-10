# Ways & Means

*A Space Story About Politics and Governance.*

A text-based narrative political thriller with a real electoral simulation,
set in the Circumterrestrial Commonwealth — a federated republic of thirty-three
orbital habitats, population 6,863,000.

You lead a party in a 280-seat House of Delegates. Bills carry on a **dual
majority**: they must pass among the elected members *and* separately among the
forty functional members, who are returned by trade licence and corporate
franchise rather than by place. Your majority is not a majority. That is the
trap the first chapter is built around.

Resolution is deterministic. There is no dice roll anywhere in event selection
or in a division — which is what makes the balance testable, and what makes a
defeat something you can trace backwards.

## Play it

**[Play in your browser](https://landvaluetaxfan.github.io/commonwealth/)** —
no download, nothing to install. Saves live in that browser, per slot.

> First-time setup: Pages must be enabled once by hand at
> **Settings → Pages → Source: GitHub Actions**. The `pages` workflow deploys
> on every push to `main` after that.

Or **download the single file from [Releases](../../releases)** and open it
offline; it is the same build with everything inlined.

From a clone, open `index.html` directly — `file://` is a supported way to run
this, not a fallback. Content lives in `content/*.js` rather than `.json`
precisely because `fetch()` is blocked on `file://` and `<script src>` is not.

- **`index.html`** — the game
- **`editor.html`** — the content editor
- `npm run build` — writes `dist/ways-and-means.html`, everything inlined

## State of the build

| | |
|---|---|
| Engine | Complete for chapters one and two. Divisions, whipping with per-partner capital, statutory instruments with prayer windows, cabinet vacancies, scarcity prices, save migration. |
| Content | **Placeholder.** Twelve events against a canon that supports hundreds. Being rewritten. |
| Setting | 1,600 lines of locked canon in `bible.md`, plus an in-world primer. |

The engine is not the project; the content is. Canon describes thirty-three
stations and eleven parties, and events currently touch two stations and five
parties. `js/coverage.js` will tell you what to write next from the content
itself rather than from a checklist.

## Working on it

Read **`CLAUDE.md`** first, then `bible.md`. The short version:

1. **`js/engine.js` names no event, no party, no station.** Content is data.
   If adding content means editing the engine, the design has gone wrong.
2. **No randomness in event selection.** Determinism is the whole bargain.
3. **The rosters are frozen.** Do not invent a station or a character in passing.
4. **One concept cluster per event.** `tools/lint.js` enforces it.
5. **Bump `STATE_VERSION` and add an ascending migration block** when the state
   object changes shape.

Two agents work this repo on a split documented in `AGENTS.md`: **Claude Code**
takes `js/`, `tools/`, tests and structural work; **opencode** takes
`content/*.js` and prose.

## The checks

```
npm install      # once, for jsdom
npm run check    # all eight, about three seconds
```

| | |
|---|---|
| `test.js` | chamber arithmetic against the bible, tier reconciliation, instruments, save migration from every past version, labour reconciliation, 40-sitting smoke test |
| `tools/lint.js` | legibility: concept load per event, terms used before taught |
| `tools/cxcheck.js` | Concordance links, see-alsos, banners |
| `tools/roundtrip.js` | editor fidelity: serialise → reload → identical play |
| `tools/renametest.js` | renaming an id preserves behaviour exactly |
| `tools/edtest.js` | the editor boots and every tab works |
| `tools/uitest.js` | the menu, save slots, options, and glossary annotation |

Run them after any change. They are the only playtester this project has.

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
js/shell.js           main menu, save slots, options
js/editor.js          the editor
js/schema.js          the content vocabulary, machine-readable
js/coverage.js        what-to-do-next analysis
tools/                checks, build, image pipeline
```

See `CONTENT_GUIDE.md` to author. The short version: copy an entry in
`content/events.js` and change it.
