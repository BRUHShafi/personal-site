# Personal Website Project

## Project Goal
A personal portfolio/website built as a learning project. The goal is to learn web development alongside tools like GitHub, version control, and deployment workflows.

## Tech Stack
- **Frontend:** React 19 + Vite
- **Styling:** CSS (vanilla for now)
- **Backend:** Empty — to be determined
- **Package Manager:** npm

## Project Structure
```
personal-site/
├── frontend/
│   └── portfolio/        # React app (Vite)
│       ├── src/
│       │   ├── App.jsx               # Root component — imports all sections
│       │   ├── App.css               # App-level styles (mostly empty, components have own CSS)
│       │   ├── main.jsx
│       │   ├── index.css             # Global design tokens + shared styles
│       │   ├── hooks/
│       │   │   └── useScrollReveal.js  # IntersectionObserver hook for scroll animations
│       │   └── components/
│       │       ├── Navbar.jsx / .css   # Fixed top nav, scrolled state
│       │       ├── Hero.jsx / .css     # Split hero: bouncing name left, throne placeholder right
│       │       ├── About.jsx / .css    # 01 // The Essence — bio + cards
│       │       ├── Interests.jsx / .css # 02 // Curations — bento grid of interests
│       │       ├── Skills.jsx / .css   # 03 // Toolkit — pill-style skill tags
│       │       ├── Projects.jsx / .css # 04 // Artifacts — alternating project cards
│       │       ├── Resume.jsx / .css   # 05 // Résumé — experience entries + download link
│       │       ├── Contact.jsx / .css  # Contact card with email form
│       │       └── Footer.jsx / .css   # Logo, copyright, social links
│       ├── index.html
│       └── package.json
└── backend/              # Not yet set up
```

## Design Reference
Designed with Stitch. Visual style: dark background, neon cyan/magenta/green accents, Space Grotesk + Space Mono fonts, scroll-triggered reveal animations.

Sections in order:
1. **Hero** — split layout, large bouncing name (left), 3D throne placeholder (right, to be filled later)
2. **About** (01) — two-column: heading left, bio + info cards right
3. **Interests** (02) — bento grid with 4 interest cards
4. **Skills** (03) — pill badges
5. **Projects** (04) — alternating image + text cards
6. **Resume** (05) — experience timeline + PDF download
7. **Contact** — rounded card with email form
8. **Footer** — logo, copyright, social links

## Dev Commands
```bash
# Run the frontend locally
cd frontend/portfolio
npm run dev

# Build for production
npm run build
```

## What Still Needs Personal Info (placeholders)
- Name — update in `Navbar.jsx`, `Hero.jsx`, `Footer.jsx`, `index.html`
- Subtitle/tagline — `Hero.jsx`
- Bio — `About.jsx`
- Interests — `Interests.jsx`
- Skills list — `Skills.jsx`
- Projects — `Projects.jsx`
- Experience — `Resume.jsx`
- Social links — `Footer.jsx`
- Email contact — `Contact.jsx` (TODO: wire to EmailJS or Formspree)

## Learning Goals
- Git & GitHub (branching, commits, PRs, issues)
- React fundamentals
- Building and deploying a personal site
- Potentially adding a backend later

## Notes
- This project is used as a hands-on learning environment — prefer clear, simple approaches over clever abstractions
- Explain things when introducing new concepts or tools
- Record all significant work done in this file (CLAUDE.md)

## Progress Log
### Session 1
- Set up React + Vite project structure
- Created global design tokens in `index.css` (colors, fonts, scroll reveal)
- Built: Navbar, Hero, About, Skills, Projects, Resume components + CSS
- Created `useScrollReveal` hook (IntersectionObserver)
- Added Google Fonts: Space Grotesk + Space Mono

### Session 2
- Wired up `App.jsx` (was still Vite boilerplate — now imports all components)
- Created missing `Contact.jsx` + `Contact.css` (styled card with email form)
- Created `Interests.jsx` + `Interests.css` (02 // Curations bento grid section)
- Created `Footer.jsx` + `Footer.css` (logo, copyright, social links)
- Fixed section numbering: Skills 02→03, Projects 03→04, Resume 04→05
- Changed section label color from cyan to green to match design reference

### Session 3
- First GitHub commit: staged and committed all project files with message "Add full portfolio structure: components, styles, and design system"
- Created `dev` branch — all future work happens here, main stays stable
- Pushed `dev` branch to GitHub
- Updated branding: navbar/footer/tab title = "Shafi", hero name = "MD Mushfiqur Rahman"
- Reduced hero font size to fit full name: `clamp(32px, 4.5vw, 64px)`
- Fixed bouncing name animation — letters now bounce per word (not per character) so "MD", "Mushfiqur", "Rahman" each bounce in sync
- Rebuilt Interests section as 3 clickable expandable cards: Currently Playing, Currently Reading, Currently Working At
  - Click to expand scrollable list, click again to close
  - Each card has its own accent color (cyan, magenta, green)
  - Demo data in place — real data to be filled in later
  - ⚠️ User not satisfied with current Interests design — needs revisiting next session

### Session 4
- Rebuilt Interests section as glass modal system:
  - 3 static clickable cards in a grid (Currently Playing, Reading, Working At)
  - Click opens a glassmorphism modal overlay with blur backdrop
  - Modal: scrollable item list with index + name + subtitle + status badge
  - Status badges: PLAYING/COMPLETED/WILL PLAY LATER (cyan/green/magenta)
  - Close button centered at modal bottom; ESC key + click-outside also close
  - On mobile: slides up as a bottom sheet
- Upgraded entire design system fonts and typography:
  - Replaced Space Grotesk → `Plus Jakarta Sans` (body, nav, buttons)
  - Added `Syne` as display font for all headings (section headings, hero name)
  - Replaced Space Mono → `JetBrains Mono` (labels, mono text)
  - Added `--display` CSS variable for Syne, updated `--mono` to JetBrains Mono
- Improved global design tokens (`index.css`):
  - `--border` bumped from `#1a1a2e` → `#22223a` (actually visible now)
  - Added `--text-muted` for dim labels, `--border-subtle` for delicate separators
  - Body text contrast improved throughout
- Refined all component CSS: better spacing, line-heights, button styles, max-width containers
- Added `.projects__inner` and `.interests__inner` wrappers for consistent max-width (1160px)
- Committed all changes to `dev` branch and pushed to GitHub
- TODO: open PR from dev → main (deferred to next session)

### Session 5
- Replaced traditional navbar with orbital/radial nav:
  - "SHAFI" circular button fixed at top-center
  - Click opens 6 nav items fanning out in a downward arc
  - Items are glass pill bubbles; click scrolls to section + closes menu
  - ESC and click-outside also close
  - Arc angles: 195°–345°, radius 158px
  - Pulse animation on button when closed; ripple ring on open
  - Mobile fallback: collapses to simple top bar
- Added light mode toggle as 6th orbital nav item (☀ Light / ☾ Dark)
  - Saves preference to localStorage
  - Full light mode CSS variable overrides in `index.css`
  - Hero backgrounds, navbar, modals, cards all adapt
- Improved dark mode text readability: bumped `--text`, `--text-muted`, `--text-light`
- Interests section overhaul:
  - Cards now use gif backgrounds (`Game_Card.gif`, `Book_Card.gif`, `Job_Card.gif`) from `public/`
  - Dark overlay on cards for text readability
  - Per-card side glow using accent color (inset box-shadow)
  - 3D tilt on hover via reusable `useTilt` hook (`src/hooks/useTilt.js`)
  - Removed card label and preview text; title + "View all →" only
  - All text white with dark text-shadow for readability over gifs
  - Modal: added filter pills (All / status filters / ★ Fav) + favourite flag per item
  - Modal number indexes now use `--text-muted` (readable in both modes)
  - Modal glass panel adapts to light mode
- Moved interests data to `src/data/interests.js` — edit data without touching components
- Hero typing effect: subtitle cycles through 4 titles with type/delete loop
  - Titles: Cybersecurity Student, Cloud Computing Enthusiast, Networking & Infrastructure, Building Secure Systems
  - Cyan blinking cursor; 2.8s pause before deleting
- Committed and merged dev → main multiple times this session

### Session 6
- Animation improvements:
  - Hero name wave: per-letter stagger using global character index (not per-word), so wave rolls continuously across full name
  - Wave speed tuned to 3.2s, peak height -22px with scale(1.12) pop at apex
  - Hero name color: white in dark mode, near-black in light mode (removed cyan)
- Orbital nav fireball aura:
  - Replaced cyan pulse with 5-ring concentric fire glow (white-yellow → orange → deep orange → red → dark red halo)
  - Flickers across 3 keyframes at 2.8s — slow, languid breathe
  - Border color pulses orange in dark mode, dark blue in light mode
  - Light mode: matching dark blue `blueGlow` animation
  - Fire stops when menu opens, cyan glow takes over
  - "SHAFI" text: white in dark mode, near-black in light mode
- 3D sword added to hero section:
  - Installed `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
  - `sword.glb` in `public/` — exported from Blender
  - `src/components/Sword.jsx` — loads model, floats on Y axis, drops on scroll
  - Bloom post-processing: intensity 0.3, threshold 0.6 (subtle blade shimmer)
  - Canvas is full-hero overlay (position: absolute, inset: 0) — no box/split feeling
  - Canvas transparent background via `alpha: true` + `onCreated setClearColor`
  - Performance: `dpr={[1, 1.5]}`, `powerPreference: high-performance`, `multisampling={0}`
  - Scroll effect: sword drops downward (`scrollProgress * -5` on Y) as user scrolls
  - Sword position: right side of hero (x=4), tip pointing down, blade facing camera
  - Hero layout changed from grid to single column with sword as absolute overlay
  - TODO: fix blade emblem/texture (procedural material didn't export from Blender)
  - TODO: dial in final sword rotation/facing next session

### Session 7
- Yellow glow theme applied to sword (`Sword.jsx`):
  - All mesh materials get `emissive: #ffaa00` at 55% intensity via `scene.traverse`
  - Lights shifted to warm gold/amber tones; added `pointLight` at `#ffbb00` near sword
  - Bloom: intensity 1.2, threshold 0.3 (stronger yellow halo)
- Star field added (`src/components/StarField.jsx`):
  - 280 twinkling stars, fixed canvas covering full site (`position: fixed`)
  - 12% warm gold stars with radial halo glow to match sword theme
  - Larger stars get soft gradient bloom; each star has independent twinkle phase
  - Hidden in light mode via `.starfield` CSS class
  - Mounted in `App.jsx` so it covers all sections
  - Hero background set to `transparent` so stars show through
- Scattered galaxy decorations added to `StarField.jsx`:
  - 7 galaxies in different colors: blue-indigo, magenta, cyan-teal, amber, purple, green, red-rose
  - Each pre-rendered once to an offscreen canvas (zero per-frame CPU cost — just `drawImage` blit)
  - 2 spiral arms + disk scatter per galaxy; tilted disk illusion via `scale(1, tilt)`
  - Bright round core glow rendered separately (not tilted) per galaxy
  - Positions spread across viewport as % so they scale with window size
- Portal work (in progress — resuming next session):
  - User modeled a portal in Blender (`Portal.glb` in `public/`)
  - Loaded in same Three.js canvas as sword via `useGLTF` + `useAnimations`
  - Suspense boundary added so portal failure doesn't crash sword canvas
  - `test-portal.html` created in `public/` for isolated GLB testing
  - Issue: animation not exporting from Blender — procedural/constraint-driven spin
  - Fix identified: bake action (`Object → Animation → Bake Action`) then push to NLA before export
  - TODO: user will bake + re-export portal next session, then dial in position/scale in Three.js
  - TODO: two more 3D models planned for the site (user's idea)


### Session 13
- **Scroll-snap page mode** (home page only) — each section is now a full-viewport "page" that animates in:
  - `html.snap` class added by `HomePage` via `useLayoutEffect` (must beat first paint — the reveals depend on it), removed on unmount so `/interests` + `/projects` still scroll normally
  - `index.css`: `html.snap { scroll-snap-type: y mandatory }`, `.snap-panel { min-height:100vh; scroll-snap-align:start; flex column centered }`
  - `src/hooks/useSnapPanel.js` — new. Like `useScrollReveal` but *toggles* `is-active` instead of unobserving, so contents re-animate every time you scroll back to a panel
  - Panel now drives every `.reveal` beneath it: `html.snap .snap-panel.is-active .reveal { opacity:1; transform:none }`
  - 6 sections got `snap-panel` + panel ref (Hero, About, Interests, Skills, Resume, Contact); their inner `useScrollReveal` refs removed
  - `html.snap .hero { padding-top: 0 }` — its 80px navbar padding pushed hero past 100vh, and **a snap area taller than the viewport stops snapping** (spec). Would have silently broken the first stop
  - Footer gets `scroll-snap-align: end` (it's short, not a full panel)
  - `prefers-reduced-motion` keeps the snapping, drops the rise animation
- **Bug fixed en route**: `About.jsx` info cards + both `Resume.jsx` entries had class `reveal` but *no ref* → no observer ever added `.visible` → they were `opacity: 0` **permanently** on the live site. Panel-driven reveal fixes them.
- **Custom wheel glide** — `src/hooks/useSnapScroll.js` (new):
  - There is no `scroll-snap-duration`; native snap timing is browser-internal. Only way to slow it is to drive scroll yourself
  - Hijacks `wheel` (non-passive, `preventDefault`), animates the **real** `window.scrollTo` with `easeInOutCubic` over `DURATION = 1100`ms. `scrollY` still advances → swords/lightning/navbar dim-check all keep working, zero rewiring
  - `COOLDOWN = 140`ms swallows trackpad inertia after a glide lands
  - Bails on `(pointer: coarse)` and `prefers-reduced-motion` → touch/keyboard fall through to the CSS snap underneath (that's why the CSS stays)
  - `html.snapping` sets `scroll-snap-type: none` during the glide, else mandatory snap yanks the position mid-animation
  - Current stop derived from `scrollY` each event (not a tracked index) so navbar clicks can't desync it
  - ⚠️ Wheel is fully swallowed on the home page — shift+wheel / horizontal gestures do nothing there
- **Perf**: removed global `scroll-behavior: smooth` under `html.snap` (`scroll-behavior: auto`). It fought snapping — every wheel notch became a browser scroll animation firing `scroll` events every frame for its whole duration. This was the reported lag. Navbar clicks unaffected (`Navbar.jsx:164` passes `behavior:'smooth'` to `scrollIntoView` directly)
- `LightningAmbient` **unmounted** from `App.jsx` (user disliked the floating bolts). File left on disk. `LightningGlobal` kept — it's clip-pathed to start at `#skills`, never touched the hero
- Sword tweaks:
  - `Sword.jsx` (hero): flipped — `rotation.z = +π/2` (tip up), travels **up** on scroll (`REST_Y = 1.6`, `RISE_DISTANCE = 6`). Flipping rotation swung the blade to the other side of the group origin, so `REST_Y` had to go `-1.5 → +1.6` or it hung off-frame
  - `SwordFlyby.jsx` (about): `SCALE 0.52 → 0.442` (−15%), `REST_Y -2.2 → -1.5`, emissive `0.55 → 1.0`, lights up ~50%. **The "too dark/transparent" was the mask**, not lighting — `linear-gradient(black 70%, transparent)` started fading above the sword's own rest height. Now `92%`
- **StarField parallax + variety** (`StarField.jsx`):
  - Sky built `VIRTUAL_SPAN = 3` viewports tall, panned by scroll and wrapped. `STAR_PARALLAX 0.35`, `GALAXY_PARALLAX 0.18` (distant = slower = depth)
  - Star count ×3, but off-screen stars culled before `createRadialGradient` → per-frame cost ~flat
  - `STAR_PALETTE`: 7 weighted stellar classes (was 2). Size range widened `0.25 → 5.8` w/ rare-giant tier. Light mode deliberately keeps the old 2 dark tones — colored stars on a pale sky read as confetti
  - Galaxies **7 tiled 3× → 20 unique hand-authored defs**. `yPct` now runs `0 → VIRTUAL_SPAN`. Tiling reused the same bitmap, so screens 2+3 were literally screen 1 again
  - New `arms: 2|3` field (was hardcoded 2); radius `31 → 95` (was `52 → 78`); tilt `0.28 → 0.52`
  - `ARM_PARTICLES`/`DISK_SCATTER` now scale with radius (`r*7` / `r*3`, was flat `600`/`200`) — small galaxies stopped looking like blobs, and 20 cost ~2.3× the old 7 rather than 3×
  - `resize` **debounced 150ms** — it does 20 pre-renders and resize fires per-pixel during a window drag
  - ~7 MB of offscreen canvas now
- ⚠️ **All of Session 12 + 13 is still uncommitted.** ~20 modified files + `SceneBackground.jsx`, `scenes/`, `context/`, `themes.js`, `hooks/useSnapPanel.js`, `hooks/useSnapScroll.js`
- Stray file to delete: `src/components/Contact.jsx.tmp.24284.1775079633878`

#### Next session — known state
- Verified only via `npm run build` (clean) + user screenshots. No frame profiling done.
- Open knobs: `DURATION` (glide speed), `REST_Y`/`RISE_DISTANCE` (hero sword), `VIRTUAL_SPAN` + parallax factors, `GALAXY_DEFS` (flat array, easy to tune)
- Remaining lag suspects if it returns: (1) `Navbar.jsx:100-124` dim-check runs `document.elementsFromPoint` **9×** per animation frame while scrolling — should run on scroll-*settle*; (2) `SwordFlyby`/`SwordSpin` canvases are `inset:0` in sections that went from content-height to `100vh`, and **Bloom is fullscreen post-process — cost scales with canvas area**
- Still-unfixed from earlier audit: `Resume.jsx:10` and `Contact.jsx:27` are **both** labelled `05 //`; `sword.glb` is 3.5MB loaded across 3 WebGL contexts; site content is still placeholder (bio, resume entries, `github.com/`, `linkedin.com/`, `you@email.com`, dead `/resume.pdf`, contact form only `console.log`s but tells the visitor "Message sent")

### Session 12
- Multi-theme system — each theme swaps the whole animated background, not just colors ("a lot of options for the viewer"):
  - 6 themes: **Blackhole** (default deep-space, no data-theme attr), **Whitehole** (light mode — kept id `light` so all existing `[data-theme="light"]` CSS still applies), **Ember**, **Synthwave**, **Ocean**, **Forest**. Each is a `[data-theme="id"]` block in `index.css`
  - Token convention: `--cyan` = primary accent, `--magenta` = secondary, `--green` = section-label accent, `--nav-glow` = navbar aura color (r,g,b triplet). Every theme remaps these + bg/text slots, so component CSS recolors automatically
  - `src/data/themes.js` — theme list (`id`, `name`, `swatch`, `scene`). Add a theme = add a CSS block + one entry here
- Theme picker UI (`Navbar`):
  - "☀ Light" toggle → "🎨 Theme" pill that opens `.theme-palette` glass swatch popover (color dots, active = white ring). Hidden on mobile
  - Available on ALL pages now (added palette item to the interest-mode nav too)
- Theme state lifted to React Context (`src/context/ThemeContext.jsx`, provider wraps App in `main.jsx`). Navbar picker writes it; backgrounds read it. Applies `data-theme` on `<html>` + persists to localStorage. Old `void`/`dark`/`light` values migrate to `blackhole`/`light`
- Scene-swap background system:
  - `src/components/SceneBackground.jsx` — dispatcher; renders only the active theme's scene (one canvas/RAF at a time, no perf hit). Replaces direct `<StarField />` mounts in App + all 3 pages
  - All scenes are 2D canvas RAF loops in `src/components/scenes/` (cheap, no WebGL), full-screen `position:fixed` with a top/depth vignette so section text stays readable:
    - Blackhole/Whitehole → existing `StarField`
    - **Synthwave** — violet gradient, hazy pink sun, drifting wavy magenta fog, rising dust (Blade Runner 2049)
    - **Ember** — dark warm gradient, glowing lava bed + pulsing hotspots, rising flickering embers, dark smoke wisps
    - **Ocean** — teal→navy depth gradient, swaying god-ray beams, swimming fish silhouettes (+ faint cyan/orange accent fish), rising wobbling bubbles, marine snow
    - **Forest** — pre-rendered layered tree silhouettes (offscreen blit), green-gold canopy light shafts, blinking wandering fireflies, falling rotating leaves, ground mist
  - `App.jsx`: gold Lightning canvases now only mount for Blackhole/Whitehole (would clash on other scenes)
- Navbar reskins per theme via single `--nav-glow` token: pill breathing glow, SHAFI center aura, borders, hover-label all read it. Blackhole/Ember keep `fireGlow`, Whitehole keeps `blueGlow`, Synthwave/Ocean/Forest use new var-driven `themeGlow`. Removed duplicate blue pill keyframes
- 3D performance pass (swords were rendering ~20fps, choppy float):
  - Root cause was GPU render rate, NOT scroll handlers. Fixes: all 3 sword canvases (`Sword`, `SwordFlyby`, `SwordSpin`) → Bloom `mipmapBlur levels={5}` (mip-pyramid bloom, far cheaper than full-res Gaussian) + `dpr={1}`→`dpr={0.7}` (fill-rate cut). Result: smooth
  - Also killed scroll-time React re-render storms: `SwordFlyby` scrollProgress state→ref; `LightningGlobal` rAF-throttled, progress→ref, clipPath set directly on div, only a bool re-renders; `Navbar` dim-check (9× elementsFromPoint) rAF-throttled to once/frame
  - NOTE: durable win still pending — `sword.glb` is 3.3MB (1.17MB PNG + 868KB JPEG textures, 58k tris, loaded 3× across 3 WebGL contexts). Re-export with 512px textures + Draco would cut it to ~300KB. TODO
- All 6 theme scenes now built. TODO: refine each scene individually (user wants to polish them one at a time later)

### Session 11
- Fixed scroll performance lag (15fps jank) — 4 WebGL canvases running simultaneously:
  - Root cause: `LightningAmbient` and `LightningGlobal` both rendered + ran Bloom every frame with no pause mechanism, even when their content wasn't relevant to the scroll position
  - `LightningGlobal`: added `frameloop={scrollProgress > 0 ? 'always' : 'never'}` — canvas now fully stops before the Skills section is reached
  - `LightningAmbient`: added scroll listener; pauses (`frameloop="never"`) as soon as `scrollY >= skills.offsetTop` — hands off to LightningGlobal at that point
  - Result: at any scroll position, at most 1 lightning canvas renders (down from 2 always-on), resolving the jank

### Session 10
- Navbar orbital pills redesigned — replaced static white border with star-breathing glow:
  - Removed rotating conic-gradient arc system entirely
  - Each pill has a `box-shadow` pulse animation (`starGlow` keyframes) in amber
  - 6 unique breathing rates (3.6s–8.2s) + phase offsets so pills never sync
  - Hover switches to `starGlowHover` — brighter, faster (1.1s) pulse; label turns amber
  - Search-active pill: static cyan glow override
  - Light mode: matching blue breathing variant
- `FloatingOrbs.jsx` — new physics-based background component for interest/project pages:
  - `requestAnimationFrame` loop with position + velocity per orb
  - Wall bouncing + elastic collision detection (O(n²), fine for ~9 orbs)
  - Speed clamped post-collision so orbs never compound into fast movement
  - Grid-based initial placement (3×3) prevents clustering in corners
  - CSS `orbPulse` animation for independent glow breathing per orb
  - Used in `InterestPage` and both project pages
- Projects section built — replaces "Currently Working At" interest card:
  - `src/data/projects.js` — project data (description, whatIDid, tech, images, github, video, demo)
  - `src/pages/ProjectsPage.jsx/.css` — grid of project cards (cover, title, tagline, tech pills, status)
  - `src/pages/ProjectDetailPage.jsx/.css` — full project documentation page:
    - Sections: Overview, Tech Stack, What I Built, Gallery, Video Demo
    - GitHub + Live Demo link buttons
    - FloatingOrbs background in project accent color
  - Routes added: `/projects` and `/projects/:id`
  - `Interests.jsx` updated to support `card.route` override (working card → `/projects`)
  - Demo project: "Personal Portfolio Site" pre-filled with real data
  - To add a project: add object to `projects.js`, everything else auto-updates

### Session 9
- Interests section converted from modal popup to dedicated pages (performance improvement):
  - Installed + wired `react-router-dom` (`BrowserRouter` in `main.jsx`, `Routes`/`Route` in `App.jsx`)
  - Route `/interests/:id` → `src/pages/InterestPage.jsx`
  - `Interests.jsx` cards now call `navigate('/interests/:id')` — modal system removed entirely
  - `InterestPage` shows `StarField` + `Navbar` (no heavy lightning/3D), full-page list with filters
  - `src/pages/InterestPage.css` — frosted dark overlay for readability against starfield
- Navbar updated with `mode` prop:
  - `mode="interest"` → SHAFI fans out only 2 items: `← Back` and `⌕ Search`
  - Main page unchanged (still shows all 6 items)
  - Back item uses `navigate(-1)` so scroll position is preserved on return
  - `onSearch` / `searchActive` props wire up the search feature
- Search bar added to InterestPage:
  - Toggled by clicking `⌕ Search` in SHAFI menu; pill glows cyan when active
  - Slides in inline to the right of "N games tracked" in the header
  - Real-time filter against name + developer; stacks with tab filter
  - `✕` button clears query; `Escape` closes; clicking Search again closes + clears
  - "No results for X" state with hint text when nothing matches
- Games data added to `interests.js` playing card (14 games: CS2, Warframe, ESO, PoE2, Marvel Rivals, Paladins, AQ3D + 7 completed)
- Orbital nav position nudged up (`top: -90px`)
- TODO: add game/book cover images to interest items

### Session 8
- Interests section — games data populated from Steam library screenshots:
  - 14 games added with developer names as subtitles
  - Categorized: `ongoing` (CS2), `online` (Warframe, ESO, Path of Exile, Marvel Rivals, Paladins, AdventureQuest 3D), `completed` (Skyrim, BG3, Terraria, Stardew Valley, Sleeping Dogs, Enderal, Clair Obscur: Expedition 33)
  - Added `online` status to `STATUS_LABELS` in `Interests.jsx`
  - `StatusBadge` now returns null when status is falsy
  - More screenshots pending — user will continue filling in games list
- Performance fixes across all WebGL canvases (site was lagging due to 4 simultaneous canvases):
  - Root cause: `LightningAmbient` (20 bolt instances) + `LightningGlobal` (8 bolts) added last session were running non-stop with very aggressive Bloom (`luminanceThreshold: 0.25`)
  - All 4 canvases (`Sword`, `SwordFlyby`, `LightningAmbient`, `LightningGlobal`): `antialias: false`, `dpr={1}` (was adaptive `[1, 1.5]`)
  - Bloom `luminanceThreshold` raised: `0.3→0.6` (swords), `0.25→0.65/0.7` (lightning)
  - Removed `mipmapBlur` from `LightningAmbient` Bloom
  - `Sword` + `SwordFlyby` now pause rendering (`frameloop="never"`) when scrolled out of viewport via `IntersectionObserver`

### Session 14
- **Theme cull** — 6 themes → 3. Kept Blackhole, Whitehole, Synthwave; removed Ember, Ocean, Forest:
  - `data/themes.js` — 3 entries dropped (picker now renders 3 swatches)
  - `SceneBackground.jsx` — 3 imports + 3 switch cases removed
  - `index.css` — deleted `[data-theme="ember"]`, `="ocean"`, `="forest"` token blocks (~48 lines)
  - `Navbar.css` — `themeGlow` selector is synthwave-only now; `--open` animation-reset list trimmed
  - `git rm` on `EmberScene.jsx`, `OceanScene.jsx`, `ForestScene.jsx` (recoverable from history)
  - No change needed at `App.jsx:22` (`showLightning` already only matched blackhole/light)
  - Stale localStorage needs no migration: `ThemeContext.jsx:11` validates the stored id against `THEMES` and falls back to `DEFAULT_THEME`, so anyone sitting on `ember`/`ocean`/`forest` lands on blackhole
- **Steam library sync (build-time, option A)** — library + playtime now generated from the Steam Web API instead of hand-typed:
  - `scripts/fetch-steam.mjs` (new) — Node built-ins only, zero deps. Calls `IPlayerService/GetOwnedGames/v1` (needs key) then the unofficial `store.steampowered.com/api/appdetails` for developer + genres. Writes `src/data/steam-games.json`
  - `.github/workflows/steam-sync.yml` (new) — daily `cron: '0 5 * * *'` + `workflow_dispatch`, commits the JSON back via github-actions[bot] only when it changed
  - `src/data/steam-games.json` (new) — generated, committed, seeded empty. **Do not hand-edit**
  - `src/data/steamMerge.js` (new) — joins Steam facts onto the curated list by appid
  - `src/data/covers.js` (new) — `steam()` / `steamFallback()` / `book()` moved out of `interests.js` so the merge can share them; appid is now validated before URL interpolation
  - `interests.js` — `g()` now keeps `appid: id` (**it previously discarded it** — only used it to build the cover URL, so there was no join key); playing-card items wrapped in `mergeSteam([...])`
  - `package.json` — added `"sync:steam": "node ../../scripts/fetch-steam.mjs"`
  - Ownership split: **Steam owns facts** (playtime, last played, developer, genres); **`interests.js` owns curation** (`favourite`, `status`, display order). Steam has no equivalent for those, so the merge never overwrites them. Owned-but-uncurated games append at the end sorted by last-played
  - `sub` (developer) only auto-fills when not hand-typed (`item.sub ?? s.developer`) — flip the `??` in `steamMerge.js` to prefer Steam's
- **Security measures on the above** (the key is a real secret — it grants read access to the Steam account):
  - Key is read from `process.env` only. Never written to the output JSON, never printed
  - `fail()` in `fetch-steam.mjs` scrubs the key out of all error text before logging. This matters: fetch/undici errors routinely include the full request URL, which carries `?key=`, so one network blip would otherwise publish the key into public CI logs
  - Workflow triggers are `schedule` + `workflow_dispatch` **only** — deliberately no `pull_request`/`pull_request_target`, which run fork-authored code and are a key-exfiltration path
  - Top-level `permissions: contents: write` (minimum needed); secrets injected per-step via `env:`, not job-wide
  - Cover URLs are always constructed locally from an appid that must pass an integer guard — no string from the Steam response is ever used as a `src`
  - Response strings are coerced + length-capped (`MAX_STR = 200`)
  - Added root `.gitignore` (**there was none**) covering `.env`, `.env.*`, `*.pem`, `*.key`. The frontend `.gitignore` only had `*.local`, so a root `.env` holding the key was committable. Verified with `git check-ignore`
  - Added `.env.example` documenting both vars + where to revoke the key
  - Actions pinned to major tags; noted in-file that full SHA pinning is the next hardening step
- **Setup still owed by user** (not done — requires account access):
  1. Get key at `steamcommunity.com/dev/apikey` (account needs $5+ lifetime spend)
  2. Steam profile → Edit Profile → Privacy → **"Game details" must be Public**, or `GetOwnedGames` returns an empty list
  3. Add `STEAM_KEY` + `STEAM_ID` (17-digit SteamID64) as GitHub repo secrets
  4. Run the workflow once from the Actions tab to populate the JSON
- Verified: `npm run build` clean; merge logic unit-tested against sample data (curated order/flags preserved, uncurated appended by last-played, non-Steam games like Valorant pass through untouched)
- Stray `personal-site.code-workspace` is now covered by the root `.gitignore` (`*.code-workspace`)
- ⚠️ All of Session 14 is **uncommitted**, stacked on top of the uncommitted Session 13.5 accretion-disk Navbar work
- Minor knob: `formatPlaytime` rounds to whole hours, so 90 min reads "2h"
- **sword.glb compression — 3.48MB → 425KB (8.2×, −87.8%)**, done with `@gltf-transform/cli` (npx, not added as a project dep). No Blender round-trip needed:
  - What was actually fat (from `gltf-transform inspect`): `scratches` was a **1024² PNG at 1.2MB used as a metallicRoughnessTexture** (lossless PNG for a roughness map — pure waste); `leatherCord` was an 888KB 1024² JPEG (near-lossless quality). Mesh was a modest 1.32MB / 57.9k tris. So it was ~62% textures, not geometry
  - Pipeline: `resize --pattern "{scratches,leatherCord}" --width 512 --height 512` → `webp --quality 85 --effort 90` → `dedup` → `prune` → `meshopt`
  - Results: scratches 1.2MB→82KB, leatherCord 888KB→37.9KB, mesh→meshopt-compressed. `runes` deliberately left at full 556×1892 (it's the signature blade detail; only 41KB anyway)
  - GPU VRAM also dropped ~16.8MB → ~8.45MB, which matters because the model is live in **3 WebGL contexts** (`Sword`, `SwordFlyby`, `SwordSpin`)
  - **Chose Meshopt over Draco deliberately.** drei's `useGLTF` defaults `useDraco = true` but points `DRACOLoader` at a **gstatic CDN** (`@react-three/drei/core/Gltf.js:8`) — a third-party runtime request on every visit that breaks the model if blocked. Meshopt's decoder is bundled locally (`node_modules/three-stdlib/libs/MeshoptDecoder.js`) and is also already enabled by default, so Draco would have been strictly worse here. **No component code changed** — `useGLTF('/sword.glb')` handles it as-is
  - Integrity verified: **30,457 vertices / 57,928 triangles unchanged** (no simplification ran), all 6 material names intact (`Blade`, `Blade_No_Runes`, `Handle`, `Guard`, `Pommel_Tip`, `Pommel_Runes`), bbox identical to 4dp
  - `prune` dropped one empty node, so the scene root renamed `SwordReference` → `Cube`. Safe here: all 3 sword components use `scene.traverse` + `node.isMesh`, no `getObjectByName` anywhere
  - Verified headlessly: GLB header/length consistent, `extensionsRequired` = meshopt + webp + quantization + texture_transform, 19/23 bufferViews meshopt-compressed, 4/4 textures WebP, dev server returns HTTP 200 `model/gltf-binary` with bytes identical to disk. `npm run build` clean
  - ⚠️ **Not yet eyeballed in a browser** — no browser tooling available this session. Structurally valid and the decoders are confirmed present, but the actual render (especially the yellow emissive glow and rune detail at 512) is unconfirmed
  - Original is recoverable: `git show ffb5804:frontend/portfolio/public/sword.glb > sword.glb`. A local copy also sits in `.model-backup/` (gitignored)
  - If it ever needs redoing, the knobs are: `--width/--height` on the resize, `--quality` on webp, and which textures the `--pattern` targets
- **"Now" section trimmed to one card** — the home-page `02 // Now` grid is just **Currently Playing** now, by design ("that should be a consistent part of my website"):
  - `interests.js` — the `reading` card is **deleted permanently**. The `working` card is **parked, not deleted**: moved out of `interestCards` into a new `export const workingCard`, kept verbatim with a comment, to be re-homed elsewhere on the site later. Restoring it to the grid = adding `workingCard` back into the array
  - Removed `book` from the `./covers` import — the reading card was its only consumer, so it would have tripped `no-unused-vars`. `book()` itself stays exported from `covers.js` for whenever books come back
  - Nothing orphaned by parking `working`: its `route` pointed at `/projects`, which stays reachable from the orbital nav's "Work" item (`Navbar.jsx:10`). `ProjectsPage` and both `/projects` routes are untouched
  - Old `/interests/reading` links degrade gracefully — `InterestPage.jsx:59` already renders a "Page not found." state when `interestCards.find()` misses
  - `Interests.css` — grid was hardcoded `repeat(3, 1fr)`, which would have left the lone card in a 1/3-width column with two dead columns. Now `repeat(auto-fit, minmax(260px, 376px))` + `justify-content: start`. 376px is exactly what each column measured before ((1160 − 2×16) / 3), so the single card renders pixel-identical to how it looked as the first of three, and the layout still reflows correctly if cards are added back. Left-aligned so it lines up under the section heading. The existing `max-width: 900px` → `1fr` mobile override still applies
  - Verified: `npm run build` clean; `eslint` clean on every touched file (the repo's 7 pre-existing lint errors are all in files not touched here — `Galaxy`, `Hero`, `Navbar`, `SkillConstellation`, `Skills`, `ThemeContext`, `InterestPage`)
  - ⚠️ Now-dead assets in `public/`, **not deleted** pending a call: `Book_Card.gif` (629KB) and `book_card.jpeg` (930KB, already unreferenced before this). Everything in `public/` is copied into `dist/`, so that is ~1.5MB of dead weight shipping. `Job_Card.gif` is still referenced by the parked `workingCard` — keep it
- **"Now" section rebuilt as three tiles** — heading changed `What I'm up to.` → `What I'm playing.` (`02 // Now` label kept):
  1. **Currently Playing** — the existing gif card, unchanged, routes to `/interests/playing`
  2. **Top 3 right now** — new `TopGamesCard`; rank + cover thumb + name + developer + playtime per row
  3. **Steam profile** — new `SteamTile`; inlined official Steam mark, links out to the profile. Deliberately an `<a>`, not a tab/route, per the design ask
  - `Interests.jsx` rewritten: now resolves the `playing` card directly (`interestCards.find`) instead of mapping the array, since the section is single-subject by design. Returns `null` if that card is ever missing rather than throwing
  - `steamMerge.js` — new `topPlayed(items, n)`. Ranks by Steam's **2-week playtime** (the only real "right now" signal), with a fallback chain so the tile is never empty before the first sync: 2-week playtime → hand-marked `status: 'playing'` → favourites → list order. Also added `recentMinutes` to merged items to feed it
  - Verified today (no Steam data yet) it resolves to: Batman: Arkham Knight, Counter-Strike 2, Subnautica. Once the sync runs, real 2-week playtime takes over automatically
  - **Steam profile URL self-configures** — `scripts/fetch-steam.mjs` now writes `profileUrl: https://steamcommunity.com/profiles/<STEAM_ID>` into the generated JSON (SteamID64 is a public identifier, not a secret). `src/data/steamProfile.js` (new) reads it, with an `OVERRIDE` const for a vanity URL and a fallback to `steamcommunity.com` so the tile is never a dead link pre-sync. Nothing hardcoded or guessed
  - External link carries `rel="noopener noreferrer"` — without `noopener` the opened tab gets a `window.opener` handle back to this page and can navigate it elsewhere
  - `Interests.css` — new `.now-tile` shell shared by tiles 2 and 3: same box as `.interest-card` (320px min-height, 20px radius, inset accent glow, lift-on-hover) but a flat `--bg-card` surface rather than a gif, so a list and a link read as different objects from the gif card. Long game titles ellipsis via `min-width: 0` on the flex row. `prefers-reduced-motion` block added
  - Grid unchanged (`repeat(auto-fit, minmax(260px, 376px))`) — 3 × 376 + 2 × 16 = exactly the 1160px container, so the row fills edge to edge again
  - Verified: `npm run build` clean, `eslint` clean on all touched files, `topPlayed` unit-checked headlessly
  - ⚠️ Not eyeballed in a browser (no browser tooling this session) — tile proportions and the 76px Steam mark are unconfirmed visually
- **Fixed the Now tiles stacking vertically** — they must sit side by side:
  - Cause: `Interests.css` had `@media (max-width: 900px) { .interests__grid { grid-template-columns: 1fr } }`, and the base rule used `repeat(auto-fit, minmax(260px, 376px))`. **auto-fit drops columns the moment tiles stop fitting at their min width**, and on a display with OS scaling (Windows 125%/150% is normal) the effective CSS viewport falls under 900 even on a physically wide window — so both paths collapsed the row
  - Base grid is now `repeat(3, minmax(0, 1fr))` — three equal columns always, which get narrower instead of wrapping. `minmax(0, 1fr)` not plain `1fr`: it lets a column shrink below its content's intrinsic width, which is what actually lets long game titles ellipsis instead of forcing the row wider than its container
  - `@media (max-width: 1100px)` — new, trims section padding to 40px
  - `@media (max-width: 900px)` — no longer collapses the row. Reclaims space instead: padding 24px, gap 12px, tile min-height 280px, cover 30×44, smaller type, Steam mark 56px
  - `@media (max-width: 640px)` — new, the only place that stacks (true phone widths)
  - `index.css:186-188` already staggers `.interests__grid .reveal:nth-child(1..3)`, so all three tiles animate in sequence with no change needed
- Steam profile link wired: `steamProfile.js` `OVERRIDE = 'https://steamcommunity.com/profiles/76561198411489517'`. Was previously falling back to `steamcommunity.com` (Steam's homepage) because `profileUrl` is still `null` pre-sync. `OVERRIDE` takes precedence over the generated value, so this stays correct forever
- **`STEAM_ID` for the sync secrets is `76561198411489517`** (from that profile URL — SteamID64 is a public identifier, not a secret). Only `STEAM_KEY` is genuinely secret
- **Full wipe of "Currently Reading" + "Currently Working On"** (they were only parked before; user wanted them gone entirely):
  - `interests.js` — deleted the parked `export const workingCard` block outright, plus the stale "Book covers pulled from Open Library" header comment. `interestCards` now contains exactly one card: `playing`
  - `covers.js` — removed `book()` (no consumers left) and trimmed its security comment to the two steam helpers
  - `InterestPage.jsx` — `STATUS_LABELS` dropped `reading`/`current`/`past`; `CARD_NOUNS` dropped `reading`/`working`. No matching `ip-badge--*` CSS existed, so nothing to clean there
  - `git rm` on `public/Book_Card.gif` (629KB), `public/book_card.jpeg` (930KB), `public/Job_Card.gif` (286KB) — ~1.8MB that was being copied into `dist/` on every build. Confirmed absent from `dist/` after rebuild
  - Verified: `grep -rniE "reading|workingcard|'working'|book|Book_Card|Job_Card"` over `src/` returns **zero matches**; build clean
  - Still-unreferenced in `public/`, left alone as out of scope: `gaming_interest_pic.jpg`, `icons.svg`, `test-lightning.html`, `test-portal.html` (the two test pages do ship to `dist/`)
- **Note on "the cards came back"**: the files were never reverted — the background dev server had been killed, so the browser tab was serving a cached page. No service worker in this project, so a hard reload (Ctrl+Shift+R) is the fix. Dev server restarted on a pinned port via `npx vite --port 5180 --strictPort` to avoid stale-tab confusion (vite auto-increments to 5174+ when 5173 is taken, which is how the two ports diverged earlier)

### Session 15
- **Steam: diagnosed the real blocker without needing the key.** Profile `76561198411489517` is public (`visibilityState: 3`, Steam name `BRUHM0N (Shafi)`), but `steamcommunity.com/profiles/<id>/games?tab=all&xml=1` **302-redirects to a login page** → **"Game details" is still private**. This blocks the official API too: `GetOwnedGames` returns an empty list when game details are private, key or no key. Fix is Steam → Edit Profile → Privacy Settings → Game details → Public
- Evaluated a **keyless XML alternative** (`.../games?tab=all&xml=1` returns `appID`, `name`, `hoursLast2Weeks`, `hoursOnRecord` — enough for the tiles, no API key, no secret). **User chose the official Web API**, so `fetch-steam.mjs` is unchanged. Rejected XML tradeoffs for the record: hours-as-formatted-string instead of exact minutes, no `rtime_last_played` (which `steamMerge.js` uses to sort uncurated games), and no path to a live "in game right now" badge or achievements
- **Key scrubbing actually exercised, not just asserted** — ran the script with a deliberately fake key: output was `✗ GetOwnedGames: HTTP 401 Unauthorized` and `grep -c` for the key in the output returned **0**. Also confirmed the no-env path fails clean. The 401 confirms the endpoint/auth path works, so a real key should pass straight through
- **Playtime now shows on the games list page** — `steamMerge.js` was attaching `playtime` to every item but only the top-3 tile rendered it; the full `/interests/playing` list ignored it. Added `.ip-item-time` between the name block and the status badge, mono/muted, with a light-mode override. Absent until the sync runs
- `InterestPage.jsx` fixes made while in the file:
  - List rows were keyed by **array index** while the list is filtered *and* searched — React reuses a row for a different game on filter change, which with `<img>` means a row can briefly show the previous game's cover. Now keyed `item.appid ?? item.name`
  - Removed the unused `navigate` + `useNavigate` import (back navigation lives in `Navbar` via `back: true`). Clears one of the repo's pre-existing lint errors
- Verified: `eslint` clean on `InterestPage.jsx` (was 1 error, now 0), `npm run build` clean
