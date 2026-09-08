/* Assembles the content object the engine reads. Add a new content file
   above this one in index.html, then register it here. */
const CONTENT = (function () {
  const C = {
    setup: SETUP, parties: PARTIES, currents: CURRENTS,
    stations: STATIONS,
    constituencies: typeof CONSTITUENCIES !== "undefined" ? CONSTITUENCIES : [],
    cabinet: typeof CABINET !== "undefined" ? CABINET : [],
    instruments: typeof INSTRUMENTS !== "undefined" ? INSTRUMENTS : [],
    minutes: typeof MINUTES !== "undefined" ? MINUTES : [], characters: CHARACTERS, bills: BILLS, events: EVENTS, glossary: GLOSSARY, encyclopedia: ENCYCLOPEDIA,
    functional: typeof FUNCTIONAL !== "undefined" ? FUNCTIONAL : [],
    archetypes: typeof ARCHETYPES !== "undefined" ? ARCHETYPES : []
  };
  const idx = (arr) => arr.reduce((m, o) => (m[o.id] = o, m), {});
  C.partyById = idx(PARTIES);
  C.currentById = idx(CURRENTS);
  C.stationById = idx(STATIONS);
  C.instrumentById = (typeof INSTRUMENTS!=="undefined"?INSTRUMENTS:[]).reduce((m,x)=>(m[x.id]=x,m),{});
  C.cabinetById = (typeof CABINET!=="undefined"?CABINET:[]).reduce((m,x)=>(m[x.id]=x,m),{});
  C.constituencyById = (C.constituencies||[]).reduce((m,x)=>(m[x.id]=x,m),{});
  C.characterById = idx(CHARACTERS);
  C.billById = idx(BILLS);
  C.eventById = idx(EVENTS);
  C.functionalById = (C.functional||[]).reduce((m,f)=>(m[f.id]=f,m),{});
  C.glossaryByTerm = GLOSSARY.reduce((m,g)=>(m[g.term.toLowerCase()]=g,m),{});
  return C;
})();
if (typeof module !== "undefined") module.exports = CONTENT;
