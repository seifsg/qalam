import { href } from '../router.ts'
import type { CharSet, Letter } from '../types.ts'
import { h, link } from '../ui/dom.ts'
import { crayon, glyphSvg } from '../ui/glyph.ts'
import { marks } from '../ui/marks.ts'
import { bar } from './bar.ts'
import { soundButton } from './sound.ts'

/** One letter tile: its drawing and progress, linking to its first glyph's board. */
function tile(set: CharSet, l: Letter, n: number): HTMLLIElement {
  const g = l.glyphs[0]
  if (!g) throw new Error(`Qalam: letter ${l.id} has no glyphs`)
  return h('li', {}, link(href(set, g), l.say, `tile ${crayon(n)}`, glyphSvg(g, ''), marks(l)))
}

/** Grid of a set's letters, right to left for Arabic. */
export function grid(root: HTMLElement, set: CharSet, signal: AbortSignal): void {
  root.append(
    bar('#/', h('span', { lang: set.lang, dir: set.dir }, set.title), soundButton([set.lang], signal)),
    h('ol', { class: 'tiles', dir: set.dir, lang: set.lang }, ...set.letters.map((l, n) => tile(set, l, n))),
  )
}
