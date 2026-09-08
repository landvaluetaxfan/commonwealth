/* =============================================================
   THE CONCORDANCE — in-world encyclopedia.

   ARCHITECTURE: this is a VIEW over content that already exists.
   Parties, stations, characters, bills and glossary terms all get
   articles generated from their own data — seat counts, closure
   ratios and division forecasts come live from state, so the
   encyclopedia is never out of date and never contradicts canon.

   You only write an entry here when you want prose the data cannot
   produce: history, controversy, the argument about the thing.

   IT IS NOT NEUTRAL. It is a document inside the world, edited by
   attested accounts, with maintenance banners, protected pages and
   stubs on topics nobody wants written. Bible 9.4: ideologies are
   refracted, not presented. The banners are the refraction.
   ============================================================= */

const ENCYCLOPEDIA = {

  meta: {
    title: "Concordance",
    tagline: "the attested encyclopedia",
    notice: "Editing is restricted to attested accounts. Attestation is administered " +
            "by the Registry, whose independence is the subject of ongoing litigation."
  },

  /* Banner types. Keep this list short — each one is a piece of characterisation. */
  banners: {
    neutrality:  { cls:"warn", text:"The neutrality of this article is disputed. See the talk record." },
    single:      { cls:"warn", text:"This article relies largely on a single source." },
    protected:   { cls:"lock", text:"Editing is restricted to attested accounts of standing." },
    stub:        { cls:"note", text:"This article is a stub. You can help by expanding it, if you are attested." },
    contested:   { cls:"warn", text:"This article documents an active political dispute and may change rapidly." },
    cleanup:     { cls:"note", text:"This article may require cleanup to meet the Concordance's standards." },
    orphan:      { cls:"note", text:"Few other articles link here." }
  },

  /* Hand-written articles. Anything not listed is generated from data. */
  articles: [

  { id:"biological_majority", title:"Biological population", category:"Personhood",
    banners:["neutrality"],
    edited:{ by:"multiple", attested:true, note:"the uploading section has been reverted eleven times this session" },
    summary:"Sixty-four per cent of adults in the [[commonwealth|Commonwealth]] are **biological**: "+
      "single-instanced, embodied, running at standard rate, and mortal. That the politics of the "+
      "Commonwealth is nonetheless dominated by questions of [[substrate]] is not a contradiction "+
      "but an ordinary feature of any polity that funds a minority's continuation from general "+
      "taxation.",
    sections:[
      { h:"Distribution", body:
        "Biological 64 per cent, emulation 28, uplift 4, synthetic 4. The figures vary sharply by "+
        "band. Ashfield Cans is 81 per cent biological; L5 Refuge is 51 per cent emulated.\n\n"+
        "The two scarcities run in opposite directions across the roster. Volume is positional and "+
        "dearest where everyone wishes to be; thermal rejection is geometric and best far from "+
        "Earth's infrared glare, so substrate is cheapest where fewest people live. A station's "+
        "composition is therefore set by which of the two binds there." },
      { h:"Labour", body:
        "Roughly 46 per cent of jobs require an embodied worker and biologicals hold nearly all of "+
        "them. The working population is therefore disproportionately biological and the "+
        "non-working population disproportionately emulated.\n\n"+
        "A body is accordingly a qualification rather than a mark of status. The embodied trades "+
        "run from the anchors, which are the best-paid work in the Commonwealth, to integrity "+
        "engineering, which is licensed, unionised, and in possession of a withdrawal of labour "+
        "that would kill everyone it serves." },
      { h:"Exposure", body:
        "The question that sorts the population is not what a person is made of but whether they "+
        "can be switched off. A biological on the consumables floor is poor; an emulated citizen "+
        "on the same floor is poor and on the shed order register. The incomes are "+
        "identical and the exposures are not comparable.\n\n"+
        "Wealth at the moment of uploading fixes substrate tier, and tier decides whether a person "+
        "accumulates for a century or is shed at the next shortfall. There is, in consequence, no "+
        "such thing as the emulated interest." },
      { h:"Mortality and the franchise", body:
        "Biologicals die. Emulations accumulate. Biological political generations turn over at the "+
        "customary rate; emulated ones do not turn over at all. A biological voter of thirty "+
        "contests the future against an electorate that will still be voting in ninety years and "+
        "has consistently voted for the settlement that serves it.\n\n"+
        "No remedy has been proposed that survived a first reading. It is not obvious that one "+
        "could be drafted which did not amount to disenfranchising the long-lived, which the "+
        "Charter forbids in terms." },
      { h:"Descent", body:
        "Bone density constrains the biological only. An emulation of sufficient means rents a "+
        "body certified for one gravity and descends; the body is equipment rather than self. An "+
        "orbital-born biological cannot descend at any price. The permanent class defined by "+
        "skeletal density is accordingly a biological class." },
      { h:"Uploading under economic pressure", body:
        "Emulation is markedly cheaper on volume and dearer on thermal, so the household driven to "+
        "upload is one that cannot make its *volume* rent — which places it in the ring or middle "+
        "band rather than the low band. Nobody uploads to escape a rent they are already paying "+
        "cheaply.\n\n"+
        "The course removes access to some 46 per cent of paid work, and returning to that work "+
        "requires renting a body at more than the volume rent being escaped. It also places a "+
        "person who could not previously be switched off onto a register where they can be.\n\n"+
        "The Census Bureau does not publish a figure for economically motivated uploading and has "+
        "declined three requests to construct one." }
    ],
    see:["substrate","suspension","commonwealth"] },

  { id:"commonwealth", title:"Circumterrestrial Commonwealth", category:"Institutions",
    banners:["contested"],
    edited:{ by:"multiple", attested:true, note:"the demonym section is reverted about weekly" },
    summary:"The **Circumterrestrial Commonwealth** is a federated parliamentary republic of the "+
      "inhabited stations of Earth orbit, together with the Selene settlements and the Lagrange "+
      "yards. It was constituted under the [[perigee_charter|Perigee Charter]] and is governed by "+
      "[[parliament|Parliament]] and a [[cabinet|Cabinet]] under a [[prime_minister|Prime Minister]].",
    sections:[
      { h:"Name", body:
        "*Circumterrestrial* is the Charter's word and appears on every instrument the state "+
        "issues. Nobody uses it in speech. In practice the country is the Commonwealth, the "+
        "government is Perigee, and a person is from their station.\n\n"+
        "The adjective was contested at the founding. The delegations from the far band held that "+
        "it described a geometry rather than a country, which was precisely the objection, and "+
        "precisely why it carried." },
      { h:"The absence of a demonym", body:
        "There is no settled word for a person of the Commonwealth. *Circumterrestrials* appears "+
        "in four Charter-era documents and has never been said aloud by anyone not being paid to. "+
        "Proposals have been made and have failed at every attempt.\n\n"+
        "This is generally read as a failure of the union rather than of the language. A "+
        "federation held together by shared identity produces a demonym without trying; one held "+
        "together by metabolic dependency does not, because the thing being shared is not "+
        "something anyone chose. Asked what they are, most people name a station." },
      { h:"Composition", body:
        "Thirteen recognised stations across four altitude bands, plus three external "+
        "constituencies. Anselm Ring alone holds more people than the seven smallest combined, a "+
        "disparity the apportionment formula corrects only partly and deliberately." },
      { h:"What holds it together", body:
        "Not force, not consent, and not identity. A station's closure ratio measures the "+
        "fraction of its material cycle it can sustain without imports, and most of the roster "+
        "sits well below the level at which leaving is survivable.\n\n"+
        "The consequence is a permanent argument that no other federation has to have. Federal "+
        "development spending raises a station's closure; raising a station's closure funds its "+
        "eventual capacity to secede. Every appropriation is, on one reading, a subsidy toward "+
        "the dissolution of the body making it. The Chartists regard this as the central fact "+
        "about the Commonwealth and are generally considered tiresome about it." }
    ],
    see:["perigee_charter","parliament","prime_minister","cabinet"] },

  { id:"parliament", title:"Parliament", category:"Institutions",
    banners:[],
    edited:{ by:"Concordance institutions group", attested:true, note:"seat figures from Bureau returns" },
    summary:"**Parliament** is the legislature of the Commonwealth. It is bicameral: the elected "+
      "House of Delegates, and an upper house in which every station sits equally regardless of "+
      "population. Members of either chamber are styled MP.",
    sections:[
      { h:"The House of Delegates", body:
        "Two hundred and eighty seats, returned by three different methods that do not correct one "+
        "another. One hundred and forty from geographic districts, one hundred from national party "+
        "lists, and forty from [[functional_constituency|functional constituencies]] representing "+
        "professions and industries. A majority is one hundred and forty-one." },
      { h:"The upper house", body:
        "Each station returns the same number of members whether it holds two million people or "+
        "eighteen thousand. The chamber's defenders describe this as the price of union. Its "+
        "critics describe it as the same thing, in a different tone." },
      { h:"The dual test", body:
        "Measures touching life-support integrity, and any amendment to the "+
        "[[perigee_charter|Charter]], must carry separately among functional and elected members. "+
        "A government may hold a working majority of the House and be unable to legislate. See "+
        "[[dual_majority]]." },
      { h:"Time", body:
        "A session holds a finite number of slots on the order paper. Which bills receive time is "+
        "formally the Prime Minister's decision and practically the currency in which coalitions "+
        "are paid." }
    ],
    see:["dual_majority","functional_constituency","prime_minister","cabinet"] },

  { id:"prime_minister", title:"Prime Minister", category:"Institutions",
    banners:[],
    edited:{ by:"multiple", attested:true, note:"" },
    summary:"The **Prime Minister** is head of government of the Commonwealth. The office is not "+
      "established by election but by the ability to command a majority in the "+
      "[[parliament|the House of Delegates]], which is a different and more fragile thing.",
    sections:[
      { h:"Tenure", body:
        "There is no term. A Prime Minister holds office until they lose a division of confidence, "+
        "lose the leadership of their own party, lose a general election, or resign. The first two "+
        "require no election and can happen in an afternoon." },
      { h:"Powers", body:
        "Nominates Ministers, chairs [[cabinet|Cabinet]], controls the order paper, and requests a "+
        "dissolution — which the [[person_tenaya|President]] may refuse. The order paper is the real "+
        "one: a session holds a finite number of slots, and which bills get time is the whole of "+
        "coalition management in a single decision." },
      { h:"Style", body:
        "Formally *the Right Honourable*, and *Secretary-General* on instruments of appointment, "+
        "which nobody says aloud." }
    ],
    see:["cabinet","parliament","person_tenaya"] },

  { id:"cabinet", title:"Cabinet of the Commonwealth", category:"Institutions",
    banners:[],
    edited:{ by:"Concordance institutions group", attested:true, note:"revised each formation" },
    summary:"The **Cabinet** is the collective executive of the Commonwealth, chaired by the "+
      "[[prime_minister|Prime Minister]] and composed of the Ministers heading each Ministry. "+
      "Its members sit in [[parliament|Parliament]] and answer to it.",
    sections:[
      { h:"The Ministries", body:
        "Life Support. Substrate and Thermal. Consumables and Agriculture. Volume and Housing. "+
        "Transit and Orbital Mechanics. Attestation and the Registry. Persons and Continuity. "+
        "External Relations, which handles the anchor concessions and is therefore the most "+
        "domestically consequential of the lot. The Treasury sits apart and reports directly to "+
        "the Prime Minister.\n\n"+
        "Life Support is the senior post and the one that ends careers. It is the only Ministry "+
        "whose Minister may be summoned by the engineering authority rather than the other way "+
        "around, a provision of the Allocation Act that has never been amended and is raised at "+
        "every confirmation." },
      { h:"Appointment", body:
        "Ministers are appointed by the [[person_tenaya|President]] on the nomination of the Prime "+
        "Minister. The President may decline a nomination. The power is used rarely and remembered "+
        "for a long time." },
      { h:"Collective responsibility", body:
        "A Minister who cannot support a decision is expected to resign before opposing it. The "+
        "convention is honoured by absence more often than by resignation: three Root & Vessel "+
        "Ministers absented themselves from the threshold division rather than divide against the "+
        "leadership in public, which is understood by everyone to be a different thing from "+
        "supporting it." },
      { h:"The Secretary-General", body:
        "The Perigee Charter refers throughout to the *Secretary-General of the Commonwealth*, "+
        "the title the office carried when the Commonwealth was a treaty organisation between "+
        "stations rather than a state. The usage survives on instruments of appointment and "+
        "nowhere else. No holder has been addressed by it since 2206." }
    ],
    see:["prime_minister","parliament","perigee_charter","person_tenaya"] },

  { id:"perigee_charter", title:"The Perigee Charter", category:"Institutions",
    banners:["protected"],
    edited:{ by:"Registry Archivist", attested:true, note:"protected since 2281" },
    summary:"The founding document of the [[commonwealth|Circumterrestrial Commonwealth]], adopted at " +
            "the conclusion of the independence congress. It is short, and on several " +
            "contested questions it is deliberately silent.",
    sections:[
      { h:"Drafting", body:
        "The congress met for eleven weeks and agreed a text that no delegation would have " +
        "written alone. Where agreement was impossible, the drafters wrote language capable " +
        "of bearing more than one reading and moved on. Contemporary accounts treat this as " +
        "a failure of nerve. Later constitutional scholarship generally treats it as the " +
        "reason the union survived its first decade." },
      { h:"The silences", body:
        "The Charter does not say who may terminate an emergency, only who may declare one. " +
        "It does not define the relation between a person and an instance of that person. It " +
        "does not say whether the functional tier is permanent, and its sunset clause has been " +
        "extended four times without a vote on the principle. Each of these is now a branch of " +
        "litigation." },
      { h:"Amendment", body:
        "An amendment requires a dual majority: separate majorities among elected and functional " +
        "members. No amendment has passed since 2279." }
    ],
    see:["functional_constituency","dual_majority","the_permanent_emergency"] },

  { id:"the_permanent_emergency", title:"The permanent emergency", category:"Constitutional theory",
    banners:["neutrality","contested"],
    edited:{ by:"multiple", attested:true, note:"142 revisions this session" },
    summary:"The constitutional question of whether the capacity of a habitat to kill its " +
            "population through administrative failure justifies an authority whose word is " +
            "final on matters of integrity.",
    sections:[
      { h:"The argument for", body:
        "Air does not negotiate. A committee cannot be convened in the ninety seconds available " +
        "when a seal fails. On this view an engineering authority exercising final judgment is " +
        "not a suspension of ordinary politics but a precondition for it, and the demand for " +
        "civilian oversight is a demand made by people who have never watched a deck lose " +
        "pressure." },
      { h:"The argument against", body:
        "Every authority that has ever held emergency powers has found emergencies. The " +
        "Allocation Act permits the shedding of a tier-four register without notice to a " +
        "minister, and that power has been exercised in circumstances no reasonable person " +
        "would describe as ninety seconds of crisis. Declaration is easy. Termination is the " +
        "whole of the fight." },
      { h:"Status", body:
        "Unresolved. Both major parties have governed without settling it, and both have " +
        "found the ambiguity convenient in office and intolerable in opposition." }
    ],
    see:["engineering_authority","shed_order","hul"] },

  { id:"the_failed_revolution", title:"The events of 2251", category:"History",
    banners:["stub","neutrality","single"],
    edited:{ by:"unattributed", attested:false, note:"reverted 9 times this session" },
    summary:"A rising against the provisional administration, suppressed within five weeks. " +
            "Accounts of its causes, extent and casualties differ substantially.",
    sections:[
      { h:"", body:
        "This article has been the subject of sustained edit conflict. The Registry has " +
        "declined to protect it on the grounds that no attested account has requested " +
        "protection, and the accounts requesting changes are largely unattested.\n\n" +
        "What is not disputed: it failed, several of its surviving figures hold respectable " +
        "office today in parties that do not mention it, and the alignment of every current " +
        "faction can be traced to where its founders stood in that year." }
    ],
    see:["perigee_charter"] },

  { id:"functional_constituency", title:"Functional constituency", category:"Elections",
    banners:["contested"],
    edited:{ by:"Apportionment Reform Society", attested:true, note:"" },
    summary:"A seat in the House of Delegates elected by a profession or industry rather " +
            "than by a place. Forty of the 280 seats are functional.",
    sections:[
      { h:"Origin", body:
        "The founding compromise. The Charter's authors required the engineering guilds and " +
        "the consortiums to accept civilian rule, and the price was permanent representation. " +
        "The arrangement was described as transitional at the time and has been extended four " +
        "times since." },
      { h:"Franchise", body:
        "The electorate of a functional seat is defined by professional licensure, and licensing " +
        "boards are appointed by the government of the day. A government may therefore alter " +
        "who votes in a functional constituency by regulation, without legislation and without " +
        "a division. This has been described, by those who do it, as administrative housekeeping." },
      { h:"Size", body:
        "Functional electorates range from four hundred and eleven voters to somewhat over nine " +
        "thousand, against district electorates averaging above one hundred and twenty thousand. " +
        "A functional seat is won by persuading a few dozen people over dinner." },
      { h:"The residual constituency", body:
        "Persons belonging to no recognised sector — the unemployed, the dependent, the " +
        "suspended — vote in a single residual functional constituency. It is the largest " +
        "electorate in the Commonwealth and returns one member." },
      { h:"Abolition", body:
        "Abolition requires a Charter amendment. A Charter amendment requires a dual majority. " +
        "A dual majority requires the functional tier to vote for its own abolition. The " +
        "Commons Union has promised abolition at four consecutive elections." }
    ],
    see:["dual_majority","licensure","gb","perigee_charter"] },

  { id:"dual_majority", title:"Dual majority", category:"Elections",
    edited:{ by:"Chartist Study Group", attested:true, note:"" },
    summary:"The requirement that certain measures carry separately among functional and " +
            "elected members of the House of Delegates.",
    sections:[
      { h:"Scope", body:
        "The test applies to Charter amendments and to bills touching life-support integrity. " +
        "It does not apply to ordinary legislation, appropriation, or instruments made under " +
        "powers an Act already grants — a distinction of increasing practical importance." },
      { h:"Effect", body:
        "A government commanding a comfortable majority of elected members may be structurally " +
        "unable to legislate in the field it was elected to reform. The present coalition holds " +
        "twelve of forty functional seats and requires twenty-one." }
    ],
    see:["functional_constituency","divergence_threshold"] },

  { id:"suspension", title:"Suspension", category:"Personhood",
    banners:["contested"],
    edited:{ by:"multiple", attested:true, note:"" },
    summary:"The condition of a mind held intact and not running. Suspension is not death " +
            "and is not, in law, an interruption of legal personality.",
    sections:[
      { h:"Routes", body:
        "Voluntary, where a person elects to wait out a debt, a body shortage or a course of " +
        "treatment. Penal, where a sentence is served as absence. Default, where a person has " +
        "ceased to be able to meet substrate costs. Triage, where a shortfall has occurred and " +
        "the shed order has selected them." },
      { h:"Restoration", body:
        "A suspended person cannot petition for their own restoration. Restoration requires " +
        "another party to meet the cost. Whether obligations continue to accrue during " +
        "suspension is the single question that determines whether default suspension is " +
        "temporary or permanent, and the law is presently that they do." },
      { h:"Apportionment", body:
        "Suspended persons are counted for the apportionment of seats and cannot vote. A " +
        "station with a large suspended cohort therefore returns members elected by a small " +
        "active electorate. Ashfield Cans holds 11,400 suspended residents against a " +
        "population of 880,000." }
    ],
    see:["shed_order","substrate","ashfield"] },

  { id:"licensure", title:"Licensure", category:"Personhood",
    banners:["cleanup"],
    edited:{ by:"unattributed", attested:true, note:"" },
    summary:"Professional certification. Licensure determines both the right to practise and, " +
            "in a functional constituency, the right to vote.",
    sections:[
      { h:"Boards", body:
        "Licensing boards are appointed by the responsible minister. Their composition is not " +
        "subject to a division and their determinations are not ordinarily reviewable." },
      { h:"Category restrictions", body:
        "Several boards restrict licensure by legal category. Where they do, a person may " +
        "lawfully perform work and lawfully be excluded from the constituency that represents " +
        "that work. The Registry does not regard this as a franchise question." }
    ],
    see:["functional_constituency","gb"] }

  ]
};
