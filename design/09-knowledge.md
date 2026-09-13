# 09 — KNOWLEDGE

*Secrets, scandal, and the thriller half.*

`sweep-brief.md` C.3 puts it plainly: grep for "scandal" across `js/` and
`content/` and there are **zero hits in both**. Part XIII is LOCKED canon and
entirely unbuilt.

> There is no information asymmetry anywhere in the state object — no secrets, no
> dirt, no model of who knows what. This is currently a competent governance
> simulator. The thriller half does not exist.

And the warning that makes this urgent rather than optional: *"The state-object
decision — what knowledge is and who holds it — is far cheaper to make now than
at event 150."*

---

## 1. The whole model

One state branch. Deliberately the smallest thing that can carry Part XIII.

```js
st.knows = {            // personId -> { secretId: sittingLearnt }
  halloran: { backup_coercion: 14 },
  player:   { backup_coercion: 11, cluster_source: 4 }
}
```

A **secret** is content (`content/secrets.js`): an id, what it is, who it damages,
and what it is worth. The engine knows only that secrets exist, who holds which,
and when they learnt it (T3).

`player` is a person in this table like any other, which is the design. The
player not knowing something is as mechanically real as a minister not knowing
it, and it is what lets an event withhold from the player honestly rather than by
authorial fiat.

**`when` learnt is load-bearing, not bookkeeping.** Half of political scandal is
what you knew and when — "the Prime Minister was informed on the fourth" is the
sentence that ends careers. Storing the sitting number costs nothing and makes
that sentence available to content.

## 2. Verb and condition

```js
{learn: {who: "halloran", secret: "backup_coercion"}}
when: { knows: {halloran: ["backup_coercion"], player: []} }
```

`knows` with an empty list asserts the person holds **no** secret — the negative
case, which is how content asks "does the player still not know?" It is the
condition most of the thriller will actually be written against.

One verb, one condition, for the entire thriller half. That ratio is correct: the
drama is in who tells whom, which is prose, and the engine's only job is to
remember.

## 3. The distribution list is the artefact

§12.8, and `sweep-brief.md` names the hook already sitting in the build:

> The minutes already render a cc line with a struck-through recipient. It is
> decorative; **make it load-bearing.**

So: a paper's distribution list *is* the `learn` effect. Circulating a minute
teaches everyone on the cc line. Striking a name off keeps it from them — and
the strike is visible on the document, so the player can be caught having done
it.

This is the best mechanic available in this document and it costs nothing beyond
wiring an existing decoration to an existing verb. It also means the player's
main instrument for controlling information is a **document they can read**,
which is the whole aesthetic of the game (§12.8, §12.2).

## 4. Attestation on the wire

`sweep-brief.md` C.5, §12.9: mark attested claims on the Wire *"so manufactured
consensus is visible rather than ambient."*

Stations already carry an `attested` fraction. A wire item gains an attestation
marker, and a low-attestation station's reports are visibly weaker sourced. The
player learns to discount them — and then something true arrives badly attested,
which is the point.

Small, and it is the only place in the build where the *quality* of information
is visible rather than its content.

## 5. The scandal taxonomy

§13.1 is LOCKED and supplies the categories; content supplies the instances. The
engine adds nothing further. A scandal is:

- a secret,
- held by someone who should not hold it or not held by someone who should,
- with an event gated on `knows` that fires when that becomes untenable.

Which is to say: **scandal is not a system.** It is what the knowledge table plus
the event queue produce, and building it as a subsystem would be the mistake this
plan keeps refusing.

## 6. The spine

§13.2, LEANING: *"Backup coercion is where the thriller lives, if the political
and the personal are to be the same plot. Hold in reserve for a late-game arc: a
Prime Minister discovers it has been done to a cabinet colleague."*

Everything above is the machinery that arc needs and nothing more:

- the colleague holds the secret and the player does not (`knows`, negative case);
- the player learns it at a recorded sitting (`learn`, and the sitting matters);
- what the player does with it is `personal` class (`06` §3) and therefore never
  appears on a public screen;
- and the distribution list is how it either stays contained or does not.

It stays LEANING and it stays late. The engine should be ready for it before
chapter three is written, because retrofitting a knowledge model into a hundred
and fifty authored events is the expensive version of this document.

## 7. What this deliberately does not do

**No suspicion model.** No probability that someone half-knows. Knowledge is
binary and dated, because a suspicion model fails §7.6's test — the player would
need a second window to work out who currently suspects what.

**No automatic leaking.** Secrets move only by `learn`, which means only by
content or by the distribution list. An engine that leaked on a timer would take
the one thing the thriller is about — a person deciding to tell — and make it
weather.

## 8. Acceptance

- `st.knows` round-trips through save/load and through the editor.
- `knows` gates in both directions, including the empty-list negative case.
- Circulating a paper teaches exactly the names on its distribution list, and a
  struck name learns nothing — asserted on the real minutes rendering.
- No engine path writes `st.knows` except the `learn` effect: asserted by running
  the 40-sitting smoke test with a spy on the table and requiring every write to
  originate from an applied effect.
- `content/secrets.js` passes `tools/cxcheck.js` and `js/refs.js` follows secret
  ids through a rename.
- `grep -E 'backup_coercion|halloran' js/engine.js` returns nothing (T3).
