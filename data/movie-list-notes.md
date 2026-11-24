# Movie title list: selection rules and notes

Data file: `data/movies.json` (536 movies, enough for about 53 days of 10-title puzzles before any repeat).

## Format

A JSON array. Each entry:

```json
{ "title": "The Godfather Part II", "year": 1974, "puzzle": "THGDFTHRPRT2", "alternates": ["The Godfather 2", "Godfather II"] }
```

- `title`: the canonical answer, shown on the results screen.
- `year`: release year, useful as a hint or for display.
- `puzzle`: the string the player sees.
- `alternates`: other answers to accept (subtitles, numbers spelled out, common misspellings).

## How the puzzle string is made

1. Accents are flattened (Misérables becomes Miserables) and everything is uppercased.
2. Roman numerals II, III and IV become 2, 3 and 4. Otherwise the "I" in "II" is a vowel and gets dropped, so "Rocky II" would look identical to "Rocky".
3. Vowels A, E, I, O and U are removed. **Y is kept** as a consonant.
4. Spaces, punctuation and symbols (including &) are removed. **Digits are kept** (Apollo 13 becomes PLL13).

## What was kept and dropped

- Every puzzle string has at least 4 characters. 62 titles were dropped for being 3 or fewer (Up, Jaws, Avatar, Joker, Cars and similar), since those are too short to solve fairly.
- Titles that are only digits (300, 1917) were dropped, since the puzzle would just be the answer.
- Every puzzle string is unique in the list. Rain Man was dropped because it strips to RNMN, the same as Iron Man. Signs was dropped because SGNS also reads as Songs.
- Leading "The" and "A" are kept in the puzzle when they are part of the real title.

## Suggested answer matching for the site

Alternates cover the obvious cases, but matching should also be forgiving on its own:

- Lowercase the guess and remove everything except letters and digits before comparing, for both the title and each alternate.
- Accept the answer with or without a leading "The" or "A".
- Treat "2" and "II" (and "3"/"III", "4"/"IV") as the same.
- Consider a small typo tolerance (for example one edit for titles over 10 letters).

## Guesses I made

- "Well known" was my own judgment, leaning on box office hits, Oscar winners, Disney and Pixar, and cult favorites from the 1930s to 2024. The list leans 1980s to 2010s (about 80%).
- Some entries are harder than others: a short string like PTTN (Patton) is much harder than a long one like THSHWSHNKRDMPTN. The site could mix lengths each day so every puzzle has some easier and harder titles.
- A few franchise entries share most of their letters (Toy Story, Toy Story 2, Toy Story 3). They are different strings, but the site may want to avoid putting two of them on the same day.

## Dropped titles

| Title | Stripped | Reason |
|---|---|---|
| Jaws | JWS | fewer than 4 characters once stripped |
| Aliens | LNS | fewer than 4 characters once stripped |
| Alien | LN | fewer than 4 characters once stripped |
| Casino | CSN | fewer than 4 characters once stripped |
| Heat | HT | fewer than 4 characters once stripped |
| Se7en | S7N | fewer than 4 characters once stripped |
| Fargo | FRG | fewer than 4 characters once stripped |
| Grease | GRS | fewer than 4 characters once stripped |
| Big | BG | fewer than 4 characters once stripped |
| Avatar | VTR | fewer than 4 characters once stripped |
| Joker | JKR | fewer than 4 characters once stripped |
| Logan | LGN | fewer than 4 characters once stripped |
| X-Men | XMN | fewer than 4 characters once stripped |
| Up | P | fewer than 4 characters once stripped |
| WALL-E | WLL | fewer than 4 characters once stripped |
| Coco | CC | fewer than 4 characters once stripped |
| Cars | CRS | fewer than 4 characters once stripped |
| Moana | MN | fewer than 4 characters once stripped |
| Zootopia | ZTP | fewer than 4 characters once stripped |
| Dumbo | DMB | fewer than 4 characters once stripped |
| Bambi | BMB | fewer than 4 characters once stripped |
| Mulan | MLN | fewer than 4 characters once stripped |
| Ice Age | CG | fewer than 4 characters once stripped |
| Speed | SPD | fewer than 4 characters once stripped |
| Con Air | CNR | fewer than 4 characters once stripped |
| Taken | TKN | fewer than 4 characters once stripped |
| Dune | DN | fewer than 4 characters once stripped |
| Get Out | GTT | fewer than 4 characters once stripped |
| It | T | fewer than 4 characters once stripped |
| Carrie | CRR | fewer than 4 characters once stripped |
| Elf | LF | fewer than 4 characters once stripped |
| Ray | RY | fewer than 4 characters once stripped |
| Rain Man | RNMN | same puzzle as Iron Man (RNMN) |
| Rudy | RDY | fewer than 4 characters once stripped |
| Creed | CRD | fewer than 4 characters once stripped |
| Tootsie | TTS | fewer than 4 characters once stripped |
| Hook | HK | fewer than 4 characters once stripped |
| Barbie | BRB | fewer than 4 characters once stripped |
| Tenet | TNT | fewer than 4 characters once stripped |
| Zodiac | ZDC | fewer than 4 characters once stripped |
| Sicario | SCR | fewer than 4 characters once stripped |
| Drive | DRV | fewer than 4 characters once stripped |
| 300 | 300 | all digits, puzzle gives the answer away |
| Troy | TRY | fewer than 4 characters once stripped |
| 1917 | 1917 | all digits, puzzle gives the answer away |
| Selma | SLM | fewer than 4 characters once stripped |
| Brave | BRV | fewer than 4 characters once stripped |
| Soul | SL | fewer than 4 characters once stripped |
| Luca | LC | fewer than 4 characters once stripped |
| Babe | BB | fewer than 4 characters once stripped |
| Tron | TRN | fewer than 4 characters once stripped |
| I, Robot | RBT | fewer than 4 characters once stripped |
| Looper | LPR | fewer than 4 characters once stripped |
| Her | HR | fewer than 4 characters once stripped |
| Signs | SGNS | SGNS also reads as Songs |
| Saw | SW | fewer than 4 characters once stripped |
| Us | S | fewer than 4 characters once stripped |
| Nope | NP | fewer than 4 characters once stripped |
| Juno | JN | fewer than 4 characters once stripped |
| CODA | CD | fewer than 4 characters once stripped |
| Rush | RSH | fewer than 4 characters once stripped |
| Elvis | LVS | fewer than 4 characters once stripped |
| Wonka | WNK | fewer than 4 characters once stripped |
| Aquaman | QMN | fewer than 4 characters once stripped |
| Venom | VNM | fewer than 4 characters once stripped |
| Dr. No | DRN | fewer than 4 characters once stripped |