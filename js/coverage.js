/* =============================================================
   COVERAGE

   Answers "what should I do next" from the content itself rather
   than from a fixed checklist.

   The failure mode it exists to catch: a game that only has events
   for crises, so competence is punished with silence. If every event
   fires when thermal margin is low and none fires when it is high,
   the player who manages well gets nothing to do.

   Findings are ordered by how much they hurt. Each one names a
   concrete next action, not a metric.
   ============================================================= */

const Coverage = (function () {
  "use strict";

  const TARGETS = {
    eventsPerChapter: 8,     // below this a chapter feels thin
    choicesPerEvent: 2,      // one choice is a notification, not an event
    minBodyChars: 240,       // shorter than this rarely carries a dilemma
    stationsReferenced: 0.6, // share of the roster events should touch
    partiesReferenced: 0.6
  };

  function analyse(M, Engine, C, st) {
    const F = [];
    const add = (sev, title, detail, action) => F.push({ sev, title, detail, action });

    /* ---------- chapters ---------- */
    const chapters = [...new Set([1].concat(M.events.map(e => e.chapter || 1)))].sort((a, b) => a - b);
    chapters.forEach(ch => {
      const inCh = M.events.filter(e => (e.chapter == null ? 1 : e.chapter) === ch);
      const pool = inCh.filter(e => !e.prologue && !e.queuedOnly);
      if (inCh.length < TARGETS.eventsPerChapter)
        add(pool.length < 3 ? 1 : 2, `Chapter ${ch} is thin`,
          `${inCh.length} events (${inCh.filter(e => e.prologue).length} prologue, ${pool.length} pool, ` +
          `${inCh.filter(e => e.queuedOnly).length} queued). A chapter needs roughly ` +
          `${TARGETS.eventsPerChapter} before it stops repeating.`,
          `Write ${TARGETS.eventsPerChapter - inCh.length} more events tagged chapter ${ch}.`);
      if (!inCh.some(e => e.prologue))
        add(1, `Chapter ${ch} has no opening`,
          "Nothing is tagged prologue, so the chapter starts on whatever the weighted pool throws up.",
          `Give one event chapter ${ch}, prologue 1.`);
    });

    /* ---------- the quiet-game problem ---------- */
    const gated = M.events.filter(e => e.when && (e.when.scalarBelow || e.when.scalarAbove));
    const crisisGated = M.events.filter(e => e.when && e.when.scalarBelow);
    if (M.events.length && crisisGated.length / M.events.length > 0.4)
      add(1, "Content clusters on crisis",
        `${crisisGated.length} of ${M.events.length} events fire only when an indicator is LOW. ` +
        "A player who manages well will find the game goes quiet, which reads as a bug.",
        "Write events gated on scalarAbove, or on no scalar at all — opportunities, not just fires.");
    if (M.events.length > 6 && !gated.length)
      add(3, "Nothing responds to the indicators",
        "No event gates on a scalar, so the six meters do not currently change what happens.",
        "Gate a few events on scalarBelow / scalarAbove so the numbers have consequences.");

    /* ---------- events ---------- */
    M.events.forEach(e => {
      if ((e.choices || []).length < TARGETS.choicesPerEvent)
        add(2, `"${e.title}" has one choice`,
          "If there is nothing to weigh, this is a notification rather than an event.",
          "Add a second choice with a different cost, or move it to the wire.");
      if ((e.body || "").length < TARGETS.minBodyChars)
        add(3, `"${e.title}" is very short`,
          `${(e.body || "").length} characters. Short events rarely give the player enough to decide on.`,
          "Expand it, or fold it into a neighbouring event.");
      (e.choices || []).forEach((c, i) => {
        if (!c.effects || ![].concat(c.effects).length)
          add(2, `"${e.title}" choice ${i + 1} does nothing`,
            "No effects, so the choice cannot matter.",
            "Give it an effect, even a small flag.");
      });
    });

    /* ---------- roster reach ---------- */
    const blob = M.events.map(e => [e.title, e.body,
      ...(e.choices || []).map(c => c.label + " " + (c.result || ""))].join(" ")).join(" ").toLowerCase();
    const effTargets = new Set();
    M.events.forEach(e => (e.choices || []).forEach(c =>
      [].concat(c.effects || []).forEach(f => {
        Object.keys(f.station || {}).forEach(k => effTargets.add(k));
        Object.keys(f.loyalty || {}).forEach(k => effTargets.add(k));
        Object.keys(f.capital || {}).forEach(k => effTargets.add(k));
      })));

    const coldStations = M.stations.filter(s =>
      !effTargets.has(s.id) && !blob.includes(s.name.toLowerCase()));
    if (coldStations.length / M.stations.length > (1 - TARGETS.stationsReferenced))
      add(2, `${coldStations.length} of ${M.stations.length} stations never appear`,
        "Untouched by any event, by name or by effect: " +
        coldStations.map(s => s.name).join(", ") + ". " +
        "The bible calls the district list the setting bible — every constituency should be an " +
        "event generator, not a flavour blurb.",
        "Write one event per cold station, keyed off its own grievance.");

    const coldParties = M.parties.filter(p =>
      !effTargets.has(p.id) && !blob.includes(p.name.toLowerCase()) &&
      !(p.aliases || []).some(a => blob.includes(a.toLowerCase())));
    if (coldParties.length)
      add(3, `${coldParties.length} parties never appear`,
        coldParties.map(p => p.name).join(", ") + ".",
        "Give each a moment, or accept them as background and note it.");

    /* ---------- bills ---------- */
    const unowned = M.bills.filter(b => !b.owner);
    if (M.bills.length && unowned.length / M.bills.length > 0.5)
      add(3, "Most bills have no owner",
        `${unowned.length} of ${M.bills.length}. An unowned bill generates no coalition capital when ` +
        "given order-paper time, so the slot mechanic has nothing to trade.",
        "Assign owners so partners have things they want.");
    const noDual = M.bills.filter(b => b.dualMajority).length;
    if (M.bills.length > 3 && noDual === 0)
      add(2, "No bill triggers the dual test",
        "The functional veto is the trap the campaign is built on and nothing currently touches it.",
        "Flag a life-support or charter bill as dualMajority.");

    /* ---------- glossary and legibility ---------- */
    const untaught = M.glossary.filter(g => !g.assumed && !g.introduced);
    if (untaught.length)
      add(2, `${untaught.length} glossary terms are never taught`,
        untaught.map(g => g.term).join(", ") + ".",
        "Set `introduced` on each, or mark it assumed.");
    const noHandle = M.glossary.filter(g => !g.assumed && !g.handle);
    if (noHandle.length)
      add(3, `${noHandle.length} terms have no familiar handle`,
        "The handle is the teaching device — the real-world shape the idea hangs on.",
        "Add a handle to: " + noHandle.map(g => g.term).join(", ") + ".");

    /* ---------- art ---------- */
    const noLogo = M.parties.filter(p => !p.logo).length;
    if (noLogo === M.parties.length)
      add(4, "No party has a logo",
        "Party marks fall back to a colour swatch, which is fine but plainer than it needs to be.",
        "Use Make from image… in the party form.");
    const noPortrait = M.characters.filter(c => !c.portrait).length;
    if (noPortrait > M.characters.length / 2)
      add(4, `${noPortrait} of ${M.characters.length} characters have no portrait`,
        "Speakers render without a face.",
        "Process portraits at 4:5, 160px, registry palette.");
    const noImage = M.events.filter(e => !e.image).length;
    if (M.events.length > 6 && noImage > M.events.length * 0.8)
      add(4, "Almost no events have a plate",
        `${noImage} of ${M.events.length}. Plates are optional and degrade cleanly, but they are ` +
        "where the split visual language actually shows.",
        "Add plates at 12:5, 640px, in the palette matching the source.");

    /* ---------- Concordance ---------- */
    const stubs = (M.encyclopedia.articles || []).filter(a => (a.banners || []).includes("stub"));
    if (stubs.length > 2)
      add(4, `${stubs.length} Concordance articles are stubs`,
        "Stubs are legitimate characterisation — nobody wanted to write it — but too many read as unfinished.",
        "Expand a few, or lean in and make the neglect deliberate.");

    F.sort((a, b) => a.sev - b.sev);
    return F;
  }

  /* A short verdict for the top of the panel. */
  function verdict(M, findings) {
    const blockers = findings.filter(f => f.sev === 1).length;
    const events = M.events.length;
    if (events < 12) return { state: "skeleton",
      line: `${events} events. Enough to prove the engine, not enough to play. ` +
            "The next milestone is roughly 25 — one chapter that holds together." };
    if (events < 30) return { state: "one chapter",
      line: `${events} events. A playtester can now finish a chapter. ` +
            "Show it to someone before writing chapter two." };
    if (blockers) return { state: "gaps",
      line: `${events} events with ${blockers} structural gaps. Fix those before adding more content.` };
    return { state: "building",
      line: `${events} events and no structural gaps. Keep writing, and playtest every twenty.` };
  }

  return { analyse, verdict, TARGETS };
})();
