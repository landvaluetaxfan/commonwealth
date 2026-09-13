# 08 — ACTORS

*Everyone in the game who is currently scenery.*

The chamber has 280 seats, eleven parties, a cabinet, a caucus with currents, a
President with reserve powers and an upper house. **Not one of them ever does
anything the player did not cause.** Every consequence in the build is either a
number moving or an event the player triggered.

This is the difference between a state machine the player operates and a place
they govern, and it is mostly cheap: actors act through the **event queue**, not
through new subsystems. The engine's share is small on purpose.

---

## 1. The principle

> An actor is a rule that queues an event. It does not move numbers directly.

Same discipline as `02` §3: an engine that docks eight loyalty silently is
cheaper and much worse than one that queues *"The Guild Bench has withdrawn from
the committee"* and lets the event carry the politics. This keeps T2, keeps the
prose in content where it belongs, and means every actor is inspectable in the
log rather than being an invisible correction.

Each section below therefore specifies **a trigger, and the event class it
queues**. Nothing more.

---

## 2. The caucus, and the leadership ballot

`sweep-brief.md` C.2, and §3.5 calls it the best loss condition: *"it makes your
own caucus an antagonist, so loyalty management has teeth and every
popular-but-divisive decision costs something real."*

Today it is `party_loyalty <= 15` — a meter, not a mechanic. Everything else
already exists: `st.signatures`, the `signaturesAtLeast` condition, and the
Halloran events built around nine more names. **Nobody ever holds a ballot.**

**The build:**

- signatures reaching the threshold queues the ballot as a `party` event;
- the caucus divides on **loyalty and on what you have paid each current** —
  `st.currents` already carries per-current loyalty and member counts, so the
  arithmetic is a sum, not a model;
- losing ends the game through the existing loss path.

**Connect it to the roll.** §4.5: revenants owe their seat to the party and whip
perfectly — *"a caucus full of them is loyal and brittle, a fact for a PM to
discover at the wrong moment."* The roll now records how each member arrived, so
a ballot can count revenants separately. Brittleness means: they hold until they
break, and then they break together.

**The approach must be visible.** A loss condition the player walks into blind is
a bug report. The signature count is already in the status bar; what is missing
is a named challenger and a count that moves before the threshold, so the player
can see it coming and spend to stop it.

## 3. The cabinet

Ministers are data (`st.cabinet`, holders and titles) and have never acted. Three
triggers, all queuing `government` or `party` events:

| trigger | event |
|---|---|
| a broken undertaking in a minister's brief (`02`) | that minister resigns, or briefs against you |
| a bill in their brief amended against their axis position (`07`) | they threaten to |
| a post left vacant across a session boundary | the President declines the next instrument (already built: a post with no holder cannot make one) |

A resignation the player did not choose is the strongest available consequence of
a broken promise, and it costs nothing new: `{cabinet: {post: null}}` already
vacates, and the vacancy already bites.

## 4. Coalition partners

`st.coalition` is a list only the player edits. Partners should be able to leave.

- **Trigger:** loyalty below a content-set floor, *or* a bill carried against
  their axis position, *or* capital overdrawn past a threshold (§7.8 already
  charges 2 loyalty per point overdrawn — this is that debt coming due).
- **Queues:** a `party` event offering terms. The ultimatum arrives before the
  departure; a partner who simply vanished would be a bug the player could not
  have prevented.
- Departure uses `{coalition: {remove: […]}}`, which exists, and confidence
  recomputes from the roll, which it already does.

## 5. The opposition

`inGovernment` has been in the state object since day one, per §3.6, and there is
no opposition action economy behind it. But an opposition that never acts is a
worse gap than opposition *mode* being unbuilt: the player is governing against
nobody.

Four acts, all `chamber` class, all triggered by state the opposition can see:

| act | trigger |
|---|---|
| **urgent question** | a scalar falling fast, or a station in visible trouble |
| **censure motion** | a broken undertaking, or a scandal surfaced (`09`) |
| **wrecking timetable** | the player's order paper nearly full (`slotsLeft` is low) |
| **amendment** | any bill at committee — the opposition attaches its own (`07`) |

The wrecking timetable is the one that makes §7.7's order-paper time finally
scarce in both directions: time is not just what you give partners, it is what
the opposition can waste.

**Opposition mode proper — the player *in* opposition — is a campaign (`05` §3),
not a system.** Do not build a second action economy for it until that campaign
is authored.

## 6. The President

§3.3 gives four reserve powers. Two are built (referral, appointment refusal);
two are not (dissolution, government formation) and belong to `10`.

What is missing is not powers but **motive**. `st.president.relationship` is a
number that only the player moves. Give the office a position — content-set, on
the same axes as everything else — and let referral be *predictable from it*
rather than a coin the player cannot read. A President who refuses on principle
is an actor; one who refuses on a threshold is a gate.

## 7. The upper house

`sweep-brief.md` C.5: *"`upper_house` is a stage with no actor and no rejection
path."* Part XVI: powers undefined.

**Decide the powers before building anything**, and the cheapest decision that
earns the stage is a **delay power, not a veto**: the upper house can hold a bill
for N sittings and no more. That makes it a cost in order-paper time — the
currency the game already has — rather than a second veto beside the functional
bench, which the game does not need and which would make the dual majority less
legible rather than more.

This is an open canon decision and belongs in the bible before it belongs in the
engine.

## 8. Imperfect information

Not an actor, but it belongs here because it is what makes actors readable as
people rather than as rules.

`Engine.division()` returns exact counts; the whip panel shows the true cost of
every block before it is committed. **The player never acts on an estimate.** A
division is therefore arithmetic rather than judgement, and the thing that makes
whipping dramatic in reality — not knowing whether your own side will turn up —
is absent.

**The fix is presentational and small.** The true number is already computed. The
forecast gains a stated provenance (the whips' count, the department's view, a
partner's assurance) and an error term derived from what the source could
actually know:

- your own caucus: accurate, because the whips do count;
- coalition partners: accurate within a few, and worse as their loyalty falls;
- the functional bench: an estimate, and openly labelled one;
- the opposition: a guess.

A partner whose loyalty is collapsing gives you a worse number *and does not tell
you it is worse*. That single property does more for the feel of the game than
any new system in this plan.

The error must be **derived from the seed and the state, not rolled fresh on
every render** — otherwise the forecast flickers when the screen redraws and the
player learns to re-read it until it settles.

## 9. Acceptance

- Each actor's trigger queues its event exactly once per occurrence, asserted
  across twenty advances.
- **No actor moves a scalar, a loyalty or a seat directly** — asserted by running
  the smoke test with every actor trigger armed and checking that state changes
  only through applied event effects.
- The leadership ballot is reachable, winnable and losable; losing routes through
  the existing loss condition rather than a second one.
- A partner never leaves without an ultimatum event first.
- The forecast's error is stable across re-renders of the same state, and its
  provenance string is present on every forecast shown.
- With the seed fixed, forecast error is reproducible (I2).
