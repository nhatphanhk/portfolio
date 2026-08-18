'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Download, ArrowRight, ChevronDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import * as THREE from 'three';
import gsap from 'gsap';

const ICON_MAP = Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>;

interface HeroSectionProps {
  profile: {
    name: string;
    title: string;
    tagline?: string;
    resumeUrl?: string;
    avatarUrl?: string;
  };
  socialLinks: Array<{ platform: string; url: string; iconName?: string | null }>;
}

export function HeroSection({ profile, socialLinks }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // ── Three.js Cosmic Starfield with Soft Circular Sprites ──────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.z = 60;

    // Helper: Create soft circular radial gradient star texture (NO CHUNKY SQUARES)
    const createStarTexture = () => {
      const texCanvas = document.createElement('canvas');
      texCanvas.width = 64;
      texCanvas.height = 64;
      const ctx = texCanvas.getContext('2d')!;
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(255, 235, 170, 0.85)');
      grad.addColorStop(0.5, 'rgba(160, 200, 255, 0.35)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      const texture = new THREE.CanvasTexture(texCanvas);
      texture.needsUpdate = true;
      return texture;
    };

    const starTexture = createStarTexture();

    const makeParticles = (
      count: number,
      color: number,
      size: number,
      opacity: number,
      spread: number
    ) => {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * spread;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        size,
        color,
        map: starTexture,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });
      return { points: new THREE.Points(geo, mat), geo, mat };
    };

    // Layer 1: Distant fine starfield (small, sharp)
    const distantStars = makeParticles(900, 0xd0e4ff, 0.45, 0.65, 160);
    // Layer 2: Golden solar dust & midground stars
    const goldStars = makeParticles(500, 0xffd54f, 0.65, 0.75, 130);
    // Layer 3: Foreground bright twinkling stars
    const brightStars = makeParticles(180, 0xffffff, 0.95, 0.85, 110);

    scene.add(distantStars.points, goldStars.points, brightStars.points);

    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let frameId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      distantStars.points.rotation.y = t * 0.008;
      distantStars.points.rotation.x = t * 0.004;

      goldStars.points.rotation.y = -t * 0.012;
      goldStars.points.rotation.z = t * 0.005;

      brightStars.points.rotation.x = t * 0.015;
      brightStars.points.rotation.y = t * 0.006;

      camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.02;
      camera.position.y += (mouse.y * 1.5 - camera.position.y) * 0.02;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      starTexture.dispose();
      [distantStars, goldStars, brightStars].forEach(p => {
        p.geo.dispose();
        p.mat.dispose();
      });
      renderer.dispose();
    };
  }, []);

  // ── GSAP Entrance Timeline ────────────────────────────────────────────────
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('[data-hero="name"]', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 1.0 }, 0.2)
        .fromTo('[data-hero="title"]', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.8 }, '-=0.6')
        .fromTo('[data-hero="tagline"]', { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.7 }, '-=0.5')
        .fromTo('[data-hero="ctas"]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .fromTo('[data-hero="social"]', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 }, '-=0.3')
        .fromTo('[data-hero="sun-container"]', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 0.1)
        .fromTo('[data-hero="scroll"]', { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.3');
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full flex items-center overflow-hidden"
    >
      {/* ── Complete Cosmic Space Sky Background ── */}
      <div className="hero-bg" aria-hidden="true" />

      {/* ── Three.js Soft Starfield ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 2 }}
        aria-hidden="true"
      />

      {/* ── Soft Edge Vignette to Frame Cosmic Depth ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          background: 'radial-gradient(ellipse 110% 110% at 50% 50%, transparent 40%, rgba(3, 7, 18, 0.6) 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Two-Column Layout (Content Left, Sun Right) ── */}
      <div
        className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center"
        style={{ zIndex: 10 }}
      >
        {/* ══ LEFT — Text Content ══════════════════════════════════════════ */}
        <div className="flex flex-col items-start text-left">
          {/* Greeting & Name */}
          <h1
            data-hero="name"
            className="font-extrabold tracking-tight leading-[1.0] mb-5"
          >
            <span
              className="block text-2xl sm:text-3xl font-semibold mb-2"
              style={{
                color: 'oklch(0.82 0.08 255)',
                letterSpacing: '0.04em',
              }}
            >
              Hi, I&apos;m
            </span>
            <span
              className="block text-6xl sm:text-7xl xl:text-8xl text-gold-shimmer font-black"
              style={{ letterSpacing: '-0.02em' }}
            >
              {profile.name.split(' ')[0]}
            </span>
            <span
              className="block text-3xl sm:text-4xl xl:text-5xl font-bold mt-3"
              style={{
                color: 'oklch(0.97 0.02 85)',
                letterSpacing: '-0.01em',
                textShadow: '0 2px 24px rgba(0, 0, 0, 0.8)',
              }}
            >
              {profile.name.split(' ').slice(1).join(' ')}
            </span>
          </h1>

          {/* Title */}
          <p
            data-hero="title"
            className="text-xl sm:text-2xl xl:text-3xl font-bold mb-5 tracking-tight"
            style={{
              color: 'oklch(0.72 0.18 255)',
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.7)',
            }}
          >
            {profile.title}
          </p>

          {/* Divider accent line */}
          <div
            className="h-1 w-20 rounded-full mb-6"
            style={{
              background: 'linear-gradient(90deg, #f59e0b 0%, #3b82f6 100%)',
              boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)',
            }}
          />

          {/* Tagline */}
          <p
            data-hero="tagline"
            className="text-base sm:text-lg xl:text-xl max-w-md mb-10 leading-relaxed font-normal"
            style={{
              color: 'oklch(0.84 0.05 255)',
              textShadow: '0 1px 12px rgba(0, 0, 0, 0.7)',
            }}
          >
            {profile.tagline}
          </p>

          {/* CTA Buttons */}
          <div
            data-hero="ctas"
            className="flex flex-wrap gap-3.5 mb-10"
          >
            <Link
              id="hero-view-projects"
              href="/project"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 hover:gap-3 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #fde047 0%, #f59e0b 60%, #d97706 100%)',
                color: '#0f172a',
                boxShadow: '0 4px 25px rgba(245, 158, 11, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
              }}
            >
              View Projects
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
              >
                <Download className="h-4 w-4" />
                Resume
              </a>
            )}
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-2.5">
            {socialLinks.map(link => {
              const Icon = link.iconName ? ICON_MAP[link.iconName] || Icons.Link : Icons.Link;
              return (
                <a
                  data-hero="social"
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.platform}
                  title={link.platform}
                  className="p-3 rounded-xl transition-all duration-200 hover:scale-110"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    color: '#fbbf24',
                    backdropFilter: 'blur(16px)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = '#f59e0b';
                    el.style.borderColor = '#f59e0b';
                    el.style.color = '#0f172a';
                    el.style.boxShadow = '0 0 24px rgba(245, 158, 11, 0.6)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'rgba(255, 255, 255, 0.08)';
                    el.style.borderColor = 'rgba(251, 191, 36, 0.3)';
                    el.style.color = '#fbbf24';
                    el.style.boxShadow = '';
                  }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* ══ RIGHT — Realistic Celestial Sun Visual ══════════════════════════ */}
        <div
          data-hero="sun-container"
          className="relative hidden lg:flex items-center justify-center"
          style={{ minHeight: '520px' }}
        >
          {/* ── Layer 1: Coronal Solar Rays (Emanating DIRECTLY from the Sun's Center) ── */}
          <div className="solar-rays-layer" aria-hidden="true" />

          {/* ── Layer 2: Deep Ambient Volumetric Corona Glow (Wide Warm Atmosphere, Dimmed) ── */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '140%',
              height: '140%',
              background: 'radial-gradient(circle, rgba(255, 179, 0, 0.14) 0%, rgba(245, 124, 0, 0.07) 40%, rgba(230, 81, 0, 0.02) 65%, transparent 80%)',
              filter: 'blur(60px)',
              animation: 'corona-pulse 7s ease-in-out infinite',
            }}
            aria-hidden="true"
          />

          {/* ── Layer 3: Mid-Coronal Flare Ring (Softened) ── */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '115%',
              height: '115%',
              background: 'radial-gradient(circle, rgba(255, 214, 0, 0.18) 0%, rgba(255, 145, 0, 0.08) 50%, transparent 72%)',
              filter: 'blur(30px)',
              animation: 'corona-pulse 5s ease-in-out infinite 0.5s',
            }}
            aria-hidden="true"
          />

          {/* ── Layer 4: Realistic Photosphere Body (Warm & Gentle) ── */}
          <div className="realistic-sun-orb" aria-hidden="true">
            {/* Horizontal Anamorphic Optical Flare Streak (Softened) */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                width: '140%',
                height: '1.5px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 245, 157, 0.45) 50%, transparent 100%)',
                filter: 'blur(1px)',
                boxShadow: '0 0 10px 1px rgba(255, 213, 79, 0.4)',
              }}
            />

            {/* Soft Warm Solar Core Spot */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                width: '32%',
                height: '32%',
                background: 'radial-gradient(circle, #fffde7 0%, rgba(255, 249, 196, 0.7) 40%, rgba(255, 236, 179, 0.3) 75%, transparent 100%)',
                filter: 'blur(4px)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Scroll Down Indicator ── */}
      <div
        data-hero="scroll"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <span
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: 'oklch(0.65 0.10 255)' }}
        >
          Scroll
        </span>
        <ChevronDown
          className="h-4 w-4 animate-bounce"
          style={{ color: '#f59e0b' }}
        />
      </div>
    </section>
  );
}
