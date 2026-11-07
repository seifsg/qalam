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

/** Screen pointer to glyph-box units; stays right through resizes and rotation. */
function toBox(svg: SVGSVGElement, e: PointerEvent): Pt | null {
  const m = svg.getScreenCTM()
  if (!m) return null
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
  return [p.x, p.y]
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
  let traces: Trace[] = []
  let k = 0
  let down = false

  /** Start over at the first stroke (open, "Show me", "Try again"). */
  const reset = (): void => {
    traces = items.map(start)
    k = 0
    down = false
    paint.active(0)
  }

  /** Finger up: the stroke pauses where it is. */
  const lift = (): void => {
    down = false
    paint.finger(null)
  }

  /** Stroke done: ink it, then the next stroke or the win. */
  const advance = (): void => {
    paint.finish(k)
    lift()
    if (++k < traces.length) return paint.active(k)
    done(traces.reduce((n, t) => n + t.misses, 0))
  }

  svg.addEventListener('pointerdown', (e) => {
    const t = traces[k]
    const p = toBox(svg, e)
    if (!e.isPrimary || !t || !p) return
    e.preventDefault()
    onTouch()
    const r = press(t, p)
    if (r === 'hint') return paint.hint()
    svg.setPointerCapture(e.pointerId)
    down = true
    paint.finger(p)
    paint.fill(progress(t))
    if (r === 'done') advance()
  }, { signal })

  svg.addEventListener('pointermove', (e) => {
    const t = traces[k]
    if (!down || !e.isPrimary || !t) return
    const batch = e.getCoalescedEvents?.() ?? []
    let p: Pt | null = null
    for (const ev of batch.length ? batch : [e]) {
      p = toBox(svg, ev) ?? p
      const step = p ? drag(t, p) : 'ok'
      if (step === 'done') return advance()
      if (step === 'miss') {
        lift()
        return paint.miss()
      }
    }
    // Match every coalesced point, but draw once per event.
    paint.finger(p)
    paint.fill(progress(t))
  }, { signal })

  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
    svg.addEventListener(type, lift, { signal })
  }

  reset()
  return { reset }
}
