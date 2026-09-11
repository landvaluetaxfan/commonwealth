/* THE GAME DREW, AND IT SURVIVES A SAVE.

   Loads index.html in a headless DOM, walks the main menu into a running
   game, and checks the things that have broken: a glossary term matched
   inside markup annotate() had already inserted and dumped raw attributes
   into the prose, and the save/load path was only ever exercised by hand.
   Static parsing finds neither.

   The other half - focus, tips, audio, streaming, the division - is in
   tools/uxtest.js. Both share tools/harness.js.                          */
const H = require("./harness.js");
const { fs, path, root, w, $, ok, CONTENT, JSDOM } = H;

H.banner("SHELL AND GAME SMOKE TEST");


H.boot(); ok("Shell.boot()", true);

ok("main menu is showing", $("#menu").classList.contains("on"));
ok("game shell is hidden", !$("#shell").classList.contains("on"));
ok("title renders", /WAYS|Ways/i.test($(".menu-title").textContent));
ok("Load is disabled with no saves", !!$('[data-go="load"]').disabled);

/* new game into slot 1 */
$('[data-go="new"]').click();
ok("slot list appears", w.document.querySelectorAll(".slot").length === 4);
$('[data-new="1"]').click();
ok("game starts", $("#shell").classList.contains("on") && !$("#menu").classList.contains("on"));
ok("slot is named in the topbar", /Test ministry/.test($("#tb-slot").textContent),
   JSON.stringify($("#tb-slot").textContent));

/* The chamber drew, and drew all 280. Counted by class rather than by
   element, so the furniture is excluded and the Speaker - who is lifted out
   of a bench and drawn in the Chair - cannot silently cost a seat. */
const seats = w.document.querySelectorAll("#chamber .sg").length;
ok("chamber renders every seat", seats === 280, seats + " seat glyphs");


/* GLOSSARY ANNOTATION — the regression that prompted this file.
   No attribute fragment may survive into visible text. */
const body = $("#sitting-body") ? $("#sitting-body").textContent : "";
ok("no markup leaks into the prose",
   !/data-(gloss|handle)=|class="gl"|<span/.test(body),
   body.length + " chars of prose");
const glossed = w.document.querySelectorAll("#sitting-body .gl").length;
ok("glossary terms are annotated", glossed > 0, glossed + " terms wrapped");

/* annotate() directly, on the case that broke: a gloss containing another term */
try {
  const out = w.eval('UI.annotate("A fork becomes an instance after the divergence threshold.")');
  const doc = new JSDOM("<div>" + out + "</div>").window.document.querySelector("div");
  ok("annotate output is well-formed",
     !/data-gloss|data-handle/.test(doc.textContent), JSON.stringify(doc.textContent));
} catch (e) { ok("annotate output is well-formed", false, e.message); }

/* SAVE ROUND-TRIP through a slot */
try {
  $("#tb-save").click();
  const raw = w.localStorage.getItem("wm.slot.1");
  const slot = JSON.parse(raw);
  ok("save writes to the slot", !!raw && slot.name === "Test ministry",
     "sitting " + slot.sitting);
  const before = w.eval("JSON.stringify(UI.state())");
  /* back to the menu the way a player does it: Options > Return to main menu */
  $("#tb-options").click();
  w.document.querySelector('#tb-optpanel [data-act="menu"]').click();
  ok("returns to the main menu", $("#menu").classList.contains("on") &&
     !$("#shell").classList.contains("on"));
  $('[data-go="load"]').click();
  $('[data-load="1"]').click();
  const after = w.eval("JSON.stringify(UI.state())");
  ok("slot reloads to the same state", before === after,
     before === after ? "" : "state differs after reload");
} catch (e) { ok("save round-trip", false, e.message); }

/* THE BILL LIFECYCLE TRACK. An assented act must show the road it took, not
   just its end state — and the terminal branch must be drawn off the end of
   the track rather than as a position on it. */
try {
  const stt = w.eval("UI.state()");
  stt.bills.anchor_kepler.stage = "assented";
  stt.bills.anchor_kepler.assentedAt = 3;
  /* Switching tabs only toggles visibility; the register is drawn in drawAll,
     so re-enter boot (which is re-entrant) to redraw against the new state. */
  w.eval("UI.boot(UI.state(), CONTENT)");
  w.document.querySelector('.tab[data-t="pap"]').click();

  const rows = [...w.document.querySelectorAll("#pp-list tbody tr")];
  const act = rows.find(r => /Ratification Act/.test(r.textContent));
  ok("the assented act is in the register", !!act, rows.length + " register rows");
  if (act) {
    act.click();
    const track = w.document.querySelector(".stagetrack");
    ok("the act document draws a stage track", !!track);
    if (track) {
      const steps = [...track.querySelectorAll("li")];
      const term  = track.querySelector("li.term");
      const order = w.eval("Engine.STAGE_ORDER.length");
      ok("the track mirrors STAGE_ORDER", steps.length === order + 1,
         `${steps.length} steps for ${order} stages plus a terminal`);
      ok("assent shows every stage cleared",
         steps.filter(l => l.classList.contains("done")).length === order,
         steps.filter(l => l.classList.contains("done")).length + " done");
      ok("the terminal state is a branch, marked in force",
         !!term && term.classList.contains("good") && /in force/i.test(term.textContent),
         term ? term.textContent.trim() : "no terminal");
    }
  }
  /* the letterhead must not leak an HTML entity as text */
  const doc = w.document.querySelector("#pp-doc, .paper");
  ok("no raw entities in the letterhead",
     !doc || !/&[a-z]+;/i.test(doc.textContent),
     (doc && (doc.textContent.match(/&[a-z]+;/i) || [""])[0]) || "clean");
} catch (e) { ok("bill lifecycle track", false, e.message); }

/* options panel */
try {
  $("#tb-options").click();
  const boxes = w.document.querySelectorAll("#tb-optpanel [data-opt]").length;
  /* seven: autosave, animations, confirm, explain, mute, room tone, type out */
  ok("options panel opens", $("#tb-optpanel").classList.contains("on") && boxes === 7,
     boxes + " toggles");
} catch (e) { ok("options panel opens", false, e.message); }

/* The orbit tab rendered nothing at all after a station was added: the chart
   read .band off a station the save did not have, threw, and left both panels
   empty. A blank tab throws no error the player can see, so check that each
   screen actually put something on the page. */
["#orbit-chart", "#orbit-table", "#station-detail", "#orbit-key"].forEach(sel =>
  ok("orbit renders " + sel, $(sel) && $(sel).innerHTML.length > 100,
     $(sel) ? $(sel).innerHTML.length + " chars" : "missing"));
ok("the chart draws every station",
   ($("#orbit-chart").querySelectorAll("[data-station]") || []).length === CONTENT.stations.length,
   $("#orbit-chart").querySelectorAll("[data-station]").length + " of " + CONTENT.stations.length);
/* A LAYOUT RULE MUST NOT UN-HIDE A SCREEN.

   Screens are hidden by .screen{display:none} and revealed by .screen.on.
   An id selector outranks both, so `#s-orb.screen{display:block}` - written
   to make the orbit screen a full-height column - put the habitat map on
   every tab at once, and nothing caught it because every screen still
   rendered its own content correctly. Checked as text: jsdom here loads the
   scripts, not the stylesheet. */
{
  const css = require("fs").readFileSync(__dirname + "/../css/terminal.css", "utf8");
  const bad = [];
  css.replace(/([^{}]*)\{([^}]*)\}/g, (all, sel, body) => {
    if (!/(^|;)\s*display\s*:/.test(body)) return all;
    sel.split(",").forEach(one => {
      /* only the SUBJECT of the selector matters: a rule on a descendant
         of a screen cannot reveal the screen. */
      const subject = one.trim().split(/[\s>+~]+/).pop() || "";
      if (/#s-[a-z]/.test(subject) && !/\.on\b/.test(subject)) bad.push(one.trim());
    });
    return all;
  });
  ok("no layout rule un-hides a screen", bad.length === 0, bad.join(" | "));
}

/* The Chair is a member of a party, not a piece of furniture. */
ok("exactly one seat carries the Chair",
   CONTENT.constituencies.filter(k => k.speaker).length === 1);
ok("every seat names a sitting member",
   CONTENT.constituencies.every(k => k.member && k.member.length > 2),
   CONTENT.constituencies.filter(k => !k.member).length + " without one");

ok("the station list lists every station",
   $("#orbit-table").querySelectorAll("tr[data-station]").length === CONTENT.stations.length);

/* A save written before a station existed must still open. This is the bug
   that produced the blank tab, reproduced through the real load path. */
{
  const stale = JSON.parse(w.eval("Engine.save(UI.state())"));
  const gone = CONTENT.stations[CONTENT.stations.length - 1].id;
  delete stale.stations[gone];
  let reloaded = null, threw = "";
  try { reloaded = w.eval("Engine.load(" + JSON.stringify(JSON.stringify(stale)) + ", CONTENT)"); }
  catch (e) { threw = e.message; }
  ok("a save missing a station still loads", !!reloaded, threw);
  ok("the missing station is restored", reloaded && !!reloaded.stations[gone]);
  ok("the repair is reported",
     (w.eval("(Engine.lastReconcile()||{}).stationsAdded") || []).length === 1);
  let len = 0;
  try { len = w.eval("OrbitChart.render(Engine.load(" + JSON.stringify(JSON.stringify(stale)) + ", CONTENT), CONTENT, null)").length; }
  catch (e) { len = 0; }
  ok("the chart still draws from that save", len > 1000, len + " chars");
}



H.finish("shell and game are healthy");
