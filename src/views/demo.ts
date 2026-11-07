import type { Layers } from './painter.ts'
import type { Painter } from './tracer.ts'

/** Pause the demo between strokes. */
const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
/** The device asks for less motion: skip the demo animation. */
const reduced = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches

/** Writes the whole letter once, in order. A touch, a new demo or leaving the screen stops it. */
export function demo(l: Layers, paint: Painter, count: number, signal: AbortSignal): { play(): Promise<void>; stop(): void } {
  let run = 0
  signal.addEventListener('abort', () => run++, { once: true })

  /** End a running demo and clear its ink; a no-op once tracing has begun. */
  function stop(): void {
    if (!l.svg.classList.contains('demo')) return
    run++
    l.svg.classList.remove('demo')
    l.fill.style.transitionDuration = ''
    paint.active(0)
  }

  /** One stroke after another; every await re-checks that this run is still the current one. */
  async function play(): Promise<void> {
    const id = ++run
    l.svg.classList.add('demo')
    if (reduced()) return stop()
    for (let k = 0; k < count; k++) {
      paint.active(k)
      const ms = Math.max(450, Number.parseFloat(l.fill.style.strokeDasharray || '0') * 14)
      l.fill.style.transitionDuration = `${ms}ms`
      await wait(30)
      if (id !== run) return
      paint.fill(1)
      await wait(ms + 120)
      if (id !== run) return
      paint.finish(k)
    }
    stop()
  }

  return { play, stop }
}
