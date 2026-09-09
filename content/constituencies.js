/* =============================================================
   CONSTITUENCIES — 140 single-member districts.

   Every seat returns ONE member by first past the post. There is no
   list, no quota and no divisor here: the list tier is a separate
   ballot (bible 4.1, parallel and NOT compensatory — this is Japan,
   not Germany).

   Subdivided from the 56 multi-member constituencies that preceded
   them; `parent` records which, so nothing authored is lost. Station,
   band and material interest are inherited; electorate is the parent's
   split evenly with the remainder to the first child.

   held — who sits for this seat right now. One party, one seat. It is
   the CURRENT roll, not the last result: by-elections, vacancies and
   floor crossings move it during play, and every district total in the
   game is derived from it rather than stored twice (see the
   apportionment_ratio entry in CLAUDE.md). test.js reconciles both ways.

   NAMING (bible 10.1: village warmth, "corridors with names and graffiti
   and a bakery on them"). Registers are assigned by band, so a name
   carries its politics:
     ring        civic and memorial, plus the state's own vocabulary
     middle      trade and corridor
     low         trade, and the two names that are not names at all
     agricultural  water and green
     external    maritime
   Three devices are deliberately rationed, and should stay that way:
     Coldharbour One and Coldharbour Three, with no Two. Nothing
       explains the gap. Nothing should.
     Ashfield A, Two, III, -04, Five, VI — six seats numbered in six
       systems because nobody ever agreed one.
     Tier Four, which is a rationing tier and not a place name: the
       district is known by the queue it is stuck in.
   Space Elevator and The Beanstalk are the same structure, named
   officially and colloquially, and they are adjacent on purpose.
   ============================================================= */

const CONSTITUENCIES = [

  { id:"charter_green", name:"Charter Green", station:"anselm", band:"ring",
    magnitude:1, electorate:32337,
    held:{cl:1},
    parent:"anselm_ring_north",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"concord", name:"Concord", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cl:1},
    parent:"anselm_ring_north",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"first_spin", name:"First Spin", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cu:1},
    parent:"anselm_ring_north",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"the_long_gallery", name:"The Long Gallery", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{rv:1},
    parent:"anselm_ring_north",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"assembly_walk", name:"Assembly Walk", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{sc:1},
    parent:"anselm_ring_north",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"allocation_square", name:"Allocation Square", station:"anselm", band:"ring",
    magnitude:1, electorate:32337,
    held:{cl:1},
    parent:"anselm_ring_central",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"the_exchange", name:"The Exchange", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cl:1},
    parent:"anselm_ring_central",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"registry_walk", name:"Registry Walk", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cl:1},
    parent:"anselm_ring_central",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"chancery", name:"Chancery", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cu:1},
    parent:"anselm_ring_central",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"bell_yard", name:"Bell Yard", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cu:1},
    parent:"anselm_ring_central",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"the_cisterns", name:"The Cisterns", station:"anselm", band:"ring",
    magnitude:1, electorate:32337,
    held:{rv:1},
    parent:"anselm_ring_agricultural",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"cress_walk", name:"Cress Walk", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{rv:1},
    parent:"anselm_ring_agricultural",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"the_beds", name:"The Beds", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{rv:1},
    parent:"anselm_ring_agricultural",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"orchard_deck", name:"Orchard Deck", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cu:1},
    parent:"anselm_ring_agricultural",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"wellhead", name:"Wellhead", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{sc:1},
    parent:"anselm_ring_agricultural",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"ropewalk", name:"Ropewalk", station:"anselm", band:"ring",
    magnitude:1, electorate:32337,
    held:{cu:1},
    parent:"anselm_ring_outer_decks",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"kiln_end", name:"Kiln End", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cu:1},
    parent:"anselm_ring_outer_decks",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"cordage", name:"Cordage", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cu:1},
    parent:"anselm_ring_outer_decks",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"drybank", name:"Drybank", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{fh:1},
    parent:"anselm_ring_outer_decks",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"coopers_walk", name:"Coopers Walk", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{sc:1},
    parent:"anselm_ring_outer_decks",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"spinward_reach", name:"Spinward Reach", station:"anselm", band:"ring",
    magnitude:1, electorate:32337,
    held:{cu:1},
    parent:"anselm_ring_spinward",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"windward", name:"Windward", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cu:1},
    parent:"anselm_ring_spinward",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"leeside", name:"Leeside", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cl:1},
    parent:"anselm_ring_spinward",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"the_turn", name:"The Turn", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{fh:1},
    parent:"anselm_ring_spinward",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"longwall", name:"Longwall", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{sc:1},
    parent:"anselm_ring_spinward",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"space_elevator", name:"Space Elevator", station:"anselm", band:"ring",
    magnitude:1, electorate:32337,
    held:{cl:1},
    parent:"anselm_ring_tether_head",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"the_beanstalk", name:"The Beanstalk", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cl:1},
    parent:"anselm_ring_tether_head",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"anchor_head", name:"Anchor Head", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cu:1},
    parent:"anselm_ring_tether_head",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"cable_row", name:"Cable Row", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cu:1},
    parent:"anselm_ring_tether_head",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"the_counterweight", name:"The Counterweight", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{hul:1},
    parent:"anselm_ring_tether_head",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"deep_deck", name:"Deep Deck", station:"anselm", band:"ring",
    magnitude:1, electorate:32337,
    held:{cu:1},
    parent:"anselm_ring_deep_decks",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"underwall", name:"Underwall", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cu:1},
    parent:"anselm_ring_deep_decks",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"the_sinks", name:"The Sinks", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cu:1},
    parent:"anselm_ring_deep_decks",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"candlewick", name:"Candlewick", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{psa:1},
    parent:"anselm_ring_deep_decks",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"blackfriars", name:"Blackfriars", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{sc:1},
    parent:"anselm_ring_deep_decks",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"old_foundation", name:"Old Foundation", station:"anselm", band:"ring",
    magnitude:1, electorate:32337,
    held:{cl:1},
    parent:"anselm_ring_founders",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"charter_house", name:"Charter House", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cl:1},
    parent:"anselm_ring_founders",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"the_vestry", name:"The Vestry", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{fh:1},
    parent:"anselm_ring_founders",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"almshouse_row", name:"Almshouse Row", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{fh:1},
    parent:"anselm_ring_founders",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"quorum", name:"Quorum", station:"anselm", band:"ring",
    magnitude:1, electorate:32333,
    held:{cu:1},
    parent:"anselm_ring_founders",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"meridian_drum", name:"Meridian Drum", station:"meridian", band:"ring",
    magnitude:1, electorate:27457,
    held:{cu:1},
    parent:"meridian_spindle_east",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"meridian_loop", name:"Meridian Loop", station:"meridian", band:"ring",
    magnitude:1, electorate:27454,
    held:{cu:1},
    parent:"meridian_spindle_east",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"east_gallery", name:"East Gallery", station:"meridian", band:"ring",
    magnitude:1, electorate:27454,
    held:{cl:1},
    parent:"meridian_spindle_east",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"saltings", name:"Saltings", station:"meridian", band:"ring",
    magnitude:1, electorate:27454,
    held:{sc:1},
    parent:"meridian_spindle_east",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"meridian_yard", name:"Meridian Yard", station:"meridian", band:"ring",
    magnitude:1, electorate:27457,
    held:{cu:1},
    parent:"meridian_spindle_west",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"west_gallery", name:"West Gallery", station:"meridian", band:"ring",
    magnitude:1, electorate:27454,
    held:{cu:1},
    parent:"meridian_spindle_west",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"fetterlane", name:"Fetterlane", station:"meridian", band:"ring",
    magnitude:1, electorate:27454,
    held:{cl:1},
    parent:"meridian_spindle_west",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"sailmakers", name:"Sailmakers", station:"meridian", band:"ring",
    magnitude:1, electorate:27454,
    held:{sc:1},
    parent:"meridian_spindle_west",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"cable_end", name:"Cable End", station:"meridian", band:"ring",
    magnitude:1, electorate:27457,
    held:{cl:1},
    parent:"meridian_tether_head",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"anchor_walk", name:"Anchor Walk", station:"meridian", band:"ring",
    magnitude:1, electorate:27454,
    held:{cl:1},
    parent:"meridian_tether_head",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"the_winding", name:"The Winding", station:"meridian", band:"ring",
    magnitude:1, electorate:27454,
    held:{cu:1},
    parent:"meridian_tether_head",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"counterweight_row", name:"Counterweight Row", station:"meridian", band:"ring",
    magnitude:1, electorate:27454,
    held:{hul:1},
    parent:"meridian_tether_head",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"underdecks", name:"Underdecks", station:"meridian", band:"ring",
    magnitude:1, electorate:27457,
    held:{cu:1},
    parent:"meridian_underdecks",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"lowwater", name:"Lowwater", station:"meridian", band:"ring",
    magnitude:1, electorate:27454,
    held:{cu:1},
    parent:"meridian_underdecks",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"the_warrens", name:"The Warrens", station:"meridian", band:"ring",
    magnitude:1, electorate:27454,
    held:{psa:1},
    official:"Loyalty Row",
    parent:"meridian_underdecks",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"sub_four", name:"Sub-Four", station:"meridian", band:"ring",
    magnitude:1, electorate:27454,
    held:{sc:1},
    parent:"meridian_underdecks",
    material_interest:["tether_traffic", "substrate_supply"] },

  { id:"rookery", name:"Rookery", station:"corvus", band:"ring",
    magnitude:1, electorate:30656,
    held:{cl:1},
    parent:"corvus_ring_inner",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"corvus_inner", name:"Corvus Inner", station:"corvus", band:"ring",
    magnitude:1, electorate:30654,
    held:{cl:1},
    parent:"corvus_ring_inner",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"nestgate", name:"Nestgate", station:"corvus", band:"ring",
    magnitude:1, electorate:30654,
    held:{cu:1},
    parent:"corvus_ring_inner",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"crowfield", name:"Crowfield", station:"corvus", band:"ring",
    magnitude:1, electorate:30656,
    held:{cu:1},
    parent:"corvus_ring_outer",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"corvus_outer", name:"Corvus Outer", station:"corvus", band:"ring",
    magnitude:1, electorate:30654,
    held:{cu:1},
    parent:"corvus_ring_outer",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"bellmouth", name:"Bellmouth", station:"corvus", band:"ring",
    magnitude:1, electorate:30654,
    held:{sc:1},
    parent:"corvus_ring_outer",
    material_interest:["tether_traffic", "volume_rationing"] },

  { id:"sable_rim", name:"Sable Rim", station:"sable", band:"ring",
    magnitude:1, electorate:32616,
    held:{sc:1},
    parent:"sable_drum_rim",
    material_interest:["tether_traffic", "consumables_subsidy"] },

  { id:"drumhead", name:"Drumhead", station:"sable", band:"ring",
    magnitude:1, electorate:32614,
    held:{sc:1},
    parent:"sable_drum_rim",
    material_interest:["tether_traffic", "consumables_subsidy"] },

  { id:"the_rimwalk", name:"The Rimwalk", station:"sable", band:"ring",
    magnitude:1, electorate:32614,
    held:{cu:1},
    parent:"sable_drum_rim",
    material_interest:["tether_traffic", "consumables_subsidy"] },

  { id:"leaseside", name:"Leaseside", station:"sable", band:"ring",
    magnitude:1, electorate:32616,
    held:{fh:1},
    parent:"sable_leaseside",
    material_interest:["tether_traffic", "consumables_subsidy"] },

  { id:"rentfield", name:"Rentfield", station:"sable", band:"ring",
    magnitude:1, electorate:32614,
    held:{fh:1},
    parent:"sable_leaseside",
    material_interest:["tether_traffic", "consumables_subsidy"] },

  { id:"bondgate", name:"Bondgate", station:"sable", band:"ring",
    magnitude:1, electorate:32614,
    held:{fh:1},
    parent:"sable_leaseside",
    material_interest:["tether_traffic", "consumables_subsidy"] },

  { id:"halvard_terrace", name:"Halvard Terrace", station:"halvard", band:"ring",
    magnitude:1, electorate:33555,
    held:{cl:1},
    parent:"halvard_terrace",
    material_interest:["volume_rationing", "tether_traffic"] },

  { id:"the_crescent", name:"The Crescent", station:"halvard", band:"ring",
    magnitude:1, electorate:33554,
    held:{cl:1},
    parent:"halvard_terrace",
    material_interest:["volume_rationing", "tether_traffic"] },

  { id:"parade_row", name:"Parade Row", station:"halvard", band:"ring",
    magnitude:1, electorate:33554,
    held:{fh:1},
    parent:"halvard_terrace",
    material_interest:["volume_rationing", "tether_traffic"] },

  { id:"the_bourse", name:"The Bourse", station:"bourse", band:"ring",
    magnitude:1, electorate:11206,
    held:{cl:1},
    parent:"the_bourse",
    material_interest:["risk_pricing", "substrate_supply"] },

  { id:"exchange_alley", name:"Exchange Alley", station:"bourse", band:"ring",
    magnitude:1, electorate:11205,
    held:{cl:1},
    parent:"the_bourse",
    material_interest:["risk_pricing", "substrate_supply"] },

  { id:"northhollow", name:"Northhollow", station:"hollows", band:"far",
    magnitude:1, electorate:34943,
    held:{rv:1},
    parent:"hollows_north",
    material_interest:["consumables_subsidy", "volume_rationing"] },

  { id:"cold_row", name:"Cold Row", station:"hollows", band:"far",
    magnitude:1, electorate:34943,
    held:{sc:1},
    parent:"hollows_north",
    material_interest:["consumables_subsidy", "volume_rationing"] },

  { id:"southhollow", name:"Southhollow", station:"hollows", band:"far",
    magnitude:1, electorate:34943,
    held:{rv:1},
    parent:"hollows_south",
    material_interest:["consumables_subsidy", "volume_rationing"] },

  { id:"thin_air", name:"Thin Air", station:"hollows", band:"far",
    magnitude:1, electorate:34943,
    held:{sc:1},
    parent:"hollows_south",
    material_interest:["consumables_subsidy", "volume_rationing"] },

  { id:"crosshollow", name:"Crosshollow", station:"hollows", band:"far",
    magnitude:1, electorate:34943,
    held:{rv:1},
    parent:"hollows_cross",
    material_interest:["consumables_subsidy", "volume_rationing"] },

  { id:"the_cut", name:"The Cut", station:"hollows", band:"far",
    magnitude:1, electorate:34943,
    held:{rv:1},
    parent:"hollows_cross",
    material_interest:["consumables_subsidy", "volume_rationing"] },

  { id:"fadeyev_row", name:"Fadeyev Row", station:"tsiolkovsky", band:"far",
    magnitude:1, electorate:35853,
    held:{hul:1},
    parent:"tsiolkovsky_north",
    material_interest:["substrate_supply", "thermal_quota"] },

  { id:"the_racks", name:"The Racks", station:"tsiolkovsky", band:"far",
    magnitude:1, electorate:35853,
    held:{sc:1},
    parent:"tsiolkovsky_north",
    material_interest:["substrate_supply", "thermal_quota"] },

  { id:"substrate_quarter", name:"Substrate Quarter", station:"tsiolkovsky", band:"far",
    magnitude:1, electorate:35853,
    held:{psa:1},
    parent:"tsiolkovsky_substrate_quarter",
    material_interest:["substrate_supply", "thermal_quota"] },

  { id:"cold_storage", name:"Cold Storage", station:"tsiolkovsky", band:"far",
    magnitude:1, electorate:35853,
    held:{psa:1},
    parent:"tsiolkovsky_substrate_quarter",
    material_interest:["substrate_supply", "thermal_quota"] },

  { id:"coldharbour_one", name:"Coldharbour One", station:"coldharbour", band:"far",
    magnitude:1, electorate:30320,
    held:{psa:1},
    parent:"coldharbour_racks",
    material_interest:["substrate_supply", "thermal_quota", "shed_order_priority"] },

  { id:"coldharbour_three", name:"Coldharbour Three", station:"coldharbour", band:"far",
    magnitude:1, electorate:30320,
    held:{hul:1},
    parent:"coldharbour_shed",
    material_interest:["substrate_supply", "thermal_quota", "shed_order_priority"] },

  { id:"erasmus_deck", name:"Erasmus Deck", station:"erasmus", band:"far",
    magnitude:1, electorate:27062,
    held:{psa:1},
    parent:"erasmus_deck",
    material_interest:["substrate_supply", "licensure_scope"] },

  { id:"continuity", name:"Continuity", station:"erasmus", band:"far",
    magnitude:1, electorate:27062,
    held:{sc:1},
    parent:"erasmus_deck",
    material_interest:["substrate_supply", "licensure_scope"] },

  { id:"the_array", name:"The Array", station:"nasmyth", band:"far",
    magnitude:1, electorate:11443,
    held:{hul:1},
    parent:"nasmyth_array",
    material_interest:["thermal_quota", "yard_contracts"] },

  { id:"hammerside", name:"Hammerside", station:"nasmyth", band:"far",
    magnitude:1, electorate:11443,
    held:{sc:1},
    parent:"nasmyth_array",
    material_interest:["thermal_quota", "yard_contracts"] },

  { id:"vantage", name:"Vantage", station:"vantage", band:"middle",
    magnitude:1, electorate:30251,
    held:{cu:1},
    parent:"vantage_high",
    material_interest:["thermal_quota", "shed_order_priority"] },

  { id:"the_overlook", name:"The Overlook", station:"vantage", band:"middle",
    magnitude:1, electorate:30250,
    held:{hul:1},
    parent:"vantage_high",
    material_interest:["thermal_quota", "shed_order_priority"] },

  { id:"radiator_row", name:"Radiator Row", station:"vantage", band:"middle",
    magnitude:1, electorate:30251,
    held:{cu:1},
    parent:"vantage_radiator_row",
    material_interest:["thermal_quota", "shed_order_priority"] },

  { id:"coldside", name:"Coldside", station:"vantage", band:"middle",
    magnitude:1, electorate:30250,
    held:{sc:1},
    parent:"vantage_radiator_row",
    material_interest:["thermal_quota", "shed_order_priority"] },

  { id:"the_yards", name:"The Yards", station:"perigee", band:"middle",
    magnitude:1, electorate:28981,
    held:{hul:1},
    parent:"perigee_yards",
    material_interest:["tether_traffic", "yard_contracts"] },

  { id:"dry_dock", name:"Dry Dock", station:"perigee", band:"middle",
    magnitude:1, electorate:28981,
    held:{hul:1},
    parent:"perigee_yards",
    material_interest:["tether_traffic", "yard_contracts"] },

  { id:"slipway", name:"Slipway", station:"perigee", band:"middle",
    magnitude:1, electorate:28981,
    held:{cu:1},
    parent:"perigee_yards",
    material_interest:["tether_traffic", "yard_contracts"] },

  { id:"the_loop", name:"The Loop", station:"calloway", band:"middle",
    magnitude:1, electorate:31731,
    held:{cu:1},
    parent:"calloway_loop",
    material_interest:["shed_order_priority", "consumables_subsidy"] },

  { id:"calloway_green", name:"Calloway Green", station:"calloway", band:"middle",
    magnitude:1, electorate:31730,
    held:{sc:1},
    parent:"calloway_loop",
    material_interest:["shed_order_priority", "consumables_subsidy"] },

  { id:"grimaldi", name:"Grimaldi", station:"grimaldi", band:"middle",
    magnitude:1, electorate:31162,
    held:{cl:1},
    parent:"grimaldi_station",
    material_interest:["transit_windows", "tether_traffic"] },

  { id:"transit_row", name:"Transit Row", station:"grimaldi", band:"middle",
    magnitude:1, electorate:31162,
    held:{sc:1},
    parent:"grimaldi_station",
    material_interest:["transit_windows", "tether_traffic"] },

  { id:"wickstead", name:"Wickstead", station:"wickstead", band:"middle",
    magnitude:1, electorate:43261,
    held:{sc:1},
    parent:"wickstead",
    material_interest:["consumables_subsidy", "volume_rationing"] },

  { id:"the_approach", name:"The Approach", station:"oberth", band:"middle",
    magnitude:1, electorate:34837,
    held:{rv:1},
    parent:"oberth_approach",
    material_interest:["embodiment_access", "bone_density_standards"] },

  { id:"the_tannery", name:"The Tannery", station:"tannery", band:"middle",
    magnitude:1, electorate:11285,
    held:{cu:1},
    parent:"the_tannery",
    material_interest:["consumables_subsidy", "shed_order_priority"] },

  { id:"skinners_row", name:"Skinners Row", station:"tannery", band:"middle",
    magnitude:1, electorate:11284,
    held:{rv:1},
    parent:"the_tannery",
    material_interest:["consumables_subsidy", "shed_order_priority"] },

  { id:"ashfield_a", name:"Ashfield A", station:"ashfield", band:"low",
    magnitude:1, electorate:28041,
    held:{cu:1},
    parent:"ashfield_a_c",
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"ashfield_two", name:"Ashfield Two", station:"ashfield", band:"low",
    magnitude:1, electorate:28039,
    held:{cu:1},
    parent:"ashfield_a_c",
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"ashfield_iii", name:"Ashfield III", station:"ashfield", band:"low",
    magnitude:1, electorate:28039,
    held:{cu:1},
    parent:"ashfield_a_c",
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"ashfield_04", name:"Ashfield-04", station:"ashfield", band:"low",
    magnitude:1, electorate:28041,
    held:{cu:1},
    parent:"ashfield_d_f",
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"ashfield_five", name:"Ashfield Five", station:"ashfield", band:"low",
    magnitude:1, electorate:28039,
    held:{cu:1},
    parent:"ashfield_d_f",
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"ashfield_vi", name:"Ashfield VI", station:"ashfield", band:"low",
    magnitude:1, electorate:28039,
    held:{sc:1},
    parent:"ashfield_d_f",
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"kiln_green", name:"Kiln Green", station:"ashfield", band:"low",
    magnitude:1, electorate:28041,
    held:{cu:1},
    parent:"ashfield_g_j",
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"bellrow", name:"Bellrow", station:"ashfield", band:"low",
    magnitude:1, electorate:28039,
    held:{cu:1},
    parent:"ashfield_g_j",
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"sootgate", name:"Sootgate", station:"ashfield", band:"low",
    magnitude:1, electorate:28039,
    held:{cu:1},
    parent:"ashfield_g_j",
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"slagside", name:"Slagside", station:"ashfield", band:"low",
    magnitude:1, electorate:28041,
    held:{cu:1},
    parent:"ashfield_slagside",
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"cinderbank", name:"Cinderbank", station:"ashfield", band:"low",
    magnitude:1, electorate:28039,
    held:{cu:1},
    parent:"ashfield_slagside",
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"the_tips", name:"The Tips", station:"ashfield", band:"low",
    magnitude:1, electorate:28039,
    held:{gb:1},
    parent:"ashfield_slagside",
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"tier_four", name:"Tier Four", station:"ashfield", band:"low",
    magnitude:1, electorate:28041,
    held:{cu:1},
    parent:"ashfield_tier_four",
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"the_cans", name:"The Cans", station:"ashfield", band:"low",
    magnitude:1, electorate:28039,
    held:{cu:1},
    parent:"ashfield_tier_four",
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"lowgate", name:"Lowgate", station:"ashfield", band:"low",
    magnitude:1, electorate:28039,
    held:{sc:1},
    parent:"ashfield_tier_four",
    material_interest:["consumables_subsidy", "shed_order_priority", "volume_rationing"] },

  { id:"high_southwark", name:"High Southwark", station:"kepler", band:"low",
    magnitude:1, electorate:34543,
    held:{des:1},
    parent:"kepler_anchorage",
    material_interest:["tether_traffic", "anchor_concession"] },

  { id:"anchor_row", name:"Anchor Row", station:"kepler", band:"low",
    magnitude:1, electorate:34543,
    held:{sc:1},
    parent:"kepler_anchorage",
    material_interest:["tether_traffic", "anchor_concession"] },

  { id:"high_lagos", name:"High Lagos", station:"kepler", band:"low",
    magnitude:1, electorate:34543,
    held:{cl:1},
    parent:"kepler_concession",
    material_interest:["tether_traffic", "anchor_concession"] },

  { id:"the_concession", name:"The Concession", station:"kepler", band:"low",
    magnitude:1, electorate:34543,
    held:{des:1},
    parent:"kepler_concession",
    material_interest:["tether_traffic", "anchor_concession"] },

  { id:"slagworks", name:"Slagworks", station:"slagworks", band:"low",
    magnitude:1, electorate:29875,
    held:{cu:1},
    parent:"slagworks",
    material_interest:["consumables_subsidy", "yard_contracts"] },

  { id:"furnace_row", name:"Furnace Row", station:"slagworks", band:"low",
    magnitude:1, electorate:29874,
    held:{gb:1},
    parent:"slagworks",
    material_interest:["consumables_subsidy", "yard_contracts"] },

  { id:"bellows", name:"Bellows", station:"bellows", band:"low",
    magnitude:1, electorate:26708,
    held:{cu:1},
    parent:"bellows",
    material_interest:["thermal_quota", "consumables_subsidy"] },

  { id:"forge_end", name:"Forge End", station:"bellows", band:"low",
    magnitude:1, electorate:26707,
    held:{hul:1},
    parent:"bellows",
    material_interest:["thermal_quota", "consumables_subsidy"] },

  { id:"cinder", name:"Cinder", station:"cinder", band:"low",
    magnitude:1, electorate:36978,
    held:{cu:1},
    parent:"cinder",
    material_interest:["consumables_subsidy", "shed_order_priority"] },

  { id:"tallow", name:"Tallow", station:"tallow", band:"low",
    magnitude:1, electorate:31361,
    held:{rv:1},
    parent:"tallow",
    material_interest:["consumables_subsidy", "volume_rationing"] },

  { id:"quarry_reach", name:"Quarry Reach", station:"quarry", band:"low",
    magnitude:1, electorate:29669,
    held:{gb:1},
    parent:"quarry_reach",
    material_interest:["yard_contracts", "transit_windows"] },

  { id:"drift_north", name:"Drift North", station:"drift", band:"low",
    magnitude:1, electorate:16854,
    held:{cu:1},
    parent:"drift_cans_north",
    material_interest:["consumables_subsidy", "shed_order_priority"] },

  { id:"drift_south", name:"Drift South", station:"drift", band:"low",
    magnitude:1, electorate:16854,
    held:{cu:1},
    parent:"drift_cans_south",
    material_interest:["consumables_subsidy", "shed_order_priority"] },

  { id:"sinter", name:"Sinter", station:"sinter", band:"low",
    magnitude:1, electorate:10753,
    held:{gb:1},
    parent:"sinter",
    material_interest:["yard_contracts", "consumables_subsidy"] },

  { id:"clinker", name:"Clinker", station:"sinter", band:"low",
    magnitude:1, electorate:10752,
    held:{gb:1},
    parent:"sinter",
    material_interest:["yard_contracts", "consumables_subsidy"] },

  { id:"dredge", name:"Dredge", station:"dredge", band:"low",
    magnitude:1, electorate:15356,
    held:{gb:1},
    parent:"dredge",
    material_interest:["transit_windows", "yard_contracts"] },

  { id:"longmoor", name:"Longmoor", station:"selene", band:"external",
    magnitude:1, electorate:37982,
    held:{des:1},
    parent:"selene_stations",
    material_interest:["transit_windows"] },

  { id:"the_bloomery", name:"The Bloomery", station:"bloomery", band:"external",
    magnitude:1, electorate:14392,
    held:{sc:1},
    parent:"the_bloomery",
    material_interest:["transit_windows", "yard_contracts"] },

  { id:"fast_anchor", name:"Fast Anchor", station:"l4", band:"external",
    magnitude:1, electorate:16349,
    held:{sc:1},
    parent:"l4_yards",
    material_interest:["transit_windows", "substrate_supply"] },

  { id:"far_mooring", name:"Far Mooring", station:"achenar", band:"external",
    magnitude:1, electorate:8341,
    held:{sc:1},
    parent:"achenar_point",
    material_interest:["transit_windows", "substrate_supply"] },

  { id:"the_refuge", name:"The Refuge", station:"l5", band:"external",
    magnitude:1, electorate:7339,
    held:{rv:1},
    parent:"l5_refuge",
    material_interest:["transit_windows"] },
];
