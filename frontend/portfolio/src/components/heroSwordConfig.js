// Shared between Sword.jsx (which draws the hero sword) and Hero.jsx (which
// splits the name as the blade passes through it). Both must agree on where
// the tip is, so the numbers live here, not in either component.

// Camera: z = 7, fov 45° → half the visible height at z = 0, in world units
export const HALF_VIEW_H = 7 * Math.tan((45 / 2) * Math.PI / 180)

// The v2 model is 2 units tall, centred on its origin, tip up.
export const SCALE = 1.35          // sword is 2 × SCALE world units tall
export const REST_X = 0            // centred under the name
export const REST_Y = -1.25        // centre of the sword at rest (~48%–95% of the screen)
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
