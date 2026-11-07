import { ahead } from '../trace/sample.ts'
import type { Glyph, Pt } from '../types.ts'
import { s } from '../ui/dom.ts'
import { DOT_R } from '../ui/glyph.ts'
import type { Painter } from './tracer.ts'

/** The SVG parts the painter and the demo draw on. */
export interface Layers {
  readonly svg: SVGSVGElement
  readonly strokes: readonly SVGPathElement[]
  readonly ink: SVGGElement
  readonly fill: SVGPathElement
  readonly guide: SVGPathElement
  readonly mark: SVGGElement
  readonly num: SVGTextElement
  readonly arrow: SVGPathElement
  readonly finger: SVGCircleElement
}

/** Restart a one-shot CSS animation class (wobble, nudge) on an SVG element. */
function replay(el: SVGGraphicsElement, cls: string): void {
  el.classList.remove(cls)
  void el.getBBox()
  el.classList.add(cls)
}

/** Draws what the tracer reports: active stroke, fill share, finished ink, slips and hints. */
export function painter(l: Layers, g: Glyph, items: readonly (readonly Pt[])[]): Painter {
  let len = 0

  /** Put the numbered start dot at p with its arrow pointing toward `to`. */
  const place = (p: Pt, to: Pt, n: number): void => {
    l.mark.setAttribute('transform', `translate(${p[0]} ${p[1]})`)
    l.arrow.setAttribute('transform', `rotate(${(Math.atan2(to[1] - p[1], to[0] - p[0]) * 180) / Math.PI}) translate(10 0)`)
    l.arrow.classList.toggle('hidden', to === p)
    l.num.textContent = String(n)
  }

  return {
    active(k) {
      if (k === 0) l.ink.replaceChildren()
      const path = l.strokes[k]
      const dot = g.dots[k - l.strokes.length]
      l.fill.classList.toggle('hidden', !path)
      l.guide.classList.toggle('hidden', !path)
      if (!path) return dot && place(dot, dot, k + 1)
      const d = path.getAttribute('d') ?? ''
      len = path.getTotalLength()
      l.fill.setAttribute('d', d)
      l.guide.setAttribute('d', d)
      l.fill.style.strokeDasharray = `${len}`
      l.fill.style.strokeDashoffset = `${len}`
      place(items[k]![0]!, ahead(path, 6), k + 1)
    },
    fill(share) {
      l.fill.style.strokeDashoffset = `${len * (1 - share)}`
    },
    finish(k) {
      const path = l.strokes[k]
      const dot = g.dots[k - l.strokes.length]
      if (path) l.ink.append(s('path', { d: path.getAttribute('d') ?? '' }))
      else if (dot) l.ink.append(s('circle', { cx: dot[0], cy: dot[1], r: DOT_R, class: 'pop' }))
    },
    miss() {
      l.fill.style.strokeDashoffset = `${len}`
      replay(l.svg, 'wobble')
    },
    hint() {
      replay(l.mark, 'nudge')
    },
    finger(p) {
      l.finger.classList.toggle('hidden', !p)
      if (p) l.finger.setAttribute('transform', `translate(${p[0]} ${p[1]})`)
    },
  }
}
