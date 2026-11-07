import { canSpeak, onVoices } from '../speech.ts'
import { setSound, soundOn } from '../store.ts'
import type { Lang } from '../types.ts'
import { button } from '../ui/dom.ts'
import { icon } from '../ui/icons.ts'

/** Sound on/off switch (saved). Dimmed when the device has no voice for these languages. */
export function soundButton(langs: readonly Lang[], signal: AbortSignal, onEnable?: () => void): HTMLButtonElement {
  const paint = (): void => {
    const on = soundOn()
    const mute = !langs.some(canSpeak)
    b.replaceChildren(icon(on ? 'soundOn' : 'soundOff'))
    b.setAttribute('aria-pressed', String(on))
    b.classList.toggle('mute', mute)
    b.title = mute ? 'No voice for this language on this device' : on ? 'Sound on' : 'Sound off'
  }
  const b = button('Sound', 'btn btn-round sound', () => {
    setSound(!soundOn())
    paint()
    if (soundOn()) onEnable?.()
  }, signal)
  paint()
  onVoices(paint, signal)
  return b
}
