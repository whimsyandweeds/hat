import { useFrame, useThree } from "@react-three/fiber"
import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { STRANDS, type StrandSpec } from "./composition"
import { palette } from "./palette"
import { useStudio } from "./store"

type Bead = { pos: THREE.Vector3; prev: THREE.Vector3; radius: number }

type StrandSim = {
  anchor: THREE.Vector3
  beads: Bead[]
  rests: number[]
}

const delta = new THREE.Vector3()
const hangDir = new THREE.Vector3()
const hit = new THREE.Vector3()
const plane = new THREE.Plane()
const normal = new THREE.Vector3()
const pointer = new THREE.Vector2()
const raycaster = new THREE.Raycaster()

function beadRadius(scale: [number, number, number]) {
  return Math.max(scale[0], scale[1], scale[2])
}

function satisfy(a: THREE.Vector3, b: THREE.Vector3, rest: number, pinA: boolean, pinB: boolean) {
  if (pinA && pinB) return
  delta.subVectors(b, a)
  const len = delta.length()
  if (len < 1e-5) return
  const diff = (len - rest) / len
  if (pinA) b.addScaledVector(delta, -diff)
  else if (pinB) a.addScaledVector(delta, diff)
  else {
    a.addScaledVector(delta, diff * 0.5)
    b.addScaledVector(delta, -diff * 0.5)
  }
}

function stepStrand(
  strand: StrandSim,
  dt: number,
  dragIndex: number,
  dragPos: THREE.Vector3 | null,
  breeze: boolean,
  time: number,
  salt: number,
) {
  const gravity = -5.4
  const damp = Math.exp(-0.85 * dt)
  for (let i = 0; i < strand.beads.length; i++) {
    const bead = strand.beads[i]!
    if (dragPos && i === dragIndex) {
      bead.prev.copy(bead.pos)
      bead.pos.copy(dragPos)
      continue
    }
    const ax = breeze ? Math.sin(time * 0.75 + i + salt) * 0.22 : 0
    const az = breeze ? Math.cos(time * 0.52 + i * 1.2) * 0.16 : 0
    const nx = bead.pos.x + (bead.pos.x - bead.prev.x) * damp + ax * dt * dt
    const ny = bead.pos.y + (bead.pos.y - bead.prev.y) * damp + gravity * dt * dt
    const nz = bead.pos.z + (bead.pos.z - bead.prev.z) * damp + az * dt * dt
    bead.prev.copy(bead.pos)
    bead.pos.set(nx, ny, nz)
  }
  for (let n = 0; n < 8; n++) {
    const first = strand.beads[0]
    if (!first) break
    const pinFirst = Boolean(dragPos) && dragIndex === 0
    satisfy(strand.anchor, first.pos, strand.rests[0]!, true, pinFirst)
    for (let i = 1; i < strand.beads.length; i++) {
      const a = strand.beads[i - 1]!
      const b = strand.beads[i]!
      satisfy(
        a.pos,
        b.pos,
        strand.rests[i]!,
        Boolean(dragPos) && dragIndex === i - 1,
        Boolean(dragPos) && dragIndex === i,
      )
    }
    if (dragPos && dragIndex >= 0) {
      const pinned = strand.beads[dragIndex]
      if (pinned) {
        pinned.pos.copy(dragPos)
        pinned.prev.copy(dragPos)
      }
    }
  }
  for (const bead of strand.beads) {
    const minY = 0.07 + bead.radius
    if (bead.pos.y < minY) {
      bead.pos.y = minY
      if (bead.prev.y < bead.pos.y) bead.prev.y = bead.pos.y
    }
  }
}

function createSim(specs: StrandSpec[]) {
  const strands: StrandSim[] = specs.map((spec) => {
    hangDir.set(spec.hang[0], spec.hang[1], spec.hang[2]).normalize()
    const anchor = new THREE.Vector3(...spec.anchor)
    const beads: Bead[] = []
    const rests: number[] = []
    let cursor = anchor.clone()
    spec.scales.forEach((scale, index) => {
      const radius = beadRadius(scale)
      const prevRadius = index === 0 ? 0.02 : beadRadius(spec.scales[index - 1]!)
      const rest = index === 0 ? radius + 0.035 : radius + prevRadius + 0.022
      rests.push(rest)
      cursor = cursor.clone().addScaledVector(hangDir, rest)
      beads.push({ pos: cursor.clone(), prev: cursor.clone(), radius })
    })
    return { anchor, beads, rests }
  })
  for (let step = 0; step < 80; step++) {
    strands.forEach((strand, salt) => stepStrand(strand, 1 / 60, -1, null, false, step / 60, salt))
  }
  for (const strand of strands) {
    for (const bead of strand.beads) bead.prev.copy(bead.pos)
  }
  return strands
}

export function PearlField({ still }: { still: boolean }) {
  const strands = useMemo(() => createSim(STRANDS), [])
  const meshes = useRef<(THREE.Mesh | null)[][]>(STRANDS.map((spec) => spec.scales.map(() => null)))
  const lines = useMemo(
    () =>
      STRANDS.map((spec) => {
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array((spec.scales.length + 1) * 3), 3),
        )
        const material = new THREE.LineBasicMaterial({
          color: palette.pearl,
          transparent: true,
          opacity: 0.4,
        })
        const line = new THREE.Line(geometry, material)
        line.frustumCulled = false
        line.raycast = () => null
        return line
      }),
    [],
  )
  const pearlMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: palette.pearl,
        roughness: 0.24,
        metalness: 0.03,
        clearcoat: 0.8,
        clearcoatRoughness: 0.24,
        iridescence: 0.2,
        iridescenceIOR: 1.28,
        iridescenceThicknessRange: [160, 460],
        sheen: 0.3,
        sheenColor: palette.ink,
        sheenRoughness: 0.55,
        envMapIntensity: 0.9,
      }),
    [],
  )
  const drag = useRef<{ s: number; i: number } | null>(null)
  const setHolding = useStudio((s) => s.setHolding)
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const time = useRef(0)

  const apply = () => {
    strands.forEach((strand, s) => {
      const line = lines[s]
      if (!line) return
      const attr = line.geometry.getAttribute("position") as THREE.BufferAttribute
      attr.setXYZ(0, strand.anchor.x, strand.anchor.y, strand.anchor.z)
      strand.beads.forEach((bead, i) => {
        meshes.current[s]?.[i]?.position.copy(bead.pos)
        attr.setXYZ(i + 1, bead.pos.x, bead.pos.y, bead.pos.z)
      })
      attr.needsUpdate = true
    })
  }

  useLayoutEffect(() => {
    apply()
  }, [])

  useLayoutEffect(() => {
    const el = gl.domElement
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return
      const rect = el.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const objects: THREE.Object3D[] = []
      for (const row of meshes.current) {
        for (const mesh of row) if (mesh) objects.push(mesh)
      }
      const found = raycaster.intersectObjects(objects, false)[0]?.object
      const data = found?.userData as { s?: number; i?: number } | undefined
      if (typeof data?.s !== "number" || typeof data.i !== "number") return
      const bead = strands[data.s]?.beads[data.i]
      if (!bead) return
      event.stopImmediatePropagation()
      event.preventDefault()
      el.setPointerCapture(event.pointerId)
      camera.getWorldDirection(normal)
      plane.setFromNormalAndCoplanarPoint(normal, bead.pos)
      drag.current = { s: data.s, i: data.i }
      setHolding(true)
      el.style.cursor = "grabbing"
    }
    const up = () => {
      if (!drag.current) return
      drag.current = null
      setHolding(false)
      el.style.cursor = "grab"
    }
    el.addEventListener("pointerdown", down, true)
    el.addEventListener("pointerup", up)
    el.addEventListener("pointercancel", up)
    return () => {
      el.removeEventListener("pointerdown", down, true)
      el.removeEventListener("pointerup", up)
      el.removeEventListener("pointercancel", up)
    }
  }, [camera, gl, setHolding, strands])

  useFrame((state, deltaTime) => {
    const dt = Math.min(deltaTime, 0.033)
    time.current += dt
    const current = drag.current
    let dragPos: THREE.Vector3 | null = null
    if (current) {
      raycaster.setFromCamera(state.pointer, camera)
      if (raycaster.ray.intersectPlane(plane, hit)) dragPos = hit
    }
    strands.forEach((strand, s) => {
      const index = current?.s === s ? current.i : -1
      stepStrand(strand, dt, index, index >= 0 ? dragPos : null, !still && !current, time.current, s)
    })
    apply()
  })

  return (
    <group>
      {lines.map((line, s) => (
        <primitive key={s} object={line} />
      ))}
      {STRANDS.map((spec, s) =>
        spec.scales.map((scale, i) => (
          <mesh
            key={`${s}-${i}`}
            ref={(node) => {
              meshes.current[s]![i] = node
            }}
            dispose={null}
            material={pearlMat}
            scale={scale}
            userData={{ s, i }}
          >
            <sphereGeometry args={[1, 28, 20]} />
          </mesh>
        )),
      )}
    </group>
  )
}
