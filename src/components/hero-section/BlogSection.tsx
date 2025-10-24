import React, { useState } from 'react';
import type { CarouselProps } from '@/types/HomePage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Sample data for testing
const sampleBlogData: CarouselProps = {
  title: 'Latest Blog Posts',
  description: 'Check out my recent articles and tutorials',
  buttonText: 'View All Posts',
  buttonHref: '/blog',
  items: [
    {
      text: 'Getting Started with React and TypeScript',
      href: '/blog/react-typescript',
    },
    {
      text: '10 Tips for Better Code Organization',
      href: '/blog/code-organization',
    },
    {
      text: 'Building Responsive Layouts with Tailwind CSS',
      href: '/blog/tailwind-layouts',
    },
    {
      text: 'Understanding React Hooks in Depth',
      href: '/blog/react-hooks',
    },
  ],
};

export default function BlogSection({
  items = sampleBlogData.items,
  title = sampleBlogData.title,
  description = sampleBlogData.description,
  buttonText = sampleBlogData.buttonText,
  buttonHref = sampleBlogData.buttonHref,
}: Partial<CarouselProps> = {}) {
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
    <div className="carousel bg-gray-800/60 p-6 rounded-lg text-left relative">
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
