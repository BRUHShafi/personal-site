// Cover-image URL builders, shared by interests.js and steamMerge.js.
//
// SECURITY: these interpolate an id into a URL, so callers must pass a validated
// value. Both guard the appid themselves (see below).

// Steam appids are integers. Guarding here means a bad value yields no image
// rather than a crafted <img src>.
const safeAppid = (id) => (Number.isInteger(Number(id)) && Number(id) > 0 ? Number(id) : null)

export const steam = (id) => {
  const appid = safeAppid(id)
  return appid
    ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/library_600x900.jpg`
    : null
}

export const steamFallback = (id) => {
  const appid = safeAppid(id)
  return appid
    ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`
    : null
}
