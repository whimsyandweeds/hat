import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"
import { HatMesh } from "./hat-mesh"
import { palette } from "./palette"
import { PearlField } from "./pearls"
import { SageCluster } from "./sage"
import { useStudio, VIEWS, type ViewId } from "./store"

function useStill() {
  const [still, setStill] = useState(false)
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setStill(media.matches)
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [])
  return still
}

function Reflections() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const texture = pmrem.fromScene(room, 0.04).texture
    scene.environment = texture
    scene.environmentIntensity = 0.48
    return () => {
      scene.environment = null
      texture.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

function Sky() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {},
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vec3 dir = normalize(vDir);
            float lift = smoothstep(-0.15, 0.85, dir.y);
            vec3 deep = vec3(0.047, 0.039, 0.055);
            vec3 haze = vec3(0.16, 0.12, 0.2);
            vec3 col = mix(deep, haze, lift * 0.55);
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  )
  return (
    <mesh renderOrder={-2} frustumCulled={false} scale={40} material={material}>
      <sphereGeometry args={[1, 32, 24]} />
    </mesh>
  )
}

function Lights() {
  return (
    <>
      <hemisphereLight args={[palette.lightFill, palette.ground, 0.85]} />
      <directionalLight position={[3.4, 6.4, 4.2]} intensity={1.55} color={palette.light} />
      <directionalLight position={[-3.2, 4.2, 2.4]} intensity={1.05} color={palette.velvetSheen} />
      <directionalLight position={[-0.4, 2.2, -4.8]} intensity={1.25} color={palette.lightFill} />
      <pointLight position={[1.15, 1.15, 1.8]} intensity={10} distance={12} decay={2} color={palette.pearl} />
    </>
  )
}

function Floor() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    const g = canvas.getContext("2d")
    if (g) {
      const shade = g.createRadialGradient(128, 128, 16, 128, 128, 122)
      shade.addColorStop(0, "rgba(0,0,0,0.55)")
      shade.addColorStop(1, "rgba(0,0,0,0)")
      g.fillStyle = shade
      g.fillRect(0, 0, 256, 256)
    }
    const map = new THREE.CanvasTexture(canvas)
    map.colorSpace = THREE.SRGBColorSpace
    return map
  }, [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[2.7, 72]} />
        <meshStandardMaterial color={palette.silk} roughness={1} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[2.15, 48]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} />
      </mesh>
    </group>
  )
}

function Motes({ still }: { still: boolean }) {
  const geo = useMemo(() => {
    const count = 42
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4.4
      positions[i * 3 + 1] = 0.25 + Math.random() * 2.8
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4.4
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geometry
  }, [])
  const ref = useRef<THREE.Points>(null)
  useFrame((_, dt) => {
    if (still || !ref.current) return
    ref.current.rotation.y += Math.min(dt, 0.05) * 0.018
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        color={palette.pearl}
        size={0.014}
        transparent
        opacity={0.32}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

function frame(id: ViewId, aspect: number, fov: number, pos: THREE.Vector3, target: THREE.Vector3) {
  if (id === "whole") {
    // Low enough that the buttons don't cover the brim, high enough to clear the title.
    target.set(0.02, 0.86, 0.0)
    const halfV = THREE.MathUtils.degToRad(fov * 0.5)
    const halfH = Math.atan(Math.tan(halfV) * Math.max(aspect, 0.38))
    const dist = (2.68 / Math.sin(Math.min(halfV, halfH))) * 1.05
    pos.set(0.16, 0.22, 1).normalize().multiplyScalar(dist).add(target)
    return
  }
  const spec = VIEWS[id]
  target.set(spec.target[0], spec.target[1], spec.target[2])
  pos.set(spec.position[0], spec.position[1], spec.position[2])
  const scale = aspect < 0.92 ? spec.mobile : 1
  pos.sub(target).multiplyScalar(scale).add(target)
}

function CameraRig({ still }: { still: boolean }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as {
    target: THREE.Vector3
    update: () => void
  } | null
  const size = useThree((s) => s.size)
  const view = useStudio((s) => s.view)
  const turning = useStudio((s) => s.turning)
  const setTurning = useStudio((s) => s.setTurning)
  const goalPos = useRef(new THREE.Vector3())
  const goalTarget = useRef(new THREE.Vector3())
  const blend = useRef(0)
  const lastView = useRef(view)
  const ready = useRef(false)
  const fov = useRef(30)

  useFrame((_, dt) => {
    const aspect = size.width / Math.max(1, size.height)
    const cam = camera as THREE.PerspectiveCamera
    const step = Math.min(dt, 0.05)
    const wantFov = view === "whole" ? (aspect < 0.92 ? 54 : 32) : 30
    if (!ready.current) fov.current = wantFov
    else fov.current += (wantFov - fov.current) * (1 - Math.exp(-4 * step))
    if (Math.abs(cam.fov - fov.current) > 0.02) {
      cam.fov = fov.current
      cam.updateProjectionMatrix()
    }

    if (!ready.current && controls) {
      frame(view, aspect, fov.current, goalPos.current, goalTarget.current)
      camera.position.copy(goalPos.current)
      controls.target.copy(goalTarget.current)
      controls.update()
      ready.current = true
      window.__hatReady = true
    }
    if (lastView.current !== view) {
      lastView.current = view
      blend.current = 1
      frame(view, aspect, wantFov, goalPos.current, goalTarget.current)
    }
    if (blend.current < 0.001 || !controls) return
    const k = 1 - Math.exp(-3.2 * step)
    camera.position.lerp(goalPos.current, k)
    controls.target.lerp(goalTarget.current, k)
    blend.current *= 1 - k
    if (blend.current < 0.01) blend.current = 0
  }, -1)

  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.72}
      autoRotate={!still && turning}
      autoRotateSpeed={0.32}
      minDistance={0.7}
      maxDistance={9}
      minPolarAngle={0.08}
      maxPolarAngle={Math.PI * 0.96}
      target={[0.02, 1.32, 0.04]}
      onStart={() => {
        setTurning(false)
        blend.current = 0
      }}
    />
  )
}

function RoomClear({ room }: { room: boolean }) {
  const gl = useThree((s) => s.gl)
  useLayoutEffect(() => {
    gl.setClearColor(0x000000, room ? 0 : 1)
    gl.toneMappingExposure = room ? 0.96 : 1.02
    gl.domElement.style.background = "transparent"
  }, [gl, room])
  return null
}

export function Stage() {
  const still = useStill()
  const room = useStudio((s) => s.room)
  return (
    <Canvas
      className="stage-canvas"
      dpr={[1, 1.7]}
      camera={{ position: [3.35, 1.22, 3.7], fov: 30, near: 0.06, far: 70 }}
      gl={{
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        gl.domElement.setAttribute(
          "aria-label",
          "A large witch's hat in muted purple and black. Drag to turn it. Draw a pearl to pull it off the brim.",
        )
      }}
    >
      <RoomClear room={room} />
      <Reflections />
      {room ? null : <Sky />}
      <Lights />
      <HatMesh />
      <SageCluster />
      <PearlField still={still} />
      {room ? null : <Floor />}
      {room ? null : <Motes still={still} />}
      <CameraRig still={still} />
    </Canvas>
  )
}

declare global {
  interface Window {
    __hatReady?: boolean
  }
}
