import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { BAND_Y, STRANDS } from "./composition"
import { createLaceMaterial } from "./lace"
import { palette } from "./palette"
import {
  brimLipGeometry,
  brimTopGeometry,
  brimUnderGeometry,
  crownGeometry,
  laceEdgeGeometry,
  laceTopGeometry,
  leafGeometry,
  veilGeometry,
} from "./shape"

function useVelvet(color: string, sheen: string, roughness: number) {
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness,
        metalness: 0,
        sheen: 0.18,
        sheenRoughness: 0.62,
        sheenColor: sheen,
        envMapIntensity: 0.45,
      }),
    [color, roughness, sheen],
  )
  return material
}

export function HatMesh() {
  const crown = useMemo(() => crownGeometry(), [])
  const top = useMemo(() => brimTopGeometry(), [])
  const under = useMemo(() => brimUnderGeometry(), [])
  const lip = useMemo(() => brimLipGeometry(), [])
  const edge = useMemo(() => laceEdgeGeometry(), [])
  const laceTop = useMemo(() => laceTopGeometry(), [])
  const veil = useMemo(() => veilGeometry(), [])
  const claspGeo = useMemo(() => leafGeometry(0.2, 0.07), [])
  const velvet = useVelvet("#1f86b4", "#d7f3ff", 0.62)
  const blackVelvet = useVelvet("#16141a", "#3a3344", 0.84)
  const silk = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: palette.silk,
        roughness: 0.34,
        metalness: 0.18,
        sheen: 0.85,
        sheenRoughness: 0.28,
        sheenColor: "#4a4158",
        envMapIntensity: 0.7,
        side: THREE.DoubleSide,
      }),
    [],
  )
  const lining = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    const g = canvas.getContext("2d")
    if (g) {
      g.fillStyle = "#100e13"
      g.fillRect(0, 0, 256, 256)
      g.strokeStyle = "rgba(138, 122, 158, 0.28)"
      g.lineWidth = 1
      for (let i = -256; i < 512; i += 18) {
        g.beginPath()
        g.moveTo(i, 0)
        g.lineTo(i + 256, 256)
        g.stroke()
        g.beginPath()
        g.moveTo(i, 256)
        g.lineTo(i + 256, 0)
        g.stroke()
      }
    }
    const map = new THREE.CanvasTexture(canvas)
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.repeat.set(5, 7)
    map.colorSpace = THREE.SRGBColorSpace
    return new THREE.MeshStandardMaterial({
      color: "#1a1520",
      map,
      roughness: 0.92,
      metalness: 0.04,
      side: THREE.BackSide,
    })
  }, [])
  const edgeLace = useMemo(() => createLaceMaterial([9, 2.2]), [])
  const topLace = useMemo(() => createLaceMaterial([20, 8]), [])
  const veilLace = useMemo(() => createLaceMaterial([5, 4]), [])
  const crownLace = useMemo(() => createLaceMaterial([8, 14]), [])
  const metal = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: palette.metal,
        metalness: 0.86,
        roughness: 0.38,
        envMapIntensity: 0.8,
      }),
    [],
  )
  const pearl = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: palette.pearl,
        roughness: 0.26,
        metalness: 0.04,
        clearcoat: 0.75,
        clearcoatRoughness: 0.28,
        iridescence: 0.18,
        iridescenceIOR: 1.25,
        iridescenceThicknessRange: [180, 480],
        sheen: 0.25,
        sheenColor: palette.ink,
        sheenRoughness: 0.6,
        envMapIntensity: 0.85,
      }),
    [],
  )

  const sewn = useMemo(() => {
    const dummy = new THREE.Object3D()
    const matrices: THREE.Matrix4[] = []
    const count = 26
    for (let i = 0; i < count; i++) {
      const theta = -0.7 + (i / (count - 1)) * 2.7
      if (Math.abs(theta - 0.72) < 0.22) continue
      const radius = 0.575
      dummy.position.set(Math.cos(theta) * radius, BAND_Y + 0.02, Math.sin(theta) * radius)
      const s = i % 6 === 0 ? 0.034 : 0.026
      dummy.scale.setScalar(s)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      matrices.push(dummy.matrix.clone())
    }
    return matrices
  }, [])

  const seed = useMemo(() => new THREE.SphereGeometry(1, 16, 12), [])
  const sewnRef = useRef<THREE.InstancedMesh | null>(null)

  useLayoutEffect(() => {
    const mesh = sewnRef.current
    if (!mesh) return
    sewn.forEach((matrix, i) => mesh.setMatrixAt(i, matrix))
    mesh.instanceMatrix.needsUpdate = true
    mesh.count = sewn.length
  }, [sewn, sewnRef])

  const claspAt = STRANDS[2]!.anchor

  return (
    <group>
      <mesh dispose={null} geometry={crown} material={velvet} />
      <mesh dispose={null} geometry={crown} material={crownLace} scale={1.012} renderOrder={2} />
      <mesh dispose={null} geometry={crown} material={lining} scale={[0.9, 0.99, 0.9]} position={[0.015, 0.03, 0]} />
      <mesh dispose={null} geometry={top} material={velvet} />
      <mesh dispose={null} geometry={under} material={blackVelvet} />
      <mesh dispose={null} geometry={lip} material={blackVelvet} />
      <mesh dispose={null} position={[0, BAND_Y, 0]} material={silk}>
        <cylinderGeometry args={[0.575, 0.6, 0.2, 72, 1, true]} />
      </mesh>
      <mesh dispose={null} geometry={edge} material={edgeLace} renderOrder={2} />
      <mesh dispose={null} geometry={laceTop} material={topLace} renderOrder={2} />
      <mesh dispose={null} geometry={veil} material={veilLace} renderOrder={3} />
      <mesh dispose={null}
        geometry={claspGeo}
        material={metal}
        position={[claspAt[0] - 0.02, claspAt[1] + 0.02, claspAt[2] - 0.01]}
        rotation={[0.9, 0.35, 1.15]}
      />
      <instancedMesh ref={sewnRef} args={[seed, pearl, sewn.length]} dispose={null} />
      <Instrument metal={metal} pearl={pearl} />
    </group>
  )
}

function Instrument({
  metal,
  pearl,
}: {
  metal: THREE.Material
  pearl: THREE.Material
}) {
  const rings = [
    { y: 1.55, r: 0.22, tube: 0.0045, x: 0.02, z: 0.01, tilt: 0.12 },
    { y: 1.78, r: 0.14, tube: 0.004, x: -0.015, z: 0.02, tilt: -0.08 },
    { y: 1.34, r: 0.28, tube: 0.0035, x: 0.01, z: -0.02, tilt: 0.18 },
  ]
  return (
    <group>
      {rings.map((ring) => (
        <mesh dispose={null}
          key={ring.y}
          material={metal}
          position={[ring.x, ring.y, ring.z]}
          rotation={[Math.PI / 2 + ring.tilt, 0.2, 0]}
        >
          <torusGeometry args={[ring.r, ring.tube, 8, 48]} />
        </mesh>
      ))}
      <mesh dispose={null} material={pearl} position={[0.05, 1.58, 0.03]} scale={[0.045, 0.04, 0.045]}>
        <sphereGeometry args={[1, 20, 14]} />
      </mesh>
    </group>
  )
}
