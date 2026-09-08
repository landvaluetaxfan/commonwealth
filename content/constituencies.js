/* =============================================================
   CONSTITUENCIES — the district tier. 56 seats returning 140 members.

   A station is a place on the orbital chart; a constituency is a thing
   that returns members. Most stations are one constituency. The five
   largest are divided, and Anselm Ring alone returns eight.

   magnitude   members returned, 1 to 4. Multi-member districts make the
               district tier somewhat proportional in itself, which is
               deliberate: it stops bundled low-band seats being
               winner-take-all, and lets a party be locally strong
               without sweeping.

   electorate  attested adults. NOT population. The suspended are counted
               for apportionment and cannot vote, and attestation runs
               from 63% on Drift to 96% on the Bourse — so a seat's
               electorate is much smaller than its population, unevenly.

   apportionment_ratio is NOT stored. Engine.apportionment() derives it
   as (magnitude / electorate) against the chamber mean. Because the
   electorate is attested adults, an attestation enforcement bill
   literally moves the malapportionment: the civil-liberties fight and
   the electoral one are the same fight.
   ============================================================= */

const CONSTITUENCIES = [

  { id:"anselm_ring_north", name:"Anselm Ring North", station:"anselm", band:"ring",
    magnitude:5, electorate:161669,
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"anselm_ring_central", name:"Anselm Ring Central", station:"anselm", band:"ring",
    magnitude:5, electorate:161669,
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"anselm_ring_agricultural", name:"Anselm Ring Agricultural", station:"anselm", band:"ring",
    magnitude:5, electorate:161669,
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"anselm_ring_outer_decks", name:"Anselm Ring Outer Decks", station:"anselm", band:"ring",
    magnitude:5, electorate:161669,
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"anselm_ring_spinward", name:"Anselm Ring Spinward", station:"anselm", band:"ring",
    magnitude:5, electorate:161669,
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"anselm_ring_tether_head", name:"Anselm Ring Tether Head", station:"anselm", band:"ring",
    magnitude:5, electorate:161669,
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"anselm_ring_deep_decks", name:"Anselm Ring Deep Decks", station:"anselm", band:"ring",
    magnitude:5, electorate:161669,
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"anselm_ring_founders", name:"Anselm Ring Founders'", station:"anselm", band:"ring",
    magnitude:5, electorate:161669,
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"meridian_spindle_east", name:"Meridian Spindle East", station:"meridian", band:"ring",
    magnitude:4, electorate:109819,
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"meridian_spindle_west", name:"Meridian Spindle West", station:"meridian", band:"ring",
    magnitude:4, electorate:109819,
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"meridian_tether_head", name:"Meridian Tether Head", station:"meridian", band:"ring",
    magnitude:4, electorate:109819,
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"meridian_underdecks", name:"Meridian Underdecks", station:"meridian", band:"ring",
    magnitude:4, electorate:109819,
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"corvus_ring_inner", name:"Corvus Ring Inner", station:"corvus", band:"ring",
    magnitude:3, electorate:91964,
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"corvus_ring_outer", name:"Corvus Ring Outer", station:"corvus", band:"ring",
    magnitude:3, electorate:91964,
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"sable_drum_rim", name:"Sable Drum Rim", station:"sable", band:"ring",
    magnitude:3, electorate:97844,
    material_interest:["tether_traffic", "consumables_subsidy"] },

  { id:"sable_leaseside", name:"Sable Leaseside", station:"sable", band:"ring",
    magnitude:3, electorate:97844,
    material_interest:["tether_traffic", "consumables_subsidy"] },

  { id:"halvard_terrace", name:"Halvard Terrace", station:"halvard", band:"ring",
    magnitude:3, electorate:100663,
    material_interest:["volume_rationing", "tether_traffic"] },

  { id:"the_bourse", name:"The Bourse", station:"bourse", band:"ring",
    magnitude:2, electorate:22411,
    material_interest:["risk_pricing", "substrate_supply"] },

  { id:"hollows_north", name:"Hollows North", station:"hollows", band:"far",
    magnitude:2, electorate:69886,
    material_interest:["consumables_subsidy", "volume_rationing"] },

  { id:"hollows_south", name:"Hollows South", station:"hollows", band:"far",
    magnitude:2, electorate:69886,
    material_interest:["consumables_subsidy", "volume_rationing"] },

  { id:"hollows_cross", name:"Hollows Cross", station:"hollows", band:"far",
    magnitude:2, electorate:69886,
    material_interest:["consumables_subsidy", "volume_rationing"] },

  { id:"tsiolkovsky_north", name:"Tsiolkovsky North", station:"tsiolkovsky", band:"far",
    magnitude:2, electorate:71706,
    material_interest:["substrate_supply", "thermal_quota"] },

  { id:"tsiolkovsky_substrate_quarter", name:"Tsiolkovsky Substrate Quarter", station:"tsiolkovsky", band:"far",
    magnitude:2, electorate:71706,
    material_interest:["substrate_supply", "thermal_quota"] },

  { id:"coldharbour_racks", name:"Coldharbour Racks", station:"coldharbour", band:"far",
    magnitude:1, electorate:30320,
    material_interest:["substrate_supply", "thermal_quota", "shed_order_priority"] },

  { id:"coldharbour_shed", name:"Coldharbour Shed Row", station:"coldharbour", band:"far",
    magnitude:1, electorate:30320,
    material_interest:["substrate_supply", "thermal_quota", "shed_order_priority"] },

  { id:"erasmus_deck", name:"Erasmus Deck", station:"erasmus", band:"far",
    magnitude:2, electorate:54124,
    material_interest:["substrate_supply", "licensure_scope"] },

  { id:"nasmyth_array", name:"Nasmyth Array", station:"nasmyth", band:"far",
    magnitude:2, electorate:22886,
    material_interest:["thermal_quota", "yard_contracts"] },

  { id:"vantage_high", name:"Vantage High", station:"vantage", band:"middle",
    magnitude:2, electorate:60501,
    material_interest:["thermal_quota", "shed_order_priority"] },

  { id:"vantage_radiator_row", name:"Vantage Radiator Row", station:"vantage", band:"middle",
    magnitude:2, electorate:60501,
    material_interest:["thermal_quota", "shed_order_priority"] },

  { id:"perigee_yards", name:"Perigee Yards", station:"perigee", band:"middle",
    magnitude:3, electorate:86943,
    material_interest:["tether_traffic", "yard_contracts"] },

  { id:"calloway_loop", name:"Calloway Loop", station:"calloway", band:"middle",
    magnitude:2, electorate:63461,
    material_interest:["shed_order_priority", "consumables_subsidy"] },

  { id:"grimaldi_station", name:"Grimaldi Station", station:"grimaldi", band:"middle",
    magnitude:2, electorate:62324,
    material_interest:["transit_windows", "tether_traffic"] },

  { id:"wickstead", name:"Wickstead", station:"wickstead", band:"middle",
    magnitude:1, electorate:43261,
    material_interest:["consumables_subsidy", "volume_rationing"] },

  { id:"oberth_approach", name:"Oberth Approach", station:"oberth", band:"middle",
    magnitude:1, electorate:34837,
    material_interest:["embodiment_access", "bone_density_standards"] },

  { id:"the_tannery", name:"The Tannery", station:"tannery", band:"middle",
    magnitude:2, electorate:22569,
    material_interest:["consumables_subsidy", "shed_order_priority"] },

  { id:"ashfield_a_c", name:"Ashfield A–C", station:"ashfield", band:"low",
    magnitude:3, electorate:84119,
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"ashfield_d_f", name:"Ashfield D–F", station:"ashfield", band:"low",
    magnitude:3, electorate:84119,
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"ashfield_g_j", name:"Ashfield G–J", station:"ashfield", band:"low",
    magnitude:3, electorate:84119,
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"ashfield_slagside", name:"Ashfield Slagside", station:"ashfield", band:"low",
    magnitude:3, electorate:84119,
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"ashfield_tier_four", name:"Ashfield Tier Four", station:"ashfield", band:"low",
    magnitude:3, electorate:84119,
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"kepler_anchorage", name:"Kepler Anchorage", station:"kepler", band:"low",
    magnitude:2, electorate:69086,
    material_interest:["tether_traffic", "anchor_concession"] },

  { id:"kepler_concession", name:"Kepler Concession", station:"kepler", band:"low",
    magnitude:2, electorate:69086,
    material_interest:["tether_traffic", "anchor_concession"] },

  { id:"slagworks", name:"Slagworks", station:"slagworks", band:"low",
    magnitude:2, electorate:59749,
    material_interest:["consumables_subsidy", "yard_contracts"] },

  { id:"bellows", name:"Bellows", station:"bellows", band:"low",
    magnitude:2, electorate:53415,
    material_interest:["thermal_quota", "consumables_subsidy"] },

  { id:"cinder", name:"Cinder", station:"cinder", band:"low",
    magnitude:1, electorate:36978,
    material_interest:["consumables_subsidy", "shed_order_priority"] },

  { id:"tallow", name:"Tallow", station:"tallow", band:"low",
    magnitude:1, electorate:31361,
    material_interest:["consumables_subsidy", "volume_rationing"] },

  { id:"quarry_reach", name:"Quarry Reach", station:"quarry", band:"low",
    magnitude:1, electorate:29669,
    material_interest:["yard_contracts", "transit_windows"] },

  { id:"drift_cans_north", name:"Drift Cans North", station:"drift", band:"low",
    magnitude:1, electorate:16854,
    material_interest:["consumables_subsidy", "shed_order_priority"] },

  { id:"drift_cans_south", name:"Drift Cans South", station:"drift", band:"low",
    magnitude:1, electorate:16854,
    material_interest:["consumables_subsidy", "shed_order_priority"] },

  { id:"sinter", name:"Sinter", station:"sinter", band:"low",
    magnitude:2, electorate:21505,
    material_interest:["yard_contracts", "consumables_subsidy"] },

  { id:"dredge", name:"Dredge", station:"dredge", band:"low",
    magnitude:1, electorate:15356,
    material_interest:["transit_windows", "yard_contracts"] },

  { id:"selene_stations", name:"Selene Stations", station:"selene", band:"external",
    magnitude:1, electorate:37982,
    material_interest:["transit_windows"] },

  { id:"the_bloomery", name:"The Bloomery", station:"bloomery", band:"external",
    magnitude:1, electorate:14392,
    material_interest:["transit_windows", "yard_contracts"] },

  { id:"l4_yards", name:"L4 Yards", station:"l4", band:"external",
    magnitude:1, electorate:16349,
    material_interest:["transit_windows", "substrate_supply"] },

  { id:"achenar_point", name:"Achenar Point", station:"achenar", band:"external",
    magnitude:1, electorate:8341,
    material_interest:["transit_windows", "substrate_supply"] },

  { id:"l5_refuge", name:"L5 Refuge", station:"l5", band:"external",
    magnitude:1, electorate:7339,
    material_interest:["transit_windows"] }

];
