// The numbers of app/stats.py, computed in the page itself from the bundle (app/bundle.py).
// The online version has no server: same results, same shapes, checked against the Python by tools/audit.py.
(function (root) {
  const TZ = "Europe/Paris";
  const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const PLATFORM_ORDER = ["tiktok", "instagram"];
  const EXPORT_COLUMNS = ["date", "channel", "platform", "account", "title", "category", "views", "likes", "comments",
    "shares", "saves", "reach", "avg_watch_sec", "engagement_pct", "url"];
  const POST_FIELDS = ["id", "account_id", "published_at", "title", "category", "url", "thumbnail", "views", "likes",
    "comments", "shares", "saves", "reach", "avg_watch_sec"];

  // ---------- dates (Paris wall clock) ----------
  const clock = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  function paris(when) {
    const p = {};
    for (const x of clock.formatToParts(new Date(when))) p[x.type] = x.value;
    const date = `${p.year}-${p.month}-${p.day}`;
    return { date, hour: Number(p.hour), text: `${date} ${p.hour}:${p.minute}`,
      weekday: (new Date(date + "T00:00:00Z").getUTCDay() + 6) % 7 };  // Monday = 0, like Python
  }
  const addDays = (day, n) => new Date(Date.parse(day + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);

  // ---------- small helpers, written to give exactly what Python gives ----------
  function pyRound(x, digits) {  // Python's round(): an exact tie goes to the even neighbour
    const scale = 10 ** digits, y = x * scale, f = Math.floor(y);
    if (y - f === 0.5) return (f % 2 === 0 ? f : f + 1) / scale;
    return Number(x.toFixed(digits));
  }
  function median(values) {
    const v = values.filter(x => x != null).sort((a, b) => a - b);
    if (!v.length) return null;
    const m = v.length >> 1;
    return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
  }
  function engagement(posts) {  // (likes + comments + shares) / views
    const views = posts.reduce((s, p) => s + (p.views || 0), 0);
    if (!views) return null;
    return posts.reduce((s, p) => s + (p.likes || 0) + (p.comments || 0) + (p.shares || 0), 0) / views;
  }
  const sum = (list, f) => list.reduce((s, x) => s + f(x), 0);
  const cmp = (a, b) => (a == null ? (b == null ? 0 : -1) : b == null ? 1 : a < b ? -1 : a > b ? 1 : 0);  // NULL first, like SQL

  function create(bundle, nowWhen) {
    const today = paris(nowWhen || Date.now()).date;
    const accounts = [...bundle.accounts].sort((a, b) =>
      cmp(a.group_name, b.group_name) || cmp(a.platform, b.platform) || cmp(a.handle, b.handle));
    const hist = {};
    for (const a of accounts) {
      const rows = bundle.snapshots[a.id] || [];
      hist[a.id] = { days: rows.map(r => r[0]), values: rows.map(r => r[1]) };
    }
    const posts = bundle.posts.map(row => {
      const p = Object.fromEntries(POST_FIELDS.map((k, i) => [k, row[i]]));
      p.local = paris(p.published_at);
      return p;
    });
    const postsById = new Map(posts.map(p => [p.id, p]));
    const accountById = new Map(accounts.map(a => [a.id, a]));

    function valueOn(h, day) {  // followers on that day: the last snapshot taken on or before it
      let lo = 0, hi = h.days.length;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (h.days[mid] <= day) lo = mid + 1; else hi = mid; }
      return lo ? h.values[lo - 1] : null;
    }
    function growth(h, day, days) {
      const now = valueOn(h, day);
      if (now == null) return null;
      const then = valueOn(h, addDays(day, -days));
      return now - (then == null ? h.values[0] : then);  // account newer than the range: since its first day
    }
    const pick = (platform, group, accountId) => accounts.filter(a => (!accountId || a.id === accountId)
      && (platform === "all" || a.platform === platform) && (group === "all" || a.group_name === group));

    function scope(days, platform, group, accountId) {
      const accs = pick(platform, group, accountId), ids = new Set(accs.map(a => a.id));
      const firstDay = addDays(today, -(days - 1)), previousFirst = addDays(firstDay, -days);
      const all = posts.filter(p => ids.has(p.account_id) && p.local.date >= previousFirst);
      return { firstDay, accs, inRange: all.filter(p => p.local.date >= firstDay), previous: all.filter(p => p.local.date < firstDay) };
    }

    function kpis(accs, ps, days, previous) {
      const g = accs.map(a => growth(hist[a.id], today, days));
      const k = {
        followers: sum(accs, a => valueOn(hist[a.id], today) || 0),
        growth: sum(g.filter(x => x != null), x => x),
        views: sum(ps, p => p.views || 0),
        median_views: median(ps.map(p => p.views)),
        engagement: engagement(ps),
        posts: ps.length,
        posts_per_week: pyRound(ps.length / days * 7, 1),
      };
      if (previous) {
        k.previous = { views: sum(previous, p => p.views || 0), median_views: median(previous.map(p => p.views)),
          engagement: engagement(previous), posts: previous.length, posts_per_week: pyRound(previous.length / days * 7, 1) };
      }
      return k;
    }

    function series(accs, ps, firstDay) {
      const dayList = [];
      for (let d = firstDay; d <= today; d = addDays(d, 1)) dayList.push(d);
      const views = new Map();
      for (const p of ps) views.set(p.local.date, (views.get(p.local.date) || 0) + (p.views || 0));
      return { labels: dayList, followers: dayList.map(d => sum(accs, a => valueOn(hist[a.id], d) || 0)),
        views: dayList.map(d => views.get(d) || 0) };
    }

    function pub(p) {
      const a = accountById.get(p.account_id);
      const title = p.title ? String.fromCodePoint(p.title.codePointAt(0)).toUpperCase() + p.title.slice(String.fromCodePoint(p.title.codePointAt(0)).length) : null;
      return { id: p.id, account_id: a.id, handle: a.handle, platform: a.platform, title, category: p.category, url: p.url,
        thumbnail: p.thumbnail, date: p.local.text, views: p.views, likes: p.likes, comments: p.comments, shares: p.shares,
        saves: p.saves, reach: p.reach, avg_watch_sec: p.avg_watch_sec, engagement: engagement([p]) };
    }

    function categories(ps) {
      const byCat = new Map();
      for (const p of ps) { const c = p.category || "No category"; byCat.set(c, [...(byCat.get(c) || []), p]); }
      const rows = [...byCat].map(([category, list]) => ({ category, posts: list.length, median_views: median(list.map(p => p.views)),
        engagement: engagement(list), shares: sum(list, p => p.shares || 0) }));
      return rows.sort((a, b) => (b.median_views || 0) - (a.median_views || 0));
    }

    function goals(accs) {
      const since = addDays(today, -29);
      return accs.filter(a => a.platform === "tiktok").map(a => ({ id: a.id, handle: a.handle, group: a.group_name,
        followers: valueOn(hist[a.id], today) || 0,
        views_30: sum(posts.filter(p => p.account_id === a.id && p.local.date >= since), p => p.views || 0) }));
    }

    function byAccount(list) {
      const m = new Map();
      for (const p of list) m.set(p.account_id, [...(m.get(p.account_id) || []), p]);
      return m;
    }

    return {
      groups: () => [...new Set(accounts.map(a => a.group_name).filter(g => g != null))].sort(),
      accounts,

      overview(days, platform, group) {
        const s = scope(days, platform, group), inRange = byAccount(s.inRange), before = byAccount(s.previous);
        const rows = s.accs.map(a => {
          const h = hist[a.id], ps = inRange.get(a.id) || [];
          return { id: a.id, platform: a.platform, handle: a.handle, name: a.display_name, group: a.group_name, source: a.source,
            followers: valueOn(h, today), growth_7: growth(h, today, 7), growth_30: growth(h, today, 30),
            spark: Array.from({ length: days }, (_, i) => valueOn(h, addDays(s.firstDay, i))),
            posts_per_week: pyRound(ps.length / days * 7, 1), views: sum(ps, p => p.views || 0),
            median_views: median(ps.map(p => p.views)), engagement: engagement(ps) };
        });
        const platforms = {};
        for (const name of PLATFORM_ORDER.filter(n => s.accs.some(a => a.platform === n))) {
          const accs = s.accs.filter(a => a.platform === name);
          const ps = accs.flatMap(a => inRange.get(a.id) || []), prev = accs.flatMap(a => before.get(a.id) || []);
          platforms[name] = { accounts: accs.length, kpis: kpis(accs, ps, days, prev), series: series(accs, ps, s.firstDay) };
        }
        return { kpis: kpis(s.accs, s.inRange, days, s.previous), series: series(s.accs, s.inRange, s.firstDay),
          platforms, accounts: rows, goals: { targets: bundle.targets, accounts: goals(s.accs) } };
      },

      topPosts(days, platform, group, sort = "views", limit = 25, category = "") {
        let list = scope(days, platform, group).inRange;
        const cats = [...new Set(list.map(p => p.category || "No category"))].sort();
        if (category) list = list.filter(p => (p.category || "No category") === category);
        const key = sort === "shares" ? "shares" : "views";
        list = [...list].sort((a, b) => (b[key] || 0) - (a[key] || 0));
        return { posts: list.slice(0, limit).map(pub), categories: cats, total: list.length };
      },

      insights(days, platform, group) {
        const list = scope(days, platform, group).inRange, cells = new Map();
        for (const p of list) { const k = p.local.weekday * 100 + p.local.hour; cells.set(k, [...(cells.get(k) || []), p.views]); }
        const hours = [...new Set([...cells.keys()].map(k => k % 100))].sort((a, b) => a - b);
        const grid = WEEKDAYS.map((_, d) => hours.map(h => {
          const v = cells.get(d * 100 + h) || [];
          return { median_views: median(v), posts: v.length };
        }));
        return { hours, weekdays: WEEKDAYS, grid, categories: categories(list), posts: list.length };
      },

      account(id, days) {
        const s = scope(days, "all", "all", id);
        if (!s.accs.length) return null;
        const a = s.accs[0], h = hist[a.id];
        return {
          account: { id: a.id, platform: a.platform, handle: a.handle, name: a.display_name, group: a.group_name,
            type: a.account_type, source: a.source, growth_7: growth(h, today, 7), growth_30: growth(h, today, 30) },
          kpis: kpis(s.accs, s.inRange, days, s.previous), series: series(s.accs, s.inRange, s.firstDay),
          categories: categories(s.inRange), posts: [...s.inRange].reverse().map(pub),
        };
      },

      postDetail(id) {
        const p = postsById.get(id);
        if (!p || !accountById.has(p.account_id)) return null;
        const post = { ...pub(p), group: accountById.get(p.account_id).group_name, caption: null, published_at: p.published_at };
        const snapshots = (bundle.curves[id] || []).map(s => ({ t: s[0], views: s[1], likes: s[2], comments: s[3], shares: s[4], saves: s[5] }));
        return { post, snapshots };
      },

      exportRows(days, platform, group) {
        const list = [...scope(days, platform, group).inRange].sort((a, b) => cmp(b.published_at, a.published_at));
        return { columns: EXPORT_COLUMNS, rows: list.map(p => {
          const a = accountById.get(p.account_id), eng = engagement([p]);
          return [p.local.text, a.group_name, a.platform, "@" + a.handle, p.title, p.category, p.views, p.likes, p.comments,
            p.shares, p.saves, p.reach, p.avg_watch_sec, eng == null ? null : pyRound(eng * 100, 2), p.url];
        }) };
      },
    };
  }

  const HubStats = { create, paris, pyRound, median, EXPORT_COLUMNS };
  root.HubStats = HubStats;
  if (typeof module !== "undefined") module.exports = HubStats;
})(typeof window !== "undefined" ? window : globalThis);
