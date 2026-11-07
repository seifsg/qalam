import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SETS } from '../src/data/sets.ts'

// Absolute M/L/H/V/C/Q commands only, so every point stays inside the 100 box.
const PATH = /^M[\d. -]+(?:[LHVCQ][\d. -]+)*$/
const glyphs = SETS.flatMap((s) => s.letters.flatMap((l) => l.glyphs))

test('every glyph id is unique', () => {
  assert.equal(new Set(glyphs.map((g) => g.id)).size, glyphs.length)
})

test('every stroke is a valid in-box path and every dot is in the box', () => {
  for (const g of glyphs) {
    assert.ok(g.strokes.length, `${g.id} has strokes`)
    for (const d of g.strokes) {
      assert.match(d, PATH, `${g.id}: ${d}`)
      for (const n of d.match(/-?[\d.]+/g) ?? []) assert.ok(+n >= 0 && +n <= 100, `${g.id}: ${n} out of box`)
    }
    for (const [x, y] of g.dots) assert.ok(x >= 0 && x <= 100 && y >= 0 && y <= 100, `${g.id}: dot out of box`)
  }
})

test('sets hold the full alphabets', () => {
  const count = Object.fromEntries(SETS.map((s) => [s.id, s.letters.length]))
  assert.equal(count.upper, 26)
  assert.equal(count.lower, 26)
  assert.equal(count.ar, 28)
  const ar = SETS.find((s) => s.id === 'ar')?.letters ?? []
  assert.equal(ar.map((l) => l.char).join(''), 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي', 'alphabet order')
  const twoForms = new Set(['alif', 'dal', 'dhal', 'ra', 'zay', 'waw'])
  for (const l of ar) assert.equal(l.glyphs.length, twoForms.has(l.id) ? 2 : 4, `${l.id} forms`)
})
