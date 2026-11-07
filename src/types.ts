/** A point in the 100 x 100 glyph box (y grows down, Arabic baseline near y = 62). */
export type Pt = readonly [number, number]

export type SetId = 'ar' | 'upper' | 'lower'
export type Form = 'iso' | 'init' | 'med' | 'fin'
export type Lang = 'ar' | 'en'

/** One traceable shape: a letter (or one Arabic form of it). Strokes first, dots last. */
export interface Glyph {
  readonly id: string
  readonly set: SetId
  readonly letter: string
  readonly form?: Form
  readonly char: string
  /** SVG path data per stroke, in teaching order. */
  readonly strokes: readonly string[]
  /** Dots and taps after the strokes, in teaching order. */
  readonly dots: readonly Pt[]
}

export interface Letter {
  readonly id: string
  readonly char: string
  /** What the device voice says. */
  readonly say: string
  readonly glyphs: readonly Glyph[]
}

export interface CharSet {
  readonly id: SetId
  readonly dir: 'rtl' | 'ltr'
  readonly lang: Lang
  readonly title: string
  readonly letters: readonly Letter[]
}

export type Route =
  | { readonly view: 'home' }
  | { readonly view: 'grid'; readonly set: CharSet }
  | { readonly view: 'board'; readonly set: CharSet; readonly letter: Letter; readonly glyph: Glyph }
