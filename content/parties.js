/* PARTIES — add a party by adding an object here. Nothing else needs to change.
   axes: ownership public|private  personhood expansionist|restrictionist
         sovereignty federal|station   closure closurist|integrationist
   Omit an axis (or use null) where the party has no settled position.
   aliases: press nicknames. Bible 8.3 — real parties are named for a value,
   an interest, a place or a founding event, almost never for their ideology.
   "Substrate Left" is what the papers call them; it is not their name. */

const PARTIES = [
  { id:"cu",  name:"Commons Union",                short:"CU",  colour:"var(--p-cu)",
    logo:"cu.png",
    seats:{district:48,list:25,functional:9}, loyalty:62,
    axes:{ownership:"public",personhood:"restrictionist",sovereignty:"federal",closure:null},
    note:"Old left. Embodied maintenance labour. The strike weapon." },

  { id:"cl",  name:"Consortium Liberals",          short:"CL",  colour:"var(--p-cl)",
    seats:{district:22,list:19,functional:6}, loyalty:20,
    axes:{ownership:"private",personhood:"expansionist",sovereignty:"federal",closure:"integrationist"},
    note:"Cosmopolitan market party. Elevator and shipping money." },

  { id:"psa", name:"Public Substrate Association", short:"PSA", colour:"var(--p-psa)",
    aliases:["Substrate Left"],
    seats:{district:6,list:28,functional:2}, loyalty:41,
    axes:{ownership:"public",personhood:"expansionist",sovereignty:"federal",closure:"integrationist"},
    note:"List-tier strength, almost no districts. Shares your economics, despises your personhood line." },

  { id:"sc",  name:"Station Compact",              short:"SC",  colour:"var(--p-sc)",
    seats:{district:26,list:8,functional:0}, loyalty:35,
    axes:{ownership:null,personhood:null,sovereignty:"station",closure:"closurist"},
    note:"Confederalist. Cannot whip its own members." },

  { id:"hul", name:"Hullists",                     short:"HUL", colour:"var(--p-hul)",
    seats:{district:9,list:6,functional:7}, loyalty:15,
    axes:{ownership:null,personhood:"restrictionist",sovereignty:null,closure:"closurist"},
    note:"Habitat as lifeboat. Engineering authority supreme." },

  { id:"rv",  name:"Root & Vessel",                short:"R&V", colour:"var(--p-rv)",
    seats:{district:12,list:5,functional:1}, loyalty:23,
    axes:{ownership:null,personhood:"restrictionist",sovereignty:null,closure:null},
    note:"Continuity of soul. A copy is not the person. Economically left, culturally immovable." },

  { id:"fh",  name:"Freeholders",                  short:"FH",  colour:"var(--p-fh)",
    seats:{district:8,list:3,functional:6}, loyalty:12,
    axes:{ownership:"private",personhood:"restrictionist",sovereignty:"station",closure:null},
    note:"Volume owners. Property absolutists." },

  { id:"gb",  name:"Guild Bench & independents",   short:"GB",  colour:"var(--p-gb)",
    aliases:["Guild Bench"],
    seats:{district:6,list:0,functional:9}, loyalty:30,
    axes:{ownership:null,personhood:"restrictionist",sovereignty:"federal",closure:"closurist"},
    note:"Exists only in the functional tier. Does not campaign. Cannot be voted out." },

  { id:"des", name:"Descensionists",               short:"DES", colour:"var(--p-des)",
    seats:{district:3,list:1,functional:0}, loyalty:18,
    axes:{ownership:null,personhood:"restrictionist",sovereignty:null,closure:null},
    note:"Gravity as birthright. Draws the physiologically excluded." },

  { id:"geo", name:"Georgists",                    short:"GEO", colour:"var(--p-geo)",
    seats:{district:0,list:3,functional:0}, loyalty:66,
    axes:{ownership:null,personhood:null,sovereignty:"federal",closure:null},
    note:"Volume tax. Land value tax. Nothing else. Correct." },

  { id:"upl", name:"Uplift Caucus",                short:"UPL", colour:"var(--p-upl)",
    seats:{district:0,list:2,functional:0}, loyalty:58,
    axes:{ownership:"public",personhood:"expansionist",sovereignty:null,closure:null},
    note:"Two seats. Permanently kingmaker-adjacent. Price is always the same thing." }
];

/* CURRENTS — factions inside a party. Same four axes; a current that
   drifts far enough simply becomes a party in the list above. */
const CURRENTS = [
  { id:"cu_maintenance", party:"cu", name:"Maintenance bloc",     members:31, loyalty:29,
    axes:{ownership:"public",personhood:"restrictionist",sovereignty:"federal",closure:"closurist"} },
  { id:"cu_loyalists",   party:"cu", name:"Leadership loyalists",  members:22, loyalty:88,
    axes:{ownership:"public",personhood:"restrictionist",sovereignty:"federal",closure:null} },
  { id:"cu_deck",        party:"cu", name:"Deck cooperativists",   members:18, loyalty:54,
    axes:{ownership:"public",personhood:"restrictionist",sovereignty:"station",closure:"closurist"} },
  { id:"cu_halloran",    party:"cu", name:"Halloran group",        members:11, loyalty:12,
    axes:{ownership:"public",personhood:"restrictionist",sovereignty:"federal",closure:"closurist"} }
];
