import type { Pt } from '../types.ts'

/** Checkpoint spacing in glyph units: dense enough for tight curves, cheap per move. */
const STEP = 5

/** Evenly spaced checkpoints along a rendered path, start to end (arc length, native API). */
export function checkpoints(path: SVGGeometryElement): Pt[] {
  const len = path.getTotalLength()
  const n = Math.max(1, Math.round(len / STEP))
  return Array.from({ length: n + 1 }, (_, k): Pt => {
    const p = path.getPointAtLength((len * k) / n)
    return [p.x, p.y]
  })
}

/** Point a little way along a path, for the direction arrow at a stroke start. */
export function ahead(path: SVGGeometryElement, by: number): Pt {
  const p = path.getPointAtLength(Math.min(by, path.getTotalLength()))
  return [p.x, p.y]
}
