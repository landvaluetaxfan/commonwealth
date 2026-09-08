/* =============================================================
   MINUTES — internal documents for the Papers register.

   §12.8: the distribution list is the sharpest idea available. Who was
   copied on a memo is a plot point. The cc line tells you who knows
   what, which alliances exist, and who was deliberately left off. A
   struck-through recipient is a story.

   `when` gates a minute on state, so the register fills as the
   government does things rather than arriving complete.
   ============================================================= */

const MINUTES = [

  { id:"min_118", file:"PM/4/2287/118", sitting:1,
    classification:"Restricted — ministerial",
    from:"The Prime Minister",
    to:"Minister for Life Support",
    copy:["Chief Whip","Law Officer","Cabinet Secretary"],
    struck:["Minister for Substrate and Thermal"],
    notCopied:["Coalition liaison (Public Substrate Association)"],
    subject:"Shed order priority — Ashfield Cans",
    body:`I have seen the engineering authority's published order for the current quarter. Ashfield Cans is placed in the fourth tier for the eleventh consecutive year, and eleven thousand four hundred suspended residents are held in that tier.

1. I want the statutory basis for the authority's discretion set out in writing, and specifically whether the order is made under s.12 or under the residual emergency power. The distinction has never been tested and I should like to know why not.
2. The delegation will be received at sixteen fifteen. They should not be told anything I have not first put in front of the Law Officer.
3. Nothing in this minute is to be shared with coalition partners before the division on Thursday.

I am conscious that a government which cannot carry a rights measure through the functional benches is poorly placed to lecture an engineering authority about the limits of its powers. That is not a reason to leave the question unasked.` },

  { id:"min_121", file:"PM/4/2287/121", sitting:2,
    when:{ flags:["board_packed"] },
    classification:"Restricted — ministerial, personal",
    from:"The Chief Whip",
    to:"The Prime Minister",
    copy:["Cabinet Secretary"],
    notCopied:["Minister for Attestation and the Registry","Law Officer"],
    subject:"Guild Bench — after the licensing order",
    body:`You asked how it was received. It was received exactly as you were told it would be.

The panel chair will not take a meeting. She has not said so in terms; she has said that her diary is full until the recess, which is the same thing said politely. The Life Support panel met for forty minutes yesterday and I am told the word used was pattern.

Two of ours on the labour panels have asked, separately and in almost the same words, whether the Order will be laid again for Consumables. I said it would not. I would prefer you did not make that untrue.

Halloran now has five of the nine. I do not think she has the sixth yet. I think she will have it by the end of the month if a second order is laid.

It went as well as it could have.` },

  { id:"min_126", file:"LAW/4/2287/12", sitting:3,
    when:{ flags:["attestation_tightened"] },
    classification:"Restricted — legal advice, privileged",
    from:"The Law Officer",
    to:"The Prime Minister",
    copy:["Cabinet Secretary"],
    notCopied:["Minister for Attestation and the Registry"],
    subject:"Attestation (Lapse and Restoration) Order 2287 — vires",
    body:`You have asked whether the Order is within the powers conferred by the Attestation Act. My view is that it is, narrowly, and that this is not the question you should be asking.

The Act permits the Registry to set the lapse period. It does not require the Registry to consider the distribution of the effect. The effect is nonetheless distributed: on the Bureau's own figures the Order removes electors from Drift, Cinder, Ashfield and the Tannery at between three and four times the rate at which it removes them from Anselm Ring.

1. The Order is lawful.
2. A challenge on the ground of improper purpose would probably fail, because purpose is hard to prove and the stated purpose is administrative.
3. If the Order is in force at a general election, the apportionment ratios of eleven low-band constituencies will have moved. That is not a legal question and I do not offer a view on it.

I would ordinarily copy this to the Minister. I have not.` }

];
