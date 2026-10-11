import { useMemo } from "react"
import * as THREE from "three"
import { SAGE_THETA } from "./composition"
import { palette } from "./palette"
import { HAT, brimPoint, leafGeometry } from "./shape"

const LEAVES: { pos: [number, number, number]; rot: [number, number, number]; len: number; wid: number; deep: boolean }[] = [
  { pos: [0.02, 0.02, 0.0], rot: [0.5, 0.2, 0.7], len: 0.36, wid: 0.11, deep: false },
  { pos: [0.08, 0.05, 0.06], rot: [0.3, -0.4, 0.2], len: 0.28, wid: 0.09, deep: true },
  { pos: [-0.02, 0.08, -0.05], rot: [0.8, 0.6, -0.4], len: 0.32, wid: 0.1, deep: false },
  { pos: [0.12, -0.02, 0.1], rot: [1.1, 0.1, 0.9], len: 0.24, wid: 0.08, deep: true },
  { pos: [0.0, 0.14, 0.08], rot: [0.2, 0.8, 0.4], len: 0.22, wid: 0.07, deep: false },
  { pos: [-0.06, 0.04, 0.1], rot: [0.6, -0.7, -0.5], len: 0.3, wid: 0.095, deep: false },
  { pos: [0.16, 0.1, -0.02], rot: [0.4, 1.2, 0.3], len: 0.18, wid: 0.06, deep: true },
]

export function SageCluster() {
  const origin = useMemo(() => {
    const v = new THREE.Vector3()
    brimPoint(SAGE_THETA, 0.34, v)
    return v
  }, [])
  const broad = useMemo(() => leafGeometry(1, 1), [])
  const leafMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: palette.sage,
        roughness: 0.78,
        metalness: 0,
        sheen: 0.45,
        sheenRoughness: 0.55,
        sheenColor: "#d5decc",
        side: THREE.DoubleSide,
      }),
    [],
  )
  const deepMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: palette.sageDeep,
        roughness: 0.82,
        metalness: 0,
        sheen: 0.3,
        sheenColor: "#c5d0bc",
        side: THREE.DoubleSide,
      }),
    [],
  )
  const stemMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette.sageDeep, roughness: 0.72 }),
    [],
  )
  const flowerMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette.flower, roughness: 0.58 }),
    [],
  )
  const boneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: palette.bone, roughness: 0.62 }),
    [],
  )

  return (
    <group>
      <group position={origin} rotation={[0.35, -SAGE_THETA + Math.PI / 2, 0.15]} scale={1.85}>
        {LEAVES.map((leaf, i) => (
          <mesh
            key={i}
            geometry={broad}
            material={leaf.deep ? deepMat : leafMat}
            position={leaf.pos}
            rotation={leaf.rot}
            scale={[leaf.wid, leaf.len, 1]}
            dispose={null}
          />
        ))}
        <Spike position={[0.05, 0.12, 0.02]} tilt={0.35} height={0.46} stem={stemMat} flower={flowerMat} bone={boneMat} />
        <Spike position={[-0.04, 0.08, 0.08]} tilt={-0.25} height={0.34} stem={stemMat} flower={flowerMat} bone={boneMat} />
        <Spike position={[0.1, 0.06, -0.04]} tilt={0.55} height={0.28} stem={stemMat} flower={flowerMat} bone={boneMat} />
      </group>
      <group position={[-0.22, HAT.baseY + 0.28, 0.18]} rotation={[0.2, 0.6, -0.4]}>
        <mesh geometry={broad} material={leafMat} dispose={null} scale={[0.08, 0.26, 1]} rotation={[0.4, 0.2, 0.5]} />
        <mesh geometry={broad} material={deepMat} dispose={null} position={[0.04, 0.04, 0.02]} scale={[0.06, 0.18, 1]} rotation={[0.8, -0.3, 0.2]} />
      </group>
    </group>
  )
}

function Spike({
  position,
  tilt,
  height,
  stem,
  flower,
  bone,
}: {
  position: [number, number, number]
  tilt: number
  height: number
  stem: THREE.Material
  flower: THREE.Material
  bone: THREE.Material
}) {
  const petals = 7
  return (
    <group position={position} rotation={[tilt, 0.4, 0]}>
      <mesh position={[0, height / 2, 0]} material={stem}>
        <cylinderGeometry args={[0.006, 0.011, height, 6]} />
      </mesh>
      {Array.from({ length: petals }, (_, i) => {
        const t = (i + 1) / (petals + 0.4)
        const side = i % 2 === 0 ? 1 : -1
        return (
          <mesh
            key={i}
            position={[side * 0.018, t * height, 0]}
            rotation={[0, 0, side * 0.7]}
            scale={[0.016, 0.026, 0.012]}
            material={i % 3 === 0 ? bone : flower}
          >
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
        )
      })}
    </group>
  )
}
