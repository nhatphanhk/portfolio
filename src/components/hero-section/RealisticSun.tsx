'use client';

import { useEffect, useRef, useState } from 'react';

interface RealisticSunProps {
  className?: string;
  onFallback?: () => void;
}

// ── Shared GLSL: 3D Simplex noise + FBM ─────────────────────────────────────
const NOISE_GLSL = /* glsl */ `
  vec4 permute(vec4 x){ return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v){
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  float fbm3(vec3 p){
    float total = 0.0;
    float amp = 0.55;
    for (int i = 0; i < 3; i++) {
      total += amp * snoise(p);
      p = p * 2.07 + vec3(0.13, 0.27, 0.19);
      amp *= 0.5;
    }
    return total;
  }
`;

// ── PHOTOSPHERE: boiling plasma surface ─────────────────────────────────────
const photosphereVertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  ${NOISE_GLSL}

  void main() {
    vPos = position;
    // Subtle living silhouette: the plasma surface heaves along its normal
    float d = snoise(normal * 3.0 + vec3(uTime * 0.12)) * 0.009
            + snoise(normal * 9.0 - vec3(uTime * 0.25)) * 0.004;
    vec3 displaced = position + normal * d;

    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    vViewDir = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const photosphereFragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  ${NOISE_GLSL}

  vec3 hash33(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    return fract(sin(p) * 43758.5453123);
  }

  // Animated Worley noise -> convection granulation cells (F1, F2)
  vec2 worley(vec3 p, float t) {
    vec3 id = floor(p);
    vec3 f = fract(p);
    float f1 = 8.0;
    float f2 = 8.0;
    for (int k = -1; k <= 1; k++) {
      for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
          vec3 g = vec3(float(i), float(j), float(k));
          vec3 o = hash33(id + g);
          o = 0.5 + 0.5 * sin(t + 6.2831 * o);
          vec3 r = g + o - f;
          float d = dot(r, r);
          if (d < f1) { f2 = f1; f1 = d; }
          else if (d < f2) { f2 = d; }
        }
      }
    }
    return vec2(sqrt(f1), sqrt(f2));
  }

  // Blackbody-inspired plasma temperature ramp
  vec3 sunRamp(float h) {
    vec3 c0 = vec3(0.38, 0.05, 0.00);
    vec3 c1 = vec3(0.82, 0.22, 0.02);
    vec3 c2 = vec3(1.00, 0.50, 0.07);
    vec3 c3 = vec3(1.00, 0.74, 0.26);
    vec3 c4 = vec3(1.00, 0.92, 0.66);
    vec3 c5 = vec3(1.00, 0.99, 0.93);
    vec3 col = mix(c0, c1, smoothstep(0.00, 0.25, h));
    col = mix(col, c2, smoothstep(0.25, 0.50, h));
    col = mix(col, c3, smoothstep(0.50, 0.74, h));
    col = mix(col, c4, smoothstep(0.74, 0.95, h));
    col = mix(col, c5, smoothstep(0.95, 1.15, h));
    return col;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);
    float mu = clamp(dot(N, V), 0.0, 1.0);
    vec3 p = normalize(vPos);
    float t = uTime;

    // 1. Domain warping -> swirling magnetic plasma flow
    vec3 w = vec3(
      snoise(p * 2.2 + vec3(0.0, t * 0.03, 0.0)),
      snoise(p * 2.2 + vec3(5.2, 1.3 - t * 0.025, 2.1)),
      snoise(p * 2.2 + vec3(1.7, 9.2, t * 0.02))
    );
    vec3 q = p + w * 0.13;

    // 2. Convective granulation (bright cell centres, dark intergranular lanes)
    vec2 c1 = worley(q * 15.0, t * 0.35);
    float gran = smoothstep(0.0, 0.38, c1.y - c1.x);
    vec2 c2 = worley(q * 32.0 + 3.0, t * 0.5);
    float gran2 = smoothstep(0.0, 0.32, c2.y - c2.x);

    // 3. Supergranulation & large-scale flows
    float sg = fbm3(q * 3.0 + vec3(t * 0.02));

    // 4. Active regions: bright faculae / plage (no dark sunspots)
    float activeRegion = smoothstep(0.3, 0.8, snoise(q * 1.4 + vec3(0.0, 0.0, t * 0.01)) * 0.5 + 0.5);
    float plage = activeRegion * smoothstep(0.35, 0.85, fbm3(q * 7.0 - vec3(t * 0.03)) * 0.5 + 0.5);

    float heat = 0.40 + 0.30 * gran + 0.10 * gran2 + 0.16 * sg + 0.24 * plage;
    // Limb darkening in temperature space -> cooler, redder edges
    heat *= mix(0.52, 1.0, pow(mu, 0.45));

    vec3 col = sunRamp(heat);

    // 5. Intensity limb darkening I(mu) = 1 - u(1 - mu)
    col *= 0.82 + 0.28 * mu;
    col = mix(col, vec3(0.92, 0.26, 0.03), pow(1.0 - mu, 4.0) * 0.55);

    // 6. Soft white-hot core bloom
    col += vec3(1.0, 0.86, 0.58) * pow(mu, 6.0) * 0.14;

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ── CORONA: chromosphere rim, streamers, flames & magnetic prominence loops ──
const coronaVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const coronaFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uLimb;   // projected solar radius on this plane (world units)
  uniform float uSize;   // plane size (world units)
  uniform float uHalf;   // half of visible frustum height (world units)
  varying vec2 vUv;

  ${NOISE_GLSL}

  // Magnetic loop rooted on the limb: half-ellipse arch with wispy distortion
  float prominence(vec2 p, float ang, float w, float h, float th, float t, float seed) {
    vec2 n = vec2(cos(ang), sin(ang));
    vec2 tg = vec2(-n.y, n.x);
    float x = dot(p, tg);
    float y = length(p) - uLimb;
    x += snoise(vec3(p * 6.0, t * 0.18 + seed)) * 0.022;
    y += snoise(vec3(p * 7.5 + 3.0, t * 0.22 + seed)) * 0.018;
    float e = length(vec2(x / w, max(y, 0.0) / h));
    float d = abs(e - 1.0) * min(w, h);
    float m = exp(-(d * d) / (th * th));
    // faint plasma fill under the arch
    m += 0.12 * smoothstep(1.0, 0.2, e);
    m *= smoothstep(-0.01, 0.035, y);
    m *= step(0.0, dot(p, n));
    // filament brightness flicker along the arch
    m *= 0.65 + 0.35 * (snoise(vec3(x * 18.0, y * 18.0, t * 0.4 + seed)) * 0.5 + 0.5);
    return m;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    float d = length(p);
    if (d > uHalf) discard;

    vec2 dir = p / max(d, 1e-4);
    float r = d / uLimb;
    float h = max(r - 1.0, 0.0);
    float t = uTime;
    float outside = smoothstep(0.996, 1.006, r);

    vec3 gold    = vec3(1.00, 0.80, 0.42);
    vec3 amber   = vec3(1.00, 0.60, 0.20);
    vec3 orange  = vec3(1.00, 0.46, 0.10);
    vec3 flare   = vec3(1.00, 0.34, 0.07);

    vec3 col = vec3(0.0);

    // Inner limb bloom (blends the disk edge into the atmosphere)
    if (r < 1.0) {
      col += gold * exp(-(1.0 - r) * 20.0) * 0.5;
    }

    // Turbulent chromosphere rim (spicule-like, never a perfect circle)
    if (h < 0.35) {
      float edgeN = fbm3(vec3(dir * 9.0, t * 0.22)) * 0.5 + 0.5;
      float rimW = 0.018 + 0.035 * edgeN;
      col += gold * exp(-h / rimW) * 0.95 * outside;

      // Small eruptive flame tongues licking off the surface
      float fl = fbm3(vec3(dir * 6.0, h * 3.2 - t * 0.3)) * 0.5 + 0.5;
      col += orange * smoothstep(0.5, 0.85, fl) * exp(-h * 9.0) * 0.85 * outside;

      // Magnetic prominence loops
      float pr = 0.0;
      pr += prominence(p, 0.62 + 0.05 * sin(t * 0.05), 0.20, 0.19 + 0.03 * sin(t * 0.35), 0.016, t, 0.0);
      pr += prominence(p, 3.95 + 0.04 * sin(t * 0.07 + 1.0), 0.13, 0.12 + 0.025 * sin(t * 0.45 + 2.0), 0.013, t, 7.0);
      pr += 0.7 * prominence(p, 2.25, 0.085, 0.09 + 0.02 * sin(t * 0.55), 0.010, t, 13.0);
      col += mix(flare, gold, 0.3) * pr * 1.05;
    }

    // Diffuse corona
    float corona = exp(-h * 3.6) * 0.42 + exp(-h * 1.3) * 0.15;
    col += amber * corona * outside;

    // Coronal streamers (seamless: noise sampled on the direction vector, no atan seam)
    float s  = fbm3(vec3(dir * 2.2, h * 0.8 - t * 0.04)) * 0.5 + 0.5;
    float s2 = snoise(vec3(dir * 5.5, t * 0.03)) * 0.5 + 0.5;
    float streamers = pow(s, 2.6) * (0.55 + 0.6 * s2) * exp(-h * 1.7);
    col += mix(amber, gold, s2) * streamers * 0.6 * outside;

    // Fade to zero well before the canvas edge -> no square clipping
    col *= 1.0 - smoothstep(uHalf * 0.68, uHalf * 0.98, d);

    float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
    gl_FragColor = vec4(col, a);
  }
`;

// ── SOLAR EMBERS: plasma particles drifting off the limb ────────────────────
const emberVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uLimb;
  uniform float uPixelRatio;
  attribute float aAngle;
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aSize;
  varying float vAlpha;

  void main() {
    float life = fract(aPhase + uTime * aSpeed);
    float ang = aAngle + sin(uTime * 0.2 + aPhase * 6.2831) * 0.04 + life * 0.18 * (aPhase - 0.5);
    float rad = uLimb * (1.0 + life * 0.7);
    vec3 pos = vec3(cos(ang) * rad, sin(ang) * rad, 0.0);
    vAlpha = smoothstep(0.0, 0.12, life) * (1.0 - smoothstep(0.45, 1.0, life));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uPixelRatio * (1.0 - life * 0.5);
  }
`;

const emberFragmentShader = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha * 0.85;
    gl_FragColor = vec4(vec3(1.0, 0.72, 0.32) * a, a);
  }
`;

export function RealisticSun({ className = '', onFallback }: RealisticSunProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Keep latest callback without re-initialising WebGL on every parent render
  const onFallbackRef = useRef(onFallback);
  useEffect(() => {
    onFallbackRef.current = onFallback;
  }, [onFallback]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let frameId = 0;
    let disposed = false;
    let isVisible = true;
    let cleanup: (() => void) | null = null;

    const initSun = async () => {
      try {
        const THREE = await import('three');
        if (disposed) return;

        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        const scene = new THREE.Scene();
        const FOV = 45;
        const CAMERA_DIST = 4.4;
        const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
        camera.position.z = CAMERA_DIST;

        // Geometry of the view: projected solar radius and visible half-height at z = 0
        const SUN_RADIUS = 1.0;
        const limb = SUN_RADIUS / Math.sqrt(1 - (SUN_RADIUS / CAMERA_DIST) ** 2);
        const halfH = CAMERA_DIST * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
        const planeSize = halfH * 2;

        // 1. Photosphere
        const sphereGeo = new THREE.SphereGeometry(SUN_RADIUS, 128, 128);
        const photosphereMat = new THREE.ShaderMaterial({
          vertexShader: photosphereVertexShader,
          fragmentShader: photosphereFragmentShader,
          uniforms: { uTime: { value: 0 } },
        });
        const sunSphere = new THREE.Mesh(sphereGeo, photosphereMat);
        scene.add(sunSphere);

        // 2. Corona / chromosphere / prominences (additive overlay)
        const coronaGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const coronaMat = new THREE.ShaderMaterial({
          vertexShader: coronaVertexShader,
          fragmentShader: coronaFragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uLimb: { value: limb },
            uSize: { value: planeSize },
            uHalf: { value: halfH },
          },
          transparent: true,
          depthTest: false,
          depthWrite: false,
          blending: THREE.CustomBlending,
          blendSrc: THREE.OneFactor,
          blendDst: THREE.OneFactor,
        });
        const coronaPlane = new THREE.Mesh(coronaGeo, coronaMat);
        coronaPlane.renderOrder = 1;
        scene.add(coronaPlane);

        // 3. Solar embers
        const EMBER_COUNT = 90;
        const emberGeo = new THREE.BufferGeometry();
        const angles = new Float32Array(EMBER_COUNT);
        const speeds = new Float32Array(EMBER_COUNT);
        const phases = new Float32Array(EMBER_COUNT);
        const sizes = new Float32Array(EMBER_COUNT);
        for (let i = 0; i < EMBER_COUNT; i++) {
          angles[i] = Math.random() * Math.PI * 2;
          speeds[i] = 0.025 + Math.random() * 0.05;
          phases[i] = Math.random();
          sizes[i] = 1.5 + Math.random() * 2.5;
        }
        emberGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(EMBER_COUNT * 3), 3));
        emberGeo.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1));
        emberGeo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
        emberGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
        emberGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        const emberMat = new THREE.ShaderMaterial({
          vertexShader: emberVertexShader,
          fragmentShader: emberFragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uLimb: { value: limb },
            uPixelRatio: { value: renderer.getPixelRatio() },
          },
          transparent: true,
          depthTest: false,
          depthWrite: false,
          blending: THREE.CustomBlending,
          blendSrc: THREE.OneFactor,
          blendDst: THREE.OneFactor,
        });
        const embers = new THREE.Points(emberGeo, emberMat);
        embers.frustumCulled = false;
        embers.renderOrder = 2;
        scene.add(embers);

        // Sizing (container driven)
        const updateSize = () => {
          const width = container.clientWidth || 480;
          const height = container.clientHeight || 480;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        updateSize();
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(container);

        // Parallax mouse follow (smoothed)
        const mouse = { x: 0, y: 0 };
        const parallax = { x: 0, y: 0 };
        const onMouseMove = (e: MouseEvent) => {
          mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
          mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('mousemove', onMouseMove, { passive: true });

        // Pause rendering when off-screen / tab hidden
        const observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              isVisible = entry.isIntersecting;
            });
          },
          { threshold: 0.05 }
        );
        observer.observe(container);

        const onVisibilityChange = () => {
          isVisible = document.visibilityState === 'visible';
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const timeScale = reducedMotion ? 0.25 : 1;

        setIsReady(true);

        const clock = new THREE.Clock();
        const animate = () => {
          frameId = requestAnimationFrame(animate);
          if (!isVisible) return;

          const t = clock.getElapsedTime() * timeScale;
          photosphereMat.uniforms.uTime.value = t;
          coronaMat.uniforms.uTime.value = t;
          emberMat.uniforms.uTime.value = t;

          parallax.x += (mouse.x - parallax.x) * 0.04;
          parallax.y += (mouse.y - parallax.y) * 0.04;

          sunSphere.rotation.y = t * 0.025 + parallax.x * 0.18;
          sunSphere.rotation.x = 0.15 - parallax.y * 0.12;
          coronaPlane.rotation.z = t * 0.006;

          renderer.render(scene, camera);
        };
        animate();

        cleanup = () => {
          cancelAnimationFrame(frameId);
          observer.disconnect();
          resizeObserver.disconnect();
          document.removeEventListener('visibilitychange', onVisibilityChange);
          window.removeEventListener('mousemove', onMouseMove);

          sphereGeo.dispose();
          photosphereMat.dispose();
          coronaGeo.dispose();
          coronaMat.dispose();
          emberGeo.dispose();
          emberMat.dispose();
          renderer.dispose();
        };
      } catch (err) {
        console.warn('WebGL Sun initialization failed, falling back to CSS:', err);
        onFallbackRef.current?.();
      }
    };

    const hasIdle = 'requestIdleCallback' in window;
    const idleId: number = hasIdle
      ? window.requestIdleCallback(() => void initSun(), { timeout: 1000 })
      : window.setTimeout(() => void initSun(), 50);

    return () => {
      disposed = true;
      if (hasIdle) window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      cancelAnimationFrame(frameId);
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center pointer-events-none transition-opacity duration-1000 ${
        isReady ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      style={{
        width: 'min(600px, 46vw)',
        height: 'min(600px, 46vw)',
      }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
