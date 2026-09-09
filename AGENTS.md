# AGENTS.md

Canonical instructions live in **`CLAUDE.md`** — read it before changing anything.
This file exists so agents that look for `AGENTS.md` (opencode and friends) still
get the non-negotiables. If the two ever disagree, `CLAUDE.md` wins.

> Previously this path was a symlink to `C:/Users/led19/Documents/orbital/CLAUDE.md`,
> an absolute Windows path that resolved on exactly one machine and was a dangling
> link everywhere else, CI included. Keep it a real file.

## Division of labour

This repo is worked by two agents with different remits. Stay in your lane; it is
the whole reason the engine/content split is enforceable.

| | |
|---|---|
| **Claude Code** | `js/*`, `tools/*`, `test.js`, schema and vocabulary changes, structural/UI work, anything touching `js/engine.js` |
| **opencode** | `content/*.js` — events, bills, characters, stations, encyclopedia, glossary. Prose. |

If a content change seems to need an engine change, stop and leave it for the
engine pass. If an engine change seems to need new prose, leave a TODO in the
brief rather than writing placeholder narrative.

## The non-negotiables

1. **`js/engine.js` names no event, no party, no station.** Content is data in
   `content/*.js`. Adding content by editing the engine is always wrong; the
   thing you want is a content entry, or rarely a new verb in `EFFECTS`/
   `CONDITIONS` plus a matching entry in `js/schema.js`.
2. **No randomness in event selection** (bible §1.5). Determinism is what makes
   balance testable. `Math.random` is confined to the editor's graph layout and
   the seeded name generator.
3. **The rosters are frozen** (bible §2.7). Do not invent a station, a character
   or a glossary term in passing. Add to canon deliberately.
4. **One concept cluster per event** (bible §2.6). `tools/lint.js` enforces it.
5. **Bump `STATE_VERSION` and add an ascending migration block** whenever the
   shape of the state object changes. `test.js` walks every old version forward.
6. Content is `.js`, not `.json`, so the game opens from `file://` where
   `fetch()` is blocked. Do not "modernise" this into modules or a build step.

## Before you finish

```
npm install      # once, for jsdom
npm run check    # all six, about two seconds
```

All six must pass. They are the only playtester this project has.
