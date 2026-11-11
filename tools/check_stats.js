// Compares the page's own calculations (static/stats.js) with the server's (app/stats.py).
// Input: a JSON file {bundle, cases, py} written by tools/audit.py. Output: one JSON line with the mismatches.
//   node tools/check_stats.js <file>
const fs = require("fs");
const path = require("path");
const HubStats = require(path.join(__dirname, "..", "static", "stats.js"));

const { bundle, cases, py, now } = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const m = HubStats.create(bundle, now);  // the same instant as the Python side
const close = (a, b) => a === b || (typeof a === "number" && typeof b === "number"
  && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)));

function diff(a, b, where) {
  if (close(a, b)) return null;
  if (a && b && typeof a === "object" && typeof b === "object") {
    if (Array.isArray(a) !== Array.isArray(b)) return `${where}: list vs object`;
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const d = diff(a[k], b[k], `${where}.${k}`);
      if (d) return d;
    }
    return null;
  }
  return `${where}: python=${JSON.stringify(a)} page=${JSON.stringify(b)}`;
}

const bad = [];
for (const name of cases) {
  const [kind, ...p] = name.split("|");
  const got = kind === "overview" ? m.overview(+p[0], p[1], p[2])
    : kind === "insights" ? m.insights(+p[0], p[1], p[2])
    : kind === "posts" ? m.topPosts(+p[0], p[1], p[2], p[3], 25, p[4])
    : kind === "export" ? m.exportRows(+p[0], p[1], p[2])
    : kind === "account" ? m.account(p[1], +p[0])
    : kind === "post" ? m.postDetail(p.join("|"))
    : undefined;
  const d = diff(py[name], got, name);
  if (d) bad.push(d);
}
console.log(JSON.stringify({ cases: cases.length, mismatches: bad.length, first: bad.slice(0, 5) }));
