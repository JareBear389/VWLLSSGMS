(function () {
  const G = window.Game;
  const $ = (id) => document.getElementById(id);
  const STATE_PREFIX = "vowelless:day:";
  const HISTORY_KEY = "vowelless:history";

  const now = new Date();
  const day = G.dayNumber(now);
  const key = G.dateKey(now);
  const titles = G.titlesForDay(window.MOVIES, day);

  // Saved on this device only. Shape:
  // { day, index, startedAt, results: [{ guess, correct, seconds }] }
  let state = load(STATE_PREFIX + key) || { day, index: 0, startedAt: null, results: [] };
  let ticker = null;

  function load(k) {
    try { return JSON.parse(localStorage.getItem(k)); } catch { return null; }
  }
  function save() {
    try { localStorage.setItem(STATE_PREFIX + key, JSON.stringify(state)); } catch {}
  }

  function show(id) {
    for (const s of ["intro", "play", "results"]) $(s).hidden = s !== id;
  }

  // ---------- Playing ----------

  function startTitle() {
    if (state.startedAt == null) { state.startedAt = Date.now(); save(); }
    const puzzle = titles[state.index].puzzle;
    $("puzzle").innerHTML = [...puzzle].map((c) => `<span>${c}</span>`).join("");
    $("counter").textContent = `${state.index + 1} / ${titles.length}`;
    $("guess").value = "";
    $("feedback").textContent = "";
    $("feedback").className = "feedback";
    renderDots();
    show("play");
    $("guess").focus();
    clearInterval(ticker);
    ticker = setInterval(tick, 200);
    tick();
  }

  function elapsed() {
    return Math.min(G.PER_TITLE_SECONDS, (Date.now() - state.startedAt) / 1000);
  }

  function tick() {
    const used = elapsed();
    const left = Math.max(0, G.PER_TITLE_SECONDS - used);
    $("clock").textContent = G.formatTime(Math.ceil(left));
    $("clock").classList.toggle("low", left <= 10);
    $("bar-fill").style.width = `${(left / G.PER_TITLE_SECONDS) * 100}%`;
    if (left <= 0) finishTitle(false, $("guess").value.trim(), true);
  }

  function finishTitle(correct, guess, timedOut = false) {
    clearInterval(ticker);
    const seconds = Math.round(elapsed() * 10) / 10;
    state.results.push({ guess, correct, seconds, timedOut });
    state.index += 1;
    state.startedAt = null;
    save();

    const fb = $("feedback");
    if (correct) { fb.textContent = `Correct! +${G.pointsFor(true, seconds)}`; fb.className = "feedback good"; }
    else { fb.textContent = timedOut ? "Time’s up" : "Skipped"; fb.className = "feedback bad"; }
    renderDots();
    $("guess").disabled = true;
    setTimeout(() => {
      $("guess").disabled = false;
      if (state.index >= titles.length) showResults(true);
      else startTitle();
    }, 900);
  }

  function renderDots() {
    $("dots").innerHTML = titles.map((_, i) => {
      const r = state.results[i];
      const cls = r ? (r.correct ? "good" : "bad") : i === state.index ? "current" : "";
      return `<li class="${cls}"></li>`;
    }).join("");
  }

  $("guess-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($("guess").disabled || state.startedAt == null) return;
    const guess = $("guess").value.trim();
    if (!guess) return;
    if (G.isCorrect(guess, titles[state.index])) {
      finishTitle(true, guess);
    } else {
      const p = $("puzzle");
      p.classList.remove("shake"); void p.offsetWidth; p.classList.add("shake");
      $("feedback").textContent = "Not quite. Keep trying.";
      $("feedback").className = "feedback bad";
      $("guess").select();
    }
  });

  $("skip").addEventListener("click", () => {
    if ($("guess").disabled || state.startedAt == null) return;
    finishTitle(false, "");
  });

  $("start").addEventListener("click", startTitle);

  // ---------- Results ----------

  function recordHistory() {
    const history = load(HISTORY_KEY) || {};
    if (!history[key]) {
      const s = G.summarize(state.results);
      history[key] = { day, correct: s.correct, score: s.score, totalSeconds: s.totalSeconds };
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
    }
    return history;
  }

  function streak(history) {
    let n = 0;
    const d = new Date(now);
    while (history[G.dateKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function showResults() {
    clearInterval(ticker);
    const s = G.summarize(state.results);
    $("r-correct").textContent = `${s.correct}/${titles.length}`;
    $("r-score").textContent = s.score;
    $("r-time").textContent = G.formatTime(s.totalSeconds);

    // Link back to the game in the share text, except when embedded in a frame
    // (like a preview), where the address would be wrong.
    const url = window.top === window && location.protocol.startsWith("http") ? location.origin + location.pathname : "";
    const text = G.shareText(day, state.results, url);
    $("share-preview").textContent = G.shareText(day, state.results, "");
    $("share").onclick = () => share(text);

    $("answers").innerHTML = titles.map((t, i) => {
      const r = state.results[i];
      const meta = r.correct ? `Solved in ${Math.round(r.seconds)}s`
        : r.timedOut ? (r.guess ? `Time ran out on “${escapeHtml(r.guess)}”` : "Time ran out") : "Skipped";
      return `<li><span class="em">${G.emojiFor(r)}</span><span class="title">${escapeHtml(t.title)} <span class="year">(${t.year})</span></span>` +
        `<span class="pts">${G.pointsFor(r.correct, r.seconds)}</span>` +
        `<span class="meta">${t.puzzle} · ${meta}</span></li>`;
    }).join("");

    const history = recordHistory();
    const games = Object.values(history);
    $("s-played").textContent = games.length;
    $("s-streak").textContent = streak(history);
    $("s-avg").textContent = Math.round(games.reduce((a, g) => a + g.score, 0) / games.length);
    $("s-best").textContent = Math.max(...games.map((g) => g.score));
    show("results");
  }

  async function share(text) {
    const msg = $("share-msg");
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ text }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      msg.textContent = "Copied to clipboard.";
    } catch {
      msg.textContent = "Couldn’t copy automatically. Select the text above to copy it.";
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // ---------- Boot ----------

  $("subtitle").textContent = `Movies · Puzzle #${day}`;
  if (state.index >= titles.length) showResults();
  else if (state.startedAt != null || state.index > 0) startTitle();
  else show("intro");

  // If time ran out while the page was closed, record it on return.
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !$("play").hidden) tick(); });
})();
