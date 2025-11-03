'use client';

import React, { useEffect, useState } from 'react';
import {
  Download,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
} from 'lucide-react';
import MainLayout from '@/components/MainLayout';

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const experiences = [
    {
      title: 'Full Stack Developer',
      company: 'Fpt Software',
      period: '2023 - Present',
      description:
        'Develop full-stack web applications using modern technologies including React, Next.js, Node.js, and various databases. Focus on creating scalable and user-friendly solutions.',
      achievements: [
        'Built multiple responsive web applications',
        'Implemented secure authentication systems',
        'Optimized database performance and queries',
      ],
    },
    {
      title: 'Web Developer',
      company: 'Fpt Software',
      period: '2022 - 2023',
      description:
        'Worked on diverse web development projects, gaining experience in both frontend and backend technologies.',
      achievements: [
        'Developed e-commerce platforms',
        'Created RESTful APIs',
        'Implemented responsive designs',
      ],
    },
    {
      title: 'Web Developer',
      company: 'Fpt Software',
      period: '2022 - 2023',
      description:
        'Worked on diverse web development projects, gaining experience in both frontend and backend technologies.',
      achievements: [
        'Developed e-commerce platforms',
        'Created RESTful APIs',
        'Implemented responsive designs',
      ],
    },
  ];

  const education = [
    {
      degree: 'Bachelor of Engineering (BEng)',
      school: 'University of Technology',
      period: '2020 - 2024',
      achievements: [
        'Software Engineering Focus',
        'Web Development Specialization',
        'Database Management Systems',
      ],
    },
  ];
  return (
    <MainLayout>
      <div className="lg:col-span-12 py-8 grid gap-8">
        {/* Hero Section */}
        <div className="">
          <header
            className={`bg-white shadow-lg rounded-2xl transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}
          >
            <div className="px-6 py-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                  PN
                </div>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                    Phan Hoang Nhat
                  </h1>
                  <h2 className="text-xl md:text-2xl text-blue-600 mb-4">
                    Full Stack Developer
                  </h2>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-300 shadow-lg hover:shadow-xl">
                  <Download size={20} />
                  Download Resume
                </button>
              </div>
            </div>
          </header>
        </div>

        {/* Content Grid */}
        <div className=" space-y-8 bg-white rounded-2xl shadow-lg p-8">
          {/* About Section */}
          <section
            className={`transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Award className="text-blue-600" />
              Summary
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Web Developer with more than 1 years of experience building
              modern, responsive, and user friendly web applications. Skilled in
              React.js, Vue.js, and Next.js, with expertise in UI/UX
              implementation, animations (GSAP, Three.js), and component-based
              design using Tailwind CSS and Shadcn. applications and designing
              efficient database systems.
            </p>
          </section>

          {/* Education Section */}
          <section
            className={`transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <GraduationCap className="text-blue-600" />
              Education
            </h2>
            {education.map((edu, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {edu.degree}
                  </h3>
                  <div className="flex items-center gap-2 text-blue-600 font-medium">
                    <Calendar size={16} />
                    {edu.period}
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-blue-600 mb-4">
                  {edu.school}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {edu.achievements.map((achievement, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Experience Section */}
          <section
            className={`transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Briefcase className="text-blue-600" />
              Work Experience
            </h2>
            <div className="space-y-8">
              {experiences
                .reduce((acc: any[], exp) => {
                  const existingCompanyIndex = acc.findIndex(
                    item => item.company === exp.company
                  );

                  if (existingCompanyIndex !== -1) {
                    acc[existingCompanyIndex].positions.push({
                      title: exp.title,
                      period: exp.period,
                      description: exp.description,
                      achievements: exp.achievements,
                    });
                  } else {
                    acc.push({
                      company: exp.company,
                      positions: [
                        {
                          title: exp.title,
                          period: exp.period,
                          description: exp.description,
                          achievements: exp.achievements,
                        },
                      ],
                    });
                  }
                  return acc;
                }, [])
                .map((companyGroup, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-300"
                  >
                    <h4 className="text-xl font-bold text-blue-600 mb-6">
                      {companyGroup.company}
                    </h4>
                    <div className="space-y-6">
                      {companyGroup.positions.map(
                        (position: any, posIndex: number) => (
                          <div key={posIndex} className="relative">
                            {posIndex > 0 && (
                              <div className="border-t border-gray-300 mb-6"></div>
                            )}
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                              <h3 className="text-lg font-bold text-gray-900">
                                {position.title}
                              </h3>
                              <div className="flex items-center gap-2 text-blue-600 font-medium">
                                <Calendar size={16} />
                                {position.period}
                              </div>
                            </div>
                            <p className="text-gray-700 mb-4">
                              {position.description}
                            </p>
                            <div className="space-y-1">
                              <h5 className="font-semibold text-gray-800 mb-2">
                                Key Achievements:
                              </h5>
                              {position.achievements.map(
                                (achievement: string, i: number) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-2"
                                  >
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-gray-700">
                                      {achievement}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
