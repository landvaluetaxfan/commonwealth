/* ============================================================
   EVENTS — this is the file you will spend the project in.

   Every event is a plain object. To add one, copy an existing
   entry and change it. The engine never needs to know it exists.

     id       unique string
     title    shown in the panel header and the log
     when     conditions (see engine CONDITIONS) — omit for always
     weight   higher fires first among eligible events
     once     true = fires at most once
     speaker  character id, or null
     body     the prose
     choices  [{ label, effects, result }]
     image    { src, palette, caption, credit }  — optional; see CONTENT_GUIDE

   EFFECT VERBS: scalar loyalty law station seats flag unflag
                 bill relationship coalition wire queue
   ============================================================ */

const EVENTS = [

{ id:"briefing_divergence", prologue:1, once:true,
  title:"The bill you inherited",
  speaker:"ceyhan",
  body:`Your predecessor promised it and did not have to carry it. You do.

The law says a copy of a person stops being that person after a hundred and
sixty-eight hours of separate life. Under the line, a copy is an instance: the
same legal person, reabsorbable, with no separate wage and no separate vote.
Over it, the copy is a stranger with rights.

The bill cuts the line to forty. A working week. Nearly two million copies
become citizens overnight, six districts have to be redrawn, and every employer
who has been spinning staff copies for a week at a time is suddenly employing
people rather than using them.

The Public Substrate Association made it the price of joining your government.
Your own maintenance members, who have spent thirty years watching copies
undercut their wages, would rather you had paid a different price.`,
  choices:[
    { label:"Read the whips' count before deciding anything",
      effects:[{flag:"read_the_count"},],
      result:"It carries among elected members and dies among the functional ones. You will need to know why." },
    { label:"Say publicly that the government stands behind it",
      effects:[{flag:"read_the_count"},{scalar:{public_standing:3}},
               {loyalty:{psa:8,cu_maintenance:-9}},
               {wire:"PM COMMITS GOVERNMENT TO FORTY-HOUR THRESHOLD"}],
      result:"The Substrate Left is delighted. Thirty-one of your own members were not consulted." }
  ]},

{ id:"gb_approach", prologue:4, once:true,
  when:{ billStage:{divergence:"committee"}, flagsAbsent:["gb_approached"] },
  title:"The Guild Bench will see you",
  speaker:"gb_chair",
  body:`She has agreed to eleven thirty and to nothing else. The panel chair is a
licensed integrity engineer of forty years' standing and has never in that time
been recorded as voting against the settled position of her sector.

"You want the forty hours," she says, before you have sat down. "You will not get
them from us. Not because of the number. Because of what comes after the number.
Once a fork of eight days is a person, a fork of eight days can hold a licence,
and then the panel that certifies life support is a panel my members do not
recognise. You are not reforming personhood. You are reforming us."`,
  choices:[
    { label:"Offer a licensure carve-out — the threshold moves, licensure does not",
      effects:[{flag:"gb_approached"},{chapter:2},{relationship:{gb_chair:12}},{loyalty:{gb:6,psa:-9}},
               {wire:"GOVERNMENT SIGNALS LICENSURE CARVE-OUT; SUBSTRATE LEFT FURIOUS"},
               {flag:"licensure_carveout_offered"}],
      result:"She does not say yes. She says she will take it to the panel, which from her is a great deal." },
    { label:"Remind her the sunset clause has been extended four times and will not be a fifth",
      effects:[{flag:"gb_approached"},{chapter:2},{relationship:{gb_chair:-15}},{loyalty:{gb:-8}},
               {scalar:{public_standing:3}},{flag:"threatened_guild_bench"},
               {wire:"PM RAISES FUNCTIONAL SUNSET IN PRIVATE MEETING, SOURCES SAY"}],
      result:"\"Extend it a fifth time,\" she says, \"or don't. Either way I have the votes and you do not.\"" },
    { label:"Say nothing that can be repeated. Listen.",
      effects:[{flag:"gb_approached"},{chapter:2},{relationship:{gb_chair:4}},],
      result:"You learn that the panel meets on Thursday morning, which is four hours before the division." }
  ]},

{ id:"halloran_signatures", prologue:2,
  when:{ loyaltyBelow:{cu_halloran:20}, flagsAbsent:["halloran_confronted"] },
  title:"Nine signatures",
  speaker:"halloran",
  body:`The number is not a secret. Everyone in the tea room can count, and the
count is nine. Halloran needs nine more names and she has spent three weeks not
getting them, which means either she cannot or she is waiting.

She catches you in the division lobby, which is deliberate, because it is the one
place the two of you cannot be photographed apart.

"Eleven thousand four hundred of my constituents are fourth on a list that decides
who wakes up," she says. "And the bill you are whipping me on is about how many
hours make a stranger. Give me the shed order. Give me anything on the shed order."`,
  choices:[
    { label:"Commit to bringing the Shed Order Bill back this session",
      effects:[{loyalty:{cu_halloran:22,cu_maintenance:9}},{scalar:{party_loyalty:7}},
               {flag:"halloran_confronted"},{flag:"shed_order_promised"},
               {bill:{shedorder:{stage:"second_reading"}}}],
      result:"She writes nothing down. She does not need to; you said it in a lobby with forty witnesses." },
    { label:"Offer her a junior ministry and the silence that comes with it",
      effects:[{loyalty:{cu_halloran:14}},{scalar:{party_loyalty:4,public_standing:-3}},
               {flag:"halloran_confronted"},{flag:"halloran_bought"},
               {wire:"HALLORAN TIPPED FOR OFFICE; ASHFIELD DELEGATION SEEKS ASSURANCES"}],
      result:"She takes it. Her group does not all follow her, and the ones who don't now have a grievance and no leader." },
    { label:"Refuse. She does not have the nine and you both know it.",
      effects:[{loyalty:{cu_halloran:-11,cu_maintenance:-6}},{scalar:{party_loyalty:-6}},
               {flag:"halloran_confronted"},{queue:[{event:"halloran_finds_nine",after:4}]}],
      result:"\"No,\" she agrees. \"Not today.\"" }
  ]},

{ id:"halloran_finds_nine", queuedOnly:true, once:true,
  title:"She found them",
  speaker:"halloran",
  body:`Four of the nine are revenants — members returned on the list after losing
a district, who owe their seats entirely to the party and were therefore supposed
to be unbuyable. They have worked out that a leadership change reorders the list,
and that a list can be reordered upward as easily as down.

The ballot is called for the week after next.`,
  choices:[
    { label:"Fight it. Put the whole cabinet on broadcast.",
      effects:[{scalar:{party_loyalty:-4,public_standing:-5}},
               {flag:"leadership_ballot_called"},
               {wire:"LEADERSHIP BALLOT CALLED; CABINET DECLARES FOR FLASH"}],
      result:"It becomes a public argument about whether your party believes what it says it believes." },
    { label:"Concede the shed order and the personhood line in one go",
      effects:[{loyalty:{cu_halloran:30,cu_maintenance:12,psa:-20}},
               {scalar:{party_loyalty:12}},
               {bill:{divergence:{stage:"withdrawn",dead:true}}},
               {wire:"THRESHOLD BILL WITHDRAWN; SUBSTRATE LEFT REVIEWS COALITION"}],
      result:"You keep the leadership. The Public Substrate Association meets tonight without you." }
  ]},

{ id:"vantage_radiator", prologue:3,
  when:{ scalarBelow:{thermal_margin:22}, flagsAbsent:["vantage_handled"] },
  title:"Ember Ridge, third day below reserve",
  speaker:null,
  image:{ src:"vantage_radiator.png", palette:"broadcast",
          caption:"Radiator array 4, Ember Ridge", credit:"Ring Network" },
  body:`The fault is in a radiator array, the array is twenty-two years old, and
the replacement is in a procurement queue behind a loop upgrade nobody has ever
been able to explain. Under the Allocation Act the engineering authority may
suspend the tier-four register on that station without notice and without a
minister being told first.

There are four thousand two hundred suspended persons on Ember Ridge.`,
  choices:[
    { label:"Authorise emergency thermal transfer from Anselm Ring",
      effects:[{scalar:{thermal_margin:11,treasury:-9,public_standing:-4}},
               {station:{vantage:{closure:0.03}}},{flag:"vantage_handled"},
               {wire:"ANSELM RING QUOTA DIVERTED TO VANTAGE HIGH; RING MEMBERS OBJECT"}],
      result:"Your own constituency pays for it, which your own constituency will notice." },
    { label:"Let the authority act under the Act and say so publicly",
      effects:[{scalar:{thermal_margin:5,public_standing:-11}},{loyalty:{hul:8,psa:-12,cu_halloran:-9}},
               {flag:"vantage_handled"},{flag:"deferred_to_authority"},
               {wire:"GOVERNMENT DECLINES TO INTERVENE; ENGINEERING AUTHORITY TO EXERCISE S.12 POWERS"}],
      result:"You have conceded, in public, that the authority's word is final on the one question the charter left open." },
    { label:"Do nothing yet. The fault may clear.",
      effects:[{scalar:{thermal_margin:-6}},{queue:[{event:"vantage_cascade",after:3}]}],
      result:"The fault does not clear." }
  ]},

{ id:"vantage_cascade", queuedOnly:true, once:true,
  title:"Tier four, Ember Ridge",
  speaker:null,
  body:`The authority shed the register at 04:12 without notifying the Ministry.
Four thousand two hundred people stopped running. Under the Act this was lawful.
Under the Act you were not required to be told.

The Spindle has the timestamp.`,
  choices:[
    { label:"Announce a statutory review of the shed order authority",
      effects:[{scalar:{public_standing:-8,thermal_margin:4}},{loyalty:{psa:6,hul:-14}},
               {bill:{shedorder:{stage:"second_reading"}}},
               {wire:"PM ANNOUNCES REVIEW OF SHEDDING POWERS AFTER VANTAGE HIGH"}],
      result:"The review will report after the election, which everyone understands." },
    { label:"Defend the authority. It acted within the law and the law is the law.",
      effects:[{scalar:{public_standing:-14,party_loyalty:-9}},{loyalty:{hul:12,psa:-16,cu_maintenance:-11}},
               {flag:"defended_authority"},
               {wire:"PM DEFENDS SHEDDING DECISION; SUBSTRATE LEFT SUMMONS COALITION MEETING"}],
      result:"You have said out loud the thing Hullists say, in your own voice, on the record." }
  ]},

{ id:"cluster_flag", weight:60,
  when:{ minSitting:2, flagsAbsent:["cluster_investigated"] },
  title:"Two hundred and forty accounts",
  speaker:"ceyhan",
  image:{ src:"cluster_feed.png", palette:"newsprint",
          caption:"Registry advisory, 11 April", credit:"The Spindle" },
  body:`Two hundred and forty unattested accounts posted an identical string within
a four-minute window. The Registry flagged the cluster and took no further action,
which is the whole of the power the statute gives it.

Ceyhan wants to know whether you intend to ask for more power, and he wants to
know it on the record, because the answer is a story either way.`,
  choices:[
    { label:"Announce an attestation enforcement bill",
      effects:[{scalar:{public_standing:5}},{loyalty:{psa:-8,cl:-6,gb:5}},
               {flag:"cluster_investigated"},{flag:"attestation_bill_trailed"},
               {wire:"GOVERNMENT TO SEEK REGISTRY ENFORCEMENT POWERS"}],
      result:"The Unattested will read this as what it is." },
    { label:"Say the registry has the powers it should have and the cluster is not illegal",
      effects:[{scalar:{public_standing:-4}},{loyalty:{psa:7,cl:4}},
               {flag:"cluster_investigated"},{relationship:{ceyhan:5}}],
      result:"Correct, unpopular, and quotable in exactly the wrong order." },
    { label:"Ask who paid for the substrate",
      effects:[{flag:"cluster_investigated"},{flag:"cluster_traced"},{relationship:{ceyhan:9}},
               {queue:[{event:"cluster_source",after:5}]}],
      result:"Ceyhan writes it down properly, which means he thinks it will go somewhere." }
  ]},

{ id:"cluster_source", queuedOnly:true, once:true,
  title:"Who paid for the substrate",
  speaker:"ceyhan",
  body:`The cycles were billed to a holding entity, the holding entity is one of
six incorporated in the same week, and all six are registered voters in the
Substrate and Hosting functional constituency. The electorate of that seat is
four hundred and eleven.

Somebody manufactured six voters and used the spare capacity to manufacture a
consensus. It is not clear that either is illegal.`,
  choices:[
    { label:"Refer it to the Law Officer and let it run",
      effects:[{scalar:{public_standing:7}},{loyalty:{cl:-11,gb:-7}},
               {flag:"shells_referred"},
               {wire:"LAW OFFICER TO EXAMINE SHELL REGISTRATIONS IN SUBSTRATE PROVIDERS SEAT"}],
      result:"You have opened a fight about corporate voting eight weeks before you need the functional benches." },
    { label:"Hold it. A seat you may need later is worth more than a story now.",
      effects:[{flag:"shells_held"},{relationship:{ceyhan:-8}}],
      result:"Ceyhan runs it anyway, without you, and with a paragraph about what the government knew." }
  ]}
,

/* ---------- CHAPTER TWO — the division and its consequences ----------
   Every event below is tagged chapter:2, so none of them can fire until
   something applies {chapter:2}. The opening is authored (prologue:1),
   the rest is a weighted pool. */

{ id:"ch2_open", chapter:2, prologue:1, once:true,
  title:"Thursday",
  speaker:null,
  body:`The panel met at nine. Whatever was said in that room has not reached
this one, and the whips have stopped pretending to count.

The bill is called at two. You have the morning.`,
  choices:[
    { label:"Spend the morning on your own benches",
      effects:[{loyalty:{cu_maintenance:6,cu_halloran:4}},
               {flag:"whipped_own_side"}],
      result:"Five members who intended to abstain will now vote. It does not change the second bench." },
    { label:"Spend it on the functional members who are not Guild Bench",
      effects:[{loyalty:{fh:5,hul:3}},{scalar:{treasury:-6}},
               {flag:"lobbied_functional"}],
      result:"Two Freeholders will consider it. Two is not nine." },
    { label:"Let it fall and be seen to have tried",
      effects:[{scalar:{public_standing:4}},{loyalty:{psa:-10}},
               {flag:"let_it_fall"},
               {wire:"GOVERNMENT SIGNALS IT WILL NOT DELAY THE THRESHOLD DIVISION"}],
      result:"The Substrate Left understands exactly what you have decided." }
  ]},

{ id:"ch2_carveout_price", chapter:2, weight:80, once:true,
  when:{ flags:["licensure_carveout_offered"] },
  title:"What the carve-out costs",
  speaker:"gb_chair",
  body:`The panel will let the threshold move if licensure does not. That is the
whole of the offer and it is not negotiable at the margins.

What it means in practice: an emulation separated for forty-one hours becomes a
person, may hold property, may vote in a district — and may not hold a life
support licence, which means may not vote in the constituency that represents
the work she does every day.

The Public Substrate Association will read the clause within the hour.`,
  choices:[
    { label:"Take it. A right you can exercise is worth more than one you cannot.",
      effects:[{law:{divergence_threshold_hours:40}},{bill:{divergence:{stage:"passed",dead:true}}},
               {loyalty:{psa:-18,gb:10}},{scalar:{public_standing:6}},
               {flag:"carveout_taken"},
               {queue:[{event:"ch2_psa_conference",after:2}]},
               {wire:"THRESHOLD BILL CARRIES WITH LICENSURE CARVE-OUT; PSA CONFERENCE CALLED"}],
      result:"It passes. Your coalition partner votes for a bill it will spend the next election denouncing." },
    { label:"Refuse. A franchise with a profession-shaped hole in it is not a franchise.",
      effects:[{bill:{divergence:{stage:"defeated",dead:true}}},{loyalty:{psa:8,gb:-6}},
               {scalar:{public_standing:-5}},
               {flag:"carveout_refused"},
               {wire:"THRESHOLD BILL FALLS ON THE FUNCTIONAL DIVISION"}],
      result:"It fails on the second bench, 12 to 40, exactly as the count said it would." }
  ]},

{ id:"ch2_psa_conference", chapter:2, queuedOnly:true, once:true,
  title:"The conference votes",
  speaker:null,
  body:`Six hundred delegates, most of them running at a clock rate the party
subsidises, reached a view in under four subjective hours.

The motion instructs the parliamentary party to review its participation in the
coalition. It is not binding. Nothing at a conference ever is.`,
  choices:[
    { label:"Go and speak to them yourself",
      effects:[{loyalty:{psa:12}},{scalar:{public_standing:-4}}],
      result:"You are heard politely. Thirty-one delegates walk out during the second half." },
    { label:"Send the Chief Whip and stay away",
      effects:[{loyalty:{psa:-6}},],
      result:"The whip reports that it went as well as it could have. The whip reports this about everything." }
  ]},

{ id:"substrate_price_bite", chapter:2, weight:88,
  when:{ priceAbove:{substrate:112}, flagsAbsent:["substrate_bite_seen"] },
  title:"What the rent did",
  speaker:"ansar",
  body:`Nobody legislated for this. The substrate index has been above a hundred
and twelve for three weeks and the low band is doing what the low band does
when it cannot pay: the tier-four register on Homestead has grown by four figures
and nobody has announced anything, because nothing was announced. The price went
up and people stopped running.

Sevi Ansar has sent the ninth deck's letter to every member for a low-band seat,
which is eleven of yours.

"You did not vote for this," it says. "That is the part I would like explained."`,
  choices:[
    { label:"Emergency substrate subsidy, funded from the reserve",
      effects:[{price:{substrate:-16}},{scalar:{treasury:-14,public_standing:5}},
               {loyalty:{cu_maintenance:8,psa:6}},{flag:"substrate_bite_seen"},
               {wire:"EMERGENCY SUBSTRATE SUBSIDY ANNOUNCED; INDEX FALLS"}],
      result:"The index comes down. The reserve does not come back." },
    { label:"Say plainly that the rent is a market outcome and the government does not set it",
      effects:[{scalar:{public_standing:-9}},{loyalty:{cu_maintenance:-13,psa:-10,cl:7}},
               {flag:"substrate_bite_seen"},{flag:"denied_the_rent"},
               {wire:"PM: SUBSTRATE RENTS \"NOT A MATTER FOR MINISTERS\""}],
      result:"It is not true, and eleven members for low-band seats know exactly how untrue it is." },
    { label:"Bring the public stake bill forward and stake the session on it",
      effects:[{bill:{substrate_public_stake:{stage:"second_reading"}}},
               {loyalty:{psa:14,cl:-12}},
               {flag:"substrate_bite_seen"},{flag:"staked_on_public_stake"},
               {wire:"GOVERNMENT ADVANCES PUBLIC STAKE BILL AFTER RENT RISE"}],
      result:"You have made the rest of the session about one bill. The Consortium Liberals begin counting." }
  ]}

];
