import { findSet } from './data/sets.ts'
import type { CharSet, Glyph, Route } from './types.ts'

/** Hash for a set grid or one glyph's board: `#/upper`, `#/ar/ba/init`. */
export const href = (set: CharSet, g?: Glyph): string =>
  g ? `#/${set.id}/${encodeURIComponent(g.letter)}${g.form ? `/${g.form}` : ''}` : `#/${set.id}`

/** Decode one hash part; a malformed escape (hand-typed URL) reads as unknown. */
function part(x: string): string {
  try {
    return decodeURIComponent(x)
  } catch {
    console.warn('Qalam: ignoring malformed URL part', x)
    return ''
  }
}

/** Turn any hash into a valid route; anything unknown falls back to the nearest real screen. */
export function parse(hash: string): Route {
  const [setId, letterId, form] = hash.replace(/^#\/?/, '').split('/').map(part)
  const set = setId ? findSet(setId) : undefined
  if (!set) return { view: 'home' }
  const letter = set.letters.find((l) => l.id === letterId)
  const glyph = form ? letter?.glyphs.find((g) => g.form === form) : letter?.glyphs[0]
  return letter && glyph ? { view: 'board', set, letter, glyph } : { view: 'grid', set }
}

/** Glyphs of a set in practice order (letters, then their forms). */
export const order = (set: CharSet): Glyph[] => set.letters.flatMap((l) => l.glyphs)
