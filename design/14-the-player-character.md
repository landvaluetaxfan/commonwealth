# 14 — THE PLAYER CHARACTER

*How malleable Adriana Flash should be, what must already be true about her,
and what the game expects of the player.*

For the narrative pass. This decides the questions a writer has to answer before
the first replacement event, and it is deliberately a set of rules rather than a
biography — the biography is content and belongs to whoever writes it.

---

## 1. What canon already fixes

**§3.4, LOCKED:**

> A distinct named in-universe person, not a blank avatar. Gives event text a
> voice and a personal history that can be dug up, which is the actual engine of
> a political thriller.
>
> **Rule: personal traits are mostly liabilities, not buffs.** A brilliant orator
> with an ex-business partner under indictment is a better game than +10
> charisma.
>
> Two or three pregenerated leaders with different opening constraints as a
> replay hook. **THIN** — only one is written.

**§9.2, LOCKED:** the player inherits commitments they did not make; moving a
position costs faction loyalty and hands the challenger a weapon.

**§9.4, LOCKED:** refraction — every other ideology is seen through the player's
party's view of it, which is cheaper to write than neutral entries and better
prose.

So the principle is settled and **the content is empty.** `content/characters.js`
says of her, in full: *"Liabilities, not buffs. Her record is the thing that can
be dug up."* There is no record. Nothing can be dug up, because nothing is buried.

**One inconsistency to resolve first:** `content/characters.js` gives her
`seat:"First Spin"`; bible §11.2 says *"Member for Anselm Ring"*. The bible wins.
Fix the content or amend the bible, but not silently.

---

## 2. The rule for malleability

> **Her past is fixed and knowable. Her future is entirely the player's.**
>
> The past is what can be used against her. The future is what the player is for.

Everything below follows from that one line, and it is the answer to "how
malleable should she be": completely, forward; not at all, backward.

### 2.1 Fixed, and it must be written

**A record — three to five concrete things she has done.** Not traits. Each one
an act, dated, with a document behind it, and each one a liability:

- a vote she cast that she would not cast now;
- money she took, or a favour, from somebody who is still around;
- an office she held when something went wrong on her watch;
- a person she promoted, or failed to;
- something she said in public that is on the record.

The test for each: **could an opponent read it out in the chamber?** If not, it is
a trait and belongs nowhere. "Brilliant orator" cannot be read out. "The Prime
Minister voted twice to extend the sunset clause she now proposes to end" can.

**Inherited commitments (§9.2).** The threshold bill already is one — the
opening event says her predecessor promised it and she has to carry it. That is
the model; there should be two or three more, and at least one that has quietly
become impossible.

**Relationships that predate the game.** Several exist already and are good: the
President is *cold* and has privately indicated he would refer a contested dual
majority; Czarnecki is eleven members and nine signatures from a ballot; the
Guild Bench chair will meet exactly one member of her cabinet and it is not her.
Each is a fact the player inherits and did not cause.

**Her constituency**, and what it wants from her that the country does not.

### 2.2 Malleable, and it must NOT be written

- **Her position on any of the four axes.** That is the player's, expressed by
  what they do. A PM with authored convictions is a PM the player is watching
  rather than being.
- **Her manner.** The same choice should be available coldly and warmly; events
  must not decide she is charming.
- **Her ambition.** Whether she wants to be remembered, to survive, or to finish
  one thing, is the player's answer.
- **Anything that reads as a stat.** No charisma, no cunning, no resolve. §3.4
  rules them out and the rest of the engine has no room for them.

---

## 3. Whose voice, and the rule that makes it writable

The practical question a writer hits in the first paragraph.

> **The prose never puts words in her mouth that the player did not choose.**

- **Event bodies address her in the second person** and describe what she is
  looking at. *"Your predecessor promised it and did not have to carry it. You
  do."* This is already the register and it is right.
- **Other characters speak in quotes.** They are authored people; she is not.
- **Her speech appears only in choice labels and in results.** A label is her
  saying it; a result is what happened when she did.
- **Nobody narrates her feelings.** *"You are furious"* is the one sentence that
  breaks the whole arrangement. Other characters may tell her how she seems, and
  be wrong.

This is a rule content can be checked against, which is why it is stated as one.

---

## 4. What the player is expected to do

The user's question, and the answer exposes a real gap.

**§3.5 gives four ways to lose and the game states no purpose at all.** A player
opening it today is told the position of the House and given a decision. Nothing
says what would count as having done well. That is not austerity; it is a missing
sentence.

The fix is not a score. It is that **the inherited platform is the brief**:

> You were elected on a promise your predecessor made and you did not. You have a
> majority in the House and not in the functional benches. Carry it, or find out
> what you are prepared to carry instead.

Three properties worth insisting on:

1. **Stated once, in-world, at the start** — a minute from the Cabinet Secretary,
   or the Chief Whip's first note. Not a tutorial box and not a mission list.
2. **Achievable and not obviously right.** The player should be able to conclude
   the platform was wrong and abandon it — at a price (§9.2), and with the
   challenger watching.
3. **It is not the win condition.** The win condition is the settlement the
   Commonwealth arrives at (`05` §5.1), and the player is never told the list.
   They are told what they promised; what they discover is what it costs.

---

## 5. Pathways: how her record should shape the settlements

The connection to `05`. Her fixed past must not *block* any of the four
settlements — that would make the opening a menu of endings. It should make some
**cheaper and some dearer**, in ways the player can find out.

| a record like this | makes this cheaper | makes this dearer |
|---|---|---|
| voted twice to extend the sunset clause | restriction, and nobody is surprised | substrate neutrality — she is not trusted on it by the people who want it |
| took consortium money for a leadership campaign | the federal fudge, whose beneficiaries already like her | anything the licensing board must bless |
| held a ministry when a shed order went wrong | graduated personhood — she has seen the machinery and can defend it | anything that reads as leniency to the emulated poor |

Mechanically this is the existing loyalty and relationship values plus flags set
at `newGame` — it needs no new engine. What it needs is that the numbers in
`content/setup.js` are *the consequence of an authored past* rather than balance
choices, and that somewhere a document says why the Guild Bench chair starts at
the value she starts at.

---

## 6. The other two leaders

§3.4 wants two or three pregenerated leaders and calls it THIN. `05` §3 says a
campaign is nearly free in the engine and costs a chapter in prose, and this is
the cheapest version of that: **same world, same chamber, same opening crisis,
different past.**

A second leader is a different record, a different inherited platform, and
different opening relationships — perhaps two hundred lines of content, against a
whole chapter for a genuinely new campaign. Worth doing **after** the first is
finished, and worth designing for now by keeping every one of her facts in
`content/setup.js` and `content/characters.js` rather than baked into event prose.

**The one thing that would make this expensive is prose that assumes her past.**
An event that says "you have always taken the union's side" is unusable by the
second leader. An event that says "the union expects you to take their side, as
you did in the spring" reads the same and can be re-pointed. Write the second
kind.

---

## 7. Acceptance

Not tests, since this is a writing brief. What must be true before the narrative
pass is finished:

- Her seat agrees between `content/characters.js` and bible §11.2.
- Three to five recorded acts exist, each of which an opponent could read out,
  and each with a document in `content/minutes.js` or the register behind it.
- At least one inherited commitment has become impossible, and the game does not
  say so first.
- No event body states her feelings, and no choice label is a line she did not
  get to choose.
- The brief is stated once, in-world, in the first two sittings.
- Every fact about her lives in content, not in prose — checked by asking whether
  a second leader could be dropped in without rewriting an event body.
