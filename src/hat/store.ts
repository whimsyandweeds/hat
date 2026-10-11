import { create } from "zustand"

export type ViewId = "whole" | "lace" | "pearls" | "sage" | "within"

type Studio = {
  view: ViewId
  setView: (view: ViewId) => void
  holding: boolean
  setHolding: (holding: boolean) => void
  turning: boolean
  setTurning: (turning: boolean) => void
  room: boolean
  setRoom: (room: boolean) => void
  roomNote: string | null
  setRoomNote: (roomNote: string | null) => void
}

export const useStudio = create<Studio>((set) => ({
  view: "whole",
  setView: (view) => set({ view, turning: false }),
  holding: false,
  setHolding: (holding) => set({ holding }),
  turning: true,
  setTurning: (turning) => set({ turning }),
  room: false,
  setRoom: (room) => set({ room, turning: room ? false : true }),
  roomNote: null,
  setRoomNote: (roomNote) => set({ roomNote }),
}))

export const VIEWS: Record<
  ViewId,
  {
    label: string
    position: [number, number, number]
    target: [number, number, number]
    mobile: number
  }
> = {
  whole: {
    label: "Whole",
    position: [3.35, 1.22, 3.7],
    target: [0.02, 1.32, 0.04],
    mobile: 1.46,
  },
  lace: {
    label: "Lace",
    position: [1.55, 0.28, 1.85],
    target: [0.95, 0.05, 1.15],
    mobile: 1.22,
  },
  pearls: {
    label: "Pearls",
    position: [2.35, 0.78, 1.85],
    target: [0.45, 0.32, 0.28],
    mobile: 1.18,
  },
  sage: {
    label: "Sage",
    position: [-1.55, 0.72, 1.25],
    target: [-0.62, 0.48, 0.42],
    mobile: 1.25,
  },
  within: {
    label: "Within",
    position: [0.12, 0.22, 0.28],
    target: [0.04, 2.15, 0.02],
    mobile: 1.08,
  },
}