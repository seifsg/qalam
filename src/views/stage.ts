import { checkpoints } from '../trace/sample.ts'
import type { Glyph, Lang, Pt } from '../types.ts'
import { s } from '../ui/dom.ts'
import { DOT_R } from '../ui/glyph.ts'
import { demo } from './demo.ts'
import { painter, type Layers } from './painter.ts'
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

/** Build the paper: rules, track, finished ink, live fill, guide, start marker, finger. */
function layers(g: Glyph, lang: Lang, color: string): Layers {
  const strokes = g.strokes.map((d) => s('path', { d, class: 'track' }))
  const dots = g.dots.map(([cx, cy]) => s('circle', { cx, cy, r: DOT_R + 2.2, class: 'track' }))
  const num = s('text', { class: 'start-num', 'text-anchor': 'middle', 'dominant-baseline': 'central' })
  const arrow = s('path', { class: 'start-arrow', d: 'M-2.6 -3.4 L2.4 0 L-2.6 3.4' })
  const parts = {
    strokes, num, arrow,
    ink: s('g', { class: 'ink' }),
    fill: s('path', { class: 'live' }),
    guide: s('path', { class: 'guide' }),
    mark: s('g', { class: 'start' }, s('circle', { class: 'start-dot', r: 6 }), num, arrow),
    finger: s('circle', { class: 'finger hidden', r: 5 }),
  }
  const svg = s('svg', { viewBox: '-6 -6 112 112', class: `paper ${color}`, role: 'img', 'aria-label': `Trace ${g.char}` },
    ...RULES[lang].map(([y, cls]) => s('line', { x1: -6, x2: 106, y1: y, y2: y, class: cls })),
    ...strokes, ...dots, parts.ink, parts.fill, parts.guide, parts.mark, parts.finger)
  return { svg, ...parts }
}

/** The tracing paper, mounted into `host`; its demo dies with the view's signal. */
export function stage(host: Element, g: Glyph, lang: Lang, color: string, signal: AbortSignal): Stage {
  const l = layers(g, lang, color)
  host.append(l.svg)
  const items = [...l.strokes.map(checkpoints), ...g.dots.map((p): Pt[] => [p])]
  const paint = painter(l, g, items)
  return { ...paint, svg: l.svg, items, ...demo(l, paint, items.length, signal) }
}
