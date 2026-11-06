const STORAGE_KEY = 'moonlady.signalReceiverUrl'

const EXAMPLE = 'http://192.168.1.50:3000'

export type ReceiverUrlResult = { valid: true; url: string } | { valid: false; reason: string }

/** Accepts only a server's base address, and returns it in one standard form. */
export function parseReceiverUrl(input: string): ReceiverUrlResult {
  const text = input.trim()
  if (!text) return { valid: false, reason: `Enter an address, such as ${EXAMPLE}` }

  let url: URL
  try {
    url = new URL(text)
  } catch {
    return { valid: false, reason: `Enter a full address, such as ${EXAMPLE}` }
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { valid: false, reason: `Start the address with http://, such as ${EXAMPLE}` }
  }
  if (url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    return { valid: false, reason: `Enter only the host and port, such as ${EXAMPLE}` }
  }

  return { valid: true, url: url.origin }
}

/** The address saved in this browser, if there is one and it's still usable. */
export function loadSavedReceiverUrl() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === null) return null
    const result = parseReceiverUrl(saved)
    return result.valid ? result.url : null
  } catch {
    return null
  }
}

/** Storage can be unavailable, as in some private windows. The address then lasts until reload. */
export function saveReceiverUrl(url: string) {
  try {
    localStorage.setItem(STORAGE_KEY, url)
  } catch {
    // Nothing else to do.
  }
}

export function clearSavedReceiverUrl() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing else to do.
  }
}
