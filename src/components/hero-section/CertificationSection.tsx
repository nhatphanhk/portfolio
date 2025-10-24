import React, { useState } from 'react';
import type {
  CertificationsCarouselProps,
  CertificationIcon,
} from '@/types/HomePage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Sample data for CertificationSection
const sampleCertificationData: CertificationsCarouselProps = {
  certifications: [
    { text: 'Frontend Engineering — Example Institute' },
    { text: 'Cloud Fundamentals — Example Cloud' },
    { text: 'Accessibility — Inclusive Web Academy' },
    { text: 'Advanced React — Meta Professional' },
    { text: 'Full Stack Development — Coursera' },
  ],
  title: 'Certifications & Training',
  description: 'Professional certifications and courses completed',
  buttonText: 'View All Certifications',
  buttonHref: '/certifications',
};

export default function CertificationSection({
  certifications = sampleCertificationData.certifications,
  title = sampleCertificationData.title,
  description = sampleCertificationData.description,
  buttonText = sampleCertificationData.buttonText,
  buttonHref = sampleCertificationData.buttonHref,
}: Partial<CertificationsCarouselProps> = {}) {
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
    <div className="carousel bg-gray-800/60 p-6 rounded-lg text-left relative">
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
