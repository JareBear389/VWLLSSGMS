// Pure game logic, no DOM. Shared by the page and the tests.
(function (root) {
  const PER_TITLE_SECONDS = 60;
  const TITLES_PER_DAY = 10;
  const MIN_PUZZLE_LENGTH = 4;
  // Puzzle #1 is this date. Day numbers count from here.
  const EPOCH = { y: 2026, m: 11, d: 24 };

  function stripAccents(s) {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  // "The Silence of the Lambs" -> "THSLNCFTHLMBS"
  // Removes A E I O U (Y stays), spaces and punctuation. Digits stay.
  function toPuzzle(title) {
    return stripAccents(title)
      .toUpperCase()
      .replace(/[AEIOU]/g, "")
      .replace(/[^A-Z0-9]/g, "");
  }

  // Forgiving comparison key: case, accents, punctuation, spacing,
  // "&" vs "and", Roman numerals II/III/IV vs digits, and a leading
  // The/A/An are all ignored.
  function normalizeAnswer(s, ampersand = " and ") {
    let t = stripAccents(String(s)).toLowerCase().replace(/&/g, ampersand);
    t = t.replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
    t = t.replace(/\b(iv|iii|ii)\b/g, (m) => ({ ii: "2", iii: "3", iv: "4" }[m]));
    t = t.replace(/^(the|a|an) /, "");
    return t.replace(/ /g, "");
  }

  // One typo (insert, delete or change a letter) is forgiven on answers
  // longer than 10 letters.
  function withinOneEdit(a, b) {
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, edits = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++edits > 1) return false;
      if (a.length > b.length) i++;
      else if (b.length > a.length) j++;
      else { i++; j++; }
    }
    return edits + (a.length - i) + (b.length - j) <= 1;
  }

  function answersFor(entry) {
    return [entry.title, ...(entry.alternates || [])];
  }

  function isCorrect(guess, entry) {
    const g = normalizeAnswer(guess);
    if (!g) return false;
    for (const answer of answersFor(entry)) {
      // "Lilo & Stitch" accepts "Lilo and Stitch" and "Lilo Stitch".
      for (const a of [normalizeAnswer(answer), normalizeAnswer(answer, " ")]) {
        if (g === a) return true;
        if (a.length > 10 && withinOneEdit(g, a)) return true;
      }
    }
    return false;
  }

  // Rough franchise key so "Toy Story" and "Toy Story 3", or "Star Wars"
  // and "The Empire Strikes Back" (alternate "Star Wars: ..."), don't
  // land on the same day.
  function franchiseKeys(entry) {
    const keys = new Set();
    for (const a of answersFor(entry)) {
      let t = stripAccents(a).toLowerCase().split(":")[0];
      t = t.replace(/\b(part )?(\d+|ii|iii|iv)\b.*$/, "");
      t = t.replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim().replace(/^(the|a|an) /, "");
      if (t) keys.add(t);
    }
    return keys;
  }

  // Day number for a local calendar date. Everyone on the same calendar
  // date gets the same puzzle, like Wordle.
  function dayNumber(date) {
    const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const epoch = Date.UTC(EPOCH.y, EPOCH.m - 1, EPOCH.d);
    return Math.floor((today - epoch) / 86400000) + 1;
  }

  function dateKey(date) {
    const p = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
  }

  // Small seeded random generator so every browser shuffles the same way.
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function usablePool(movies) {
    const seen = new Set();
    return movies.filter((m) => {
      if (!m.puzzle || m.puzzle.length < MIN_PUZZLE_LENGTH || seen.has(m.puzzle)) return false;
      seen.add(m.puzzle);
      return true;
    });
  }

  // The pool is shuffled once per "cycle" and dealt out 10 a day, so no
  // title repeats until the whole pool has been used. Each day skips
  // titles from a franchise already on that day; skipped titles roll
  // over to the next day.
  const cycleCache = new Map();
  function dealCycle(pool, cycle) {
    if (cycleCache.has(cycle)) return cycleCache.get(cycle);
    const order = pool.slice();
    const rand = mulberry32(0x5eed + cycle * 7919);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const days = [];
    let remaining = order;
    const perCycle = Math.floor(pool.length / TITLES_PER_DAY);
    for (let d = 0; d < perCycle; d++) {
      const picked = [], keys = new Set(), rest = [];
      for (const m of remaining) {
        const k = [...franchiseKeys(m)];
        if (picked.length < TITLES_PER_DAY && !k.some((x) => keys.has(x))) {
          picked.push(m); k.forEach((x) => keys.add(x));
        } else rest.push(m);
      }
      // If franchise rules leave a day short, fill it anyway.
      while (picked.length < TITLES_PER_DAY && rest.length) picked.push(rest.shift());
      days.push(picked);
      remaining = rest;
    }
    cycleCache.set(cycle, days);
    return days;
  }

  function titlesForDay(movies, day) {
    const pool = usablePool(movies);
    const perCycle = Math.floor(pool.length / TITLES_PER_DAY);
    const index = Math.max(0, day - 1);
    return dealCycle(pool, Math.floor(index / perCycle))[index % perCycle];
  }

  // 100 points for a correct answer plus up to 100 for speed.
  function pointsFor(correct, secondsUsed) {
    if (!correct) return 0;
    const left = Math.max(0, PER_TITLE_SECONDS - secondsUsed);
    return 100 + Math.round((100 * left) / PER_TITLE_SECONDS);
  }

  function emojiFor(r) {
    if (!r.correct) return "⬛";
    if (r.seconds <= 15) return "🟩";
    if (r.seconds <= 40) return "🟨";
    return "🟧";
  }

  function formatTime(totalSeconds) {
    const s = Math.round(totalSeconds);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function summarize(results) {
    const correct = results.filter((r) => r.correct).length;
    const score = results.reduce((a, r) => a + pointsFor(r.correct, r.seconds), 0);
    const totalSeconds = results.reduce((a, r) => a + r.seconds, 0);
    return { correct, score, totalSeconds };
  }

  function shareText(day, results, url) {
    const s = summarize(results);
    const lines = [
      `Vowelless Movies #${day}`,
      `${s.correct}/${results.length} · ${s.score} pts · ${formatTime(s.totalSeconds)}`,
      results.slice(0, 5).map(emojiFor).join(""),
      results.slice(5).map(emojiFor).join(""),
    ];
    if (url) lines.push(url);
    return lines.filter(Boolean).join("\n");
  }

  root.Game = {
    PER_TITLE_SECONDS, TITLES_PER_DAY, toPuzzle, normalizeAnswer, isCorrect, franchiseKeys,
    dayNumber, dateKey, titlesForDay, usablePool, pointsFor, emojiFor,
    formatTime, summarize, shareText,
  };
})(typeof window !== "undefined" ? window : globalThis);
