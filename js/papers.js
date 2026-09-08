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

  let st, C, sel = null, drawn = {};

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

  const SIG_PATH = "M4 42 C 12 18, 20 8, 27 14 C 33 19, 25 40, 33 43 C 41 46, 48 22, 55 16 " +
    "C 61 11, 63 30, 70 33 C 78 36, 86 14, 96 12 C 104 10, 100 34, 108 38 C 118 43, 126 20, " +
    "136 18 C 143 17, 139 34, 147 37 C 157 41, 166 24, 176 22 C 184 21, 180 33, 188 35 " +
    "C 197 37, 206 28, 216 20";

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
      ${head("Office of the Prime Minister", "Circumterrestrial Commonwealth &middot; Anselm Ring",
             "FILE " + b.ref, "11 APR 2287")}
      ${banner}${body}${sig}</div>`, ceremonial: ceremonial && !already };
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
      <div class="sigblock"><div class="sigline"><div class="cap">Made by the Minister
        &middot; no ceremony attaches to an instrument</div></div>
        <div class="madestamp">Made<small>${esc(si.number)} &middot; SITTING ${s.madeAt}</small></div>
      </div></div>`, ceremonial: false };
  }

  function minuteDoc(it) {
    const m = it.minute;
    const line = (label, v) => `<div class="row"><span>${label}</span><span>${v}</span></div>`;
    return { html: `<div class="paper">
      ${head("Office of the Prime Minister", "Circumterrestrial Commonwealth &middot; Anselm Ring",
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
    </div>`, ceremonial: false };
  }

  /* ---------- render ---------- */

  function render(state, content) {
    st = state; C = content;
    const list = items();
    if (!list.some(i => i.id === sel)) sel = list.length ? list[0].id : null;

    document.getElementById("pp-list").innerHTML = list.length ? list.map(i =>
      `<tr class="${i.id === sel ? "sel" : ""}" data-doc="${i.id}">
        <td>${esc(i.title)}<div class="note">${esc(i.ref)}</div></td>
        <td class="n"><span class="flag ${i.status === "assented" || i.status === "in force" ? "good"
          : ["struck", "revoked", "defeated"].includes(i.status) ? "bad" : ""}">${i.status}</span></td>
      </tr>`).join("")
      : `<tr><td class="note">The register is empty. Divisions and instruments appear here.</td></tr>`;

    document.getElementById("pp-list").querySelectorAll("[data-doc]").forEach(n =>
      n.addEventListener("click", () => { sel = n.dataset.doc; render(st, C); }));

    const it = list.find(i => i.id === sel);
    const box = document.getElementById("pp-doc");
    if (!it) { box.innerHTML = `<div class="pbody"><div class="note">Nothing selected.</div></div>`; return; }

    const doc = it.kind === "act" ? actDoc(it)
              : it.kind === "instrument" ? instrumentDoc(it) : minuteDoc(it);
    box.innerHTML = doc.html;

    if (doc.ceremonial) {
      const path = box.querySelector("#sigpath"), paper = box.querySelector(".paper");
      if (path && paper) {
        const len = path.getTotalLength();
        paper.style.setProperty("--len", len);
        /* one frame, so the armed state applies before the transition */
        requestAnimationFrame(() => requestAnimationFrame(() => {
          paper.classList.add("sig-draw");
          drawn[it.id] = true;
        }));
      }
    }
  }

  function reset() { drawn = {}; sel = null; }

  return { render, reset };
})();
