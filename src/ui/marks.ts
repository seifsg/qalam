import { best } from '../store.ts'
import type { CharSet, Letter } from '../types.ts'
import { h } from './dom.ts'
import { star } from './icons.ts'

/** Under a tile: 3 stars for a one-glyph letter, else one dot per form (gold once traced). */
export function marks(l: Letter): HTMLElement {
  const [only, ...more] = l.glyphs
  if (only && !more.length) {
    const n = best(only.id)
    return h('span', { class: 'tile-stars', role: 'img', 'aria-label': `${n} of 3 stars` },
      ...[1, 2, 3].map((j) => star(`mini-star${j <= n ? ' on' : ''}`)))
  }
  const done = l.glyphs.filter((g) => best(g.id)).length
  return h('span', { class: 'tile-forms', role: 'img', 'aria-label': `${done} of ${l.glyphs.length} forms traced` },
    ...l.glyphs.map((g) => h('span', { class: `form-dot${best(g.id) ? ' on' : ''}` })))
}

/** Stars earned in a set and the most it can hold, for the home cards. */
export function tally(set: CharSet): readonly [number, number] {
  const ids = set.letters.flatMap((l) => l.glyphs.map((g) => g.id))
  return [ids.reduce((n, id) => n + best(id), 0), ids.length * 3]
}
