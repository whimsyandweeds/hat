import * as THREE from "three"

export const HAT = {
  baseY: 0.52,
  crownH: 2.34,
  innerR: 0.4,
  outerR: 1.88,
}

export function brimPoint(theta: number, radial: number, out: THREE.Vector3) {
  const v = THREE.MathUtils.clamp(radial, 0, 1)
  const ease = v * v * (3 - 2 * v)
  const r = HAT.innerR + v * (HAT.outerR - HAT.innerR)
  const lift =
    Math.sin(theta * 2 + 0.4) * 0.11 * ease +
    Math.sin(theta * 3 - 1.1) * 0.05 * ease +
    Math.sin(theta * 6 + 0.3) * 0.013 * v * ease
  const droop = -0.24 * Math.pow(ease, 1.18)
  const roll = -Math.pow(v, 5) * 0.045
  out.set(Math.cos(theta) * r, HAT.baseY + droop + lift + roll, Math.sin(theta) * r)
}

export function brimUnder(theta: number, radial: number, out: THREE.Vector3) {
  brimPoint(theta, radial, out)
  const ang = Math.atan2(out.z, out.x)
  const r = Math.hypot(out.x, out.z)
  const nr = Math.max(0.08, r - 0.012)
  out.x = Math.cos(ang) * nr
  out.z = Math.sin(ang) * nr
  out.y -= 0.03 + radial * 0.014
}

export function gridGeometry(
  widthSegs: number,
  heightSegs: number,
  place: (u: number, v: number, target: THREE.Vector3) => void,
): THREE.BufferGeometry {
  const cols = widthSegs + 1
  const rows = heightSegs + 1
  const positions = new Float32Array(cols * rows * 3)
  const uvs = new Float32Array(cols * rows * 2)
  const target = new THREE.Vector3()
  let p = 0
  let t = 0
  for (let y = 0; y < rows; y++) {
    const v = y / heightSegs
    for (let x = 0; x < cols; x++) {
      const u = x / widthSegs
      place(u, v, target)
      positions[p++] = target.x
      positions[p++] = target.y
      positions[p++] = target.z
      uvs[t++] = u
      uvs[t++] = v
    }
  }
  const indices = new Uint32Array(widthSegs * heightSegs * 6)
  let k = 0
  for (let y = 0; y < heightSegs; y++) {
    for (let x = 0; x < widthSegs; x++) {
      const a = y * cols + x
      const b = a + 1
      const c = a + cols
      const d = c + 1
      indices[k++] = a
      indices[k++] = c
      indices[k++] = b
      indices[k++] = b
      indices[k++] = c
      indices[k++] = d
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))
  geo.setIndex(new THREE.BufferAttribute(indices, 1))
  geo.computeVertexNormals()
  return geo
}

function flipWinding(geo: THREE.BufferGeometry) {
  const idx = geo.getIndex()
  if (!idx) return
  const arr = idx.array
  for (let i = 0; i < arr.length; i += 3) {
    const tmp = arr[i + 1]!
    arr[i + 1] = arr[i + 2]!
    arr[i + 2] = tmp
  }
  idx.needsUpdate = true
  geo.computeVertexNormals()
}

function aimNormalY(geo: THREE.BufferGeometry, sign: 1 | -1) {
  const n = geo.getAttribute("normal")
  let sum = 0
  for (let i = 0; i < n.count; i++) sum += n.getY(i)
  if (sum * sign < 0) flipWinding(geo)
}

export function brimTopGeometry() {
  const geo = gridGeometry(160, 28, (u, v, target) => {
    brimPoint(u * Math.PI * 2, v, target)
  })
  aimNormalY(geo, 1)
  return geo
}

export function brimUnderGeometry() {
  const geo = gridGeometry(160, 28, (u, v, target) => {
    brimUnder(u * Math.PI * 2, v, target)
  })
  aimNormalY(geo, -1)
  return geo
}

export function brimLipGeometry() {
  const geo = gridGeometry(160, 1, (u, v, target) => {
    const theta = u * Math.PI * 2
    if (v < 0.5) brimPoint(theta, 1, target)
    else brimUnder(theta, 1, target)
  })
  geo.computeVertexNormals()
  const n = geo.getAttribute("normal")
  const p = geo.getAttribute("position")
  let sum = 0
  for (let i = 0; i < n.count; i++) {
    sum += n.getX(i) * p.getX(i) + n.getZ(i) * p.getZ(i)
  }
  if (sum < 0) flipWinding(geo)
  return geo
}

export function laceEdgeGeometry() {
  return gridGeometry(180, 7, (u, v, target) => {
    const theta = u * Math.PI * 2
    brimPoint(theta, 1, target)
    const hang = v * (0.09 + 0.045 * (0.5 + 0.5 * Math.sin(theta * 16)))
    const out = 0.012 + v * 0.02
    target.x += Math.cos(theta) * out
    target.z += Math.sin(theta) * out
    target.y -= hang
  })
}

export function veilGeometry() {
  const theta0 = 0.18
  const theta1 = 1.62
  return gridGeometry(56, 24, (u, v, target) => {
    const theta = theta0 + (theta1 - theta0) * u
    const radial = 0.98 - v * 0.05
    brimPoint(theta, radial, target)
    const hang = v * v * 1.05
    const fold = Math.sin(u * Math.PI * 3.0) * 0.055 * v
    target.y -= hang
    target.x += Math.cos(theta) * fold + (u - 0.5) * v * 0.06
    target.z += Math.sin(theta) * fold
  })
}

export function crownGeometry() {
  const pts: THREE.Vector2[] = []
  const samples = 52
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    let r = 0.53 * Math.pow(1 - t, 0.7) + 0.02
    r += Math.sin(t * Math.PI) * 0.042 * (1 - t * 0.25)
    if (t > 0.9) {
      const k = (t - 0.9) / 0.1
      r = THREE.MathUtils.lerp(r, 0.02, k)
    }
    pts.push(new THREE.Vector2(Math.max(0.014, r), t * HAT.crownH))
  }
  const geo = new THREE.LatheGeometry(pts, 80)
  const pos = geo.attributes.position
  const p = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i)
    const t = THREE.MathUtils.clamp(p.y / HAT.crownH, 0, 1)
    const twist = t * t * 0.4
    const c = Math.cos(twist)
    const s = Math.sin(twist)
    let x = p.x * c - p.z * s
    let z = p.x * s + p.z * c
    const ang = Math.atan2(p.z, p.x)
    const ripple = 1 + Math.sin(ang * 3 + t * 4.5) * 0.014 * (1 - t)
    x *= ripple
    z *= ripple
    x += Math.pow(t, 1.4) * 0.28
    z += Math.sin(t * Math.PI) * 0.045
    let y = p.y
    if (t > 0.78) {
      const k = (t - 0.78) / 0.22
      x += k * k * 0.12
      y -= k * k * 0.07
    }
    pos.setXYZ(i, x, y + HAT.baseY, z)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  geo.computeBoundingSphere()
  return geo
}

export function leafGeometry(length: number, width: number) {
  const geo = gridGeometry(5, 12, (u, v, target) => {
    const side = (u - 0.5) * 2
    const belly = Math.sin(v * Math.PI)
    const w = belly * width * (0.82 + 0.18 * Math.sin(v * Math.PI))
    const curl = side * side * belly * 0.07
    const vein = (1 - Math.abs(side)) * 0.012 * belly
    target.set(side * w, v * length, curl + vein)
  })
  return geo
}
