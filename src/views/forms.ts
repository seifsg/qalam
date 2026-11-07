import { href } from '../router.ts'
import { best } from '../store.ts'
import type { CharSet, Form, Glyph, Letter } from '../types.ts'
import { h, link } from '../ui/dom.ts'
import { glyphSvg } from '../ui/glyph.ts'

const NAMES: Record<Form, string> = { iso: 'Alone', init: 'Start', med: 'Middle', fin: 'End' }

/** A letter's forms as big chips (Arabic): tap one to trace it, gold once traced. */
export function forms(set: CharSet, letter: Letter, current: Glyph): HTMLElement | string {
  if (letter.glyphs.length < 2) return ''
  return h('nav', { class: 'forms', dir: set.dir, 'aria-label': 'Letter forms' },
    ...letter.glyphs.map((g) => {
      const chip = link(href(set, g), g.form ? NAMES[g.form] : g.char, `form-chip${best(g.id) ? ' done' : ''}`, glyphSvg(g, ''))
      if (g === current) chip.setAttribute('aria-current', 'page')
      return chip
    }))
}
