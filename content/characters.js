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

   The author's cast is all members of the House of Delegates, of one tier or
   another, except the President and the two non-parliamentary voices (the
   press and the deck civilian). A name on the author's list is never below an
   MP.

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
  { id:"vellan", name:"Suravaram Vidyasagar MP", role:"Minister for Life Support",
    party:"cu", seat:"Slipway", relationship:64, office:"minister",
    note:"Career maintenance union. Holds the Ministry the whole crisis runs through, and is the "+
         "only member of Cabinet the Guild Bench will take a meeting with." },
  { id:"herrera", name:"Jason Herrera MP", role:"Minister for Labour and Participation",
    party:"psa", seat:"Kingsmere", relationship:58, office:"minister",
    note:"The coalition partner's price, now in the portfolio the threshold bill is really about." },
  { id:"piastri", name:"Kosta Piastri MP", role:"",
    party:"cu", seat:"Kiln End—Cordage", relationship:61,
    note:"Backbench. Deck cooperativist, and the only minister who was regularly photographed working." },
  { id:"lee_kuan_yew", name:"Alexandria Lee Kuan Yew MP", role:"Minister for Volume and Housing",
    party:"cu", seat:"Hollowmere", relationship:52, office:"minister",
    note:"The defining domestic brief, and the one nobody wants." },
  { id:"vasmer", name:"Henrik Vasmer MP", role:"Minister for Transit and Orbital Mechanics",
    party:"psa", seat:"The Warrens", relationship:47, office:"minister",
    note:"Runs the brief that decides which station is close and which is abandoned." },
  { id:"preiss", name:"Luke Preiss MP", role:"Minister for Attestation and the Registry",
    party:"cu", seat:"Registry Walk", relationship:55, office:"minister",
    note:"Appoints the licensing boards. Bible 4.6.4 — the sharpest tool in the game." },
  { id:"marin", name:"Florence Marin MP", role:"Minister for Persons and Continuity",
    party:"rv", seat:"Concord—Bellfield", relationship:49, office:"minister",
    note:"Given to the Democratic Centre at formation. The portfolio is the party's whole argument, and she has never had to make it in public." },
  { id:"landry", name:"Jean Landry MP", role:"Minister for External Relations",
    party:"cu", seat:"Anchor Head—Cable Row", relationship:43, office:"minister",
    note:"The anchors stand on foreign soil, so this is a domestic brief wearing a hat." },
  { id:"skye", name:"Aster Skye MP", role:"Treasurer",
    party:"cu", seat:"Deep Deck", relationship:66, office:"minister",
    note:"Sits apart and reports directly to the Prime Minister. Knows what everything costs." },
  /* Two portfolios held from functional seats: the sector elects the minister
     who regulates it, which is the whole argument about the tier in one line. */
  { id:"ashgrove", name:"Selim Ashgrove MP", role:"Minister for Consumables and Agriculture",
    party:"cu", functional:"fc_consumables", relationship:57, office:"minister",
    note:"Sits for the constituency: deck cooperativists and volume-holders, on one roll." },
  { id:"girard", name:"Vesna Girard MP", role:"Minister for Substrate and Thermal",
    party:"psa", functional:"fc_substrate", relationship:50, office:"minister",
    note:"Elected by 411 corporate voters to set the policy that prices their own product." },
  { id:"abadi", name:"Nadia Abadi MP", role:"",
    party:"rv", functional:"fc_medicine", relationship:49,
    note:"Backbench. Sits for the medicine roll, and argues the ministry's case from it rather than for it." },
  { id:"okarie", name:"Anil Devi MP", role:"Chief Whip",
    party:"cu", seat:"Ropewalk", relationship:71, office:"whip",
    note:"Reports that things went as well as they could have. Reports this about everything." },

  /* ---- the opposition ---- */
  { id:"cutter", name:"Patrick Cutter MP", role:"Shadow Minister for Persons and Continuity",
    party:"cl", seat:"Space Elevator", relationship:24, office:"shadow",
    note:"Expansionist for commercial reasons: more persons, more contracts, more counterparties." },
  { id:"jeon", name:"Mathieu Jeon MP", role:"Shadow Minister for Life Support",
    party:"cl", seat:"Charter Green", relationship:18, office:"shadow",
    note:"Would rather be answering for the Ministry than asking about it." },
  { id:"otrione", name:"Paul Otrione MP", role:"",
    party:"cl", seat:"Assembly Walk", relationship:26,
    note:"Backbench. Market expansionist on substrate, which the government's own partner finds useful." },
  { id:"rkim", name:"Ryan Kim MP", role:"Shadow Minister for Consumables and Agriculture",
    party:"cl", seat:"Allocation Square", relationship:15, office:"shadow",
    note:"Imported consumables are cheaper and this is the shadow portfolio that says so." },
  { id:"wang", name:"Ryan Wang MP", role:"Shadow Minister for Volume and Housing",
    party:"cl", seat:"The Exchange", relationship:30, office:"shadow",
    note:"Elevator money. Believes the volume shortage is a pricing problem, and is not entirely wrong." },
  { id:"caillet", name:"Apollo Caillet MP", role:"",
    party:"cl", seat:"Windward—Leeside", relationship:22,
    note:"Backbench. Shipping interests, openly; the transit brief was the one his donors cared about." },
  { id:"caprica", name:"Jonathan Caprica MP", role:"Shadow Minister for Attestation and the Registry",
    party:"cl", seat:"Marlowe Green", relationship:27, office:"shadow",
    note:"Wants the boards depoliticised, which is a position with no constituents." },
  { id:"watkins", name:"Darren Watkins Jr. MP", role:"Leader of the Opposition",
    party:"cl", seat:"Anselm Proper", relationship:19, office:"opposition",
    note:"Leads the largest party outside the coalition. The government's alternative, and says so." },
  { id:"raj", name:"Chandrama Raj MP", role:"Shadow Minister for External Relations",
    party:"cl", seat:"Old Foundation", relationship:21, office:"shadow",
    note:"Accommodationist toward Earth states, and does not pretend otherwise." },
  { id:"ferno", name:"Laura Ferno MP", role:"Shadow Minister for the Treasury",
    party:"cl", seat:"Cable End", relationship:33, office:"shadow",
    note:"Balances the shadow books to the tenth of a point and tells anyone who will listen." },

  /* ---- party leaders ---- */
  { id:"trottier", name:"Mandelina Trottier MP", role:"Deputy Prime Minister; Leader, New Progressive Party",
    party:"psa", seat:"Substrate Quarter", relationship:54, office:"deputy",
    note:"The junior coalition partner's leader. Shares the government's economics and despises its personhood line." },
  { id:"laughon", name:"Nick Laughon MP", role:"Leader, Home Rule",
    party:"sc", seat:"Bondsville Centre", relationship:38, office:"leader",
    note:"Speaks for the stations that want to be left alone, and cannot whip his own members." },
  { id:"wilde_hayward", name:"Ronan Wilde-Hayward MP", role:"Leader, Association of Engineers and Systems",
    party:"hul", seat:"The Array", relationship:29, office:"leader",
    note:"Habitat as lifeboat. Engineering authority supreme, and says so in that order." },
  { id:"park", name:"Ryan Jung-Hee Park MP", role:"Leader, Democratic Centre",
    party:"rv", seat:"Quorum", relationship:41, office:"leader",
    note:"Continuity of soul. Economically left, culturally immovable." },
  { id:"bluespan", name:"Alan Bluespan III MP", role:"Leader, Party of Property Owners",
    party:"fh", seat:"Drybank", relationship:20, office:"leader",
    note:"Volume owners, property absolutists, anti-Georgist to the point of obsession." },
  { id:"hatt", name:"Edward Hatt MP", role:"Leader, Alliance of Business and Government",
    party:"gb", functional:"fc_attestation", relationship:45, office:"leader",
    note:"Elected by the functional franchises. Does not campaign, and no district can vote him out." },
  { id:"edelstein_powell", name:"Rachel Edelstein-Powell MP", role:"Leader, One-G",
    party:"des", seat:"Brightwell", relationship:32, office:"leader",
    note:"Gravity as birthright, orbital life as temporary exile, and the rhetoric to match." },
  { id:"wheeler", name:"Marion Wheeler MP", role:"Leader, Single Tax Party",
    party:"geo", relationship:57, office:"leader",
    note:"Volume tax, land value tax, nothing else. Correct. List tier only." },
  { id:"lindegaard", name:"Aalborg Lindegaard MP", role:"Leader, Common Kind",
    party:"upl", relationship:50, office:"leader",
    note:"Two seats, permanently kingmaker-adjacent. Price is always the same thing." },

  /* ---- the expanded front benches ---- */
  { id:"dulac", name:"Ferran Dulac MP", role:"",
    party:"cu", seat:"The Beds", relationship:53,
    note:"Backbench. The maintenance bloc's man, and no longer the minister who owns the bill." },
  { id:"ivarsen", name:"Marit Ivarsen MP", role:"Minister for Trade and the Anchors",
    party:"psa", seat:"Amphitheatre", relationship:50, office:"minister",
    note:"Owns the trade balance, compute exports and the anchor concessions on foreign soil." },
  { id:"fenwick", name:"Adaeze Fenwick MP", role:"Minister for Law and the Charter",
    party:"cu", seat:"Crowfield", relationship:58, office:"minister",
    note:"The Law Officer in cabinet. Referral, constitutional review, and the amendment nobody will open." },
  { id:"whitlam", name:"Imre Whitlam MP", role:"Leader of the House",
    party:"cu", seat:"Spinward Reach", relationship:56, office:"minister",
    note:"Owns the order paper. The slots are his to give away, which makes him everyone's friend and nobody's." },
  { id:"brakk", name:"Sunniva Brakk MP", role:"Minister for Contingencies and Civil Authority",
    party:"cu", seat:"Ambrose Fields", relationship:48, office:"minister",
    note:"The civilian answer to the engineering authority. Declaration is easy; termination is the fight, and it is hers." },
  { id:"sorrel", name:"Kel Sorrel MP", role:"Shadow Minister for Labour and Participation",
    party:"cl", seat:"Rookworks East", relationship:23, office:"shadow",
    note:"Would rather the threshold were a contract than a right, and says so." },
  { id:"nadeau", name:"Vesna Nadeau MP", role:"",
    party:"cl", seat:"Halvard Centre", relationship:25,
    note:"Backbench. Wants the anchors opened to consortium capital and the trade index treated as a scoreboard." },
  { id:"mbeki", name:"Yusuf Mbeki MP", role:"Shadow Minister for Closure and Development",
    party:"cl", seat:"The Bourse", relationship:19, office:"shadow",
    note:"Thinks closure targets are a subsidy by another name, and is not entirely wrong." },
  { id:"kaunda", name:"Ilse Kaunda MP", role:"Shadow Minister for Law and the Charter",
    party:"cl", seat:"Exchange Alley—Threadmarket", relationship:28, office:"shadow",
    note:"A lawyer's lawyer. The Charter's holes are, to her, the point." },
  { id:"ferreira", name:"Petra Ferreira MP", role:"Shadow Minister for Contingencies",
    party:"cl", seat:"Layover Centre", relationship:24, office:"shadow",
    note:"Wants the emergency framework codified, which everyone agrees with and nobody will vote for." },

  /* Shadow portfolios held from functional seats, mirroring the government's
     own functional ministers: the sector elects the shadow who scrutinises it,
     as it elects the minister who regulates it. */
  { id:"quintana", name:"Petra Quintana MP", role:"Shadow Minister for Substrate and Thermal",
    party:"cl", functional:"fc_substrate", relationship:27, office:"shadow",
    note:"Elected by the hosting providers to scrutinise the minister they price." },
  { id:"ijaz", name:"Anouk Ijaz MP", role:"Shadow Minister for Transit and Orbital Mechanics",
    party:"cl", functional:"fc_transit", relationship:24, office:"shadow",
    note:"A certified transfer pilot, and the only shadow brief with a licence behind it." },
  { id:"estevez", name:"Lorcan Estévez MP", role:"Shadow Minister for Trade and the Anchors",
    party:"cl", functional:"fc_elevator", relationship:23, office:"shadow",
    note:"Anchor lessee. Wants the concessions opened, and speaks for the balance sheet that owns them." },

  /* ---- the chair of the House ---- */
  { id:"king", name:"Adam King MP", role:"",
    party:"ind", seat:"Colonnade", relationship:40,
    note:"Backbench. Independent since the presidency, and does not regret it." },

  /* ---- other seated members ---- */
  { id:"clarke", name:"Benj Clarke MP", role:"Shadow Minister for Business of the House",
    party:"cl", seat:"Meridian Loop", relationship:35, office:"shadow",
    note:"Watches the order paper for the opposition. Market liberal, which here means elevator and loop money." },
  { id:"tomasson", name:"Haukur Tómasson MP", role:"Minister for Closure and Development",
    party:"rv", seat:"Brant North", relationship:47, office:"minister",
    note:"Owns the closure floor and the low band. Continuity of soul, and votes it every time." },

  /* ---- the presidency ---- */
  { id:"tenaya", portrait:"tenaya.png",   name:"President Jaco van Ryneveld", role:"President",
    party:null, relationship:22,
    note:"Independent. Elected 2284, 51.4%. Biologically augmented: cat ears. "+
         "Reserve powers: dissolution, formation, referral, appointments." },

  /* ---- the faction leader ---- */
  { id:"halloran", portrait:"halloran.png", name:"Dan Czarnecki MP", role:"Leader, Czarnecki group",
    party:"cu", seat:"Tier Four", relationship:12,
    note:"Has the signatures for a leadership ballot if he finds nine more." },

  /* ---- the panel chair ---- */
  { id:"gb_chair", portrait:"gb_chair.png", name:"Kazuya Tanako MP", role:"Chair, Life Support panel",
    party:"gb", functional:"fc_lifesupport", relationship:18,
    note:"Functional tier. Position unchanged since 2279. The whips do not believe money will move them." },

  /* ---- non-parliamentary voices ---- */
  { id:"ceyhan", portrait:"ceyhan.png",   name:"Ivor Ceyhan", role:"Political editor, The Spindle",
    party:null, relationship:44,
    note:"Will print what he is given and what he is not." },
  { id:"ansar", portrait:"ansar.png",    name:"Sevi Ansar", role:"Deck 9",
    party:null, relationship:55,
    note:"A civilian voice. Used for warmth. Not a lobbyist." }
];
