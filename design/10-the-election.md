# 10 — THE ELECTION

*Dissolution, the campaign, Election Night, and the chamber you have to govern
with afterwards.*

The machinery works and **nothing calls it.** `generalElection()` is implemented,
tested against the bible's arithmetic, and reachable only through an `election`
effect no content uses. An election in the current build would resolve invisibly.

This is also, per `05`, the mechanism the settlements depend on — so it is
promoted from "a big screen we owe" to the structural centre of the second half.

---

## 1. Scope

**One general election, mid-game.** `sweep-brief.md` C.4 records the intent
directly: *"Treat it as a chapter transition with content around it, not a
recurring cycle."*

That single decision removes most of the cost. No campaign loop to balance, no
parliament counter, no repeated content. One election, authored around, in the
place where the game turns.

## 2. What is missing

Four things, in order of dependency.

### 2.1 A dissolution trigger

Three routes in, and they should all exist because which one you arrive by is
the first thing the campaign is about:

| route | from |
|---|---|
| the player asks for one | a Government-screen act, priced in whatever a gamble costs |
| the term expires | a sitting number in `content/setup.js` |
| confidence is lost | the existing loss path, redirected — §3.5's first loss condition becomes an election rather than an ending |

The third is the interesting one. Losing confidence currently ends the game.
Making it dissolve parliament instead turns the sharpest failure state into the
middle of the story, and costs one branch in `checkLoss()`.

### 2.2 The two remaining reserve powers

§3.3 gives the President four. Referral and appointment refusal are built.
**Dissolution and government formation are not**, and both bite here: the
President may refuse a dissolution the player asks for, and after the count the
President invites someone to form a government — which need not be the player,
even if the player has the largest party.

That is the moment the whole first half is judged, and it should be a scene, not
a calculation.

### 2.3 The campaign

Short and authored: a handful of sittings with a different verb set. Not a
simulation — §7.6 rules that out, and a campaign simulator would be a second
game.

What the player does: allocate substrate-hours (§4.11, the same currency as
lobbying in `07`), defend or attack seats, choose which of their record to run
on. What moves: swing, by station and by bloc, derived from `04` — the blocs you
have aggrieved are the seats you lose.

**Revenants need margins.** §4.5's best-loser resurrection cannot rank candidates
without them, so district races must record a margin. `sweep-brief.md` C.4 flags
this as a small addition that only makes sense once a campaign exists to hang it
on. It is also what makes a caucus "loyal and brittle" (`08` §2) countable.

### 2.4 Election Night

§12.5 is LOCKED and specifies it. It is the largest single interface build in the
project and it is entirely self-contained: state goes in, a night comes out.

The one engine requirement: **results must arrive over time, not at once.**
`generalElection()` currently returns everything in a single call — the code
comment says so. Declaring seat by seat, with the early results skewed by which
stations count fastest, is the difference between a scoreboard and a night. That
is a presentation layer over a resolved result, exactly as the division dialog is
(`js/wait.js`, and the proof that a division resolves before its dialog opens).

Resolve first, reveal slowly, and let it be skippable. The same discipline, for
the same reason.

## 3. The electorate changes

**This is the mechanism, and it is nothing but state.**

Whatever the player conceded before the election determines the chamber after it:

- **franchise** — who may vote at all. Part XVI has three open questions here
  (§4.13 weighting, where emulations vote, and §4.15 redistricting) and each is a
  genuine constitutional fork.
- **apportionment** — §4.7 already separates apportionment population from voting
  population; §4.10 calls the method itself plot.
- **the tier ratio** — §4.4 locks it as amendable.
- **the roll** — defections, by-elections and vacancies since the last count.

`generalElection()` reads all of this already. The work is not in the election;
it is in making sure the first half can *change* these, and that the player is
never told which settlements they have just closed off.

The apportionment trap is the point: **reform requires the consent of the people
who lose by it.** A 64% biological majority voting on whether to widen the
franchise is the most reliably tragic structure in constitutional politics, it is
already in the numbers, and it needs no new mechanic to bite.

## 4. After the count

The chamber is new, the coalition may not exist, and the settlements still
reachable (`05` §5.1) are now a subset. Three consequences the engine must
handle and mostly already can:

- `Engine.reconcile()` runs on load and backfills from content; it must also
  survive a wholesale change of chamber composition, which is the same code path
  and should be asserted against it.
- Coalition formation is a scene, not a solver: the President invites, the player
  negotiates, `{coalition: {add: […]}}` records it.
- Capital survives. §7.6: nothing decays and nothing is forgiven. A partner you
  overdrew on before the election remembers after it, and that is one of the
  better arguments for the ledger being permanent.

## 5. Acceptance

- All three dissolution routes reach the same resolved state from the same
  starting position.
- Losing confidence dissolves rather than ending, and the old ending is reachable
  only through the other loss conditions.
- The President can refuse a dissolution, and can invite someone other than the
  player to form a government.
- A general election run three ways — watched, skipped, and headless — produces
  **byte-identical** `Engine.save()` output. Same proof as the division dialog,
  same reason.
- Margins are recorded for every district race, and best-loser ranking is
  reproducible from them.
- Changing the franchise before the election changes the composition after it,
  asserted by running the same election twice from states differing only in
  `law`.
- `Engine.settlement()` (`05` §8) returns a different answer across those two
  runs — which is the assertion that the whole second half of the game works.
