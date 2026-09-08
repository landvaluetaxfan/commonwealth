/* =============================================================
   LABOUR

   What people actually do, and what proportion of them do it.

   THE ANCHORS ARE ALREADY CANON. Population 6,863,000. Adult roll
   4,149,803. Of those, 239,803 hold a functional franchise and
   3,910,000 sit in the residual constituency. Every figure below is
   derived from those and must stay consistent with them; the licensed
   counts in functional.js are the hard constraint.

   THREE FACTS THE TABLE IS BUILT TO CARRY:

   1. Most adults do not work. Automation took bulk production two
      centuries ago. Participation is 38 per cent, and the consumables
      floor and substrate insurance are not a safety net — they are the
      primary distribution mechanism. What people argue about is the
      uprating formula, never whether the floor exists. (Bible 2.1:
      the radical thing is settled and old.)

   2. Licensure is a narrow gate on a wide sector. 142,000 people do
      verification work; 890 of them are licensed, and those 890 elect
      two MPs. 63,000 work in life support; 4,100 are licensed. The
      gap between "does the work" and "votes in the seat that
      represents the work" is the whole of 4.6.4.

   3. Fork labour does not appear in the table, because instances are
      not legally persons and are therefore not employed. They perform
      roughly a fifth of all recorded labour-hours. Lowering the
      divergence threshold does not create those hours; it makes them
      employment.

   share      per cent of the employed workforce
   embodied   share of that category's work requiring a physical body
   licensed   holders of the relevant licence, where one exists
   forkable   how exposed the category is to instance labour
   ============================================================= */

const LABOUR = {

  totals: {
    population: 6863000,
    adultRoll: 4149803,
    participation: 0.38,
    employed: 1577000,
    functionalFranchise: 239803,   // 15.2% of the employed
    residual: 3910000
  },

  categories: [

    { id:"care", name:"Care and personal support", share:16.0,
      embodied:0.86, licensed:null, forkable:"low", sector:null,
      note:"The largest thing anyone does. Childcare, and elder care complicated by the fact "+
           "that emulated elders do not die on schedule. Body care for the embodied, and "+
           "restoration nursing for the newly returned, who are missing time and know it." },

    { id:"maintenance", name:"Maintenance and trades", share:16.0,
      embodied:0.94, licensed:214000, sector:"fc_maintenance", forkable:"medium",
      note:"Repair in awkward geometry, which is the work automation never took: irregular, "+
           "cramped, one-off, in variable gravity. 214,000 of roughly 252,000 are union "+
           "members, and the union holds a strike weapon amounting to a credible threat to "+
           "everyone's life support. Essential-services law exists because of it." },

    { id:"attestation", name:"Attestation and verification", share:9.0,
      embodied:0.22, licensed:890, sector:"fc_attestation", forkable:"high",
      note:"Unique-person proof is required to vote, to hold office, to contract, and to post. "+
           "Somebody performs that check. 142,000 people do; 890 hold the practising licence "+
           "and elect two MPs between them. The largest gap between doing the work and voting "+
           "in the seat that represents it." },

    { id:"hospitality", name:"Hospitality, food and corridor trade", share:8.0,
      embodied:0.91, licensed:null, sector:null, forkable:"low",
      note:"The bakery on the corridor. Not economically necessary and universally defended, "+
           "because a habitat where nobody sells anything to anybody is a facility rather than "+
           "a town." },

    { id:"administration", name:"Public administration", share:7.0,
      embodied:0.35, licensed:null, sector:null, forkable:"high",
      note:"The Ministries, the Bureau, the station authorities. Quietly the most fork-exposed "+
           "category in the table: committee work is done by fast-running staff and everyone "+
           "knows it." },

    { id:"agriculture", name:"Agriculture and consumables", share:7.0,
      embodied:0.88, licensed:8900, sector:"fc_consumables", forkable:"low",
      note:"Enclosed-system horticulture is finicky in ways automation handles badly. The "+
           "agricultural decks are also the only place on most stations with green and open "+
           "sightlines, so the people who work them are tending the parks, the courting spots "+
           "and the funeral sites at the same time." },

    { id:"liability", name:"Law, adjudication and liability", share:6.0,
      embodied:0.18, licensed:5200, sector:"fc_legal", forkable:"medium",
      note:"Automation can compute and cannot be liable. Reclassification is a branch of "+
           "practice in its own right because the Charter's schedule of persons was drafted "+
           "badly. 95,000 work in law; 5,200 are admitted." },

    { id:"education", name:"Education and instruction", share:5.0,
      embodied:0.55, licensed:null, sector:null, forkable:"medium",
      note:"Complicated by clock rate: a class running at mixed rates is not a class. Schools "+
           "are among the few institutions that enforce a common tempo, which is where the "+
           "civic-clock-minimum argument was first made." },

    { id:"construction", name:"Construction and volume works", share:5.0,
      embodied:0.96, licensed:null, sector:null, forkable:"low",
      note:"New pressurised volume, on a schedule nobody can accelerate. The binding constraint "+
           "on housing, and therefore on everything." },

    { id:"lifesupport", name:"Life support operations", share:4.0,
      embodied:0.72, licensed:4100, sector:"fc_lifesupport", forkable:"low",
      note:"Atmosphere chemistry, water cycling, thermal management. 63,000 do the work; 4,100 "+
           "hold the licence. The licensing board is appointed by the government of the day, "+
           "which means the electorate of this seat is set by regulation rather than by law." },

    { id:"medicine", name:"Medicine and physiology", share:4.0,
      embodied:0.79, licensed:2700, sector:"fc_medicine", forkable:"low",
      note:"Bone density management, embodiment fitting, and the restoration of the suspended. "+
           "63,000 in the sector; 2,700 admitted physicians. Where continuity-of-soul arguments "+
           "arrive dressed as clinical guidance." },

    { id:"substrate", name:"Substrate operations", share:3.0,
      embodied:0.44, licensed:null, sector:"fc_substrate", forkable:"high",
      note:"Running the hardware that runs the people. The franchise here belongs to companies "+
           "rather than to the 47,000 who operate it — 411 corporate voters, six of them "+
           "incorporated in the same week." },

    { id:"transit", name:"Transit and orbital mechanics", share:3.0,
      embodied:0.68, licensed:3400, sector:"fc_transit", forkable:"low",
      note:"Piloting, window scheduling, cargo handling, debris tracking. Takes Kessler risk "+
           "considerably more seriously than Parliament does." },

    { id:"culture", name:"Culture, media and attention", share:3.0,
      embodied:0.30, licensed:null, sector:null, forkable:"high",
      note:"Broadcast, press, performance, and the attention economy underneath. Structurally "+
           "fork-exposed: a wealthy actor can spin instances to manufacture apparent consensus, "+
           "which is why every post carries an attestation marker." },

    { id:"security", name:"Security and enforcement", share:2.0,
      embodied:0.83, licensed:null, sector:null, forkable:"low",
      note:"Small by the standards of any Earth state. The thing that actually enforces order "+
           "in a habitat is that everyone can be switched off, which is a fact nobody in the "+
           "sector is comfortable saying aloud." },

    { id:"underwriting", name:"Underwriting and actuarial", share:1.0,
      embodied:0.12, licensed:140, sector:"fc_underwriting", forkable:"high",
      note:"In a place where failure kills everyone in the room, insurance prices everything "+
           "continuously. 140 corporate voters return three MPs. The only people in the "+
           "Commonwealth with accurate numbers on everything." },

    { id:"gravity", name:"Gravity work", share:0.8,
      embodied:1.00, licensed:null, sector:null, forkable:"none",
      note:"The anchors, the Earth-surface terminals, and anything requiring tolerance of a "+
           "full gravity. Requires bone density most orbital-born do not have and cannot "+
           "acquire. Well paid, high status, and overwhelmingly done by Earth-born arrivals — "+
           "which is the whole of the nativist grievance, inverted." },

    { id:"other", name:"Everything else", share:0.2,
      embodied:0.50, licensed:null, sector:null, forkable:"medium",
      note:"Registered occupations too small to enumerate. The Bureau publishes the list "+
           "annually and it is read only by the Bureau." }
  ],

  /* Cross-cutting, not a category: instances are not legally persons and so
     cannot be employed. Under the current 168-hour threshold an employer spins
     staff copies for a working week and reabsorbs them. Lowering the threshold
     does not create these hours. It makes them employment, with everything that
     follows — wage floors, union rights, and roughly 1.9M new legal persons. */
  forkLabour: {
    shareOfRecordedHours: 0.21,
    shareOfJobs: 0.0,
    note:"A fifth of all labour performed by entities the law does not recognise as working."
  },

  /* Where the money comes from for everyone else. */
  distribution: {
    consumablesFloor: 0.62,      // share of adults drawing it in any given quarter
    substrateInsurance: 0.34,    // share of the emulated population covered
    note:"Not a safety net. The primary distribution mechanism, settled generations ago. The "+
         "argument is the uprating formula and has never been whether the floor exists."
  }
};
