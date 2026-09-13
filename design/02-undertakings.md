# 02 — UNDERTAKINGS

**The loop spine.** This is the smallest change that makes a decision weigh
something, and it is the answer to the measured fact in `loop-brief.md` §1.1:
the Sitting screen and the Government screen never touch, so a player who never
opens Government reaches the same states as one who lives there.

---

## 1. The problem, precisely

An event choice that says the government will lay an order does not create an
order to be laid. It applies `{si:[...]}` and the order is in force. The act and
the promise are the same instant, so:

- the choice is a button that does a thing;
- the Government screen's real verbs (slots, instruments, prayer, whipping,
  division) are never *demanded* by anything;
- order-paper time, which §7.7 makes the currency that generates capital, is
  never contested, because nothing needs it urgently;
- and there is no cost to inaction, because there is nothing outstanding to be
  late with.

## 2. The mechanic

**A choice does not perform the act. It undertakes to.**

```js
{ id: "lay_shed_order",
  text: "Lay the shed order before the House",
  owed_to: "gb",                          // a party, a character, or null for the public
  by: 6,                                  // absolute sitting number
  discharge: { si: "shed_order_2287" },   // what closes it
  onBreach: "gb_withdraws_support",       // event queued if the deadline passes
  state: "open" }
```

`discharge` names an act the game already knows how to perform, and the engine
watches for it rather than asking the player to confirm anything:

| discharge | closed when |
|---|---|
| `{si: id}` | that instrument is made |
| `{bill: id, stage: "third_reading"}` | that bill reaches that stage |
| `{division: id, carried: true}` | that bill's division carries |
| `{slot: id}` | order-paper time is granted to that bill |
| `{flag: name}` | content sets that flag by any route |

The player is never told to tick a box. They lay the order because they said they
would, on the screen that lays orders, and it closes.

## 3. Where it lives in the loop

**Sitting creates.** The choice's `effects` carry `{undertake: {...}}`. The
result line names what was promised, in the voice of the terminal — *"The order
is to be laid by the sixth sitting."*

**Government, Papers and the Chamber discharge.** No new UI verbs: `makeInstrument`,
`grantSlot` and `divide` already exist and already run through the engine. Each
calls one new function on the way out.

```js
function settle(st, C) {          // called after any act that could discharge
  st.undertakings.filter(u => u.state === "open").forEach(u => {
    if (met(st, u.discharge)) {
      u.state = "kept";
      st.log.unshift({ sitting: st.sitting, text: "Undertaking kept: " + u.text });
    }
  });
}
```

**`advance()` breaks.** One block, before the existing `tick`:

```js
st.undertakings.filter(u => u.state === "open" && u.by < st.sitting).forEach(u => {
  u.state = "broken";
  if (u.onBreach) st.queue.push({ eventId: u.onBreach, dueSitting: st.sitting });
});
```

Breach queues an event; it does not itself move a number. That is T2 and it is
the whole discipline of this file — **the politics of a broken promise belongs
in the event, where it can be written, argued with and refracted through whoever
is telling you about it.** An engine that docked eight loyalty silently would be
cheaper and much worse.

**The status bar carries the count.** "2 outstanding" beside the sitting number.
This is what makes "Rise until the next sitting" stop being free, and it costs
one line in `drawStatus()`.

## 4. Conditions

```js
when: { owes: ["lay_shed_order"] }        // still outstanding
when: { breached: ["lay_shed_order"] }    // was broken
```

`breached` is the one that earns its place: it lets content written months apart
refer to a promise the player broke in chapter one, which is the cheapest form of
long memory a narrative game can have.

## 5. What this is not

**Not a quest log.** An undertaking is not a task the game sets the player; it is
a thing the player said in public and can be held to. If content ever generates
one the player did not choose, it has been misused.

**Not a timer on everything.** Most choices should carry none. If every decision
produces an undertaking the screen becomes a to-do list and the mechanic stops
meaning anything. The rule for authors: an undertaking is for a promise made *to
somebody who will notice*, which is why `owed_to` is required and may only be
null when the promise was made publicly.

**Not a replacement for the queue.** `queue` schedules an event; an undertaking
tracks an obligation and may or may not end in one.

## 6. The split window

The interface half of this, specified here because it is what makes the mechanic
legible rather than bureaucratic. Sitting, when a choice carries an undertaking,
opens onto:

- **the instrument on the right** — the actual order, bill clause or paper, drawn
  with the Papers screen's own stock, because it is the same object;
- **the longer description in a dropdown**, closed by default (§2.6: explanation
  cost is the real budget — an expandable is how you pay it only when asked);
- **advisor disagreement along the bottom** — *not* an impact table. Two named
  ministers who want opposite things is a decision; "loyalty −9" is a number
  players learn to optimise. The cabinet is already data with holders and
  titles, so an advisor line keyed on the minister whose brief the decision
  touches costs nothing structural;
- **the forecast, attributed and fallible.** See `07` §6: the count is the
  whips' estimate, it carries a stated provenance, and it can be wrong.

## 7. Acceptance

- An undertaking created by a choice appears in state, in the status bar, and in
  the save; it survives serialise→reload (`tools/roundtrip.js`).
- Performing the named act on the Government screen closes it, with **no UI
  affordance for closing it directly** — asserted by driving the real button.
- Passing the deadline sets `broken` and queues the breach event, once and only
  once, asserted across ten `advance()` calls.
- `owes` and `breached` gate an event correctly in both directions.
- A choice with no undertaking behaves exactly as before — asserted by replaying
  an existing event and comparing `Engine.save()` byte-for-byte against the
  pre-change build.
