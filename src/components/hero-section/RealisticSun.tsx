'use client';

import { useEffect, useRef, useState } from 'react';

interface RealisticSunProps {
  className?: string;
  onFallback?: () => void;
}

export function RealisticSun({ className = '', onFallback }: RealisticSunProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let frameId: number;
    let disposed = false;
    let isVisible = true;

    const initSun = async () => {
      try {
        const THREE = await import('three');
        if (disposed) return;

        // Verify WebGL context support
        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        const updateSize = () => {
          const width = container.clientWidth || 440;
          const height = container.clientHeight || 440;
          renderer.setSize(width, height);
          if (camera) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
          }
        };

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.z = 3.6;

        updateSize();

        // ── PHOTOSPHERE SHADER (Granulation, Sunspots, Faculae, Limb Darkening) ──
        const photosphereVertexShader = `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying vec3 vViewDir;

          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewDir = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `;

        const photosphereFragmentShader = `
          uniform float uTime;
          uniform vec3 uSunDir;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vPosition;
          varying vec3 vViewDir;

          // Simplex Noise 3D Implementation
          vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
          vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

          float snoise(vec3 v){
            const vec2  C = vec2(1.0/6.0, 1.0/3.0);
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

            vec3 i  = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);

            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );

            vec3 x1 = x0 - i1 + 1.0 * C.xxx;
            vec3 x2 = x0 - i2 + 2.0 * C.xxx;
            vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

            i = mod(i, 289.0 );
            vec4 p = permute( permute( permute(
                      i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

            float n_ = 0.142857142857;
            vec3  ns = n_ * D.wyz - D.xzx;

            vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );

            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);

            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );

            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));

            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);

            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;

            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
          }

          // Fractal Brownian Motion for Plasma Granulation
          float fbm(vec3 p) {
            float total = 0.0;
            float amplitude = 0.55;
            for (int i = 0; i < 4; i++) {
              total += amplitude * snoise(p);
              p = p * 2.15 + vec3(0.12, 0.25, 0.17);
              amplitude *= 0.48;
            }
            return total;
          }

          void main() {
            vec3 V = normalize(vViewDir);
            vec3 N = normalize(vNormal);

            // 1. Realistic Astrophysical Limb Darkening: I(mu) = 1.0 - u*(1.0 - mu)
            float mu = clamp(dot(N, V), 0.0, 1.0);
            float limbDarkening = 1.0 - 0.62 * (1.0 - mu);

            // Coordinate rotating around polar axis
            float rotTime = uTime * 0.035;
            vec3 rotP = vec3(
              vPosition.x * cos(rotTime) - vPosition.z * sin(rotTime),
              vPosition.y,
              vPosition.x * sin(rotTime) + vPosition.z * cos(rotTime)
            );

            // 2. High-frequency convective plasma granulation
            float granulation = fbm(rotP * 14.0 + vec3(uTime * 0.04));
            float superGranulation = fbm(rotP * 3.5 + vec3(uTime * 0.015));

            // 3. Realistic Sunspots (Dark magnetic active regions)
            float spotNoise = snoise(rotP * 1.8 + vec3(0.5, 0.2, 0.0));
            float spotMask = smoothstep(0.58, 0.72, spotNoise);
            float spotUmbra = smoothstep(0.66, 0.73, spotNoise); // Deepest dark core

            // 4. Faculae (Brighter areas around sunspots and near the limb)
            float faculae = smoothstep(0.48, 0.58, spotNoise) * (1.0 - spotMask) * (1.0 - mu * 0.5);

            // 5. Plasma Temperature Palette (NASA Solar Dynamics Observatory Kelvin gradient)
            vec3 coreWhite   = vec3(1.0, 0.98, 0.92);
            vec3 brightGold  = vec3(1.0, 0.82, 0.32);
            vec3 plasmaAmber = vec3(0.98, 0.52, 0.10);
            vec3 deepOrange  = vec3(0.85, 0.28, 0.03);
            vec3 limbRed     = vec3(0.45, 0.08, 0.01);
            vec3 spotUmbraCol = vec3(0.08, 0.03, 0.01);

            // Blend colors according to granulation temperature
            float tempFactor = 0.5 + 0.35 * granulation + 0.15 * superGranulation + 0.2 * faculae;
            vec3 surfaceCol;
            if (tempFactor > 0.7) {
              surfaceCol = mix(brightGold, coreWhite, (tempFactor - 0.7) / 0.3);
            } else if (tempFactor > 0.4) {
              surfaceCol = mix(plasmaAmber, brightGold, (tempFactor - 0.4) / 0.3);
            } else {
              surfaceCol = mix(deepOrange, plasmaAmber, tempFactor / 0.4);
            }

            // Apply limb darkening law towards the limb
            surfaceCol = mix(surfaceCol * limbDarkening, limbRed, pow(1.0 - mu, 3.5));

            // Carve out Sunspots (Umbra & Penumbra)
            if (spotMask > 0.0) {
              vec3 penumbraCol = mix(deepOrange * 0.4, spotUmbraCol, spotUmbra);
              surfaceCol = mix(surfaceCol, penumbraCol, spotMask);
            }

            // Soft core bloom
            surfaceCol += coreWhite * pow(mu, 3.0) * 0.18;

            gl_FragColor = vec4(surfaceCol, 1.0);
          }
        `;

        // ── CHROMOSPHERE & LIMB FRESNEL GLOW ──
        const rimVertexShader = `
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewDir = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `;

        const rimFragmentShader = `
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            vec3 N = normalize(vNormal);
            vec3 V = normalize(vViewDir);
            float fresnel = pow(1.0 - abs(dot(N, V)), 2.8);
            vec3 rimColor = vec3(1.0, 0.55, 0.12);
            gl_FragColor = vec4(rimColor, fresnel * 0.75);
          }
        `;

        // ── CORONA & SOLAR PROMINENCE FLARE PLANE ──
        const coronaVertexShader = `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `;

        const coronaFragmentShader = `
          uniform float uTime;
          varying vec2 vUv;

          // Simple 2D Noise
          float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
          }

          float noise2D(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
          }

          void main() {
            vec2 uv = vUv - vec2(0.5);
            float dist = length(uv) * 2.0; // 0.0 at center, 1.0 at boundary
            float angle = atan(uv.y, uv.x);

            // Coronal streamer rays radiating outward
            float rays1 = noise2D(vec2(angle * 4.0 + uTime * 0.08, dist * 2.0));
            float rays2 = noise2D(vec2(angle * 7.0 - uTime * 0.05, dist * 3.0));
            float rays = rays1 * 0.6 + rays2 * 0.4;

            // Corona intensity drops with distance
            float diskRadius = 0.58;
            if (dist < diskRadius) {
              discard; // Inside solar sphere
            }

            float coronaDist = (dist - diskRadius) / (1.0 - diskRadius);
            float glow = pow(1.0 - clamp(coronaDist, 0.0, 1.0), 2.2);

            // Solar Prominences: Magnetic plasma loops shooting out at specific angles
            float prominenceAngle1 = sin(angle * 3.0 + 1.2);
            float prominenceAngle2 = cos(angle * 5.0 - 0.4);
            float prominence = max(0.0, prominenceAngle1 * 0.5 + prominenceAngle2 * 0.5);
            float prominenceGlow = smoothstep(diskRadius, diskRadius + 0.12, dist) * (1.0 - smoothstep(diskRadius + 0.12, diskRadius + 0.25, dist)) * prominence;

            vec3 coronaColor = mix(vec3(1.0, 0.58, 0.12), vec3(1.0, 0.85, 0.45), rays);
            vec3 prominenceColor = vec3(1.0, 0.22, 0.05);

            vec3 finalColor = mix(coronaColor, prominenceColor, prominenceGlow * 1.5);
            float alpha = (glow * 0.42 * (0.8 + 0.4 * rays)) + (prominenceGlow * 0.7);

            gl_FragColor = vec4(finalColor, alpha);
          }
        `;

        // 1. Photosphere Sphere
        const sphereGeo = new THREE.SphereGeometry(1.0, 64, 64);
        const photosphereMat = new THREE.ShaderMaterial({
          vertexShader: photosphereVertexShader,
          fragmentShader: photosphereFragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uSunDir: { value: new THREE.Vector3(0, 0, 1) },
          },
        });
        const sunSphere = new THREE.Mesh(sphereGeo, photosphereMat);
        scene.add(sunSphere);

        // 2. Chromosphere Rim Glow Sphere (slightly larger)
        const rimGeo = new THREE.SphereGeometry(1.015, 48, 48);
        const rimMat = new THREE.ShaderMaterial({
          vertexShader: rimVertexShader,
          fragmentShader: rimFragmentShader,
          uniforms: {
            uTime: { value: 0 },
          },
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const rimSphere = new THREE.Mesh(rimGeo, rimMat);
        scene.add(rimSphere);

        // 3. Coronal Streamers & Prominences Billboard Plane
        const coronaGeo = new THREE.PlaneGeometry(3.4, 3.4);
        const coronaMat = new THREE.ShaderMaterial({
          vertexShader: coronaVertexShader,
          fragmentShader: coronaFragmentShader,
          uniforms: {
            uTime: { value: 0 },
          },
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const coronaPlane = new THREE.Mesh(coronaGeo, coronaMat);
        scene.add(coronaPlane);

        // Parallax mouse follow
        const mouse = { x: 0, y: 0 };
        const onMouseMove = (e: MouseEvent) => {
          mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
          mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('mousemove', onMouseMove);

        const onResize = () => {
          updateSize();
        };
        window.addEventListener('resize', onResize);

        // Visibility observer to pause rendering when offscreen
        const observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              isVisible = entry.isIntersecting;
            });
          },
          { threshold: 0.1 }
        );
        observer.observe(container);

        const onVisibilityChange = () => {
          isVisible = document.visibilityState === 'visible';
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        setIsReady(true);

        const clock = new THREE.Clock();
        const animate = () => {
          frameId = requestAnimationFrame(animate);

          if (!isVisible) return;

          const elapsedTime = clock.getElapsedTime();
          photosphereMat.uniforms.uTime.value = elapsedTime;
          rimMat.uniforms.uTime.value = elapsedTime;
          coronaMat.uniforms.uTime.value = elapsedTime;

          // Slow organic rotation
          sunSphere.rotation.y = elapsedTime * 0.02;
          sunSphere.rotation.x = 0.12 + Math.sin(elapsedTime * 0.01) * 0.02;

          // Parallax tilt towards mouse
          sunSphere.rotation.y += (mouse.x * 0.15 - sunSphere.rotation.y * 0.1) * 0.05;
          sunSphere.rotation.x += (-mouse.y * 0.12 - sunSphere.rotation.x * 0.1) * 0.05;

          // Corona plane faces camera
          coronaPlane.rotation.z = -elapsedTime * 0.008;

          renderer.render(scene, camera);
        };

        animate();

        // Cleanup handler
        (canvas as any).__sunCleanup = () => {
          cancelAnimationFrame(frameId);
          observer.disconnect();
          document.removeEventListener('visibilitychange', onVisibilityChange);
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('resize', onResize);

          sphereGeo.dispose();
          photosphereMat.dispose();
          rimGeo.dispose();
          rimMat.dispose();
          coronaGeo.dispose();
          coronaMat.dispose();
          renderer.dispose();
        };
      } catch (err) {
        console.warn('WebGL Sun initialization failed, falling back to CSS:', err);
        onFallback?.();
      }
    };

    const idleId =
      typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? (window as any).requestIdleCallback(initSun, { timeout: 1000 })
        : setTimeout(initSun, 50);

    return () => {
      disposed = true;
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && typeof idleId === 'number') {
        (window as any).cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
      cancelAnimationFrame(frameId);
      const cleanup = (canvas as any)?.__sunCleanup;
      if (cleanup) cleanup();
    };
  }, [onFallback]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center pointer-events-none transition-opacity duration-700 ${
        isReady ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      style={{
        width: 'min(480px, 44vw)',
        height: 'min(480px, 44vw)',
      }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
