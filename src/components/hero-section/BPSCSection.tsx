'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  CarouselProps,
  SkillsCarouselProps,
  CertificationsCarouselProps,
  SkillIcon,
  CertificationIcon,
} from '@/types/HomePage';

function ItemCarousel({
  items,
  title,
  description,
  buttonText,
  buttonHref,
}: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + items.length) % items.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="bg-gray-800/60 p-6 rounded-lg text-left relative">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-300 mb-4">{description}</p>

      {/* Carousel Container */}
      <div className="relative mb-4">
        {items.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 p-1 rounded-full bg-gray-700/80 hover:bg-gray-600/80 transition-colors"
              aria-label="Previous item"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 p-1 rounded-full bg-gray-700/80 hover:bg-gray-600/80 transition-colors"
              aria-label="Next item"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </>
        )}

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {items.map((item, index) => (
              <div key={index} className="w-full flex-shrink-0 px-4">
                <div className="text-center py-4">
                  {item.href ? (
                    <a
                      className="text-blue-400 hover:underline text-sm"
                      href={item.href}
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-gray-300 text-sm">{item.text}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        {items.length > 1 && (
          <div className="flex justify-center mt-2 space-x-1">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide
                    ? 'bg-blue-500'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to item ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="text-center">
        <a
          className="inline-block text-sm px-3 py-1 bg-blue-600 rounded text-white hover:bg-blue-500 transition-colors"
          href={buttonHref}
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
}

function CertificationsCarousel({
  certifications,
  title,
  description,
  buttonText,
  buttonHref,
}: CertificationsCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const certsPerSlide = 3;

  // Map certifications to icons
  const certificationIcons: CertificationIcon[] = certifications.map(cert => {
    const iconMap: Record<string, string> = {
      'Frontend Engineering — Example Institute': '🎓',
      'Cloud Fundamentals — Example Cloud': '☁️',
      'Accessibility — Inclusive Web Academy': '♿',
      'Advanced React — Meta Professional': '⚛️',
      'Full Stack Development — Coursera': '🎯',
    };
    return {
      name: cert.text,
      icon: iconMap[cert.text] || '📜',
    };
  });

  const totalSlides = Math.ceil(certificationIcons.length / certsPerSlide);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const getCurrentSlideCerts = () => {
    const startIndex = currentSlide * certsPerSlide;
    return certificationIcons.slice(startIndex, startIndex + certsPerSlide);
  };

  return (
    <div className="bg-gray-800/60 p-6 rounded-lg text-left relative">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-300 mb-4">{description}</p>

      {/* Carousel Container */}
      <div className="relative mb-4">
        {totalSlides > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 p-1 rounded-full bg-gray-700/80 hover:bg-gray-600/80 transition-colors"
              aria-label="Previous certifications"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 p-1 rounded-full bg-gray-700/80 hover:bg-gray-600/80 transition-colors"
              aria-label="Next certifications"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </>
        )}

        <div className="overflow-hidden min-h-[80px] flex items-center">
          <div className="flex gap-4 justify-center w-full">
            {getCurrentSlideCerts().map(cert => (
              <div
                key={cert.name}
                className="flex flex-col items-center group cursor-pointer"
                title={cert.name}
              >
                <div className="text-3xl mb-1 transform group-hover:scale-110 transition-transform">
                  {cert.icon}
                </div>
                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-center max-w-[80px] truncate">
                  {cert.name.split(' — ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-2 space-x-1">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide
                    ? 'bg-blue-500'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to certifications group ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="text-center">
        <a
          className="inline-block text-sm px-3 py-1 bg-blue-600 rounded text-white hover:bg-blue-500 transition-colors"
          href={buttonHref}
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
}

function SkillsCarousel({
  skills,
  title,
  description,
  buttonText,
  buttonHref,
}: SkillsCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const skillsPerSlide = 4;

  // Map skills to icons
  const skillIcons: SkillIcon[] = skills.map(skill => {
    const iconMap: Record<string, string> = {
      TypeScript: '⚡',
      React: '⚛️',
      'Next.js': '▲',
      'Tailwind CSS': '🎨',
      'Node.js': '🟢',
      GraphQL: '◉',
      Testing: '🧪',
      Docker: '🐳',
      AWS: '☁️',
      MongoDB: '🍃',
    };
    return {
      name: skill,
      icon: iconMap[skill] || '💻',
    };
  });

  const totalSlides = Math.ceil(skillIcons.length / skillsPerSlide);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const getCurrentSlideSkills = () => {
    const startIndex = currentSlide * skillsPerSlide;
    return skillIcons.slice(startIndex, startIndex + skillsPerSlide);
  };

  return (
    <div className="bg-gray-800/60 p-6 rounded-lg text-left relative">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-300 mb-4">{description}</p>

      {/* Carousel Container */}
      <div className="relative mb-4">
        {totalSlides > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 p-1 rounded-full bg-gray-700/80 hover:bg-gray-600/80 transition-colors"
              aria-label="Previous skills"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 p-1 rounded-full bg-gray-700/80 hover:bg-gray-600/80 transition-colors"
              aria-label="Next skills"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </>
        )}

        <div className="overflow-hidden min-h-[80px] flex items-center">
          <div className="flex gap-4 justify-center w-full">
            {getCurrentSlideSkills().map(skill => (
              <div
                key={skill.name}
                className="flex flex-col items-center group cursor-pointer"
                title={skill.name}
              >
                <div className="text-3xl mb-1 transform group-hover:scale-110 transition-transform">
                  {skill.icon}
                </div>
                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {skill.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-2 space-x-1">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide
                    ? 'bg-blue-500'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to skills group ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="text-center">
        <a
          className="inline-block text-sm px-3 py-1 bg-blue-600 rounded text-white hover:bg-blue-500 transition-colors"
          href={buttonHref}
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
}

export function BPSCSection() {
  const blogItems = [
    { text: 'How I build accessible UIs', href: '#blog-post-1' },
    { text: 'Managing state with hooks', href: '#blog-post-2' },
    { text: 'Deploying modern apps', href: '#blog-post-3' },
    { text: 'Performance optimization tips', href: '#blog-post-4' },
    { text: 'Modern CSS techniques', href: '#blog-post-5' },
  ];

  const projectItems = [
    { text: 'Portfolio Website — React + Tailwind', href: '#project-1' },
    { text: 'Collaboration Tool — Node + WebSocket', href: '#project-2' },
    { text: 'Design System — Storybook', href: '#project-3' },
    { text: 'E-commerce Platform — Next.js + Stripe', href: '#project-4' },
    { text: 'Mobile App — React Native', href: '#project-5' },
  ];

  const skills = [
    'TypeScript',
    'React',
    'Next.js',
    'Tailwind CSS',
    'Node.js',
    'GraphQL',
    'Testing',
    'Docker',
    'AWS',
    'MongoDB',
  ];

  const certificationItems = [
    { text: 'Frontend Engineering — Example Institute' },
    { text: 'Cloud Fundamentals — Example Cloud' },
    { text: 'Accessibility — Inclusive Web Academy' },
    { text: 'Advanced React — Meta Professional' },
    { text: 'Full Stack Development — Coursera' },
  ];

  return (
    <section className="h-full flex items-center justify-center py-20 text-center">
      <div className="w-full px-4">
        <h2 className="sr-only">Highlights</h2>
        <div className="grid gap-8">
          <ItemCarousel
            items={blogItems}
            title="Blog"
            description="Articles about development, design, and learning notes."
            buttonText="View all posts"
            buttonHref="/blog"
          />

          <ItemCarousel
            items={projectItems}
            title="Projects"
            description="Selected projects showcasing frontend, full-stack and tooling work."
            buttonText="See projects"
            buttonHref="/project"
          />

          <div className="grid gap-8 grid-cols-2">
            <SkillsCarousel
              skills={skills}
              title="Skills"
              description="Core technologies and tools I use regularly."
              buttonText="View skills"
              buttonHref="#skills"
            />

            <CertificationsCarousel
              certifications={certificationItems}
              title="Certifications"
              description="Formal recognitions and completed courses."
              buttonText="View certificates"
              buttonHref="#certifications"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
