import { s } from './dom.ts'

// 24 x 24 line icons, drawn with currentColor so buttons theme them.
const PATHS = {
  back: 'M15 5 L8 12 L15 19',
  next: 'M9 5 L16 12 L9 19',
  again: 'M19 12 A7 7 0 1 1 16.5 6.6 M17 2.5 V7 H12.5',
  play: 'M8 5 L19 12 L8 19 Z',
  grid: 'M4 4 H10 V10 H4 Z M14 4 H20 V10 H14 Z M4 14 H10 V20 H4 Z M14 14 H20 V20 H14 Z',
  soundOn: 'M4 9 H8 L13 5 V19 L8 15 H4 Z M16.5 8.5 A5 5 0 0 1 16.5 15.5 M19 6 A8.5 8.5 0 0 1 19 18',
  soundOff: 'M4 9 H8 L13 5 V19 L8 15 H4 Z M16 9 L21 15 M21 9 L16 15',
} as const

export type IconName = keyof typeof PATHS

/** Inline icon; `flip` mirrors arrows for right-to-left sets. */
export const icon = (name: IconName, cls = ''): SVGSVGElement =>
  s('svg', { viewBox: '0 0 24 24', class: `icon ${cls}`, 'aria-hidden': 'true' }, s('path', { d: PATHS[name] }))

/** Five-point star in a 24 box, used for scores and confetti. */
export const STAR = 'M12 2 L14.9 8.6 L22 9.3 L16.6 14 L18.2 21 L12 17.3 L5.8 21 L7.4 14 L2 9.3 L9.1 8.6 Z'

/** Star icon with a class: score stars, tile stars and confetti share it. */
export const star = (cls: string): SVGSVGElement =>
  s('svg', { viewBox: '0 0 24 24', class: cls, 'aria-hidden': 'true' }, s('path', { d: STAR }))
