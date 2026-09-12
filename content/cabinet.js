/* =============================================================
   CABINET — the Ministries, as data.

   Bible 3.9 lists them; this makes them a thing the game can hold.
   Two mechanics depend on it:

   1. The President's appointment-refusal power (3.3, power 4) had
      nothing to refuse until now.
   2. Every statutory instrument names an author. A vacant post cannot
      make one — which is the interlock that turns the appointment
      fight and the licensing-board fight into the same fight.

   Life Support is the senior post and the one that ends careers. It is
   the only Ministry whose Minister may be summoned BY the engineering
   authority rather than the reverse, under the Allocation Act.

   The Treasury sits apart and reports directly to the Prime Minister.
   ============================================================= */

const CABINET = [
  { id:"deputy_pm",               name:"Deputy Prime Minister",     title:"Deputy Prime Minister",
    holder:"trottier", party:"psa",
    note:"The junior coalition partner's leader, and the price of the NPP's confidence." },
  { id:"life_support",            name:"Life Support",              title:"Minister for Life Support",
    holder:"vellan", party:"cu", senior:true,
    note:"Summonable by the engineering authority. Raised at every confirmation." },
  { id:"substrate_thermal",       name:"Substrate and Thermal",     title:"Minister for Substrate and Thermal",
    holder:"girard", party:"psa",
    note:"Held by the New Progressive Party, and now from the substrate providers' own seat." },
  { id:"consumables_agriculture", name:"Consumables and Agriculture", title:"Minister for Consumables and Agriculture",
    holder:"ashgrove", party:"cu",
    note:"Sits for the constituency: deck cooperativists and volume-holders, on one roll." },
  { id:"volume_housing",          name:"Volume and Housing",        title:"Minister for Volume and Housing",
    holder:"lee_kuan_yew", party:"cu",
    note:"The defining domestic brief, and the one nobody wants." },
  { id:"transit_orbital",         name:"Transit and Orbital Mechanics", title:"Minister for Transit and Orbital Mechanics",
    holder:"vasmer", party:"psa", note:"" },
  { id:"attestation_registry",    name:"Attestation and the Registry", title:"Minister for Attestation and the Registry",
    holder:"preiss", party:"cu",
    note:"Appoints the licensing boards. Bible 4.6.4 — the sharpest tool in the game." },
  { id:"persons_continuity",      name:"Persons and Continuity",    title:"Minister for Persons and Continuity",
    holder:"marin", party:"rv",
    note:"Given to the Democratic Centre at formation, and held from a district seat rather than the medicine roll." },
  { id:"external_relations",      name:"External Relations",        title:"Minister for External Relations",
    holder:"landry", party:"cu",
    note:"The anchors stand on foreign soil, so this is a domestic brief wearing a hat." },
  { id:"labour_participation",    name:"Labour and Participation",  title:"Minister for Labour and Participation",
    holder:"herrera", party:"psa",
    note:"Owns participation and the divergence threshold as labour policy — the bill everyone argues about." },
  { id:"trade_anchors",           name:"Trade and the Anchors",     title:"Minister for Trade and the Anchors",
    holder:"ivarsen", party:"psa",
    note:"Owns the trade balance, compute exports and the anchor concessions on foreign soil." },
  { id:"closure_development",     name:"Closure and Development",   title:"Minister for Closure and Development",
    holder:"tomasson", party:"rv",
    note:"Owns the closure floor and the low band. The development paradox, as a portfolio." },
  { id:"law_charter",             name:"Law and the Charter",       title:"Minister for Law and the Charter",
    holder:"fenwick", party:"cu",
    note:"The Law Officer in cabinet. Referral, constitutional review, and the amendment nobody will open." },
  { id:"business_house",          name:"Business of the House",     title:"Leader of the House",
    holder:"whitlam", party:"cu",
    note:"Owns the order paper. The slots are the government's scarcest currency." },
  { id:"contingencies",           name:"Contingencies and Civil Authority", title:"Minister for Contingencies and Civil Authority",
    holder:"brakk", party:"cu",
    note:"The civilian answer to the engineering authority. Declaration is easy; termination is the fight." },
  { id:"treasury",                name:"The Treasury",              title:"Treasurer",
    holder:"skye", party:"cu", apart:true,
    note:"Sits apart and reports directly to the Prime Minister." }
];
