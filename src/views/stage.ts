import { ahead, checkpoints } from '../trace/sample.ts'
import type { Glyph, Lang, Pt } from '../types.ts'
import { s } from '../ui/dom.ts'
import { DOT_R } from '../ui/glyph.ts'
import type { Painter } from './tracer.ts'

/** Writing lines per script: Latin cap/mid/base, Arabic baseline with soft helpers. */
const RULES: Record<Lang, readonly (readonly [number, string])[]> = {
  en: [[18, 'rule'], [50, 'rule mid'], [82, 'rule base']],
  ar: [[30, 'rule'], [62, 'rule base'], [86, 'rule']],
}

export interface Stage extends Painter {
  readonly svg: SVGSVGElement
  readonly items: readonly (readonly Pt[])[]
  play(): Promise<void>
  stop(): void
}

/** Pause the demo between strokes. */
const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
/** The device asks for less motion: skip the demo animation. */
const reduced = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches

/** The tracing paper: track, finished ink, live fill, start marker, finger. Mounted into `host`. */
export function stage(host: Element, g: Glyph, lang: Lang, color: string): Stage {
  const strokes = g.strokes.map((d) => s('path', { d, class: 'track' }))
  const dots = g.dots.map(([cx, cy]) => s('circle', { cx, cy, r: DOT_R + 2.2, class: 'track' }))
  const ink = s('g', { class: 'ink' })
  const fill = s('path', { class: 'live' })
  const guide = s('path', { class: 'guide' })
  const num = s('text', { class: 'start-num', 'text-anchor': 'middle', 'dominant-baseline': 'central' })
  const arrow = s('path', { class: 'start-arrow', d: 'M-2.6 -3.4 L2.4 0 L-2.6 3.4' })
  const mark = s('g', { class: 'start' }, s('circle', { class: 'start-dot', r: 6 }), num, arrow)
  const finger = s('circle', { class: 'finger hidden', r: 5 })
  const svg = s('svg', { viewBox: '-4 -4 108 108', class: `paper ${color}`, role: 'img', 'aria-label': `Trace ${g.char}` },
    ...RULES[lang].map(([y, cls]) => s('line', { x1: -4, x2: 104, y1: y, y2: y, class: cls })),
    ...strokes, ...dots, ink, fill, guide, mark, finger)
  host.append(svg)

  const items = [...strokes.map(checkpoints), ...g.dots.map((p): Pt[] => [p])]
  let len = 0
  let demo = 0

  /** Put the numbered start dot at p with its arrow pointing toward `to`. */
  const place = (p: Pt, to: Pt, n: number): void => {
    mark.setAttribute('transform', `translate(${p[0]} ${p[1]})`)
    arrow.setAttribute('transform', `rotate(${(Math.atan2(to[1] - p[1], to[0] - p[0]) * 180) / Math.PI}) translate(10 0)`)
    arrow.classList.toggle('hidden', to === p)
    num.textContent = String(n)
  }

  const paint: Painter = {
    active(k) {
      if (k === 0) ink.replaceChildren()
      const path = strokes[k]
      const dot = g.dots[k - strokes.length]
      fill.classList.toggle('hidden', !path)
      guide.classList.toggle('hidden', !path)
      if (path) {
        const d = path.getAttribute('d') ?? ''
        len = path.getTotalLength()
        fill.setAttribute('d', d)
        guide.setAttribute('d', d)
        fill.style.strokeDasharray = `${len}`
        fill.style.strokeDashoffset = `${len}`
        const p0 = items[k]![0]!
        place(p0, ahead(path, 6), k + 1)
      } else if (dot) place(dot, dot, k + 1)
    },
    fill(share) {
      fill.style.strokeDashoffset = `${len * (1 - share)}`
    },
    finish(k) {
      const path = strokes[k]
      const dot = g.dots[k - strokes.length]
      if (path) ink.append(s('path', { d: path.getAttribute('d') ?? '' }))
      else if (dot) ink.append(s('circle', { cx: dot[0], cy: dot[1], r: DOT_R, class: 'pop' }))
    },
    miss() {
      fill.style.strokeDashoffset = `${len}`
      svg.classList.remove('wobble')
      void svg.getBBox()
      svg.classList.add('wobble')
    },
    hint() {
      mark.classList.remove('nudge')
      void mark.getBBox()
      mark.classList.add('nudge')
    },
    finger(p) {
      finger.classList.toggle('hidden', !p)
      if (p) finger.setAttribute('transform', `translate(${p[0]} ${p[1]})`)
    },
  }

  /** Show the whole letter being written once, in order; any touch stops it. */
  async function play(): Promise<void> {
    const id = ++demo
    svg.classList.add('demo')
    if (reduced()) return stop()
    for (let k = 0; k < items.length && id === demo; k++) {
      paint.active(k)
      const ms = Math.max(450, len * 14)
      fill.style.transitionDuration = `${ms}ms`
      await wait(30)
      paint.fill(1)
      await wait(ms + 120)
      if (id === demo) paint.finish(k)
    }
    if (id === demo) stop()
  }

  /** End a running demo and clear its ink; a no-op once tracing has begun. */
  function stop(): void {
    if (!svg.classList.contains('demo')) return
    demo++
    svg.classList.remove('demo')
    fill.style.transitionDuration = ''
    paint.active(0)
  }

  return { ...paint, svg, items, play, stop }
}
