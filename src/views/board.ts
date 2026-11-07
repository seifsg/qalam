import { href, order } from '../router.ts'
import { record } from '../store.ts'
import { stars } from '../trace/matcher.ts'
import type { CharSet, Glyph, Letter } from '../types.ts'
import { button, h, later, link } from '../ui/dom.ts'
import { crayon } from '../ui/glyph.ts'
import { icon, type IconName } from '../ui/icons.ts'
import { mascot, setMood } from '../ui/mascot.ts'
import { bar } from './bar.ts'
import { celebrate } from './celebrate.ts'
import { stage } from './stage.ts'
import { tracer } from './tracer.ts'

/** Previous or next glyph arrow; an empty slot keeps the layout steady at the ends. */
const step = (set: CharSet, g: Glyph | undefined, label: string, name: IconName): Element =>
  g ? link(href(set, g), label, 'btn btn-round', icon(name, 'flip')) : h('span', { class: 'btn-slot' })

/** Tracing screen: demo, trace stroke by stroke, then celebrate. */
export function board(root: HTMLElement, set: CharSet, letter: Letter, glyph: Glyph, signal: AbortSignal): void {
  const list = order(set)
  const at = list.indexOf(glyph)
  const next = list[at + 1]
  const pal = mascot()
  const host = h('div', { class: 'stage' }, pal)

  root.append(
    bar(href(set), h('span', { class: 'bar-letter', lang: set.lang, dir: set.dir }, letter.char, letter.say === letter.char ? '' : h('small', {}, letter.say))),
    host,
    h('nav', { class: 'controls', dir: set.dir },
      step(set, list[at - 1], 'Previous letter', 'back'),
      button('Show me', 'btn btn-big', () => (tr.reset(), void st.play()), signal, icon('play'), 'Show me'),
      step(set, next, 'Next letter', 'next')),
  )

  const st = stage(host, glyph, set.lang, crayon(set.letters.indexOf(letter)))
  const mood = (m: 'oops' | 'happy'): void => {
    setMood(pal, m)
    later(900, () => setMood(pal, 'idle'), signal)
  }
  const win = (misses: number): void => {
    const n = stars(misses)
    record(glyph.id, n)
    mood('happy')
    celebrate(root, n, next ? href(set, next) : href(set), set.dir, () => tr.reset(), signal)
  }
  const tr = tracer(st.svg, st.items, { ...st, miss: () => (st.miss(), mood('oops')) }, win, signal, st.stop)
  void st.play()
}
