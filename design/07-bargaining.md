# 07 — BARGAINING

*Amendments and lobbying.* Between them they are the answer to a problem the
bible states and the build cannot currently solve: **the divergence bill's
functional trap has no mechanical solution at all.**

---

## 1. The trap

§7.8, LOCKED, on the whip system:

> **What it does not fix:** the divergence bill's functional trap. The coalition
> holds 12 of 40 functional seats and needs 21, and all 12 already vote for it,
> so there is no headroom. A structural problem with a political solution.

And, on why the whip cannot reach further:

> Parties **outside the coalition cannot be whipped at all**; moving those
> benches is lobbying, a different activity with a different currency, and not
> yet built.

So the central bill of chapter one — the one the game opens on, the one the
player's coalition was formed to pass — cannot be carried by any verb in the
game. That is fine as a chapter-one *predicament*. It is not fine as a permanent
property of the engine, and it is why both halves of this document exist.

There are exactly two political solutions to a functional trap: **change the
bill** so the bench can vote for it, or **reach the bench** by some means other
than the whip. Amendments are the first. Lobbying is the second.

---

## 2. Amendments

`sweep-brief.md` C.1 calls this "FIRST, and the cheapest large win", and it is
right. `st.bills[id].amendments = []` is initialised and never written to.
`committee` is in `STAGE_ORDER` and does nothing a stage counter does not.

A bill therefore has two fates: advance unchanged, or die. There is no way to
**change a bill to buy a vote**, which is the central currency of real
legislative bargaining and the obvious partner to the whip system that exists.

### 2.1 The shape

An amendment is content (`content/amendments.js`), and it is the only new content
type in the completion plan:

```js
{ id: "licensure_carveout",
  bill: "divergence",
  title: "The threshold moves; licensure does not",
  clause: "Nothing in section 3 shall affect the certification of…",
  axis: { personhood: -0.2 },     // which way it pulls the bill
  price: { capital: 4 },           // what attaching it costs
  moves: { gb: "for", psa: "against" } }
```

`moves` is the point: **conceding a clause should be able to carry the functional
bench and lose you the Substrate Left in the same division.** An amendment that
only helps is not a bargain, and content review should reject one.

### 2.2 The verb and the condition

```js
{amend: {bill: "divergence", amendment: "licensure_carveout"}}
when: { amended: {divergence: ["licensure_carveout"]} }
```

Attachment happens at committee stage and nowhere else, which finally gives that
stage a reason to exist. A bill at committee shows its available amendments; one
past it does not.

### 2.3 What the division does with it

`Engine.division()` already computes a per-party stance from axis distance. An
attached amendment shifts the bill's axis position before that computation runs,
and `moves` overrides the computed stance for the named parties. Everything
downstream — the dual majority test, the whip headroom table, the forecast — is
unchanged and needs no special case.

This is why amendments are cheap: **the arithmetic already exists**; the
amendment moves an input to it.

### 2.4 Content owes this a real bargain

The licensure carve-out is already written into `content/events.js` as a
*conversation* (`gb_approach`, where the Guild Bench chair explains precisely
why the threshold reforms her rather than personhood). It is the best material in
the build and it currently resolves into a flag. It should resolve into an
amendment the player attaches, prices, and pays for.

---

## 3. Lobbying

Part XVI: *"Lobbying — moving benches outside the coalition. Currently impossible
by design; the whip panel says so. Needs its own currency."*

### 3.1 The currency is already in canon

§4.11 denominates campaign finance in **substrate-hours**. That is the currency,
and it is the right one: it is the same scarce thing everything else in the
economy is measured against, so lobbying competes with governing rather than
being a separate budget.

```js
{lobby: {party: "gb", hours: 120}}
```

`st.lobbying` is per-party, per-session, and **resets when the session does** —
unlike capital, which §7.6 locks as never decaying and never forgiven. The
distinction is deliberate and worth stating in the panel: capital is a debt
between governments; lobbying is money spent on a campaign that ends.

### 3.2 What it can and cannot buy

The whip table in §7.8 is the model, and lobbying is its outside-the-coalition
sibling with worse rates:

| alignment to the bill | movable | cost |
|---|---|---|
| broadly agrees (> +0.25) | 60% of the gap | 8 hours / seat |
| no strong view | 25% | 20 hours / seat |
| fundamentally opposed (< −0.25) | **0%** | — |

Two properties matter more than the numbers.

**You cannot lobby a party out of its position.** The whip cannot either — §7.8
says you buy apathy, never conviction — and lobbying must be strictly weaker or
it becomes the answer to everything. Against a fundamentally opposed bench,
lobbying does nothing: the answer there is an amendment, or defeat.

**Functional seats are cheaper to lobby than district seats**, because §4.6.3
locks the electorate sizes: a functional seat with four hundred voters is *"won
by persuading a few dozen people over dinner rather than campaigning."* The
engine should reflect that by scaling cost with electorate size, which it can
read from the functional roll. This is the mechanism by which the trap becomes
solvable — expensively, visibly, and with the licensing board (§4.6.4) watching.

### 3.3 It must be visible

Lobbying a functional bench is, in this setting, close to the line. §4.6.2's
corporate voting and §4.6.4's licensing board are both nearby. So: lobbying
appears on the Wire, attributed, with a delay. Buying twenty-one functional seats
quietly is not a thing the game should permit, and the cost of it being seen is
most of what makes it a decision.

---

## 4. The two together

The intended chapter-one endgame, once both exist:

1. The forecast shows 12 of 40 functional and 21 needed. No headroom.
2. The Guild Bench conversation offers the licensure carve-out.
3. Attaching it moves the functional bench and costs the Substrate Left — who are
   in the coalition, and whose loyalty pays for it.
4. What remains of the gap is lobbied, in substrate-hours, on the Wire, where the
   opposition can see it.
5. The bill carries, or it does not, and either way the player made the trade
   rather than watching a number.

None of that needs a new subsystem. It needs one new content type, two verbs, one
condition, and the arithmetic that is already there.

## 5. Acceptance

- An attached amendment changes a division's forecast, and detaching it restores
  the previous forecast exactly.
- `moves` overrides the computed stance for the named parties and for no others.
- An amendment can be attached only at committee stage — asserted at every other
  stage in `STAGE_ORDER`.
- `amended` gates an event in both directions.
- Lobbying moves nothing on a fundamentally opposed party, at any expenditure.
- Lobbying resets at the session boundary; capital does not — asserted across a
  session change in the same test.
- Cost per seat scales with electorate size, asserted against a functional seat
  and a district seat.
- **The functional trap is solvable**: a scripted sequence of amendment plus
  lobbying carries the divergence bill's functional tier. This is the assertion
  that proves the document did its job, and it should be written before the code.
