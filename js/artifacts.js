/* =============================================================
   ARTIFACTS — named image slots.

   NOT A MENU FEATURE, which is the only reason it is its own file.
   The same mechanism is meant to carry ministry marks on
   instruments in Papers, party emblems in the Chamber and station
   arms on the orbital chart, so a call site names a SLOT and never
   a path. Adding a picture is one line in content/artifacts.js.

   THE BOX IS RESERVED WHETHER OR NOT THERE IS A PICTURE IN IT.

     That is the whole design. A slot that collapses when empty
     means filling it shifts everything around it, which is exactly
     the failure this is supposed to prevent: artwork arrives
     months after the layout is settled and must not re-open the
     layout question. An empty slot is an invisible box of the
     declared size; a filled one is the same box with an image in
     it. Nothing moves either way, and tools/uxtest.js proves it by
     measuring the page with each slot toggled in turn.

   SHAPES AND PALETTES ARE FROM BIBLE 12.11, not invented here. The
   palette is carried so the pipeline command can be derived from
   the slot rather than remembered: the palette says who rendered
   the picture before the caption does, so getting it wrong is a
   continuity error and not a styling one.

   NO CHROME. A slot image is an in-world artifact under 12.2, so
   it takes no bevel, no border and no panel styling. It is a thing
   that exists in the Commonwealth, not a part of the terminal.
   ============================================================= */
const Artifacts = (function () {
  "use strict";

  /* slot -> declared shape. `aspect` is width:height; `tile` marks a
     field that repeats rather than a picture with a frame. */
  const SLOTS = {
    crest:           { aspect: "1:1",  width: 128, palette: "registry" },
    department_mark: { aspect: "1:1",  width: 64,  palette: "registry" },
    notice_plate:    { aspect: "12:5", width: 640, palette: "registry" },
    backdrop:        { aspect: null,   width: 0,   palette: "registry", tile: true }
  };

  const DIR = "img/artifacts/";

  function manifest() {
    return typeof ARTIFACTS !== "undefined" && ARTIFACTS ? ARTIFACTS : {};
  }
  function file(name) {
    const f = manifest()[name];
    return typeof f === "string" && f ? f : null;
  }
  function spec(name) { return SLOTS[name] || null; }
  function ratio(name) {
    const s = SLOTS[name];
    if (!s || !s.aspect) return null;
    const p = s.aspect.split(":");
    return (+p[0]) / (+p[1]);
  }

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* The markup is the same whether or not there is a file: a box with
     the declared aspect, and an <img> inside it only when there is one
     to put there. onerror empties the image rather than removing the
     box, because removing the box is the layout shift. */
  function render(name, extraClass) {
    const s = SLOTS[name];
    if (!s || s.tile) return "";
    const f = file(name);
    return `<span class="art art-${esc(name)}${extraClass ? " " + esc(extraClass) : ""}"` +
      ` data-art="${esc(name)}">` +
      (f ? `<img src="${DIR}${esc(f)}" alt="" onerror="this.remove()">` : "") +
      `</span>`;
  }

  /* A tiling field is a background rather than an element, so it is
     applied to a node instead of rendered into one. */
  function applyBackdrop(el) {
    if (!el) return false;
    const f = file("backdrop");
    el.style.backgroundImage = f ? `url("${DIR}${f}")` : "";
    return !!f;
  }

  /* Declared width and height in px, for the pipeline and the lint. */
  function size(name) {
    const s = SLOTS[name];
    if (!s || !s.width) return null;
    const r = ratio(name);
    return { w: s.width, h: r ? Math.round(s.width / r) : null };
  }

  return { render, applyBackdrop, spec, size, ratio, file,
           names: () => Object.keys(SLOTS), dir: DIR };
})();

if (typeof module !== "undefined") module.exports = Artifacts;
