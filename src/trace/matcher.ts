import type { Pt } from '../types.ts'

/** Checkpoint hit radius in glyph-box units: about a small fingertip on a phone. */
export const RADIUS = 9
/** Farther than this from the current segment = the finger left the path. */
const OFF = RADIUS * 1.6
/** How far along the stroke one step may look: enough to round a sharp corner, too few to skip a loop. */
const AHEAD = 3

/** One stroke being traced. `i` = last checkpoint reached, -1 = not started. */
export interface Trace {
  readonly pts: readonly Pt[]
  readonly r: number
  i: number
  misses: number
}

export type Press = 'go' | 'hint' | 'done'
export type Step = 'ok' | 'miss' | 'done'

/** Squared distance: comparisons need no square root. */
const d2 = (a: Pt, b: Pt): number => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2

/** Squared distance from p to segment ab. */
function segD2(p: Pt, a: Pt, b: Pt): number {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = dx * dx + dy * dy
  const t = len ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len)) : 0
  return d2(p, [a[0] + t * dx, a[1] + t * dy])
}

/** Index of the stroke's final checkpoint. */
const last = (t: Trace): number => t.pts.length - 1
/** The finger is within the trace's radius of checkpoint j. */
const hits = (t: Trace, j: number, p: Pt): boolean => d2(p, t.pts[j]!) <= t.r * t.r

/** New trace over ordered checkpoints. A single point is a dot: bigger target, tap to pass. */
export function start(pts: readonly Pt[]): Trace {
  if (!pts.length) throw new Error('Qalam: a stroke needs at least one checkpoint')
  return { pts, r: pts.length === 1 ? RADIUS * 1.5 : RADIUS, i: -1, misses: 0 }
}

/** Finger down: it must land on the stroke start, or where a lifted finger paused. */
export function press(t: Trace, p: Pt): Press {
  const from = Math.max(t.i, 0)
  for (let j = Math.min(t.i + 1, last(t)); j >= from; j--) {
    if (!hits(t, j, p)) continue
    t.i = Math.max(t.i, j)
    return t.i === last(t) ? 'done' : 'go'
  }
  return 'hint'
}

/** Move to the nearest of the next few checkpoints if it is nearer than the current one. */
function step(t: Trace, p: Pt): boolean {
  let best = t.i
  let near = d2(p, t.pts[t.i]!)
  for (let j = t.i + 1; j <= Math.min(t.i + AHEAD, last(t)); j++) {
    const d = d2(p, t.pts[j]!)
    if (d < near) [best, near] = [j, d]
  }
  const moved = best > t.i
  t.i = best
  return moved
}

/**
 * Finger moves: progress follows the finger along the stroke, through corners (V, W), turns and
 * retraces (a, h, m, u), and never jumps ahead. Too far from the current segment resets the stroke.
 */
export function drag(t: Trace, p: Pt): Step {
  if (t.i < 0) throw new Error('Qalam: drag called before a successful press')
  while (t.i < last(t) && step(t, p));
  if (t.i === last(t)) return 'done'
  if (segD2(p, t.pts[t.i]!, t.pts[t.i + 1]!) <= OFF * OFF) return 'ok'
  t.i = -1
  t.misses++
  return 'miss'
}

/** Share of the stroke traced, 0 to 1, for the fill under the finger. */
export const progress = (t: Trace): number => (last(t) ? Math.max(t.i, 0) / last(t) : +(t.i === 0))

/** Stars for a finished glyph: honest and deterministic, no chance involved. */
export const stars = (misses: number): 1 | 2 | 3 => (misses === 0 ? 3 : misses <= 2 ? 2 : 1)
