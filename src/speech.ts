import { soundOn } from './store.ts'
import type { Lang } from './types.ts'

/** The device speech engine, when the browser has one. */
const synth = (): SpeechSynthesis | undefined => globalThis.speechSynthesis

/** A device voice for the language, or undefined: then we stay silent rather than misread. */
const voice = (lang: Lang): SpeechSynthesisVoice | undefined =>
  synth()?.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang))

/** The device can say names in this language. */
export const canSpeak = (lang: Lang): boolean => !!voice(lang)

/** Say a letter name in its language when sound is on and the device has that voice. */
export function say(text: string, lang: Lang): void {
  const s = synth()
  if (!s || !soundOn()) return
  if (!s.getVoices().length) return s.addEventListener('voiceschanged', () => say(text, lang), { once: true })
  const v = voice(lang)
  if (!v) return
  s.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.voice = v
  u.lang = v.lang
  u.rate = 0.85
  s.speak(u)
}

/** Voices load late on some browsers: rerun `fn` when the list arrives. */
export function onVoices(fn: () => void, signal: AbortSignal): void {
  synth()?.addEventListener('voiceschanged', fn, { signal })
}
