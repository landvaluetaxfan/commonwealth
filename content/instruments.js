/* =============================================================
   STATUTORY INSTRUMENTS

   A bill needs a majority and cannot be undone. An instrument needs
   no majority and can be revoked. The player is meant to learn that
   the fast tool is the deniable one and the slow tool is the
   permanent one.

     author         a cabinet post id. Vacant post, no instrument.
     procedure      "negative" — in force at once, stands unless prayed
                    against within prayer_window sittings.
                    "affirmative" — needs a simple popular majority first.
     effects        applied when it takes effect
     reverse        applied if it is prayed against or revoked
     prayer_stances how parties vote on a prayer to annul. Omitted
                    parties are assumed to oppose the government.
     political_cost applied on making it, whatever happens after

   THE LICENSING BOARD INSTRUMENT IS THE SPINE OF CHAPTER ONE.
   Franchise in a functional constituency runs through professional
   licensure, and the government appoints the boards. Widening the
   Life Support Engineering electorate shifts functional seats without
   a bill. It is the only available answer to the HC 4/117 trap, and
   it must be discoverable, costly, and ugly.
   ============================================================= */

const INSTRUMENTS = [

  { id:"si_2287_44",
    title:"Life Support Engineering (Licensing) Order 2287",
    number:"SI 2287/44",
    author:"attestation_registry",
    procedure:"negative",
    prayer_window:6,
    revocable:true,
    summary:"Widens the Life Support Engineering licence to admit integrity technicians "+
            "certified before 2261, adding roughly 900 electors to a constituency of 4,100. "+
            "The new electors are disproportionately maintenance-union members.",
    effect_note:"Moves functional seats over 2–4 sittings. The Guild Bench will not divide "+
                "with a government that has done this.",
    effects:[ { seats:{ cu:{functional:2}, gb:{functional:-2} } },
              { flag:"board_packed" },
              { loyalty:{ gb:-30 } },
              { relationship:{ gb_chair:-40 } },
              { signatures:2 },
              { wire:"LICENSING ORDER LAID; GUILD BENCH SEEKS EMERGENCY DEBATE" } ],
    reverse:[ { seats:{ cu:{functional:-2}, gb:{functional:2} } },
              { unflag:"board_packed" } ],
    political_cost:[ { scalar:{ public_standing:-5 } }, { loyalty:{ cu_halloran:-9 } } ],
    prayer_stances:{ cu:"against", psa:"against", rv:{}, gb:"for", hul:"for", fh:"for", cl:"for" } },

  { id:"si_2287_51",
    title:"Thermal Allocation (Vantage High) Emergency Order 2287",
    number:"SI 2287/51",
    author:"life_support",
    procedure:"affirmative",
    revocable:true,
    summary:"Diverts thermal quota from Anselm Ring to Vantage High for the duration of the "+
            "radiator fault. Touches life-support integrity, so the affirmative procedure "+
            "applies and the House must approve it before it takes effect.",
    effect_note:"Anselm Ring pays for it, and Anselm Ring notices.",
    effects:[ { scalar:{ thermal_margin:7 } }, { price:{ thermal:-9 } },
              { station:{ vantage:{ suspended:-900 } } },
              { flag:"vantage_diverted" },
              { wire:"EMERGENCY THERMAL DIVERSION APPROVED FOR VANTAGE HIGH" } ],
    reverse:[ { scalar:{ thermal_margin:-7 } }, { price:{ thermal:9 } } ],
    political_cost:[ { scalar:{ treasury:-6 } } ],
    prayer_stances:{ cu:"against", psa:"against", cl:"for", fh:"for" } },

  { id:"si_2287_58",
    title:"Attestation (Lapse and Restoration) Order 2287",
    number:"SI 2287/58",
    author:"attestation_registry",
    procedure:"negative",
    prayer_window:6,
    revocable:true,
    summary:"Shortens the period before an unrenewed attestation lapses from four years to "+
            "eighteen months, and simplifies restoration for those who apply in person.",
    effect_note:"Attestation gates the vote. Shortening the lapse period removes electors, "+
                "and it removes them unevenly: from Drift, Cinder and Ashfield first.",
    effects:[ { station:{ ashfield:{attested:-0.03}, drift:{attested:-0.04},
                          cinder:{attested:-0.035}, tannery:{attested:-0.03} } },
              { flag:"attestation_tightened" },
              { loyalty:{ gb:6, hul:8, psa:-14, cu_halloran:-12 } },
              { wire:"REGISTRY ORDER SHORTENS ATTESTATION LAPSE TO EIGHTEEN MONTHS" } ],
    reverse:[ { station:{ ashfield:{attested:0.03}, drift:{attested:0.04},
                          cinder:{attested:0.035}, tannery:{attested:0.03} } },
              { unflag:"attestation_tightened" } ],
    political_cost:[ { scalar:{ public_standing:-3 } } ],
    prayer_stances:{ cu:{}, psa:"for", rv:"for", upl:"for", geo:"for", gb:"against", hul:"against" } },

  { id:"si_2287_47",
    title:"Legal Practice (Admissions) Order 2287",
    number:"SI 2287/47",
    author:"attestation_registry",
    procedure:"negative",
    prayer_window:6,
    revocable:true,
    summary:"Admits reclassification practitioners to the Legal roll without the full "+
            "instrument-of-call, adding some 1,600 electors to a constituency of 5,200. "+
            "Reclassification practice is young, emulation-heavy, and votes accordingly.",
    effect_note:"Two more functional seats, and a second permanent enemy. Packing one board "+
                "is a manoeuvre; packing two is a policy, and the chamber will call it one.",
    effects:[ { seats:{ psa:{functional:2}, gb:{functional:-1}, fh:{functional:-1} } },
              { flag:"legal_board_packed" },
              { loyalty:{ gb:-20, fh:-18, psa:10 } },
              { signatures:3 },
              { wire:"SECOND LICENSING ORDER LAID; OPPOSITION CALLS IT A PATTERN" } ],
    reverse:[ { seats:{ psa:{functional:-2}, gb:{functional:1}, fh:{functional:1} } },
              { unflag:"legal_board_packed" } ],
    political_cost:[ { scalar:{ public_standing:-8 } }, { loyalty:{ cu_halloran:-14 } } ],
    prayer_stances:{ cu:{ifLoyaltyBelow:30}, psa:"against", rv:{ifLoyaltyBelow:35},
                     gb:"for", hul:"for", fh:"for", cl:"for" } }

];
