# Working on this repo

A text-based narrative political thriller with real electoral mechanics, set in a
federated republic of orbital habitats. No build step, no framework, no bundler.
Open `index.html` in a browser to play, `editor.html` to author.

## Before changing anything

Read `bible.md`. It is canon and it is long. In particular:

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
npm run check    # all six, about two seconds
```

| | |
|---|---|
| `test.js` | chamber arithmetic against the bible, tier reconciliation, instrument acceptance, 40-sitting smoke test |
| `tools/lint.js` | legibility: concept load per event, terms used before taught |
| `tools/cxcheck.js` | Concordance links, see-alsos, banners |
| `tools/roundtrip.js` | editor fidelity: serialise → reload → identical play |
| `tools/renametest.js` | renaming an id preserves behaviour exactly |
| `tools/edtest.js` | editor boots and every tab works |

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
tools/                checks, image pipeline, bundle
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

## Authoring

Two routes.

**Direct.** Copy an existing entry in `content/events.js` and change it. See
`CONTENT_GUIDE.md`.

**Drafted.** Write markdown in `drafts/` using `AUTHORING_FORMAT.md`, then
convert it into content files. This is the route to use when Harper writes prose
by hand, and the one to use for blocking out a chapter as placeholders before
the writing exists.

Effects and conditions are a closed vocabulary — if it grows past about twenty
verbs, content is leaking into the engine.

**When converting a draft**, never invent what is missing. §2.7 forbids any pass
from adding a station, character or glossary term. If a draft references
something that does not exist, stop and report it.

## The five axes

Positions are signed numbers from −1 to +1, not categories, so a party can be
moderately anything and the whip table can price partial agreement.

| axis | −1 | +1 |
|---|---|---|
| economic | left | right |
| authority | democratic | technocratic |
| personhood | restrictionist | expansionist |
| sovereignty | station | federal |
| trade | closurist | integrationist |

`authority` exists because the old ownership axis carried two unrelated
questions. Hullists and the Guild Bench sit at the technocratic pole regardless
of their economics, which is the crosscutting the coalition maths needs.
