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
  { id:"life_support",            name:"Life Support",
    holder:"vellan", party:"cu", senior:true,
    note:"Summonable by the engineering authority. Raised at every confirmation." },
  { id:"substrate_thermal",       name:"Substrate and Thermal",
    holder:"herrera", party:"psa",
    note:"Held by the New Progressive Party as the price of coalition." },
  { id:"consumables_agriculture", name:"Consumables and Agriculture",
    holder:"piastri", party:"cu",
    note:"Deck cooperativist. The only minister who is regularly photographed working." },
  { id:"volume_housing",          name:"Volume and Housing",
    holder:"lee_kuan_yew", party:"cu",
    note:"The defining domestic brief, and the one nobody wants." },
  { id:"transit_orbital",         name:"Transit and Orbital Mechanics",
    holder:"vasmer", party:"psa", note:"" },
  { id:"attestation_registry",    name:"Attestation and the Registry",
    holder:"preiss", party:"cu",
    note:"Appoints the licensing boards. Bible 4.6.4 — the sharpest tool in the game." },
  { id:"persons_continuity",      name:"Persons and Continuity",
    holder:"marin", party:"rv",
    note:"Given to the Democratic Centre at formation. Costs capital to move." },
  { id:"external_relations",      name:"External Relations",
    holder:"landry", party:"cu",
    note:"The anchors stand on foreign soil, so this is a domestic brief wearing a hat." },
  { id:"treasury",                name:"The Treasury",
    holder:"skye", party:"cu", apart:true,
    note:"Sits apart and reports directly to the Prime Minister." }
];
