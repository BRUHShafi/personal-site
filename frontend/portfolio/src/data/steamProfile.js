import steamData from './steam-games.json'

// Link target for the Steam tile on the home page.
//
// Normally you do not need to touch this: scripts/fetch-steam.mjs writes
// `profileUrl` into steam-games.json from your STEAM_ID, so the link configures
// itself the first time the sync runs.
//
// Set OVERRIDE only if you want your vanity URL instead of the numeric one,
// e.g. 'https://steamcommunity.com/id/yourname'.
const OVERRIDE = 'https://steamcommunity.com/profiles/76561198411489517'

// Falls back to the Steam homepage rather than a broken profile link, so the
// tile is never a dead end before the first sync.
export const STEAM_PROFILE_URL =
  OVERRIDE || steamData.profileUrl || 'https://steamcommunity.com'

export const STEAM_PROFILE_CONFIGURED = Boolean(OVERRIDE || steamData.profileUrl)
