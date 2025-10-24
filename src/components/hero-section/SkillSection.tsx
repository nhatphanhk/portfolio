import React, { useState } from 'react';
import type { SkillsCarouselProps, SkillIcon } from '@/types/HomePage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SkillSection({
    skills = [],
    title = "Skills",
    description = "Technologies I work with",
    buttonText = "View All",
    buttonHref = "#",
}: Partial<SkillsCarouselProps> = {}) {
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
