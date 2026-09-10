/* =============================================================
   PAPERS — the register.

   Government is where you DECIDE: order paper, forecasts, the whip,
   the ledger. Papers is where you READ what you did. Splitting them
   this way keeps the whip panel next to the ledger it spends, which
   §12.1 requires, while giving the in-world artifacts a surface of
   their own.

   §12.2's split visual language lives here. The terminal chrome is
   government-issue plain; a signed act is beautiful, because a state
   printing office has a two-hundred-year-old house style.

   THE VISUAL ASYMMETRY IS THE TEACHING DEVICE. An act that needed
   more than a simple majority gets the signature drawn, once, and
   cannot be undone. An instrument gets a made stamp: dated, numbered,
   no ceremony — and it can be revoked. The player learns which acts
   are permanent by which ones are ceremonious.
   ============================================================= */

const Papers = (function () {
  "use strict";

  let st, C, drawn = {}, onChange = null;

  /* THE REGISTER'S SELECTION LIVES IN Focus, not here. It used to be a
     closure variable, which worked and was also the third of four
     different places the game kept "which row is chosen" - see the
     header of js/focus.js. One store, so a re-render can put the player
     back where they were. */
  Focus.region("pp-list", {
    rows: "tr[data-doc]",
    key: tr => tr.dataset.doc,
    activate: () => render(st, C)
  });
  const chosen = () => Focus.selected("pp-list");

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- what is in the register ---------- */

  function items() {
    const out = [];

    C.bills.forEach(b => {
      const bs = st.bills[b.id];
      if (["assented", "struck", "referred", "awaiting_assent", "defeated"].includes(bs.stage))
        out.push({
          kind: "act", id: "act_" + b.id, bill: b, state: bs,
          title: b.title.replace(/ Bill$/, " Act"),
          ref: b.ref, at: bs.assentedAt || bs.carriedAt || 0,
          status: bs.stage
        });
    });

    (C.instruments || []).forEach(si => {
      const s = st.instruments[si.id];
      if (!s.made) return;
      out.push({
        kind: "instrument", id: si.id, si: si, state: s,
        title: si.title, ref: si.number, at: s.madeAt || 0,
        status: s.revoked ? "revoked" : s.inForce ? "in force" : "made"
      });
    });

    (C.minutes || []).forEach(m => {
      if (m.when && !Engine.matches(st, m.when)) return;
      out.push({ kind: "minute", id: m.id, minute: m, title: m.subject,
                 ref: m.file, at: m.sitting || 0, status: "minute" });
    });

    return out.sort((a, b) => b.at - a.at);
  }

  /* ---------- documents ---------- */

  const crest = `<svg class="crest" width="46" height="52" viewBox="0 0 46 52" aria-hidden="true">
    <circle cx="23" cy="23" r="12" fill="none" stroke="#17140e" stroke-width="1.2"/>
    <ellipse cx="23" cy="23" rx="21" ry="8" fill="none" stroke="#17140e" stroke-width="1.2"/>
    <ellipse cx="23" cy="23" rx="21" ry="8" fill="none" stroke="#17140e" stroke-width="1.2" transform="rotate(58 23 23)"/>
    <circle cx="23" cy="23" r="3.4" fill="#17140e"/>
    <path d="M6 45 h34" stroke="#17140e" stroke-width="1.2"/>
    <path d="M9 49 h28" stroke="#17140e" stroke-width="0.8"/></svg>`;

  function head(office, sub, file, right) {
    return `<div class="letterhead">${crest}<div class="lh-txt">
        <h3>${esc(office)}</h3><p>${esc(sub)}</p></div></div>
      <div class="filebar"><span>${esc(file)}</span>
        <span>SESSION ${st.session} &middot; SITTING ${st.sitting}</span>
        <span>${esc(right)}</span></div>`;
  }

  /* The Prime Minister's hand. ONE continuous path (the breve over the capital
     is a final subpath) because the ceremony draws it with a single
     stroke-dashoffset sweep — css/terminal.css .sig-armed/.sig-draw, bible 12.10.
     Length is measured at run time with getTotalLength(), so the path can be
     redrawn freely; the only constraint is that it stays a single <path>.
     NOTE: these are space-separated coordinate pairs. If you re-wrap this
     string, keep the spaces at the line joins or the numbers fuse. */
  const SIG_PATH =
    "M5.6 42.0C6.9 39.8,10.7 33.3,13.2 29.0C15.7 24.7,18.4 19.7,20.8 16.0C23.2 12.3,25.9 " +
    "8.0,27.6 7.0C29.3 6.0,30.8 7.5,31.0 10.0C31.2 12.5,29.5 18.3,28.6 22.0C27.7 25.7,26.5 " +
    "29.0,25.6 32.0C24.7 35.0,23.0 38.2,23.0 40.0C23.0 41.8,24.2 43.2,25.4 43.0C26.6 42.8,28.4 " +
    "40.7,30.2 39.0C32.0 37.3,34.4 34.5,36.4 33.0C38.4 31.5,40.7 29.7,42.0 30.0C43.3 30.3,44.3 " +
    "33.3,44.0 35.0C43.7 36.7,41.2 39.7,40.0 40.0C38.8 40.3,36.0 38.2,36.6 37.0C37.2 35.8,41.5 " +
    "34.2,43.4 33.0C45.3 31.8,46.9 29.5,48.0 30.0C49.1 30.5,48.8 36.0,49.8 36.0C50.8 36.0,52.7 " +
    "30.5,54.0 30.0C55.3 29.5,56.7 31.7,57.4 33.0C58.1 34.3,59.0 36.7,58.4 38.0C57.8 39.3,54.9 " +
    "41.2,53.8 41.0C52.7 40.8,51.0 37.5,51.6 37.0C52.2 36.5,55.7 39.0,57.4 38.0C59.1 37.0,60.8 " +
    "31.2,61.8 31.0C62.8 30.8,62.5 36.7,63.6 37.0C64.7 37.3,67.4 32.8,68.4 33.0C69.4 33.2,69.8 " +
    "36.7,69.4 38.0C69.0 39.3,65.6 41.2,65.8 41.0C66.0 40.8,68.4 38.0,70.6 37.0C72.8 36.0,76.2 " +
    "35.8,79.0 35.0C81.8 34.2,84.7 33.0,87.6 32.0C90.5 31.0,93.0 31.0,96.2 29.0C99.4 27.0,103.5 " +
    "23.2,107.0 20.0C110.5 16.8,114.3 12.5,117.0 10.0C119.7 7.5,121.9 4.5,123.0 5.0C124.1 " +
    "5.5,124.1 9.5,123.4 13.0C122.7 16.5,120.0 22.3,118.8 26.0C117.6 29.7,116.3 32.7,116.0 " +
    "35.0C115.7 37.3,115.9 39.8,117.0 40.0C118.1 40.2,120.7 37.3,122.8 36.0C124.9 34.7,127.4 " +
    "33.7,129.6 32.0C131.8 30.3,134.1 28.0,135.8 26.0C137.5 24.0,140.0 19.2,140.0 20.0C140.0 " +
    "20.8,136.9 27.8,135.8 31.0C134.7 34.2,132.9 38.2,133.2 39.0C133.5 39.8,136.5 36.0,137.8 " +
    "36.0C139.1 36.0,141.4 38.0,141.2 39.0C141.0 40.0,137.7 42.2,136.6 42.0C135.5 41.8,133.5 " +
    "39.3,134.4 38.0C135.3 36.7,140.1 35.2,142.2 34.0C144.3 32.8,146.7 30.7,146.8 31.0C146.9 " +
    "31.3,142.9 34.7,142.8 36.0C142.7 37.3,144.6 39.3,146.2 39.0C147.8 38.7,150.6 36.3,152.2 " +
    "34.0C153.8 31.7,155.3 25.0,156.0 25.0C156.7 25.0,156.0 31.7,156.2 34.0C156.4 36.3,156.1 " +
    "38.0,157.2 39.0C158.3 40.0,160.7 39.7,163.0 40.0C165.3 40.3,167.9 41.2,170.8 41.0C173.7 " +
    "40.8,176.2 39.8,180.2 39.0C184.2 38.2,190.1 36.8,194.8 36.0C199.5 35.2,204.3 34.5,208.2 " +
    "34.0C212.1 33.5,215.2 33.3,218.4 33.0C221.6 32.7,226.1 32.2,227.6 32.0 M113.0 5.0C114.3 " +
    "4.3,118.3 1.7,120.8 1.0C123.3 0.3,125.6 0.3,127.8 1.0C130.0 1.7,133.0 4.3,134.0 5.0";

  /* WHERE A BILL GOES. The register used to show the end state and nothing
     else, so "assented" arrived without the road that led to it and an act in
     force looked the same as one that had merely survived a division.

     The track is the engine's own STAGE_ORDER, not a copy: if a stage is added
     there this renders it without being touched. Terminal states are not
     positions on the track — struck, referred, defeated and withdrawn are ways
     of leaving it — so they are drawn as a branch off the end. */
  const STAGE_LABEL = {
    drafting:"Drafting", first_reading:"First reading", second_reading:"Second reading",
    committee:"Committee", report:"Report", third_reading:"Third reading",
    upper_house:"Upper house", assent:"Assent", blocked:"Blocked"
  };
  const TERMINAL = {
    struck:    { label:"Struck on review", cls:"bad",  note:"Removed from the statute book. It cannot be revived; it must be brought again as a new bill." },
    defeated:  { label:"Defeated",         cls:"bad",  note:"Lost on division. The slot is spent." },
    withdrawn: { label:"Withdrawn",        cls:"bad",  note:"Pulled before division." },
    referred:  { label:"Referred",         cls:"warn", note:"With the constitutional court. It returns, struck or intact." },
    assented:  { label:"In force",         cls:"good", note:"Law. Its effects are live and stay live until amended or repealed by another act." }
  };

  function stageTrack(b, bs) {
    const order = (typeof Engine !== "undefined" && Engine.STAGE_ORDER) || [];
    const term = TERMINAL[bs.stage];
    /* How far it got: an assented act cleared the whole track. */
    const reached = bs.stage === "assented" ? order.length
                  : bs.stage === "awaiting_assent" ? order.indexOf("assent")
                  : order.indexOf(bs.stage) >= 0 ? order.indexOf(bs.stage)
                  : order.length - 1;

    const steps = order.map((sg, i) => {
      const state = i < reached ? "done" : i === reached ? "here" : "todo";
      return `<li class="${state}"><i></i><span>${STAGE_LABEL[sg] || sg}` +
             `${sg === Engine.DIVIDES_AT ? '<em>division</em>' : ""}</span></li>`;
    }).join("");

    return `<div class="track">
        <ol class="stagetrack">${steps}
          ${term ? `<li class="term ${term.cls}"><i></i><span>${term.label}</span></li>` : ""}
        </ol>
        ${term ? `<div class="trknote ${term.cls}">${term.note}</div>` : ""}
        ${bs.stage === "assented" && bs.assentedAt != null
          ? `<div class="trknote">Assented at sitting ${bs.assentedAt}. It sits in this register
             permanently; the Concordance carries what it changed.</div>` : ""}
      </div>`;
  }

  function actDoc(it) {
    const b = it.bill, bs = it.state;
    const assented = bs.stage === "assented";
    const struck = bs.stage === "struck";
    const referred = bs.stage === "referred";
    const pm = C.characterById[st.pm];

    let banner = "";
    if (referred) banner = `<div class="classif">Referred for constitutional review &mdash; ` +
      `returns sitting ${bs.returnsAt}</div>`;
    else if (struck) banner = `<div class="classif">Struck on review</div>`;
    else if (bs.stage === "defeated") banner = `<div class="classif">Defeated on division</div>`;
    else if (assented) banner = `<div class="classif" style="border-color:#3d5c33;color:#3d5c33">` +
      `Assented &mdash; in force</div>`;

    const body = `<h5>${esc(b.title)}</h5>
      <p>${esc(b.summary)}</p>
      ${b.effectNote ? `<p><i>${esc(b.effectNote)}</i></p>` : ""}
      <p>Test on division: <b>${b.dualMajority ? "dual majority" : "simple majority"}</b>.
      ${b.dualMajority ? "A measure touching life-support integrity or amending the Charter must " +
        "carry separately among functional and elected members." : ""}</p>`;

    /* The ceremony. Reserved for acts that needed more than a simple majority,
       drawn once, never repeated. */
    const ceremonial = assented && b.dualMajority;
    const already = drawn[it.id];
    const sig = ceremonial ? `<div class="sigblock">
        <div class="sigline"><div class="rule">
          <svg id="sigsvg" width="228" height="52" viewBox="0 0 228 52" aria-hidden="true">
            <path id="sigpath" d="${SIG_PATH}"/></svg></div>
          <div class="cap">${esc(pm ? pm.name.replace(/^Rt\. Hon\. /, "") : "The Prime Minister")}
            &middot; Prime Minister</div></div>
        <div class="stamp">Entered in registry<small>${esc(b.ref)} &middot; SITTING ${bs.assentedAt}</small></div>
      </div>` : assented ? `<div class="sigblock"><div class="sigline"><div class="cap">
          Assented without ceremony &mdash; simple majority</div></div>
        <div class="madestamp">Entered in registry<small>${esc(b.ref)} &middot; SITTING ${bs.assentedAt}</small></div>
      </div>` : "";

    return { html: `<div class="paper${ceremonial && !already ? " sig-armed" : ""}${ceremonial && already ? " sig-done" : ""}">
      ${head("Office of the Prime Minister", "Circumterrestrial Commonwealth \u00b7 Anselm Ring",
             "FILE " + b.ref, "11 APR 2287")}
      ${banner}${stageTrack(b, bs)}${body}${sig}</div>`, ceremonial: ceremonial && !already };
  }

  /* A minute is signed and served. Signing is the decision — the distribution
     list is served the moment the pen leaves the paper, and who was on it
     becomes a fact about the world. */
  function minuteSignable(m) {
    return !st.signedMinutes || !st.signedMinutes[m.id];
  }

  function instrumentDoc(it) {
    const si = it.si, s = it.state;
    const post = (C.cabinetById || {})[si.author];
    const window = s.inForce && s.prayerCloses != null ? s.prayerCloses - st.sitting : null;
    const banner = s.revoked
      ? `<div class="classif">Revoked</div>`
      : `<div class="classif" style="border-color:#8a6d22;color:#8a6d22">` +
        `${si.procedure === "affirmative" ? "Affirmative" : "Negative"} procedure` +
        (window > 0 ? ` &mdash; prayable for ${window} more sittings` : "") + `</div>`;
    return { html: `<div class="paper">
      ${head("Office of the Minister for " + (post ? post.name : si.author.replace(/_/g, " ")),
             "Made under the Allocation Act and the Representation Act",
             si.number, "SITTING " + s.madeAt)}
      ${banner}
      <h5>${esc(si.title)}</h5>
      <p>${esc(si.summary)}</p>
      ${si.effect_note ? `<p><i>${esc(si.effect_note)}</i></p>` : ""}
      <p>${si.procedure === "affirmative"
        ? "This instrument requires the approval of the House before taking effect."
        : "This instrument took effect on being made. It stands unless the House prays " +
          "against it within " + (si.prayer_window || 6) + " sittings. A prayer requires a " +
          "simple majority of elected members only."}
      ${si.revocable ? " It may be revoked by a further instrument." : ""}</p>
      <div class="sigblock">
        <div class="sigline"><div class="rule">
          <svg width="228" height="52" viewBox="0 0 228 52" aria-hidden="true">
            <path class="sigpath" d="${SIG_PATH}"/></svg></div>
          <div class="cap">${esc(minister(si.author))} &middot; ${esc(postName(si.author))}</div></div>
        <div class="madestamp">Made<small>${esc(si.number)} &middot; SITTING ${s.madeAt}</small></div>
      </div></div>`, ceremonial: false, drawSig: true };
  }

  function minister(postId) {
    const p = st.cabinet[postId];
    if (!p || !p.holder) return "vacant";
    const ch = C.characterById[p.holder];
    return ch ? ch.name.replace(/^Rt\. Hon\. /, "") : p.holder.replace(/_/g, " ");
  }
  function postName(postId) {
    const p = (C.cabinetById || {})[postId];
    return p ? "Minister for " + p.name : postId.replace(/_/g, " ");
  }

  function minuteDoc(it) {
    const m = it.minute;
    const signed = st.signedMinutes && st.signedMinutes[m.id];
    const line = (label, v) => `<div class="row"><span>${label}</span><span>${v}</span></div>`;
    return { html: `<div class="paper">
      ${head("Office of the Prime Minister", "Circumterrestrial Commonwealth \u00b7 Anselm Ring",
             "FILE " + m.file, "SITTING " + (m.sitting || st.sitting))}
      <div class="classif">${esc(m.classification || "Restricted — ministerial")}</div>
      <div class="distrib">
        ${line("FROM", esc(m.from))}
        ${line("TO", esc(m.to))}
        ${m.copy ? line("COPY", m.copy.map(esc).join(" &middot; ")) : ""}
        ${m.struck ? line("", m.struck.map(s => `<s>${esc(s)}</s>`).join(" &middot; ") +
            ` <i style="font-family:var(--f-ui);font-size:9px;letter-spacing:.06em">struck at drafting</i>`) : ""}
        ${m.notCopied ? line("NOT COPIED", m.notCopied.map(esc).join(" &middot; ")) : ""}
      </div>
      <h5>${esc(m.subject)}</h5>
      ${m.body.split(/\n\n+/).map(p => p.trim().startsWith("1.")
        ? `<ol>${p.split(/\n(?=\d+\.)/).map(x => `<li>${esc(x.replace(/^\d+\.\s*/, ""))}</li>`).join("")}</ol>`
        : `<p>${esc(p)}</p>`).join("")}
      <div class="sigblock">
        <div class="sigline"><div class="rule">
          ${signed ? `<svg width="228" height="52" viewBox="0 0 228 52" aria-hidden="true">
            <path class="sigpath" d="${SIG_PATH}"/></svg>` : ""}</div>
          <div class="cap">${esc(m.signedBy || "The Prime Minister")}</div></div>
        ${signed
          ? `<div class="madestamp">Served<small>${esc(m.file)} &middot; SITTING ${signed}</small></div>`
          : `<button class="btn signbtn" data-sign="${m.id}">Sign and serve</button>`}
      </div>
    </div>`, ceremonial: false, drawSig: !!signed };
  }

  /* ---------- render ---------- */

  function render(state, content) {
    st = state; C = content;
    const list = items();
    /* The register grows and shrinks with the state: an instrument that
       is revoked takes its row with it. If the chosen document is gone,
       choose the first one - seeded rather than set, because we are
       already inside the render it would otherwise trigger. */
    let sel = chosen();
    if (!list.some(i => i.id === sel)) {
      sel = list.length ? list[0].id : null;
      Focus.seed("pp-list", sel);
    }

    document.getElementById("pp-list").innerHTML = list.length ? list.map(i =>
      `<tr class="${i.id === sel ? "sel" : ""}" data-doc="${i.id}">
        <td>${esc(i.title)}<div class="note">${esc(i.ref)}</div></td>
        <td class="n"><span class="flag ${i.status === "assented" || i.status === "in force" ? "good"
          : ["struck", "revoked", "defeated"].includes(i.status) ? "bad" : ""}">${i.status}</span></td>
      </tr>`).join("")
      : `<tr><td class="note">The register is empty. Divisions and instruments appear here.</td></tr>`;

    document.getElementById("pp-list").querySelectorAll("[data-doc]").forEach(n =>
      n.addEventListener("click", () => Focus.activate("pp-list", n.dataset.doc)));

    const it = list.find(i => i.id === sel);
    const box = document.getElementById("pp-doc");
    if (!it) { box.innerHTML = `<div class="pbody"><div class="note">Nothing selected.</div></div>`; return; }

    const doc = it.kind === "act" ? actDoc(it)
              : it.kind === "instrument" ? instrumentDoc(it) : minuteDoc(it);
    box.innerHTML = doc.html;

    box.querySelectorAll("[data-sign]").forEach(btn => btn.addEventListener("click", () => {
      st.signedMinutes = st.signedMinutes || {};
      st.signedMinutes[btn.dataset.sign] = st.sitting;
      const m = (C.minutes || []).find(x => x.id === btn.dataset.sign);
      if (m) {
        st.log.unshift({ sitting: st.sitting, text: "Minute signed and served: " + m.subject });
        if (m.onSign) Engine.apply(st, C, m.onSign);
      }
      delete drawn[btn.dataset.sign];
      if (onChange) onChange(); else render(st, C);
    }));

    /* Draw any signature on this document that has not been drawn before.
       The stroke is the player's own hand, so it fires on the act rather
       than on arriving at the page. */
    if (doc.ceremonial || doc.drawSig) {
      const paper = box.querySelector(".paper");
      const path = box.querySelector("#sigpath") || box.querySelector(".sigpath");
      /* getTotalLength is SVG geometry, which a DOM without layout does
         not implement — the same shape of absence as Web Audio in a
         headless run. A missing flourish is never worth an exception. */
      if (path && paper && typeof path.getTotalLength === "function") {
        const len = path.getTotalLength();
        paper.style.setProperty("--len", len);
        if (drawn[it.id]) paper.classList.add("sig-done");
        else requestAnimationFrame(() => requestAnimationFrame(() => {
          paper.classList.add("sig-draw");
          drawn[it.id] = true;
        }));
      }
    }
  }

  function reset() { drawn = {}; Focus.seed("pp-list", null); }
  function onUpdate(fn) { onChange = fn; }

  return { render, reset, onUpdate };
})();
