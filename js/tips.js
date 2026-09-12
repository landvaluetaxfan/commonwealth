/* =============================================================
   TIPS — what the abbreviations mean.

   THE PROBLEM: every screen in this game is dense with tokens that
   carry a real rule and explain nothing. LOY. DUAL. A ledger reading
   +2. "committee". "prayable 4". 128 / 240 · need 121. A player who
   does not already know the system is reading a spreadsheet in a
   language nobody taught them, and the glossary does not help because
   it annotates WORDS IN THE FICTION and these are not that.

   THE DIVISION OF LABOUR, which is the only interesting decision here:

     the Concordance and the glossary explain THE WORLD. They are
     content, they are in-world, and they are written by whoever writes
     the fiction. This file explains THE TERMINAL - what a column is,
     what a number does, which rule reads it - and that text has to
     match the engine exactly, so it lives beside the code that must
     stay in step with it and not in content/.

     Where the world already has the answer, this file DEFERS: an entry
     with no body of its own falls through to the glossary, and then to
     the Concordance article of the same id. Nothing here restates
     canon, and nothing here invents any (bible 2.7 - the glossary is a
     frozen list and this file adds nothing to it).

   THE CONCORDANCE IS NOT ANNOTATED, AND THAT IS THE POINT. It is
   deliberately not government chrome - serif, white paper, generous
   leading, something civilians made - and putting terminal tooltips
   inside it would collapse a separation the whole screen is built on.
   It is also the place tips send you, so annotating it would be the
   terminal explaining the thing it just referred you to. tools/uxtest.js
   asserts that every OTHER screen carries annotations and that this one
   carries none.

   NEVER A NATIVE title="". A native tooltip is slow, unstyled,
   invisible to a keyboard, and cannot say two things at once.

   NO SOUND. Tips are triggered by a pointer moving, which is not a
   decision, and a terminal that chirps whenever the mouse crosses a
   table header is a terminal you turn off.
   ============================================================= */
const Tips = (function () {
  "use strict";

  const HOVER_DELAY = 320;   /* long enough not to flash on the way past */

  /* body: the terminal's own explanation.
     go:   a Concordance article to name, when the world has more to say.
     Entries with no body fall through to the glossary and the Concordance. */
  const TIPS = {
    /* ---- the status bar, left to right ---- */
    state: { title: "Government status",
      body: "READY while you hold office. A government falls when confidence " +
            "drops below the majority, or when the House carries a motion of no " +
            "confidence. There is no undo." },
    chapter: { title: "Chapter",
      body: "The act of the story you are in. Chapters gate which events can " +
            "fire; they do not advance on a timer." },
    slots: { title: "Order paper time",
      body: "Sittings of debating time left this session. Granting one to a " +
            "partner's bill advances that bill a stage and puts them in your " +
            "debt; granting one to your own advances nothing but your programme. " +
            "They do not refill until the session does." },
    signatures: { title: "Signatures",
      body: "Names Czarnecki has collected toward the nine he needs to force a " +
            "leadership ballot. Your own conduct feeds this counter - packing a " +
            "licensing board is worth two names, packing a second is worth three." },
    confidence: { title: "Confidence",
      body: "Seats held by your coalition plus those supplying confidence, " +
            "against the whole chamber of 280. This is what keeps you in office, " +
            "and it is not the same as the votes for any particular bill." },
    margin: { title: "Margin",
      body: "Confidence minus the majority of 141. At zero you govern on the " +
            "exact number: one defection and the arithmetic stops working." },

    /* ---- the chamber ---- */
    seats: { title: "Seats",
      body: "280 in all: 140 elected in districts, 100 allocated from party " +
            "lists, and 40 returned by functional constituencies. The tiers are " +
            "parallel and do not compensate each other." },
    loyalty: { title: "Loyalty",
      body: "How much of what a party says it will deliver actually turns up. " +
            "Discipline runs from 75% at nought to 100% at a hundred, so a party " +
            "at 40 delivers 85 of every 100 seats it has promised. The gap is " +
            "what the whip exists to buy back.", go: "parliament" },
    mps: { title: "Members",
      body: "Members of your own party in this current. Currents are factions " +
            "with their own loyalty; they are counted inside the party's seats, " +
            "not beside them." },
    popular: { title: "The popular benches",
      body: "The 240 members returned by district and list together. A bill " +
            "needs a simple majority of them." },
    functional: { title: "The functional benches", go: "functional_constituency" },
    dual: { title: "Dual majority", go: "dual_majority" },
    simple: { title: "Simple majority",
      body: "Carried on the popular benches alone. The functional forty vote, " +
            "and their votes are counted in the same total rather than tested " +
            "separately." },
    stage: { title: "Stage",
      body: "Drafting, first reading, second reading, committee, report, third " +
            "reading, upper house, assent. A bill divides at third reading. " +
            "Order paper time is what moves it along, one stage at a time." },
    whip: { title: "The whip",
      body: "Committing members costs capital with a partner and loyalty with " +
            "your own party, at a rate set by how far the bill sits from that " +
            "party's position. Nothing is charged until you divide, so a plan " +
            "can be revised or cleared." },

    district: { title: "District seats",
      body: "140 seats, first past the post, one constituency at a time. The " +
            "roll of who holds each one is the only record there is: totals are " +
            "counted from it and never stored beside it." },
    list: { title: "List seats",
      body: "100 seats allocated from closed party lists by D'Hondt, above a 4% " +
            "national threshold. A party under the threshold keeps its list " +
            "seats if it won a district, or if it speaks for one station or one " +
            "category of legal person. The divisor and the threshold are both " +
            "laws, so a bill can change them - and changing them changes who is " +
            "in the room.", go: "parliament" },
    government: { title: "The government benches",
      body: "Seats held by the parties in your coalition. Confidence and supply " +
            "sits opposite and counts toward confidence anyway." },
    opposition: { title: "The opposition benches",
      body: "Everyone not in the coalition. They are not one bloc and do not " +
            "vote as one." },
    majority: { title: "Majority",
      body: "141 of 280. Half the chamber plus one, recomputed rather than " +
            "stored, so it follows the chamber if the chamber ever changes size." },
    speaker: { title: "The Chair",
      body: "Elected from among the members and still counted in their party's " +
            "total. They hold a seat; they simply do not use it the way the " +
            "others do." },
    benches: { title: "Facing benches",
      body: "Drawn as two facing sides rather than a hemicycle, because " +
            "confidence is binary and the whip next door moves whole benches " +
            "across a floor. A semicircle would read the chamber as a spectrum." },

    /* ---- the functional tier ---- */
    franchise: { title: "Franchise",
      body: "How a functional constituency's electors are enrolled: by trade " +
            "licence, by company, by union bloc, or residually. The residual " +
            "constituency is everyone in no recognised sector and returns one " +
            "seat.", go: "functional_constituency" },
    electors: { title: "Electorate",
      body: "Enrolled electors, not population. The functional roll and the " +
            "district roll count different people, which is the whole quarrel." },

    /* ---- the orbit ---- */
    schematic: { title: "The habitat schematic",
      body: "A stratification chart before it is a map: vertical position is " +
            "altitude band, glyph shape is what kind of habitat it physically " +
            "is, glyph size is population, fill tint is closure, and the tick " +
            "beneath is the leading party. Orbits are dynamic and in three " +
            "dimensions, so literal geography would be unreadable." },
    form: { title: "Habitat form",
      body: "What the station physically is - a ring, a cylinder, a bundled " +
            "cluster of settlements. It decides nothing mechanically and " +
            "explains a great deal about who lives there." },

    wire: { title: "The wire",
      body: "Headlines, newest first. A wire item is pushed by an effect, so " +
            "everything here is a consequence of something you did rather " +
            "than weather." },

    /* ---- papers and the record ---- */
    register: { title: "The register",
      body: "Acts, orders and minutes, in the order they were done. An act " +
            "here has been through a division and cannot be undone; an order " +
            "can still be revoked." },
    minute: { title: "Minute",
      body: "An instruction from this office, signed and served. It is not " +
            "law and it binds nobody outside the building, which is " +
            "occasionally the point." },
    log: { title: "The record",
      body: "Every decision this government has taken, newest first. It is " +
            "written by the engine and never by a renderer, so it says what " +
            "happened rather than what was shown." },

    /* ---- the coalition ---- */
    ledger: { title: "Capital",
      body: "A signed account with each partner. Positive means they owe you; " +
            "negative means you owe them. Nothing here decays and nothing is " +
            "forgiven. Overdrawing it costs their loyalty at twice the rate." },
    gov: { title: "In government",
      body: "This party holds ministries and is bound by collective " +
            "responsibility." },
    cs: { title: "Confidence and supply",
      body: "Not in government, and counted toward confidence anyway. They vote " +
            "for the budget and against anything else they like." },
    senior: { title: "Senior post",
      body: "Life Support is the senior ministry and the one that ends careers - " +
            "the only ministry whose minister can be summoned by the engineering " +
            "authority rather than the reverse." },
    vacant: { title: "Vacant",
      body: "Nobody holds this post, and a vacant post cannot make an " +
            "instrument. The President's power to refuse an appointment and the " +
            "fight over the licensing boards are therefore the same fight.",
      go: "cabinet" },
    live: { title: "Reserve power",
      body: "Held by the President and available now. Dissolution, formation, " +
            "referral and appointments are constitutional powers, not political " +
            "ones: they do not need the House's agreement.", go: "perigee_charter" },

    /* ---- instruments ---- */
    instrument: { title: "Statutory instrument",
      body: "An order signed rather than voted. It needs no majority and is in " +
            "force the moment it is made - and it can be revoked, which a bill " +
            "cannot." },
    prayer: { title: "Praying against",
      body: "The House's only recourse against an order already in force, and it " +
            "expires. The number is the sittings remaining; after that the order " +
            "stands permanently." },
    priority: { title: "Priority bill",
      body: "Its owner values the time more, so granting it a slot is worth an " +
            "extra point of capital." },

    /* ---- indicators and scarcity ---- */
    party_loyalty: { title: "Party loyalty",
      body: "Your own party's discipline, distinct from the currents inside it. " +
            "Whipping your own members is paid for out of this." },
    public_standing: { title: "Public standing",
      body: "How the government reads outside the chamber. It does not vote, and " +
            "it decides what the wire prints." },
    consumables: { title: "Consumables",
      body: "Food, water and the rest of what a habitat eats. Low is not an " +
            "abstraction: it is stations going short." },
    thermal_margin: { title: "Thermal margin",
      body: "Waste heat headroom across the ring. Everything a habitat does ends " +
            "as heat and heat is the hardest thing to get rid of in vacuum. This " +
            "is the number that kills people.", go: "the_permanent_emergency" },
    treasury: { title: "Treasury",
      body: "What the government can spend without asking the House for more." },
    scarcity: { title: "Scarcity index",
      body: "100 at the opening of the series. Every one of these four is set by " +
            "legislation rather than by a market - a thermal appropriation moves " +
            "the quota price, and the quota price decides whether a poor station " +
            "can afford to keep its people running." },

    /* ---- the orbit ---- */
    ratio: { title: "Apportionment ratio",
      body: "Electors per seat against the Commonwealth average. Above one is " +
            "under-represented; below one is over-represented. It is derived " +
            "from the roll and never stored." },
    held: { title: "Held by",
      body: "The party returning this seat now. District seats are the roll and " +
            "the roll is the only record of who holds what." },
    band: { title: "Altitude band",
      body: "Higher orbit is different politics. The chart is a stratification " +
            "diagram before it is a map, which is the argument it is making." },
    closure: { title: "Closure" }   /* the glossary has this one */
  };

  let card = null, anchor = null, timer = null, wired = false, explaining = false;

  function opt() {
    if (typeof Shell === "undefined" || !Shell.opt) return true;
    const v = Shell.opt("tips");
    return v === undefined ? true : v;
  }

  /* THE FALLTHROUGH. Terminal first, then the world's own words. */
  function find(key) {
    const t = TIPS[key] || {};
    let body = t.body, title = t.title, go = t.go || null;
    const C = typeof CONTENT !== "undefined" ? CONTENT : null;

    if (!body && C && C.glossaryByTerm) {
      const g = C.glossaryByTerm[(key || "").replace(/_/g, " ")];
      if (g) { body = g.gloss; title = title || g.term; }
    }
    if (!body && C && C.encyclopediaById && C.encyclopediaById[key]) {
      const a = C.encyclopediaById[key];
      body = String(a.summary || "").replace(/<[^>]*>/g, "");
      title = title || a.title;
      go = go || key;
    }
    if (!body && go && C && C.encyclopediaById && C.encyclopediaById[go]) {
      body = String(C.encyclopediaById[go].summary || "").replace(/<[^>]*>/g, "");
      title = title || C.encyclopediaById[go].title;
    }
    if (!body) return null;
    return { title: title || key, body: body, go: go };
  }

  function build() {
    if (card) return card;
    card = document.createElement("div");
    card.id = "tipcard";
    card.setAttribute("role", "tooltip");
    /* Deliberately not focusable and not clickable. A tooltip you can tab
       into is a trap; the Concordance tab is where you go to read more. */
    card.hidden = true;
    document.body.appendChild(card);
    return card;
  }

  function parseMembers(s) {
    if (!s) return null;
    try { const a = JSON.parse(s); return Array.isArray(a) && a.length ? a : null; }
    catch (e) { return null; }
  }

  /* A tabled list of the people a data-driven card names: the party mark and
     short name in one column, the member in the other. */
  function membersTable(list) {
    if (!list || !list.length) return "";
    const C = typeof CONTENT !== "undefined" ? CONTENT : null;
    const rows = list.map(m => {
      const p = C && C.partyById ? C.partyById[m.p] : null;
      const sw = p ? '<i class="swatch" style="background:' + esc(p.colour) + '"></i>' : "";
      const off = m.o ? ' <i class="office">' + esc(m.o) + "</i>" : "";
      return "<tr><td>" + esc(m.r || "") + "</td><td>" + sw +
             esc(p ? p.short : (m.p || "")) + "</td><td>" + esc(m.n) + off + "</td></tr>";
    }).join("");
    return '<table class="tipmem"><tbody>' + rows + '</tbody></table>';
  }

  function show(el) {
    /* An element may carry its own one-off body, for content that is data
       rather than a fixed token — a functional constituency's roll, seats and
       members, say. The keyed map stays the fallback. */
    const inline = el.getAttribute("data-tip-body");
    const t = inline
      ? { title: el.getAttribute("data-tip-title") || "", body: inline,
          go: el.getAttribute("data-tip-go") || null,
          members: parseMembers(el.getAttribute("data-tip-members")) }
      : find(el.getAttribute("data-tip"));
    if (!t) return;
    const c = build();
    c.innerHTML =
      '<b>' + esc(t.title) + '</b>' +
      '<span>' + esc(t.body) + '</span>' +
      (t.go && typeof CONTENT !== "undefined" && CONTENT.encyclopediaById &&
       CONTENT.encyclopediaById[t.go]
        ? '<i>Concordance · ' + esc(CONTENT.encyclopediaById[t.go].title) + '</i>'
        : '') +
      membersTable(t.members);
    /* A member table carries a full office title in its last column, so the
       card is allowed to run wider than a one-line explanation needs. The
       cap only lifts; a short card still sizes to its content. */
    c.classList.toggle("wide", !!t.members);
    c.hidden = false;
    anchor = el;
    el.setAttribute("aria-describedby", "tipcard");
    place(el, c);
  }

  /* Below and left-aligned, flipped or pulled back when that would put it
     off the screen. No library, no arrow: an arrow on a 200px card in a
     16px-tall row points at four things at once. */
  function place(el, c) {
    const r = el.getBoundingClientRect();
    const w = c.offsetWidth, h = c.offsetHeight;
    const vw = window.innerWidth, vh = window.innerHeight;
    let x = r.left, y = r.bottom + 4;
    if (y + h > vh - 4) y = Math.max(4, r.top - h - 4);
    if (x + w > vw - 4) x = Math.max(4, vw - w - 4);
    c.style.left = Math.round(x) + "px";
    c.style.top = Math.round(y) + "px";
  }

  function hide() {
    clearTimeout(timer);
    if (anchor) anchor.removeAttribute("aria-describedby");
    anchor = null;
    if (card) card.hidden = true;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ---------- explain mode ----------

     A tip only a mouse can reach is not an explanation, it is a reward
     for owning a mouse. But a table header that is permanently in the tab
     order is fifty new tab stops between the player and the button they
     wanted, so the readouts cannot simply be focusable all the time.

     Pressing ? puts them in the tab order and takes them out again. It is
     a mode, it is announced in the options panel, and Escape leaves it.
     Never a positive tabindex - 0 means "in document order", which is
     exactly where a column heading belongs. */
  function marks() {
    const screen = document.querySelector(".screen.on") || document;
    return [].slice.call(screen.querySelectorAll("[data-tip]"))
      .concat([].slice.call(document.querySelectorAll("#statusbar [data-tip]")));
  }
  function explain(on) {
    if (typeof document === "undefined") return;
    explaining = !!on;
    document.body.classList.toggle("explaining", explaining);
    marks().forEach(n => {
      if (explaining) n.setAttribute("tabindex", "0");
      else n.removeAttribute("tabindex");
    });
    if (!explaining) hide();
  }
  /* Called after a redraw, which has just replaced every annotated node
     with a fresh one that has no tabindex on it. */
  function remark() { if (explaining) explain(true); }

  function wire() {
    if (wired || typeof document === "undefined") return;
    wired = true;

    document.addEventListener("pointerover", e => {
      if (!opt()) return;
      const el = e.target.closest && e.target.closest("[data-tip]");
      if (!el || el === anchor) return;
      hide();
      /* A DELAY ON HOVER AND NONE ON FOCUS. A pointer crosses six table
         headers on the way to a button and meant none of them; a keyboard
         has already committed to the thing it is on. */
      timer = setTimeout(() => show(el), HOVER_DELAY);
    });
    document.addEventListener("pointerout", e => {
      const el = e.target.closest && e.target.closest("[data-tip]");
      if (el && el === anchor) hide();
      else if (el) clearTimeout(timer);
    });
    document.addEventListener("focusin", e => {
      if (!opt()) return;
      const el = e.target.closest && e.target.closest("[data-tip]");
      hide();
      if (el) show(el);
    });
    document.addEventListener("focusout", hide);
    /* Anything that moves the page or commits an action takes the card
       with it: it is positioned in viewport coordinates and would
       otherwise be left pointing at nothing. */
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") { if (explaining) explain(false); else hide(); return; }
      /* not while typing into the Concordance search box */
      if (e.key === "?" && !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || "")) {
        e.preventDefault();
        explain(!explaining);
      }
    });
    document.addEventListener("pointerdown", hide, true);
    window.addEventListener("scroll", hide, true);
  }

  return { wire, hide, find, explain, remark,
           explaining: () => explaining,
           keys: () => Object.keys(TIPS) };
})();
