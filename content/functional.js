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

   held must sum, across all sectors, to each party's `functional`
   seat count in parties.js. tools/lint.js checks this.
   ============================================================= */

const FUNCTIONAL = [

  { id:"fc_lifesupport", name:"Life Support Engineering", seats:6,
    franchise:"licensure", electorate:4100, board:"Life Support Licensing Board",
    held:{ gb:5, hul:1 },
    interest:["integrity_standards","licensure_scope"],
    note:"The panel that justified the whole tier. Has not divided with a government on licensure since 2279." },

  { id:"fc_maintenance", name:"Maintenance and Trades", seats:7,
    franchise:"union_bloc", electorate:214000, board:null,
    held:{ cu:7 },
    interest:["essential_services_law","shed_order_priority"],
    note:"The largest functional electorate by two orders of magnitude, and the reason the tier is not uniformly right-wing." },

  { id:"fc_substrate", name:"Substrate Providers", seats:4,
    franchise:"corporate", electorate:411, board:null,
    held:{ cl:2, psa:2 },
    interest:["substrate_ownership","thermal_quota"],
    note:"Four hundred and eleven registered corporate voters. Six of them were incorporated in the same week." },

  { id:"fc_consumables", name:"Consumables and Agriculture", seats:4,
    franchise:"licensure", electorate:8900, board:"Agricultural Standards Board",
    held:{ cu:2, fh:2 },
    interest:["consumables_subsidy","volume_rationing"],
    note:"Deck cooperativists and volume owners, in the same electorate, permanently." },

  { id:"fc_transit", name:"Transit and Orbital Mechanics", seats:3,
    franchise:"licensure", electorate:3400, board:"Transit Certification Board",
    held:{ hul:2, cl:1 },
    interest:["transit_windows","debris_remediation"],
    note:"Certifies every crewed transfer. Takes Kessler risk more seriously than the chamber does." },

  { id:"fc_elevator", name:"Elevator and Loop Consortiums", seats:4,
    franchise:"corporate", electorate:62, board:null,
    held:{ cl:3, fh:1 },
    interest:["anchor_concession","tether_traffic"],
    note:"Sixty-two voters. The smallest electorate in the Commonwealth and the largest balance sheet." },

  { id:"fc_medicine", name:"Physiological Medicine", seats:3,
    franchise:"licensure", electorate:2700, board:"Medical Licensing Board",
    held:{ rv:1, hul:2 },
    interest:["bone_density_standards","embodiment_access"],
    note:"Where continuity-of-soul arguments arrive dressed as clinical guidance." },

  { id:"fc_attestation", name:"Attestation and Registry", seats:2,
    franchise:"licensure", electorate:890, board:"Registry Practice Board",
    held:{ gb:2 },
    interest:["attestation_enforcement","registry_powers"],
    note:"Administers the roll that decides who may vote, and is itself elected by a roll of 890." },

  { id:"fc_underwriting", name:"Underwriting", seats:3,
    franchise:"corporate", electorate:140, board:null,
    held:{ fh:3 },
    interest:["risk_pricing","substrate_insurance"],
    note:"Prices every risk in the Commonwealth and has accurate numbers on all of them." },

  { id:"fc_legal", name:"Legal", seats:3,
    franchise:"licensure", electorate:5200, board:"Bar Admissions Board",
    held:{ gb:2, hul:1 },
    interest:["reclassification_practice","charter_interpretation"],
    note:"Instance law is a branch of practice because the Charter's schedule of persons was drafted badly." },

  { id:"fc_residual", name:"Residual Constituency", seats:1,
    franchise:"residual", electorate:3910000, board:null,
    held:{ hul:1 },
    interest:["consumables_floor","substrate_insurance"],
    note:"Everyone in no recognised sector: the unemployed, the dependent, the suspended. " +
         "Three million nine hundred thousand electors, one seat. Held, at present, by a Hullist." }

];
