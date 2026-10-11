let video: HTMLVideoElement | null = null
let stream: MediaStream | null = null
let generation = 0

export function bindRoomVideo(el: HTMLVideoElement | null) {
  video = el
  if (!el) return
  if (stream) {
    el.srcObject = stream
    void el.play().catch(() => {})
  }
}

function attach(next: MediaStream) {
  stream?.getTracks().forEach((track) => track.stop())
  stream = next
  if (!video) return
  video.srcObject = next
  const facing = next.getVideoTracks()[0]?.getSettings().facingMode
  video.style.transform = facing === "user" ? "scaleX(-1)" : ""
  void video.play().catch(() => {})
}

export async function startRoom() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser has no camera.")
  }
  const ticket = ++generation
  const next = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  })
  if (ticket !== generation) {
    next.getTracks().forEach((track) => track.stop())
    return false
  }
  attach(next)
  return true
}

export function stopRoom() {
  generation += 1
  stream?.getTracks().forEach((track) => track.stop())
  stream = null
  if (video) {
    video.srcObject = null
    video.style.transform = ""
  }
}

export function cameraMessage(error: unknown) {
  const name = error instanceof DOMException ? error.name : ""
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Allow the camera. If nothing asks, open this page on your phone."
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "No camera was found on this device."
  }
  if (error instanceof Error && error.message) return error.message
  return "The camera didn't open."
}
