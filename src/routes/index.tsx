import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Overlay } from "@/hat/overlay"
import { bindRoomVideo, stopRoom } from "@/hat/room"
import { Stage } from "@/hat/stage"
import { useStudio } from "@/hat/store"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  const room = useStudio((s) => s.room)
  const [on, setOn] = useState(false)
  useEffect(() => {
    setOn(true)
    return () => stopRoom()
  }, [])

  return (
    <main className={room ? "stage room" : "stage"}>
      <video
        ref={bindRoomVideo}
        className="room-video"
        playsInline
        muted
        autoPlay
      />
      <Overlay />
      {on ? <Stage /> : null}
    </main>
  )
}
