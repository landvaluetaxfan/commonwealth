# Orbital — political thriller prototype

Extract over your existing folder, replacing files. No build step, no server.

## Run it

- **`index.html`** — the game.
- **`editor.html`** — the content editor.

Open either straight from disk. Content files are `.js` rather than `.json`
precisely so this works from `file://`, where `fetch()` is blocked.

## Checks

```
node test.js               chamber arithmetic + 40-sitting smoke test
node tools/lint.js         legibility: concept load, terms taught before use
node tools/cxcheck.js      encyclopedia links, see-alsos, banners
node tools/roundtrip.js    editor fidelity: serialise → reload → identical play
node tools/edtest.js       editor smoke test (needs: npm install jsdom)
node tools/renametest.js   renaming preserves behaviour exactly
node tools/bundle.js       one-file project snapshot for handing to a new chat
```

Run all four after any content change. They take about a second.

## Layout

```
index.html          the game
editor.html         the content editor
css/terminal.css    government chrome + Concordance + glossary
css/editor.css      editor chrome
js/engine.js        rules. Names no event, party or station.
js/ui.js            game rendering
js/encyclopedia.js  Concordance generator + renderer
js/schema.js        the content vocabulary, machine-readable
js/serialise.js     model → content files
js/editor.js        the editor
content/*.js        everything you author
img/portraits/      4:5, 160px, registry palette
img/events/         12:5, 640px, per-source palette
tools/dither.sh     image pipeline
tools/palettes/     four palettes; edit these to restyle every image at once
```

See `CONTENT_GUIDE.md` for how to add events, bills, stations, images and
encyclopedia articles.

## Starting a new chat about this project

Run `node tools/bundle.js`. It writes `orbital.bundle.md` — a digest plus every
content file verbatim. Upload that to the project knowledge base, replacing the
previous one. Any new chat then knows exactly what the content is, rather than
relying on what was in some earlier zip.
