/* =============================================================
   NAMELISTS

   Pools for rolling names when you need one and do not care which.

   Naming in this setting is not neutral. Two centuries of orbital
   habitation blended the founding populations, so given names and
   family names cross freely and a person's name says little about
   their origin — which is itself the point. What *does* carry
   information:

     - Earth-born arrivals more often keep an unblended family name,
       and everyone notices. See bible 10.2, nativism inverted.
     - Emulations who forked before the schedule of persons was
       settled sometimes carry a numeric suffix in the registry that
       they do not use socially.
     - Station names divide sharply by era: the founding generation
       named habitats for people and instruments, the industrial
       expansion named them for what they did.

   Add a list by adding a key. `Names.roll("given")` returns one;
   `Names.person()` assembles a full name.
   ============================================================= */

const NAMELISTS = {

  /* ---- people ---- */
  given: [
    "Marit","Tarrin","Osric","Ivor","Sevi","Iren","Desta","Anneke","Kel","Noor",
    "Saskia","Rane","Yusuf","Petra","Imre","Ondine","Casimir","Thea","Bax","Ilse",
    "Rufus","Vesna","Adaeze","Corin","Halle","Emeric","Nadia","Torsten","Aurel","Mira",
    "Selim","Beatrix","Kiran","Lorcan","Anouk","Dmitri","Sena","Ferran","Wren","Osma",
    "Taavi","Bright","Cosima","Nikolai","Perpetua","Idris","Hale","Ottilie","Rasmus","Sunniva"
  ],

  family: [
    "Flash","Deshan","Halloran","Tenaya","Ceyhan","Ansar","Vellan","Okarie","Brakk","Sorrel","Nadeau",
    "Ivarsen","Mbeki","Ferreira","Kaunda","Lindqvist","Osei","Reyes","Tokarev","Vance","Abadi",
    "Charnock","Dulac","Enyeto","Fenwick","Girard","Haruna","Ijaz","Jekabs","Kessel","Lund",
    "Marchetti","Nkemelu","Ostrowski","Pentreath","Quist","Rasheed","Stavros","Thibault","Ulanov","Verhoeven",
    "Whitlam","Xhosa","Yarrow","Zerbe","Ashgrove","Bellweather","Cardew","Drummond","Estévez","Falk"
  ],

  /* Unblended family names read as Earth-born. Nobody says so out loud and
     everybody notices. */
  family_earthborn: [
    "Achterberg","Bianchi","Chatterjee","Delacroix","Eriksson","Fitzgerald","Goto","Hassan",
    "Ishikawa","Jankowski","Kowalczyk","Lindgren","Moreau","Nakamura","O'Rourke","Pereira",
    "Quintana","Rossi","Schneider","Tanaka","Uchida","Volkov","Wexler","Yamamoto"
  ],

  /* ---- stations ---- */
  /* The founding generation named habitats for people and instruments. */
  station_founding: [
    "Anselm","Meridian","Tsiolkovsky","Kepler","Perigee","Vantage","Calloway","Sable",
    "Hollis","Brenner","Achenar","Corvus","Delphine","Erasmus","Fournier","Grimaldi",
    "Hypatia","Isidore","Janszoon","Kirchhoff","Lagrange","Messier","Nasmyth","Oberth"
  ],
  /* The industrial expansion named them for what they did. */
  station_industrial: [
    "Ashfield","Drift","Slagworks","Coldharbour","Tallow","Ferrous","Cinder","Bellows",
    "Quarry","Reclaim","Sinter","Tannery","Wickstead","Bloomery","Cordage","Dredge"
  ],
  /* Suffixes. A can is a cheap pressurised cylinder and the word is a slight. */
  station_suffix: [
    "Ring","Spindle","Drum","Deck","Cans","Yards","High","Loop","Anchorage","Reach",
    "Hollows","Refuge","Stations","Works","Terrace","Warren"
  ],

  /* ---- organisations ---- */
  consortium: [
    "Anselm Elevator","Kepler Anchor","Tether Nine","Loop Combine","Vantage Thermal",
    "Sable Substrate","Perigee Fabrication","Meridian Transit","Cold Harbour Underwriting",
    "First Circumterrestrial","Halshaw Reclamation","Orbit Provident","Drum Line",
    "Bellweather Consumables","Tenmile Rejection","Standard Substrate"
  ],

  press: [
    "The Spindle","Ring Network","The Perigee Review","Low Band Notice","The Attested",
    "Deckside","The Quarterly Register","Freefall","The Common Watch","Sable Herald"
  ],

  /* ---- bills ---- */
  /* Real bill titles are a noun phrase, a parenthetical narrowing, and the word
     Bill. The parenthetical is where the politics hides. */
  bill_subject: [
    "Thermal Quota","Substrate Provision","Volume Standards","Consumables Floor",
    "Attestation","Continuity of Person","Shed Order","Licensing Boards","Apportionment",
    "Transit Windows","Anchor Concessions","Essential Services","Suspension","Census"
  ],
  bill_qualifier: [
    "Amendment","No. 2","Civilian Oversight","Uprating","Consolidation","Transitional Provisions",
    "Emergency Powers","Registration","Miscellaneous Provisions","Repeal","Extension",
    "Review","Sunset"
  ]
};

/* Rolling. Deterministic if you pass a seed, so a generated roster can be
   regenerated identically. */
const Names = (function () {
  "use strict";
  let seed = null;
  function rnd() {
    if (seed === null) return Math.random();
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }
  function setSeed(n) { seed = n == null ? null : (n | 0); }
  function roll(list) {
    const a = NAMELISTS[list];
    if (!a || !a.length) return "";
    return a[Math.floor(rnd() * a.length)];
  }
  function person(opts) {
    opts = opts || {};
    const fam = opts.earthborn ? "family_earthborn" : "family";
    return roll("given") + " " + roll(fam);
  }
  function station(opts) {
    const era = (opts && opts.era) || (rnd() < 0.5 ? "station_founding" : "station_industrial");
    return roll(era) + " " + roll("station_suffix");
  }
  function bill() {
    return roll("bill_subject") + " (" + roll("bill_qualifier") + ") Bill";
  }
  function lists() { return Object.keys(NAMELISTS); }
  return { roll, person, station, bill, lists, setSeed };
})();
if (typeof module !== "undefined") module.exports = { NAMELISTS, Names };
