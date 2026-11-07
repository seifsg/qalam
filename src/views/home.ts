import { SETS } from '../data/sets.ts'
import { href } from '../router.ts'
import type { CharSet } from '../types.ts'
import { h, link } from '../ui/dom.ts'
import { crayon, glyphSvg } from '../ui/glyph.ts'
import { star } from '../ui/icons.ts'
import { tally } from '../ui/marks.ts'
import { mascot } from '../ui/mascot.ts'

/** Big colourful card for one set, with a peek at its first letters. */
function card(set: CharSet, n: number): HTMLAnchorElement {
  const peek = set.letters.slice(0, 3).flatMap((l) => (l.glyphs[0] ? [glyphSvg(l.glyphs[0], '')] : []))
  const [got, max] = tally(set)
  return link(href(set), `${set.title} letters, ${got} of ${max} stars`, `set-card ${crayon(n)}`,
    h('span', { class: 'set-title', lang: set.lang, dir: set.dir }, set.title),
    h('span', { class: 'set-peek', dir: set.dir }, ...peek),
    h('span', { class: 'set-score' }, star('mini-star on'), `${got} / ${max}`))
}

/** Home: pick a script. */
export function home(root: HTMLElement): void {
  root.append(
    h('header', { class: 'hero' },
      mascot(),
      h('h1', { class: 'logo' }, 'Qalam', h('span', { class: 'logo-ar', lang: 'ar', dir: 'rtl' }, 'قلم')),
      h('p', { class: 'tagline' }, 'Trace letters with your finger')),
    h('nav', { class: 'sets', 'aria-label': 'Letter sets' }, ...SETS.map(card)),
    h('p', { class: 'trust' }, 'No ads · No accounts · No tracking'),
  )
}
