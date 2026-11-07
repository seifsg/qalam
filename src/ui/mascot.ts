import { s } from './dom.ts'

export type Mood = 'idle' | 'happy' | 'oops'

/** Qalam the pencil: cheers on success, wobbles kindly on a slip. Mood is a data attribute. */
export function mascot(mood: Mood = 'idle'): SVGSVGElement {
  const el = s('svg', { viewBox: '0 0 120 140', class: 'mascot', 'data-mood': mood, 'aria-hidden': 'true' },
    s('path', { class: 'm-arm m-arm-l', d: 'M42 74 Q28 70 22 58' }),
    s('path', { class: 'm-arm m-arm-r', d: 'M78 74 Q92 70 98 58' }),
    s('rect', { class: 'm-eraser', x: 40, y: 6, width: 40, height: 20, rx: 9 }),
    s('rect', { class: 'm-band', x: 40, y: 24, width: 40, height: 9 }),
    s('rect', { class: 'm-body', x: 40, y: 32, width: 40, height: 68 }),
    s('rect', { class: 'm-facet', x: 53, y: 32, width: 14, height: 68 }),
    s('path', { class: 'm-wood', d: 'M40 100 L80 100 L60 134 Z' }),
    s('path', { class: 'm-lead', d: 'M53.5 123 L66.5 123 L60 134 Z' }),
    s('circle', { class: 'm-cheek', cx: 47, cy: 69, r: 4 }),
    s('circle', { class: 'm-cheek', cx: 73, cy: 69, r: 4 }),
    s('circle', { class: 'm-eye', cx: 52, cy: 58, r: 4 }),
    s('circle', { class: 'm-eye', cx: 68, cy: 58, r: 4 }),
    s('path', { class: 'm-mouth m-idle', d: 'M53 70 Q60 76 67 70' }),
    s('path', { class: 'm-mouth m-happy', d: 'M51 68 Q60 82 69 68 Z' }),
    s('circle', { class: 'm-mouth m-oops', cx: 60, cy: 72, r: 3.5 }),
  )
  return el
}

/** Switch the mascot's mood; CSS animates the change. */
export const setMood = (el: SVGSVGElement, mood: Mood): void => {
  el.dataset.mood = mood
}
