/* CHARACTERS — the fixed roster. Additions are deliberate canon: a content
   pass may not invent a person, but the front benches are cast here in full
   so the seat table can mark who is not a backbencher.

   office — the one-word badge the orbit seat table shows beside a member.
   It is a mark, not a job title; `role` carries the full title.
     pm          Prime Minister
     minister    Cabinet minister
     opposition  Leader of the Opposition
     shadow      Shadow minister
     leader      leader of a party
     whip        Chief Whip
   The Speaker is NOT an office here: it is a property of the seat
   (`speaker:true`), because the Chair belongs to the House, not the person.
   Rename people freely — they are referenced by id, and tools/renametest.js
   checks that a rename preserves behaviour.

   NAMING SCHEME — locked.
     Parliament          the legislature (bicameral)
     House of Delegates  the elected chamber
     MP                  Member of Parliament, of any tier
     Prime Minister      head of government, chairs Cabinet
     Ministry            an executive department
     Minister for X      heads a Ministry and sits in Cabinet
   Not: Secretary of State, Department, Secretary-General. The Charter still
   calls the office Secretary-General; nobody has used it in eighty years.
   seat — the constituency a member sits for. It must be a real one:
   two of these previously named constituencies that did not exist
   ("Anselm Ring N & Central", "Homestead A-D"), each straddling two,
   and nothing caught it because nothing linked a person to a seat.

   portrait: filename in img/portraits/ processed with the `registry` palette.
   Omit it and the UI simply renders no portrait. */
const CHARACTERS = [
  /* ---- the government ---- */
  { id:"flash", portrait:"flash.png",   name:"Rt. Hon. Adriana Flash MP", role:"Prime Minister",
    party:"cu", seat:"First Spin", relationship:100, office:"pm",
    note:"Liabilities, not buffs. Her record is the thing that can be dug up." },
  { id:"vellan", name:"Iren Vellan MP", role:"Minister for Life Support",
    party:"cu", seat:"Slipway", relationship:64, office:"minister",
    note:"Career maintenance union. Holds the Ministry the whole crisis runs through, and is the "+
         "only member of Cabinet the Guild Bench will take a meeting with." },
  { id:"onyema", name:"Lior Onyema MP", role:"Minister for Substrate and Thermal",
    party:"psa", seat:"Kingsmere", relationship:58, office:"minister",
    note:"The coalition partner's price, in a portfolio that touches every radiator in the union." },
  { id:"kabelo", name:"Prue Kabelo MP", role:"Minister for Consumables and Agriculture",
    party:"cu", seat:"Kiln End—Cordage", relationship:61, office:"minister",
    note:"Deck cooperativist. The only minister who is regularly photographed working." },
  { id:"marchetti", name:"Tamsin Marchetti MP", role:"Minister for Volume and Housing",
    party:"cu", seat:"Hollowmere", relationship:52, office:"minister",
    note:"The defining domestic brief, and the one nobody wants." },
  { id:"halstead", name:"Tomas Halstead MP", role:"Minister for Transit and Orbital Mechanics",
    party:"psa", seat:"The Warrens", relationship:47, office:"minister",
    note:"Runs the brief that decides which station is close and which is abandoned." },
  { id:"aldiss", name:"Rowan Aldiss MP", role:"Minister for Attestation and the Registry",
    party:"cu", seat:"Registry Walk", relationship:55, office:"minister",
    note:"Appoints the licensing boards. Bible 4.6.4 — the sharpest tool in the game." },
  { id:"ndiaye", name:"Perpetua Ndiaye MP", role:"Minister for Persons and Continuity",
    party:"rv", seat:"Concord—Bellfield", relationship:49, office:"minister",
    note:"Given to the Democratic Centre at formation. Costs capital to move." },
  { id:"vane", name:"Hollis Vane MP", role:"Minister for External Relations",
    party:"cu", seat:"Anchor Head—Cable Row", relationship:43, office:"minister",
    note:"The anchors stand on foreign soil, so this is a domestic brief wearing a hat." },
  { id:"blaise", name:"Mireille Blaise MP", role:"Treasurer",
    party:"cu", seat:"Deep Deck", relationship:66, office:"minister",
    note:"Sits apart and reports directly to the Prime Minister. Knows what everything costs." },
  { id:"okarie", name:"Desta Okarie MP", role:"Chief Whip",
    party:"cu", seat:"Ropewalk", relationship:71, office:"whip",
    note:"Reports that things went as well as they could have. Reports this about everything." },

  /* ---- the opposition ---- */
  { id:"ashworth", name:"Kofi Ashworth MP", role:"Leader of the Opposition",
    party:"cl", seat:"Anselm Proper", relationship:24, office:"opposition",
    note:"Leads the largest party outside the coalition. The government's alternative, and says so." },
  { id:"rakoto", name:"Otto Rakoto MP", role:"Shadow Minister for Life Support",
    party:"cl", seat:"Charter Green", relationship:18, office:"shadow",
    note:"Would rather be answering for the Ministry than asking about it." },
  { id:"abiodun", name:"Isolde Abiodun MP", role:"Shadow Minister for Substrate and Thermal",
    party:"cl", seat:"Assembly Walk", relationship:26, office:"shadow",
    note:"Market expansionist on substrate, which the government's own partner finds useful." },
  { id:"kirilenko", name:"Tomas Kirilenko MP", role:"Shadow Minister for Consumables and Agriculture",
    party:"cl", seat:"Allocation Square", relationship:15, office:"shadow",
    note:"Imported consumables are cheaper and this is the shadow portfolio that says so." },
  { id:"leclair", name:"Gustav Leclair MP", role:"Shadow Minister for Volume and Housing",
    party:"cl", seat:"The Exchange", relationship:30, office:"shadow",
    note:"Elevator money. Believes the volume shortage is a pricing problem, and is not entirely wrong." },
  { id:"petrov", name:"Constance Petrov MP", role:"Shadow Minister for Transit and Orbital Mechanics",
    party:"cl", seat:"Windward—Leeside", relationship:22, office:"shadow",
    note:"Shipping interests, openly. The shadow brief is the one her donors care about." },
  { id:"rasmussen", name:"Viggo Rasmussen MP", role:"Shadow Minister for Attestation and the Registry",
    party:"cl", seat:"Marlowe Green", relationship:27, office:"shadow",
    note:"Wants the boards depoliticised, which is a position with no constituents." },
  { id:"kaur", name:"Hollis Kaur MP", role:"Shadow Minister for Persons and Continuity",
    party:"cl", seat:"Space Elevator", relationship:19, office:"shadow",
    note:"Expansionist for commercial reasons: more persons, more contracts, more counterparties." },
  { id:"zubiri", name:"Elsa Zubiri MP", role:"Shadow Minister for External Relations",
    party:"cl", seat:"Old Foundation", relationship:21, office:"shadow",
    note:"Accommodationist toward Earth states, and does not pretend otherwise." },
  { id:"crowther", name:"Caspar Crowther MP", role:"Shadow Minister for the Treasury",
    party:"cl", seat:"Cable End", relationship:33, office:"shadow",
    note:"Balances the shadow books to the tenth of a point and tells anyone who will listen." },

  /* ---- party leaders ---- */
  { id:"pemberton", name:"Beatrix Pemberton MP", role:"Leader, New Progressive Party",
    party:"psa", seat:"Substrate Quarter", relationship:54, office:"leader",
    note:"Shares the government's economics and despises its personhood line." },
  { id:"novak", name:"Agnes Novak MP", role:"Leader, Home Rule",
    party:"sc", seat:"Bondsville Centre", relationship:38, office:"leader",
    note:"Speaks for the stations that want to be left alone, and cannot whip her own members." },
  { id:"ferrand", name:"Freya Ferrand MP", role:"Leader, Association of Engineers and Systems",
    party:"hul", seat:"The Array", relationship:29, office:"leader",
    note:"Habitat as lifeboat. Engineering authority supreme, and says so in that order." },
  { id:"lokafor", name:"Lucian Okafor MP", role:"Leader, Democratic Centre",
    party:"rv", seat:"Quorum", relationship:41, office:"leader",
    note:"Continuity of soul. Economically left, culturally immovable." },
  { id:"aliyev", name:"Rafiq Aliyev MP", role:"Leader, Party of Property Owners",
    party:"fh", seat:"Drybank", relationship:20, office:"leader",
    note:"Volume owners, property absolutists, anti-Georgist to the point of obsession." },
  { id:"ostrowski", name:"Halima Ostrowski", role:"Leader, Alliance of Business and Government",
    party:"gb", relationship:45, office:"leader",
    note:"Speaks for the functional tier and is not elected to anything. Does not need to be." },
  { id:"peverell", name:"Marta Peverell MP", role:"Leader, One-G",
    party:"des", seat:"Brightwell", relationship:32, office:"leader",
    note:"Gravity as birthright, orbital life as temporary exile." },
  { id:"quist", name:"Saskia Quist", role:"Leader, Single Tax Party",
    party:"geo", relationship:57, office:"leader",
    note:"Volume tax, land value tax, nothing else. Correct. List tier only." },
  { id:"vance", name:"Emeric Vance", role:"Leader, Common Kind",
    party:"upl", relationship:50, office:"leader",
    note:"Two seats, permanently kingmaker-adjacent. Price is always the same thing." },

  /* ---- unseated and non-parliamentary ---- */
  { id:"tenaya", portrait:"tenaya.png",   name:"President Osric Tenaya", role:"President",
    party:null, relationship:22,
    note:"Independent. Elected 2284, 51.4%. Reserve powers: dissolution, formation, referral, appointments." },
  { id:"halloran", portrait:"halloran.png", name:"Tarrin Halloran MP", role:"Leader, Halloran group",
    party:"cu", seat:"Tier Four", relationship:12,
    note:"Has the signatures for a leadership ballot if she finds nine more." },
  { id:"ceyhan", portrait:"ceyhan.png",   name:"Ivor Ceyhan", role:"Political editor, The Spindle",
    party:null, relationship:44,
    note:"Will print what he is given and what he is not." },
  { id:"gb_chair", portrait:"gb_chair.png", name:"Chair, Life Support panel", role:"Guild Bench",
    party:"gb", relationship:18,
    note:"Position unchanged since 2279. The whips do not believe money will move them." },
  { id:"ansar", portrait:"ansar.png",    name:"Sevi Ansar", role:"Deck 9",
    party:null, relationship:55,
    note:"A civilian voice. Used for warmth. Not a lobbyist." }
];
