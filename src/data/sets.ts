import type { CharSet, Letter, Pt, SetId } from '../types.ts'
import { LOWER, LOWER_DOTS } from './en/lower.ts'
import { UPPER } from './en/upper.ts'

/** Latin letter: one glyph. `say` is the capital so voices read the letter name, not a word. */
function latin(set: SetId, [char, ...strokes]: readonly string[], dots: readonly Pt[] = []): Letter {
  if (!char || !strokes.length) throw new Error(`Qalam: bad ${set} letter row`)
  return { id: char, char, say: char.toUpperCase(), glyphs: [{ id: `${set}/${char}`, set, letter: char, char, strokes, dots }] }
}

/** Every practice set, in home-screen order. */
export const SETS: readonly CharSet[] = [
  { id: 'upper', dir: 'ltr', lang: 'en', title: 'ABC', letters: UPPER.map((row) => latin('upper', row)) },
  { id: 'lower', dir: 'ltr', lang: 'en', title: 'abc', letters: LOWER.map((row) => latin('lower', row, LOWER_DOTS[row[0] ?? ''])) },
]

export const findSet = (id: string): CharSet | undefined => SETS.find((s) => s.id === id)
