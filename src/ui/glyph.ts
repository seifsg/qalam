import type { Glyph } from '../types.ts'
import { s } from './dom.ts'

const CRAYONS = ['tomato', 'sky', 'leaf', 'grape', 'sun', 'pink'] as const

/** Crayon colour class for the n-th letter of a set: neighbours never match. */
export const crayon = (n: number): string => `c-${CRAYONS[n % CRAYONS.length]}`

/** Dot radius in glyph units: the same in tiles and on the board. */
export const DOT_R = 4.2

/** Each stroke as a path and each dot as a circle, all with one class. */
export const shapes = (g: Glyph, cls: string): SVGElement[] => [
  ...g.strokes.map((d) => s('path', { d, class: cls })),
  ...g.dots.map(([cx, cy]) => s('circle', { cx, cy, r: DOT_R, class: cls })),
]

/** Small static drawing of a glyph, for tiles and cards. */
export const glyphSvg = (g: Glyph, cls: string): SVGSVGElement =>
  s('svg', { viewBox: '0 0 100 100', class: `glyph ${cls}`, 'aria-hidden': 'true' }, ...shapes(g, 'ink'))
