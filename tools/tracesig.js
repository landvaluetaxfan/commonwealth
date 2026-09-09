/* =============================================================
   TRACE A SIGNATURE

     node tools/tracesig.js img/signature.png [--write]

   Turns a scanned signature into the single centreline <path> the
   assent ceremony draws. Prints the path; --write splices it into
   SIG_PATH in js/papers.js.

   CENTRELINE, NOT OUTLINE. potrace and friends produce a filled
   outline — the shape of the ink, two contours per stroke. That is
   the wrong thing here: css/terminal.css animates the signature with
   stroke-dashoffset, which needs a line to run along, not a region
   to fill. So this thins the ink to a one-pixel skeleton first
   (Zhang-Suen), walks the skeleton into polylines, simplifies them
   (Ramer-Douglas-Peucker), and emits one path.

   NO IMAGE LIBRARY. There is no PNG decoder in Node and this repo
   has one devDependency. Chromium is already present for the
   headless checks, so decoding happens in a canvas there and the
   result comes back through --dump-dom. Same reason the rest of the
   tooling shells out rather than taking packages.
   ============================================================= */
const fs = require("fs"), path = require("path"), cp = require("child_process");
const root = path.join(__dirname, "..");

const CHROME = [
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
  "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"
].find(p => fs.existsSync(p));

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const src = args.find(a => !a.startsWith("--")) || "img/signature.png";

if (!CHROME) { console.error("No Chromium found; cannot decode the image."); process.exit(1); }
if (!fs.existsSync(path.join(root, src))) {
  console.error(`Not found: ${src}\n\nPut the signature there and run again:\n` +
                `  node tools/tracesig.js ${src} --write`);
  process.exit(1);
}

/* The tracing runs in the browser, where the pixels are. */
const TRACE = `
const W = 228, HMAX = 58;      // target viewBox, matching .sigline in the CSS

function thin(g, w, h) {                     // Zhang-Suen, in place
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : g[y * w + x];
  let changed = true;
  while (changed) {
    changed = false;
    for (const step of [0, 1]) {
      const kill = [];
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        if (!at(x, y)) continue;
        const p = [at(x,y-1),at(x+1,y-1),at(x+1,y),at(x+1,y+1),
                   at(x,y+1),at(x-1,y+1),at(x-1,y),at(x-1,y-1)];
        const B = p.reduce((a, b) => a + b, 0);
        if (B < 2 || B > 6) continue;
        let A = 0;
        for (let i = 0; i < 8; i++) if (!p[i] && p[(i + 1) % 8]) A++;
        if (A !== 1) continue;
        if (step === 0) {
          if (p[0] * p[2] * p[4]) continue;
          if (p[2] * p[4] * p[6]) continue;
        } else {
          if (p[0] * p[2] * p[6]) continue;
          if (p[0] * p[4] * p[6]) continue;
        }
        kill.push(y * w + x);
      }
      if (kill.length) { changed = true; kill.forEach(i => g[i] = 0); }
    }
  }
}

/* Walk the skeleton into polylines, starting from endpoints so strokes
   run end to end rather than breaking in the middle. */
function polylines(g, w, h) {
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : g[y * w + x];
  const N = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
  const deg = (x, y) => N.reduce((n, d) => n + at(x + d[0], y + d[1]), 0);
  const used = new Uint8Array(w * h);
  const out = [];

  const walk = (sx, sy) => {
    const line = [[sx, sy]];
    used[sy * w + sx] = 1;
    let x = sx, y = sy, moved = true;
    while (moved) {
      moved = false;
      for (const d of N) {
        const nx = x + d[0], ny = y + d[1];
        if (at(nx, ny) && !used[ny * w + nx]) {
          used[ny * w + nx] = 1; line.push([nx, ny]); x = nx; y = ny; moved = true; break;
        }
      }
    }
    /* Keep short fragments. A skeleton breaks into pieces at every
       self-intersection, and a signature is mostly self-intersection;
       dropping them leaves visible gaps in the drawn stroke. */
    if (line.length > 2) out.push(line);
  };

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    if (at(x, y) && !used[y * w + x] && deg(x, y) === 1) walk(x, y);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    if (at(x, y) && !used[y * w + x]) walk(x, y);          // closed loops
  return out;
}

function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  let idx = 0, max = 0;
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len;
    if (d > max) { max = d; idx = i; }
  }
  if (max <= eps) return [pts[0], pts[pts.length - 1]];
  return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps));
}

/* Smooth a polyline into a cubic chain (Catmull-Rom), so the drawn stroke
   reads as a hand rather than as a chain of line segments. */
function toBezier(p) {
  if (p.length < 2) return "";
  const q = [p[0]].concat(p, [p[p.length - 1]]);
  let d = "M" + p[0][0].toFixed(1) + " " + p[0][1].toFixed(1);
  for (let i = 1; i < q.length - 2; i++) {
    const c1 = [q[i][0] + (q[i+1][0] - q[i-1][0]) / 6, q[i][1] + (q[i+1][1] - q[i-1][1]) / 6];
    const c2 = [q[i+1][0] - (q[i+2][0] - q[i][0]) / 6, q[i+1][1] - (q[i+2][1] - q[i][1]) / 6];
    d += "C" + c1[0].toFixed(1) + " " + c1[1].toFixed(1) + "," +
                c2[0].toFixed(1) + " " + c2[1].toFixed(1) + "," +
                q[i+1][0].toFixed(1) + " " + q[i+1][1].toFixed(1);
  }
  return d;
}

function run(img) {
  /* Work at a fixed width so thinning behaves consistently regardless of
     what resolution the signature was scanned at. */
  const TW = 900, TH = Math.max(1, Math.round(img.height * TW / img.width));
  const c = document.createElement("canvas");
  c.width = TW; c.height = TH;
  const cx = c.getContext("2d");
  cx.fillStyle = "#fff"; cx.fillRect(0, 0, TW, TH);
  cx.drawImage(img, 0, 0, TW, TH);
  const px = cx.getImageData(0, 0, TW, TH).data;

  /* Threshold on luminance, and treat transparent pixels as paper — a PNG
     exported with a clear background is the common case and would otherwise
     read as solid ink. */
  const g = new Uint8Array(TW * TH);
  for (let i = 0; i < TW * TH; i++) {
    const a = px[i*4+3];
    const l = (px[i*4] * 0.299 + px[i*4+1] * 0.587 + px[i*4+2] * 0.114);
    g[i] = (a > 40 && l < 128) ? 1 : 0;
  }
  const ink = g.reduce((n, v) => n + v, 0);

  thin(g, TW, TH);
  let lines = polylines(g, TW, TH);

  /* Longest first: the ceremony draws in order, and the main sweep should
     arrive before the diacritics. */
  lines.sort((a, b) => b.length - a.length);

  const sx = W / TW, sy = sx;                  // uniform, so nothing distorts
  const H = Math.min(HMAX, Math.round(TH * sy));
  const d = lines.map(l => toBezier(rdp(l, 0.9).map(p => [p[0] * sx, p[1] * sy]))).join(" ");

  return { d: d, w: W, h: Math.max(H, Math.ceil(TH * sy)),
           strokes: lines.length, inkPx: ink, src: TW + "x" + TH };
}

const img = new Image();
img.onload = () => {
  let r;
  try { r = run(img); } catch (e) { r = { error: e.message }; }
  document.getElementById("out").textContent = JSON.stringify(r);
};
img.onerror = () => { document.getElementById("out").textContent = '{"error":"image failed to load"}'; };
img.src = document.getElementById("src").src;
`;

const b64 = fs.readFileSync(path.join(root, src)).toString("base64");
const ext = path.extname(src).slice(1).toLowerCase();
const mime = ext === "jpg" ? "jpeg" : ext;
const tmp = path.join(require("os").tmpdir(), "tracesig-" + process.pid + ".html");
fs.writeFileSync(tmp, `<html><body><img id="src" src="data:image/${mime};base64,${b64}">` +
  `<pre id="out"></pre><script>${TRACE}</script></body></html>`);

const dom = cp.execSync(
  `"${CHROME}" --headless --disable-gpu --no-sandbox --virtual-time-budget=20000 ` +
  `--dump-dom "${tmp}" 2>/dev/null`, { maxBuffer: 64 * 1024 * 1024 }).toString();
fs.unlinkSync(tmp);

const m = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
if (!m) { console.error("Chromium returned nothing usable."); process.exit(1); }
const r = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
if (r.error) { console.error("Trace failed: " + r.error); process.exit(1); }

console.log("TRACE " + src);
console.log("=".repeat(46));
console.log(`  source            ${r.src}`);
console.log(`  ink pixels        ${r.inkPx.toLocaleString()}`);
console.log(`  strokes found     ${r.strokes}`);
console.log(`  path length       ${r.d.length} chars`);
console.log(`  viewBox           0 0 ${r.w} ${r.h}`);
if (r.strokes === 0) {
  console.error("\n  No strokes. Is the ink dark on a light background?");
  process.exit(1);
}
if (r.strokes > 24)
  console.log("\n  NOTE: many separate strokes. If the scan is speckled, clean it up\n" +
              "        first — every fleck becomes a subpath the ceremony draws.");

if (!WRITE) {
  console.log("\n" + r.d.slice(0, 300) + (r.d.length > 300 ? " ..." : ""));
  console.log("\n  Re-run with --write to splice this into js/papers.js");
} else {
  const p = path.join(root, "js/papers.js");
  let s = fs.readFileSync(p, "utf8");
  const start = s.indexOf("  const SIG_PATH =");
  const end = s.indexOf('";', start) + 2;
  if (start < 0) { console.error("SIG_PATH not found in js/papers.js"); process.exit(1); }
  const wrap = [];
  for (let i = 0; i < r.d.length; i += 90) wrap.push(r.d.slice(i, i + 90));
  const js = "  /* Traced from " + src + " by tools/tracesig.js. Centreline, one <path>,\n" +
    "     because the ceremony draws it with a single stroke-dashoffset sweep.\n" +
    "     Regenerate rather than editing by hand. */\n  const SIG_PATH =\n" +
    wrap.map((l, i) => '    "' + l + '"' + (i < wrap.length - 1 ? " +" : ";")).join("\n");
  fs.writeFileSync(p, s.slice(0, start) + js + s.slice(end));
  console.log("\n  written to js/papers.js");
  console.log(`  check .sigline in css/terminal.css if the viewBox height changed (${r.h})`);
}
