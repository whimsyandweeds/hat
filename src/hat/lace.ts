import * as THREE from "three"
import { palette } from "./palette"

const vertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  uniform vec3 uColor;
  uniform vec3 uDeep;
  uniform vec2 uRepeat;

  float lace(vec2 uv) {
    vec2 g = uv * uRepeat;
    vec2 cell = fract(g) - 0.5;
    float r = length(cell);
    float ang = atan(cell.y, cell.x);
    float petal = 0.2 + 0.12 * pow(abs(sin(ang * 5.0)), 0.45);
    float outline = smoothstep(0.018, 0.0, abs(r - petal));
    float rib = smoothstep(0.01, 0.0, abs(cell.x)) * smoothstep(0.48, 0.05, r);
    vec2 other = fract(g + vec2(0.5)) - 0.5;
    float knot = smoothstep(0.045, 0.012, length(other));
    float arc = smoothstep(0.012, 0.0, abs(abs(cell.y) - 0.46));
    float a = clamp(outline + rib * 0.85 + knot + arc * 0.7, 0.0, 1.0);
    float header = smoothstep(0.07, 0.0, uv.y);
    a = max(a, header * 0.75);
    float scallop = 0.7 + 0.24 * sin(uv.x * uRepeat.x * 6.28318);
    a *= smoothstep(scallop + 0.05, scallop - 0.03, uv.y);
    return a;
  }

  void main() {
    float a = lace(vUv);
    if (a < 0.4) discard;
    vec3 N = normalize(vNormal);
    if (!gl_FrontFacing) N = -N;
    vec3 L = normalize(vec3(0.45, 0.8, 0.35));
    float ndl = clamp(dot(N, L), 0.0, 1.0);
    vec3 V = normalize(cameraPosition - vWorld);
    float rim = pow(1.0 - abs(dot(N, V)), 1.7);
    vec3 col = mix(uDeep, uColor, 0.42 + 0.58 * ndl);
    col += vec3(0.82, 0.78, 0.88) * rim * 0.28;
    float fog = smoothstep(5.5, 14.0, length(vWorld - cameraPosition));
    col = mix(col, vec3(0.047, 0.039, 0.055), fog * 0.55);
    gl_FragColor = vec4(col, 1.0);
  }
`

export function createLaceMaterial(repeat: [number, number]) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    uniforms: {
      uColor: { value: new THREE.Color(palette.lace) },
      uDeep: { value: new THREE.Color(palette.laceDeep) },
      uRepeat: { value: new THREE.Vector2(repeat[0], repeat[1]) },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
  })
}
