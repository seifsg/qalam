import { h, link } from '../ui/dom.ts'
import { icon } from '../ui/icons.ts'

/** Top bar shared by every screen: optional back link, a title, optional tools on the end. */
export const bar = (back: string | null, title: Node | string, ...end: Node[]): HTMLElement =>
  h('header', { class: 'bar' },
    back ? link(back, 'Back', 'btn btn-round', icon('back')) : h('span', { class: 'bar-gap' }),
    h('div', { class: 'bar-title' }, title),
    h('div', { class: 'bar-end' }, ...end))
