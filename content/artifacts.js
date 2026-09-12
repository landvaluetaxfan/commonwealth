/* =============================================================
   ARTIFACTS — the image manifest, and the system notice.

   TWO THINGS THE BUILD DECLARES ABOUT ITSELF.

   ARTIFACTS maps a SLOT NAME to a file under img/artifacts/. The
   slots are declared in js/artifacts.js with their shape and
   palette; this file only says which picture goes in which, so a
   new image ships by adding one line here and nothing in js/.

   Every slot is empty on purpose. A slot renders correctly with
   nothing in it — the box is reserved either way, so filling one
   moves nothing on the screen. tools/uxtest.js asserts that by
   toggling each slot in turn.

   SHAPES ARE PINNED (bible 12.11) and tools/lint.js reads the PNG
   header and fails on a mismatch. Never crop in the browser: an
   image arriving the wrong shape gets cropped a second time and
   the framing is lost.

   PALETTE CARRIES MEANING, also 12.11. A state crest is registry
   and ordered-dithered because it is machine output from the
   government system. A press image would be newsprint. Run
   tools/dither.sh with the palette the slot declares.

   NOTICE is the in-world sysadmin note on the standing board. It
   is the changelog surface: when something changes in a build, it
   is announced here, in the voice of whoever maintains the
   terminal rather than in the voice of whoever wrote the code.
   ============================================================= */

const ARTIFACTS = {
  /* crest:           "seal.png",        1:1   128px  registry  */
  /* department_mark: "cabinet.png",     1:1    64px  registry  */
  /* notice_plate:    "plate.png",      12:5   640px  registry  */
  /* backdrop:        "field.png",      tiling        registry  */
};

const NOTICE = {
  ref: "PM/4/2287/002",
  from: "Office systems",
  text: "Terminal left running between sittings by standing instruction. " +
        "The board below is the position as it stood at the opening of the " +
        "session and is not updated in real time. Report faults to the " +
        "Cabinet Office, not to the engineering authority."
};
