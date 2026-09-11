/* PARTIES — add a party by adding an object here. Nothing else needs to change.
   THE FIVE AXES — signed numbers from -1 to +1, so a party can be moderately
   anything and agreement is a distance rather than a match. This is what the
   whip table reads: you buy a party out of its apathy, never out of its
   position, and apathy is a matter of degree.

     economic     -1 left ............ +1 right
     authority    -1 democratic ...... +1 technocratic
     personhood   -1 restrictionist .. +1 expansionist
     sovereignty  -1 station ......... +1 federal
     trade        -1 closurist ....... +1 integrationist

   authority is new, and it exists because the old ownership axis was carrying
   two unrelated questions: who should own the utilities, and how far engineers
   should be deferred to. The Association of Engineers and Systems and the
   Alliance of Business and Government sit at the technocratic pole regardless
   of their economics, which is exactly the crosscutting the coalition maths
   needs.
   Omit an axis (or use null) where the party has no settled position.
   aliases: press nicknames. Bible 8.3 — real parties are named for a value,
   an interest, a place or a founding event, almost never for their ideology.
   "Substrate Left" is what the papers call them; it is not their name. */

const PARTIES = [
  { id:"cu",  name:"Party of Socialists and Democrats", short:"PSD", colour:"var(--p-cu)",
    logo:"cu.png",
    seats:{district:48,list:25,functional:9}, loyalty:62,
    axes:{economic:-0.75, authority:-0.4, personhood:-0.55, sovereignty:0.5, trade:-0.35},
    note:"Old left. Embodied maintenance labour. The strike weapon." },

  { id:"cl",  name:"Liberal Party",                short:"LIB", colour:"var(--p-cl)",
    logo:"cl.png",
    seats:{district:22,list:19,functional:6}, loyalty:20,
    axes:{economic:0.7, authority:-0.1, personhood:0.6, sovereignty:0.75, trade:0.9},
    note:"Cosmopolitan market party. Elevator and shipping money." },

  { id:"psa", name:"New Progressive Party",        short:"NPP", colour:"var(--p-psa)",
    aliases:["Substrate Left"],
    seats:{district:6,list:28,functional:2}, loyalty:41,
    axes:{economic:-0.8, authority:-0.3, personhood:0.85, sovereignty:0.6, trade:0.55},
    note:"List-tier strength, almost no districts. Shares your economics, despises your personhood line." },

  { id:"sc",  name:"Home Rule",                    short:"HR",  colour:"var(--p-sc)",
    seats:{district:26,list:8,functional:0}, loyalty:35,
    axes:{economic:-0.1, authority:-0.5, personhood:0.0, sovereignty:-0.9, trade:-0.75},
    note:"Confederalist. Cannot whip its own members." },

  { id:"hul", name:"Association of Engineers and Systems", short:"AES", colour:"var(--p-hul)",
    seats:{district:9,list:6,functional:7}, loyalty:15,
    axes:{economic:0.0, authority:0.95, personhood:-0.6, sovereignty:0.1, trade:-0.6},
    note:"Habitat as lifeboat. Engineering authority supreme." },

  { id:"rv",  name:"Democratic Centre",            short:"DEC", colour:"var(--p-rv)",
    seats:{district:12,list:5,functional:1}, loyalty:23,
    axes:{economic:-0.45, authority:-0.2, personhood:-0.9, sovereignty:0.0, trade:-0.1},
    note:"Continuity of soul. A copy is not the person. Economically left, culturally immovable." },

  { id:"fh",  name:"Party of Property Owners",     short:"PPO", colour:"var(--p-fh)",
    seats:{district:8,list:3,functional:6}, loyalty:12,
    axes:{economic:0.9, authority:-0.25, personhood:-0.4, sovereignty:-0.6, trade:0.3},
    note:"Volume owners. Property absolutists." },

  { id:"gb",  name:"Alliance of Business and Government", short:"ABG", colour:"var(--p-gb)",
    aliases:["Guild Bench"],
    seats:{district:0,list:0,functional:9}, loyalty:30,
    axes:{economic:0.15, authority:0.85, personhood:-0.5, sovereignty:0.4, trade:-0.4},
    note:"Exists only in the functional tier. Does not campaign. Cannot be voted out." },

  { id:"des", name:"One-G",                        short:"ONE", colour:"var(--p-des)",
    seats:{district:3,list:1,functional:0}, loyalty:18,
    axes:{economic:-0.2, authority:-0.15, personhood:-0.7, sovereignty:-0.3, trade:-0.2},
    note:"Gravity as birthright. Draws the physiologically excluded." },

  { id:"geo", name:"Single Tax Party",             short:"STP", colour:"var(--p-geo)",
    seats:{district:0,list:3,functional:0}, loyalty:66,
    axes:{economic:0.05, authority:0.2, personhood:0.1, sovereignty:0.7, trade:0.6},
    note:"Volume tax. Land value tax. Nothing else. Correct." },

  { id:"upl", name:"Common Kind",                  short:"CMK", colour:"var(--p-upl)",
    seats:{district:0,list:2,functional:0}, loyalty:58,
    axes:{economic:-0.6, authority:-0.35, personhood:0.95, sovereignty:0.3, trade:0.4},
    note:"Two seats. Permanently kingmaker-adjacent. Price is always the same thing." },

  { id:"ind", name:"Independents",                 short:"IND", colour:"var(--p-gb)",
    seats:{district:6,list:0,functional:0}, loyalty:50,
    axes:{},
    note:"District independents. No caucus position, no whip, no leader." }
];

/* CURRENTS — factions inside a party. Same five axes; a current that
   drifts far enough simply becomes a party in the list above. */
const CURRENTS = [
  { id:"cu_maintenance", party:"cu", name:"Maintenance bloc",     members:31, loyalty:29,
    axes:{economic:-0.85, authority:-0.35, personhood:-0.8, sovereignty:0.4, trade:-0.6} },
  { id:"cu_loyalists",   party:"cu", name:"Leadership loyalists",  members:22, loyalty:88,
    axes:{economic:-0.7, authority:-0.4, personhood:-0.4, sovereignty:0.55, trade:-0.25} },
  { id:"cu_deck",        party:"cu", name:"Deck cooperativists",   members:18, loyalty:54,
    axes:{economic:-0.7, authority:-0.55, personhood:-0.5, sovereignty:-0.4, trade:-0.85} },
  { id:"cu_halloran",    party:"cu", name:"Halloran group",        members:11, loyalty:12,
    axes:{economic:-0.9, authority:-0.5, personhood:-0.35, sovereignty:0.2, trade:-0.5} }
];
