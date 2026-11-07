import { drag, press, progress, start, type Trace } from '../trace/matcher.ts'
import type { Pt } from '../types.ts'

/** What the tracer asks the stage to draw. `k` indexes strokes, then dots. */
export interface Painter {
  active(k: number): void
  fill(share: number): void
  finish(k: number): void
  miss(): void
  hint(): void
  finger(p: Pt | null): void
}

export interface Tracer {
  reset(): void
}

/** Everything one board's tracing needs; one per screen. */
interface Ctx {
  readonly svg: SVGSVGElement
  readonly items: readonly (readonly Pt[])[]
  readonly paint: Painter
  readonly done: (misses: number) => void
  readonly onTouch: () => void
  traces: Trace[]
  k: number
  down: boolean
}

/** Screen pointer to glyph-box units; stays right through resizes and rotation. */
function toBox(svg: SVGSVGElement, e: PointerEvent): Pt | null {
  const m = svg.getScreenCTM()
  if (!m) return null
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
  return [p.x, p.y]
}

/** Start over at the first stroke (open, "Show me", "Try again"). */
function reset(c: Ctx): void {
  c.traces = c.items.map(start)
  c.k = 0
  c.down = false
  c.paint.active(0)
}

/** Finger up: the stroke pauses where it is. */
function lift(c: Ctx): void {
  c.down = false
  c.paint.finger(null)
}

/** Stroke done: ink it, then the next stroke or the win. */
function advance(c: Ctx): void {
  c.paint.finish(c.k)
  lift(c)
  if (++c.k < c.traces.length) return c.paint.active(c.k)
  c.done(c.traces.reduce((n, t) => n + t.misses, 0))
}

/** Finger down: start, resume or restart the current stroke, else nudge the start dot. */
function onDown(c: Ctx, e: PointerEvent): void {
  const t = c.traces[c.k]
  const p = toBox(c.svg, e)
  if (!e.isPrimary || !t || !p) return
  e.preventDefault()
  c.onTouch()
  const r = press(t, p)
  if (r === 'hint') return c.paint.hint()
  c.svg.setPointerCapture(e.pointerId)
  c.down = true
  c.paint.finger(p)
  c.paint.fill(progress(t))
  if (r === 'done') advance(c)
}

/** Finger moves: match every coalesced point, but draw once per event. */
function onMove(c: Ctx, e: PointerEvent): void {
  const t = c.traces[c.k]
  if (!c.down || !e.isPrimary || !t) return
  const batch = e.getCoalescedEvents?.() ?? []
  let p: Pt | null = null
  for (const ev of batch.length ? batch : [e]) {
    p = toBox(c.svg, ev) ?? p
    const step = p ? drag(t, p) : 'ok'
    if (step === 'done') return advance(c)
    if (step === 'miss') return (lift(c), c.paint.miss())
  }
  c.paint.finger(p)
  c.paint.fill(progress(t))
}

/** Wires pointer input to the matcher, one item at a time, in teaching order. */
export function tracer(
  svg: SVGSVGElement,
  items: readonly (readonly Pt[])[],
  paint: Painter,
  done: (misses: number) => void,
  signal: AbortSignal,
  onTouch: () => void,
): Tracer {
  const c: Ctx = { svg, items, paint, done, onTouch, traces: [], k: 0, down: false }
  svg.addEventListener('pointerdown', (e) => onDown(c, e), { signal })
  svg.addEventListener('pointermove', (e) => onMove(c, e), { signal })
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
    svg.addEventListener(type, () => lift(c), { signal })
  }
  reset(c)
  return { reset: () => reset(c) }
}
