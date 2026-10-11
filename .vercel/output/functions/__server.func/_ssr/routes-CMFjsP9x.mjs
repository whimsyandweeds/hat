import { i as __toESM } from "../_runtime.mjs";
import { A as Vector3, C as Raycaster, D as ShaderMaterial, N as require_jsx_runtime, O as SphereGeometry, P as require_react, T as SRGBColorSpace, a as PMREMGenerator, b as Object3D, c as BufferGeometry, f as LatheGeometry, h as MathUtils, i as useThree, k as Vector2, l as CanvasTexture, m as LineBasicMaterial, n as Canvas, p as Line, r as useFrame, s as BufferAttribute, t as OrbitControls, u as Color, v as MeshPhysicalMaterial, w as RepeatWrapping, x as Plane, y as MeshStandardMaterial } from "../_libs/@react-three/drei+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as RoomEnvironment } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CMFjsP9x.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var useStudio = create((set) => ({
	view: "whole",
	setView: (view) => set({
		view,
		turning: false
	}),
	holding: false,
	setHolding: (holding) => set({ holding }),
	turning: true,
	setTurning: (turning) => set({ turning })
}));
var VIEWS = {
	whole: {
		label: "Whole",
		position: [
			3.35,
			1.22,
			3.7
		],
		target: [
			.02,
			1.32,
			.04
		],
		mobile: 1.46
	},
	lace: {
		label: "Lace",
		position: [
			1.55,
			.28,
			1.85
		],
		target: [
			.95,
			.05,
			1.15
		],
		mobile: 1.22
	},
	pearls: {
		label: "Pearls",
		position: [
			2.35,
			.78,
			1.85
		],
		target: [
			.45,
			.32,
			.28
		],
		mobile: 1.18
	},
	sage: {
		label: "Sage",
		position: [
			-1.55,
			.72,
			1.25
		],
		target: [
			-.62,
			.48,
			.42
		],
		mobile: 1.25
	},
	within: {
		label: "Within",
		position: [
			.12,
			.22,
			.28
		],
		target: [
			.04,
			2.15,
			.02
		],
		mobile: 1.08
	}
};
var ORDER = [
	"whole",
	"lace",
	"pearls",
	"sage",
	"within"
];
function Overlay() {
	const view = useStudio((s) => s.view);
	const setView = useStudio((s) => s.setView);
	const holding = useStudio((s) => s.holding);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overlay",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "study",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: "A large hat"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Sibylline" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "note",
					children: "Muted purple and black. Purple lace, sage through the band, and pearls that pull away."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
			className: "dock",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "hint",
				children: holding ? "Let go. It swings back." : "Drag to turn. Draw a pearl off the brim."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "views",
				"aria-label": "Views",
				children: ORDER.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": view === id,
					onClick: () => setView(id),
					children: VIEWS[id].label
				}, id))
			})]
		})]
	});
}
var HAT = {
	baseY: .52,
	crownH: 2.34,
	innerR: .4,
	outerR: 1.88
};
function brimPoint(theta, radial, out) {
	const v = MathUtils.clamp(radial, 0, 1);
	const ease = v * v * (3 - 2 * v);
	const r = HAT.innerR + v * (HAT.outerR - HAT.innerR);
	const lift = Math.sin(theta * 2 + .4) * .11 * ease + Math.sin(theta * 3 - 1.1) * .05 * ease + Math.sin(theta * 6 + .3) * .013 * v * ease;
	const droop = -.24 * Math.pow(ease, 1.18);
	const roll = -Math.pow(v, 5) * .045;
	out.set(Math.cos(theta) * r, HAT.baseY + droop + lift + roll, Math.sin(theta) * r);
}
function brimUnder(theta, radial, out) {
	brimPoint(theta, radial, out);
	const ang = Math.atan2(out.z, out.x);
	const r = Math.hypot(out.x, out.z);
	const nr = Math.max(.08, r - .012);
	out.x = Math.cos(ang) * nr;
	out.z = Math.sin(ang) * nr;
	out.y -= .03 + radial * .014;
}
function gridGeometry(widthSegs, heightSegs, place) {
	const cols = widthSegs + 1;
	const rows = heightSegs + 1;
	const positions = new Float32Array(cols * rows * 3);
	const uvs = new Float32Array(cols * rows * 2);
	const target = new Vector3();
	let p = 0;
	let t = 0;
	for (let y = 0; y < rows; y++) {
		const v = y / heightSegs;
		for (let x = 0; x < cols; x++) {
			const u = x / widthSegs;
			place(u, v, target);
			positions[p++] = target.x;
			positions[p++] = target.y;
			positions[p++] = target.z;
			uvs[t++] = u;
			uvs[t++] = v;
		}
	}
	const indices = new Uint32Array(widthSegs * heightSegs * 6);
	let k = 0;
	for (let y = 0; y < heightSegs; y++) for (let x = 0; x < widthSegs; x++) {
		const a = y * cols + x;
		const b = a + 1;
		const c = a + cols;
		const d = c + 1;
		indices[k++] = a;
		indices[k++] = c;
		indices[k++] = b;
		indices[k++] = b;
		indices[k++] = c;
		indices[k++] = d;
	}
	const geo = new BufferGeometry();
	geo.setAttribute("position", new BufferAttribute(positions, 3));
	geo.setAttribute("uv", new BufferAttribute(uvs, 2));
	geo.setIndex(new BufferAttribute(indices, 1));
	geo.computeVertexNormals();
	return geo;
}
function flipWinding(geo) {
	const idx = geo.getIndex();
	if (!idx) return;
	const arr = idx.array;
	for (let i = 0; i < arr.length; i += 3) {
		const tmp = arr[i + 1];
		arr[i + 1] = arr[i + 2];
		arr[i + 2] = tmp;
	}
	idx.needsUpdate = true;
	geo.computeVertexNormals();
}
function aimNormalY(geo, sign) {
	const n = geo.getAttribute("normal");
	let sum = 0;
	for (let i = 0; i < n.count; i++) sum += n.getY(i);
	if (sum * sign < 0) flipWinding(geo);
}
function brimTopGeometry() {
	const geo = gridGeometry(160, 28, (u, v, target) => {
		brimPoint(u * Math.PI * 2, v, target);
	});
	aimNormalY(geo, 1);
	return geo;
}
function brimUnderGeometry() {
	const geo = gridGeometry(160, 28, (u, v, target) => {
		brimUnder(u * Math.PI * 2, v, target);
	});
	aimNormalY(geo, -1);
	return geo;
}
function brimLipGeometry() {
	const geo = gridGeometry(160, 1, (u, v, target) => {
		const theta = u * Math.PI * 2;
		if (v < .5) brimPoint(theta, 1, target);
		else brimUnder(theta, 1, target);
	});
	geo.computeVertexNormals();
	const n = geo.getAttribute("normal");
	const p = geo.getAttribute("position");
	let sum = 0;
	for (let i = 0; i < n.count; i++) sum += n.getX(i) * p.getX(i) + n.getZ(i) * p.getZ(i);
	if (sum < 0) flipWinding(geo);
	return geo;
}
function laceEdgeGeometry() {
	return gridGeometry(180, 7, (u, v, target) => {
		const theta = u * Math.PI * 2;
		brimPoint(theta, 1, target);
		const hang = v * (.09 + .045 * (.5 + .5 * Math.sin(theta * 16)));
		const out = .012 + v * .02;
		target.x += Math.cos(theta) * out;
		target.z += Math.sin(theta) * out;
		target.y -= hang;
	});
}
function veilGeometry() {
	const theta0 = .18;
	return gridGeometry(56, 24, (u, v, target) => {
		const theta = theta0 + 1.4400000000000002 * u;
		brimPoint(theta, .98 - v * .05, target);
		const hang = v * v * 1.05;
		const fold = Math.sin(u * Math.PI * 3) * .055 * v;
		target.y -= hang;
		target.x += Math.cos(theta) * fold + (u - .5) * v * .06;
		target.z += Math.sin(theta) * fold;
	});
}
function crownGeometry() {
	const pts = [];
	const samples = 52;
	for (let i = 0; i <= samples; i++) {
		const t = i / samples;
		let r = .53 * Math.pow(1 - t, .7) + .02;
		r += Math.sin(t * Math.PI) * .042 * (1 - t * .25);
		if (t > .9) {
			const k = (t - .9) / .1;
			r = MathUtils.lerp(r, .02, k);
		}
		pts.push(new Vector2(Math.max(.014, r), t * HAT.crownH));
	}
	const geo = new LatheGeometry(pts, 80);
	const pos = geo.attributes.position;
	const p = new Vector3();
	for (let i = 0; i < pos.count; i++) {
		p.fromBufferAttribute(pos, i);
		const t = MathUtils.clamp(p.y / HAT.crownH, 0, 1);
		const twist = t * t * .4;
		const c = Math.cos(twist);
		const s = Math.sin(twist);
		let x = p.x * c - p.z * s;
		let z = p.x * s + p.z * c;
		const ang = Math.atan2(p.z, p.x);
		const ripple = 1 + Math.sin(ang * 3 + t * 4.5) * .014 * (1 - t);
		x *= ripple;
		z *= ripple;
		x += Math.pow(t, 1.4) * .28;
		z += Math.sin(t * Math.PI) * .045;
		let y = p.y;
		if (t > .78) {
			const k = (t - .78) / .22;
			x += k * k * .12;
			y -= k * k * .07;
		}
		pos.setXYZ(i, x, y + HAT.baseY, z);
	}
	pos.needsUpdate = true;
	geo.computeVertexNormals();
	geo.computeBoundingSphere();
	return geo;
}
function leafGeometry(length, width) {
	return gridGeometry(5, 12, (u, v, target) => {
		const side = (u - .5) * 2;
		const belly = Math.sin(v * Math.PI);
		const w = belly * width * (.82 + .18 * Math.sin(v * Math.PI));
		const curl = side * side * belly * .07;
		const vein = (1 - Math.abs(side)) * .012 * belly;
		target.set(side * w, v * length, curl + vein);
	});
}
function at(theta, radial, lift) {
	const v = new Vector3();
	brimPoint(theta, radial, v);
	return [
		v.x,
		v.y + lift,
		v.z
	];
}
var hang = (theta, lift) => [
	Math.cos(theta) * .42,
	lift,
	Math.sin(theta) * .42
];
var SAGE_THETA = 2.5;
var STRANDS = [
	{
		anchor: at(.38, 1, -.012),
		hang: hang(.38, -1),
		scales: [
			[
				.058,
				.052,
				.056
			],
			[
				.05,
				.046,
				.05
			],
			[
				.066,
				.058,
				.062
			],
			[
				.048,
				.046,
				.048
			],
			[
				.074,
				.062,
				.07
			],
			[
				.046,
				.042,
				.046
			],
			[
				.04,
				.038,
				.04
			],
			[
				.034,
				.032,
				.034
			]
		]
	},
	{
		anchor: at(1.08, 1, -.01),
		hang: hang(1.08, -1),
		scales: [
			[
				.084,
				.07,
				.08
			],
			[
				.06,
				.056,
				.06
			],
			[
				.096,
				.078,
				.09
			],
			[
				.055,
				.05,
				.054
			],
			[
				.048,
				.044,
				.048
			],
			[
				.04,
				.038,
				.04
			]
		]
	},
	{
		anchor: at(.78, .9, .02),
		hang: hang(.78, -.55),
		scales: [
			[
				.13,
				.09,
				.118
			],
			[
				.072,
				.066,
				.07
			],
			[
				.06,
				.055,
				.058
			],
			[
				.05,
				.046,
				.05
			],
			[
				.042,
				.04,
				.042
			]
		]
	},
	{
		anchor: at(2.35, .92, -.01),
		hang: hang(2.35, -1),
		scales: [
			[
				.05,
				.046,
				.05
			],
			[
				.044,
				.04,
				.044
			],
			[
				.038,
				.036,
				.038
			],
			[
				.032,
				.03,
				.032
			]
		]
	}
];
var BAND_Y = HAT.baseY + .15;
/** Shared with the CSS tokens in src/styles.css. Material shades stay inside purple, black, pearl, and sage. */
var palette = {
	bg: "#0c0a0e",
	ink: "#f3eee6",
	muted: "#a398a6",
	sage: "#8a9a7c",
	veil: "#a08cb4",
	velvet: "#7d6c93",
	velvetSheen: "#f2e8fb",
	lace: "#b3a2c4",
	laceDeep: "#4e425c",
	black: "#0c0a0e",
	silk: "#141218",
	pearl: "#f3eee6",
	sageDeep: "#5f6e56",
	flower: "#7a6a90",
	bone: "#d9d0c4",
	metal: "#5a5660",
	light: "#fff8f3",
	lightSage: "#d5e0cc",
	lightFill: "#f0e7f8",
	ground: "#2a2430"
};
var vertex = `
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
`;
var fragment = `
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
`;
function createLaceMaterial(repeat) {
	return new ShaderMaterial({
		side: 2,
		polygonOffset: true,
		polygonOffsetFactor: -1,
		polygonOffsetUnits: -1,
		uniforms: {
			uColor: { value: new Color(palette.lace) },
			uDeep: { value: new Color(palette.laceDeep) },
			uRepeat: { value: new Vector2(repeat[0], repeat[1]) }
		},
		vertexShader: vertex,
		fragmentShader: fragment
	});
}
function useVelvet(color, sheen, roughness) {
	return (0, import_react.useMemo)(() => new MeshPhysicalMaterial({
		color,
		roughness,
		metalness: 0,
		sheen: 1,
		sheenRoughness: .4,
		sheenColor: sheen,
		envMapIntensity: .45
	}), [
		color,
		roughness,
		sheen
	]);
}
function HatMesh() {
	const crown = (0, import_react.useMemo)(() => crownGeometry(), []);
	const top = (0, import_react.useMemo)(() => brimTopGeometry(), []);
	const under = (0, import_react.useMemo)(() => brimUnderGeometry(), []);
	const lip = (0, import_react.useMemo)(() => brimLipGeometry(), []);
	const edge = (0, import_react.useMemo)(() => laceEdgeGeometry(), []);
	const veil = (0, import_react.useMemo)(() => veilGeometry(), []);
	const claspGeo = (0, import_react.useMemo)(() => leafGeometry(.2, .07), []);
	const velvet = useVelvet(palette.velvet, palette.velvetSheen, .9);
	const blackVelvet = useVelvet(palette.silk, "#3a3344", .84);
	const silk = (0, import_react.useMemo)(() => new MeshPhysicalMaterial({
		color: palette.silk,
		roughness: .34,
		metalness: .18,
		sheen: .85,
		sheenRoughness: .28,
		sheenColor: "#4a4158",
		envMapIntensity: .7,
		side: 2
	}), []);
	const lining = (0, import_react.useMemo)(() => {
		const canvas = document.createElement("canvas");
		canvas.width = 256;
		canvas.height = 256;
		const g = canvas.getContext("2d");
		if (g) {
			g.fillStyle = "#100e13";
			g.fillRect(0, 0, 256, 256);
			g.strokeStyle = "rgba(138, 122, 158, 0.28)";
			g.lineWidth = 1;
			for (let i = -256; i < 512; i += 18) {
				g.beginPath();
				g.moveTo(i, 0);
				g.lineTo(i + 256, 256);
				g.stroke();
				g.beginPath();
				g.moveTo(i, 256);
				g.lineTo(i + 256, 0);
				g.stroke();
			}
		}
		const map = new CanvasTexture(canvas);
		map.wrapS = RepeatWrapping;
		map.wrapT = RepeatWrapping;
		map.repeat.set(5, 7);
		map.colorSpace = SRGBColorSpace;
		return new MeshStandardMaterial({
			color: "#1a1520",
			map,
			roughness: .92,
			metalness: .04,
			side: 1
		});
	}, []);
	const edgeLace = (0, import_react.useMemo)(() => createLaceMaterial([16, 2.6]), []);
	const veilLace = (0, import_react.useMemo)(() => createLaceMaterial([8, 6]), []);
	const metal = (0, import_react.useMemo)(() => new MeshStandardMaterial({
		color: palette.metal,
		metalness: .86,
		roughness: .38,
		envMapIntensity: .8
	}), []);
	const pearl = (0, import_react.useMemo)(() => new MeshPhysicalMaterial({
		color: palette.pearl,
		roughness: .26,
		metalness: .04,
		clearcoat: .75,
		clearcoatRoughness: .28,
		iridescence: .18,
		iridescenceIOR: 1.25,
		iridescenceThicknessRange: [180, 480],
		sheen: .25,
		sheenColor: palette.ink,
		sheenRoughness: .6,
		envMapIntensity: .85
	}), []);
	const sewn = (0, import_react.useMemo)(() => {
		const dummy = new Object3D();
		const matrices = [];
		const count = 26;
		for (let i = 0; i < count; i++) {
			const theta = -.7 + i / 25 * 2.7;
			if (Math.abs(theta - .72) < .22) continue;
			const radius = .575;
			dummy.position.set(Math.cos(theta) * radius, BAND_Y + .02, Math.sin(theta) * radius);
			const s = i % 6 === 0 ? .034 : .026;
			dummy.scale.setScalar(s);
			dummy.rotation.set(0, 0, 0);
			dummy.updateMatrix();
			matrices.push(dummy.matrix.clone());
		}
		return matrices;
	}, []);
	const seed = (0, import_react.useMemo)(() => new SphereGeometry(1, 16, 12), []);
	const sewnRef = (0, import_react.useRef)(null);
	(0, import_react.useLayoutEffect)(() => {
		const mesh = sewnRef.current;
		if (!mesh) return;
		sewn.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
		mesh.instanceMatrix.needsUpdate = true;
		mesh.count = sewn.length;
	}, [sewn, sewnRef]);
	const claspAt = STRANDS[2].anchor;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			dispose: null,
			geometry: crown,
			material: velvet
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			dispose: null,
			geometry: crown,
			material: lining,
			scale: [
				.9,
				.99,
				.9
			],
			position: [
				.015,
				.03,
				0
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			dispose: null,
			geometry: top,
			material: velvet
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			dispose: null,
			geometry: under,
			material: blackVelvet
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			dispose: null,
			geometry: lip,
			material: blackVelvet
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			dispose: null,
			position: [
				0,
				BAND_Y,
				0
			],
			material: silk,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.575,
				.6,
				.2,
				72,
				1,
				true
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			dispose: null,
			geometry: edge,
			material: edgeLace,
			renderOrder: 2
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			dispose: null,
			geometry: veil,
			material: veilLace,
			renderOrder: 3
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			dispose: null,
			geometry: claspGeo,
			material: metal,
			position: [
				claspAt[0] - .02,
				claspAt[1] + .02,
				claspAt[2] - .01
			],
			rotation: [
				.9,
				.35,
				1.15
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("instancedMesh", {
			ref: sewnRef,
			args: [
				seed,
				pearl,
				sewn.length
			],
			dispose: null
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instrument, {
			metal,
			pearl
		})
	] });
}
function Instrument({ metal, pearl }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [[
		{
			y: 1.55,
			r: .22,
			tube: .0045,
			x: .02,
			z: .01,
			tilt: .12
		},
		{
			y: 1.78,
			r: .14,
			tube: .004,
			x: -.015,
			z: .02,
			tilt: -.08
		},
		{
			y: 1.34,
			r: .28,
			tube: .0035,
			x: .01,
			z: -.02,
			tilt: .18
		}
	].map((ring) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
		dispose: null,
		material: metal,
		position: [
			ring.x,
			ring.y,
			ring.z
		],
		rotation: [
			Math.PI / 2 + ring.tilt,
			.2,
			0
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
			ring.r,
			ring.tube,
			8,
			48
		] })
	}, ring.y)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
		dispose: null,
		material: pearl,
		position: [
			.05,
			1.58,
			.03
		],
		scale: [
			.045,
			.04,
			.045
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			1,
			20,
			14
		] })
	})] });
}
var delta = new Vector3();
var hangDir = new Vector3();
var hit = new Vector3();
var plane = new Plane();
var normal = new Vector3();
var pointer = new Vector2();
var raycaster = new Raycaster();
function beadRadius(scale) {
	return Math.max(scale[0], scale[1], scale[2]);
}
function satisfy(a, b, rest, pinA, pinB) {
	if (pinA && pinB) return;
	delta.subVectors(b, a);
	const len = delta.length();
	if (len < 1e-5) return;
	const diff = (len - rest) / len;
	if (pinA) b.addScaledVector(delta, -diff);
	else if (pinB) a.addScaledVector(delta, diff);
	else {
		a.addScaledVector(delta, diff * .5);
		b.addScaledVector(delta, -diff * .5);
	}
}
function stepStrand(strand, dt, dragIndex, dragPos, breeze, time, salt) {
	const gravity = -5.4;
	const damp = Math.exp(-.85 * dt);
	for (let i = 0; i < strand.beads.length; i++) {
		const bead = strand.beads[i];
		if (dragPos && i === dragIndex) {
			bead.prev.copy(bead.pos);
			bead.pos.copy(dragPos);
			continue;
		}
		const ax = breeze ? Math.sin(time * .75 + i + salt) * .22 : 0;
		const az = breeze ? Math.cos(time * .52 + i * 1.2) * .16 : 0;
		const nx = bead.pos.x + (bead.pos.x - bead.prev.x) * damp + ax * dt * dt;
		const ny = bead.pos.y + (bead.pos.y - bead.prev.y) * damp + gravity * dt * dt;
		const nz = bead.pos.z + (bead.pos.z - bead.prev.z) * damp + az * dt * dt;
		bead.prev.copy(bead.pos);
		bead.pos.set(nx, ny, nz);
	}
	for (let n = 0; n < 8; n++) {
		const first = strand.beads[0];
		if (!first) break;
		const pinFirst = Boolean(dragPos) && dragIndex === 0;
		satisfy(strand.anchor, first.pos, strand.rests[0], true, pinFirst);
		for (let i = 1; i < strand.beads.length; i++) {
			const a = strand.beads[i - 1];
			const b = strand.beads[i];
			satisfy(a.pos, b.pos, strand.rests[i], Boolean(dragPos) && dragIndex === i - 1, Boolean(dragPos) && dragIndex === i);
		}
		if (dragPos && dragIndex >= 0) {
			const pinned = strand.beads[dragIndex];
			if (pinned) {
				pinned.pos.copy(dragPos);
				pinned.prev.copy(dragPos);
			}
		}
	}
	for (const bead of strand.beads) {
		const minY = .07 + bead.radius;
		if (bead.pos.y < minY) {
			bead.pos.y = minY;
			if (bead.prev.y < bead.pos.y) bead.prev.y = bead.pos.y;
		}
	}
}
function createSim(specs) {
	const strands = specs.map((spec) => {
		hangDir.set(spec.hang[0], spec.hang[1], spec.hang[2]).normalize();
		const anchor = new Vector3(...spec.anchor);
		const beads = [];
		const rests = [];
		let cursor = anchor.clone();
		spec.scales.forEach((scale, index) => {
			const radius = beadRadius(scale);
			const prevRadius = index === 0 ? .02 : beadRadius(spec.scales[index - 1]);
			const rest = index === 0 ? radius + .035 : radius + prevRadius + .022;
			rests.push(rest);
			cursor = cursor.clone().addScaledVector(hangDir, rest);
			beads.push({
				pos: cursor.clone(),
				prev: cursor.clone(),
				radius
			});
		});
		return {
			anchor,
			beads,
			rests
		};
	});
	for (let step = 0; step < 80; step++) strands.forEach((strand, salt) => stepStrand(strand, 1 / 60, -1, null, false, step / 60, salt));
	for (const strand of strands) for (const bead of strand.beads) bead.prev.copy(bead.pos);
	return strands;
}
function PearlField({ still }) {
	const strands = (0, import_react.useMemo)(() => createSim(STRANDS), []);
	const meshes = (0, import_react.useRef)(STRANDS.map((spec) => spec.scales.map(() => null)));
	const lines = (0, import_react.useMemo)(() => STRANDS.map((spec) => {
		const geometry = new BufferGeometry();
		geometry.setAttribute("position", new BufferAttribute(new Float32Array((spec.scales.length + 1) * 3), 3));
		const material = new LineBasicMaterial({
			color: palette.pearl,
			transparent: true,
			opacity: .4
		});
		const line = new Line(geometry, material);
		line.frustumCulled = false;
		line.raycast = () => null;
		return line;
	}), []);
	const pearlMat = (0, import_react.useMemo)(() => new MeshPhysicalMaterial({
		color: palette.pearl,
		roughness: .24,
		metalness: .03,
		clearcoat: .8,
		clearcoatRoughness: .24,
		iridescence: .2,
		iridescenceIOR: 1.28,
		iridescenceThicknessRange: [160, 460],
		sheen: .3,
		sheenColor: palette.ink,
		sheenRoughness: .55,
		envMapIntensity: .9
	}), []);
	const drag = (0, import_react.useRef)(null);
	const setHolding = useStudio((s) => s.setHolding);
	const gl = useThree((s) => s.gl);
	const camera = useThree((s) => s.camera);
	const time = (0, import_react.useRef)(0);
	const apply = () => {
		strands.forEach((strand, s) => {
			const line = lines[s];
			if (!line) return;
			const attr = line.geometry.getAttribute("position");
			attr.setXYZ(0, strand.anchor.x, strand.anchor.y, strand.anchor.z);
			strand.beads.forEach((bead, i) => {
				meshes.current[s]?.[i]?.position.copy(bead.pos);
				attr.setXYZ(i + 1, bead.pos.x, bead.pos.y, bead.pos.z);
			});
			attr.needsUpdate = true;
		});
	};
	(0, import_react.useLayoutEffect)(() => {
		apply();
	}, []);
	(0, import_react.useLayoutEffect)(() => {
		const el = gl.domElement;
		const down = (event) => {
			if (event.button !== 0) return;
			const rect = el.getBoundingClientRect();
			pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
			pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
			raycaster.setFromCamera(pointer, camera);
			const objects = [];
			for (const row of meshes.current) for (const mesh of row) if (mesh) objects.push(mesh);
			const data = (raycaster.intersectObjects(objects, false)[0]?.object)?.userData;
			if (typeof data?.s !== "number" || typeof data.i !== "number") return;
			const bead = strands[data.s]?.beads[data.i];
			if (!bead) return;
			event.stopImmediatePropagation();
			event.preventDefault();
			el.setPointerCapture(event.pointerId);
			camera.getWorldDirection(normal);
			plane.setFromNormalAndCoplanarPoint(normal, bead.pos);
			drag.current = {
				s: data.s,
				i: data.i
			};
			setHolding(true);
			el.style.cursor = "grabbing";
		};
		const up = () => {
			if (!drag.current) return;
			drag.current = null;
			setHolding(false);
			el.style.cursor = "grab";
		};
		el.addEventListener("pointerdown", down, true);
		el.addEventListener("pointerup", up);
		el.addEventListener("pointercancel", up);
		return () => {
			el.removeEventListener("pointerdown", down, true);
			el.removeEventListener("pointerup", up);
			el.removeEventListener("pointercancel", up);
		};
	}, [
		camera,
		gl,
		setHolding,
		strands
	]);
	useFrame((state, deltaTime) => {
		const dt = Math.min(deltaTime, .033);
		time.current += dt;
		const current = drag.current;
		let dragPos = null;
		if (current) {
			raycaster.setFromCamera(state.pointer, camera);
			if (raycaster.ray.intersectPlane(plane, hit)) dragPos = hit;
		}
		strands.forEach((strand, s) => {
			const index = current?.s === s ? current.i : -1;
			stepStrand(strand, dt, index, index >= 0 ? dragPos : null, !still && !current, time.current, s);
		});
		apply();
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [lines.map((line, s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", { object: line }, s)), STRANDS.map((spec, s) => spec.scales.map((scale, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
		ref: (node) => {
			meshes.current[s][i] = node;
		},
		dispose: null,
		material: pearlMat,
		scale,
		userData: {
			s,
			i
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			1,
			28,
			20
		] })
	}, `${s}-${i}`)))] });
}
var LEAVES = [
	{
		pos: [
			.02,
			.02,
			0
		],
		rot: [
			.5,
			.2,
			.7
		],
		len: .36,
		wid: .11,
		deep: false
	},
	{
		pos: [
			.08,
			.05,
			.06
		],
		rot: [
			.3,
			-.4,
			.2
		],
		len: .28,
		wid: .09,
		deep: true
	},
	{
		pos: [
			-.02,
			.08,
			-.05
		],
		rot: [
			.8,
			.6,
			-.4
		],
		len: .32,
		wid: .1,
		deep: false
	},
	{
		pos: [
			.12,
			-.02,
			.1
		],
		rot: [
			1.1,
			.1,
			.9
		],
		len: .24,
		wid: .08,
		deep: true
	},
	{
		pos: [
			0,
			.14,
			.08
		],
		rot: [
			.2,
			.8,
			.4
		],
		len: .22,
		wid: .07,
		deep: false
	},
	{
		pos: [
			-.06,
			.04,
			.1
		],
		rot: [
			.6,
			-.7,
			-.5
		],
		len: .3,
		wid: .095,
		deep: false
	},
	{
		pos: [
			.16,
			.1,
			-.02
		],
		rot: [
			.4,
			1.2,
			.3
		],
		len: .18,
		wid: .06,
		deep: true
	}
];
function SageCluster() {
	const origin = (0, import_react.useMemo)(() => {
		const v = new Vector3();
		brimPoint(SAGE_THETA, .34, v);
		return v;
	}, []);
	const broad = (0, import_react.useMemo)(() => leafGeometry(1, 1), []);
	const leafMat = (0, import_react.useMemo)(() => new MeshPhysicalMaterial({
		color: palette.sage,
		roughness: .78,
		metalness: 0,
		sheen: .45,
		sheenRoughness: .55,
		sheenColor: "#d5decc",
		side: 2
	}), []);
	const deepMat = (0, import_react.useMemo)(() => new MeshPhysicalMaterial({
		color: palette.sageDeep,
		roughness: .82,
		metalness: 0,
		sheen: .3,
		sheenColor: "#c5d0bc",
		side: 2
	}), []);
	const stemMat = (0, import_react.useMemo)(() => new MeshStandardMaterial({
		color: palette.sageDeep,
		roughness: .72
	}), []);
	const flowerMat = (0, import_react.useMemo)(() => new MeshStandardMaterial({
		color: palette.flower,
		roughness: .58
	}), []);
	const boneMat = (0, import_react.useMemo)(() => new MeshStandardMaterial({
		color: palette.bone,
		roughness: .62
	}), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: origin,
		rotation: [
			.35,
			-SAGE_THETA + Math.PI / 2,
			.15
		],
		scale: 1.85,
		children: [
			LEAVES.map((leaf, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
				geometry: broad,
				material: leaf.deep ? deepMat : leafMat,
				position: leaf.pos,
				rotation: leaf.rot,
				scale: [
					leaf.wid,
					leaf.len,
					1
				],
				dispose: null
			}, i)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spike, {
				position: [
					.05,
					.12,
					.02
				],
				tilt: .35,
				height: .46,
				stem: stemMat,
				flower: flowerMat,
				bone: boneMat
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spike, {
				position: [
					-.04,
					.08,
					.08
				],
				tilt: -.25,
				height: .34,
				stem: stemMat,
				flower: flowerMat,
				bone: boneMat
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spike, {
				position: [
					.1,
					.06,
					-.04
				],
				tilt: .55,
				height: .28,
				stem: stemMat,
				flower: flowerMat,
				bone: boneMat
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position: [
			-.22,
			HAT.baseY + .28,
			.18
		],
		rotation: [
			.2,
			.6,
			-.4
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			geometry: broad,
			material: leafMat,
			dispose: null,
			scale: [
				.08,
				.26,
				1
			],
			rotation: [
				.4,
				.2,
				.5
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			geometry: broad,
			material: deepMat,
			dispose: null,
			position: [
				.04,
				.04,
				.02
			],
			scale: [
				.06,
				.18,
				1
			],
			rotation: [
				.8,
				-.3,
				.2
			]
		})]
	})] });
}
function Spike({ position, tilt, height, stem, flower, bone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		position,
		rotation: [
			tilt,
			.4,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
			position: [
				0,
				height / 2,
				0
			],
			material: stem,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
				.006,
				.011,
				height,
				6
			] })
		}), Array.from({ length: 7 }, (_, i) => {
			const t = (i + 1) / 7.4;
			const side = i % 2 === 0 ? 1 : -1;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
				position: [
					side * .018,
					t * height,
					0
				],
				rotation: [
					0,
					0,
					side * .7
				],
				scale: [
					.016,
					.026,
					.012
				],
				material: i % 3 === 0 ? bone : flower,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
					1,
					10,
					8
				] })
			}, i);
		})]
	});
}
function useStill() {
	const [still, setStill] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		const apply = () => setStill(media.matches);
		apply();
		media.addEventListener("change", apply);
		return () => media.removeEventListener("change", apply);
	}, []);
	return still;
}
function Reflections() {
	const gl = useThree((s) => s.gl);
	const scene = useThree((s) => s.scene);
	(0, import_react.useLayoutEffect)(() => {
		const pmrem = new PMREMGenerator(gl);
		const room = new RoomEnvironment();
		const texture = pmrem.fromScene(room, .04).texture;
		scene.environment = texture;
		scene.environmentIntensity = .48;
		return () => {
			scene.environment = null;
			texture.dispose();
			pmrem.dispose();
		};
	}, [gl, scene]);
	return null;
}
function Sky() {
	const material = (0, import_react.useMemo)(() => new ShaderMaterial({
		side: 1,
		depthWrite: false,
		uniforms: {},
		vertexShader: `
          varying vec3 vDir;
          void main() {
            vDir = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
		fragmentShader: `
          varying vec3 vDir;
          void main() {
            vec3 dir = normalize(vDir);
            float lift = smoothstep(-0.15, 0.85, dir.y);
            vec3 deep = vec3(0.047, 0.039, 0.055);
            vec3 haze = vec3(0.16, 0.12, 0.2);
            vec3 col = mix(deep, haze, lift * 0.55);
            gl_FragColor = vec4(col, 1.0);
          }
        `
	}), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
		renderOrder: -2,
		frustumCulled: false,
		scale: 40,
		material,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [
			1,
			32,
			24
		] })
	});
}
function Lights() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
			palette.lightFill,
			palette.ground,
			1.45
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				3.4,
				6.4,
				4.2
			],
			intensity: 6,
			color: palette.light
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				-3.2,
				4.2,
				2.4
			],
			intensity: 2.4,
			color: palette.velvetSheen
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
			position: [
				-.4,
				2.2,
				-4.8
			],
			intensity: 3.4,
			color: palette.lightFill
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
			position: [
				1.15,
				1.15,
				1.8
			],
			intensity: 36,
			distance: 12,
			decay: 2,
			color: palette.pearl
		})
	] });
}
function Floor() {
	const texture = (0, import_react.useMemo)(() => {
		const canvas = document.createElement("canvas");
		canvas.width = 256;
		canvas.height = 256;
		const g = canvas.getContext("2d");
		if (g) {
			const shade = g.createRadialGradient(128, 128, 16, 128, 128, 122);
			shade.addColorStop(0, "rgba(0,0,0,0.55)");
			shade.addColorStop(1, "rgba(0,0,0,0)");
			g.fillStyle = shade;
			g.fillRect(0, 0, 256, 256);
		}
		const map = new CanvasTexture(canvas);
		map.colorSpace = SRGBColorSpace;
		return map;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		rotation: [
			-Math.PI / 2,
			0,
			0
		],
		position: [
			0,
			.02,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [2.7, 72] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
			color: palette.silk,
			roughness: 1,
			metalness: 0
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		rotation: [
			-Math.PI / 2,
			0,
			0
		],
		position: [
			0,
			.03,
			0
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [2.15, 48] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			map: texture,
			transparent: true,
			depthWrite: false
		})]
	})] });
}
function Motes({ still }) {
	const geo = (0, import_react.useMemo)(() => {
		const count = 42;
		const positions = /* @__PURE__ */ new Float32Array(126);
		for (let i = 0; i < count; i++) {
			positions[i * 3] = (Math.random() - .5) * 4.4;
			positions[i * 3 + 1] = .25 + Math.random() * 2.8;
			positions[i * 3 + 2] = (Math.random() - .5) * 4.4;
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute("position", new BufferAttribute(positions, 3));
		return geometry;
	}, []);
	const ref = (0, import_react.useRef)(null);
	useFrame((_, dt) => {
		if (still || !ref.current) return;
		ref.current.rotation.y += Math.min(dt, .05) * .018;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("points", {
		ref,
		geometry: geo,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointsMaterial", {
			color: palette.pearl,
			size: .014,
			transparent: true,
			opacity: .32,
			depthWrite: false,
			sizeAttenuation: true
		})
	});
}
function frame(id, aspect, pos, target) {
	const spec = VIEWS[id];
	target.set(spec.target[0], spec.target[1], spec.target[2]);
	pos.set(spec.position[0], spec.position[1], spec.position[2]);
	const scale = aspect < .92 ? spec.mobile : 1;
	pos.sub(target).multiplyScalar(scale).add(target);
}
function CameraRig({ still }) {
	const camera = useThree((s) => s.camera);
	const controls = useThree((s) => s.controls);
	const size = useThree((s) => s.size);
	const view = useStudio((s) => s.view);
	const turning = useStudio((s) => s.turning);
	const setTurning = useStudio((s) => s.setTurning);
	const goalPos = (0, import_react.useRef)(new Vector3());
	const goalTarget = (0, import_react.useRef)(new Vector3());
	const blend = (0, import_react.useRef)(0);
	const lastView = (0, import_react.useRef)(view);
	const ready = (0, import_react.useRef)(false);
	useFrame((_, dt) => {
		const aspect = size.width / Math.max(1, size.height);
		if (!ready.current && controls) {
			frame(view, aspect, goalPos.current, goalTarget.current);
			camera.position.copy(goalPos.current);
			controls.target.copy(goalTarget.current);
			controls.update();
			ready.current = true;
			window.__hatReady = true;
		}
		if (lastView.current !== view) {
			lastView.current = view;
			blend.current = 1;
			frame(view, aspect, goalPos.current, goalTarget.current);
		}
		if (blend.current < .001 || !controls) return;
		const k = 1 - Math.exp(-3.2 * Math.min(dt, .05));
		camera.position.lerp(goalPos.current, k);
		controls.target.lerp(goalTarget.current, k);
		blend.current *= 1 - k;
		if (blend.current < .01) blend.current = 0;
	}, -1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitControls, {
		makeDefault: true,
		enablePan: false,
		enableDamping: true,
		dampingFactor: .08,
		rotateSpeed: .72,
		autoRotate: !still && turning,
		autoRotateSpeed: .32,
		minDistance: .7,
		maxDistance: 9,
		minPolarAngle: .08,
		maxPolarAngle: Math.PI * .96,
		target: [
			.02,
			1.32,
			.04
		],
		onStart: () => {
			setTurning(false);
			blend.current = 0;
		}
	});
}
function Stage() {
	const still = useStill();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
		className: "stage-canvas",
		dpr: [1, 1.7],
		camera: {
			position: [
				3.35,
				1.22,
				3.7
			],
			fov: 30,
			near: .06,
			far: 70
		},
		gl: {
			antialias: true,
			toneMapping: 4,
			toneMappingExposure: 1.28
		},
		onCreated: ({ gl }) => {
			gl.domElement.setAttribute("aria-label", "A large witch's hat in muted purple and black. Drag to turn it. Draw a pearl to pull it off the brim.");
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reflections, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sky, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lights, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HatMesh, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SageCluster, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PearlField, { still }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Floor, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Motes, { still }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraRig, { still })
		]
	});
}
function Home() {
	const [on, setOn] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setOn(true);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "stage",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay, {}), on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, {}) : null]
	});
}
//#endregion
export { Home as component };
