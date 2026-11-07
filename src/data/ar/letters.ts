import type { Form, Glyph, Letter, Pt } from '../../types.ts'
import { BODIES, QAF, type Forms } from './bodies.ts'

type Dots = readonly [n: 1 | 2 | 3, at: 'above' | 'below']
type Row = readonly [id: string, char: string, name: string, forms: Forms, dots?: Dots]

const FORMS: readonly Form[] = ['iso', 'init', 'med', 'fin']
const TATWEEL = 'ـ'

// Alphabet order. Families share a body; dots tell the letters apart.
const ROWS: readonly Row[] = [
  ['alif', 'ا', 'ألف', BODIES.alif],
  ['ba', 'ب', 'باء', BODIES.ba, [1, 'below']],
  ['ta', 'ت', 'تاء', BODIES.ba, [2, 'above']],
  ['tha', 'ث', 'ثاء', BODIES.ba, [3, 'above']],
  ['jim', 'ج', 'جيم', BODIES.jim, [1, 'below']],
  ['hha', 'ح', 'حاء', BODIES.jim],
  ['kha', 'خ', 'خاء', BODIES.jim, [1, 'above']],
  ['dal', 'د', 'دال', BODIES.dal],
  ['dhal', 'ذ', 'ذال', BODIES.dal, [1, 'above']],
  ['ra', 'ر', 'راء', BODIES.ra],
  ['zay', 'ز', 'زاي', BODIES.ra, [1, 'above']],
  ['sin', 'س', 'سين', BODIES.sin],
  ['shin', 'ش', 'شين', BODIES.sin, [3, 'above']],
  ['sad', 'ص', 'صاد', BODIES.sad],
  ['dad', 'ض', 'ضاد', BODIES.sad, [1, 'above']],
  ['tah', 'ط', 'طاء', BODIES.tah],
  ['zah', 'ظ', 'ظاء', BODIES.tah, [1, 'above']],
  ['ain', 'ع', 'عين', BODIES.ain],
  ['ghain', 'غ', 'غين', BODIES.ain, [1, 'above']],
  ['fa', 'ف', 'فاء', BODIES.fa, [1, 'above']],
  ['qaf', 'ق', 'قاف', QAF, [2, 'above']],
  ['kaf', 'ك', 'كاف', BODIES.kaf],
  ['lam', 'ل', 'لام', BODIES.lam],
  ['mim', 'م', 'ميم', BODIES.mim],
  ['nun', 'ن', 'نون', BODIES.nun, [1, 'above']],
  ['ha', 'ه', 'هاء', BODIES.heh],
  ['waw', 'و', 'واو', BODIES.waw],
  ['ya', 'ي', 'ياء', BODIES.ya, [2, 'below']],
]

/** Dots around their anchor, right one first (Arabic order); three make a little hill. */
const spread = ([x, y]: Pt, n: 1 | 2 | 3): Pt[] =>
  n === 1 ? [[x, y]] : n === 2 ? [[x + 5.5, y], [x - 5.5, y]] : [[x + 5.5, y + 4], [x - 5.5, y + 4], [x, y - 5.5]]

/** How a form looks on its own: the letter with joining marks where it links. */
const label = (c: string, f: Form): string =>
  f === 'init' ? c + TATWEEL : f === 'med' ? TATWEEL + c + TATWEEL : f === 'fin' ? TATWEEL + c : c

/** One Arabic letter: a glyph per form its family has, dots placed from the body's anchors. */
function letter([id, char, say, forms, dots]: Row): Letter {
  const glyphs = FORMS.flatMap((form): Glyph[] => {
    const body = forms[form]
    if (!body) return []
    const at = dots ? spread(dots[1] === 'above' ? body.above : body.below, dots[0]) : []
    return [{ id: `ar/${id}/${form}`, set: 'ar', letter: id, form, char: label(char, form), strokes: body.d, dots: at }]
  })
  return { id, char, say, glyphs }
}

export const ARABIC: readonly Letter[] = ROWS.map(letter)
