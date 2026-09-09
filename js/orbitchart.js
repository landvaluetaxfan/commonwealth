/* =============================================================
   ORBITAL CHART

   A chart, not a map. Orbits are dynamic and 3D; literal geography
   would be unreadable. Altitude on the vertical axis makes the
   diagram a stratification chart — higher orbit is different
   politics — so the map doubles as an infographic about class.

   WHY THIS IS A GRID AND NOT A SCATTER

   It used to be a scatter: marks placed in a lane, nudged sideways
   to stop them colliding, sorted largest-first so the big ones
   anchored the lane. That layout spent the chart's entire width on
   decoration. Horizontal position carried NO information, and the
   cost was paid in the only currency that mattered — with
   thirty-four stations across five lanes, the labels were too small
   to read, and adding a station made it worse.

   So the width now carries something. Within each band stations run
   left to right by CLOSURE: dependent on the left, self-sufficient
   on the right. That is the real political axis of the setting, it
   needs no collision avoidance, every name stays legible at any
   roster size, and a new station just extends its row.

   FOUR VARIABLES PER CHIP:
     row            band       altitude, and therefore class
     position in row closure   dependent (left) to self-sufficient (right)
     fill tint      closure    the same fact, readable without counting
     bar beneath    party      who leads it

   Form (torus, drum, yard) is deliberately NOT encoded here. It is
   flavour rather than politics, seven values will not survive being
   drawn at chip size, and it is one click away in the dossier. The
   glyph collapses the seven forms to four silhouettes that stay
   distinct at 13px.
   ============================================================= */

const OrbitChart = (function () {
  "use strict";

  const BANDS = [
    { id: "external", label: "Lagrange and lunar", sub: "external constituencies" },
    { id: "far",      label: "Far band",           sub: "100 000 km +" },
    { id: "ring",     label: "Ring",               sub: "geostationary, 35 786 km" },
    { id: "middle",   label: "Middle band",        sub: "8 000 – 35 785 km" },
    { id: "low",      label: "Low band",           sub: "industrial, 400 – 8 000 km" }
  ];

  /* Seven authored forms, four drawable silhouettes. The mapping is by
     what the habitat IS rather than by shape: a drum is a short cylinder,
     a yard is a cluster of works, a sphere in vacuum reads the same as a
     surface settlement at this size. */
  const SIL = { torus:"ring", cylinder:"can", drum:"can",
                cluster:"cluster", yard:"cluster", sphere:"point", surface:"point" };

  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  /* closure → fill. Low closure is dependent and precarious; high closure
     can credibly discuss leaving. Warm to cool. */
  function fill(c) {
    const stops = [[0.25, [176, 96, 68]], [0.5, [150, 128, 78]], [0.75, [122, 142, 96]], [1, [140, 168, 128]]];
    for (let i = 0; i < stops.length; i++) {
      if (c <= stops[i][0] || i === stops.length - 1) {
        const a = i ? stops[i - 1] : [0, [176, 96, 68]], b = stops[i];
        const t = b[0] === a[0] ? 0 : (c - a[0]) / (b[0] - a[0]);
        const m = a[1].map((v, k) => Math.round(v + (b[1][k] - v) * Math.max(0, Math.min(1, t))));
        return `rgb(${m.join(",")})`;
      }
    }
  }

  /* ---------- glyphs, 18x18 box, drawn to read at 13px ---------- */
  function glyph(form, f) {
    const sil = SIL[form] || "can";
    const s = `fill="${f}" stroke="#12150f" stroke-width="1"`;
    const body = {
      ring:    `<circle cx="9" cy="9" r="7" ${s}/><circle cx="9" cy="9" r="2.6" fill="#12150f"/>`,
      can:     `<rect x="1.5" y="5" width="15" height="8" rx="4" ${s}/>`,
      cluster: `<circle cx="6" cy="6.5" r="3.4" ${s}/><circle cx="12.6" cy="8" r="3" ${s}/>` +
               `<circle cx="8.5" cy="12.8" r="2.8" ${s}/>`,
      point:   `<circle cx="9" cy="9" r="5.4" ${s}/>`
    }[sil];
    return `<svg class="oglyph" viewBox="0 0 18 18" width="13" height="13" aria-hidden="true">${body}</svg>`;
  }

  /* ---------- render ---------- */
  /* HTML rather than SVG. The whole point of the change is that every
     station name stays readable, and text layout — wrapping, ellipsis,
     a row that reflows when the panel narrows — is what HTML is for.
     Laying it out by hand in SVG is how the labels got unreadable. */
  function render(st, C, selectedId) {
    const lead = {};
    C.stations.forEach(s => {
      const l = s.party_leans || {};
      lead[s.id] = Object.keys(l).sort((a, b) => l[b] - l[a])[0] || null;
    });

    const rows = BANDS.map(b => {
      const inBand = C.stations.map(s0 => st.stations[s0.id]).filter(Boolean)
        .filter(s => s.band === b.id)
        .sort((x, y) => x.closure - y.closure);   /* dependent first */
      if (!inBand.length) return "";
      const chips = inBand.map(s => {
        const pc = lead[s.id] ? (C.partyById[lead[s.id]] || {}).colour : null;
        const tierFour = s.closure < 0.35;
        return `<button type="button" class="ochip${s.id === selectedId ? " on" : ""}"` +
          ` data-station="${esc(s.id)}"` +
          ` title="${esc(s.name)} — closure ${s.closure.toFixed(2)}, ${s.seats} seat${s.seats === 1 ? "" : "s"}">` +
          glyph(s.form, fill(s.closure)) +
          `<span class="oname">${esc(s.name)}</span>` +
          `<span class="oseats">${s.seats}</span>` +
          (tierFour ? `<i class="otier" title="closure below 0.35"></i>` : "") +
          `<i class="obar" style="background:${pc || "transparent"}"></i>` +
        `</button>`;
      }).join("");
      return `<div class="oband">
        <div class="obandlbl"><b>${esc(b.label)}</b><i>${esc(b.sub)}</i></div>
        <div class="ochips">${chips}</div>
      </div>`;
    }).join("");

    return `<div class="obands">
      <div class="oaxis"><span>more dependent</span><i></i><span>more self-sufficient</span></div>
      ${rows}
      <div class="oearth">EARTH — ANCHOR TERRITORY, FOREIGN SOVEREIGNTY</div>
    </div>`;
  }

  /* ---------- key ---------- */
  function key() {
    const forms = [["torus", "Ring"], ["cylinder", "Cylinder or drum"],
                   ["cluster", "Bundled cans or yard"], ["surface", "Surface or sphere"]];
    const g = forms.map(([f, l]) =>
      `<span class="okey">${glyph(f, "#93a184")}${l}</span>`).join("");
    const clos = [0.28, 0.5, 0.72, 0.9].map(c =>
      `<i style="background:${fill(c)}" title="closure ${c}"></i>`).join("");
    return `
      <div class="okeyrow"><b>Form</b>${g}</div>
      <div class="okeyrow"><b>Closure</b><span class="oramp">${clos}</span>
        <span class="okeyn">fill, and left-to-right position within a band</span></div>
      <div class="okeyrow"><b>Marks</b>
        <span class="okey"><i class="obar demo" style="background:var(--p-cu)"></i>leading party</span>
        <span class="okey"><i class="otier demo"></i>closure below 0.35</span>
        <span class="okeyn">the number on a chip is the seats it returns</span></div>`;
  }

  return { render, key, fill, glyph, BANDS };
})();
