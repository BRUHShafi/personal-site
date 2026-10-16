// Shared between Sword.jsx (which draws the hero sword) and Hero.jsx (which
// splits the name as the blade passes through it). Both must agree on where
// the tip is, so the numbers live here, not in either component.

// Camera: z = 7, fov 45° → half the visible height at z = 0, in world units
export const HALF_VIEW_H = 7 * Math.tan((45 / 2) * Math.PI / 180)

// The v2 model is 2 units tall, centred on its origin, tip up.
export const SCALE = 1.1           // sword is 2 × SCALE world units tall
export const REST_X = 0            // centred under the name
export const REST_Y = -1.62        // centre of the sword at rest (~59%–97% of the screen)
export const RISE_DISTANCE = 6.3   // world units it rises over one viewport of scroll

// Rise eases in (progress²): slow at first so the blade visibly *cuts* through
// the name, then it launches out of frame. Must still clear the top by
// progress 1: REST_Y − SCALE + RISE_DISTANCE > HALF_VIEW_H (+ bob/Bloom margin).
export const rise = (progress) => progress * progress * RISE_DISTANCE

// World-space y of the blade tip for a given hero scroll progress (0 → 1)
export const tipWorldY = (progress) => REST_Y + SCALE + rise(progress)

// Same, as pixels from the top of the viewport (the hero stage is fixed and
// full-viewport, so the canvas maps 1:1 onto the window)
export const tipScreenY = (progress, viewportH) =>
  ((HALF_VIEW_H - tipWorldY(progress)) / (2 * HALF_VIEW_H)) * viewportH

// Inverse of tipScreenY: the hero progress at which the tip reaches a given
// screen y. Used to find when the blade has fully cleared the name.
export const progressForTipAt = (screenY, viewportH) => {
  const worldY = HALF_VIEW_H - (screenY / viewportH) * 2 * HALF_VIEW_H
  const r = Math.max(0, worldY - REST_Y - SCALE)
  return Math.min(1, Math.sqrt(r / RISE_DISTANCE))
}

// ── Portal #1 — in the slot between the SHAFI eclipse and the name ──
// Given as a fraction of screen height so it lands in the same slot whatever
// the window size (the name is positioned in % too — see .hero__content).
export const PORTAL_SCREEN_Y = 0.33
export const PORTAL_Y = HALF_VIEW_H - PORTAL_SCREEN_Y * 2 * HALF_VIEW_H
export const PORTAL_SCALE = 0.9    // portal is 1.0 × 1.6 world units at scale 1

// A hole in the ceiling: the oval lies flat with its opening facing *down* at
// the sword, tipped back toward the camera by PORTAL_TILT so you can see into
// it. Euler XYZ applies Z first: Z turns the long axis horizontal, then X lays
// the plane down (π/2 = flat, facing straight down; less = tipped toward you).
export const PORTAL_TILT = 0.45    // radians the opening leans toward the camera
export const PORTAL_ROTATION = [Math.PI / 2 - PORTAL_TILT, 0, Math.PI / 2]

// ── Scroll timeline for the sword entering Portal #1 ──
// Hero progress at which the blade's world y (tip or pommel) reaches the
// portal plane at the sword's x/z (the plane passes through PORTAL_Y there).
const progressForRise = (r) => Math.min(1, Math.sqrt(Math.max(0, r) / RISE_DISTANCE))
export const TIP_ENTERS_AT  = progressForRise(PORTAL_Y - REST_Y - SCALE)  // ≈ 0.49
export const FULLY_IN_AT    = progressForRise(PORTAL_Y - REST_Y + SCALE)  // ≈ 0.77
// Portal #1 stays open. Once the sword is fully in, the whole hero stage
// slides up and off the top (Hero.jsx) by this many viewport heights at
// progress 1 — enough to carry the portal out of view instead of popping it.
export const STAGE_EXIT_SHIFT = 0.55
export const PORTAL_FLARE = 1.6        // extra intensity at the peak of the crossing
