/* =============================================================
   DIALOG — the terminal's own alerts, confirmations and prompts.

   alert(), confirm() and prompt() are the three things a browser
   draws in its own colours, in a box the fiction cannot reach, on
   top of a 2287 government terminal. This module draws them in the
   terminal's own panel and button furniture instead.

   CALLBACKS, NOT PROMISES. Every call site is in the middle of a
   synchronous flow — name a save, then start it; forecast a prayer,
   then resolve it — and a promise would turn each one inside out
   for no benefit. The headless harness answers through the same
   callbacks, which is how the shell and the editor still boot
   without a click.

   The three kinds differ only in what they draw and what they hand
   back:

     Dialog.alert(msg, opts?, done?)       done()
     Dialog.confirm(msg, opts?, answer?)   answer(true|false)
     Dialog.prompt(msg, opts?, answer?)    answer(string|null)

   opts = {
     title,         the panel heading; a default per kind otherwise
     value,         prompt only: the field's starting text
     placeholder,   prompt only
     yes, no,       the button labels
     danger,        draw the affirmative in the alert colour
   }

   The host is a single element, created on first use, and only one
   dialog is ever live: opening a second cancels the first through
   its own callback, the same as the player pressing Escape.
   ============================================================= */
const Dialog = (function () {
  "use strict";

  let live = null;

  function host() {
    let h = document.getElementById("dlgdlg");
    if (!h) {
      h = document.createElement("div");
      h.id = "dlgdlg";
      document.body.appendChild(h);
    }
    return h;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function open(kind, msg, opts, answer) {
    const o = opts || {};
    if (typeof answer !== "function") answer = function () {};

    /* No document: this is a headless run with no one to ask. Answer
       the way a click-through would and hand back the default. */
    if (typeof document === "undefined") {
      answer(kind === "prompt" ? (o.value || "")
           : kind === "confirm" ? true : undefined);
      return;
    }

    /* A dialog already up is cancelled through its own answer, not
       silently replaced, so the caller waiting on it is never left
       hanging. */
    if (live) live.cancel();

    const h = host();
    const opener = document.activeElement;
    const title = o.title ||
      (kind === "alert" ? "Notice" : kind === "prompt" ? "Enter" : "Confirm");
    const yes = o.yes || "OK";
    const no = o.no || "Cancel";
    const body = esc(msg).replace(/\n/g, "<br>");

    h.innerHTML =
      '<div class="dlg-back"><div class="dlg-dlg panel" role="dialog" aria-modal="true"' +
      ' aria-label="' + esc(title) + '" tabindex="-1">' +
        '<h2>' + esc(title) + '</h2>' +
        '<div class="pbody">' +
          '<div class="dlg-msg">' + body + '</div>' +
          (kind === "prompt"
            ? '<input type="text" class="dlg-in" autocomplete="off" spellcheck="false"' +
              ' value="' + esc(o.value || "") + '"' +
              (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : "") + '>'
            : "") +
          '<div class="dlg-btns">' +
            (kind === "alert"
              ? '<button class="mbtn sm" data-dlg="yes">' + esc(yes) + '</button>'
              : '<button class="mbtn sm" data-dlg="no">' + esc(no) + '</button>' +
                '<button class="mbtn sm' + (o.danger ? " danger" : "") + '"' +
                ' data-dlg="yes">' + esc(yes) + '</button>') +
          '</div>' +
        '</div>' +
      '</div></div>';

    const back = h.querySelector(".dlg-back");
    const dlg = h.querySelector(".dlg-dlg");
    const input = h.querySelector(".dlg-in");
    const btnYes = h.querySelector('[data-dlg="yes"]');
    const btnNo = h.querySelector('[data-dlg="no"]');
    let done = false;

    function finish(result) {
      if (done) return;
      done = true;
      live = null;
      document.removeEventListener("keydown", onKey, true);
      h.innerHTML = "";
      /* Back to whatever opened the dialog, while it is still on the
         page. The caller's redraw comes after this, and js/focus.js
         carries it through that by id. */
      if (opener && opener.isConnected && opener.focus) opener.focus({ preventScroll: true });
      answer(result);
    }

    /* What the affirmative and the way-out hand back, per kind. */
    function affirmative() {
      return kind === "prompt" ? (input ? input.value : "")
           : kind === "alert" ? undefined : true;
    }
    function cancelValue() {
      return kind === "prompt" ? null : kind === "confirm" ? false : undefined;
    }

    /* CAPTURE PHASE, AND IT STOPS. The shell closes its options popover
       on Escape and the tooltip layer hides on Escape; neither should
       fire at a dialog that owns the keyboard. Enter and Tab are handled
       here too, so the game's row selection never sees a keystroke meant
       for the field. */
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault(); e.stopPropagation();
        finish(cancelValue());
        return;
      }
      if (e.key === "Enter") {
        if (document.activeElement && document.activeElement.tagName === "BUTTON") return;
        e.preventDefault(); e.stopPropagation();
        finish(affirmative());
        return;
      }
      if (e.key === "Tab" && dlg) {
        const f = [].slice.call(dlg.querySelectorAll("button,input"))
          .filter(n => !n.disabled);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1], a = document.activeElement;
        if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
      }
    }

    live = { finish, cancel: function () { finish(cancelValue()); } };

    if (btnYes) btnYes.addEventListener("click", function () { finish(affirmative()); });
    if (btnNo) btnNo.addEventListener("click", function () { finish(cancelValue()); });
    /* A click on the backdrop is a way out; a click anywhere inside is
       not, and must not reach the shell's own outside-click handlers. */
    back.addEventListener("click", function (e) {
      e.stopPropagation();
      if (e.target === back) finish(cancelValue());
    });
    document.addEventListener("keydown", onKey, true);

    if (input) { input.focus({ preventScroll: true }); if (input.select) input.select(); }
    else if (o.danger && btnNo) btnNo.focus({ preventScroll: true });
    else if (btnYes) btnYes.focus({ preventScroll: true });
  }

  function alert(msg, opts, done) {
    if (typeof opts === "function") { done = opts; opts = {}; }
    open("alert", msg, opts, done);
  }
  function confirm(msg, opts, answer) {
    if (typeof opts === "function") { answer = opts; opts = {}; }
    open("confirm", msg, opts, answer);
  }
  function prompt(msg, opts, answer) {
    if (typeof opts === "function") { answer = opts; opts = {}; }
    open("prompt", msg, opts, answer);
  }

  return { alert: alert, confirm: confirm, prompt: prompt };
})();
