import * as THREE from "three"
import { brimPoint, HAT } from "./shape"

function at(theta: number, radial: number, lift: number): [number, number, number] {
  const v = new THREE.Vector3()
  brimPoint(theta, radial, v)
  return [v.x, v.y + lift, v.z]
}

export type BeadScale = [number, number, number]

export type StrandSpec = {
  anchor: [number, number, number]
  hang: [number, number, number]
  scales: BeadScale[]
}

const hang = (theta: number, lift: number): [number, number, number] => [
  Math.cos(theta) * 0.42,
  lift,
  Math.sin(theta) * 0.42,
]

export const SAGE_THETA = 2.5

export const STRANDS: StrandSpec[] = [
  {
    anchor: at(0.38, 1, -0.012),
    hang: hang(0.38, -1),
    scales: [
      [0.058, 0.052, 0.056],
      [0.05, 0.046, 0.05],
      [0.066, 0.058, 0.062],
      [0.048, 0.046, 0.048],
      [0.074, 0.062, 0.07],
      [0.046, 0.042, 0.046],
      [0.04, 0.038, 0.04],
      [0.034, 0.032, 0.034],
    ],
  },
  {
    anchor: at(1.08, 1, -0.01),
    hang: hang(1.08, -1),
    scales: [
      [0.084, 0.07, 0.08],
      [0.06, 0.056, 0.06],
      [0.096, 0.078, 0.09],
      [0.055, 0.05, 0.054],
      [0.048, 0.044, 0.048],
      [0.04, 0.038, 0.04],
    ],
  },
  {
    anchor: at(0.78, 0.9, 0.02),
    hang: hang(0.78, -0.55),
    scales: [
      [0.13, 0.09, 0.118],
      [0.072, 0.066, 0.07],
      [0.06, 0.055, 0.058],
      [0.05, 0.046, 0.05],
      [0.042, 0.04, 0.042],
    ],
  },
  {
    anchor: at(SAGE_THETA - 0.15, 0.92, -0.01),
    hang: hang(SAGE_THETA - 0.15, -1),
    scales: [
      [0.05, 0.046, 0.05],
      [0.044, 0.04, 0.044],
      [0.038, 0.036, 0.038],
      [0.032, 0.03, 0.032],
    ],
  },
]

export const BAND_Y = HAT.baseY + 0.15
