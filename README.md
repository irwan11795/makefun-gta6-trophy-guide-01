# Vice City Trophy Guide — GTA VI Platinum Roadmap

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/irwan11795/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/irwan11795/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

Vice City Trophy Guide is an offline web app that tracks all 55 PlayStation 5
trophies of Grand Theft Auto VI, with a guide in our own words for every
trophy, a three-step roadmap to the platinum, and a warning about the game's
one missable trophy. Built for make.fun's "Build the best GTA 6 trophy guide"
bounty ($250, top 50 share the pot).

Everything runs in your browser from local files: progress is saved in
localStorage on your machine and can be exported to a JSON file and imported
back. Nothing is uploaded anywhere, and the app makes no network request at
all — it works with the network off.

## What it does

- **All 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 of them
  hidden on PlayStation, each with its official name, description and grade
  exactly as PlayStation publishes them.
- **A guide for every trophy, in our own words** — what to do, where and
  how, and when it can be missed, with the source of each fact named beside
  the guide (PowerPyx, GTABase, KeenGamer, HowToVideoGame, GTA Zone,
  Press Start). Six trophies whose exact trigger the big guides have not
  confirmed yet are marked "unconfirmed" instead of guessing a method.
- **Roadmap to the platinum** — three phases in order: story (60–80 hours,
  5 chapters), 100% completion clean-up (about 100 hours after the story),
  then the Strangers &amp; Freaks strands and character finales (10–20
  hours). About 200 hours in all, difficulty 4/10, one playthrough.
- **The one missable trophy, flagged everywhere** — Positive Mental
  Attitude is the only trophy that can be missed: the balcony meditation in
  Chapter 1 is gone once the chapter ends, with no mission replay and no
  New Game+. It has a warning banner, a badge, and its own section in the
  roadmap.
- **Tracker** — tick trophies off as you earn them; progress and per-grade
  counts (x/55, platinum/gold/silver/bronze) are saved in localStorage.
  The platinum ticks itself when the other 54 are earned.
- **Export &amp; import** — download your progress as JSON, upload it back
  on another machine.
- **Filters** — by kind (story, completion, activities, robberies, combat,
  collectibles, exploration, money, strangers &amp; side strands, misc,
  missable only), by grade, by free-text search, earned-only, and
  unconfirmed-only.
- **Spoiler setting (on by default)** — story trophies show as "???" with
  no name, description or guide until you earn them. Turn it off to see
  everything.
- **Deep links for every view** — `?view=roadmap`, `?grade=silver`,
  `?kind=robbery`, `?trophy=28` open the roadmap, a filter, or one
  trophy's guide directly.

## Run it offline

Serve `app/` with any static HTTP server and open `app/index.html` in
desktop Chrome. For example, from this repository:

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network request: every script, stylesheet, font and file
the app loads is a file under `app/`, and it uses system fonts only.

## Layout

- `app/` — the web app (static files, no build step)
- `app/index.html` — page structure: progress, missable warning, filters, roadmap, checklist, sources
- `app/style.css` — the Vice City sunset look (original design, system fonts)
- `app/app.js` — tracker, filters, spoiler setting, export/import, detail view
- `app/data/trophies.json` — all 55 trophies with official names and
  descriptions, guides, kinds, hidden/story/missable/unconfirmed flags
- `screenshots/` — real browser captures of the app
- `main.ts` — the entry program: copies `app/` and `screenshots/` to the
  output directory and writes `dossier.json`
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

## Data &amp; sources

Trophy names and descriptions are the official PlayStation text. Guides are
written for this entry in our own words; each cites its sources:

- PowerPyx — https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- GTABase — https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series
- KeenGamer — https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/
- HowToVideoGame — https://howtovideogame.com/gta-6-trophies/
- GTA Zone — https://gta-zone.com/news/gta-6-trophies-achievements/
- Press Start — https://press-start.com.au/news/2026/11/18/gta-6-trophy-list/

Unofficial fan guide, not affiliated with Rockstar Games. No Rockstar logo,
artwork or game screenshot is used anywhere. MIT licensed.
