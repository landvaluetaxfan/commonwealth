# 15 — THE CALENDAR

*Why the order paper is a list and not a schedule, and what it costs.*

The observation this document answers: **it feels like you can arbitrarily decide
when a bill goes to a vote.** You can. There is nothing stopping you, because
there is no calendar for anything to be scheduled against.

---

## 1. What is actually missing, measured

Four facts about the build, each checked:

| | |
|---|---|
| `st.session` | read in two places for display, **never written**. Session 4 is a permanent label. |
| order-paper slots | `{slots:{refill:true}}` exists as a verb and **no content uses it**. Six slots is a lifetime budget. |
| a session length | **does not exist** in `content/setup.js`, in the engine, or anywhere in `bible.md`. |
| `js/tips.js` | tells the player slots *"do not refill until the session does"* — describing a mechanic that cannot happen. |

Every act in the game is available on every sitting, forever, subject only to a
budget that never resets. **Time passes and nothing is due.**

## 2. Why it matters more than it sounds

It is not that a schedule would be realistic. It is that four systems already
built depend on a deadline and none of them has one.

**§7.7 is LOCKED and calls order-paper time "the currency that cannot be topped
up".** That is exactly right and it is currently false in both directions: it
cannot be topped up *and it never runs out*, because the session that bounds it
never ends. A currency with no reset is a one-time allowance, not an economy.

**Undertakings introduced the first deadline in the game** (`design/02`), and
they are a deadline against a sitting counter that means nothing. "By sitting 8"
is arithmetic; "before the session rises" is politics.

**The Appropriation Bill is "once per session"** (`design/13`) and cannot exist
until a session does.

**"Inaction is a decision"** — §7.9 says so directly, and inaction is currently
free. You may rise indefinitely at no cost, which is what made thirty clicks of
Rise feel like a missing placeholder rather than like time passing.

And the specific complaint: a division is a thing the player calls when they feel
like it. In any real chamber the government controls *what* is debated and
largely *when* — but inside a fixed calendar, against a session that ends. The
control is over the order of business, not over whether the clock runs.

## 3. Is the infrastructure in place?

**Mostly, and that is the good news.** What exists:

- `st.sitting`, incremented by `advance()`;
- `st.session`, in the state object and in the save;
- `st.slots` with a total and a used count, and a `refill` verb;
- `content/setup.js` declares `slotsPerSession: 6` — the *name* already assumes
  the mechanic;
- undertakings carry a `by` and break on `advance()`, which is the pattern every
  other deadline should copy;
- bills have stages and a `dead` flag.

What is missing is small and almost entirely in one function.

## 4. The design

### 4.1 A session has a length

`content/setup.js` gains `sittingsPerSession`. `advance()` gains one block,
beside the undertaking-breach check it already runs:

```js
if (st.sitting > st.sessionEnds) prorogue(st, C);
```

`prorogue()` does four things and queues an event:

1. **`st.session += 1`**, and `sessionEnds` moves on.
2. **Slots refill.** The currency finally has a period.
3. **Business dies.** Bills not passed fall — which is what makes the order
   paper a schedule rather than a queue, and what makes granting a slot to a
   partner's bill a real choice instead of a delay.
4. **Undertakings come due.** Anything owed "before the session rises" breaks
   here rather than on an arbitrary sitting number.

Then it queues a `government`-class event: the House rises, and here is what
fell with it.

**Carry-over is the one real decision inside this.** Real parliaments vary and
both are defensible; the recommendation is that **bills die and instruments
survive**, because that difference is already the argument the Papers screen
makes — *"a bill needs a majority and cannot be undone; an order needs no
majority and can be revoked"* — and prorogation sharpens it into a reason to
reach for the fast, deniable tool.

### 4.2 Business is scheduled, not summoned

The change that answers the complaint directly.

Today `divide()` may be called on any sitting once a bill reaches `DIVIDES_AT`.
Instead: **granting the final slot sets a day.**

```js
st.bills[id].dividesOn = st.sitting + 2;
```

The division happens on that sitting. The player still chooses *whether* and
*when to schedule* it — that is the government's real power over the order paper
— but having scheduled it, they must live in the two sittings before it. Which
is precisely where whipping, amendment (`design/07`) and lobbying belong, and
currently they have no window to happen in.

**This is the whole fix in one line of state.** A division you called instantly
has no campaign; a division with a date does.

### 4.3 The order paper prints the days

Once business has dates, the docket built in `design/12` stops being a list of
things and becomes what its name says:

```
BEFORE THE HOUSE
  Divergence Threshold (Amendment) Bill   committee
  Licensing order carrying the carve-out  by sitting 8      OWED
  Division: Anchor Concession Bill        sitting 14
  Session rises                           sitting 20
```

The session's end is on it, always, which is the cheapest possible source of
pressure and needs no new mechanic at all.

## 5. What this must not become

**Not a turn limit.** The session ending is not a fail state; it is a boundary
that things fall off. A player who loses a bill to prorogation should be able to
bring it back next session, poorer.

**Not a scheduling minigame.** No allocating debates to days, no timetable motion
UI. The player grants slots exactly as they do now, and the engine records when
the consequence lands.

**Not a real-time clock.** `st.date` advances with sittings and should keep doing
only that.

**Not a reason to stop the player acting.** Instruments stay immediate — an order
signed today is in force today, and that asymmetry against a scheduled division
is the point of instruments existing.

## 6. Cost, and where it sits in the order

Small: one setup field, one function in `advance()`, one field on a bill, one
migration block, and the docket lines. Perhaps a morning.

It should come **early** — before `design/13` (which needs a session), before
`design/07` (whose amendments and lobbying need a window before a division to
happen in), and ideally before much more content is written, because every event
authored against a timeless order paper is an event that may assume it.

It also closes the loudest complaint about the loop with less code than anything
else in `design/`.

## 7. Acceptance

- `st.session` advances, and a save from before this loads and gets a session
  that ends.
- Slots refill at prorogation and at no other time; `js/tips.js` becomes true.
- A bill not passed by prorogation dies; an instrument in force survives.
- An undertaking owed "before the session rises" breaks at prorogation.
- Granting the final slot sets a division day, and `divide()` refuses before it —
  asserted at every sitting between.
- The docket carries the session's end at all times.
- A division still resolves identically whether its dialog is watched or skipped:
  scheduling changes *when*, never *what*.
