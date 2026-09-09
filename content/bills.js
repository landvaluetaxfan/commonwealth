/* BILLS — a bill is data.

   owner    whose bill it is. Giving a partner's bill time on the order
            paper puts them in your debt; giving your own advances nothing
            but your programme. Time is the scarce good that generates
            coalition capital, and it cannot be topped up.
   priority true if it is the thing that partner actually cares about,
            which is worth more capital than routine business.
 `stances` overrides axis inference per party.
   Stance forms: "for" | "against" | "abstain" | {for:n} | {forPct:0..1} | {free:true}
   dualMajority:true means it must carry separately on both benches. */

const BILLS = [
  { id:"divergence", ref:"HC 4/117", stage:"committee", owner:"psa", priority:true,
    referrable:true, signalled:true,   /* Tenaya has privately indicated he would refer this */
    title:"Divergence Threshold (Amendment) Bill",
    summary:"Reduces the statutory divergence threshold from 168 subjective hours to 40. "+
            "An instance separated for longer than the threshold becomes a person in law: "+
            "own rights, own substrate bill, own vote.",
    effectNote:"+1.9M legal persons estimated. Redistribution in six districts.",
    dualMajority:true,
    axes:{ownership:null,personhood:"expansionist",sovereignty:"federal",closure:null},
    stances:{
      /* A stance may split by bench. Popular = district + list. */
      /* These are the forecast counts the whips have given the PM, so they are
         stated explicitly rather than derived. Popular 128 of 240 (needs 121),
         functional 12 of 40 (needs 21). */
      cu:  { popular:{for:68}, functional:{forPct:1} },   /* scales if the licensing boards move seats */  /* five popular rebels: the maintenance bloc hates this bill */
      psa: { popular:{for:34}, functional:{forPct:1} },
      rv:  { popular:{for:3},  functional:{forPct:1} },  /* the three ministers; conference voted against 71-29 */
      upl: { popular:{for:2},  functional:"against" },
      geo: { popular:{for:3},  functional:"against" },
      cl:  { popular:{for:12}, functional:"against" }, /* expansionist in principle, cheap fork-labour in practice */
      sc:  { popular:{for:6},  functional:"against" },
      hul:"against", fh:"against", gb:"against", des:"against"
    },
    onPass:[{law:{divergence_threshold_hours:40}},
            {wire:"DIVERGENCE THRESHOLD CUT TO FORTY HOURS; CENSUS BUREAU BEGINS REGISTRATION"}],
    onFail:[{loyalty:{psa:-14}},
            {wire:"THRESHOLD BILL FAILS ON THE FUNCTIONAL DIVISION"}] },

  { id:"thermal2", ref:"HC 4/094", stage:"second_reading", owner:"cu",
    title:"Thermal Quota Allocation (No. 2) Bill",
    summary:"Reallocates radiator capacity toward the middle band. Vantage High has been "+
            "below statutory reserve since the radiator fault of 6 April.",
    dualMajority:false,
    axes:{ownership:"public",personhood:null,sovereignty:"federal",closure:"integrationist"},
    stances:{ cu:"for", psa:"for", rv:"for", upl:"for", geo:"for", sc:{forPct:0.4}, cl:{forPct:0.3} },
    onPass:[{station:{vantage:{closure:0.04}}},{scalar:{thermal_margin:9}},
            {price:{thermal:-22}},
            {wire:"THERMAL QUOTA REALLOCATED; QUOTA PRICE FALLS SHARPLY"}],
    onFail:[{scalar:{thermal_margin:-4}},{price:{thermal:8}}] },

  { id:"shedorder", ref:"HC 4/061", stage:"blocked", owner:"cu", referrable:true,
    title:"Shed Order (Civilian Oversight) Bill",
    summary:"Places the published shedding priority under civilian review. Touches "+
            "life-support integrity, so the dual test applies.",
    dualMajority:true,
    axes:{ownership:"public",personhood:"expansionist",sovereignty:"federal",closure:"integrationist"},
    stances:{ cu:"for", psa:"for", rv:{for:11}, upl:"for", geo:"for",
              gb:"against", hul:"against", fh:"against", cl:{forPct:0.2}, sc:{forPct:0.35} },
    onPass:[{law:{shed_order_authority:"statute"}},{scalar:{public_standing:6}}],
    onFail:[{loyalty:{cu_halloran:-8}}] },

  { id:"anchor_kepler", ref:"HC 4/103", stage:"upper_house", owner:null,
    title:"Anchor Concession (Kepler) Ratification Bill",
    summary:"Ratifies renewed terms for the Tether 2 anchor, which stands on the sovereign "+
            "territory of an Earth state.",
    dualMajority:false,
    axes:{ownership:"private",personhood:null,sovereignty:"federal",closure:"integrationist"},
    stances:{ cl:"for", cu:{forPct:0.7}, psa:{forPct:0.5}, sc:"against", hul:"against" },
    onPass:[{scalar:{treasury:8}},{station:{kepler:{closure:0.02}}},{price:{transit:-11}}],
    onFail:[{scalar:{treasury:-6}},{wire:"KEPLER CONCESSION LAPSES; EARTH STATE SIGNALS REVIEW"}] },

  { id:"substrate_insurance", ref:"HC 4/121", stage:"drafting", owner:"psa",
    title:"Substrate Insurance (Uprating) Bill",
    summary:"Raises the statutory floor on substrate insurance and removes the means test. "+
            "Failing the current test does not reduce a person's income; it suspends them.",
    effectNote:"Estimated 34,000 fewer default suspensions a year. Cost falls on thermal appropriations.",
    dualMajority:false,
    axes:{ownership:"public",personhood:"expansionist",sovereignty:"federal",closure:"integrationist"},
    stances:{ psa:"for", cu:{forPct:0.8}, upl:"for", geo:"for", rv:{forPct:0.6},
              fh:"against", cl:{forPct:0.25}, hul:"against" },
    onPass:[{scalar:{treasury:-11,public_standing:7}},{loyalty:{psa:12}},
            {station:{ashfield:{suspended:-1800}}},{price:{substrate:-14}},
            {wire:"SUBSTRATE INSURANCE UPRATED; MEANS TEST ABOLISHED"}],
    onFail:[{loyalty:{psa:-13}}] },

  { id:"continuity_registration", ref:"HC 4/129", stage:"drafting", owner:"rv", priority:true,
    title:"Continuity of Person (Registration) Bill",
    summary:"Requires a person to be entered on a continuity register before any instance may be "+
            "reabsorbed, and gives the instance a right to be heard. Root & Vessel has asked for it "+
            "at every coalition meeting since formation.",
    effectNote:"Adds a procedural step to every reabsorption. Fork-labour costs rise.",
    dualMajority:false,
    axes:{ownership:null,personhood:"restrictionist",sovereignty:"federal",closure:null},
    stances:{ rv:"for", cu:{forPct:0.65}, des:"for", hul:{forPct:0.7}, gb:{forPct:0.5},
              psa:"against", cl:"against", upl:"against" },
    onPass:[{loyalty:{rv:18,psa:-14}},
            {wire:"CONTINUITY REGISTER ESTABLISHED; SUBSTRATE LEFT VOTES AGAINST GOVERNMENT BILL"}],
    onFail:[{loyalty:{rv:-16}}] },

  { id:"substrate_public_stake", ref:"HC 4/133", stage:"drafting", owner:"psa",
    title:"Substrate (Public Stake) Bill",
    summary:"Takes a controlling public stake in the three largest substrate providers. "+
            "Air, water, thermal and computation are natural monopolies with captive customers "+
            "and a lethal failure mode; the argument is that one of them is not like the others.",
    effectNote:"Public share of substrate rises from 35 to 60 per cent. Substrate rents fall. "+
               "Four functional seats change hands as corporate voters are extinguished.",
    dualMajority:false,
    axes:{ownership:"public",personhood:"expansionist",sovereignty:"federal",closure:"integrationist"},
    stances:{ psa:"for", cu:{forPct:0.85}, upl:"for", geo:{forPct:0.6}, rv:{forPct:0.4},
              cl:"against", fh:"against", hul:{forPct:0.3}, gb:{forPct:0.2} },
    onPass:[{law:{substrate_public_share:0.6}},{price:{substrate:-26}},
            {scalar:{treasury:-19,public_standing:5}},{loyalty:{psa:16,cl:-20,fh:-14}},
            {wire:"PUBLIC STAKE TAKEN IN SUBSTRATE PROVIDERS; RENTS EXPECTED TO FALL"}],
    onFail:[{loyalty:{psa:-11}},{price:{substrate:6}}] }

];
