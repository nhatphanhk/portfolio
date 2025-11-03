// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// import type {
//   CarouselProps,
//   SkillsCarouselProps,
//   CertificationsCarouselProps,
//   SkillIcon,
//   CertificationIcon,
// } from '@/types/HomePage';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// export function BPSCSection() {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const blogRef = useRef<HTMLElement>(null);
//   const projectRef = useRef<HTMLElement>(null);
//   const skillsRef = useRef<HTMLElement>(null);
//   const certsRef = useRef<HTMLElement>(null);

//   const blogItems = [
//     { text: 'How I build accessible UIs', href: '#blog-post-1' },
//     { text: 'Managing state with hooks', href: '#blog-post-2' },
//     { text: 'Deploying modern apps', href: '#blog-post-3' },
//     { text: 'Performance optimization tips', href: '#blog-post-4' },
//     { text: 'Modern CSS techniques', href: '#blog-post-5' },
//   ];

//   const projectItems = [
//     { text: 'Portfolio Website — React + Tailwind', href: '#project-1' },
//     { text: 'Collaboration Tool — Node + WebSocket', href: '#project-2' },
//     { text: 'Design System — Storybook', href: '#project-3' },
//     { text: 'E-commerce Platform — Next.js + Stripe', href: '#project-4' },
//     { text: 'Mobile App — React Native', href: '#project-5' },
//   ];

//   const skills = [
//     'TypeScript',
//     'React',
//     'Next.js',
//     'Tailwind CSS',
//     'Node.js',
//     'GraphQL',
//     'Testing',
//     'Docker',
//     'AWS',
//     'MongoDB',
//   ];

//   const certificationItems = [
//     { text: 'Frontend Engineering — Example Institute' },
//     { text: 'Cloud Fundamentals — Example Cloud' },
//     { text: 'Accessibility — Inclusive Web Academy' },
//     { text: 'Advanced React — Meta Professional' },
//     { text: 'Full Stack Development — Coursera' },
//   ];

//   useEffect(() => {
//     // Register GSAP plugin
//     gsap.registerPlugin(ScrollTrigger);

//     // Get all carousel sections
//     const carouselRefs = [blogRef, projectRef, skillsRef, certsRef];
//     const sections = carouselRefs
//       .map(ref => ref.current)
//       .filter(el => el !== null);

//     if (containerRef.current && sections.length > 0) {
//       // Calculate total scroll width
//       const totalWidth = sections.length * 100;

//       // Create horizontal scroll animation
//       gsap.to(sections, {
//         xPercent: -100 * (sections.length - 1), // Move left by 100% for each section
//         ease: 'none',
//         scrollTrigger: {
//           trigger: containerRef.current,
//           pin: true, // Pin the container while scrolling
//           scrub: 1, // Smooth scroll effect
//           snap: 1 / (sections.length - 1), // Snap to each section
//           end: () =>
//             `+=${containerRef.current!.offsetWidth * (sections.length - 1)}`, // Scroll distance
//           markers: false, // Set to true to debug
//         },
//       });
//     }

//     // Cleanup function
//     return () => {
//       ScrollTrigger.getAll().forEach(trigger => trigger.kill());
//     };
//   }, []);

//   return (
//     <section className="overflow-hidden">
//       <div ref={containerRef} className="h-screen flex items-center">
//         <div className="flex w-full">
//           <section
//             ref={blogRef}
//             className="carousel min-w-full h-screen flex items-center justify-center px-8"
//           >
//             <div className="max-w-4xl w-full">
//               <ItemCarousel
//                 items={blogItems}
//                 title="Blog"
//                 description="Articles about development, design, and learning notes."
//                 buttonText="View all posts"
//                 buttonHref="/blog"
//               />
//             </div>
//           </section>

//           <section
//             ref={projectRef}
//             className="carousel min-w-full h-screen flex items-center justify-center px-8"
//           >
//             <div className="max-w-4xl w-full">
//               <ItemCarousel
//                 items={projectItems}
//                 title="Projects"
//                 description="Selected projects showcasing frontend, full-stack and tooling work."
//                 buttonText="See projects"
//                 buttonHref="/project"
//               />
//             </div>
//           </section>

//           <section
//             ref={skillsRef}
//             className="carousel min-w-full h-screen flex items-center justify-center px-8"
//           >
//             <div className="max-w-4xl w-full">
//               <SkillsCarousel
//                 skills={skills}
//                 title="Skills"
//                 description="Core technologies and tools I use regularly."
//                 buttonText="View skills"
//                 buttonHref="#skills"
//               />
//             </div>
//           </section>

//           <section
//             ref={certsRef}
//             className="carousel min-w-full h-screen flex items-center justify-center px-8"
//           >
//             <div className="max-w-4xl w-full">
//               <CertificationsCarousel
//                 certifications={certificationItems}
//                 title="Certifications"
//                 description="Formal recognitions and completed courses."
//                 buttonText="View certificates"
//                 buttonHref="#certifications"
//               />
//             </div>
//           </section>
//         </div>
//       </div>
//     </section>
//   );
// }
