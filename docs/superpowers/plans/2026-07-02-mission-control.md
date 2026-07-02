# Mission Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One single-file neon PWA at `sports/mission/` that combines 8 dashboards into live animated tiles with a self-promoting hero slot.

**Architecture:** One `index.html` (inline CSS+JS, no libraries, no build) + manifest + service worker + icon, deployed as a subfolder of the `sports` GitHub Pages repo like bears/whitesox/weather. Each tile is an independent module (own fetch, render, fallback); a 60s shared timer refreshes data via `Promise.allSettled`; a pure function picks the hero tile.

**Tech Stack:** Vanilla HTML/CSS/JS. APIs: api.fifa.com, statsapi.mlb.com, TheSportsDB (key "3"), Open-Meteo, BigDataCloud, Yahoo v8 spark via api.allorigins.win.

## Global Constraints

- Single file app: all CSS/JS inline in `mission/index.html`. No external libraries, no build step.
- Free/keyless APIs only, exactly the endpoints listed per task (all proven in sibling apps).
- Palette (locked): bg `#07070f`, tile `#0d0d1d`, muted `#8b93b8`, accents `#00f5d4` `#f15bb5` `#9b5de5` `#00bbf9`; gradient-ring border via mask-composite; pulsing dot `#ff3b5c`.
- Countdown digits: `font-variant-numeric:tabular-nums`, digit pairs `min-width:2ch`, seconds flip inside clipped `1.25em` window (locked mockup v2).
- Only JS timers: one 60s data timer, one 1s countdown tick. Everything else CSS animation.
- Every tile must render a snapshot fallback if its fetch fails; a tile failure never blocks the board; zero console errors.
- Phone-first: layout verified at 390px width.
- Service worker cache name `mission-v1`; bump suffix on every deployed change.
- Verification = browser preview with live data (preview server + eval/screenshot), per task.

**Working directory: `~/sports` (the GitHub Pages repo). Do NOT push until the final task; commit locally per task.**

---

### Task 1: Static shell — neon board, 8 placeholder tiles, PWA files

**Files:**
- Create: `mission/index.html`
- Create: `mission/manifest.webmanifest`
- Create: `mission/sw.js`
- Create: `mission/icon-512.png`

**Interfaces:**
- Produces: DOM ids `#now`, `#hero`, `#grid`; tile container ids `#t-wc,#t-sox,#t-bears,#t-wx,#t-trip,#t-stk,#t-euro`; CSS classes `.tile,.hero,.lbl,.big,.dot,.chip,.g2` used by all later tasks.

- [ ] **Step 1: Write `mission/index.html` skeleton**

Full document with: `<meta name=viewport content="width=device-width,initial-scale=1">`, manifest link, apple-touch-icon, `<header id="now">` (drifting gradient strip: weekday/date left, ticking clock right, city placeholder), `<main>` with `<div id="hero"></div>` and `<div id="grid" class="g2"></div>`, 7 tile divs inside grid each `<div class="tile" id="t-xx" onclick="location.href='<target URL from spec>'">` containing `.lbl` label row and `.big` value placeholder "—". CSS (inline `<style>`): locked palette above plus:

```css
body{margin:0;background:#07070f;color:#eaf6ff;font-family:-apple-system,system-ui,sans-serif}
#now{background:linear-gradient(-45deg,#0d0d2b,#1b1040,#0a2a3f,#0d0d2b);background-size:300% 300%;animation:drift 12s ease infinite;padding:14px 16px;display:flex;justify-content:space-between;font-weight:800}
@keyframes drift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
main{padding:12px;max-width:640px;margin:0 auto}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.tile{background:#0d0d1d;border-radius:14px;padding:12px 14px;position:relative;font-weight:600;font-size:13px;cursor:pointer}
.tile::before{content:"";position:absolute;inset:-1px;border-radius:15px;padding:1px;background:linear-gradient(90deg,#00f5d4,#f15bb5,#9b5de5,#00bbf9,#00f5d4);background-size:200% 100%;animation:glow 3s linear infinite;-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;z-index:0}
.tile>*{position:relative;z-index:1}
@keyframes glow{to{background-position:200% 0%}}
.hero-slot .tile{grid-column:1/-1}
#hero .tile{box-shadow:0 0 24px rgba(241,91,181,.18);margin-bottom:10px}
.lbl{font-size:11px;letter-spacing:.08em;color:#8b93b8;text-transform:uppercase;font-weight:700;display:flex;justify-content:space-between;align-items:center}
.big{font-size:22px;font-weight:800;font-variant-numeric:tabular-nums;margin-top:6px;display:block}
.dot{width:8px;height:8px;border-radius:50%;background:#ff3b5c;display:inline-block;margin-right:6px;animation:pulse 1.2s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
.chip{font-size:9px;color:#8b93b8;border:1px solid #262645;border-radius:8px;padding:1px 6px;font-weight:700}
@keyframes flashy{0%{background:#26264d}100%{background:#0d0d1d}}
.flash{animation:flashy .8s ease-out}
```

Accent helper classes `.a-teal,.a-pink,.a-purp,.a-blue` = color + matching text-shadow glow.

- [ ] **Step 2: Write `manifest.webmanifest`** — name "Mission Control", short_name "Mission", display standalone, background/theme `#07070f`, icon `icon-512.png`.

- [ ] **Step 3: Write `sw.js`** — copy the pattern from `~/sports/whitesox/sw.js` verbatim, cache name `mission-v1`, precache `./`, `./index.html`, `./manifest.webmanifest`, `./icon-512.png`.

- [ ] **Step 4: Make icon** — 🚀 glyph on `#07070f` tile:

```bash
cd ~/sports/mission
python3 - <<'PY'
# render 512px PNG: dark rounded square + rocket emoji via qlmanage-free path
PY
# simplest: reuse the house pattern — render emoji to PNG with textutil/qlmanage
# (same technique used for weather ⛅ icon; if qlmanage flow is fiddly, screenshot-crop works)
```

Any 512×512 PNG with 🚀 on `#07070f` passes. Verify: `file icon-512.png` → PNG 512 x 512.

- [ ] **Step 5: Verify shell in browser**

Add launch config (in whatever repo/session runs preview) serving `~/sports` on port 8095, open `http://127.0.0.1:8095/mission/`. Check: 7 tiles render 2-across with flowing gradient borders, header gradient drifts, zero console errors, layout intact at 390px (`preview_resize` mobile).

- [ ] **Step 6: Commit** — `git add mission && git commit -m "mission: static neon shell + PWA scaffolding"`

---

### Task 2: Core runtime — tile registry, fetch loop, fallback chips, hero engine

**Files:**
- Modify: `mission/index.html` (script section)

**Interfaces:**
- Produces (used by every tile task):
  - `reg(id, {fetch:async()=>state, render:(el,state)=>void, snapshot:state, hero:(state)=>({p:int,html:string}|null)})` — register a tile module.
  - `state.live===true` marks a tile as live-now.
  - `pickHero(entries)` pure function: array of `{id,p,html}` → highest `p` wins (ties: registration order); returns `null` if empty.
  - `setVal(el,html)` renders into the tile's `.big` slot with `.flash` animation when content changed.
  - `chip(el,text)` shows/clears the snapshot chip in the tile's `.lbl` row.
- Hero priorities (from spec): live game=100 (WC 100, Sox 99, Bears 98, Euro 97), trip<24h=90, market open & |day%|>1 = 80, next-upcoming fallback = 10−minutes-until/100000 (soonest wins).

- [ ] **Step 1: Implement the runtime** (inside `<script>`):

```js
const TILES=[];const $=s=>document.querySelector(s);
function reg(id,mod){TILES.push({id,el:$('#t-'+id.replace(/^t-/,'')),...mod,state:mod.snapshot});}
function setVal(el,html){const b=el.querySelector('.big');if(b.innerHTML!==html){b.innerHTML=html;el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');}}
function chip(el,text){let c=el.querySelector('.chip');if(!text){if(c)c.remove();return;}
  if(!c){c=document.createElement('span');c.className='chip';el.querySelector('.lbl').appendChild(c);}c.textContent=text;}
function pickHero(es){return es.reduce((a,b)=>b&&(!a||b.p>a.p)?b:a,null);}
async function pass(){
  await Promise.allSettled(TILES.map(async t=>{
    try{t.state=await t.fetch();chip(t.el,null);}
    catch(e){t.state=t.state||t.snapshot;chip(t.el,'snapshot');}
    t.render(t.el,t.state);
  }));
  const h=pickHero(TILES.map(t=>t.hero?t.hero(t.state):null).filter(Boolean));
  const hb=$('#hero');hb.innerHTML=h?h.html:'';hb.style.display=h?'block':'none';
}
pass();setInterval(pass,60000);
```

- [ ] **Step 2: Self-check `pickHero`** — temporary console assert block at end of script:

```js
console.assert(pickHero([{p:10},{p:100},{p:90}]).p===100,'hero: live wins');
console.assert(pickHero([])===null,'hero: empty ok');
```

- [ ] **Step 3: Verify in browser** — reload preview; console shows no assertion failures, no errors; tiles show placeholder states. Remove asserts after pass.

- [ ] **Step 4: Commit** — `git commit -am "mission: tile runtime, fallback chips, hero engine"`

---

### Task 3: Trips tile + Now strip (no APIs — pure local)

**Files:**
- Modify: `mission/index.html`

**Interfaces:**
- Consumes: `reg`, `setVal`. Produces: 1s ticker `tick1s(fn)` shared registry, countdown HTML pattern (fixed-slot digits) reused by hero.

- [ ] **Step 1: Implement.** Baked trips (from spec): Austin `2026-07-20`, Tokyo `2026-09-19`, San Juan `2026-10-04`. Countdown to next future date, render:

```js
const TRIPS=[["Austin","2026-07-20"],["Tokyo","2026-09-19"],["San Juan","2026-10-04"]];
function nextTrip(){const now=Date.now();return TRIPS.map(([n,d])=>[n,new Date(d+"T12:00:00")]).find(([,d])=>d>now);}
function cdHTML(ms){const s=Math.max(0,Math.floor(ms/1000));const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),ss=s%60;
  const seg=(v,u)=>`<b style="min-width:2ch;display:inline-block;text-align:right">${String(v).padStart(2,'0')}</b><small style="font-size:10px;color:#8b93b8">${u}</small>`;
  return `<span class="a-purp" style="display:inline-flex;gap:2px;align-items:baseline">${seg(d,'D')}${seg(h,'H')}${seg(m,'M')}${seg(ss,'S')}</span>`;}
```

Register tile `trip`: fetch = compute nextTrip (never throws); render = name in `.lbl`, `cdHTML` in `.big`; hero = departure <24h → `{p:90,...}`. 1s interval updates only the trip tile's `.big` and the Now clock (`toLocaleTimeString`).

- [ ] **Step 2: Verify** — preview eval: trip tile shows `Austin` + ticking `17D ..H ..M ..S`, seconds change each second, digit columns don't shift (screenshot two seconds apart, compare x-positions). Now strip clock ticks.

- [ ] **Step 3: Commit** — `git commit -am "mission: trips countdown tile + now strip clock"`

---

### Task 4: Weather tile + city in Now strip

**Files:**
- Modify: `mission/index.html`

**Interfaces:** Consumes `reg,setVal,chip`. Produces `GEO={lat,lon,city}` shared with Now strip.

- [ ] **Step 1: Implement.** Geolocation (5s timeout) → fallback Chicago `41.88,-87.63`. Reverse-geocode: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=..&longitude=..&localityLanguage=en` → `.city||.locality`. Weather: `https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current=temperature_2m,weather_code&temperature_unit=fahrenheit`. WMO code→emoji map (copy the lookup from `~/sports/weather/index.html`). Render `78° ⛅` in `.a-blue`; city into `#now`. Snapshot: `{t:'—',e:'🌤️'}` + chip. No hero entry (weather never promotes).

- [ ] **Step 2: Verify** — preview: real temp renders for your location (or Chicago if permission denied in preview — both acceptable), city appears in header, zero console errors. Block open-meteo via devtools → chip shows `snapshot`, board intact.

- [ ] **Step 3: Commit** — `git commit -am "mission: live weather tile + geolocated city"`

---

### Task 5: WC 2026 tile (FIFA)

**Files:**
- Modify: `mission/index.html`

**Interfaces:** Consumes `reg,setVal,chip,cdHTML`. Produces FIFA fetch pattern for hero (`p:100`).

- [ ] **Step 1: Implement.** Fetch `https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&count=200&language=en` (`cache:"no-store"`). Map like the WC app (TeamName[0].Description, Score, MatchStatus; alias "Cabo Verde"→"Cape Verde" etc. — copy `ALIASF` + `_nm` from `worldcup2026/world-cup-2026.html`). State: `{live:[{h,a,hs,as,min}],next:{h,a,dt}}` where live = `MatchStatus===3` (min from `MatchTime`), next = earliest future match. Render: live → `<span class="dot"></span>` + `POR 2–1 CRO`-style in `.a-pink` + minute; else `Next: 🇦🇷 vs 🇨🇻 · Fri 18:00`. Hero: live → `{p:100, html:}` hero card (flags + names + big glowing score + minute, the locked mockup layout); no live → null. **Auto-retire:** if now > `2026-07-19T23:59-04:00` and no live/next, tile hides (`el.style.display='none'`).
- Snapshot: `{live:[],next:null}` → tile shows `Tournament — see bracket` + chip.

- [ ] **Step 2: Verify** — preview during the day (matches 83–85 on Jul 2, 86–88 Jul 3): either LIVE hero with pulsing dot + score, or "Next:" state with correct fixture. Console clean.

- [ ] **Step 3: Commit** — `git commit -am "mission: WC 2026 live tile + hero"`

---

### Task 6: White Sox tile (MLB statsapi)

**Files:**
- Modify: `mission/index.html`

**Interfaces:** Consumes runtime. Hero `p:99` when live.

- [ ] **Step 1: Implement.** Fetch `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=145&startDate=<today-1>&endDate=<today+7>` (dates local YYYY-MM-DD). From `dates[].games[]`: live = `status.abstractGameState==="Live"` (score via `teams.home.score/away`), else next `Preview` game → `7:10 vs DET` (opponent = other team's `team.name` shortened to last word uppercased 3 chars via `abbrev` map fallback `.slice(0,3).toUpperCase()`; time from `gameDate` in `America/Chicago`). Final today → `W 5–3 DET` / `L`. Snapshot chip on failure.

- [ ] **Step 2: Verify** — preview: tile shows tonight's game or last final, matches statsapi reality (cross-check `curl` the endpoint). Live game (if one) promotes to hero only when WC isn't live.

- [ ] **Step 3: Commit** — `git commit -am "mission: White Sox live tile"`

---

### Task 7: Bears + Euro tiles (TheSportsDB)

**Files:**
- Modify: `mission/index.html`

**Interfaces:** Consumes runtime. Bears hero `p:98` (live), Euro `p:97`.

- [ ] **Step 1: Implement shared helper** `tsdb(p)` = fetch `https://www.thesportsdb.com/api/v1/json/3/${p}` → json. Bears: `eventsnext.php?id=134938` → first event → `Sun 12:00 vs GB` style (strTimestamp → local). Off-season/empty → `eventslast.php?id=134938` → `Last: W 24–17`. Euro: `eventsnext.php?id=133738` (Real Madrid) and `id=133616` (West Ham) — soonest of the two → `RMA · Sat 2:00`. Free tier flaky → snapshot chips with baked next-game text acceptable.

- [ ] **Step 2: Verify** — both tiles render real or snapshot states, chips correct when API capped (block domain to drill), console clean.

- [ ] **Step 3: Commit** — `git commit -am "mission: Bears + Euro tiles via TheSportsDB"`

---

### Task 8: Stocks tile (Yahoo via allorigins + shared localStorage)

**Files:**
- Modify: `mission/index.html`

**Interfaces:** Consumes runtime. Hero `p:80` when market open AND |day%|>1.

- [ ] **Step 1: Implement.** Copy the stocks app's `proxy()` helper (allorigins wrapper, up to 9 retries with backoff — lift verbatim from `~/sports/stocks/index.html`). Read `localStorage.stocks_holdings` + `stocks_watchlist` (same origin — shared with stocks app). Holdings present → batch quote via `v8/finance/spark?symbols=..&range=1d&interval=15m`, day P/L = Σ shares×(last−prevClose) using **last two daily closes** (spec: not chartPreviousClose). Render `+$412 ▲ +1.2%` `.a-teal` green / red. No holdings → SPY day % instead. Market open = weekday && 8:30–15:00 `America/Chicago`. Snapshot chip on proxy exhaustion.

- [ ] **Step 2: Verify** — preview: real number renders and sign/color agree with market; devtools-block allorigins → snapshot chip, no errors.

- [ ] **Step 3: Commit** — `git commit -am "mission: portfolio day P/L tile"`

---

### Task 9: Hero drill + fallback drill + polish

**Files:**
- Modify: `mission/index.html`

- [ ] **Step 1: Hero end-to-end drill** — preview evals: (a) current reality renders correct hero per priority table; (b) force-test by temporarily stubbing states in console (`TILES.find(t=>t.id==='wc').state={live:[...]}` then `pass()`) → hero switches; (c) no live anything → soonest-event fallback hero.
- [ ] **Step 2: Full fallback drill** — devtools block ALL api domains → every tile shows snapshot chip, board renders, zero console errors.
- [ ] **Step 3: Polish pass** — count-up animation on first paint (animate numbers 0→value over 600ms), score-change `.flash` verified, 390px screenshot clean, no horizontal scroll.
- [ ] **Step 4: Commit** — `git commit -am "mission: hero drills, fallback drills, motion polish"`

---

### Task 10: Launcher tile + deploy

**Files:**
- Modify: `index.html` (sports launcher root)
- Modify: `mission/sw.js` (bump to final `mission-v1`)

- [ ] **Step 1: Add 🚀 Mission Control tile** to the launcher grid in `~/sports/index.html`, linking `./mission/` — copy the exact markup pattern of the existing Weather tile.
- [ ] **Step 2: Final browser pass** — full board screenshot (desktop + 390px) as proof.
- [ ] **Step 3: Push** — `git push` (SSH, set-and-forget; GitHub Pages auto-deploys). Verify live: `curl -sI https://jangelog1.github.io/sports/mission/ | head -1` → 200 (may take ~1 min).
- [ ] **Step 4: Tell John** to open https://jangelog1.github.io/sports/mission/ on iPhone → Share → Add to Home Screen.

---

## Self-review notes
- Spec coverage: 8 tiles ✓ (WC T5, Sox T6, Bears+Euro T7, Weather+Now T4/T3, Trips T3, Stocks T8, hero rules T2/T9, PWA+launcher T1/T10). Fantasy excluded per spec. WC auto-retire in T5 ✓. Snapshot fallbacks every tile ✓.
- Types consistent: `reg/setVal/chip/pickHero/cdHTML/tsdb/proxy` names used identically across tasks.
- No placeholders: every task carries its code or an exact copy-source (`lift verbatim from <file>` counts as exact).
