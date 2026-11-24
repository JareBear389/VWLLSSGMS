# Vowelless Movies

A daily puzzle: 10 movie titles with vowels (A, E, I, O, U), spaces and punctuation removed. One minute per title.

## Files

- `index.html`, `style.css`: the page.
- `game.js`: game rules with no page code (daily picks, answer matching, scoring, share text).
- `app.js`: the page logic: timer, screens, saving to the player's device.
- `movies.js`: the title list, generated from `data/movies.json` by `python3 build-movies.py` (see `data/movie-list-notes.md` for how the list was chosen).

It is a plain static site with no build step and no server code. To try it locally, open `index.html` in a browser, or run `python3 -m http.server` in this folder. It is hosted with GitHub Pages from the `main` branch, root folder.

## How it works

- **Daily titles.** Puzzle #1 is 2026-11-24 and the number goes up by one each local calendar day. The 536 titles are shuffled with a fixed seed and dealt 10 a day, so everyone gets the same 10, and nothing repeats for 53 days. After that a new shuffle starts. Two titles from one franchise (Toy Story, Toy Story 3) never share a day.
- **Timer.** 60 seconds per title, based on the clock, so leaving or reloading the page doesn't pause it. Players can guess as often as they like, or skip.
- **Answer matching.** Ignores case, accents, punctuation, spaces, a leading The/A/An, `&` vs `and`, Roman numerals II/III/IV vs 2/3/4, and allows one typo in answers over 10 letters. Alternate titles from the list are accepted too.
- **Score.** 100 points per correct title plus up to 100 for speed (full bonus at 0 seconds, none at 60). Max 2000. Total time is shown separately.
- **Share text.** Emoji grid, no spoilers: 🟩 solved in 15s or less, 🟨 in 40s or less, 🟧 slower, ⬛ missed.
- **Saving.** Everything is stored in the player's browser (`localStorage`): today's progress and a history used for played / streak / average / best.

## Known limits

- The answers are in `movies.js`, so a determined player can find them by reading the page source.
- Changing the order of `data/movies.json` after launch changes which titles future days get. Append new titles to the end.
