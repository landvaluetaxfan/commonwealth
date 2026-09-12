# Ways & Means

*A Space Story About Politics and Governance.*

A text-based narrative political thriller with a real electoral simulation, set in the Circumterrestrial Commonwealth, which is a federated republic of thirty-four orbital habitats bound together by trade, shared infrastructure, and mutual dependence, population 7,006,000. You lead a party in a 280-seat House of Delegates. The Commonwealth has a near-post-scarcity economy, making manufactured goods abundant, while habitable volume, thermal capacity, substrate, and transportation remain tightly constrained—creating a high-value market in access to the infrastructure that sustains life. The result is a sophisticated rentier economy where private consortiums, public utilities, and federal institutions compete to manage the Commonwealth’s most vital resources. Navigate interparty relations, your governmental coalition, parliament, and foreign affairs to keep this sophisticated nation and economy running.

---

## Run it

Play it in the browser at (https://landvaluetaxfan.github.io/ways-and-means-game/). I might get my own domain eventually. Or download at releases once I get around to doing that. There might also be an itch.io page someday. Who knows.

From a clone, open `index.html`. `file://` is supported.

## Layout

```
index.html            the game
editor.html           useless content editor I don't use
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
tools/harness.js      one jsdom, shared by uitest and uxtest
tools/                checks, build, index generator, image pipeline
```
