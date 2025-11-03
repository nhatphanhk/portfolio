'use client';

import type { CarouselProps } from '@/types/HomePage';
import { ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '../ui/button';

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

export default function CertificationSection({
  items = sampleBlogData.items,
  title = sampleBlogData.title,
  description = sampleBlogData.description,
  buttonText = sampleBlogData.buttonText,
  buttonHref = sampleBlogData.buttonHref,
}: Partial<CarouselProps> = {}) {
  return (
    <section className="w-full md:px-6 lg:px-8 bg-background rounded-2xl">
      <div className="max-w-6xl grid grid-cols-2 mx-auto mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">
            {title}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
            {description}
          </p>
        </div>
        <div className="flex justify-end items-center">
          <Button variant="link" size="sm">
            {buttonText}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {items.map((item, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <div className="bg-card border border-border rounded-lg p-6 md:p-8 h-full hover:shadow-lg hover:border-primary/50 transition-all duration-300 group">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="inline-block mb-4 px-3 py-1 bg-primary/10 rounded-full">
                          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                            Article
                          </span>
                        </div>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="block text-xl md:text-2xl font-bold text-foreground mb-4 hover:text-primary transition-colors duration-200 line-clamp-3"
                          >
                            {item.text}
                          </a>
                        ) : (
                          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4 line-clamp-3">
                            {item.text}
                          </h3>
                        )}
                        <p className="text-sm text-muted-foreground mb-6">
                          Explore insights and best practices in web development
                        </p>
                      </div>

                      {item.href && (
                        <a
                          href={item.href}
                          className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-200 group/link"
                        >
                          Read More
                          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
