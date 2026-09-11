/* =============================================================
   FUNCTIONAL CONSTITUENCIES — 40 seats.

   Electorates are professions and industries rather than places.
   Bible 4.6: the founding compromise. The Charter's drafters needed
   the engineering guilds and the consortiums to accept civilian rule
   and paid with permanent seats. Explicitly transitional; the sunset
   clause has been extended four times.

   franchise decides how the seat is actually won, and each type plays
   completely differently:
     licensure   individuals holding a professional licence. The
                 government appoints the licensing board, so it can
                 widen or narrow the electorate by regulation, without
                 legislation. Bible 4.6.4 — the sharpest tool available.
     corporate   companies vote, not employees. Whoever controls the
                 company controls the seat. Electorates in the dozens.
     union_bloc  a union casts a bloc vote for its members.
     residual    everyone in no recognised sector: the unemployed, the
                 dependent, the suspended. Enormous, powerless,
                 grotesque. Bible 4.6.5 — the super-seat.

   held is the OPENING. At runtime the authority is the state's functional
   roll (st.functional), seeded from this and moved only by the `functional`
   effect, and each party's functional count is DERIVED from it. This held
   must still sum, across all sectors, to the party counts in parties.js;
   test.js checks both directions.

   electors — WHO IS ACTUALLY ON THE ROLL. Individual licence-holders,
   recognised unions casting for their membership, or registered
   companies, depending on franchise. The counts sum to `electorate`
   and test.js asserts it.

   gatekeeper — who decides admission to the roll. Most are appointed
   by the government, which is bible 4.6.4: the electorate can be
   widened or narrowed by regulation, without legislation, and that is
   the sharpest tool in the game. `appointed_by:"registry"` means the
   government cannot reach it directly, which is what makes those
   constituencies expensive to move.

   Seats here are contested by a MIXTURE: national partisan parties
   standing candidates, and professional bodies acting as political
   organisations in their own right. See parties.js `kind`.
   ============================================================= */

const FUNCTIONAL = [

  { id:"fc_lifesupport", name:"Life Support", seats:6,
    franchise:"licensure", electorate:4100,
    gatekeeper:{ board:"Life Support Licensing Board", appointed_by:"government" },
    electors:[
      { body:"Certifying Engineers, Institute of Life Support", count:1240 },
      { body:"Systems Engineers, Institute of Life Support", count:2860 } ],
    excluded:{ body:"Licensed Technicians", count:11000,
      note:"Admitting them would take the roll from 4,100 to 15,100 and swamp "+
           "the certifying grades. This is the board-packing lever in 4.6.4, "+
           "named: it is these eleven thousand people." }, board:"Life Support Licensing Board",
    held:{ gb:5, hul:1 },
    members:[ { party:"gb", name:"Kazuya Tanako" }, { party:"gb", name:"Sunniva Osei" },
              { party:"gb", name:"Torsten Kessel" }, { party:"gb", name:"Anneke Verhoeven" },
              { party:"gb", name:"Casimir Falk" }, { party:"hul", name:"Ruslan Enyeto" } ],
    interest:["integrity_standards","licensure_scope"],
    note:"The panel that justified the whole tier. Has not divided with a government on licensure since 2279." },

  { id:"fc_maintenance", name:"Maintenance and Trades", seats:7,
    franchise:"union_bloc", electorate:214000,
    gatekeeper:{ board:"Registry of Recognised Unions", appointed_by:"registry" },
    electors:[
      { body:"Maintenance Union", count:168000 },
      { body:"Pressure Fitters' Society", count:21400 },
      { body:"Hull Platers", count:15900 },
      { body:"Rotational Mechanics", count:8700 } ],
    note_franchise:"The executive casts, not the members. Two hundred and "+
      "fourteen thousand votes are decided in a room, which is why one party "+
      "holds all seven and why the union is a scandal surface rather than a "+
      "safe bloc.", board:null,
    held:{ cu:7 },
    members:[ { party:"cu", name:"Marit Thibault" }, { party:"cu", name:"Corin Rasheed" },
              { party:"cu", name:"Wren Cardew" }, { party:"cu", name:"Bax Drummond" },
              { party:"cu", name:"Osma Nkemelu" }, { party:"cu", name:"Taavi Lund" },
              { party:"cu", name:"Bright Stavros" } ],
    interest:["essential_services_law","shed_order_priority"],
    note:"The largest functional electorate by two orders of magnitude, and the reason the tier is not uniformly right-wing." },

  { id:"fc_substrate", name:"Substrate and Hosting", seats:4,
    franchise:"corporate", electorate:411,
    gatekeeper:{ board:"Corporate Registry", appointed_by:"registry",
                 test:"hosting capacity above the registration floor" },
    electors:[
      { body:"Major providers", count:9 },
      { body:"Mid-tier hosts", count:74 },
      { body:"Marginal and shell registrations", count:328 } ],
    note_franchise:"One company, one vote. Incorporation is cheap and the "+
      "capacity floor is the only defence, which is how six of them came to be "+
      "incorporated in the same week.", board:null,
    held:{ cl:2, psa:2 },
    members:[ { party:"cl", name:"Petra Quintana" }, { party:"cl", name:"Emeric Haruna" },
              { party:"psa", name:"Vesna Girard" }, { party:"psa", name:"Idris Ulanov" } ],
    interest:["substrate_ownership","thermal_quota"],
    note:"Four hundred and eleven registered corporate voters. Six of them were incorporated in the same week." },

  { id:"fc_consumables", name:"Consumables and Agriculture", seats:4,
    franchise:"licensure", electorate:8900,
    gatekeeper:{ board:"Agricultural Standards Board", appointed_by:"government" },
    electors:[
      { body:"Licensed deck cooperativists", count:6180 },
      { body:"Registered volume-holders", count:2720 } ],
    note_franchise:"Growers and the landlords of growing space, on one roll, "+
      "permanently. Neither can leave and neither can win outright.", board:"Agricultural Standards Board",
    held:{ cu:2, fh:2 },
    members:[ { party:"cu", name:"Selim Ashgrove" }, { party:"cu", name:"Thea Bellweather" },
              { party:"fh", name:"Aurel Xhosa" }, { party:"fh", name:"Mira Yarrow" } ],
    interest:["consumables_subsidy","volume_rationing"],
    note:"Deck cooperativists and volume owners, in the same electorate, permanently." },

  { id:"fc_transit", name:"Transit and Orbital Mechanics", seats:3,
    franchise:"licensure", electorate:3400,
    gatekeeper:{ board:"Transit Certification Board", appointed_by:"government" },
    electors:[
      { body:"Certified transfer pilots", count:1510 },
      { body:"Traffic controllers", count:1180 },
      { body:"Debris and conjunction analysts", count:710 } ], board:"Transit Certification Board",
    held:{ hul:2, cl:1 },
    members:[ { party:"hul", name:"Rasmus Zerbe" }, { party:"hul", name:"Ilse Pentreath" },
              { party:"cl", name:"Anouk Ijaz" } ],
    interest:["transit_windows","debris_remediation"],
    note:"Certifies every crewed transfer. Takes Kessler risk more seriously than the chamber does." },

  { id:"fc_elevator", name:"Tether and Anchorage", seats:4,
    franchise:"corporate", electorate:62,
    gatekeeper:{ board:"Consortium Register", appointed_by:"registry" },
    electors:[
      { body:"Anchor lessees", count:5 },
      { body:"Loop operators", count:23 },
      { body:"Tether service consortiums", count:34 } ],
    note_franchise:"Weighted by tether capacity share, not one body one vote. "+
      "Sixty-two voters and the largest balance sheet in the Commonwealth; a "+
      "flat franchise would understate them and everyone knows it.", board:null,
    held:{ cl:3, fh:1 },
    members:[ { party:"cl", name:"Lorcan Estévez" }, { party:"cl", name:"Ottilie Jekabs" },
              { party:"cl", name:"Dmitri Tokarev" }, { party:"fh", name:"Sena Reyes" } ],
    interest:["anchor_concession","tether_traffic"],
    note:"Sixty-two voters. The smallest electorate in the Commonwealth and the largest balance sheet." },

  { id:"fc_medicine", name:"Medicine and Embodiment", seats:3,
    franchise:"licensure", electorate:2700,
    gatekeeper:{ board:"Medical Licensing Board", appointed_by:"government" },
    electors:[
      { body:"Licensed physicians", count:1940 },
      { body:"Embodiment practitioners", count:480 },
      { body:"Restoration nursing register", count:280 } ], board:"Medical Licensing Board",
    held:{ rv:1, hul:2 },
    members:[ { party:"rv", name:"Nadia Abadi" }, { party:"hul", name:"Yusuf Achterberg" },
              { party:"hul", name:"Halle Kowalczyk" } ],
    interest:["bone_density_standards","embodiment_access"],
    note:"Where continuity-of-soul arguments arrive dressed as clinical guidance." },

  { id:"fc_attestation", name:"Attestation and Registry", seats:2,
    franchise:"licensure", electorate:890,
    gatekeeper:{ board:"Registry Practice Board", appointed_by:"registry" },
    electors:[
      { body:"Registrars", count:340 },
      { body:"Attestation officers", count:550 } ],
    note_franchise:"It administers the roll that decides who may vote anywhere, "+
      "and is returned by eight hundred and ninety people who admit each other. "+
      "The recursion is not an oversight; nobody has been able to propose a fix "+
      "that does not hand the roll to someone worse.", board:"Registry Practice Board",
    held:{ gb:2 },
    members:[ { party:"gb", name:"Edward Hatt" }, { party:"gb", name:"Imre Chatterjee" } ],
    interest:["attestation_enforcement","registry_powers"],
    note:"Administers the roll that decides who may vote, and is itself elected by a roll of 890." },

  { id:"fc_underwriting", name:"Insurance and Underwriting", seats:3,
    franchise:"corporate", electorate:140,
    gatekeeper:{ board:"Underwriters' Register", appointed_by:"registry" },
    electors:[
      { body:"Syndicates", count:46 },
      { body:"Mutuals", count:94 } ],
    note_franchise:"Weighted by book size.", board:null,
    held:{ fh:3 },
    members:[ { party:"fh", name:"Rane Rossi" }, { party:"fh", name:"Saskia Delacroix" },
              { party:"fh", name:"Osric Nakamura" } ],
    interest:["risk_pricing","substrate_insurance"],
    note:"Prices every risk in the Commonwealth and has accurate numbers on all of them." },

  { id:"fc_legal", name:"Legal", seats:3,
    franchise:"licensure", electorate:5200,
    gatekeeper:{ board:"Bar Admissions Board", appointed_by:"government" },
    electors:[
      { body:"Admitted advocates", count:3900 },
      { body:"Instance-law specialists", count:1300 } ], board:"Bar Admissions Board",
    held:{ gb:2, hul:1 },
    members:[ { party:"gb", name:"Sunniva Tanaka" }, { party:"gb", name:"Corin Wexler" },
              { party:"hul", name:"Nikolai Schneider" } ],
    interest:["reclassification_practice","charter_interpretation"],
    note:"Instance law is a branch of practice because the Charter's schedule of persons was drafted badly." },

  { id:"fc_residual", name:"Residual Constituency", seats:1,
    franchise:"residual", electorate:3910000,
    complement:true,
    gatekeeper:{ board:"none", appointed_by:"none",
                 test:"every adult on the roll enrolled in no other functional constituency" },
    note_franchise:"THE RESIDUAL IS THE COMPLEMENT OF THE OTHER TEN. Nobody "+
      "registers for it; you arrive by being excluded from everything else. "+
      "Narrow a licensed roll and the excluded fall in here, where three million "+
      "nine hundred thousand people return one member. Widen one and it shrinks. "+
      "Every board-packing decision moves people across this line, which is the "+
      "strongest argument against the government's own sharpest tool.", board:null,
    held:{ hul:1 },
    members:[ { party:"hul", name:"Perpetua Volkov" } ],
    interest:["consumables_floor","substrate_insurance"],
    note:"Everyone in no recognised sector: the unemployed, the dependent, the suspended. " +
         "Three million nine hundred thousand electors, one seat. Held, at present, by a Hullist." }

];
