#!/usr/bin/env node
/**
 * Pulls the Steam library into src/data/steam-games.json.
 *
 * Run locally:   STEAM_KEY=xxx STEAM_ID=7656... npm run sync:steam
 * Run in CI:     see .github/workflows/steam-sync.yml (reads repo secrets)
 *
 * SECURITY NOTES — read before editing:
 *  - STEAM_KEY is a secret. It is read from the environment and NEVER written to
 *    the output file and NEVER printed. `fail()` scrubs it out of error text,
 *    because fetch/undici errors routinely include the full request URL — which
 *    has ?key= in it. Without that scrub a single network blip would publish the
 *    key into public CI logs.
 *  - Nothing from Steam's response is trusted as a URL. Cover URLs are built
 *    locally from an appid that must pass Number.isInteger first, so a hostile
 *    or malformed response cannot inject a src into the page.
 *  - Strings are length-capped and coerced, so the generated JSON stays small
 *    and predictably shaped.
 */

import { writeFile, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const KEY = process.env.STEAM_KEY
const ID  = process.env.STEAM_ID

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT  = resolve(HERE, '../frontend/portfolio/src/data/steam-games.json')

const MAX_STR = 200      // cap on any string we persist
const APPDETAILS_DELAY = 1500   // ms between store calls — it is rate limited

/** Remove the secret from anything we are about to print, then exit. */
function fail(msg) {
  let text = String(msg)
  if (KEY) text = text.split(KEY).join('***REDACTED***')
  console.error(`✗ ${text}`)
  process.exit(1)
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

/** Coerce to a trimmed, length-capped string (or null). */
function str(v) {
  if (typeof v !== 'string') return null
  const s = v.trim().slice(0, MAX_STR)
  return s.length ? s : null
}

/** Coerce to a non-negative integer (or null). */
function int(v) {
  return Number.isInteger(v) && v >= 0 ? v : null
}

async function getJSON(url, label) {
  let res
  try {
    res = await fetch(url, { headers: { 'User-Agent': 'personal-site-steam-sync' } })
  } catch (e) {
    // e.message can contain the full URL incl. the key — fail() scrubs it.
    fail(`${label}: network error — ${e.message}`)
  }
  if (!res.ok) fail(`${label}: HTTP ${res.status} ${res.statusText}`)
  try {
    return await res.json()
  } catch {
    fail(`${label}: response was not JSON`)
  }
}

async function fetchOwnedGames() {
  const url = new URL('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/')
  url.searchParams.set('key', KEY)
  url.searchParams.set('steamid', ID)
  url.searchParams.set('include_appinfo', '1')
  url.searchParams.set('include_played_free_games', '1')

  const data = await getJSON(url, 'GetOwnedGames')
  const games = data?.response?.games

  if (!Array.isArray(games)) {
    fail(
      'GetOwnedGames returned no games list.\n' +
      '  Almost always one of:\n' +
      '    1. Steam profile privacy — "Game details" must be set to Public\n' +
      '       (Profile → Edit Profile → Privacy Settings → Game details)\n' +
      '    2. STEAM_ID is not a SteamID64 (should be a 17-digit number)\n' +
      '    3. STEAM_KEY is invalid or revoked'
    )
  }
  return games
}

/**
 * Store page info: genres + developer. Unofficial endpoint, no key, rate limited,
 * so we only call it for appids we have not already cached, and we tolerate failure.
 */
async function fetchAppDetails(appid) {
  const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&l=english`
  let res
  try {
    res = await fetch(url, { headers: { 'User-Agent': 'personal-site-steam-sync' } })
    if (!res.ok) return null
    const body = await res.json()
    const entry = body?.[String(appid)]
    if (!entry?.success || !entry.data) return null
    return {
      developer: str(entry.data.developers?.[0]),
      genres: Array.isArray(entry.data.genres)
        ? entry.data.genres.map(gr => str(gr?.description)).filter(Boolean).slice(0, 5)
        : [],
    }
  } catch {
    return null   // store API is best-effort enrichment, never fatal
  }
}

async function readExistingCache() {
  try {
    const raw = await readFile(OUT, 'utf8')
    const parsed = JSON.parse(raw)
    return parsed?.games && typeof parsed.games === 'object' ? parsed.games : {}
  } catch {
    return {}   // first run, or file was hand-broken — start clean
  }
}

async function main() {
  if (!KEY) fail('STEAM_KEY is not set. Never hardcode it — export it, or use a repo secret.')
  if (!ID)  fail('STEAM_ID is not set (your 17-digit SteamID64).')
  if (!/^\d{17}$/.test(ID)) fail('STEAM_ID must be a 17-digit SteamID64.')

  const owned  = await fetchOwnedGames()
  const cached = await readExistingCache()

  console.log(`→ ${owned.length} games owned`)

  const games = {}
  const needDetails = []

  for (const raw of owned) {
    const appid = int(raw?.appid)
    const name  = str(raw?.name)
    if (appid === null || !name) continue   // unusable entry, skip it

    const prev = cached[String(appid)] ?? {}

    games[String(appid)] = {
      appid,
      name,
      playtimeMinutes:        int(raw?.playtime_forever) ?? 0,
      playtime2WeeksMinutes:  int(raw?.playtime_2weeks)  ?? 0,
      lastPlayed:             int(raw?.rtime_last_played) ?? 0,
      // carried over from cache until the store lookup fills them in
      developer: str(prev.developer),
      genres: Array.isArray(prev.genres) ? prev.genres : [],
    }

    // only look up games we have never enriched — keeps the daily run cheap
    if (!prev.developer) needDetails.push(appid)
  }

  console.log(`→ ${needDetails.length} new games need store lookup`)

  for (const [i, appid] of needDetails.entries()) {
    const details = await fetchAppDetails(appid)
    if (details) {
      games[String(appid)].developer = details.developer
      games[String(appid)].genres    = details.genres
    }
    if (i < needDetails.length - 1) await sleep(APPDETAILS_DELAY)
  }

  // NOTE: no key, no steamid in the output — this file is committed publicly.
  const payload = {
    generatedAt: new Date().toISOString(),
    // SteamID64 is a public profile identifier, not a secret — safe to publish.
    // Deriving the link here means the site never hardcodes a guessed vanity URL.
    profileUrl: `https://steamcommunity.com/profiles/${ID}`,
    gameCount: Object.keys(games).length,
    games,
  }

  await writeFile(OUT, JSON.stringify(payload, null, 2) + '\n', 'utf8')
  console.log(`✓ wrote ${payload.gameCount} games → ${OUT}`)
}

main().catch(e => fail(e?.stack ?? e))
