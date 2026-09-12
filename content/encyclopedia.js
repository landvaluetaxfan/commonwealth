/* =============================================================
   THE CONCORDANCE — in-world encyclopedia.

   ARCHITECTURE: this is a VIEW over content that already exists.
   Parties, stations, characters, bills and glossary terms all get
   articles generated from their own data — seat counts, closure
   ratios and division forecasts come live from state, so the
   encyclopedia is never out of date and never contradicts canon.

   You only write an entry here when you want prose the data cannot
   produce: history, controversy, the argument about the thing.

   REGISTER: Wikipedia. A lead that defines the subject in its first
   sentence, sentence-case headings, neutral third person, no address
   to the reader. The bias lives in the BANNERS and the edit record,
   never in the sentences. Bible 9.4: ideologies are refracted, not
   presented; the maintenance banner is the refraction. See
   CONTENT_GUIDE.md, "The register".
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
    summary:"The **biological population** is the largest of the four legal categories of person in "+
      "the [[commonwealth|Commonwealth]]. Biological persons are single-instanced, embodied, run at "+
      "standard rate, and are mortal. They comprise 64 per cent of adults.",
    sections:[
      { h:"Distribution", body:
        "The recorded distribution is 64 per cent biological, 28 per cent emulated, 4 per cent "+
        "uplift and 4 per cent synthetic. The figures vary by band: Homestead is 81 per cent "+
        "biological and Sanctuary 51 per cent emulated.\n\n"+
        "The variation follows the two scarcities. Volume is positional and dearest where demand "+
        "is greatest; thermal rejection is geometric and cheapest far from Earth's infrared "+
        "glare. A station's composition is set by whichever of the two binds there." },
      { h:"Labour", body:
        "Approximately 46 per cent of jobs require an embodied worker, and biological persons "+
        "hold nearly all of them. The working population is therefore disproportionately "+
        "biological, and the non-working population disproportionately emulated.\n\n"+
        "A body is accordingly a qualification rather than a mark of status. Embodied work "+
        "ranges from the anchor crews, the best-paid employment in the Commonwealth, to "+
        "integrity engineering, which is licensed and unionised and can withdraw labour in a "+
        "way that would be fatal to those it serves." },
      { h:"Exposure", body:
        "The distinction that orders the population is not what a person is made of but whether "+
        "they can be switched off. A biological person on the consumables floor is poor; an "+
        "emulated resident on the same floor is poor and on the shed order register. Their "+
        "incomes may be identical and their exposure is not comparable.\n\n"+
        "Wealth at the moment of uploading determines substrate tier, and tier determines "+
        "whether a person accumulates for a century or is shed at the next shortfall. On this "+
        "account there is no single emulated interest." },
      { h:"Mortality and the franchise", body:
        "Biological persons die and emulated ones do not. Biological political generations turn "+
        "over at the customary rate; emulated ones do not turn over at all. A biological voter "+
        "of thirty contests the future against an electorate that will still be voting in "+
        "ninety years, and that has voted consistently for the settlement that serves it.\n\n"+
        "No remedy has survived a first reading. It is not clear that one could be drafted "+
        "which did not amount to disenfranchising the long-lived, which the Charter forbids." },
      { h:"Descent", body:
        "Bone density constrains only the biological. An emulation of sufficient means can rent "+
        "a body certified for one gravity and descend, the body being equipment rather than "+
        "self. An orbital-born biological cannot descend at any price. The class defined by "+
        "skeletal density is therefore a biological class." },
      { h:"Uploading under economic pressure", body:
        "Emulation is cheaper on volume and dearer on thermal, so a household driven to upload "+
        "is one that cannot meet its *volume* rent, which places it in the ring or middle band "+
        "rather than the low band. Uploading is not a means of escaping a rent that is already "+
        "cheap.\n\n"+
        "The course removes access to approximately 46 per cent of paid work, and returning to "+
        "that work requires renting a body at more than the rent being escaped. It also places "+
        "a person who could not previously be switched off onto a register where they can be.\n\n"+
        "The Census Bureau does not publish a figure for economically motivated uploading and "+
        "has declined three requests to compile one." }
    ],
    see:["substrate","suspension","commonwealth"] },

  { id:"commonwealth", title:"Circumterrestrial Commonwealth", category:"Institutions",
    banners:["contested"],
    edited:{ by:"multiple", attested:true, note:"the demonym section is reverted about weekly" },
    summary:"The **Circumterrestrial Commonwealth** is a federated parliamentary republic "+
      "comprising the inhabited stations of Earth orbit, the Selene settlements and the Lagrange "+
      "yards. It was constituted under the [[perigee_charter|Perigee Charter]] and is governed by "+
      "[[parliament|Parliament]] and a [[cabinet|Cabinet]] under a [[prime_minister|Prime Minister]].",
    sections:[
      { h:"Name", body:
        "*Circumterrestrial* is the Charter's term and appears on every instrument of state. It "+
        "is not used in speech; the country is referred to as the Commonwealth, the government "+
        "as Perigee, and a person as being from their station.\n\n"+
        "The adjective was contested at the founding. The far-band delegations argued that it "+
        "described a geometry rather than a country, which was the objection and also the "+
        "reason it was adopted." },
      { h:"The absence of a demonym", body:
        "There is no settled demonym for a citizen of the Commonwealth. *Circumterrestrials* "+
        "appears in four Charter-era documents and is not used in speech. Several proposals "+
        "have been made and have failed.\n\n"+
        "The absence is generally attributed to the nature of the union. A federation held "+
        "together by shared identity acquires a demonym without effort; one held together by "+
        "metabolic dependency does not, because what is shared was not chosen. Asked what they "+
        "are, most residents name a station." },
      { h:"Composition", body:
        "The Commonwealth comprises thirty stations across four altitude bands, and five "+
        "external constituencies. Anselm Ring holds more residents than the seven smallest "+
        "stations combined, a disparity the apportionment formula corrects only partly." },
      { h:"What holds it together", body:
        "Neither force, nor consent, nor identity. A station's closure ratio is the fraction of "+
        "its material cycle it can sustain without imports, and most stations are below the "+
        "level at which departure is survivable.\n\n"+
        "The result is a recurring constitutional argument. Federal development spending raises "+
        "a station's closure ratio, and a higher closure ratio increases its capacity to "+
        "secede. Every appropriation can therefore be described as a subsidy toward the "+
        "dissolution of the body making it. The Chartists treat this as the central fact of "+
        "Commonwealth politics." }
    ],
    see:["perigee_charter","parliament","prime_minister","cabinet"] },

  { id:"parliament", title:"Parliament", category:"Institutions",
    banners:[],
    edited:{ by:"Concordance institutions group", attested:true, note:"seat figures from Bureau returns" },
    summary:"**Parliament** is the legislature of the Commonwealth. It is bicameral, comprising "+
      "the elected House of Delegates and an upper house in which each station is represented "+
      "equally regardless of population. Members of either house are styled MP.",
    sections:[
      { h:"The House of Delegates", body:
        "The House has 280 seats, elected by three methods that operate independently: 140 from "+
        "geographic districts, 100 from national party lists, and 40 from "+
        "[[functional_constituency|functional constituencies]] representing professions and "+
        "industries. A majority is 141." },
      { h:"The upper house", body:
        "Each station returns the same number of members, whether its population is two million "+
        "or eighteen thousand. The arrangement is defended as the price of union and criticised "+
        "as malapportionment." },
      { h:"The dual test", body:
        "Measures affecting life-support integrity, and amendments to the "+
        "[[perigee_charter|Charter]], must carry separately among functional and elected "+
        "members. A government may hold a working majority of the House and still be unable to "+
        "legislate. See [[dual_majority]]." },
      { h:"Time", body:
        "A session contains a fixed number of order-paper slots. The allocation of time is "+
        "formally the Prime Minister's decision and is in practice the currency in which "+
        "coalition support is purchased." }
    ],
    see:["dual_majority","functional_constituency","prime_minister","cabinet"] },

  { id:"prime_minister", title:"Prime Minister", category:"Institutions",
    banners:[],
    edited:{ by:"multiple", attested:true, note:"" },
    summary:"The **Prime Minister** is the head of government of the Commonwealth. The office is "+
      "held not by election but by the ability to command a majority in the "+
      "[[parliament|House of Delegates]].",
    sections:[
      { h:"Tenure", body:
        "There is no fixed term. A Prime Minister remains in office until losing a confidence "+
        "division, losing the leadership of their own party, losing a general election, or "+
        "resigning. The first two require no election and may occur within a day." },
      { h:"Powers", body:
        "The Prime Minister nominates ministers, chairs [[cabinet|Cabinet]], controls the order "+
        "paper, and may request a dissolution, which the [[person_tenaya|President]] may "+
        "refuse. Control of the order paper is the most significant in practice, since a "+
        "session contains a fixed number of slots." },
      { h:"Style", body:
        "The office is styled *the Right Honourable*, and *Secretary-General* on instruments of "+
        "appointment, a usage that is not employed in speech." }
    ],
    see:["cabinet","parliament","person_tenaya"] },

  { id:"cabinet", title:"Cabinet of the Commonwealth", category:"Institutions",
    banners:[],
    edited:{ by:"Concordance institutions group", attested:true, note:"revised each formation" },
    summary:"The **Cabinet of the Commonwealth** is the collective executive, chaired by the "+
      "[[prime_minister|Prime Minister]] and composed of the ministers who head each ministry. "+
      "Its members sit in [[parliament|Parliament]] and are answerable to it.",
    sections:[
      { h:"The ministries", body:
        "The Cabinet comprises the ministers for Life Support, Substrate and Thermal, "+
        "Consumables and Agriculture, Volume and Housing, Transit and Orbital Mechanics, "+
        "Attestation and the Registry, Persons and Continuity, Labour and Participation, Trade "+
        "and the Anchors, Closure and Development, Law and the Charter, Business of the House, "+
        "Contingencies and Civil Authority, and External Relations. The Treasury sits apart and "+
        "reports directly to the Prime Minister.\n\n"+
        "Life Support is the senior post. It is the only ministry whose minister may be "+
        "summoned by the engineering authority rather than the reverse, a provision of the "+
        "Allocation Act that has not been amended." },
      { h:"Appointment", body:
        "Ministers are appointed by the [[person_tenaya|President]] on the nomination of the "+
        "Prime Minister. The President may decline a nomination. The power is used rarely." },
      { h:"Collective responsibility", body:
        "A minister who cannot support a decision is expected to resign before opposing it. The "+
        "convention is observed more often by absence than by resignation; two Democratic "+
        "Centre ministers were absent from the threshold division rather than vote against the "+
        "leadership." },
      { h:"The Secretary-General", body:
        "The Perigee Charter refers throughout to the *Secretary-General of the Commonwealth*, "+
        "the title the office held when the Commonwealth was a treaty organisation between "+
        "stations rather than a state. The usage survives on instruments of appointment and is "+
        "not employed in speech. No holder has been addressed by it since 2206." }
    ],
    see:["prime_minister","parliament","perigee_charter","person_tenaya"] },

  { id:"perigee_charter", title:"The Perigee Charter", category:"Institutions",
    banners:["protected"],
    edited:{ by:"Registry Archivist", attested:true, note:"protected since 2281" },
    summary:"The **Perigee Charter** is the founding document of the "+
            "[[commonwealth|Circumterrestrial Commonwealth]], adopted at the conclusion of the "+
            "independence congress. It is short, and is deliberately silent on several contested "+
            "questions.",
    sections:[
      { h:"Drafting", body:
        "The congress sat for eleven weeks and produced a text that no single delegation would "+
        "have written. Where agreement was impossible, the drafters adopted language capable of "+
        "more than one reading. Contemporary accounts describe this as a failure of nerve; "+
        "later constitutional scholarship generally describes it as the reason the union "+
        "survived its first decade." },
      { h:"The silences", body:
        "The Charter does not specify who may terminate an emergency, only who may declare one. "+
        "It does not define the relation between a person and an instance of that person. It "+
        "does not state whether the functional tier is permanent, and its sunset clause has "+
        "been extended four times without a vote on the principle. Each is now a subject of "+
        "litigation." },
      { h:"Amendment", body:
        "An amendment requires a dual majority: separate majorities among elected and "+
        "functional members. No amendment has passed since 2279." }
    ],
    see:["functional_constituency","dual_majority","the_permanent_emergency"] },

  { id:"the_permanent_emergency", title:"The permanent emergency", category:"Constitutional theory",
    banners:["neutrality","contested"],
    edited:{ by:"multiple", attested:true, note:"142 revisions this session" },
    summary:"The **permanent emergency** is the constitutional question of whether the capacity "+
            "of a habitat to kill its population through administrative failure justifies an "+
            "authority whose decisions on matters of integrity are final.",
    sections:[
      { h:"Argument for", body:
        "Proponents argue that a committee cannot be convened in the ninety seconds available "+
        "when a seal fails, and that an engineering authority exercising final judgment is a "+
        "precondition for ordinary politics rather than a suspension of it. On this view, "+
        "demands for civilian oversight come from those who have not experienced a loss of "+
        "pressure." },
      { h:"Argument against", body:
        "Critics argue that emergency authorities invariably find emergencies, and cite the "+
        "Allocation Act, which permits the shedding of a tier-four register without notice to a "+
        "minister and has been exercised in circumstances that were not immediate crises. "+
        "Declaration is straightforward; termination is contested." },
      { h:"Status", body:
        "Unresolved. Both major parties have governed without settling it, and both have found "+
        "the ambiguity convenient in office and difficult in opposition." }
    ],
    see:["engineering_authority","shed_order","hul"] },

  { id:"the_failed_revolution", title:"The events of 2251", category:"History",
    banners:["stub","neutrality","single"],
    edited:{ by:"unattributed", attested:false, note:"reverted 9 times this session" },
    summary:"The **events of 2251** were a rising against the provisional administration, "+
            "suppressed within five weeks. Accounts of its causes, extent and casualties differ "+
            "substantially.",
    sections:[
      { h:"", body:
        "This article has been the subject of sustained edit conflict. The Registry has " +
        "declined to protect it on the grounds that no attested account has requested " +
        "protection.\n\n" +
        "It is not disputed that the rising failed, that several of its surviving participants " +
        "hold public office, and that the alignments of the present parties can be traced to " +
        "the positions their founders took in that year." }
    ],
    see:["perigee_charter"] },

  { id:"functional_constituency", title:"Functional constituency", category:"Elections",
    banners:["contested"],
    edited:{ by:"Apportionment Reform Society", attested:true, note:"" },
    summary:"A **functional constituency** is a seat in the House of Delegates elected by a "+
            "profession or industry rather than by a place. Forty of the 280 seats are functional.",
    sections:[
      { h:"Origin", body:
        "The functional tier originated in the founding compromise. The Charter's authors "+
        "required the engineering guilds and the consortiums to accept civilian rule, and "+
        "permanent representation was the price. The arrangement was described as transitional "+
        "and has been extended four times." },
      { h:"Franchise", body:
        "The electorate of a functional seat is defined by professional licensure, and the "+
        "licensing boards are appointed by the government of the day. A government may "+
        "therefore change who votes in a functional constituency by regulation, without "+
        "legislation or a division." },
      { h:"Size", body:
        "Functional electorates range from 62 voters to 214,000, against district electorates "+
        "averaging under thirty thousand." },
      { h:"The residual constituency", body:
        "Persons belonging to no recognised sector, including the unemployed, the dependent and "+
        "the suspended, vote in a single residual functional constituency. It is the largest "+
        "electorate in the Commonwealth and returns one member." },
      { h:"Abolition", body:
        "Abolition requires a Charter amendment, which requires a dual majority, which requires "+
        "the functional tier to vote for its own abolition. The Party of Socialists and "+
        "Democrats has committed to abolition at four consecutive elections." }
    ],
    see:["dual_majority","licensure","gb","perigee_charter"] },

  { id:"dual_majority", title:"Dual majority", category:"Elections",
    edited:{ by:"Chartist Study Group", attested:true, note:"" },
    summary:"A **dual majority** is the requirement that certain measures carry separately "+
            "among functional and elected members of the House of Delegates.",
    sections:[
      { h:"Scope", body:
        "The requirement applies to Charter amendments and to bills affecting life-support "+
        "integrity. It does not apply to ordinary legislation, appropriation, or instruments "+
        "made under existing statutory powers." },
      { h:"Effect", body:
        "A government with a comfortable majority among elected members may be unable to "+
        "legislate in the field it was elected to reform. The present coalition holds twelve of "+
        "forty functional seats and requires twenty-one." }
    ],
    see:["functional_constituency","divergence_threshold"] },

  { id:"suspension", title:"Suspension", category:"Personhood",
    banners:["contested"],
    edited:{ by:"multiple", attested:true, note:"" },
    summary:"**Suspension** is the condition of a mind held intact and not running. It is not "+
            "death and is not, in law, an interruption of legal personality.",
    sections:[
      { h:"Routes", body:
        "Suspension may be voluntary, where a person elects to wait out a debt, a body shortage "+
        "or a course of treatment; penal, where a sentence is served as absence; default, where "+
        "a person can no longer meet substrate costs; or triage, where a shortfall has occurred "+
        "and the shed order has selected them." },
      { h:"Restoration", body:
        "A suspended person cannot petition for their own restoration; restoration requires "+
        "another party to meet the cost. Whether obligations accrue during suspension "+
        "determines whether default suspension is temporary or permanent, and the present law "+
        "is that they do." },
      { h:"Apportionment", body:
        "Suspended persons are counted for the apportionment of seats and cannot vote. A "+
        "station with a large suspended population therefore returns members elected by a small "+
        "active electorate. Homestead has 11,400 suspended residents against a population of "+
        "880,000." }
    ],
    see:["shed_order","substrate","ashfield"] },

  { id:"licensure", title:"Licensure", category:"Personhood",
    banners:["cleanup"],
    edited:{ by:"unattributed", attested:true, note:"" },
    summary:"**Licensure** is professional certification. It determines both the right to "+
            "practise and, in a functional constituency, the right to vote.",
    sections:[
      { h:"Boards", body:
        "Licensing boards are appointed by the responsible minister. Their composition is not "+
        "subject to a division and their determinations are not ordinarily reviewable." },
      { h:"Category restrictions", body:
        "Several boards restrict licensure by legal category. Where they do, a person may "+
        "lawfully perform work and lawfully be excluded from the constituency that represents "+
        "it. The Registry does not treat this as a franchise question." }
    ],
    see:["functional_constituency","gb"] }

  ]
};
