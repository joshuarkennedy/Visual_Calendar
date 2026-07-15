import { useSyncExternalStore } from 'react'
import { getSpeaking, subscribeSpeaking } from './speech'

/** True while a spoken label is (estimated to be) playing. Drives the pulse. */
export function useSpeaking(): boolean {
  return useSyncExternalStore(subscribeSpeaking, getSpeaking, () => false)
}
