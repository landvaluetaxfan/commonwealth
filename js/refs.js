/* =============================================================
   REFERENCES

   Ids are referenced from a dozen places, and most of those fail
   SILENTLY when the id changes: a stance keyed to a party that no
   longer exists simply falls through to axis inference, and the
   division quietly comes out different.

   So renaming is not a text edit. It is: find every reference,
   show the author what will change, then rewrite them together.

   Reference sites are enumerated explicitly rather than inferred
   from a deep walk. It is more code, but it is auditable, and it
   will not rename a coincidental string in prose.
   ============================================================= */

const Refs = (function () {
  "use strict";

  /* Each site is { path, kind, get, set } where get(M) yields
     { where, rename } for every hit. `where` is shown to the author. */

  function eachEffect(M, fn) {
    M.events.forEach(e => (e.choices || []).forEach((c, ci) =>
      [].concat(c.effects || []).forEach(eff =>
        fn(eff, `event ${e.id} · choice ${ci + 1}`))));
    M.bills.forEach(b => ["onPass", "onFail"].forEach(k =>
      [].concat(b[k] || []).forEach(eff => fn(eff, `bill ${b.id} · ${k}`))));
  }
  function eachCondition(M, fn) {
    M.events.forEach(e => { if (e.when) fn(e.when, `event ${e.id} · condition`); });
  }

  const renameKey = (obj, from, to) => {
    if (!obj || obj[from] === undefined) return false;
    const v = obj[from]; delete obj[from]; obj[to] = v; return true;
  };

  /* ---------- party ---------- */
  function partyRefs(M, id) {
    const hits = [];
    const H = (where, apply) => hits.push({ where, apply });

    M.bills.forEach(b => {
      if (b.stances && b.stances[id] !== undefined)
        H(`bill ${b.id} · stance`, to => renameKey(b.stances, id, to));
      if (b.owner === id) H(`bill ${b.id} · owner`, to => b.owner = to);
    });
    M.functional.forEach(f => {
      if (f.held && f.held[id] !== undefined)
        H(`functional ${f.id} · held`, to => renameKey(f.held, id, to));
    });
    M.stations.forEach(s => {
      if (s.party_leans && s.party_leans[id] !== undefined)
        H(`station ${s.id} · party_leans`, to => renameKey(s.party_leans, id, to));
    });
    M.currents.forEach(c => { if (c.party === id) H(`current ${c.id} · party`, to => c.party = to); });
    M.characters.forEach(c => { if (c.party === id) H(`character ${c.id} · party`, to => c.party = to); });

    const S = M.setup;
    if (S.playerParty === id) H("setup · playerParty", to => S.playerParty = to);
    (S.coalition || []).forEach((p, i) => { if (p === id) H("setup · coalition", to => S.coalition[i] = to); });
    (S.confidenceSupply || []).forEach((p, i) => { if (p === id) H("setup · confidence & supply", to => S.confidenceSupply[i] = to); });
    if (S.capital && S.capital[id] !== undefined) H("setup · opening ledger", to => renameKey(S.capital, id, to));

    eachEffect(M, (eff, where) => {
      ["loyalty", "capital", "seats"].forEach(v => {
        if (eff[v] && eff[v][id] !== undefined) H(`${where} · ${v}`, to => renameKey(eff[v], id, to));
      });
      if (eff.coalition) ["add", "remove"].forEach(k =>
        (eff.coalition[k] || []).forEach((p, i) => {
          if (p === id) H(`${where} · coalition ${k}`, to => eff.coalition[k][i] = to);
        }));
    });
    eachCondition(M, (w, where) => {
      ["loyaltyAbove", "loyaltyBelow", "capitalAbove", "capitalBelow"].forEach(k => {
        if (w[k] && w[k][id] !== undefined) H(`${where} · ${k}`, to => renameKey(w[k], id, to));
      });
    });
    prose(M, id, hits);
    return hits;
  }

  /* ---------- station ---------- */
  function stationRefs(M, id) {
    const hits = [];
    const H = (where, apply) => hits.push({ where, apply });
    eachEffect(M, (eff, where) => {
      if (eff.station && eff.station[id] !== undefined)
        H(`${where} · station`, to => renameKey(eff.station, id, to));
    });
    eachCondition(M, (w, where) => {
      if (w.stationBelow && w.stationBelow[id] !== undefined)
        H(`${where} · stationBelow`, to => renameKey(w.stationBelow, id, to));
    });
    prose(M, id, hits);
    return hits;
  }

  /* ---------- bill ---------- */
  function billRefs(M, id) {
    const hits = [];
    const H = (where, apply) => hits.push({ where, apply });
    eachEffect(M, (eff, where) => {
      if (eff.bill && eff.bill[id] !== undefined)
        H(`${where} · bill`, to => renameKey(eff.bill, id, to));
    });
    eachCondition(M, (w, where) => {
      if (w.billStage && w.billStage[id] !== undefined)
        H(`${where} · billStage`, to => renameKey(w.billStage, id, to));
    });
    prose(M, "bill_" + id, hits, "bill_");
    return hits;
  }

  /* ---------- event ---------- */
  function eventRefs(M, id) {
    const hits = [];
    const H = (where, apply) => hits.push({ where, apply });
    eachEffect(M, (eff, where) => {
      [].concat(eff.queue || []).forEach(q => {
        if (q.event === id) H(`${where} · queue`, to => q.event = to);
      });
    });
    M.glossary.forEach(g => {
      if (g.introduced === id) H(`glossary "${g.term}" · introduced`, to => g.introduced = to);
    });
    return hits;
  }

  /* ---------- character ---------- */
  function characterRefs(M, id) {
    const hits = [];
    const H = (where, apply) => hits.push({ where, apply });
    M.events.forEach(e => { if (e.speaker === id) H(`event ${e.id} · speaker`, to => e.speaker = to); });
    eachEffect(M, (eff, where) => {
      if (eff.relationship && eff.relationship[id] !== undefined)
        H(`${where} · relationship`, to => renameKey(eff.relationship, id, to));
    });
    if (M.setup.pm === id) H("setup · pm", to => M.setup.pm = to);
    if (M.setup.president && M.setup.president.id === id)
      H("setup · president", to => M.setup.president.id = to);
    prose(M, "person_" + id, hits, "person_");
    return hits;
  }

  /* ---------- current ---------- */
  function currentRefs(M, id) {
    const hits = [];
    const H = (where, apply) => hits.push({ where, apply });
    eachEffect(M, (eff, where) => {
      if (eff.loyalty && eff.loyalty[id] !== undefined)
        H(`${where} · loyalty`, to => renameKey(eff.loyalty, id, to));
    });
    eachCondition(M, (w, where) => {
      ["loyaltyAbove", "loyaltyBelow"].forEach(k => {
        if (w[k] && w[k][id] !== undefined) H(`${where} · ${k}`, to => renameKey(w[k], id, to));
      });
    });
    return hits;
  }

  /* ---------- Concordance prose and see-alsos ----------
     Articles link with [[id]] or [[id|shown text]], and generated
     articles answer to prefixed ids, so a bill is bill_<id>. */
  function prose(M, linkId, hits, prefix) {
    const H = (where, apply) => hits.push({ where, apply });
    const re = new RegExp("\\[\\[" + linkId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(\\||\\]\\])", "g");
    (M.encyclopedia.articles || []).forEach(a => {
      const bodies = [{ get: () => a.summary, set: v => a.summary = v, what: "summary" }]
        .concat((a.sections || []).map((s, i) =>
          ({ get: () => s.body, set: v => s.body = v, what: `section ${i + 1}` })));
      bodies.forEach(b => {
        const t = b.get() || "";
        const n = (t.match(re) || []).length;
        if (n) H(`article ${a.id} · ${b.what} (${n} link${n > 1 ? "s" : ""})`,
          to => b.set(b.get().replace(re, "[[" + (prefix || "") + to + "$1")));
      });
      (a.see || []).forEach((s, i) => {
        if (s === linkId) H(`article ${a.id} · see also`,
          to => a.see[i] = (prefix || "") + to);
      });
    });
  }

  const FINDERS = {
    parties: partyRefs, stations: stationRefs, bills: billRefs,
    events: eventRefs, characters: characterRefs, currents: currentRefs,
    functional: () => [], glossary: () => [], concordance: () => [],
    constituencies: (M, id) => {
      const hits = [];
      prose(M, id, hits);
      return hits;
    }
  };

  function find(M, kind, id) {
    const f = FINDERS[kind];
    return f ? f(M, id) : [];
  }

  /* Strings elsewhere in the model that merely LOOK like this id — usually a
     material_interest tag that happens to share a word with a bill. These are
     reported so the author can decide, and never rewritten: a tag meaning
     "this sector cares about substrate insurance" is not a reference to the
     bill of that name. */
  function loose(M, kind, id) {
    const out = [];
    M.stations.forEach(s => {
      if ((s.material_interest || []).includes(id)) out.push(`station ${s.id} · material_interest tag`);
    });
    (M.functional || []).forEach(f => {
      if ((f.interest || []).includes(id)) out.push(`functional ${f.id} · interest tag`);
    });
    return out;
  }

  /* Rename the entity itself plus every reference to it. */
  function rename(M, kind, from, to, entity) {
    const hits = find(M, kind, from);
    hits.forEach(h => h.apply(to));
    if (entity) { if (kind === "glossary") entity.term = to; else entity.id = to; }
    return hits.length;
  }

  return { find, loose, rename };
})();
