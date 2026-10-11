import { cameraMessage, startRoom, stopRoom } from "./room"
import { useStudio, VIEWS, type ViewId } from "./store"

const ORDER: ViewId[] = ["whole", "lace", "pearls", "sage", "within"]

export function Overlay() {
  const view = useStudio((s) => s.view)
  const setView = useStudio((s) => s.setView)
  const holding = useStudio((s) => s.holding)
  const room = useStudio((s) => s.room)
  const setRoom = useStudio((s) => s.setRoom)
  const roomNote = useStudio((s) => s.roomNote)
  const setRoomNote = useStudio((s) => s.setRoomNote)

  async function onRoom() {
    if (room) {
      stopRoom()
      setRoom(false)
      setRoomNote(null)
      return
    }
    setRoomNote(null)
    try {
      const opened = await startRoom()
      if (!opened) return
      setRoom(true)
    } catch (error) {
      stopRoom()
      setRoom(false)
      setRoomNote(cameraMessage(error))
    }
  }

  const hint = holding
    ? "Let go. It swings back."
    : roomNote
      ? roomNote
      : room
        ? "It is floating in front of the room. Drag to turn it."
        : "Drag to turn. Draw a pearl off the brim."

  return (
    <div className="overlay">
      <header className="study">
        <p className="kicker">A large hat</p>
        <h1>Sibylline</h1>
        <p className="note">
          Muted purple and black. Purple lace, sage through the band, and pearls that pull away.
        </p>
      </header>
      <footer className="dock">
        <p className="hint">{hint}</p>
        <nav className="views" aria-label="Views">
          {ORDER.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              onClick={() => setView(id)}
            >
              {VIEWS[id].label}
            </button>
          ))}
          <button type="button" aria-pressed={room} onClick={() => void onRoom()}>
            Room
          </button>
        </nav>
      </footer>
    </div>
  )
}
