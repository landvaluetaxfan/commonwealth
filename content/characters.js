/* CHARACTERS — the fixed roster. Content passes may not invent people.

   NAMING SCHEME — locked.
     Parliament          the legislature (bicameral)
     House of Delegates  the elected chamber
     MP                  Member of Parliament, of any tier
     Prime Minister      head of government, chairs Cabinet
     Ministry            an executive department
     Minister for X      heads a Ministry and sits in Cabinet
   Not: Secretary of State, Department, Secretary-General. The Charter still
   calls the office Secretary-General; nobody has used it in eighty years.
   portrait: filename in img/portraits/ processed with the `registry` palette.
   Omit it and the UI simply renders no portrait. */
const CHARACTERS = [
  { id:"deshan", portrait:"deshan.png",   name:"Rt. Hon. Marit Deshan MP", role:"Prime Minister",
    party:"cu", seat:"Anselm Ring N & Central", relationship:100,
    note:"Liabilities, not buffs. Her record is the thing that can be dug up." },
  { id:"tenaya", portrait:"tenaya.png",   name:"President Osric Tenaya", role:"President",
    party:null, relationship:22,
    note:"Independent. Elected 2284, 51.4%. Reserve powers: dissolution, formation, referral, appointments." },
  { id:"halloran", portrait:"halloran.png", name:"Tarrin Halloran MP", role:"Leader, Halloran group",
    party:"cu", seat:"Ashfield Cans A–D", relationship:12,
    note:"Has the signatures for a leadership ballot if she finds nine more." },
  { id:"vellan", name:"Iren Vellan MP", role:"Minister for Life Support",
    party:"cu", seat:"Perigee Yards", relationship:64,
    note:"Career maintenance union. Holds the Ministry the whole crisis runs through, and is the "+
         "only member of Cabinet the Guild Bench will take a meeting with." },
  { id:"okarie", name:"Desta Okarie MP", role:"Chief Whip",
    party:"cu", seat:"Anselm Ring Outer Decks", relationship:71,
    note:"Reports that things went as well as they could have. Reports this about everything." },
  { id:"ceyhan", portrait:"ceyhan.png",   name:"Ivor Ceyhan", role:"Political editor, The Spindle",
    party:null, relationship:44,
    note:"Will print what he is given and what he is not." },
  { id:"gb_chair", portrait:"gb_chair.png", name:"Chair, Life Support panel", role:"Alliance of Business and Government",
    party:"gb", relationship:18,
    note:"Position unchanged since 2279. The whips do not believe money will move them." },
  { id:"ansar", portrait:"ansar.png",    name:"Sevi Ansar", role:"Deck 9",
    party:null, relationship:55,
    note:"A civilian voice. Used for warmth. Not a lobbyist." }
];
