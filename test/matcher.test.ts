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
  assert.equal(drag(t, [42, 50 + RADIUS * 2 + 1]), 'miss')
  assert.equal(t.i, -1)
  assert.equal(stars(t.misses), 2)
})

test('jumping ahead cannot shortcut the stroke', () => {
  const t = start(line())
  press(t, [10, 50])
  assert.equal(drag(t, [90, 50]), 'miss')
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
