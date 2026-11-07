import { button, h, link } from '../ui/dom.ts'
import { icon, star } from '../ui/icons.ts'
import { mascot } from '../ui/mascot.ts'

const WORDS = { 1: 'You did it!', 2: 'Great job!', 3: 'Amazing!' } as const
const CONFETTI = 18
const HUES = ['--tomato', '--sun', '--leaf', '--sky', '--grape', '--pink'] as const

/** One confetti star; positions come from the golden angle, so the burst is even, not random. */
function confetto(k: number): SVGSVGElement {
  const el = star('confetto')
  const a = k * 2.39996
  const r = 120 + (k % 4) * 45
  el.style.setProperty('--dx', `${Math.cos(a) * r}px`)
  el.style.setProperty('--dy', `${Math.sin(a) * r}px`)
  el.style.setProperty('--rot', `${(k % 2 ? 1 : -1) * (180 + k * 20)}deg`)
  el.style.setProperty('--cc', `var(${HUES[k % HUES.length]})`)
  return el
}

/** Success card: stars earned, a cheering pencil, then try again or go on. */
export function celebrate(root: HTMLElement, n: 1 | 2 | 3, next: string, dir: string, again: () => void, signal: AbortSignal): void {
  const go = link(next, 'Next letter', 'btn btn-big go', icon('next', 'flip'))
  const dlg = h('div', { class: 'win', role: 'dialog', 'aria-modal': 'true', 'aria-label': `${WORDS[n]} ${n} stars` },
    h('div', { class: 'confetti', 'aria-hidden': 'true' }, ...Array.from({ length: CONFETTI }, (_, k) => confetto(k))),
    h('div', { class: 'win-card' },
      mascot('happy'),
      h('div', { class: 'win-stars' }, ...[1, 2, 3].map((j) => star(`win-star${j <= n ? ' on' : ''}`))),
      h('p', { class: 'win-word' }, WORDS[n]),
      h('div', { class: 'win-actions', dir },
        button('Try again', 'btn btn-big', () => (dlg.remove(), again()), signal, icon('again')),
        go)))
  root.append(dlg)
  go.focus()
}
