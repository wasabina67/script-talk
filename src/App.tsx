import { useState, useEffect, useRef } from "react"
import type { ScriptLine } from "./types"
import { useSpeech } from "./useSpeech"
import "./App.css"

function App() {
  const [lines, setLines] = useState<ScriptLine[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bubbleRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: ScriptLine[]) => {
        const validSpeakers = ["A", "B"]
        for (const line of data) {
          if (!validSpeakers.includes(line.speaker)) {
            throw new Error(`Invalid speaker: ${line.speaker}`)
          }
          if (!line.name || !line.display || !line.speak) {
            throw new Error("Missing required field in script line")
          }
        }
        setLines(data)
        setIsLoaded(true)
      })
      .catch((err) => setError(err.message))
  }, [])

  const { currentIndex, isPlaying, isPaused, playAll, pause, resume, playLine, stop } =
    useSpeech(lines)

  useEffect(() => {
    if (currentIndex !== null && bubbleRefs.current[currentIndex]) {
      bubbleRefs.current[currentIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [currentIndex])

  if (error) {
    return (
      <div className="container">
        <div className="loading">Error: {error}</div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Script Talk</h1>
      </div>
      <div className="controls">
        {!isPlaying ? (
          <button onClick={playAll}>Play</button>
        ) : (
          <button onClick={stop}>Stop</button>
        )}
        {isPlaying && !isPaused && <button onClick={pause}>Pause</button>}
        {isPlaying && isPaused && <button onClick={resume}>Resume</button>}
      </div>
      <div className="chat">
        {lines.map((line, i) => (
          <div
            key={i}
            ref={(el) => { bubbleRefs.current[i] = el }}
            className={[
              "bubble",
              `bubble-${line.speaker.toLowerCase()}`,
              currentIndex === i ? "bubble-active" : "",
            ].filter(Boolean).join(" ")}
            onClick={() => playLine(i)}
          >
            <div className="speaker-name">{line.name}</div>
            <div className="bubble-text">{line.display}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
