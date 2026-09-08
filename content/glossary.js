/* GLOSSARY — the closed vocabulary of the setting.
   Every setting-specific term a player meets must appear here.

   term       what appears in prose (matched case-insensitively, first use only)
   gloss      ONE line. If it needs two, the concept is too big for one term.
   handle     the familiar real-world shape it hangs on. This is the teaching
              device: a new idea attached to a shape the player already owns.
   introduced event id where the player first meets it, or null for "assumed"
   assumed    true = ordinary English in this world, needs no teaching moment
   cluster    terms that cannot be taught apart share a cluster name. A cluster
              counts as ONE unit of teaching load. You cannot explain a
              divergence threshold without also explaining fork and instance,
              so those three are one idea, not three.

   THE RULE: one cluster per event. The linter (tools/lint.js) enforces it.
*/

const GLOSSARY = [
  { term:"fork", cluster:"copies", gloss:"A running copy of a person.",
    handle:"An identical twin who has been awake somewhere else.",
    introduced:"briefing_divergence" },

  { term:"instance", cluster:"copies", gloss:"A fork that is still legally the same person as its root.",
    handle:"A branch office acting under head office's name.",
    introduced:"briefing_divergence" },

  { term:"divergence threshold", cluster:"copies", gloss:"The hours of separate experience after which a copy becomes a person in law.",
    handle:"A legal line-drawing exercise, like any age of majority.",
    introduced:"briefing_divergence" },

  { term:"suspension", cluster:"cold", gloss:"A mind held intact and not running. Not death.",
    handle:"An induced coma nobody has agreed to end.",
    introduced:"halloran_signatures" },

  { term:"shed order", cluster:"cold", gloss:"The published list deciding who stops running first in a power shortfall.",
    handle:"A triage list, written in advance, by whoever holds the pen.",
    introduced:"halloran_signatures" },

  { term:"substrate", cluster:"cold", gloss:"The hardware an emulated mind runs on. You pay rent to exist on it.",
    handle:"Rent, except the landlord can switch you off.",
    introduced:"halloran_signatures" },

  { term:"thermal margin", cluster:"heat", gloss:"Spare radiator capacity. Every watt of thought becomes heat that must be dumped.",
    handle:"Grid capacity on the hottest day of the year.",
    introduced:"vantage_radiator" },

  { term:"engineering authority", cluster:"heat", gloss:"The body that may act on life-support integrity without asking a minister.",
    handle:"A regulator with emergency powers and no election to lose.",
    introduced:"vantage_radiator" },

  { term:"functional constituency", cluster:"functional", gloss:"A seat elected by a profession or industry rather than a place.",
    handle:"The House of Lords, if the Lords were chosen by their trade bodies.",
    introduced:"gb_approach" },

  { term:"dual majority", cluster:"functional", gloss:"Some bills must carry separately among functional and elected members.",
    handle:"A second chamber that sits inside the first one.",
    introduced:"gb_approach" },

  { term:"licensure", cluster:"functional", gloss:"Professional certification. It decides who votes in a functional seat.",
    handle:"A medical licence that also comes with a ballot.",
    introduced:"gb_approach" },

  { term:"attestation", gloss:"Proof you are one unique person. Required to vote or post.",
    handle:"Voter ID, for a world where copies are cheap.",
    introduced:"cluster_flag" },

  { term:"closure", gloss:"The fraction of a habitat's material cycle it can sustain without imports.",
    handle:"How long the town survives if the road closes.",
    cluster:"cold", introduced:"halloran_signatures" },

  { term:"revenant", gloss:"A member returned on the party list after losing a district.",
    handle:"A candidate the party parachutes back in through the back door.",
    cluster:"caucus", introduced:"halloran_finds_nine" },

  { term:"reabsorb", cluster:"copies", gloss:"To merge an instance back into its root, ending it as a separate life.",
    handle:"Closing the branch office and filing its paperwork.",
    introduced:"briefing_divergence" },

  { term:"Guild Bench", cluster:"functional", gloss:"The bloc holding functional seats. Contests no district, cannot be voted out.",
    handle:"Hereditary peers, if the peerage were a trade union.",
    introduced:"gb_approach" },

  { term:"tier four", cluster:"cold", gloss:"The lowest band of the shed order. First to stop, last to be restored.",
    handle:"Bottom of the transplant list.",
    introduced:"halloran_signatures" },

  { term:"clock rate", cluster:"clock", gloss:"How fast an emulated mind runs. Money buys speed; poverty is slowness.",
    handle:"Working eight-hour days while your rivals work sixty-four.",
    introduced:"ch2_psa_conference" },

  { term:"House of Delegates", cluster:"functional", gloss:"The elected chamber of Parliament. 280 seats, majority 141.",
    handle:"The Commons, with a different name and a third tier.",
    introduced:"gb_approach" },

  { term:"Perigee", gloss:"Metonym for the government, from the Charter signed there.",
    handle:"Washington, Brussels, Whitehall — the place standing in for the people in it.",
    assumed:true },

  { term:"emulation", gloss:"A person running as software rather than in a body.", assumed:true },
  { term:"root",      gloss:"The original, of which instances are copies.",       assumed:true },
  { term:"the Charter", gloss:"The Perigee Charter. The founding document.",      assumed:true },
  { term:"habitat",   gloss:"A station. Where people live.",                       assumed:true }
];
