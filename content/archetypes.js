/* =============================================================
   ARCHETYPES — station templates for the editor.

   Pick an archetype and the editor rolls a coherent station: band,
   form, population, apportionment ratio, closure, suspended count,
   attestation, and a starting set of material-interest tags.

   The point is not to save typing. It is that these numbers are
   CORRELATED — a low-closure industrial can has a high suspended
   count and low attestation because those are the same fact seen
   three ways. Rolling them independently produces incoherent places.
   Each archetype encodes the correlation.

   `ratio` is gone: apportionment is derived from magnitude and electorate in
   constituencies.js, never stored.

   Ranges are [min, max]. `susp` and `att` are expressed relative to
   population and closure respectively, so they stay consistent.
   `composition` is the biological share; emulation, uplift and synthetic are
   derived from it, because a station's category mix is a function of what it
   costs to live there rather than an independent fact.
   ============================================================= */

const ARCHETYPES = [

  { id:"ring_capital", name:"Ring capital",
    band:"ring", form:"cylinder", type:"single",
    pop:[1400000, 2200000], closure:[0.72, 0.86],
    suspPer10k:[8, 16], att:[0.91, 0.96], seatsPer:140000,
    composition:[0.58, 0.64],   // biological share; the rest follows
    interest:["tether_traffic","volume_rationing"],
    dependency:"Nothing it cannot buy.",
    grievance:"That everyone else resents it.",
    note:"Populous, wealthy, underrepresented by the formula and untroubled by it." },

  { id:"ring_established", name:"Ring, established",
    band:"ring", form:"drum", type:"single",
    pop:[420000, 900000], closure:[0.60, 0.74],
    suspPer10k:[40, 70], att:[0.85, 0.91], seatsPer:130000,
    composition:[0.62, 0.70],   // biological share; the rest follows
    interest:["tether_traffic","consumables_subsidy"],
    dependency:"Traffic rights it does not own.",
    grievance:"The terms it signed when it was smaller.",
    note:"Comfortable, dependent on arrangements made elsewhere." },

  { id:"far_deck", name:"Far-band deck",
    band:"far", form:"torus", type:"single",
    pop:[280000, 520000], closure:[0.55, 0.68],
    suspPer10k:[180, 260], att:[0.79, 0.87], seatsPer:130000,
    composition:[0.40, 0.52],   // biological share; the rest follows
    interest:["substrate_supply","thermal_quota"],
    dependency:"Thermal quota allocation.",
    grievance:"Substrate rents set on the ring.",
    note:"Emulation-heavy. Where the Substrate Left actually wins districts." },

  { id:"industrial_can", name:"Industrial can",
    band:"low", form:"cluster", type:"bundled",
    pop:[600000, 950000], closure:[0.26, 0.38],
    suspPer10k:[110, 170], att:[0.62, 0.72], seatsPer:145000,
    settlements:[4, 12],
    composition:[0.78, 0.85],   // biological share; the rest follows
    interest:["consumables_subsidy","shed_order_priority","volume_rationing"],
    dependency:"Federal consumables lift. Fourteen days of stored margin.",
    grievance:"Tier four in the shed order, and the year it has been that way.",
    note:"Overrepresented, dependent, poorly attested, and full of people who cannot vote." },

  { id:"drift_cans", name:"Verge cans",
    band:"low", form:"cluster", type:"bundled",
    pop:[80000, 180000], closure:[0.22, 0.34],
    suspPer10k:[380, 520], att:[0.56, 0.68], seatsPer:64000,
    settlements:[8, 14],
    composition:[0.80, 0.87],   // biological share; the rest follows
    interest:["consumables_subsidy","shed_order_priority"],
    dependency:"Everything.",
    grievance:"Everything.",
    note:"Small, scattered, and the worst suspended-to-voting ratio in the Commonwealth." },

  { id:"middle_station", name:"Middle-band station",
    band:"middle", form:"torus", type:"single",
    pop:[160000, 380000], closure:[0.42, 0.58],
    suspPer10k:[100, 180], att:[0.76, 0.84], seatsPer:115000,
    composition:[0.50, 0.70],   // biological share; the rest follows
    interest:["thermal_quota","shed_order_priority"],
    dependency:"Radiator capacity and the federal power interlink.",
    grievance:"The repair queue.",
    note:"Overrepresented and precarious. Where thermal crises land first." },

  { id:"yard", name:"Construction yard",
    band:"middle", form:"yard", type:"single",
    pop:[180000, 280000], closure:[0.50, 0.64],
    suspPer10k:[80, 130], att:[0.82, 0.90], seatsPer:117000,
    composition:[0.74, 0.82],   // biological share; the rest follows
    interest:["tether_traffic","yard_contracts"],
    dependency:"Yard contracts awarded elsewhere.",
    grievance:"Where the contracts went.",
    note:"Skilled, unionised, and one procurement decision from a crisis." },

  { id:"anchorage", name:"Anchorage",
    band:"low", form:"cylinder", type:"single",
    pop:[300000, 460000], closure:[0.48, 0.62],
    suspPer10k:[70, 110], att:[0.82, 0.90], seatsPer:124000,
    composition:[0.70, 0.78],   // biological share; the rest follows
    interest:["tether_traffic","anchor_concession"],
    dependency:"A tether whose anchor stands on foreign soil.",
    grievance:"That the lifeline is in someone else's jurisdiction.",
    note:"Prosperous and exposed. Foreign policy is domestic politics here." },

  { id:"external_refuge", name:"External refuge",
    band:"external", form:"sphere", type:"external",
    pop:[14000, 60000], closure:[0.84, 0.94],
    suspPer10k:[80, 140], att:[0.90, 0.96], seatsPer:20000,
    composition:[0.36, 0.50],   // biological share; the rest follows
    interest:["transit_windows"],
    dependency:"None it will admit to.",
    grievance:"Being legislated for at all.",
    note:"Tiny, wildly overrepresented, self-sufficient, and counted last." },

  { id:"lunar_settlement", name:"Lunar settlement",
    band:"external", form:"surface", type:"external",
    pop:[60000, 140000], closure:[0.76, 0.90],
    suspPer10k:[60, 110], att:[0.86, 0.93], seatsPer:48000,
    composition:[0.64, 0.74],   // biological share; the rest follows
    interest:["transit_windows","consumables_subsidy"],
    dependency:"Launch window allocation.",
    grievance:"Counted last, every time.",
    note:"Surface, not orbit. Its results arrive after everyone else's and often decide things." },

  { id:"substrate_farm", name:"Substrate farm",
    band:"far", form:"drum", type:"single",
    pop:[80000, 160000], closure:[0.52, 0.64],
    suspPer10k:[380, 560], att:[0.72, 0.80], seatsPer:60000,
    composition:[0.28, 0.38],
    interest:["substrate_supply","thermal_quota","shed_order_priority"],
    dependency:"It sells the thing it is billed for.",
    grievance:"That its own residents pay the rate they generate.",
    note:"Emulation-majority, and the only place where that is an industry rather than a demographic." },

  { id:"heavy_industry", name:"Heavy industry",
    band:"low", form:"drum", type:"single",
    pop:[70000, 200000], closure:[0.32, 0.44],
    suspPer10k:[230, 320], att:[0.66, 0.76], seatsPer:58000,
    composition:[0.83, 0.88],
    interest:["consumables_subsidy","yard_contracts"],
    dependency:"Feedstock contracts and the consumables lift.",
    grievance:"Essential-services legislation, which its unions read as a muzzle.",
    note:"Overwhelmingly embodied, unionised, and one procurement decision from a strike." },

  { id:"life_support_plant", name:"Life support plant",
    band:"low", form:"cylinder", type:"single",
    pop:[60000, 140000], closure:[0.40, 0.52],
    suspPer10k:[170, 240], att:[0.72, 0.80], seatsPer:55000,
    composition:[0.82, 0.88],
    interest:["thermal_quota","consumables_subsidy"],
    dependency:"Power. It runs an atmosphere plant for its neighbours.",
    grievance:"That it can suffocate them and is paid as though it cannot.",
    note:"The strike weapon in its purest form. Nobody says so out loud." },

  { id:"research_deck", name:"Research deck",
    band:"far", form:"torus", type:"single",
    pop:[50000, 120000], closure:[0.58, 0.70],
    suspPer10k:[110, 180], att:[0.88, 0.94], seatsPer:52000,
    composition:[0.44, 0.56],
    interest:["substrate_supply","licensure_scope"],
    dependency:"Endowments and licensing fees.",
    grievance:"That the boards it staffs are appointed by ministers it did not elect.",
    note:"Staffs the licensing boards that decide who votes in twenty-one seats." },

  { id:"financial_post", name:"Financial post",
    band:"ring", form:"sphere", type:"single",
    pop:[20000, 50000], closure:[0.58, 0.68],
    suspPer10k:[20, 60], att:[0.94, 0.97], seatsPer:22000,
    composition:[0.50, 0.60],
    interest:["risk_pricing","substrate_supply"],
    dependency:"Continuous access to everyone else's figures.",
    grievance:"Attempts to place underwriting under statutory oversight.",
    note:"Tiny, wildly overrepresented, and the only party with accurate numbers." },

  { id:"salvage_yard", name:"Salvage yard",
    band:"low", form:"yard", type:"single",
    pop:[25000, 70000], closure:[0.28, 0.38],
    suspPer10k:[300, 420], att:[0.62, 0.70], seatsPer:34000,
    composition:[0.85, 0.90],
    interest:["transit_windows","yard_contracts"],
    dependency:"Debris salvage contracts and the Kessler appropriation.",
    grievance:"That the work is dangerous, necessary, and treated as scavenging.",
    note:"Where Kessler risk stops being an abstraction." }

];
