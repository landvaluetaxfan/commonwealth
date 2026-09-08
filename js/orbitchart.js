/* =============================================================
   ORBITAL CHART

   A chart, not a map. Orbits are dynamic and 3D; literal geography
   would be unreadable. Altitude bands on the vertical axis means the
   diagram is a stratification chart — higher orbit is different
   politics — so the map doubles as an infographic about class.

   FIVE VARIABLES PER MARK, each independent:
     vertical position   band        altitude, and therefore class
     glyph shape         form        what kind of habitat it physically is
     glyph size          population  log-scaled
     fill tint           closure     dependent (warm) to self-sufficient (cool)
     tick beneath        party       who holds it

   Fourteen stations, not eight hundred, so each mark can be large
   enough to read at a glance without zooming. That is the whole
   trade: a small frozen roster buys legibility.
   ============================================================= */

const OrbitChart = (function () {
  "use strict";

  const BANDS = [
    /* nudge: horizontal offset as a fraction of the band's own step. Every band
       gets a different one, so no two bands stack their habitats in the same
       column — otherwise tethers to different stations overlap and the chart
       reads as a grid rather than a set of orbits. */
    { id: "external", label: "Lagrange and lunar", sub: "external constituencies",   y: 52,  nudge: -0.24 },
    { id: "far",      label: "Far band",           sub: "100 000 km +",              y: 182, nudge:  0.12 },
    { id: "ring",     label: "Ring",               sub: "geostationary, 35 786 km",  y: 312, nudge: -0.10 },
    { id: "middle",   label: "Middle band",        sub: "8 000 – 35 785 km",         y: 442, nudge:  0.26 },
    { id: "low",      label: "Low band",           sub: "industrial, 400 – 8 000 km", y: 572, nudge:  0.04 }
  ];
  const W = 1280, H = 760, LEFT = 132, RIGHT = 1262, LANE = 98;

  /* SVG is XML: a bare & is a parse error, even where a browser forgives it. */
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* population → glyph radius, log scaled. 18k reads small, 1.9M reads large,
     and nothing disappears or swamps the lane. */
  function rad(pop) {
    const lo = Math.log(9000), hi = Math.log(2200000);
    const t = Math.max(0, Math.min(1, (Math.log(Math.max(pop, 1)) - lo) / (hi - lo)));
    return 6 + t * 13;
  }

  /* closure → fill. Low closure is dependent and precarious; high closure can
     credibly discuss leaving. Warm to cool, on the dark plate. */
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

  /* ---------- glyphs ---------- */
  function glyph(form, x, y, r, f, stroke) {
    const s = `fill="${f}" stroke="${stroke}" stroke-width="1.1"`;
    switch (form) {
      case "cylinder": {          /* O'Neill cylinder, long axis horizontal */
        const w = r * 2.3, h = r * 1.05;
        return `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}" ${s}/>` +
               `<line x1="${x - w / 2 + 3}" y1="${y}" x2="${x + w / 2 - 3}" y2="${y}" stroke="${stroke}" stroke-width=".7" opacity=".55"/>`;
      }
      case "torus":               /* ring habitat: annulus */
        return `<circle cx="${x}" cy="${y}" r="${r}" ${s}/>` +
               `<circle cx="${x}" cy="${y}" r="${r * 0.46}" fill="#12150f" stroke="${stroke}" stroke-width=".8"/>`;
      case "drum": {              /* squat cylinder, short axis */
        const w = r * 1.5, h = r * 1.75;
        return `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${w * 0.22}" ${s}/>` +
               `<line x1="${x - w / 2}" y1="${y - h / 4}" x2="${x + w / 2}" y2="${y - h / 4}" stroke="${stroke}" stroke-width=".7" opacity=".5"/>`;
      }
      case "sphere":
        return `<circle cx="${x}" cy="${y}" r="${r}" ${s}/>` +
               `<path d="M${x - r * 0.8} ${y - r * 0.3} A ${r} ${r * 0.4} 0 0 0 ${x + r * 0.8} ${y - r * 0.3}" fill="none" stroke="${stroke}" stroke-width=".7" opacity=".5"/>`;
      case "cluster": {           /* bundled settlements: several small cans */
        const n = 5, out = [];
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          const cx = x + Math.cos(a) * r * 0.62, cy = y + Math.sin(a) * r * 0.5;
          out.push(`<rect x="${cx - r * 0.30}" y="${cy - r * 0.24}" width="${r * 0.60}" height="${r * 0.48}" rx="${r * 0.2}" ${s}/>`);
        }
        return out.join("");
      }
      case "yard": {              /* construction yard: an open frame */
        const w = r * 2.0, h = r * 1.5;
        return `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" fill="none" stroke="${stroke}" stroke-width="1.3"/>` +
               `<line x1="${x - w / 2}" y1="${y - h / 2}" x2="${x + w / 2}" y2="${y + h / 2}" stroke="${f}" stroke-width="1.6"/>` +
               `<line x1="${x - w / 2}" y1="${y + h / 2}" x2="${x + w / 2}" y2="${y - h / 2}" stroke="${f}" stroke-width="1.6"/>`;
      }
      case "surface":             /* lunar surface settlement: a dome on a line */
        return `<path d="M${x - r} ${y + r * 0.5} A ${r} ${r} 0 0 1 ${x + r} ${y + r * 0.5} Z" ${s}/>` +
               `<line x1="${x - r * 1.35}" y1="${y + r * 0.5}" x2="${x + r * 1.35}" y2="${y + r * 0.5}" stroke="${stroke}" stroke-width="1.3"/>`;
      default:
        return `<circle cx="${x}" cy="${y}" r="${r}" ${s}/>`;
    }
  }

  /* ---------- layout ---------- */
  /* Bands are staggered horizontally, and a crowded band drops every other
     station onto a second row. Without the stagger every band puts its middle
     station at the same x, tethers to different habitats overlap, and the whole
     thing reads as a rigid grid rather than a diagram of orbits. Without the
     second row, thirty-three marks across five lanes collide.

     Stations are ordered largest-first within a band so the big marks anchor
     the lane and the small ones fill around them. */
  function layout(stations) {
    const out = {};
    BANDS.forEach(b => {
      const inBand = stations.filter(s => s.band === b.id)
        .sort((x, y) => y.population - x.population);
      const span = RIGHT - LEFT;
      const twoRow = inBand.length > 5;
      const perRow = twoRow ? Math.ceil(inBand.length / 2) : inBand.length;
      const step = span / (perRow + 1);
      const shift = (b.nudge || 0) * step;
      inBand.forEach((s, i) => {
        const row = twoRow ? (i % 2) : 0;
        const col = twoRow ? Math.floor(i / 2) : i;
        out[s.id] = {
          x: LEFT + step * (col + 1) + shift + (row ? step * 0.5 : 0),
          y: b.y + (row ? 46 : 0),
          s: s
        };
      });
    });
    return out;
  }

  function render(st, C, selectedId) {
    const stations = C.stations.map(s0 => st.stations[s0.id]);
    const pos = layout(stations);

    /* leading party per station, from baseline leans */
    const lead = {};
    C.stations.forEach(s => {
      const l = s.party_leans || {};
      lead[s.id] = Object.keys(l).sort((a, b) => l[b] - l[a])[0] || null;
    });

    const lanes = BANDS.map(b =>
      `<line class="gridln hard" x1="${LEFT - 8}" y1="${b.y + LANE}" x2="${RIGHT + 14}" y2="${b.y + LANE}"/>` +
      `<text class="bandlbl" x="12" y="${b.y - 2}">${esc(b.label)}</text>` +
      `<text class="stsub" x="12" y="${b.y + 10}">${esc(b.sub)}</text>`).join("");

    /* Earth, shallow so it frames rather than dominates */
    const EY = H - 52;
    const earth = `<path class="earthfill" d="M${LEFT - 90} ${H} A 900 112 0 0 1 ${RIGHT + 90} ${H} Z"/>` +
      `<text class="stsub" x="${W / 2}" y="${H - 8}" text-anchor="middle">EARTH — ANCHOR TERRITORY, FOREIGN SOVEREIGNTY</text>`;

    /* A tether is a line from the ground to the habitat it actually serves,
       so the mark carries which station depends on which anchor. */
    const TETHERS = [
      { to: "kepler",   label: "TETHER 2", leased: false },
      { to: "meridian", label: "TETHER 5", leased: false },
      { to: "sable",    label: "TETHER 9", leased: true }
    ];
    const tethers = TETHERS.map(t => {
      const p = pos[t.to]; if (!p) return "";
      const r = rad(p.s.population);
      return `<line class="tether${t.leased ? " leased" : ""}" x1="${p.x}" y1="${EY}" x2="${p.x}" y2="${p.y + r}"/>` +
        `<text class="stsub halo" x="${p.x + 5}" y="${EY - 8}">${esc(t.label)}${t.leased ? " (leased)" : ""}</text>`;
    }).join("");

    const loops =
      `<path class="loopln" fill="none" d="M180 ${EY + 6} q 80 -34 160 0"/>` +
      `<path class="loopln" fill="none" d="M880 ${EY + 8} q 80 -34 160 0"/>` +
      `<text class="stsub" x="210" y="${EY + 22}">LOOP A</text>` +
      `<text class="stsub" x="910" y="${EY + 24}">LOOP C</text>`;

    const marks = stations.map(s => {
      const p = pos[s.id]; if (!p) return "";
      const r = rad(s.population);
      const on = s.id === selectedId;
      const pc = lead[s.id] ? (C.partyById[lead[s.id]] || {}).colour : null;
      const tierFour = s.closure < 0.35;
      return `<g class="ost${on ? " on" : ""}" data-station="${s.id}" tabindex="0">
        ${on ? `<rect x="${p.x - r - 10}" y="${p.y - r - 10}" width="${(r + 10) * 2}" height="${(r + 10) * 2}" fill="none" stroke="#c9a227" stroke-width="1.2"/>` : ""}
        ${glyph(s.form, p.x, p.y, r, fill(s.closure), on ? "#e8ecdd" : "#aeb8a0")}
        ${pc ? `<rect x="${p.x - 9}" y="${p.y + r + 4}" width="18" height="2.6" fill="${pc}"/>` : ""}
        ${tierFour ? `<circle cx="${p.x + r + 5}" cy="${p.y - r - 2}" r="2.6" fill="#c07a5a"/>` : ""}
        <text class="stlbl halo" x="${p.x}" y="${p.y + r + 14}" text-anchor="middle">${esc(s.name)}</text>
        <text class="stsub halo" x="${p.x}" y="${p.y + r + 23}" text-anchor="middle">${s.seats}</text>
      </g>`;
    }).join("");

    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Orbital chart of habitats by altitude band">
      ${lanes}${earth}${tethers}${loops}${marks}</svg>`;
  }

  /* ---------- key ---------- */
  function key() {
    const forms = [["cylinder", "Cylinder"], ["torus", "Torus"], ["drum", "Drum"],
                   ["sphere", "Sphere"], ["cluster", "Bundled cans"], ["yard", "Yard"], ["surface", "Surface"]];
    const g = forms.map(([f, l]) =>
      `<span class="okey"><svg viewBox="0 0 34 26" width="34" height="26">${glyph(f, 17, 13, 9, "#93a184", "#c8c9c0")}</svg>${l}</span>`).join("");
    const sizes = [[20000, "20k"], [200000, "200k"], [1900000, "1.9M"]].map(([p, l]) =>
      `<span class="okey"><svg viewBox="0 0 46 46" width="30" height="30">${glyph("sphere", 23, 23, rad(p), "#6e7167", "#c8c9c0")}</svg>${l}</span>`).join("");
    const clos = [0.28, 0.5, 0.72, 0.9].map(c =>
      `<i style="background:${fill(c)}" title="closure ${c}"></i>`).join("");
    return `
      <div class="okeyrow"><b>Form</b>${g}</div>
      <div class="okeyrow"><b>Population</b>${sizes}</div>
      <div class="okeyrow"><b>Closure</b><span class="oramp">${clos}</span>
        <span class="okeyn">dependent &rarr; self-sufficient</span></div>
      <div class="okeyrow"><b>Marks</b>
        <span class="okey"><svg viewBox="0 0 22 10" width="22" height="10"><rect x="2" y="4" width="18" height="2.6" fill="var(--p-cu)"/></svg>leading party</span>
        <span class="okey"><svg viewBox="0 0 12 12" width="12" height="12"><circle cx="6" cy="6" r="2.6" fill="#c07a5a"/></svg>closure below 0.35</span>
        <span class="okey"><svg viewBox="0 0 30 10" width="30" height="10"><line x1="1" y1="5" x2="29" y2="5" stroke="#c9a227" stroke-width="1" stroke-dasharray="3 2"/></svg>tether</span>
        <span class="okey"><svg viewBox="0 0 30 10" width="30" height="10"><line x1="1" y1="5" x2="29" y2="5" stroke="#c9a227" stroke-width="1" stroke-dasharray="2 4"/></svg>leased</span>
      </div>
      <div class="okeyrow"><b>Label</b><span class="okeyn">name, then seats &middot; apportionment ratio</span></div>`;
  }

  return { render, key, rad, fill };
})();
