import { soundOn } from './store.ts'
import type { Lang } from './types.ts'

const synth = (): SpeechSynthesis | undefined => globalThis.speechSynthesis

/** A device voice for the language, or undefined: then we stay silent rather than misread. */
const voice = (lang: Lang): SpeechSynthesisVoice | undefined =>
  synth()?.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang))

export const canSpeak = (lang: Lang): boolean => !!voice(lang)

/** Say a letter name in its language when sound is on and the device has that voice. */
export function say(text: string, lang: Lang): void {
  const s = synth()
  const v = voice(lang)
  if (!s || !v || !soundOn()) return
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
