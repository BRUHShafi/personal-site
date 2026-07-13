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
