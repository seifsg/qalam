type Kid = Node | string
type Attrs = Readonly<Record<string, string | number>>

const SVG_NS = 'http://www.w3.org/2000/svg'

function fill<E extends Element>(el: E, attrs: Attrs, kids: readonly Kid[]): E {
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v))
  el.append(...kids)
  return el
}

/** HTML element with attributes and children: the one DOM builder views share. */
export const h = <K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...kids: Kid[]): HTMLElementTagNameMap[K] =>
  fill(document.createElement(tag), attrs, kids)

/** SVG element twin of `h`. */
export const s = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs = {}, ...kids: Kid[]): SVGElementTagNameMap[K] =>
  fill(document.createElementNS(SVG_NS, tag), attrs, kids)

/** Button that runs `act` on click; listeners die with the view's signal. */
export function button(label: string, cls: string, act: () => void, signal: AbortSignal, ...kids: Kid[]): HTMLButtonElement {
  const b = h('button', { type: 'button', class: cls, 'aria-label': label }, ...kids)
  b.addEventListener('click', act, { signal })
  return b
}

/** Link-styled tile or card for hash navigation (keeps browser back working). */
export const link = (href: string, label: string, cls: string, ...kids: Kid[]): HTMLAnchorElement =>
  h('a', { href, class: cls, 'aria-label': label }, ...kids)

/** setTimeout that dies with the view, so no timer outlives its screen. */
export function later(ms: number, fn: () => void, signal: AbortSignal): void {
  const id = setTimeout(fn, ms)
  signal.addEventListener('abort', () => clearTimeout(id), { once: true })
}
