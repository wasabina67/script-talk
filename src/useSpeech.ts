import { useState, useRef, useCallback, useEffect } from "react"
import type { ScriptLine } from "./types"

const VOICE_CONFIG = {
  A: { rate: 1.0, pitch: 1.2 },
  B: { rate: 1.1, pitch: 0.9 },
} as const

export function useSpeech(lines: ScriptLine[]) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const cancelIdRef = useRef(0)
  const linesRef = useRef(lines)
  const speakAtRef = useRef<(index: number, continuous: boolean, id: number) => void>(() => {})

  useEffect(() => {
    linesRef.current = lines
  }, [lines])

  // No deps: keeps speakAtRef in sync every render.
  // useEffect is required here because react-hooks/refs forbids ref writes during render.
  useEffect(() => {
    speakAtRef.current = (index: number, continuous: boolean, id: number) => {
      const line = linesRef.current[index]
      if (!line || id !== cancelIdRef.current) return

      const utterance = new SpeechSynthesisUtterance(line.speak)
      utterance.lang = "ja-JP"
      utterance.rate = VOICE_CONFIG[line.speaker].rate
      utterance.pitch = VOICE_CONFIG[line.speaker].pitch

      utterance.onend = () => {
        if (id !== cancelIdRef.current) return
        if (continuous) {
          const next = index + 1
          if (next < linesRef.current.length) {
            speakAtRef.current(next, true, id)
          } else {
            setIsPlaying(false)
            setCurrentIndex(null)
          }
        } else if (!continuous) {
          setCurrentIndex(null)
        }
      }

      setCurrentIndex(index)
      speechSynthesis.speak(utterance)
    }
  })

  const playAll = useCallback(() => {
    const id = ++cancelIdRef.current
    speechSynthesis.cancel()

    setIsPlaying(true)
    setIsPaused(false)

    speakAtRef.current(0, true, id)
  }, [])

  const stop = useCallback(() => {
    ++cancelIdRef.current
    speechSynthesis.cancel()

    setIsPlaying(false)
    setIsPaused(false)
    setCurrentIndex(null)
  }, [])

  const pause = useCallback(() => {
    speechSynthesis.pause()
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    speechSynthesis.resume()
    setIsPaused(false)
  }, [])

  const playLine = useCallback((index: number) => {
    const id = ++cancelIdRef.current
    speechSynthesis.cancel()

    setIsPlaying(false)
    setIsPaused(false)

    speakAtRef.current(index, false, id)
  }, [])

  useEffect(() => {
    const ref = cancelIdRef
    return () => {
      ++ref.current
      speechSynthesis.cancel()
    }
  }, [])

  return { currentIndex, isPlaying, isPaused, playAll, pause, resume, playLine, stop }
}
