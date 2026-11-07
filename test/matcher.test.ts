import { test } from 'node:test'
import assert from 'node:assert/strict'
import { drag, press, progress, RADIUS, stars, start } from '../src/trace/matcher.ts'
import type { Pt } from '../src/types.ts'

// A test-only stroke (not app data): left to right along y = 50, checkpoints every 5 units.
const line = (): Pt[] => Array.from({ length: 17 }, (_, k): Pt => [10 + k * 5, 50])
const along = (t: ReturnType<typeof start>, from: number, to: number) => {
  let last = 'ok'
  for (let x = from; x <= to; x += 2) last = drag(t, [x, 51])
  return last
}

test('traced in order from the start: passes with 3 stars', () => {
  const t = start(line())
  assert.equal(press(t, [11, 52]), 'go')
  assert.equal(along(t, 12, 90), 'done')
  assert.equal(progress(t), 1)
  assert.equal(stars(t.misses), 3)
})

test('starting anywhere but the start only hints', () => {
  const t = start(line())
  assert.equal(press(t, [50, 50]), 'hint')
  assert.equal(press(t, [90, 50]), 'hint', 'wrong direction never starts')
  assert.equal(t.i, -1)
})

test('leaving the path resets the stroke and counts a miss', () => {
  const t = start(line())
  press(t, [10, 50])
  along(t, 12, 40)
  assert.equal(drag(t, [42, 50 + RADIUS * 1.6 + 1]), 'miss')
  assert.equal(t.i, -1)
  assert.equal(stars(t.misses), 2)
})

test('cutting across a curve cannot shortcut the stroke', () => {
  // U shape: down the left, across the bottom, up the right.
  const u: Pt[] = [...Array.from({ length: 17 }, (_, k): Pt => [10, 10 + k * 5]),
    ...Array.from({ length: 16 }, (_, k): Pt => [15 + k * 5, 90]), ...Array.from({ length: 16 }, (_, k): Pt => [90, 85 - k * 5])]
  const t = start(u)
  press(t, [10, 10])
  let r = 'ok'
  for (let x = 12; x <= 90 && r === 'ok'; x += 2) r = drag(t, [x, 10])
  assert.equal(r, 'miss')
})

test('a retrace (down then back up the same line) follows the finger through the turn', () => {
  // Like h: down the stem, then back up it.
  const h: Pt[] = [...Array.from({ length: 13 }, (_, k): Pt => [30, 20 + k * 5]), ...Array.from({ length: 6 }, (_, k): Pt => [30, 75 - k * 5])]
  const t = start(h)
  press(t, [31, 21])
  let r = 'ok'
  for (let y = 22; y <= 80 && r === 'ok'; y += 2) r = drag(t, [32, y])
  assert.equal(r, 'ok')
  assert.ok(t.i >= 12 && t.i <= 13, `at the turn, not past it (i = ${t.i})`)
  for (let y = 78; y >= 50 && r === 'ok'; y -= 2) r = drag(t, [32, y])
  assert.equal(r, 'done')
})

test('turning back a little short of a turn (up then down, like a or u) still counts', () => {
  const up: Pt[] = [...Array.from({ length: 7 }, (_, k): Pt => [60, 80 - k * 5]), ...Array.from({ length: 7 }, (_, k): Pt => [60, 55 + k * 5])]
  const t = start(up)
  press(t, [60, 80])
  let r = 'ok'
  for (let y = 78; y >= 53 && r === 'ok'; y -= 1) r = drag(t, [62, y])
  for (let y = 54; y <= 85 && r === 'ok'; y += 1) r = drag(t, [62, y])
  assert.equal(r, 'done')
})

test('cutting inside a sharp corner (V) still follows the stroke', () => {
  const v: Pt[] = [...Array.from({ length: 13 }, (_, k): Pt => [20 + k * 2.5, 20 + k * 5]), ...Array.from({ length: 12 }, (_, k): Pt => [52.5 + k * 2.5, 75 - k * 5])]
  const t = start(v)
  press(t, [20, 18])
  let r = 'ok'
  for (const [x, y] of v.slice(1)) if (r === 'ok') r = drag(t, [x, y - 5])
  assert.equal(r === 'ok' ? drag(t, [80, 20]) : r, 'done')
})

test('lifting pauses: a touch where the finger stopped resumes', () => {
  const t = start(line())
  press(t, [10, 50])
  along(t, 12, 50)
  const paused = t.i
  assert.equal(press(t, [10, 50]), 'hint', 'cannot restart from the beginning mid-stroke')
  assert.equal(press(t, [50, 51]), 'go')
  assert.ok(t.i >= paused)
  assert.equal(along(t, 52, 90), 'done')
  assert.equal(t.misses, 0)
})

test('a dot passes on a tap near it', () => {
  const t = start([[50, 30]])
  assert.equal(press(t, [50 + RADIUS * 1.4, 30]), 'done')
  assert.equal(progress(t), 1)
})

test('bad input fails loudly', () => {
  assert.throws(() => start([]))
  assert.throws(() => drag(start(line()), [10, 50]))
})

test('stars: 3 clean, 2 for up to two misses, else 1', () => {
  assert.deepEqual([0, 1, 2, 3, 9].map(stars), [3, 2, 2, 1, 1])
})
