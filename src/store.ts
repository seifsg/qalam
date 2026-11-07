// Progress on this device only: best stars per glyph and the sound switch. Sole owner of the key.
const KEY = 'qalam:v1'

type Stars = 1 | 2 | 3
interface Saved {
  stars: Record<string, Stars>
  sound: boolean
}

/** localStorage when the browser allows it; null in private modes or with storage blocked. */
function disk(): Storage | null {
  try {
    const s = window.localStorage
    s.getItem(KEY)
    return s
  } catch (e) {
    console.warn('Qalam: storage blocked, progress kept for this visit only', e)
    return null
  }
}

/** Keep only well-formed values from whatever was stored (old, hand-edited or corrupt). */
function normalize(raw: unknown): Saved {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const stars: Record<string, Stars> = {}
  if (o.stars && typeof o.stars === 'object') {
    for (const [id, n] of Object.entries(o.stars)) if (n === 1 || n === 2 || n === 3) stars[id] = n
  }
  return { stars, sound: o.sound !== false }
}

function load(store: Storage | null): Saved {
  try {
    return normalize(JSON.parse(store?.getItem(KEY) ?? '{}'))
  } catch (e) {
    console.warn('Qalam: saved progress unreadable, starting fresh', e)
    return normalize({})
  }
}

const store = disk()
const data = load(store)

function save(): void {
  try {
    store?.setItem(KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Qalam: could not save progress', e)
  }
}

/** Best stars earned on a glyph, 0 if never finished. */
export const best = (id: string): 0 | Stars => data.stars[id] ?? 0

/** Keep the better of the old and new result. */
export function record(id: string, n: Stars): void {
  if (n <= best(id)) return
  data.stars[id] = n
  save()
}

export const soundOn = (): boolean => data.sound

export function setSound(on: boolean): void {
  data.sound = on
  save()
}
