# THE ORBITAL POLITICAL THRILLER — PROJECT BIBLE

**Version 4 · 8 September 2026**
Supersedes v2. `vault.md` retained separately as raw append-only source material.
Companion: `textbook.md`, an in-world socioeconomic primer — canon, but written
in-fiction and not a spec.

**What changed in v3:** the polity has a settled name and no demonym (§11.1);
the naming scheme is locked (§3.9); coalition capital became a per-partner ledger
rather than a scalar (§7.6); order-paper time is the currency that generates it
(§7.7); whipping and party discipline exist (§7.8); scarcity prices exist and
carry the consequence chain (§7.9); chapters exist (§1.7); the economy is
specified (Part VII); labour and non-participation are quantified (§10.3, §10.4);
fork-rentiers are a new bloc (§10.5); the tooling section is rewritten (§15.5).

---

# PART 0 — HOW TO USE THIS FILE

## 0.1 What this file is

The canonical reference for a text-based narrative political thriller set in a federated republic of orbital habitats. It contains the design frame, the constitutional and electoral machinery, the worldbuilding, the party system, and the production plan.

It is written to be **uploaded to Claude project knowledge** so that any new chat in this project starts fully briefed.

## 0.2 Briefing protocol — instructions to Claude

When Harper opens a chat to work on a **specific mechanic, system, or content area**, do the following *before* diving into the new work:

1. **Brief back everything in this file relevant to that area**, across all three registers, because the point is to surface things Harper has forgotten:
   - **Political-system material** — how the mechanic works in-world, its legal and constitutional detail.
   - **Game-mechanical material** — how it touches the state object, the loop, the loss conditions, the UI.
   - **Flavour and worldbuilding material** — the texture, the names, the scandals, the aesthetic notes.
2. **Flag anything in the file that is marked OPEN** and bears on the current topic.
3. **Add at least two or three things not yet in the file** — new ideas, extensions, or problems the topic raises. Every narrowing pass should extend the bible, not just recite it.
4. **Say what is thin.** If a section relevant to the topic is underdeveloped, name it rather than papering over it.

Keep the briefing tight and scannable. It is a pre-flight check, not an essay.

## 0.3 Maintaining this file

Claude cannot write to project knowledge. At the end of a working chat, Claude should output a revised full file (or a clearly-marked patch section) for Harper to re-upload, replacing the old version. Version number at the top increments each time.

## 0.4 Status legend

- **LOCKED** — decided; do not relitigate without an explicit request.
- **LEANING** — provisional decision; may still move.
- **OPEN** — undecided; live design question.
- **THIN** — accepted in principle, underdeveloped in detail.

---

# PART I — PROJECT FRAME

## 1.1 What the game is — LOCKED

A text-based narrative political thriller with real electoral mechanics. The player is a named Prime Minister leading a party in a coalition government of a federated republic of orbital habitats.

Reference points: *Suzerain* for narrative-political shape; *Social Democracy: An Alternate History* for register; both exceeded in mechanical depth.

## 1.2 Audience — LOCKED

Explicitly **not** a general audience. Built for players with genuine appetite for electoral system detail, coalition arithmetic, and constitutional theory — and simultaneously for deep speculative worldbuilding. The intertwining of the two is the product.

Suzerain was built to be playable by anybody, and that ceiling is exactly what this project declines.

## 1.3 The tonal target — LOCKED

The world is radically different from the present. The **politics feels like the politics of today.**

## 1.4 Implementation method — LOCKED

Vibecoded via Claude. Engine and content in separate sections of a technical spec; engine defines schemas, content conforms to them. First pass produces a playable skeleton with roughly twenty seed events. Every later pass is "write thirty more events matching this schema."

## 1.5 Engine constraints — LOCKED

- Low scalar count, orthogonal meters (six or seven).
- Deterministic or near-deterministic resolution. Heavy RNG makes balance untestable.
- Expect the engine to work and the balance to be wrong on first pass.

## 1.6 A second, parallel design thread — OPEN

An earlier thread designed a 24/7 real-time persistent version: timestamp-delta simulation (the world *appears* to have run while away, rather than truly running), thin hosted datastore for phone/PC sync, one real day to one game week, catch-up digest as the primary content surface. Unresolved: whether push notifications are required, which is the deciding scoping question before building the state object.

This is compatible with everything below but is not assumed by it.

## 1.7 Chapters — LOCKED

The narrative is divided into chapters. An event tagged `chapter: N` cannot fire
until the game reaches that chapter; an untagged event is available in all of
them. **Chapters advance on a decision, never on a timer** — a choice applies
`{chapter: N}`. Each chapter has its own authored opening (`prologue: 1, 2, …`)
which fires in order before its weighted pool takes over.

The prologue exists to control the order in which the player meets new ideas, and
enforces §2.6: one concept cluster per event.

---

# PART II — DESIGN PRINCIPLES

## 2.1 Date your novelties — LOCKED

Contemporary politics depends on: a shared clock, information moving fast enough that scandal moves opinion in days, constitutional basics settled enough that fights are second-order, and scarcity that is real but not immediately lethal.

Contemporary politics isn't about whether people get to vote. It's about redistricting, procurement contracts, formulary coverage, and which committee a bill dies in.

**Therefore: whatever is radical about the world is two or three generations old.** The franchise fight over uploaded consciousness happened generations ago, it was ugly, and reopening it is politically suicidal. What people argue about *now* is whether fork-instances count for apportionment — boring, technical, worth a hundred million to somebody.

**Corollary:** keep two novelties hot, freeze the rest into infrastructure. If citizenship, mortality, labour, and identity are all live simultaneously, you have a constitutional convention, not a government.

## 2.2 Light-lag discipline — LOCKED

The polity is confined to Earth orbit, so light-lag is negligible and a shared political conversation is possible. Mars, the belt, and the outer system are foreign policy, where delay makes politics genuinely alien. The contrast is free.

Exception, deliberately kept: **external constituencies** (Selene, Lagrange) are far enough to return late. See §4.9.

## 2.3 Physical parameters are legislative outputs — LOCKED

From Robinson's Mars trilogy: terraforming works as a master conflict because atmospheric pressure and sea level are things a legislature sets. **If a bill can alter the physical parameters of the setting, the setting stops being scenery.**

Orbital equivalents: closure targets, the spin-gravity standard for new construction, debris remediation, thermal capacity appropriations, whether the next elevator is built and where its anchor goes.

## 2.4 Founding ambiguity is a feature — LOCKED

From Dorsa Brevia: the pre-independence congress produced a declaration that worked *because* it was vague on contested items. The Perigee Charter has deliberate holes, and those holes are exactly what the legislative fights are about. Cheapest possible way to make a constitutional order feel like it has history.

## 2.5 Keep the constitutional question open — LOCKED

*Blue Mars* goes slack once the constitution works. Do not resolve the central constitutional question (see §3.7).

## 2.6 Explanation cost is the real budget — LOCKED

In a text game the economy is prose: how many words to establish a faction or a place before the player can decide about it. "The owl senator" costs three words; "the Kepler-cluster delegate, a third-generation fork on leased substrate" costs a paragraph and a glossary lookup. The orbital setting pays this cost hundreds of times, so glossary discipline and register discipline matter more here than they would elsewhere.

## 2.7 Generation drift is the main production risk — LOCKED

The setting must survive being regenerated by a model that has only this file. Mitigations:
- A frozen station roster. No pass may invent a station.
- A closed list of legal person-categories.
- A glossary; no pass may use a setting term not in it.
- Named characters in a fixed roster.

---

# PART III — CONSTITUTIONAL ORDER

## 3.1 Form of government — LOCKED

**Parliamentary republic** (Germany, Ireland, Italy, India model). Prime Minister runs government. A directly elected president holds a ceremonial office plus sharp reserve powers.

Not semi-presidential. Cohabitation with a president holding real portfolios was considered and rejected as too expensive.

Why parliamentary:
- You can fall at any time. A president has a countdown; a PM has a permanent knife at the throat.
- Coalition math becomes the core loop.
- Seat allocation is load-bearing — the formula determines who governs.
- "Opposition leader" is a real office with a shadow cabinet and a clear win condition.
- A federated patchwork of stations wants a parliament anyway.

## 3.2 The legislature — LOCKED

**House of Delegates, 280 seats.** Majority 141.
- 140 district seats
- 100 list seats
- 40 functional seats

**Upper house of stations**, equal representation regardless of population. Generates permanent malapportionment fights. Currently **THIN** — needs powers defined (delay? veto? territorial matters only?).

## 3.3 The presidency — LOCKED

Directly elected, separate cycle, independent mandate. Can credibly claim to speak for the country against the government.

**Reserve powers:**
1. **Refusing dissolution.** The best one — you're polling well, you want a snap election, the president declines. Cultivating the relationship in quiet months becomes strategy.
2. **Government formation.** After an inconclusive election, decides who gets first attempt. Largest party has no guarantee.
3. **Bill referral** for constitutional review. Delays and can kill. Aimed squarely at personhood law and apportionment reform.
4. **Appointment refusal.** A cabinet pick blocked; spend coalition capital on a second choice.

**Mid-game beat:** the presidential election is a national referendum on the government that is *not* a confidence vote. You can lose it and survive, damaged.

**The thriller version:** the president is someone the PM beat for the party leadership, deposed, or promoted sideways to get them out of the caucus. Every reserve power then carries personal history.

**Thematic weight:** in a patchwork of stations with no shared territory, the presidency is the only office elected by everyone. It is the thing that symbolically holds the union together. A president declining to sign an apportionment bill does so as the embodiment of the small stations about to be underweighted.

State cost: a character record, a relationship scalar, a `powers` list, gates on actions.

## 3.4 The player character — LOCKED

A distinct named in-universe person, not a blank avatar. Gives event text a voice and a personal history that can be dug up, which is the actual engine of a political thriller.

**Rule: personal traits are mostly liabilities, not buffs.** A brilliant orator with an ex-business partner under indictment is a better game than +10 charisma.

Two or three pregenerated leaders with different opening constraints as a replay hook. **THIN** — only one is written (see §11.2).

## 3.5 Loss conditions — LOCKED

1. Lose a confidence vote.
2. Lose a leadership challenge from inside your own party.
3. Lose the general election.
4. Life-support cascade (setting-specific catastrophe).

The leadership challenge is the one most games skip and the best one: it makes your own caucus an antagonist, so loyalty management has teeth and every popular-but-divisive decision costs something real.

## 3.6 Opposition versus government — LEANING

Two different action economies. In opposition the verbs are rhetorical and organisational — position, exploit, recruit, select candidates, manage your own party; you cannot pass anything. In government you have levers but own outcomes, crises land on you by default, and the problem is holding a coalition together while doing unpopular necessary things.

**Decision:** put the `in_government` flag in the state object from day one (retrofitting is painful). Write v1 content for governing only. Opposition prologue is a second content pass.

## 3.7 The central constitutional question — LOCKED, NEVER RESOLVED

**The permanent emergency.** A habitat can kill everyone in it through administrative failure. Does that justify an engineering authority whose word is final? Hullism is the party of answering yes. Civilian supremacy over life-support engineers is a genuinely difficult position to hold when people can die.

Emergency *declaration* is easy. Emergency *termination* is the fight. Who ends it.

## 3.9 Naming scheme — LOCKED

> Parliament · House of Delegates · MP · Prime Minister · Cabinet · Ministry ·
> Minister for X

**Not:** Secretary of State, Department, Secretary-General, Congress, Senator.

MP means Member of Parliament, so MPs sitting in a chamber with its own name is
the ordinary Westminster pattern — the House of Delegates survives intact.

**The Ministries.** Life Support · Substrate and Thermal · Consumables and
Agriculture · Volume and Housing · Transit and Orbital Mechanics · Attestation
and the Registry · Persons and Continuity · External Relations. The Treasury sits
apart and reports directly to the Prime Minister.

Life Support is the senior post and the one that ends careers. It is the only
Ministry whose Minister may be summoned **by** the engineering authority rather
than the reverse — a provision of the Allocation Act, never amended, raised at
every confirmation. §3.7 as an administrative fact.

**The vestigial title.** The Perigee Charter styles the head of government
*Secretary-General of the Commonwealth*, from when the Commonwealth was a treaty
organisation between stations rather than a state. The usage survives on
instruments of appointment and nowhere else. No holder has been addressed by it
since 2206. §2.4: the Charter should feel dated.

## 3.8 Constitutional oddities — LOCKED as available material

- **Term limits measured in subjective time.** A legislator running hot burns a term in eighteen realtime months.
- **Quorum under variable clock speed.** Can a fast-running member be counted twice?
- **The Continuity Provision.** If a habitat is lost, do its members retain seats until the next census? Ghost constituencies with real votes.
- **Voting age for a fork** instantiated adult with complete memories.
- **Is suspension a vacancy?** If a member goes cold for want of substrate funds, does the seat empty — and could a party quietly fail to pay a rebel's bill?

---

# PART IV — THE ELECTORAL SYSTEM

## 4.1 Parallel voting — LOCKED

Two ballots. List seats allocated independently of district results; **no compensation**. Semi-proportional. Japan, South Korea, Russia.

## 4.2 The tier split as a tonal structure — LOCKED

This solves the "sometimes cliché, sometimes high concept" worry by formalising it:

- **District tier = local colour.** Habitat character, local accent, the specific grievance. Tropey by design, because that is the register in which local material interest is legible: this district wants the ring resurfaced, that one wants the tariff. Cliché is load-bearing at the local level in real politics too.
- **List tier = national ideological politics.** Personhood law, thermal quota standards, apportionment reform. Abstract, contested, no local address. This is where the high-concept material lives.

**Core tension:** list-tier ideological commitments cost you district seats; district-tier pork alienates your national base.

## 4.3 Consequences of parallel specifically — LOCKED

- **The list tier does not correct district malapportionment.** Unlike MMP. Disproportionality is baked in and permanent — thematically perfect for a federation of unequal stations.
- **Over-rewards the largest party** (district sweep stacks on proportional list share).
- **A pure list party is viable** — strong nationally, zero districts, no roots. The shape of the Public Substrate Association and the Georgists. Opponents call them rootless with some justification.
- **Split-ticket voting is measurable.** Ticket-splitting rate as a surfaced state variable: vote for the local incumbent you like, vote the party you believe in. A cheap, readable signal about where a coalition is soft. Currently running 21.4%, four points above the last general election.

## 4.4 The tier ratio is amendable — LOCKED

The district:list ratio **is** the disproportionality dial, so changing it is a bill. Aligns with the axes: Station Compact wants more district seats, federalists and national ideological parties want more list. One number, permanent fight, no new machinery.

## 4.5 Dual candidacy and revenants — LOCKED

Candidates may stand on the district ballot and the list simultaneously. District losers can be resurrected via the list, ranked by **how narrowly they lost** (Japan's *sekihairitsu* best-loser system), under s.44 of the Representation Act.

Revenants owe their seat to the party rather than any constituency. They whip perfectly and have no local base to defend. **A caucus full of them is loyal and brittle** — a fact for a PM to discover at the wrong moment. Nine currently sit for the Commons Union.

## 4.6 Functional constituencies — LOCKED

Forty seats. Modelled on Hong Kong, but the justification is actually true here: in a habitat where an engineering error kills eleven thousand people, "technical expertise is too important to leave to a mass electorate" is hard to dismiss.

**Origin.** The founding compromise. The Perigee Charter's authors needed the engineering guilds and the consortiums to accept civilian rule, so they got permanent seats. Explicitly transitional, with a sunset clause extended four times. *Hullism didn't win the constitutional argument; it won a bloc of seats.*

**The sectors:** Life Support Engineering · Maintenance and Trades (union bloc vote) · Substrate Providers · Consumables and Agriculture · Transit and Orbital Mechanics · Elevator and Loop Consortiums · Physiological Medicine · Attestation and Registry · Underwriting · Legal.

**These are not uniformly right-wing.** The labour panels are solidly Commons Union. The player's own party benefits from a system the player's own party is committed to abolishing. The good kind of hypocrisy to hand a protagonist.

### 4.6.1 Dual majority — LOCKED

Certain bills must carry **separately** among functional and popular members. Scoped tightly: **bills touching life-support integrity, and charter amendments.**

The functional veto therefore exists precisely over the domain that justified the seats. A player can hold a comfortable parliamentary majority and be unable to pass the thing they were elected to pass. Lobbying becomes a genuinely separate activity from campaigning.

### 4.6.2 Corporate voting — LOCKED

Where a company votes rather than its employees, whoever controls the company controls the seat. Shell subsidiaries incorporated to manufacture votes; a consortium splitting into six entities to acquire six.

**This collides with personhood law in a way no real system can:** if instances are persons, an entity can register instances as voters in an electorate of four hundred. Census fraud at a scale that decides the seat outright.

### 4.6.3 Electorate sizes — LOCKED

A functional seat with 400 voters beside a district of 800,000. Won by persuading a few dozen people over dinner rather than campaigning. `apportionment_ratio` handles this unmodified — it just produces numbers that look like typos.

### 4.6.4 The licensing board — LOCKED, and the sharpest tool in the game

Franchise in a functional constituency runs through **professional licensure**, and the government appoints the licensing boards. So the player can appoint a board that broadens or narrows who counts as a life-support engineer.

That is not gerrymandering the district. **It is gerrymandering the electorate itself, by regulation, without legislation.** Slow, deniable, enormously powerful.

It interlocks with personhood: if licensure is restricted by legal category, an emulation who does the work cannot vote in the seat that represents the work. Restrictionism enforced economically rather than constitutionally, which is how these things usually actually work.

### 4.6.5 The residual constituency (the "super-seat") — LOCKED

Stolen from Hong Kong's District Council (Second) constituency, which enfranchised everyone who had no other functional vote — millions electing a handful of seats.

**The orbital version:** a residual functional constituency for everyone in no recognised sector — the unemployed, the dependent, the suspended. Enormous, powerless, grotesque. Makes the absurdity of the whole tier legible in one line.

### 4.6.6 Abolition — LOCKED as permanent open question

The House of Lords problem: abolishing the functional tier requires a charter amendment, which requires a dual majority, which requires the functional tier to vote itself out of existence. **The player's party has promised this at four consecutive elections.** It is the platform commitment the player inherited and structurally cannot keep — the tension worth building the campaign around.

### 4.6.7 Costs, acknowledged

- A third tier is real complexity on top of parallel voting. The UI must carry it — a panel that always shows both majorities side by side, so the player never forgets the second one exists.
- Functional constituencies are distinctive enough to Hong Kong that it can read as a lift. Defence: lean on the broader vocational tradition — Ireland's Seanad panels, the corporatist chambers — same shape, different flavour.

## 4.7 Apportionment population ≠ voting population — LOCKED

The gap is where the best fights are. Do suspended persons count for apportionment? Do instances?

A station with a large suspended cohort gets seats for people who cannot vote, and whoever holds those seats is elected by a small active electorate. **This is prison gerrymandering, exactly.** Ashfield Cans is the worked example: 880k population, 11,400 suspended, ratio 1.88.

## 4.8 Thresholds — LOCKED

4–5% national threshold on the list tier. Generates vote-lending and parties agonising just below the line.

**Carve-out:** Germany exempts parties winning district seats. The orbital version also exempts parties representing a **single station** or a **single legal-person category**, as minority protection. That carve-out is then permanently contested in its own right.

## 4.9 External constituencies — LOCKED

Citizens on the Moon, at the Lagrange points, and working the Earth anchors. Precedent: French and Italian overseas constituencies.

Light-lag returns here as drama: **voting windows rather than voting days**, results certified at staggered times, and a Selene result arriving after the mainland count finishes — so everyone knows it is decisive and everyone waits. Four external seats currently.

## 4.10 Apportionment method as plot — LOCKED

D'Hondt favours large parties; Sainte-Laguë favours small ones. The choice of divisor is a bill. **Two distinct fights:** the method for apportioning district seats to stations, and the method for allocating list seats to parties. Apportionment paradoxes (Alabama and friends) are real and would be litigated.

## 4.11 Campaign finance in substrate-hours — LOCKED

A fast-running candidate campaigns more per realtime day. Spending caps are therefore denominated in **subjective-hours**, not currency, and running hot during a campaign is the regulated activity. Ties campaign law directly to the clock-speed concept.

## 4.12 Attestation as voter ID — LOCKED

Unique-person attestation is required to vote and to participate in public discourse. Attestation infrastructure is therefore a civil-liberties fight with exactly the valence of voter ID: who runs the registry, who is excluded, what happens when attestation lapses. Ashfield Cans is at 68.2% attested on the adult roll.

## 4.13 Franchise weighting — OPEN

Considered, not adopted. Options: fractional votes for some categories (historically real — Prussian three-class franchise, UK plural voting until 1948); or **aggregate franchise**, where a root and all its instances share one vote to be exercised collectively, creating internal politics *within a single person*.

## 4.14 Compulsory voting variant — OPEN

Dark version: voting tied to consumables allocation — vote to be counted in your station's consumables apportionment.

## 4.15 Redistricting — OPEN

Live as a player-passable bill, or fixed for v1 with population drift only? Populations drift over the campaign either way. Redistricting is boring, technical, and worth enormous amounts to somebody, which is the exact register the project aims for.

---

# PART V — CONSTITUENCIES

## 5.1 The district list is the setting bible — LOCKED

In a text-based electoral game the district list is the screen the player stares at most. Every constituency must be an event generator, not a flavour blurb.

## 5.2 Constituency type is a real variable — LOCKED

- **Single-habitat seat:** one town hall, one dominant employer, one life-support authority to negotiate with.
- **Bundled seat:** five settlements that hate each other and share no interest except resenting the centre.
- **External seat:** distant, late-returning, tiny electorate, wildly overrepresented.

These want completely different campaign actions. Free mechanical differentiation.

## 5.3 Schema — LOCKED

```
id, name, tier (district | list_region | functional | external)
magnitude
population, apportionment_ratio      // > 1.0 = overrepresented
composition: {legal_category shares}
closure                              // 0.0–1.0, stations only
suspended_count                      // counted for apportionment, non-voting
attested_share                       // of adult roll
material_interest: [2-3 tags]        // consumables_subsidy, shed_order_priority,
                                     // volume_rationing, ley... (n/a), tether_traffic
dependency: what it needs from the centre
grievance: what it holds against the centre
party_leans: {baseline shares}
```

`apportionment_ratio` is non-negotiable: one number encoding the whole malapportionment theme, driving seat math directly, and serving as the hook every redistricting event keys off.

## 5.4 Roster discipline — LOCKED

Freeze early, cap at 25–40 districts, each with a written identity. Enough to feel like a real country, few enough that content passes can be told "you may only reference districts in this list."

---

# PART VI — TRANSHUMANIST MECHANICS

## 6.1 Legal categories — LOCKED, deliberately broken

The charter's schedule lists five: **biological, uplift, emulation, synthetic, instance.**

### Demographic split — LOCKED

| category | share of adults |
|---|---|
| biological | **64%** |
| emulation | 28% |
| uplift | 4% |
| synthetic | 4% |

**Biologicals are a clear majority, and the politics is emulation-dominated
anyway.** That is not a contradiction, it is the most recognisable configuration
available: a minority consuming a large and conspicuous share of a public
appropriation, protected by an entitlement that cannot be reduced without ending
its members, generating conflict out of all proportion to its size. Every society
that funds medicine from general taxation has this argument. Here it is about
radiators. §1.3 exactly.

**This contains a category error, and the error is kept on purpose.** The first four describe what you are made of. "Instance" describes what relation you stand in to another person. Different axes. So the law cannot cleanly answer: can a synthetic fork? Is an instance of an emulation a different category from its root, or the same category in a different status? A biological cannot fork, so why is instance a peer category rather than a modifier?

**The clean structure, which the law does not use:**

- **Category** (substrate of origin): biological · uplift · emulation · synthetic
- **Status** (cross-cutting, changeable): root/instance · running/suspended · attested/unattested · embodied/disembodied

A person is a category plus a bundle of statuses. Rights attach to both, and the interaction is where litigation happens.

**The drafters made this error at the founding, listed five categories in a single schedule, and the courts have been patching it ever since.** That is better worldbuilding than a tidy scheme: a specific, dated, technical defect that generates cases forever, and the reason instance law is its own branch of practice. Apportionment Reform wants to rewrite the schedule. Nobody agrees what replaces it.

Each category carries a different bundle of rights: vote · hold office · own property · inherit · count for apportionment. **The politics lives entirely at the boundaries.** Reclassification cases. A person who transitions category mid-term.

## 6.2 Substrate — LOCKED

Computing hardware hosting emulated minds. Three properties: **capacity** (how many minds), **clock rate** (how fast), **tier** (reliability, and position in the shed order).

**You pay rent to exist.** Not metaphor. Cost is roughly linear in clock speed and mind-complexity. The binding physical constraint is **thermal rejection** — every watt of computation becomes heat that must be radiated, and radiator area is finite, expensive, usually public. So the number of minds a habitat can host is a public works appropriation, and substrate is a natural monopoly with captive customers and a lethal failure mode. This is why it sits at the centre of the ownership axis.

**Tiering is the quiet cruelty.** In a shortfall someone decides the shed order — by contract, by statute, or by an engineering authority under emergency powers. Whoever writes it decides who stops existing first.

## 6.3 Clock speed — LOCKED

**Running hot** is the obvious weapon: a legislator at 8x reads every bill, attends every hearing, works eight times the hours. Money converts directly into political labour. Hence regulated clock speeds for officeholders, subjective-time term limits, committee work quietly done by fast staff, and treaties negotiated in forty realtime minutes that took three subjective months.

**Running slow is what poverty looks like.** A poor emulation at 0.3x experiences a four-year parliament as fourteen subjective months. They miss things. News arrives compressed. A campaign happens around them faster than they can follow. Not disenfranchised on paper — simply unable to participate in a conversation moving at eight times their speed.

**Therefore: a minimum civic clock rate**, publicly subsidised, so every citizen experiences the campaign at a comparable pace. A franchise-equality argument with no real-world analogue. Expensive, thermally constrained, and resented by the Commons Union's embodied base who pay for it. Excellent bill.

## 6.4 Forking and the divergence threshold — LOCKED, and the single best mechanic here

A fork is a running copy. The moment two copies have different experiences they diverge, and the law must say when divergence makes a new person.

**A divergence threshold defined in statute, measured in subjective hours.** Under it, an instance is legally the same person and can be reabsorbed. Over it, the instance is a new person with independent rights, an independent substrate bill, and an independent vote.

**One integer. Moving it changes everything:**

- **High (168 hours, current law):** forks are tools. Employers spin staff instances for a work-week and reabsorb them. Labour law barely applies. Apportionment is stable.
- **Low (40 hours, the government's bill):** nearly every fork becomes a citizen. The census explodes — an estimated +1.9M legal persons, redistribution in six districts. Fork-labour becomes employing people rather than using them. Anyone wealthy can manufacture voters.

**Every party has a position on the number:**
- Instance Rights League: zero.
- Consortium Liberals: high enough to keep fork-labour cheap, and embarrassed about it.
- **Commons Union: high, for a completely different reason** — a high threshold means fewer legal fork-workers competing with its embodied base. This puts the player's own party in accidental alliance with employers. Very good material.

Criminal-law mess follows: who serves a sentence when the instance that committed the act has been reabsorbed, and whether reabsorption of a criminal instance is evidence destruction.

## 6.5 Census law — LOCKED

If persons can fork, apportionment breaks. Do instances count? At what weight? Only roots? A station that spins up half a million instances before census day has committed something between fraud and civil rights advocacy, and the distinction is exactly what the courts are for.

Rotten boroughs, weirder and funnier. Makes the census a recurring plot rather than a background process.

## 6.6 Suspension — LOCKED

Cold storage. Not death, not life — the mind is intact and not running.

**Four routes in:**
- **Voluntary** — waiting out a debt, a body shortage, a treatment.
- **Penal** — a sentence served as absence.
- **Default** — you stopped being able to pay.
- **Triage** — a power shortfall, and the shed order chose you.

**The structural horror:** restoration requires someone else to pay. The suspended have no agency, no voice, no ability to petition. Their fate is decided in rooms they cannot enter.

**The debt question decides how bad it is.** If obligations accrue during suspension, a defaulted person can never escape — accumulating cost while unable to earn. If obligations pause, suspension becomes a rational financial strategy and people go cold voluntarily to wait out a bad decade.

**Politically:** a population that counts for apportionment and cannot vote, and a bloc you can suppress by choosing when to hold the election. **Suspension-timed elections** are the orbital analogue of hibernation-timed elections and considerably darker.

## 6.7 Backups — LOCKED

A snapshot, not a running mind. Restoration means losing everything since — so a restored person is genuinely missing time, which matters for what they consented to, what they owe, and what office they hold.

**Custody is the political part.** Whoever holds your backup holds your afterlife. Escrow regulation is a real regime. **Backup coercion** is the darkest available scandal: leverage that is near-total and near-impossible to prosecute.

## 6.8 Embodiment — LOCKED

Emulations can rent bodies; bodies are scarce and expensive. This creates a class distinction *within* the emulated population between the routinely embodied and the permanently virtual.

Interacts with bone-density politics: a body tolerating 1g is a premium asset, so the emulated wealthy can descend the well and the emulated poor cannot — exactly like the orbital-born.

## 6.9 State object variables — LOCKED

Small and high-leverage. Most personhood politics is expressible as bills that move these:

```
divergence_threshold_hours       // currently 168
civic_clock_minimum              // currently none
thermal_capacity[station]
substrate_ownership              // public/private share
suspended_population[station]
suspension_debt_accrual          // boolean
shed_order_authority             // statute | contract | engineering_authority
```

## 6.10 The biological position — LOCKED

The setting drifts emulation-heavy if left alone, and that weakens the politics.
Biologicals hold four structural positions, and the Commons Union's base sits on
all four.

**They do the embodied work, and that work is not low-status.** 46% of jobs
require a body and biologicals hold nearly all of them, so **the working
population is disproportionately biological and the non-working population
disproportionately emulated.**

**A body is an economic asset, not a class marker.** Embodied work spans the
entire income range: the anchors are the best-paid work in the Commonwealth and
need bone density nobody can acquire; maintenance in awkward geometry is skilled,
unionised, essential, and holds a strike weapon amounting to a credible threat to
kill everyone. This is a labour aristocracy, closer to an aircraft mechanic than
a labourer. Part of why the emulated poor are poor is precisely that they have no
body and cannot afford to rent one.

This is why the Commons Union and the Public Substrate Association have opposed
material interests while sharing an economic programme (§8.5).

**They pay for substrate and do not use it.** Thermal taxation funds the
insurance that keeps emulated citizens running, while fork-labour undercuts
embodied wages. The Commons Union's restrictionism is therefore a correct reading
of material interest rather than prejudice, which is exactly what makes the
player's own party uncomfortable rather than villainous (§9.1).

**They occupy volume; emulations barely do.** Volume is the fundamental scarce
good and the volume fight — density regulation, minimum-volume standards,
subletting, partitioning a berth into six — is almost entirely a biological
politics. The Freeholders are a party about embodied life whatever their
literature says.

**They die, and emulations do not.** This is the sharpest of the four. The
gerontocracy of §10.4 is an *emulated* gerontocracy: biological political
generations turn over, emulated ones never do. A biological of thirty contests
the future against an electorate that will still be voting in ninety years and
has consistently voted for the settlement that serves it. **There is no
constitutional remedy and no proposal for one has survived a first reading.**

### 6.10.1 The real class axis is exposure, not substrate — LOCKED

The question that sorts this society is not *what are you made of* but **can you
be switched off**.

A biological on the consumables floor is poor. An emulation on the floor is poor
**and on the shed register**. Identical income, categorically different exposure:
one of them can be ended by a thermal shortfall and an appropriation vote, and
the other cannot. This is what makes the shed order the central class fact of the
setting rather than a piece of colour.

| | volume rent | can be switched off | politics |
|---|---|---|---|
| Embodied, employed | yes | no | Commons Union: secure, organised, essential |
| Embodied, on the floor | cheap, low band | no | poor but not precarious |
| Emulated, high tier | no | not really | the accumulating gerontocracy (§10.4) |
| Emulated, low tier | no | **yes** | the shed register |

The bottom row is the genuine underclass, and it is a **created** one — created
by a pricing decision made in a chamber.

### 6.10.2 Two emulated populations with nothing in common — LOCKED

Wealth at the moment of uploading sets substrate tier, and tier decides whether a
person accumulates for a century or is shed at the next shortfall.

- **The secure long-lived.** High-tier substrate, effectively unkillable, near-
  universal turnout, unlimited time. The gerontocracy of §10.4.
- **The precarious virtual.** Low-tier substrate, on the shed register, poorly
  attested, politically invisible until a radiator fails.

They share a legal category and no interests whatsoever. **The Public Substrate
Association has to hold both**, which is a far better internal problem than that
party currently has, and worth writing into its faction structure.

### 6.10.3 Uploading as an economic decision — LOCKED, and underexplored

Emulation is far cheaper on **volume** and dearer on **thermal**. So the person
driven to upload is priced out of *volume*, which means **they are a ring-band or
middle-band tenant, not a low-band one.**

This is the correction that makes the geography work. Volume on Anselm Ring is
astronomical because everyone wants to be there; volume on Ashfield Cans is cheap
because nobody does. Nobody uploads to escape a rent they are already paying
cheaply.

**And there is a physical reason the bands differ on substrate.** A habitat in
low orbit is trying to reject heat while sitting in Earth's infrared glare.
Far-band and Lagrange habitats have far better rejection geometry, so substrate
is genuinely cheap out there. This is why Tsiolkovsky is 47% emulated and L5
Refuge 51%, while Ashfield is 81% biological. Uploading on Ashfield would trade
cheap volume you already have for tier-four substrate on a station shed eleven
years running: a death sentence with extra steps.

The pipeline, stated properly:

> Priced out of volume on a good station → upload → afford only low-tier
> substrate → land on the shed register → a thermal shortfall can end you.
> **You escape rent and acquire mortality-by-appropriation-vote.**

It also locks the person out of 46% of the labour market, and returning requires
renting a body at more than the volume rent they were fleeing. A poverty trap with
a shape no real economy has. It gives Physiological Medicine a real constituency
interest and gives Root & Vessel's continuity-of-soul position an economic base
rather than only a theological one. **THIN** — no events use it yet.

## 6.11 Physiological class — LOCKED

Someone born in 0.3g in a windowless can cannot descend to Earth, ever. A
permanent underclass defined by bone density rather than income. The hardest
class mechanic in the setting.

**It constrains the biological only.** An emulation of means rents a body
certified for 1g and descends — the body is equipment, not self. So the permanent
class defined by skeletal density is specifically a *biological* class, and the
wealthy emulated may visit Earth while the poor embodied may not. When
Descensionists speak of exile they mean the biological orbital-born and nobody
else, which is why their grievance is not answerable by economic policy.

---

# PART VII — ECONOMY AND SCARCITY

## 7.1 What got cheap, what stayed scarce — LOCKED

Near-post-scarcity works only if you are precise. Material goods are cheap: asteroid feedstock plus automated fabrication means objects are nearly free.

**What remains scarce:**

- **Volume.** Pressurised cubic metres are the fundamental good. Anyone can have a thing; nobody has room for it. Housing is the defining domestic issue exactly as in rich countries today, but sharper — volume is hard-capped by construction schedule. Density regulation, minimum-volume standards, volume rationing for new arrivals, subletting black markets, a slumlord class partitioning a berth into six.
  **Volume scarcity is positional, not uniform.** Anselm Ring volume is
  astronomical because everyone wants to be there; Ashfield volume is nearly free
  because nobody does. This is why the low band is embodied and the ring band is
  where people get priced out of their bodies (§6.10.3).
- **Thermal rejection.** The constraint nobody uses and the best one available. **How many people can exist is a public works appropriation.** Thermal quota trading as a carbon-market analogue, complete with fraud.
  **Rejection geometry varies by band.** A habitat in low orbit rejects heat while
  sitting in Earth's infrared glare; far-band and Lagrange habitats have far
  better geometry, so substrate is genuinely cheap out there. This is the physical
  reason Tsiolkovsky is 47% emulated and Ashfield 81% biological, and it means the
  two scarcities run in opposite directions across the roster.
- **Delta-v and launch windows.** Transport as a scheduled, rationed good.
- **Substrate cycles.** The wage good for a large part of the population.
- **Bone-compatible bodies.** Anyone who can tolerate 1g is economically valuable.

**Resulting economy: goods free, rent astronomical, existence metered.** A recognisable dystopia of the present, made literal.

## 7.2 Closure as the sovereignty number — LOCKED

Every habitat has a **closure ratio** — the fraction of its material cycle sustainable without imports. At 0.4 it dies in weeks without federal consumables. At 0.95 it can credibly threaten to leave.

The federation is therefore something no real polity is: **a union held together by metabolic dependency** rather than by force, consent, or shared identity.

**And the policy dilemma has real teeth:** federal infrastructure investment in a poor station raises its closure, and raising its closure funds its future secession. **Every development bill is a bill about the union's own dissolution.**

## 7.3 Taxation — LOCKED

Volume, thermal quota, substrate-hours, and mass-to-orbit. Not income. Land value taxation becomes literally correct, which is why the Georgists exist and are not a joke.

## 7.4 Welfare — LOCKED

- **Consumables floor:** guaranteed air, water, calories, minimum volume.
- **Substrate insurance:** the untouchable third rail. Cutting it does not reduce someone's income — it suspends them. Means-testing debates where failing the test means going cold.
- **Substrate debt:** emulation extends life, pensions explode, gerontocracy becomes literal. Debt as a form of time-imprisonment.

## 7.5 The shape of the economy — LOCKED

**A rentier economy.** Goods are nearly free; *access* is metered. Everything
that matters is a recurring charge for permission to keep existing somewhere:
volume rent, thermal quota, substrate rent, consumables. Hence taxation on
volume, thermal, substrate-hours and mass-to-orbit rather than income — income is
not the binding fact, outgoings are. Nobody asks what you earn. They ask what you
consume of the finite.

The commanding heights are all natural monopolies with lethal failure modes,
which makes the whole economy structurally a regulated-utility sector wearing the
clothes of a market. This is why the ownership axis is the sharpest of the four.

### 7.5.1 Why nothing floats — LOCKED, and the key structural idea

Equity exists. There is no liquid public market in it, and the reason is
constitutional rather than economic: **franchise attaches to corporate control.**
Four Substrate Provider seats and four Elevator seats are elected by companies,
not employees. Going public means diluting a parliamentary vote, not merely a
board.

Consortiums therefore stay closely held. Ownership passes by negotiated transfer.
The register of who controls what is a political document, and an IPO would be
unilateral disarmament. This explains the market structure, reinforces §4.6.2's
shell-company fraud, and means the metanationals are family-and-syndicate held
rather than shareholder-owned.

### 7.5.2 The financial sector — LOCKED

- **Quota trading** is the main market: thermal quota traded, hedged, forwarded
  and defrauded. A market in permission-to-exist-at-scale whose price is set by
  an appropriation vote.
- **Underwriting**, not banking, is the dominant institution. Where failure kills
  everyone in the room, insurance prices everything continuously — which is why
  Underwriting holds three functional seats and why the Underwriters are the only
  party with accurate numbers on everything.
- **Volume leases** are the household store of wealth: long-dated, inheritable,
  the nearest thing to real estate. Their value derives from position inside a
  habitat, which is unearned in exactly Henry George's sense. The Georgists are
  correct, and are punished for it electorally.
- **Substrate futures** are forward contracts on mind-hours — a traded market in
  whether particular people keep running.
- **Substrate debt** is credit secured against your own continuation. Time-
  imprisonment, and the darkest instrument available.

### 7.5.3 Money — LEANING

Denominate in **thermal rejection capacity**. Energy is trivial; dumping waste
heat is the hard limit on everything including computation, including how many
minds may exist. A currency that is a claim on radiator capacity is literally a
claim on room for someone to be alive.

It also solves a real problem: subjective-hours cannot be the unit of account
when clock rates differ twentyfold. The unit must be objective, and thermal is
the most objective scarce thing there is.

Marked LEANING rather than LOCKED because it touches every price in the game.

## 7.10 The productive economy — LOCKED

The four scarcity prices are the cost of *existing*. These are what the
Commonwealth *makes, sells and employs*, and without them it is a closed system
with a static labour market — which is not a modern economy however metered it
is.

A rentier economy is not the opposite of a market economy. Modern economies are
substantially rentier: housing, land, licensure, utilities. That is the Georgist
critique and it is why the Georgists exist here. So this adds the missing half
rather than replacing anything.

```
participation   per cent of adults in paid work, opening 39
trade           balance index, 100 level, above is surplus
private         share of the economy in private hands, opening 0.72
```

**Participation moves on the divergence threshold**, and this is the finding
worth having: cutting it to forty hours takes participation from 39 to **48 per
cent** over twenty-six sittings, because invisible instance-hours become counted
jobs. The bill everyone debates as a personhood measure is the largest
intervention in this labour market anyone has contemplated, and now the game
shows it.

**Trade answers to transit costs, to the substrate price, and to closurism.**
Compute is the export everyone else wants — the one thing this economy makes
that Earth and the belt will buy — so cheap substrate at home is a trade
surplus abroad. Autarky is resilient and poor.

**`private` excludes the eleven consortiums** whose control carries a
parliamentary vote and which therefore never float (§7.5.1). There *is* an
equity market; it simply cannot touch the firms that hold seats. That is a
better fact than "no capital markets."

Two bills make it live: **Compute Services (External Supply)**, which abolishes
the export licence, and **Closure Targets (Low Band)**, which sets a statutory
floor of 0.55 and is the development paradox as a single division.

## 7.6 Model depth, and the state object — LOCKED

**Shallow simulation, deep consequence.** No supply-chain or price solver.

```
confidence        // seat arithmetic, derived not stored
party_loyalty     // own caucus
public_standing   // national polling
consumables       // the material floor
thermal_margin    // the existential clock
treasury          // capacity to act
```

**Capital is not a scalar.** `capital[partner]` is a signed per-partner ledger:
positive means they owe you, negative means you owe them. **Nothing decays and
nothing is forgiven.** It is shown to the player exactly, because this game is
for people who want the arithmetic.

Loyalty is how a partner *feels* about you — slow, policy-driven, decides whether
they rebel. Capital is what you *owe or are owed* — fast, transactional, decides
whether they do you a favour they do not want to do. A partner can dislike you
and still owe you.

Everything richer — closure ratios, apportionment ratios, suspended counts,
thermal capacity per station — is **per-station data that events read**, not a
simulation that runs.

**The test:** if the player would need a second window to compute the right
answer, the model is too deep. If they can hold the whole state in their head and
still be surprised, it is right.

## 7.7 Order-paper time — LOCKED

The scarce good that generates capital. A session holds a fixed number of slots
(currently six) and every one given to a partner is one not taken for yourself.
Granting a slot advances a bill one stage and, where a partner owns it, puts them
in your debt: +2, or +3 for their flagged priority.

Bills therefore carry `owner` and `priority`. Time is the right currency because,
unlike money, it cannot be topped up.

## 7.8 Discipline and the whip — LOCKED

A bare `"for"` stance is a party **position**, not a guarantee of turnout. What it
delivers is `seats × (0.75 + 0.25 × loyalty/100)`: full loyalty delivers
everyone, none still delivers three quarters. **The gap between position and
delivery is what the whip buys back.** An explicit `{for: n}` is a stated count
and is taken at face value.

Before a division the player may commit members. What can be moved and what it
costs both depend on axis distance from the bill:

| alignment | movable | cost |
|---|---|---|
| broadly agrees (> +0.25) | 100% of the gap | 0.5 / seat |
| no strong view | 50% | 1.0 / seat |
| fundamentally opposed (< −0.25) | 15% | 2.5 / seat |

That table is what keeps the four axes load-bearing: you can buy a party out of
its apathy, never out of its position.

Your own party costs `party_loyalty`, not capital — you do not owe yourself, you
spend internal discipline. Parties **outside the coalition cannot be whipped at
all**; moving those benches is lobbying, a different activity with a different
currency, and not yet built.

Overdrawing is permitted and costs the partner 2 loyalty per point overdrawn,
because calling in credit you do not have is a favour rather than a transaction.

**What it does not fix:** the divergence bill's functional trap. The coalition
holds 12 of 40 functional seats and needs 21, and all 12 already vote for it, so
there is no headroom. A structural problem with a political solution.

## 7.9 Scarcity prices — LOCKED, and the consequence engine

Four index numbers at 100 on the opening of the series: **thermal quota**,
**substrate rent**, **volume**, **transit**.

Deliberately not equities (§7.5.1). Each is a **legislative output rather than a
market outcome** — §2.3 applied to the economy — and each drifts a fifth of the
way per sitting toward what current policy implies, so prices lag policy and the
politics happens in the lag.

**The chain the player is meant to watch:**

```
decision  ->  price  ->  station conditions  ->  event
```

Stations answer to the substrate price weighted by exposure `0.75 − closure`, so
poor habitats feel it first. A station that cannot pay does not economise; it
sheds people, and the shed order says which.

Worked, and in content: pass the Substrate (Public Stake) Bill and Ashfield has
roughly 1,400 fewer suspended residents twenty-six sittings later. Do nothing and
the index climbs until the crisis event fires at about sitting 19. **Inaction is
a decision** — the drift is upward by default.

Design rule: a `price` effect with no event gated on it is a number nobody sees;
an event gated on a price nothing moves will never fire.

---

# PART VIII — AXES AND PARTIES

## 8.1 The five axes — LOCKED

Signed numbers from **−1 to +1**, not categories. Categorical axes could not
express a centre, which left liberals nowhere to stand, and made agreement a
match rather than a distance — so the whip table could not price partial
sympathy.

| axis | −1 | +1 |
|---|---|---|
| **economic** | left | right |
| **authority** | democratic | technocratic |
| **personhood** | restrictionist | expansionist |
| **sovereignty** | station | federal |
| **trade** | closurist | integrationist |

**`authority` was extracted from the old ownership axis**, which had been
carrying two unrelated questions: who should own the utilities, and how far
engineers should be deferred to. That conflation is why the spectrum read as
democratic-versus-technocratic with liberals in between. Hullists (+0.95) and
the Guild Bench (+0.85) now sit at the technocratic pole regardless of their
economics, which is the crosscutting the coalition maths needs.

**economic** runs PSA −0.80 · CU −0.75 · Uplift −0.60 · R&V −0.45 · Descensionists
−0.20 · Station Compact −0.10 · Hullists 0.00 · **Georgists +0.05** · Guild Bench
+0.15 · Consortium Liberals +0.70 · Freeholders +0.90. The Georgists sit at the
centre because that is what they are: classical liberals who want one tax and
otherwise free markets.

**trade** replaces closure as an axis name because external trade now exists
(§7.10). Autarky versus openness is the modern protectionism axis in orbital
dress.

Continuous positions make the whip finer: agreement is `1 − |party − bill|`
averaged across the axes both define, so a party that half-agrees costs half as
much to move.

## 8.2 Depth budget — LOCKED

Three tiers of party development:
- **Own party:** full internal life. Named currents, a history of splits, a leadership challenger with a base, MPs who defect.
- **Coalition partners:** a leader character, red lines, a clear answer to "what makes them walk."
- **Everyone else:** positions on the four axes, a seat count, a rhetorical register. The Descensionists can be three paragraphs and a voice.

**Internal factions sit on the same four axes as the external party system.** This is the efficiency trick: a faction that drifts far enough becomes a splinter party — same schema, same math, no new machinery. And the caucus contains, in miniature, the whole argument the country is having, so a leadership challenge is an ideological event rather than a personality clash.

## 8.3 Naming register — LOCKED

Real parties are named for a **value** (Solidarity, Continuity), an **interest** (Freeholders, Deck Cooperatives), a **place**, or a **founding event**. Almost none are named for their ideology. "Substrate Left" is a press nickname; the actual name is the Public Substrate Association.

## 8.4 The seated parties — LOCKED (280 seats, majority 141)

| Party | Dist | List | Func | Total | Axes |
|---|---|---|---|---|---|
| Commons Union | 48 | 25 | 9 | **82** | Public · Restrictionist · Federal · mixed |
| Consortium Liberals | 22 | 19 | 6 | **47** | Private · Expansionist · Federal · Integrationist |
| Public Substrate Association | 6 | 28 | 2 | **36** | Public · Expansionist · Federal · Integrationist |
| Station Compact | 26 | 8 | 0 | **34** | mixed · mixed · Station · Closurist |
| Hullists | 9 | 6 | 7 | **22** | mixed · Restrictionist · mixed · Closurist |
| Root & Vessel | 12 | 5 | 1 | **18** | mixed · Restrictionist · mixed · mixed |
| Freeholders | 8 | 3 | 6 | **17** | Private · Restrictionist · Station · mixed |
| Guild Bench & independents | 6 | 0 | 9 | **15** | — · Restrictionist · Federal · Closurist |
| Descensionists | 3 | 1 | 0 | **4** | mixed · Restrictionist · — · — |
| Georgists | 0 | 3 | 0 | **3** | mixed · — · Federal · — |
| Uplift Caucus | 0 | 2 | 0 | **2** | Public · Expansionist · — · — |

**Government:** Commons Union 82 + Public Substrate Association 36 + Root & Vessel 18 = 136, plus confidence-and-supply from Uplift Caucus (2) and Georgists (3) = **141 exactly.** Working majority of nil.

**Dual majority position:** coalition holds 12 of 40 functional seats. Needs 21. Structurally cannot carry an integrity bill or a charter amendment. This is the trap the campaign is built on.

## 8.5 Party notes

**Commons Union** — old left, embodied maintenance labour, the party of the strike weapon. Personhood-restrictionist because its base is undercut by fork-labour. Descended with the Consortium Liberals from the Founding Coalition; both still claim the inheritance.

**Public Substrate Association** ("the Substrate Left") — public substrate as a right, thermal expansion, abolition of suspension for debt. Young, emulation-heavy, list-tier strength and almost no district seats. Shares the Commons Union's economics and despises its personhood line. **The best intra-coalition friction available** — and the friction has a demographic foundation, not merely an ideological one (§6.10): the two parties' bases have opposed material interests on substrate funding, volume, and fork-labour while agreeing on ownership.

**Consortium Liberals** — cosmopolitan market party. Personhood-expansionist for commercial reasons: more legal persons, more contracts, more counterparties. Elevator and shipping money.

**Station Compact** — confederalist, closurist, deeply local. Ideologically incoherent across stations, which is realistic and mechanically fun: they cannot whip their own members.

**Hullists** — habitat-as-lifeboat, engineering authority supreme. Split internally between **constitutional Hullists**, who want emergency powers codified and limited, and **integrity Hullists**, who do not think that is a meaningful distinction. Not fringe.

**Root & Vessel** — personhood restrictionism on continuity-of-soul grounds. A copy is not the person. Economically left, culturally immovable — the Christian-democratic shape. Conference voted against threshold reform 71–29; its three ministers absented themselves rather than divide against the leadership in public.

**Freeholders** — volume owners, the landlord class. Property absolutists, anti-Georgist to the point of obsession.

**Guild Bench** — exists only in the functional tier. Contests no geographic constituency, does not campaign, cannot be voted out, holds a veto on integrity bills. Position unchanged since 2279.

**Descensionists** — gravity as birthright, orbital life as temporary exile. Draws the physiologically excluded, which makes it tragic and sympathetic rather than merely nasty.

**Georgists** — volume tax, land value tax, nothing else. Correct. Perennially at 4.1%.

**Uplift Caucus** — two seats, permanently kingmaker-adjacent, and the only bloc whose price is always the same thing.

## 8.6 Parties available but not currently seated — LOCKED as reserve material

**Deck Cooperatives** *[Public · Restrictionist · Station · Closurist]* — agricultural-deck syndicates. Food sovereignty, deep localism, hostile to imported consumables. Left-closurist, culturally conservative, the warmest and most parochial voice available. Currently a current inside the Commons Union rather than a party.

**The Continuity Federation** *[Public · Expansionist · Federal · Integrationist]* — built entirely around defending substrate insurance. Nominally single-issue, potentially enormous, cross-class in a way nothing else is.

**Free Habitats** *[Public · mixed · Station · Closurist]* — left-sovereigntists, communal self-governance, anarchist-adjacent, unwhippable. Occasionally votes with the hard right on federal power and hates being told so.

**Thermal Maximalists / Substratists** — more minds is more good; radiator area is a moral question. Utopian, young, slightly unhinged.

**Chartists** *[Federal, otherwise mixed]* — proceduralist constitutionalists whose actual position is that the charter's ambiguities should *stay* ambiguous, because resolving them would break the union. Lawyers, judges, retired officials. Small, respected, infuriating.

**Apportionment Reform** — technocratic single-issue: fix the census, fix the divisor, abolish the functional tier. Correct about everything, electorally punished for it.

**Municipalists** — anti-ideological competence party. "We fix the recyclers." Wins districts through incumbents nobody dislikes, has no national program, is a cheap and unreliable coalition partner.

**Anchor Party** *[Private · Federal · Integrationist]* — elevator and loop consortiums, Earth-facing trade, accommodationist toward Earth states. Most exposed to the anchors-on-foreign-soil problem, and quietly the most powerful.

**The Underwriters** — actuarial governance: price the risk and let the price govern. Technocratic, amoral, the only party with accurate numbers on everything.

**Spinborn** *[Restrictionist · Station · Closurist]* — bone-density nationalism. See §10.2.

**Restorationists** — mandate a 1g standard for all new construction so children are born able to go home. Enormously expensive, deeply sympathetic, and quietly a program for ending orbital civilisation.

**Instance Rights League** — forks as full persons with full franchise. The most radical position available and the one that would break apportionment entirely.

**Synthetic Citizens' Assembly** — AI-origin persons who were never human. Crucially **not** natural allies of the emulations, whom they regard as claiming a birthright they inherited rather than earned. That split is worth more than either party alone.

**Abolition Front** — against substrate debt, against suspension as penalty, against attestation exclusion. A moral crusade with no economic program: easy to coalition with, impossible to satisfy.

**Single-station parties** — three or four, one seat each, one grievance each. Cheap to write, excellent for coalition arithmetic.

**A great-habitat party** — Anselm Ring is populous enough to sustain its own, which is a permanent affront to everyone else.

**A secession party** on a high-closure station, polling well precisely because federal investment worked.

## 8.7 Extraparliamentary — LOCKED

**The Unattested** — privacy absolutists against the registry, structurally unable to vote, therefore active by other means. A movement, not a party. Good source of crises.

**Kessler catastrophists** — debris apocalyptics, part environmental movement, part doomsday cult, occasionally right.

## 8.8 Historical and defunct — LOCKED

**The party of the failed revolution** — banned, or reduced to a rump everyone treats as an embarrassment, whose surviving figures are now respectable elsewhere. **Every current alignment traces back to where people stood on it.** From Robinson: one event pre-loading every relationship in the roster. Currently **THIN** — needs a date, a cause, and a list of who was where.

**The Founding Coalition** — the original charter party, split long ago into the Commons Union and the Consortium Liberals.

## 8.9 Ideologies as doctrines — LOCKED

**Hullism** — see §3.7. The party of answering the central constitutional question wrong. Descends from a real captain's-authority tradition.

**Substratism** — more minds is straightforwardly more good. Against it, a Malthusian thermal-limit conservatism that is technically correct and morally repugnant.

**Descensionism** — orbital life as temporary exile.

**Closurism** — self-sufficiency as virtue, dependency as degradation. A full ideology, not a policy.

---

# PART IX — THE PLAYER'S PARTY

## 9.1 Which party — LEANING (Commons Union)

**The case:** economically left but personhood-restrictionist, because its base is embodied maintenance labour threatened by emulation wage competition. **The player's own party is uncomfortable from turn one.** Not villainous, not heroic — defending real people with real grievances by holding a position the game clearly shows is unjust. A much better place to put a protagonist than a party you agree with.

It stacks well:
- The coalition partner is the Public Substrate Association, which shares your economics and despises your personhood position, so the friction is inside your government rather than across the aisle.
- Your base holds a strike weapon amounting to a credible threat to kill everyone.
- Closure spending — the bill that funds a station's eventual secession — lands hardest on exactly your voters.
- Your party has promised functional-tier abolition four times and structurally cannot deliver it.
- Your high-threshold position on divergence puts you in accidental alliance with employers.

**The alternative — OPEN:** a broad governing party that is itself a coalition of currents, on the LDP or old Congress model. Less ideologically sharp, but it moves all the interesting conflict inside the caucus, which is where a narrative game can actually dramatise it. Stronger if the leadership challenge is to be the beating heart of the game.

## 9.2 Inherited platform — LOCKED

**The player inherits commitments they did not make.** The party promised things at the last election; the situation has changed; moving a position costs faction loyalty and hands the challenger a weapon. Platform as a set of inherited constraints, movable slowly and expensively.

## 9.3 Two alliance structures — LOCKED

Parallel voting gives two, and they need not match:

- **District-level electoral pacts** — standing down in seats so as not to split the vote, while still competing head-to-head on the list. Japan's LDP–Komeito arrangement works this way.
- **Post-election governing coalitions.**

So you can pact with one party in districts and govern with another, and the pact partner can be furious about it. A pre-election decision layer most political games do not have.

## 9.4 Refraction — LOCKED as a writing principle

Other ideologies are refracted through the player's party's view of them. Hullists appear the way the caucus talks about Hullists — as a threat, a temptation during a crisis, and a caricature that some of your own MPs privately half-agree with. Cheaper to write than neutral encyclopedia entries, and better prose.

## 9.5 Current caucus (Commons Union, 82) — LOCKED

| Current | MPs | Loyalty |
|---|---|---|
| Maintenance bloc | 31 | 29 |
| Leadership loyalists | 22 | 88 |
| Deck cooperativists | 18 | 54 |
| Halloran group | 11 | 12 |

**Tarrin Halloran** (Ashfield Cans) has the signatures for a leadership ballot if she can find nine more.

Composition by tier: 48 district, 25 list, 9 functional. The twenty-five list members hold no constituency and no independent base — they whip reliably and will not survive a leadership change that reorders the list. Nine members are revenants returned after losing a district.

---

# PART X — SOCIETY, CULTURE, LAW

## 10.1 Aesthetic register — orbital warmth — LOCKED

The warmth lost with the anthro setting is recoverable as **village warmth rather than storybook warmth**, and it comes from enclosure:

- A habitat with eleven thousand people is a town where everyone knows the corridor they grew up in.
- **Agricultural decks are the emotional centre of any station** — the only place with green and open sightlines, so they double as parks, courting spots, and funeral sites.
- Water-sharing as hospitality ritual.
- Station festivals timed to the spin-up anniversary.
- Corridors with names and graffiti and a bakery on them.

*Deep Space Nine* cozy, not *Bloomburrow* cozy. It plays against the political material, because the thing being fought over in committee is the thing the player has seen someone's grandmother tending.

## 10.2 Nativism, inverted — LOCKED

Earth-born arrivals have **strong bones**. They can descend the well, work the anchors, do the jobs requiring gravity tolerance. So the nativist grievance is not that immigrants are cheap labour — it is that they are *privileged* labour.

Orbital-born nationalism is an identity built on physical incapacity: *we can never go home, this is why we are a nation.* An ethnonationalism of bone density, hostile to a wealthier and more mobile in-group. Fresh shape, and not a flat transplant of any real nativism.

## 10.3 Labour — LOCKED, quantified

**Participation is about 39%.** Roughly 4.9M adults; roughly 1.9M in paid work.
Automation handles bulk production, so most adults have no wage income and never
expect one. Non-participation is not unemployment: it is not a failure state and
there is no political demand for "jobs" in the twentieth-century sense. The
argument is the uprating formula on the consumables floor, settled in principle
generations ago exactly as §2.1 requires.

Shares are of the ~1.9M employed.

| Sector | % | Why it is that size |
|---|---|---|
| Life support, maintenance, environment | **24** | Robots handle regular geometry; humans handle two centuries of undocumented retrofit. Failure is lethal, so maintenance runs preventive with inspection layered on. ~1 worker per 15 residents — shipboard engineering ratios, and a habitat is a ship that never docks. |
| Care | **19** | The sector automation reaches last, with demand rising: the very old accumulate rather than die. Restoration nursing for the returning suspended; embodiment brokerage. High partly *because* the floor exists — when subsistence does not depend on wages, people do work they think is worth doing. |
| Verification, attestation, judgment under liability | **15** | Larger than any real economy, because the Charter's drafting defect makes every boundary case litigable. Unifying principle: **automation can do the task but cannot hold the liability.** |
| Substrate, thermal, computation | **9** | Small headcount, enormous leverage — mostly radiator maintenance and thermal accounting rather than compute administration. 9% of workers, four functional seats, 411 corporate voters. That mismatch *is* the ownership fight. |
| Agriculture and consumables | **9** | Would be lower on pure efficiency. It is 9% because much of it is chosen: the decks are the emotional centre of a station and deck cooperativism is partly an ideology about wanting to work them. A fully automated deck is more efficient and nobody wants one. |
| Construction and volume | **7** | Capped by the construction schedule; certification is the bottleneck, not fabrication. This is why volume stays scarce whatever the market does. |
| Transit and logistics | **7** | Bounded by launch windows and delta-v, which are physical constants. Adding workers does not add throughput. |
| Government and administration | **6** | Deliberately modest. The setting's claim is not that government is large but that it decides everything. The licensing boards control who votes in 21 seats and employ a few hundred people. |
| Culture, media, hospitality | **3** | Low because attestation gates participation in public discourse. |
| Earth-facing gravity work | **1** | ~19k jobs, bounded by bone density rather than demand. Disproportionately well paid, effectively reserved for the Earth-born. §10.2 in one line. |

### 10.3.1 Four overlays that matter more than the sectors — LOCKED

**Instances do about a fifth of the hours and hold none of the jobs.** At 168
hours, employers spin staff copies for a working week and reabsorb them; those
hours are performed, paid for once, and legally invisible. At 40 hours roughly
**380,000 jobs come into existence overnight** without anyone hiring. That is the
divergence fight stated as a labour statistic.

**About 46% of jobs require an embodied worker.** Maintenance in awkward geometry
does; care almost entirely does; attestation and legal do not. The emulated poor
are structurally locked out of nearly half the labour market, and body rental is
a real market rather than a luxury.

**Gravity tolerance gates the best-paid 1%.** Demand permanently exceeds supply,
which is why the resentment is structural rather than economic.

**Licensure is the central injustice, computed:**

| electorate | size | seats |
|---|---|---|
| Professional licence holders | 25,190 | 21 |
| Companies (corporate franchise) | 613 | 11 |
| Maintenance union bloc | 214,000 | 7 |
| Everyone else (residual) | 3,910,000 | 1 |

25,190 licensed individuals — **1.3% of workers** — elect twenty-one seats. This
falls out of the electorate sizes already in `functional.js`; it was not invented
for effect.

## 10.4 Who is not in paid work — LOCKED

Three million adults, and the political point is that they are **not one bloc**.
This is the most fragmented population in the Commonwealth, which is exactly why
the residual constituency returning a single seat is grotesque.

| | share | headcount |
|---|---|---|
| Post-career long-lived | 26% | 780k |
| Tempo-excluded (slow-running) | 19% | 560k |
| Unpaid carers | 16% | 480k |
| Students and the long-educated | 11% | 340k |
| Civic and cooperative labour | 10% | 290k |
| Fork-rentiers | 7% | 210k |
| Unattested and informal | 6% | 175k |
| Suspended | 2% | 56k |
| Unclassified | 4% | 110k |

**The post-career long-lived are the largest bloc and the reason nothing
changes.** People do not die; they accumulate. Near-universal attestation,
near-universal turnout, and unlimited time to attend every meeting, hearing and
selection contest. Robinson's founders-who-will-not-die as a demographic rather
than a handful of characters — and why substrate insurance is untouchable:
cutting it does not reduce their income, it ends them.

**The tempo-excluded are the tragedy.** At 0.3x, a four-year Parliament is
fourteen subjective months. Not disenfranchised — simply unable to follow a
conversation moving at eight times their speed, and unemployable at speed because
responses take a week. The minimum civic clock rate bill is about these 560,000
people, and the Commons Union's embodied base resents paying for it.

**The unattested** are outside the formal economy by construction: employment
requires attestation and attestation is what they refuse. They cannot vote and
are therefore active by other means.

Two figures are invented rather than derived — the participation rate itself, and
the fork-rentier share. Everything else follows from canon.

## 10.5 Fork-rentiers — LOCKED, and a bloc the divergence fight is missing

You are not employed. Your instances are — spun for a working week, reabsorbed,
and the fee comes to you. You are, legally, renting yourself out.

Which means **210,000 people have a direct financial interest in the threshold
staying at 168 hours.** Drop it to 40 and their instances become persons with
their own wages, their own substrate bills and their own votes. The income stops.

This is a bloc that opposes the government's own bill for a reason nobody in the
chamber has articulated: not restrictionism, not fear of competition, just the
fact that they are about to lose their only source of money to their own copies.
It cuts across every party and has no parliamentary expression. **THIN** — needs
a voice in the divergence chapter.

## 10.6 Labour conflict — LOCKED

Automation handles bulk production. Remaining paid work clusters in care, verification and attestation, judgment under legal liability, and maintenance in awkward geometry.

**Emulation wage competition.** A skilled worker can fork and undercut himself. Does labour law recognise instances? Is fork-labour scab labour? Union rules about running hot.

**The maintenance unions hold a strike weapon amounting to a credible threat to kill everyone.** Essential-services legislation restricts them heavily — a permanent unhealed grievance and an excellent source of crises.

## 10.7 Media and information — LOCKED

The attention economy under variable clock speed: a wealthy actor can spin instances to manufacture apparent consensus, so **astroturf becomes literal**. Unique-person attestation is required to participate, which makes the registry a civil-liberties fight.

The Attestation Registry can flag a cluster and take no further action, **which is the whole of the power the statute gives it.**

## 10.8 Courts and law — LOCKED

**Long-lived emulated judges** give a judiciary that personally remembers the founding and can testify to original intent — wonderful or catastrophic depending on your view. Justices present at the charter negotiation ruling on what the charter meant.

Fork liability: who serves the sentence. Continuity law: when a person legally ceases. Reclassification proceedings as an entire branch of practice.

## 10.9 Religion — LOCKED, currently THIN

Continuity-of-soul disputes split every existing faith into recognisers and non-recognisers. Congregations that will not admit emulations. Funeral rites for someone who still exists. A religious bloc that votes on personhood questions and is otherwise economically left, fouling up coalition math realistically. Root & Vessel is the parliamentary expression.

## 10.10 External pressures — LOCKED

- **Anchors on someone else's ground.** A dozen space elevators anchored in the sovereign territory of Earth states. The lifeline is in foreign hands, so foreign policy stops being flavour.
- **Kessler risk as commons tragedy** — an environmental politics whose failure mode is fast and can physically sever the polity into disconnected pieces.
- **Metanationals.** Elevator consortiums, substrate providers, consumables cartels as actors with near party-tier power, not lobbyists in the margins.

---

# PART XI — NAMED CANON

Everything in this part is **LOCKED** and frozen. No content pass may invent additions; new entries are added here deliberately.

## 11.1 The polity

- **The Circumterrestrial Commonwealth.** Short form in all ordinary use: *the
  Commonwealth*. Seat of government Anselm Ring; the government itself is
  metonymically **Perigee**, from the Charter signed there. *Circumterrestrial*
  appears on every instrument the state issues and is never said aloud.
- **No demonym.** *Circumterrestrials* appears in four Charter-era documents and
  has never been said by anyone not paid to. Proposals have failed at every
  attempt. This is read as a failure of the union rather than of the language: a
  federation held by shared identity produces a demonym without trying, and one
  held by metabolic dependency does not, because the thing shared is not
  something anyone chose. Asked what they are, people name a station. §7.2 made
  lexical.
- **The Perigee Charter** — the founding document. Deliberately ambiguous on contested items. Functional-tier sunset clause extended four times.
- **Current date in play:** 11 April 2287. Session 4, Week 112.
- **The Spindle** — newspaper of record, founded 2201, Anselm Ring, No. 31,884.
- **Ring Network** — broadcaster.
- **Representation Act** — s.44 governs dual candidacy and revenant ranking.
- **Allocation Act** — governs thermal quota; permits the engineering authority to suspend the tier-four register without notice.
- **Shed order** — the published restoration/shedding priority list, in tiers.

## 11.2 Persons

- **Rt. Hon. Marit Deshan MP** — Prime Minister. Commons Union. Member for Anselm Ring.
- **President Osric Tenaya** — independent. Elected 2284, direct, 51.4%. Relations with the government: cold. Has privately indicated a threshold bill carried on a contested dual majority would be referred for constitutional review.
- **Tarrin Halloran MP** — Ashfield Cans. Commons Union. Leads the eleven-member Halloran group, loyalty 12. Needs nine more signatures for a leadership ballot.
- **Iren Vellan MP** — Minister for Life Support. Commons Union, member for
  Perigee Yards. Career maintenance union. The only member of Cabinet the Guild
  Bench will take a meeting with.
- **Desta Okarie MP** — Chief Whip. Commons Union, member for Anselm Ring Outer
  Decks. Reports that things went as well as they could have; reports this about
  everything.
- **Ivor Ceyhan** — political editor, *The Spindle*.
- **Ondine Charnock** — author of *The Circumterrestrial Economy*, 4th edition,
  Perigee Review Press. The standard primer, and mildly out of date since the
  threshold debate opened. See `textbook.md`.
- **Sevi Ansar** — Deck 9. A civilian voice, used for warmth.

## 11.3 Stations and constituencies

Stations carry a `form` — cylinder, torus, drum, sphere, cluster, yard,
surface — which drives the glyph on the orbital chart. Bands are altitude, and
altitude is class.

**33 stations, 56 constituencies, 140 district seats.** A station is a place; a
constituency is a thing that returns members. Most stations are one constituency;
Anselm Ring is divided into eight. Populations total 6.86M, unchanged from v3 —
the roster expanded by adding small places, not by growing the federation.

**Ring band (geostationary):**
- **Anselm Ring** — 40 seats, 1,940,000, cylinder, closure 0.79, 2,100 suspended, attested 94%.
- **Meridian Spindle** — 16 seats, 682,000, cylinder, closure 0.71, 2,110 suspended, attested 91%.
- **Sable Drum** — 6 seats, 315,000, drum, closure 0.66, 1,800 suspended, attested 88%.
- **Corvus Ring** — 6 seats, 293,000, torus, closure 0.68, 1,930 suspended, attested 89%.
- **Halvard Terrace** — 3 seats, 153,000, torus, closure 0.72, 550 suspended, attested 93%.
- **The Bourse** — 2 seats, 33,000, sphere, closure 0.63, 120 suspended, attested 96%.

**Far band:**
- **The Hollows** — 6 seats, 378,000, cluster, closure 0.52, 4,210 suspended, attested 79%.
- **Tsiolkovsky Deck** — 4 seats, 249,000, torus, closure 0.61, 5,640 suspended, attested 83%.
- **Coldharbour** — 2 seats, 118,000, drum, closure 0.58, 5,620 suspended, attested 76%.
- **Erasmus Deck** — 2 seats, 85,000, torus, closure 0.64, 1,230 suspended, attested 91%.
- **Nasmyth Array** — 2 seats, 38,000, yard, closure 0.55, 950 suspended, attested 87%.

**Middle band:**
- **Vantage High** — 4 seats, 213,000, torus, closure 0.48, 2,600 suspended, attested 81%.
- **Perigee Yards** — 3 seats, 144,000, yard, closure 0.57, 1,610 suspended, attested 86%.
- **Calloway Loop** — 2 seats, 118,000, drum, closure 0.44, 1,920 suspended, attested 77%.
- **Grimaldi Station** — 2 seats, 106,000, cylinder, closure 0.53, 1,500 suspended, attested 84%.
- **Wickstead** — 1 seats, 70,000, torus, closure 0.69, 760 suspended, attested 88%.
- **Oberth Approach** — 1 seats, 56,000, drum, closure 0.51, 870 suspended, attested 89%.
- **The Tannery** — 2 seats, 47,000, cluster, closure 0.41, 2,230 suspended, attested 71%.

**Low band (industrial):**
- **Ashfield Cans** — 15 seats, 880,000, cluster, closure 0.31, 11,400 suspended, attested 68%.
- **Kepler Anchorage** — 4 seats, 231,000, cylinder, closure 0.54, 2,050 suspended, attested 85%.
- **Slagworks** — 2 seats, 120,000, drum, closure 0.37, 3,120 suspended, attested 72%.
- **Bellows** — 2 seats, 101,000, cylinder, closure 0.44, 2,010 suspended, attested 76%.
- **Drift Cans** — 2 seats, 79,000, cluster, closure 0.27, 3,640 suspended, attested 63%.
- **Cinder** — 1 seats, 78,000, drum, closure 0.34, 2,520 suspended, attested 69%.
- **Tallow** — 1 seats, 65,000, cluster, closure 0.39, 1,900 suspended, attested 70%.
- **Quarry Reach** — 1 seats, 58,000, yard, closure 0.42, 1,530 suspended, attested 74%.
- **Sinter** — 2 seats, 44,000, drum, closure 0.36, 1,340 suspended, attested 71%.
- **Dredge** — 1 seats, 34,000, yard, closure 0.33, 1,230 suspended, attested 66%.

**External:**
- **Selene Stations** — 1 seats, 60,000, surface, closure 0.83, 560 suspended, attested 90%.
- **L4 Yards** — 1 seats, 25,000, yard, closure 0.88, 240 suspended, attested 93%.
- **The Bloomery** — 1 seats, 24,000, surface, closure 0.79, 430 suspended, attested 86%.
- **Achenar Point** — 1 seats, 13,000, sphere, closure 0.86, 230 suspended, attested 92%.
- **L5 Refuge** — 1 seats, 11,000, sphere, closure 0.91, 120 suspended, attested 95%.

**Infrastructure:**
- Tether 2 — Kepler. Tether 5 — Meridian. Tether 9 — Sable (leased).
- Lofstrom Loop A, Loop C.

## 11.4 The functional roster — LOCKED

Forty seats, eleven sectors. Reconciles exactly with party functional counts.

| sector | seats | franchise | electorate |
|---|---|---|---|
| Life Support Engineering | 6 | licensure | 4,100 |
| Maintenance and Trades | 7 | union bloc | 214,000 |
| Substrate Providers | 4 | corporate | 411 |
| Consumables and Agriculture | 4 | licensure | 8,900 |
| Transit and Orbital Mechanics | 3 | licensure | 3,400 |
| Elevator and Loop Consortiums | 4 | corporate | **62** |
| Physiological Medicine | 3 | licensure | 2,700 |
| Attestation and Registry | 2 | licensure | 890 |
| Underwriting | 3 | corporate | 140 |
| Legal | 3 | licensure | 5,200 |
| **Residual Constituency** | 1 | residual | **3,910,000** |

Licensure seats have a government-appointed board, so the electorate can be
widened or narrowed by regulation with no bill before Parliament (§4.6.4).
Corporate seats are controlled by whoever controls the companies (§4.6.2).

## 11.5 The live bill

**Divergence Threshold (Amendment) Bill, HC 4/117.** Committee stage.
- Current: 168 subjective hours. Proposed: 40.
- Census effect: +1.9M legal persons estimated. Redistribution in six districts.
- Popular division forecast: 128 of 240, needs 121. **Carries.**
- Functional division forecast: 12 of 40, needs 21. **Fails.**
- The Guild Bench will not divide with the government on any measure touching licensure. The whips do not believe money will move them.

## 11.6 Other business on the order paper

- Thermal Quota Allocation No. 2 — second reading, 147, simple majority.
- Anchor Concession (Kepler) Ratification — Lords stage, 161, simple.
- Substrate Insurance Uprating — drafting.
- Shed Order (Civilian Oversight) — blocked. 134 popular, 9 functional. Dual test. Owner: Commons Union.
- Substrate Insurance (Uprating) — drafting. Owner: Public Substrate Association.
- Continuity of Person (Registration) — drafting. Owner: Root & Vessel, their priority.
- Substrate (Public Stake) — drafting. Owner: Public Substrate Association. Takes
  the public share from 0.35 to 0.6 and knocks 26 points off the substrate index.

---

# PART XII — UI AND PRESENTATION

## 12.1 The core principle — LOCKED

**Barebones means dense and unstyled, not sparse.** The failure mode of minimalist game UI is hiding information behind clicks, and for a game where the player reasons about seat math, that is fatal. The reference is a Bloomberg terminal or a government workstation: ugly, cramped, four tables on one screen, everything visible at once.

## 12.2 Split visual language — LOCKED, and the signature idea

- **System chrome is government-issue plain**, because government software is always plain.
- **In-universe artifacts are beautiful** — news graphics, printed documents, official maps — because a news network hired a design agency and a state printing office has a 200-year-old house style.

The player therefore experiences the ugliness as authenticity rather than low production values, and every moment of visual richness has an in-world reason to exist.

## 12.3 Chrome direction — LOCKED

**Government ugly beats retro computing.** Amber CRT reads as "cool hacker," the wrong genre. Windows-95-dialog ugliness — gray boxes, form fields, sans-serif labels, a status bar — is unromantic and bureaucratic, which is the register of a game about apportionment formulas. Borrow the monospace from retro computing without the phosphor glow.

Implemented palette: institutional gray-green (`#c8c9c0` chrome, `#f2f2ec` field, `#3c4038` bars), condensed sans for labels, monospace for all numbers, zero border-radius, bevels rather than shadows.

## 12.4 Screens — LOCKED

Six: **Government** (coalition, order paper, bill detail, indicators, presidency, diary) · **Chamber** (hemicycle, composition) · **Orbit** (schematic map, constituency table, district detail) · **Dispatch** (press, feed, registry advisory) · **Papers** (registry, document) · **Election Night**.

## 12.5 Election night — LOCKED

**Parallel voting hands you the pacing for free.**
- Act one: districts call one at a time. A trickle of seats, an early upset, a safe seat suddenly close.
- Act two: the list allocation can only resolve when the national count completes, so it lands at the end and reshapes the whole picture in one stroke.
- Act three: external seats return late. Everyone knows they are decisive. Everyone waits.

Constituency list flipping colour down one side, orbital map on the other, ticker along the bottom.

## 12.6 The orbital map — LOCKED

**A chart, not a map.** Orbits are dynamic and 3D; literal geography would be
unreadable. Altitude bands on the vertical axis means **the diagram is a
stratification chart** — higher orbit is different politics, so the map doubles
as an infographic about class.

**Five variables per mark**, each independent — the lesson taken from *Nations of
Astronesia*, which encodes habitat form, population and orbital band in a single
glyph:

| variable | encodes |
|---|---|
| vertical position | band — altitude, therefore class |
| glyph shape | `form` — what kind of habitat it physically is |
| glyph size | population, log-scaled |
| fill tint | closure — dependent (warm) to self-sufficient (cool) |
| tick beneath | leading party |

Fourteen stations rather than eight hundred, so each mark can be large enough to
read at a glance without zooming. **That is the trade: a small frozen roster buys
legibility.**

Tethers run from Earth to the habitat they actually serve, so the line carries
which station depends on which anchor; leased tethers are dashed differently.
Bands are staggered horizontally so no two stack their habitats in the same
column. Labels are haloed so nothing crossing them destroys legibility.

## 12.7 The parliament diagram — LOCKED

Distinguish district, list, and functional members visually (circle, square, triangle). In a parallel system this instantly shows how brittle a caucus is — a bench of list members is loyal and rootless; a bench of district members has local bases and opinions. When someone defects, move them across the chamber. Coalition math made physical.

## 12.8 Documents — LOCKED

**The distribution list is the sharpest idea available.** Who was copied on a memo is a plot point. The cc line tells you who knows what, which alliances exist, and who was deliberately left off. A struck-through recipient is a story. File numbers, classification markings, and routing stamps carry information rather than decorate.

**Reserve the signature animation.** Wonderful six or eight times a playthrough, tedious if it fires on every bill. Save it for acts that cannot be undone.

## 12.9 The feed — LOCKED

Every post carries an attestation marker: attested / unattested / cluster-flagged. Instance-manufactured consensus becomes something the player can literally see happening, so the ticker stops being ambient noise.

## 12.10 Build cost — LOCKED

All of it is cheap. Monospace and tables are the least work possible; the hemicycle, the band chart, and the constituency list are static SVG; the signature is a single `stroke-dashoffset` animation; election night is timed state updates against data that already exists.

## 12.11 Images — LOCKED

Palette-indexed and dithered, after *Half-Earth Socialism*. **The palette says
who rendered the picture**, before the caption does:

| palette | source in world | used for |
|---|---|---|
| `registry` | the government system | portraits, ID photos, official records |
| `newsprint` | *The Spindle* | press photographs |
| `broadcast` | Ring Network | broadcast stills |
| `deck` | civilian | warmth, the agricultural decks |

That is §12.2's split visual language extended to photography, so the dithering
carries information rather than being a look. Editing one palette file restyles
every image in the game at once, which is the main reason to do this at all.

Shapes are pinned in CSS and in the pipeline: portraits 4:5 at 160px, event
plates 12:5 at 640px, logos 1:1 at 64px. An image arriving the wrong shape gets
cropped again in the browser and the framing is lost.

**Two dithers, and the choice means something.** Ordered (Bayer) reads as machine
output — right for a registry scan or a state-press emblem. Error diffusion reads
as photographic — right for a press or broadcast still.

A production advantage worth naming: heavy dithering to a fixed palette
**launders inconsistent source material**. Stock, generated and hand-made images
all emerge looking as though they came from the same place.

## 12.12 Existing artifact

`terminal.html` — a complete self-contained mockup of all six screens. Serves as the visual spec.

---

# PART XIII — SCANDAL AND THE THRILLER SPINE

## 13.1 Scandal taxonomy — LOCKED

Crimes the setting makes possible:

- **Census instance-stuffing.**
- **Substrate embezzlement** — running your own staff hot on public credit.
- **Falsifying closure figures** to secure development funding.
- **Anchor-contract kickbacks** with an Earth state.
- **Thermal quota fraud.**
- **Licensing board packing** — see §4.6.4.
- **Scheduling a vote while a cohort of your opponent's constituents is suspended.**
- **Backup coercion** — whoever holds your backup owns your afterlife. Blackmail with unlimited leverage, near-impossible to prosecute.

## 13.2 The spine — LEANING

**Backup coercion is where the thriller lives**, if the political and the personal are to be the same plot. Hold in reserve for a late-game arc: a Prime Minister discovers it has been done to a cabinet colleague.

---

# PART XIV — PRIOR ART

## 14.1 The gap — LOCKED

Each half exists; the combination does not, for structural reasons. Prose fiction cannot dramatise an electoral system — a seat allocation formula producing a perverse outcome is satisfying to *experience* but inert on the page, so novelists who build strange polities describe them and then write about characters instead. Games can dramatise it, but building an electoral system from scratch is expensive enough that designers borrow a real one, dragging the setting toward realism. The two skills rarely sit in the same person.

## 14.2 Works

- **Malka Older, *Infomocracy*** — micro-democracy, 100,000-person centenals, a global election as plot. Closest prose analogue.
- **Ada Palmer, *Terra Ignota*** — non-geographic citizenship; you choose your polity rather than inheriting it by location.
- **Kim Stanley Robinson, Mars trilogy** — see §14.3. Harper has not read it; *Ministry for the Future* is a favourite.
- **Suzerain** — the benchmark, and the ceiling this project declines.
- ***Zootopia*, *Beastars*** — predator/prey order as personal drama, never as apportionment.

## 14.3 Mars trilogy lessons — LOCKED

1. **Physical parameters set by vote** (§2.3).
2. **Founders who won't die.** The First Hundred still in politics 150 years later, nursing the same grudges, holding a legitimacy monopoly younger generations resent. Exactly the emulation problem: it freezes factional alignments, personalises disputes across impossible timespans, and makes generational turnover something fought for rather than waited out.
3. **A failed revolution in living memory** (§8.8).
4. **Dorsa Brevia** (§2.4).
5. **Metanationals** (§10.7).
6. **Winning isn't the end.** *Blue Mars* is about governing afterward: immigration pressure, land use, and the independence coalition splintering the moment it has nothing left to unite against.

**What not to take:** Robinson's constitution basically works, and the trilogy loses tension once it does.

---

# PART XV — PRODUCTION

## 15.1 Team — LOCKED

Harper: graphic design, worldbuilding, political system design, direction. Claude: programming, and co-design.

Not currently sought: a programmer, a game designer. See §15.3 for where that assumption breaks.

## 15.2 Documentation — LOCKED

- **`vault.md`** — raw, append-only, never edited down.
- **`bible.md`** (this file) — canon, structured, uploaded to project knowledge.
  Out-of-world: it may discuss mechanics, the player, and the build.
- **`textbook.md`** — *The Circumterrestrial Economy*, Ondine Charnock, 4th ed.,
  Perigee Review Press, 2286. **Canon, and entirely in-world.** It knows nothing
  of the player or the game and must never mention them. It carries the economic
  and demographic detail in a voice, which makes it both a reference and a
  register guide for content passes. Where it disagrees with this file on a
  number, this file wins; where it disagrees on *tone*, it wins.
- **`orbital.bundle.md`** — generated snapshot of all content. Regenerate with
  `node tools/bundle.js` and re-upload after any content change.

Later, canon may split into generator-facing files: `glossary.md`, `legal_persons.md`, `stations.md`, `parties.md`, `axes.md`, `institutions.md`, `history.md`, `open_questions.md`, `register.md`, `characters.md`. Not yet necessary.

## 15.3 Where this gets hard — LOCKED

Honest assessment of failure modes:

1. **The complexity wall.** Vibecoding is excellent up to roughly the point where the codebase exceeds what fits in one context window and the author cannot read it. Past that, debugging requires understanding code nobody wrote by hand. Mitigation: hard modularity, small files, a written architecture doc, and the discipline to keep the engine small.
2. **Save/load and state migration.** The thing that kills long content-driven projects. Every schema change breaks old saves. Mitigation: version the state object from day one; write a migration function before it is needed.
3. **Content volume.** The engine is a week. Two hundred events is months. This is the actual project.
4. **Balance.** Deterministic resolution makes it testable but not easy. Expect the first pass to be wrong and expect several rebalance passes.
5. **Content drift** (§2.7).
6. **The bible outrunning the game.** The named risk: a magnificent setting document attached to nothing.

## 15.5 The build — LOCKED

Engine and content are strictly separated: `js/engine.js` names no event, party or
station. Content is plain `.js` (not `.json`) so everything opens from `file://`
without a server.

**Six checks, all of which must pass:**

| | |
|---|---|
| `node test.js` | chamber arithmetic against this bible, 40-sitting smoke test |
| `node tools/lint.js` | legibility: concept load, terms used before taught |
| `node tools/cxcheck.js` | Concordance links, see-alsos, banners |
| `node tools/roundtrip.js` | editor fidelity: serialise → reload → identical play |
| `node tools/renametest.js` | renaming preserves behaviour exactly |
| `node tools/edtest.js` | editor boots and every tab works (needs jsdom) |

**The editor** (`editor.html`) reads and writes the same content files the game
reads — one source of truth. Effects and conditions are pickable from a schema
rather than typed. It carries: safe rename with reference tracking, undo, filter,
station archetypes that roll correlated numbers together, a browser image
processor, name rolling, a branch graph, and a coverage panel that computes what
to do next.

**Handoff.** `node tools/bundle.js` writes `orbital.bundle.md` — a digest plus
every content file verbatim. Upload it to project knowledge, replacing the
previous one, so a new chat reads the actual current content rather than trusting
anyone's memory of a zip.

**The coverage panel exists to catch one failure in particular:** content
clustering on crisis. If every event fires when an indicator is low and none
fires when it is high, the player who manages well finds the game goes quiet, and
reads that as a bug.

## 15.4 What would justify bringing in a person — LOCKED

- **A playtester.** Not optional. A designer cannot see their own legibility failures, and this game's whole risk is legibility.
- **A copy editor** if event volume gets large.
- **A programmer**, only if the project outgrows single-context vibecoding — a real possibility if the real-time persistent architecture is pursued.
- **A second writer working to spec**, once content volume becomes the binding
  constraint. Someone writing events against a locked bible with the linter and
  coverage report as guardrails is capacity, not a co-designer — which matters,
  because worldbuilding by committee would sand down exactly the specificity that
  is the product.
- **Playtester usage note.** A range from government-sim players to visual-novel
  players is an asset, not a compromise. The former test whether the depth is
  satisfying; the latter test legibility, which is the project's named risk. Do
  not average their feedback: a VN player saying "I was lost" is not outvoted by
  a govsim player saying "it was clear." Run a session every twenty events rather
  than when it feels ready.

---

# PART XVI — OPEN DECISIONS

- **Setting** — orbital. LEANING, near-locked. Anthro preserved in Appendix A in case of reversal.
- **Player's party** — Commons Union (sharp, morally awkward) vs broad-tent LDP model. LEANING Commons Union.
- **Redistricting** — live bill or fixed for v1.
- **Where emulations vote** — hosted location (makes hosting vote-farming and gives substrate providers territorial power) / last embodiment (an electorate mapped onto bodies that no longer exist) / dedicated non-territorial seats (precedent: Māori electorates, UK university constituencies).
- **District:list tier ratio** — and whether amendable in v1.
- **Threshold height and carve-out rules.**
- **Which two novelties stay hot**, which freeze into infrastructure.
- **Opposition→government transition** — mid-game arc or out of scope.
- **Upper house powers** — currently undefined.
- **The failed revolution** — needs a date, a cause, and a roster of who stood where.
- **Real-time persistence** — whether push notifications are required.
- **Money denominated in thermal rejection capacity** — LEANING, touches every price.
- **Terminal state** — how many chapters, and whether the campaign ends at the
  general election or after it. `sweep-brief.md` E.3 proposes five ending at the
  election. **Blocks content decisions downstream; decide first.**
- **The district-tier electoral system** — SNTV or 140 single-member seats.
  Magnitudes currently run 1–4 and track electorate, which makes magnitude
  bookkeeping rather than political geography. SNTV is the more interesting
  answer: it forces a party to nominate exactly the right number and split its
  vote evenly, so co-partisans in a seat are rivals, which gives the currents
  mechanic teeth. Decide before elections are built, not during.
- **Foreign affairs and the international map** — deferred. When built, the
  organising axis should be **light-lag**, the way the orbital chart's is
  altitude: a map ordered by delay is a map of how alien each relationship is.
  Actors: Earth states holding the anchors, Mars, the belt, and the metanationals
  as quasi-sovereign. Not before chapter one has ~25 events (§15.3.6).
- **Fork-rentiers need a parliamentary voice** — 210k people with a direct
  interest in the threshold, no expression in the chamber.
- **Lobbying** — moving benches outside the coalition. Currently impossible by
  design; the whip panel says so. Needs its own currency.
- **Cabinet as data** — the Ministries exist in canon but not in the state object,
  so the President's appointment-refusal power has nothing to refuse.

---

---

# PART XVII — WHAT IS MISSING, AND THE ORDER TO BUILD IT

Full detail in `ROADMAP.md`, which carries acceptance criteria and agent
assignments. This is the record of the gaps.

## 17.1 Systems not yet built — LOCKED as the backlog

| | why it matters |
|---|---|
| **Leadership challenge** | §3.5 loss condition 2. Signatures accumulate — packing two boards reaches five of nine — and nothing reads the counter. |
| **Confidence votes** | §3.5 loss condition 1. Confidence is derived and never tested. No partner can withdraw. |
| **Elections** | §3.5 loss condition 3, and §12.5's marquee UI moment. Needs the electoral system settled first. |
| **Lobbying** | Benches outside the coalition cannot be moved by any means except instruments, which makes the chapter-one trap a puzzle with one solution. |
| **Coalition negotiation** | No mechanic for a partner threatening to walk or renegotiating terms. Red lines exist in §8.2 as prose only. |
| **Dissolution** | The President may refuse it (§3.3) and the player cannot request it. |
| **Induction pack** | `sweep-brief.md` Part D. First-use gloss exists; the pack does not. |
| **Foreign affairs** | Nothing built. Now has an economic hook it lacked (§7.10). |
| **Opposition mode** | `in_government` is still not in the state object, and §3.6 warns the retrofit is painful. It gets worse every phase. |

## 17.2 The build order — LEANING

0. **Terminal state.** A design decision, ten minutes, blocks everything downstream.
1. Leadership challenge — small, and it makes the caucus an antagonist.
2. Confidence and coalition collapse.
3. Lobbying.
4. **Chapters three to five.** The largest phase and the actual project.
5. Elections.
6. Induction.
7. Foreign affairs.
8. Opposition mode.

## 17.3 The two-agent split — LOCKED

**Claude Code** takes anything in `js/` — engine, schema, UI. A wrong edit there
is silent and expensive; three of the five bugs recorded in `CLAUDE.md` were
that shape.

**opencode** takes `content/` and `drafts/`. A wrong edit there is caught by six
checks in two seconds.

Claude Code writes the spec; opencode executes it. A request is not a spec: name
the file, the schema verbs, the conditions and the checks.

Neither may invent a station, character or glossary term (§2.7). The correct
behaviour on encountering a missing reference is to stop and report it.

## 17.4 Authoring — LOCKED

`AUTHORING_FORMAT.md` defines a markdown format for events, chapter skeletons,
minutes and instruments, written into `drafts/` and converted into content by an
agent. Prose is then written and versioned separately from generated structure,
and a chapter can be blocked out as structurally valid placeholders before any
of it is written — so the graph and the checks work while the writing arrives in
any order.

## 17.5 The thing that matters more than any phase — LOCKED

The coverage panel currently reports *skeleton*. It will report *one chapter* at
about twelve more events. **That is the point to stop building and hand it to a
playtester**, the visual-novel one first, because legibility is the named risk
(§15.4) and they are the ones who will say whether the prologue works.

Run a session every twenty events rather than when it feels ready.

---

# APPENDIX A — THE ANTHRO SETTING (PRESERVED)

Retained in case of reversal. Late-1900s technology plus magic coexisting as another field of science. Storybook sapient anthropomorphic animals, modern socioeconomic complexity and modern electoral politics. Inspired by MTG's Bloomburrow.

**Hibernation and election timing** — the best single mechanic in either setting. If a meaningful share of species hibernate three to four months a year, the parliamentary calendar becomes a weapon. Legislation passed during winter recess deliberately. Proxy voting for absent members as a constitutional fight. A coalition skewing toward hibernators is structurally weak in one season and strong in another. And since a PM contests dissolution timing, **calling a winter election is straightforwardly a way to suppress entire species from the electorate.** No real-world equivalent, trivial to implement as a seasonal modifier, both funny and sinister. *(Ported to orbital as suspension-timed elections, §6.6.)*

Migratory species give the same thing on a different axis: physically elsewhere for part of the year, dual residency, "where do you actually live" litigation.

**Lifespan stratifies the institutions, not just the people.** Mice live fifteen years, tortoises two hundred. Short-lived species dominate elected office because they have urgency; long-lived species dominate the judiciary, the civil service, and the central bank because those reward tenure. **The technocracy-versus-democracy conflict built into biology.** *(Ported as emulation gerontocracy.)*

**Reproductive rate as demographic politics.** Fast breeders gain apportionment share every cycle; slow breeders decline. Demographic anxiety with actual grounding — and it explains why the long-lived, slow-breeding species entrenched themselves in the unelected institutions.

**Size as distributive politics.** A public building usable by both a shrew and a bear costs far more than one built for either. Universal design versus separate provision as a budget line — and an argument in which the segregationist position presents itself as fiscal prudence. *(Ported as physiological class and construction standards.)*

**Predator legacy, handled carefully.** Predation outlawed generations ago, legally settled, socially live. What remains: involuntary physiological fear, still-segregated neighbourhoods, predator overrepresentation in policing inherited from when they were the enforcement caste. The question a human setting cannot ask: **when a prey legislator's fear response to a predator colleague is measurable and involuntary, is that prejudice or biology, and what does the law do about it?** Safety valve: make the predator species a declining former ruling class rather than a marginalised minority.

**Magic as a regulated utility.** Licensing boards, thaumic pollution standards, ley infrastructure public or private, a magic workers' union, environmental review. Sharpest version: **speech magic as election law** — is a glamoured broadcast fraud? What is the standard for compulsion-adjacent persuasion? Truth-magic in committee, and a minister who refuses to submit.

**Biomes as economic and magical regimes.** Magic works unevenly, so some districts are magically poor the way some regions are resource-poor. Ley wells give boom-bust extraction and resource-curse politics. *(Ported as closure profiles.)*

**Weaknesses:** tonal knife-edge between twee and edgelord. Risk of the animals being decoration. The allegory trap — if species map cleanly onto parties it becomes a fable about real groups; the defence is making species cross-cut party lines heavily and visibly.

**Note:** "late 1900s" is pre-internet, and much of what modern politics *feels* like is algorithmic media fragmentation. Would need a magical substitute — a scrying network behaving like broadcast television sliding into something worse.

**Strengths easy to undervalue:** low explanation cost, memorable district names, warmth on demand, a store page nobody scrolls past.

---

*End of bible v2. Increment the version and re-upload after each working session.*
