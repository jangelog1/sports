# Mission Control — Design Spec
*2026-07-02 · approved by John*

## Summary
A single-file PWA ("Mission Control") that combines John's existing dashboards into one animated, neon, phone-first home screen. Each of 8 live tiles shows the one number that matters right now, pulled from the same free/keyless APIs the standalone apps already use. Tapping a tile opens the corresponding full dashboard. Hosted like every other app: a subfolder of the `sports` GitHub Pages repo.

## Goals
- One glance with coffee replaces opening 7 separate apps.
- Feels alive: colorful, moving, reshuffles itself around what's happening NOW.
- Set-and-forget: no keys, no logins, no maintenance, snapshot fallbacks everywhere.

## Non-goals (v1)
- Fantasy tile (explicitly benched; revisit later).
- Push notifications (iOS PWA limitations).
- Anything requiring iOS Calendar or CrewHub (impossible from a web app — Shortcuts territory).
- Editing/config UI. Tiles are fixed in code.

## Visual design — "Neon Nights" (locked via mockup)
- Near-black background `#07070f`; tiles `#0d0d1d`.
- Each tile has a flowing animated gradient border (conic/linear gradient, `mask-composite` ring trick), palette: `#00f5d4` teal, `#f15bb5` pink, `#9b5de5` purple, `#00bbf9` blue.
- Big numbers glow (text-shadow) in per-tile accent colors; labels are small-caps muted `#8b93b8`.
- Pulsing red LIVE dot; score-change flash; count-up animation on first paint.
- Trip countdown: fixed-width digit slots (`tabular-nums`, `min-width:2ch`), seconds flip inside a clipped `1.25em` window (locked in mockup v2 after overflow fix).
- Ambient drifting gradient in the header ("Now" strip).
- All motion is CSS animation; the only JS interval faster than 60s is the 1-second countdown tick.

## Layout — live-first smart grid (locked via mockup)
- Header "Now" strip: date, local time, location city.
- **Hero slot** (full-width, glowing): auto-promoted by priority:
  1. Live game in progress — priority order WC 2026 → White Sox → Bears → Real Madrid/West Ham
  2. Trip departing within 24h (countdown)
  3. US market open AND portfolio day move > 1%
  4. Fallback: the next upcoming event (soonest kickoff/first pitch/departure)
- All other tiles pack in a 2-column grid, order fixed: Stocks, Trips, Weather, Sox, Bears, Euro, WC (when not hero).
- Board re-evaluates hero + tile contents every 60s.

## Tiles (8)
| Tile | Live content | Source | Tap → |
|---|---|---|---|
| WC 2026 | Live score + minute, else next match / bracket status; auto-hides after Jul 19 final | api.fifa.com calendar (idCompetition=17, idSeason=285023) | jangelog1.github.io/worldcup2026/ |
| White Sox | Live score, else next game (7:10 vs DET style) | statsapi.mlb.com (teamId=145) | …/sports/whitesox/ |
| Bears | Next/last game | TheSportsDB (id 134938, free key 3, overlay-only) | …/sports/bears/ |
| Weather | Current temp + condition at actual location | Open-Meteo + browser geolocation + BigDataCloud reverse-geocode | …/sports/weather/ |
| Trips | Next trip countdown (d/h/m/s ticking): Austin Jul 20, Tokyo Sep 19, San Juan Oct 4 | baked dates (same data as trips.html) | …/sports/trips/ |
| Stocks | Portfolio day gain/loss $ and %, green/red glow | Yahoo v8 spark via api.allorigins.win proxy, retry w/ backoff; reads localStorage `stocks_holdings`/`stocks_watchlist` (same origin as stocks app → shared) | …/sports/stocks/ |
| Euro | Next Real Madrid / West Ham fixture | TheSportsDB | jangelog1.github.io/euro-football/ |
| Now strip | Date, time, city | Date() + geolocation result (shared with Weather) | — |

## Architecture
- **One file**: `mission/index.html` in the `sports` repo → https://jangelog1.github.io/sports/mission/
- No libraries, no build step. Inline CSS + JS, same as all sibling apps.
- Service worker cache `mission-v1` (bump on changes), manifest + 512px icon (🚀 on dark tile), launcher gets a 🚀 Mission Control tile.
- Each tile is an independent module: own fetch, own render, own error state. A tile failure renders that tile's snapshot/fallback state; never blocks the board.
- Refresh cadence: full data pass on load + every 60s; countdown ticks every 1s locally; no fetch storms (single shared timer, tiles fetched in parallel with Promise.allSettled).

## Error handling
- Per-tile baked snapshot fallback (house pattern): tile shows last-known/baked value + a subtle "snapshot" chip instead of blanking.
- allorigins rate-limits: reuse the stocks app's retry-with-backoff proxy helper (up to 9 attempts) and derive 1-day change from last two daily closes, not chartPreviousClose.
- Geolocation denied → default city Chicago; Trip tab data unaffected.
- TheSportsDB free-tier caps → Bears/Euro tiles are best-effort overlay, snapshot text otherwise.

## Testing / acceptance
- Rendered in browser with live data: hero promotion correct for (a) a live WC/Sox game, (b) no live games (next-event fallback).
- Countdown ticks smoothly, digits don't shift width.
- Kill each API (devtools block) → tile falls back, board intact, zero console errors.
- Lighthouse-level sanity on iPhone width (390px), dark scrollbar-free layout.
- PWA installs from GitHub Pages; sw cache updates on version bump.

## Rollout
1. Build `mission/index.html` + icon + manifest + sw in the sports repo.
2. Verify locally in browser (live data + fallback drills).
3. Push to `sports` repo → GitHub Pages; add launcher tile; add to iPhone Home Screen.
