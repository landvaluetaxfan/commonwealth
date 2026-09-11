/* =============================================================
   CONCORDANCE — generator and renderer.

   Hand-written articles live in content/encyclopedia.js. Everything
   else is GENERATED from the content that already exists, so a new
   party or station gets an article for free and no number in here
   can ever disagree with the game.

   Nothing in this file is game logic. It reads state; it never
   writes it.
   ============================================================= */

const Concordance = (function () {
  "use strict";

  let C, st, history = [];

  /* ---------- inline syntax: **emphasis** and [[id]] or [[id|shown text]] ---------- */
  function links(text) {
    return String(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
                       .replace(/\[\[([a-z0-9_]+)(?:\|([^\]]+))?\]\]/gi, (m, id, label) => {
      const a = byId[id];
      return a
        ? `<a class="cx-link" tabindex="0" data-go="${id}">${label || a.title}</a>`
        : `<a class="cx-link cx-red" tabindex="0" data-go="${id}" title="This article does not exist.">${label || id}</a>`;
    });
  }

  function paras(text) {
    return String(text).split(/\n\n+/).map(p => `<p>${links(p)}</p>`).join("");
  }

  /* ---------- generated articles ---------- */

  function partyArticle(p) {
    const seats = st.parties[p.id].seats;
    const total = Engine.partyTotal(st, p.id);
    const inGov = st.coalition.includes(p.id);
    const cs = st.confidenceSupply.includes(p.id);
    const axisLine = ["ownership", "personhood", "sovereignty", "closure"]
      .map(k => p.axes[k] ? k + ": " + p.axes[k] : null).filter(Boolean).join(" · ") || "no settled position";

    const currents = C.currents.filter(c => c.party === p.id);
    const sections = [
      { h: "Position", body:
        `Recorded position on the four axes of Commonwealth politics — ${axisLine}. ` +
        (p.note || "") },
      { h: "Representation", body:
        `${total} seats: ${seats.district} district, ${seats.list} list, ${seats.functional} functional. ` +
        (seats.district === 0 && seats.list > 0
          ? "The party holds no geographic constituency at all, a fact its opponents raise and it does not much dispute."
          : seats.functional > seats.district
          ? "The party holds more functional than district seats and does not contest most constituencies."
          : "") }
    ];
    if (inGov) sections.push({ h: "In government", body:
      `A party of the present coalition. Party discipline is recorded at ${st.parties[p.id].loyalty}.` });
    else if (cs) sections.push({ h: "Confidence and supply", body:
      `Sustains the present government without holding office. Discipline recorded at ${st.parties[p.id].loyalty}.` });
    if (currents.length) sections.push({ h: "Currents", body:
      currents.map(c => `${c.name} (${st.currents[c.id].members} members, discipline ${st.currents[c.id].loyalty}).`).join(" ") });

    return {
      id: p.id, title: p.name, category: "Parties", generated: true,
      banners: st.parties[p.id].loyalty < 25 && (inGov || cs) ? ["contested"] : [],
      edited: { by: "Concordance seat index", attested: true, note: "updated each division" },
      summary: `A party of the House of Delegates holding ${total} of ${Engine.chamberTotal(st)} seats.` +
               (p.aliases ? ` Known in the press as the ${p.aliases[0]}.` : ""),
      sections,
      infobox: { title: p.name, rows: [
        ["Seats", String(total)],
        ["District", String(seats.district)],
        ["List", String(seats.list)],
        ["Functional", String(seats.functional)],
        ["Status", inGov ? "Coalition" : cs ? "Confidence and supply" : "Opposition"]
      ]},
      see: currents.length ? [] : []
    };
  }

  function stationArticle(s0) {
    const s = st.stations[s0.id];
    const sections = [
      { h: "Representation", body:
        `Returns ${s.seats} members across ${(C.constituencies||[]).filter(k=>k.station===s.id).length} ` +
        `constituencies. ` +
        (s.type === "bundled"
          ? `The seat bundles ${s.settlements} settlements, which share a delegation and very little else.`
          : s.type === "external"
          ? "An external constituency. Returns late, and knows it."
          : "") },
      { h: "Closure", body:
        `Closure ratio ${s.closure.toFixed(2)}. ` +
        (s.closure < 0.4
          ? "Below the threshold at which a station can survive an interruption of federal consumables for a season."
          : s.closure > 0.8
          ? "High enough that the station's obligations to the union are a matter of choice rather than necessity."
          : "Within the band where the union holds.") +
        `\n\n${s.dependency}` },
      { h: "Grievance", body: s.grievance },
      { h: "Suspended population", body:
        `${s.suspended.toLocaleString()} residents are held in [[suspension]], counted for ` +
        `[[apportionment|apportionment]] and unable to vote. Attestation stands at ` +
        `${(s.attested * 100).toFixed(1)} per cent of the adult roll.` }
    ];
    return {
      id: s.id, title: s.name, category: "Stations", generated: true,
      banners: s.closure < 0.35 ? ["contested"] : [],
      edited: { by: "Census Bureau returns", attested: true, note: "" },
      summary: `A habitat of the ${s.band} band, population ${s.population.toLocaleString()}, ` +
               `returning ${s.seats} members.`,
      sections,
      infobox: { title: s.name, rows: [
        ["Band", s.band], ["Population", s.population.toLocaleString()],
        ["Seats", String(s.seats)],
        ["Constituencies", String((C.constituencies||[]).filter(k=>k.station===s.id).length)],
        ["Closure", s.closure.toFixed(2)],
        ["Suspended", s.suspended.toLocaleString()],
        ["Attested", (s.attested * 100).toFixed(1) + "%"]
      ]},
      see: ["suspension"]
    };
  }

  function billArticle(b) {
    const bs = st.bills[b.id], d = Engine.division(st, C, b.id);
    const sections = [{ h: "Provisions", body: b.summary }];
    if (b.effectNote) sections.push({ h: "Estimated effect", body: b.effectNote });
    sections.push({ h: "Division forecast", body:
      `Among elected members, ${d.popular.aye} of ${d.popular.total} against a requirement of ` +
      `${d.popular.need}. ` +
      (b.dualMajority
        ? `Among functional members, ${d.functional.aye} of ${d.functional.total} against a ` +
          `requirement of ${d.functional.need}. The measure is subject to the ` +
          `[[dual_majority|dual test]] and must carry separately on both benches.`
        : "The measure requires a simple majority of the House of Delegates.") +
      `\n\nOn present numbers the bill ${d.carries ? "carries" : "fails"}.` });
    return {
      id: "bill_" + b.id, title: b.title, category: "Legislation", generated: true,
      banners: bs.dead ? [] : ["contested"],
      edited: { by: "Order paper", attested: true, note: b.ref },
      summary: `A measure before the House of Delegates. Stage: ${String(bs.stage).replace(/_/g, " ")}.`,
      sections,
      infobox: { title: b.ref, rows: [
        ["Stage", String(bs.stage).replace(/_/g, " ")],
        ["Test", b.dualMajority ? "Dual majority" : "Simple majority"],
        ["Elected bench", d.popular.aye + " / " + d.popular.need],
        ["Functional bench", b.dualMajority ? d.functional.aye + " / " + d.functional.need : "n/a"],
        ["Forecast", d.carries ? "Carries" : "Fails"]
      ]},
      see: b.dualMajority ? ["dual_majority", "functional_constituency"] : []
    };
  }

  function termArticle(g) {
    return {
      id: "term_" + g.term.toLowerCase().replace(/\s+/g, "_"),
      title: g.term.charAt(0).toUpperCase() + g.term.slice(1),
      category: "Definitions", generated: true, banners: ["stub"],
      edited: { by: "unattributed", attested: true, note: "" },
      summary: g.gloss,
      sections: g.handle ? [{ h: "", body: g.handle }] : [],
      see: []
    };
  }

  function personArticle(ch) {
    const isPM = ch.id === st.pm;
    const sections = [];
    if (ch.note) sections.push({ h: "", body: ch.note });
    if (isPM) sections.push({ h: "Government", body:
      `Leads a government commanding ${Engine.confidence(st)} of ${Engine.chamberTotal(st)} ` +
      `seats against a majority of ${Engine.majority(st)}.` });
    return {
      id: "person_" + ch.id, title: ch.name, category: "Persons", generated: true,
      banners: isPM ? ["contested"] : [],
      edited: { by: "multiple", attested: true, note: isPM ? "elevated sourcing requirements apply" : "" },
      summary: ch.role + (ch.party ? `, ${(C.partyById[ch.party] || {}).name || ch.party}.` : "."),
      sections, see: ch.party ? [ch.party] : []
    };
  }

  /* ---------- assembly ---------- */

  let all = [], byId = {};

  function build() {
    const hand = ENCYCLOPEDIA.articles.map(a => Object.assign({ generated: false }, a));
    const handIds = new Set(hand.map(a => a.id));
    const gen = [];
    C.parties.forEach(p => { if (!handIds.has(p.id)) gen.push(partyArticle(p)); });
    C.stations.forEach(s => { if (!handIds.has(s.id)) gen.push(stationArticle(s)); });
    C.bills.forEach(b => { if (!handIds.has("bill_" + b.id)) gen.push(billArticle(b)); });
    C.characters.forEach(c => { if (!handIds.has("person_" + c.id)) gen.push(personArticle(c)); });
    (C.glossary || []).forEach(g => {
      const id = "term_" + g.term.toLowerCase().replace(/\s+/g, "_");
      if (!handIds.has(id) && !handIds.has(g.term.toLowerCase())) gen.push(termArticle(g));
    });
    all = hand.concat(gen);
    byId = all.reduce((m, a) => (m[a.id] = a, m), {});
    /* alias hand-written ids that generated ones also answer to */
    all.forEach(a => { if (a.id.startsWith("term_")) byId[a.id.slice(5)] = byId[a.id.slice(5)] || a; });
  }

  /* ---------- render ---------- */

  function render(state, content, articleId, push) {
    st = state; C = content; build();
    const a = byId[articleId] || byId.perigee_charter || all[0];
    if (push && history[history.length - 1] !== a.id) history.push(a.id);
    if (!history.length) history.push(a.id);
    const b = document.getElementById("cx-back");
    if (b) b.disabled = history.length < 2;
    drawNav(a);
    drawArticle(a);
  }

  function drawNav(current) {
    const cats = {};
    all.forEach(a => (cats[a.category] ||= []).push(a));
    const order = ["Institutions", "Constitutional theory", "Elections", "Legislation",
                   "Personhood", "Parties", "Stations", "Persons", "History", "Definitions"];
    const keys = Object.keys(cats).sort((x, y) => {
      const ix = order.indexOf(x), iy = order.indexOf(y);
      return (ix < 0 ? 99 : ix) - (iy < 0 ? 99 : iy);
    });
    document.getElementById("cx-nav").innerHTML = keys.map(k =>
      `<div class="cx-navcat">${k}</div>` +
      cats[k].sort((p, q) => p.title.localeCompare(q.title)).map(a =>
        `<a class="cx-navlink${a.id === current.id ? " on" : ""}" tabindex="0" data-go="${a.id}">${a.title}` +
        (a.generated ? "" : " <em>&sect;</em>") + `</a>`).join("")
    ).join("");
  }

  function drawArticle(a) {
    const banners = (a.banners || []).map(b => {
      const def = ENCYCLOPEDIA.banners[b]; if (!def) return "";
      return `<div class="cx-banner cx-${def.cls}">${def.text}</div>`;
    }).join("");

    const info = a.infobox ? `<aside class="cx-infobox"><h4>${a.infobox.title}</h4><table>` +
      a.infobox.rows.map(r => `<tr><th>${r[0]}</th><td>${links(r[1])}</td></tr>`).join("") +
      `</table></aside>` : "";

    const toc = (a.sections || []).filter(s => s.h).length > 1
      ? `<nav class="cx-toc"><b>Contents</b><ol>` +
        a.sections.filter(s => s.h).map((s, i) => `<li><a tabindex="0" data-anchor="cx-s${i}">${s.h}</a></li>`).join("") +
        `</ol></nav>` : "";

    const body = (a.sections || []).map((s, i) =>
      (s.h ? `<h3 id="cx-s${i}">${s.h}</h3>` : "") + paras(s.body)).join("");

    const see = (a.see || []).filter(id => byId[id]);
    const seeAlso = see.length
      ? `<h3>See also</h3><ul class="cx-see">${see.map(id =>
          `<li><a class="cx-link" tabindex="0" data-go="${id}">${byId[id].title}</a></li>`).join("")}</ul>` : "";

    const ed = a.edited || {};
    const foot = `<div class="cx-foot">` +
      `Last edited by <b>${ed.by || "unattributed"}</b> ` +
      `<span class="cx-att ${ed.attested === false ? "n" : "y"}">${ed.attested === false ? "UNATTESTED" : "ATTESTED"}</span>` +
      (ed.note ? ` &middot; ${ed.note}` : "") +
      `<br>${a.generated ? "This article is maintained automatically from Bureau returns." : "This article is maintained by contributors."}</div>`;

    document.getElementById("cx-article").innerHTML =
      `<h2 class="cx-title">${a.title}</h2>` +
      `<div class="cx-from">From the ${ENCYCLOPEDIA.meta.title}, ${ENCYCLOPEDIA.meta.tagline}</div>` +
      banners + info +
      `<div class="cx-lede">${paras(a.summary)}</div>` +
      toc + body + seeAlso + `<div style="clear:both"></div>` + foot;

    bind();
  }

  function bind() {
    /* [data-go] IS NOT BOUND HERE. It used to be, and js/ui.js also had a
       delegated capture listener for the same links, so one click ran the
       whole render twice - measured with a calibrated MutationObserver:
       two wholesale replacements of #cx-nav per click. Navigation belongs
       to the delegated handler in ui.js, which is also what the keyboard
       reaches through Focus. One path. */
    document.querySelectorAll("#cx-body [data-anchor]").forEach(n =>
      n.addEventListener("click", () => {
        const t = document.getElementById(n.dataset.anchor);
        if (t) t.scrollIntoView({ block: "start", behavior: "smooth" });
      }));
  }

  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) return null;
    const hit = all.find(a => a.title.toLowerCase() === q)
             || all.find(a => a.title.toLowerCase().startsWith(q))
             || all.find(a => a.title.toLowerCase().includes(q))
             || all.find(a => (a.summary || "").toLowerCase().includes(q));
    return hit ? hit.id : null;
  }

  function back() {
    if (history.length < 2) return null;
    history.pop();
    return history[history.length - 1];
  }

  return { render, search, back };
})();
