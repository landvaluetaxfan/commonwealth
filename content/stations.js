/* =============================================================
   STATIONS — the frozen roster. 33 habitats across five bands.

   A station is a PLACE: a mark on the orbital chart with a form, a
   population and a closure ratio. A CONSTITUENCY is a thing that
   returns members, and lives in constituencies.js. Most stations
   return one; the largest are divided.

   THE ORBITAL CHART reads three fields per station and encodes each
   as a separate visual variable, so one mark carries three facts:
     band       vertical position   — altitude, and therefore class
     form       glyph shape         — what kind of habitat it is
     population glyph size          — log-scaled
   Closure tints the fill and the leading party marks a tick beneath.

   seats: total district seats, equal to the sum of this station's
   constituencies' magnitudes. tools/test.js checks this both ways.

   apportionment_ratio is NOT here. It is derived per constituency by
   Engine.apportionment() from magnitude and electorate, because
   storing it beside seats and population let the three drift apart —
   Ashfield was once recorded at 1.88 while its actual seats-per-head
   matched Anselm's 0.88.

   composition: share of adults by legal category. Commonwealth-wide
   the split is biological 0.64, emulation 0.28, uplift 0.04,
   synthetic 0.04.

   THE TWO SCARCITIES RUN IN OPPOSITE DIRECTIONS ACROSS THE ROSTER,
   and that is what sets composition:

     Volume is positional. Anselm Ring volume is astronomical because
     everybody wants to be there; Ashfield volume is nearly free
     because nobody does.

     Thermal rejection is geometric. A habitat in low orbit sheds heat
     while sitting in Earth's infrared glare; far-band and Lagrange
     habitats have far better geometry, so substrate is cheap there.

   So the low band is embodied (cheap volume, dear substrate) and the
   far band and Lagrange are emulation-heavy. People are priced out of
   their bodies on GOOD stations, not poor ones.

   form: cylinder | torus | drum | sphere | cluster | yard | surface
   ============================================================= */

const STATIONS = [

  { id:"anselm", name:"Anselm Ring", band:"ring", type:"single", form:"cylinder",
    seats:40, population:1940000,
    closure:0.79, suspended:2100, attested:0.94,
    composition:{biological:0.61,emulation:0.31,uplift:0.04,synthetic:0.04},
    material_interest:["tether_traffic", "volume_rationing"],
    dependency:"Nothing it cannot buy.",
    grievance:"That everyone else resents it." },

  { id:"meridian", name:"Meridian Spindle", band:"ring", type:"single", form:"cylinder",
    seats:16, population:682000,
    closure:0.71, suspended:2110, attested:0.91,
    composition:{biological:0.63,emulation:0.29,uplift:0.04,synthetic:0.04},
    material_interest:["tether_traffic", "substrate_supply"],
    dependency:"Tether 5 traffic rights it does not own.",
    grievance:"Anselm sets the schedule." },

  { id:"corvus", name:"Corvus Ring", band:"ring", type:"single", form:"torus",
    seats:6, population:293000,
    closure:0.68, suspended:1930, attested:0.89,
    composition:{biological:0.6,emulation:0.32,uplift:0.04,synthetic:0.04},
    material_interest:["tether_traffic", "volume_rationing"],
    dependency:"Berth allocation at the Anselm locks.",
    grievance:"Being the second city of a federation that only counts to one." },

  { id:"sable", name:"Sable Drum", band:"ring", type:"single", form:"drum",
    seats:6, population:315000,
    closure:0.66, suspended:1800, attested:0.88,
    composition:{biological:0.66,emulation:0.26,uplift:0.05,synthetic:0.03},
    material_interest:["tether_traffic", "consumables_subsidy"],
    dependency:"Tether 9, which is leased rather than owned.",
    grievance:"The lease terms, signed when the station was smaller and worse advised." },

  { id:"halvard", name:"Halvard Terrace", band:"ring", type:"single", form:"torus",
    seats:3, population:153000,
    closure:0.72, suspended:550, attested:0.93,
    composition:{biological:0.71,emulation:0.21,uplift:0.05,synthetic:0.03},
    material_interest:["volume_rationing", "tether_traffic"],
    dependency:"Nothing. It rents to those who do.",
    grievance:"Every proposal to tax volume by position, of which there have been eleven." },

  { id:"bourse", name:"The Bourse", band:"ring", type:"single", form:"sphere",
    seats:2, population:33000,
    closure:0.63, suspended:120, attested:0.96,
    composition:{biological:0.55,emulation:0.38,uplift:0.03,synthetic:0.04},
    material_interest:["risk_pricing", "substrate_supply"],
    dependency:"Continuous access to every other station's figures.",
    grievance:"Attempts to place underwriting under statutory oversight." },

  { id:"hollows", name:"The Hollows", band:"far", type:"bundled", form:"cluster", settlements:16,
    seats:6, population:378000,
    closure:0.52, suspended:4210, attested:0.79,
    composition:{biological:0.71,emulation:0.22,uplift:0.04,synthetic:0.03},
    material_interest:["consumables_subsidy", "volume_rationing"],
    dependency:"The quarterly consumables lift.",
    grievance:"Bundled with people they did not choose." },

  { id:"tsiolkovsky", name:"Tsiolkovsky Deck", band:"far", type:"single", form:"torus",
    seats:4, population:249000,
    closure:0.61, suspended:5640, attested:0.83,
    composition:{biological:0.44,emulation:0.47,uplift:0.04,synthetic:0.05},
    material_interest:["substrate_supply", "thermal_quota"],
    dependency:"Thermal quota allocation.",
    grievance:"Substrate rents set on the ring." },

  { id:"coldharbour", name:"Coldharbour", band:"far", type:"single", form:"drum",
    seats:2, population:118000,
    closure:0.58, suspended:5620, attested:0.76,
    composition:{biological:0.31,emulation:0.58,uplift:0.03,synthetic:0.08},
    material_interest:["substrate_supply", "thermal_quota", "shed_order_priority"],
    dependency:"It is a substrate farm. It depends on the price of what it sells.",
    grievance:"That its own residents are billed at the rate they generate." },

  { id:"erasmus", name:"Erasmus Deck", band:"far", type:"single", form:"torus",
    seats:2, population:85000,
    closure:0.64, suspended:1230, attested:0.91,
    composition:{biological:0.48,emulation:0.42,uplift:0.04,synthetic:0.06},
    material_interest:["substrate_supply", "licensure_scope"],
    dependency:"Endowments and licensing fees.",
    grievance:"That the licensing boards it staffs are appointed by ministers it did not elect." },

  { id:"nasmyth", name:"Nasmyth Array", band:"far", type:"single", form:"yard",
    seats:2, population:38000,
    closure:0.55, suspended:950, attested:0.87,
    composition:{biological:0.68,emulation:0.24,uplift:0.05,synthetic:0.03},
    material_interest:["thermal_quota", "yard_contracts"],
    dependency:"It builds radiators. It depends on the appropriation that funds them.",
    grievance:"Eleven years of deferred maintenance on its own array." },

  { id:"vantage", name:"Vantage High", band:"middle", type:"single", form:"torus",
    seats:4, population:213000,
    closure:0.48, suspended:2600, attested:0.81,
    composition:{biological:0.52,emulation:0.4,uplift:0.04,synthetic:0.04},
    material_interest:["thermal_quota", "shed_order_priority"],
    dependency:"Radiator capacity. Below statutory reserve since 6 April.",
    grievance:"That the fault has not been repaired." },

  { id:"perigee", name:"Perigee Yards", band:"middle", type:"single", form:"yard",
    seats:3, population:144000,
    closure:0.57, suspended:1610, attested:0.86,
    composition:{biological:0.78,emulation:0.16,uplift:0.04,synthetic:0.02},
    material_interest:["tether_traffic", "yard_contracts"],
    dependency:"Yard contracts awarded elsewhere.",
    grievance:"Where the contracts went." },

  { id:"calloway", name:"Calloway Loop", band:"middle", type:"single", form:"drum",
    seats:2, population:118000,
    closure:0.44, suspended:1920, attested:0.77,
    composition:{biological:0.69,emulation:0.24,uplift:0.04,synthetic:0.03},
    material_interest:["shed_order_priority", "consumables_subsidy"],
    dependency:"The federal power interlink.",
    grievance:"Tier three and falling." },

  { id:"grimaldi", name:"Grimaldi Station", band:"middle", type:"single", form:"cylinder",
    seats:2, population:106000,
    closure:0.53, suspended:1500, attested:0.84,
    composition:{biological:0.66,emulation:0.27,uplift:0.04,synthetic:0.03},
    material_interest:["transit_windows", "tether_traffic"],
    dependency:"Traffic. It is a junction and nothing else.",
    grievance:"Every schedule change is decided by people who do not use it." },

  { id:"wickstead", name:"Wickstead", band:"middle", type:"single", form:"torus",
    seats:1, population:70000,
    closure:0.69, suspended:760, attested:0.88,
    composition:{biological:0.83,emulation:0.11,uplift:0.04,synthetic:0.02},
    material_interest:["consumables_subsidy", "volume_rationing"],
    dependency:"Water allocation and light hours.",
    grievance:"Imported consumables undercutting its own decks." },

  { id:"oberth", name:"Oberth Approach", band:"middle", type:"single", form:"drum",
    seats:1, population:56000,
    closure:0.51, suspended:870, attested:0.89,
    composition:{biological:0.74,emulation:0.18,uplift:0.05,synthetic:0.03},
    material_interest:["embodiment_access", "bone_density_standards"],
    dependency:"Body stock and physiological licensure.",
    grievance:"Waiting lists it is blamed for and does not set." },

  { id:"tannery", name:"The Tannery", band:"middle", type:"single", form:"cluster",
    seats:2, population:47000,
    closure:0.41, suspended:2230, attested:0.71,
    composition:{biological:0.8,emulation:0.14,uplift:0.04,synthetic:0.02},
    material_interest:["consumables_subsidy", "shed_order_priority"],
    dependency:"It processes what other stations will not.",
    grievance:"That the work is essential and the station is tier four." },

  { id:"ashfield", name:"Ashfield Cans", band:"low", type:"bundled", form:"cluster", settlements:10,
    seats:15, population:880000,
    closure:0.31, suspended:11400, attested:0.682,
    composition:{biological:0.81,emulation:0.13,uplift:0.04,synthetic:0.02},
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"],
    dependency:"Federal consumables lift, three deliveries weekly. Fourteen days of stored margin.",
    grievance:"Tier four in the shed order for eleven consecutive years." },

  { id:"kepler", name:"Kepler Anchorage", band:"low", type:"single", form:"cylinder",
    seats:4, population:231000,
    closure:0.54, suspended:2050, attested:0.85,
    composition:{biological:0.74,emulation:0.19,uplift:0.04,synthetic:0.03},
    material_interest:["tether_traffic", "anchor_concession"],
    dependency:"Tether 2, whose anchor stands on foreign soil.",
    grievance:"That the lifeline is in another state's jurisdiction." },

  { id:"slagworks", name:"Slagworks", band:"low", type:"single", form:"drum",
    seats:2, population:120000,
    closure:0.37, suspended:3120, attested:0.72,
    composition:{biological:0.85,emulation:0.09,uplift:0.04,synthetic:0.02},
    material_interest:["consumables_subsidy", "yard_contracts"],
    dependency:"Feedstock contracts and the consumables lift.",
    grievance:"Essential-services legislation, which its unions read as a muzzle." },

  { id:"bellows", name:"Bellows", band:"low", type:"single", form:"cylinder",
    seats:2, population:101000,
    closure:0.44, suspended:2010, attested:0.76,
    composition:{biological:0.86,emulation:0.08,uplift:0.04,synthetic:0.02},
    material_interest:["thermal_quota", "consumables_subsidy"],
    dependency:"It runs an atmosphere plant serving four stations. It depends on power.",
    grievance:"That it can suffocate its neighbours and is paid as though it cannot." },

  { id:"cinder", name:"Cinder", band:"low", type:"single", form:"drum",
    seats:1, population:78000,
    closure:0.34, suspended:2520, attested:0.69,
    composition:{biological:0.87,emulation:0.07,uplift:0.04,synthetic:0.02},
    material_interest:["consumables_subsidy", "shed_order_priority"],
    dependency:"Refining contracts and everything else.",
    grievance:"The shed order, and the smell, in that order." },

  { id:"tallow", name:"Tallow", band:"low", type:"single", form:"cluster",
    seats:1, population:65000,
    closure:0.39, suspended:1900, attested:0.7,
    composition:{biological:0.84,emulation:0.1,uplift:0.04,synthetic:0.02},
    material_interest:["consumables_subsidy", "volume_rationing"],
    dependency:"Consumables processing quotas.",
    grievance:"That it makes the food and cannot afford the volume to eat it in." },

  { id:"quarry", name:"Quarry Reach", band:"low", type:"single", form:"yard",
    seats:1, population:58000,
    closure:0.42, suspended:1530, attested:0.74,
    composition:{biological:0.86,emulation:0.08,uplift:0.04,synthetic:0.02},
    material_interest:["yard_contracts", "transit_windows"],
    dependency:"Construction demand, which is set by the volume appropriation.",
    grievance:"Boom and bust on a schedule someone else publishes." },

  { id:"drift", name:"Drift Cans", band:"low", type:"bundled", form:"cluster", settlements:11,
    seats:2, population:79000,
    closure:0.27, suspended:3640, attested:0.63,
    composition:{biological:0.83,emulation:0.11,uplift:0.04,synthetic:0.02},
    material_interest:["consumables_subsidy", "shed_order_priority"],
    dependency:"Everything.",
    grievance:"Everything." },

  { id:"sinter", name:"Sinter", band:"low", type:"single", form:"drum",
    seats:2, population:44000,
    closure:0.36, suspended:1340, attested:0.71,
    composition:{biological:0.85,emulation:0.09,uplift:0.04,synthetic:0.02},
    material_interest:["yard_contracts", "consumables_subsidy"],
    dependency:"Fabrication orders from the yards.",
    grievance:"That the yards are three bands up and do not visit." },

  { id:"dredge", name:"Dredge", band:"low", type:"single", form:"yard",
    seats:1, population:34000,
    closure:0.33, suspended:1230, attested:0.66,
    composition:{biological:0.88,emulation:0.06,uplift:0.04,synthetic:0.02},
    material_interest:["transit_windows", "yard_contracts"],
    dependency:"Debris salvage contracts and the Kessler appropriation.",
    grievance:"That the work is dangerous, necessary, and treated as scavenging." },

  { id:"selene", name:"Selene Stations", band:"external", type:"external", form:"surface",
    seats:1, population:60000,
    closure:0.83, suspended:560, attested:0.9,
    composition:{biological:0.69,emulation:0.23,uplift:0.04,synthetic:0.04},
    material_interest:["transit_windows"],
    dependency:"Launch window allocation.",
    grievance:"Counted last, every time." },

  { id:"bloomery", name:"The Bloomery", band:"external", type:"external", form:"surface",
    seats:1, population:24000,
    closure:0.79, suspended:430, attested:0.86,
    composition:{biological:0.79,emulation:0.13,uplift:0.05,synthetic:0.03},
    material_interest:["transit_windows", "yard_contracts"],
    dependency:"Lunar feedstock contracts.",
    grievance:"That it is legislated for by a chamber none of whose members have visited." },

  { id:"l4", name:"L4 Yards", band:"external", type:"external", form:"yard",
    seats:1, population:25000,
    closure:0.88, suspended:240, attested:0.93,
    composition:{biological:0.47,emulation:0.42,uplift:0.03,synthetic:0.08},
    material_interest:["transit_windows", "substrate_supply"],
    dependency:"Almost none. That is the point.",
    grievance:"Federal oversight of a station that funds itself." },

  { id:"achenar", name:"Achenar Point", band:"external", type:"external", form:"sphere",
    seats:1, population:13000,
    closure:0.86, suspended:230, attested:0.92,
    composition:{biological:0.42,emulation:0.48,uplift:0.03,synthetic:0.07},
    material_interest:["transit_windows", "substrate_supply"],
    dependency:"Nothing it will concede.",
    grievance:"Being counted in an apportionment it regards as a courtesy." },

  { id:"l5", name:"L5 Refuge", band:"external", type:"external", form:"sphere",
    seats:1, population:11000,
    closure:0.91, suspended:120, attested:0.95,
    composition:{biological:0.38,emulation:0.51,uplift:0.03,synthetic:0.08},
    material_interest:["transit_windows"],
    dependency:"None it will admit to.",
    grievance:"Being legislated for at all." }

];
