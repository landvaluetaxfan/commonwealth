# 13 — MONEY AND SUPPLY

*The missing fiscal currency, the Appropriation Bill, and what
`confidenceSupply` is supposed to mean.*

The build has a `confidenceSupply` array in the state object. **There is no
supply.** A confidence-and-supply arrangement is a promise to vote through the
budget, and there is no budget to vote through, so the array currently means
"extra seats on the government side for confidence arithmetic" and nothing else.

That is the hole. This document closes it, and canon turns out to have most of
the answer already.

---

## 1. What canon already says

**§7.5.2, LOCKED**, describing the quota market, contains the whole thing in one
clause:

> Quota trading is the main market: thermal quota traded, hedged, forwarded and
> defrauded. **A market in permission-to-exist-at-scale whose price is set by an
> appropriation vote.**

The appropriation vote is already canon. It sets the thermal price. It has never
been built — `tick()` currently derives the thermal price from `thermal_margin`
alone, with no appropriation anywhere.

**§7.5.3, LEANING**, names the unit:

> Denominate in **thermal rejection capacity**. Energy is trivial; dumping waste
> heat is the hard limit on everything including computation, including how many
> minds may exist. A currency that is a claim on radiator capacity is literally a
> claim on room for someone to be alive. […] Marked LEANING rather than LOCKED
> because it touches every price in the game.

**§7.3, LOCKED**, names the tax base: volume, thermal quota, substrate-hours and
mass-to-orbit. Not income.

So the fiscal system is specified in outline and unbuilt in full. The
recommendation of this document is that **§7.5.3 be locked**, because everything
below waits on it and the reason it is LEANING — that it touches every price — is
an argument for deciding it early rather than late.

## 2. Why this matters more than it looks

There are three currencies in the game already and none of them is money:

| | what it buys | canon |
|---|---|---|
| **order-paper time** | a partner's goodwill | §7.7 — *"the right currency because, unlike money, it cannot be topped up"* |
| **capital**, per partner | a favour they do not want to do | §7.6 — signed, permanent, never forgiven |
| **loyalty** | your own caucus turning up | §7.8 |

They are all *political*. None of them buys a radiator.

**Unifying them would be wrong**, and §7.7 says so directly: order-paper time is
the right currency for buying partners *because* it is not money. Real
governments run on exactly this separation — political capital, parliamentary
time, and money are three different things and confusing them is a category
error, not an economy.

**The gap is that the fiscal one is missing entirely.** Adding it does not
replace the other three; it gives them something to be spent *on*.

### 2.1 Is the economy under-modelled? Measured, and the answer is specific

The missing currency looks like a symptom of an under-thought economy. It is
not. **Part VII is the most specified part of the whole bible** — ten sections,
nine of them LOCKED: what got cheap and what stayed scarce, closure as the
sovereignty number, the four tax bases, welfare, the shape of the economy, why
nothing floats, the financial sector in five instruments, model depth, and the
scarcity prices with their consequence chain. Only §7.5.3 is LEANING.

The economy is not under-thought. **It is under-denominated**, and that is a
different problem with a much smaller fix.

Every economic value in the state object is an index or a ratio:

```
scalars   party_loyalty 38 · public_standing 44 · consumables 71
          thermal_margin 17 · treasury 52          five 0–100 indices
prices    thermal 100 · substrate 100 · volume 100 · transit 100
                                                 index numbers, 100 at open
law       ten policy settings and ratios
station   population, suspended, seats            people, not resources
          closure, attested                       ratios
```

**There is no denominated quantity of any resource anywhere.** No radiator
capacity, no volume in cubic metres, no substrate in mind-hours, no treasury in
anything. The only quantities in the game are people and seats.

That is precisely why the currency is missing, and it is structural rather than
an oversight: **you cannot allocate an index.** A budget is the act of dividing a
stock, and the model is all flows. `treasury: 52` cannot be spent, because 52 is
not 52 of anything.

### 2.2 One stock, not four

The fix is smaller than the diagnosis suggests, and the temptation is to
over-correct into the spreadsheet §7.6 forbids.

**Add exactly one denominated stock: thermal rejection capacity**, federal and
per-station. It is the right one and arguably the only defensible one:

- §7.5.3 already denominates money in it, so the stock and the currency are the
  same thing and no conversion exists to be balanced;
- §7.2 makes closure the sovereignty number, and closure is a ratio *of* capacity
  — the denominator exists in the fiction and is missing from the state;
- §7.5.2's quota market is a market in exactly this, "whose price is set by an
  appropriation vote";
- and it is the constraint the setting is *about*. A person costs heat. One stock
  gives the franchise a line item.

**Do not add stocks for volume, substrate and transit.** Four stocks is a
resource economy with four balances to reconcile, which is the second window
§7.6's test rules out. Those three stay index prices, driven by policy, as they
are now.

### 2.3 A defect found while measuring

Two of the four prices are barely driven at all, and this is worth fixing whether
or not the rest of this document is built:

| price | driven by |
|---|---|
| thermal | `thermal_margin` |
| substrate | `substrate_public_share`, and thermal |
| **volume** | **`treasury < 40 ? 14 : -4` — a binary threshold, so the volume price has two states** |
| **transit** | **`treasury` alone, linearly** |

Neither volume nor transit touches §7.3's four tax bases, any station, or the
appropriation §7.5.2 names as the thing that sets a quota price. A binary on a
scalar is not a model of anything, and under §7.9's design rule a price nothing
meaningfully moves is a price no event can honestly be gated on.

The appropriation in §4 is the natural driver for all four, which is another
reason this document precedes the others in Part VII's orbit.

## 3. The unit

Thermal rejection capacity, per §7.5.3. The unit needs a name, and **naming it is
a canon decision, not an engine one** — §3.9 locks the naming scheme and §2.7
warns that inventing a setting term in passing is the main production risk. It
should be named in `bible.md` before it appears in `js/`.

What matters mechanically is what the choice of unit does:

> **A person costs heat. So the franchise question and the budget question are
> literally the same question.**

Extending personhood to two million forks has a line in the appropriation. That
is the game's best single idea and it is unavailable until money is denominated
in the thing that constrains minds. It is also why this document is worth doing
before `10`: the settlements in `05` are constitutional positions with fiscal
prices, and without a budget the price is rhetorical.

## 4. The budget is a bill, not a screen

**This is the part where the obvious design is wrong.** A budget screen with line
items and sliders fails §7.6's test on sight — the player would need a second
window, and the game would become a spreadsheet with a parliament attached.

So: **the Appropriation Bill.** One bill, once per session, that must pass.

- It is a bill, so it uses the machinery that already exists: stages, order-paper
  time, whipping, division, the President.
- It is the one piece of business the whole chamber has an interest in, which
  makes it the natural spine of a session.
- **Failing it is losing supply**, which is the sharpest confidence test there
  is — and unlike the existing confidence loss, it is one the player can see
  coming for six sittings.

### 4.1 Allocation is a handful of large choices

Not line items. Four to six decisions, each between three or four stated levels,
each with named consequences:

| the decision | moves | the politics |
|---|---|---|
| thermal quota released | the `thermal` price — §7.5.2's clause, made literal | the whole economy, and who can afford to exist |
| the consumables floor | `consumables` | §7.4's guarantee; cutting it is visible immediately |
| substrate insurance | the third rail | §7.4: cutting it does not reduce income, it suspends people |
| capital works | `volume` | slow, and the only thing that helps in ten years |
| transit subsidy | `transit` | the anchor states and the outer stations |
| **personhood provision** | how many minds the state will carry | the franchise, priced |

Each level is a stated position with a stated cost, drawn like a clause in the
bill, decided the way `12` decides anything else — expand, read, commit. No
sliders. A slider invites optimisation; three named levels invite an argument.

### 4.2 It is the escalation ladder, seen from the other side

`03` §4 specifies a nine-rung ladder before involuntary suspension. Rungs 4, 5
and 6 — emergency thermal appropriation, quota purchase, substrate-insurance
drawdown — **are budget acts**. They are the same system viewed from a crisis
instead of from a calendar.

That is a good sign rather than a duplication: it means the ladder has somewhere
to live, and it means the budget has stakes beyond arithmetic. An emergency
appropriation mid-session is a supply vote out of season, and losing one is
losing supply.

## 5. What `treasury` becomes

Today `treasury` is a 0–100 scalar meaning "capacity to act", and it drives two
prices in `tick()` (`volume` below 40, `transit` scaled around 50).

If money is denominated in thermal capacity, treasury should be **the quota the
state actually holds** — a quantity, not an index. That is a change to §7.6's
LOCKED scalar list and **must be a bible amendment before it is an engine
change**. Proposed:

> `treasury` is the quota the state holds and may allocate, denominated in the
> unit of §7.5.3. It is a quantity, not an index. It is shown exactly, for the
> same reason capital is: this game is for people who want the arithmetic.

The risk to watch, and the reason to state it plainly: a denominated treasury
tempts the model toward a revenue simulation, and §7.6 forbids that. The
mitigation is §6 below.

## 6. What not to build

**No revenue model.** Income is not a variable to be optimised. The tax base is
§7.3's four bases and they move by policy, not by simulation.

**No deficit spiral, no bond market, no interest rate.** A government that runs
out of quota does not go bankrupt; it sheds people, and that is §7.9's chain,
already built.

**None of §7.5.2's markets are simulated.** Quota trading, underwriting, volume
leases and substrate futures are *setting*. They appear in prose, in the
Concordance, and as the subject of events. Simulating them would be the
supply-chain solver §7.6 rules out in its first line. The Underwriters being
"the only party with accurate numbers on everything" is a characterisation, not a
data feed.

**No second budget screen.** The Appropriation Bill is read on the Papers screen
like any other bill, and divided on like any other bill.

The test for any addition here is the one that governs the whole plan: does it
end in an event a player reads (T2), and could they hold it in their head (T1)?

## 7. Supply, and what a confidence-and-supply partner is

With a budget, `confidenceSupply` finally means something specific, and it is
**not** the same relationship as a coalition partner:

| | coalition | confidence and supply |
|---|---|---|
| the Appropriation Bill | votes for | **votes for — this is the arrangement** |
| a confidence motion | votes for | abstains, or votes for |
| everything else | whipped, at the §7.8 rates | **free** |
| capital ledger | yes | yes, and cheaper to overdraw |

The consequence for the whip panel: a C&S partner's seats should be **movable on
supply and confidence and immovable elsewhere**, rather than treated as coalition
seats at a discount. That is a table change, not a new system, and it makes the
distinction the state object has always drawn finally visible.

And the failure mode becomes available: **a partner who withdraws supply but not
confidence.** The government survives and cannot pass its budget. That is a real
political position, it is currently unrepresentable, and it is a better mid-game
crisis than anything else in this plan.

## 8. Where this sits in the order

After `01` (it needs the vocabulary) and alongside `03` (they share the ladder).
Before `10`, because an election fought without a budget in the record is an
election about nothing.

It is a **canon decision first**: lock §7.5.3, name the unit, and amend §7.6's
treasury line. None of the engine work should start before those three are in
`bible.md`.

## 9. Acceptance

- The Appropriation Bill exists in content, reaches the House once per session,
  and uses the existing bill machinery with no special case in the engine (T3 —
  `grep appropriation js/engine.js` returns nothing).
- Failing it loses supply, which routes through the existing loss path rather
  than a second one, and is distinguishable from losing confidence in the log.
- Each allocation decision moves the price it claims to move, asserted per
  decision, and each has at least one event gated on that price (§7.9's design
  rule, enforced by the audit in `03` §5).
- Treasury is denominated: an allocation that exceeds what the state holds is
  refused, and the refusal names the shortfall.
- A confidence-and-supply partner is movable on supply and on confidence and
  immovable on an ordinary bill — asserted in the whip table, both directions.
- Withdrawing supply while keeping confidence produces a government that survives
  and cannot pass its budget, asserted as a reachable state.
- The personhood provision's cost scales with the number of minds the franchise
  covers, so that a franchise change before the budget changes the budget —
  which is the assertion that proves this document and `10` are the same story.
