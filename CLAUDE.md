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
