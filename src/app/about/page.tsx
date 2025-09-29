'use client';

import React, { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  Linkedin,
  Github,
  Download,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  Palette,
  Database,
  Globe,
} from 'lucide-react';
import MainLayout from '@/components/MainLayout';

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const skills = [
    { name: 'JavaScript/TypeScript', level: 90, icon: Code2 },
    { name: 'React & Next.js', level: 85, icon: Code2 },
    { name: 'UI/UX Design', level: 80, icon: Palette },
    { name: 'Node.js & APIs', level: 75, icon: Database },
    { name: 'Cloud Platforms', level: 70, icon: Globe },
  ];

  const experiences = [
    {
      title: 'Senior Frontend Developer',
      company: 'Tech Innovations Inc.',
      period: '2022 - Present',
      description:
        'Lead development of scalable React applications, mentor junior developers, and collaborate with design teams to create exceptional user experiences.',
      achievements: [
        'Improved application performance by 40%',
        'Led migration to TypeScript',
        'Mentored 5 junior developers',
      ],
    },
    {
      title: 'Full Stack Developer',
      company: 'Digital Solutions Ltd.',
      period: '2020 - 2022',
      description:
        'Developed end-to-end web applications using modern technologies, implemented REST APIs, and optimized database performance.',
      achievements: [
        'Built 15+ production applications',
        'Reduced server response time by 60%',
        'Implemented automated testing pipeline',
      ],
    },
    {
      title: 'Frontend Developer',
      company: 'StartupXYZ',
      period: '2019 - 2020',
      description:
        'Created responsive web interfaces, collaborated in agile environment, and contributed to product design decisions.',
      achievements: [
        'Developed responsive design system',
        'Increased user engagement by 25%',
        'Led frontend architecture decisions',
      ],
    },
  ];

  const education = [
    {
      degree: 'Bachelor of Computer Science',
      school: 'University of Technology',
      period: '2015 - 2019',
      achievements: [
        'Magna Cum Laude',
        "Dean's List 4 semesters",
        'Computer Science Excellence Award',
      ],
    },
  ];
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="lg:col-span-12 py-8">
        <header
          className={`bg-white shadow-lg rounded-2xl transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}
        >
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                JS
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  John Smith
                </h1>
                <h2 className="text-xl md:text-2xl text-blue-600 mb-4">
                  Senior Frontend Developer
                </h2>
                <p className="text-gray-600 max-w-2xl">
                  Passionate developer with 5+ years of experience creating
                  exceptional digital experiences. Specialized in React,
                  TypeScript, and modern web technologies.
                </p>
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
      <div className="lg:col-span-12 space-y-8">
        {/* About Section */}
        <section
          className={`transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Award className="text-blue-600" />
              About Me
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              I'm a passionate frontend developer with a strong background in
              creating intuitive and performant web applications. My expertise
              lies in translating complex designs into clean, efficient code
              while maintaining excellent user experience standards.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              When I'm not coding, you'll find me exploring new technologies,
              contributing to open-source projects, or sharing knowledge through
              technical writing and mentoring.
            </p>
          </div>
        </section>

        {/* Skills Section */}
        <section
          className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Code2 className="text-blue-600" />
              Skills & Technologies
            </h2>
            <div className="grid gap-6">
              {skills.map((skill, index) => {
                const Icon = skill.icon;
                return (
                  <div key={skill.name} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Icon
                          className="text-blue-600 group-hover:text-blue-700 transition-colors"
                          size={20}
                        />
                        <span className="font-semibold text-gray-800">
                          {skill.name}
                        </span>
                      </div>
                      <span className="text-gray-600 font-medium">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: isVisible ? `${skill.level}%` : '0%',
                          transitionDelay: `${400 + index * 100}ms`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section
          className={`transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Briefcase className="text-blue-600" />
              Work Experience
            </h2>
            <div className="space-y-8">
              {experiences.map((exp, index) => (
                <div
                  key={index}
                  className="relative pl-8 border-l-4 border-blue-200 hover:border-blue-400 transition-colors duration-300"
                >
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {exp.title}
                      </h3>
                      <div className="flex items-center gap-2 text-blue-600 font-medium">
                        <Calendar size={16} />
                        {exp.period}
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-blue-600 mb-3">
                      {exp.company}
                    </h4>
                    <p className="text-gray-700 mb-4">{exp.description}</p>
                    <div className="space-y-1">
                      <h5 className="font-semibold text-gray-800 mb-2">
                        Key Achievements:
                      </h5>
                      {exp.achievements.map((achievement, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section
          className={`transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
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
          </div>
        </section>

        {/* Contact Section */}
        <section
          className={`transition-all duration-1000 delay-600 py-8 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Let's Connect
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <a
                href="mailto:john.smith@email.com"
                className="flex items-center gap-3 hover:bg-white/10 p-4 rounded-lg transition-colors duration-300"
              >
                <Mail className="text-blue-200" size={24} />
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-blue-200">john.smith@email.com</div>
                </div>
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-3 hover:bg-white/10 p-4 rounded-lg transition-colors duration-300"
              >
                <Phone className="text-blue-200" size={24} />
                <div>
                  <div className="font-semibold">Phone</div>
                  <div className="text-blue-200">+1 (234) 567-8900</div>
                </div>
              </a>
              <a
                href="https://linkedin.com/in/johnsmith"
                className="flex items-center gap-3 hover:bg-white/10 p-4 rounded-lg transition-colors duration-300"
              >
                <Linkedin className="text-blue-200" size={24} />
                <div>
                  <div className="font-semibold">LinkedIn</div>
                  <div className="text-blue-200">linkedin.com/in/johnsmith</div>
                </div>
              </a>
              <a
                href="https://github.com/johnsmith"
                className="flex items-center gap-3 hover:bg-white/10 p-4 rounded-lg transition-colors duration-300"
              >
                <Github className="text-blue-200" size={24} />
                <div>
                  <div className="font-semibold">GitHub</div>
                  <div className="text-blue-200">github.com/johnsmith</div>
                </div>
              </a>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
