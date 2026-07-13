// Theme list for the navbar swatch picker.
// `id` matches the [data-theme="id"] block in index.css.
//   - "blackhole" = default (no attribute set) — the original deep-space theme.
//   - "light"     = Whitehole (kept this id so all existing [data-theme="light"] CSS still applies).
// `scene` names the animated background each theme renders (see SceneBackground.jsx).
// `swatch` is the dot color shown in the picker (each theme's primary accent).
export const THEMES = [
  { id: 'blackhole', name: 'Blackhole', swatch: '#00e5ff', scene: 'stars' },
  { id: 'light',     name: 'Whitehole', swatch: '#0088aa', scene: 'stars' },
  { id: 'ember',     name: 'Ember',     swatch: '#ffb020', scene: 'ember' },
  { id: 'synthwave', name: 'Synthwave', swatch: '#ff43c4', scene: 'synthwave' },
  { id: 'ocean',     name: 'Ocean',     swatch: '#22d3ee', scene: 'ocean' },
  { id: 'forest',    name: 'Forest',    swatch: '#34d399', scene: 'forest' },
]

export const DEFAULT_THEME = 'blackhole'
