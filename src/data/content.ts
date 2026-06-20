// src/data/content.ts
// Profile/About static content — update with real info before production

export const PROFILE = {
  name: 'Nhat Phan',
  handle: 'nhatphanhk102',
  title: 'Full-Stack Developer',
  tagline: 'Building modern web experiences with clean code and great UX.',
  bio: `I'm a passionate full-stack developer who loves creating elegant, 
    performant, and user-friendly web applications. With expertise across the 
    entire stack — from pixel-perfect UIs to scalable backend APIs — I bring 
    ideas to life with modern technology.`,
  bio2: `When I'm not coding, you'll find me exploring new technologies, contributing 
    to open-source projects, or sharing what I've learned through writing.`,
  location: 'Ho Chi Minh City, Vietnam',
  email: 'nhatphan@example.com',
  resumeUrl: '/resume.pdf',
  avatarUrl: '/avatar.jpg',
  socialLinks: [
    { platform: 'GitHub', url: 'https://github.com/nhatphanhk102', iconName: 'Github' },
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/nhatphanhk102', iconName: 'Linkedin' },
    { platform: 'Twitter', url: 'https://twitter.com/nhatphanhk102', iconName: 'Twitter' },
  ],
} as const;

export const EXPERIENCES = [
  {
    id: '1',
    company: 'Tech Startup XYZ',
    position: 'Senior Full-Stack Developer',
    description:
      'Led development of a SaaS platform serving 10,000+ users. Built React frontend and Node.js microservices, reducing load time by 40%.',
    startDate: '2023-01-01',
    endDate: null,
    isCurrent: true,
    logoUrl: null,
  },
  {
    id: '2',
    company: 'Digital Agency ABC',
    position: 'Frontend Developer',
    description:
      'Developed responsive web applications for 15+ clients using React and Next.js. Implemented design systems that improved team velocity by 30%.',
    startDate: '2021-06-01',
    endDate: '2022-12-31',
    isCurrent: false,
    logoUrl: null,
  },
  {
    id: '3',
    company: 'Freelance',
    position: 'Web Developer',
    description:
      'Built custom websites and web apps for small businesses. Delivered 20+ projects on time and within budget.',
    startDate: '2020-01-01',
    endDate: '2021-05-31',
    isCurrent: false,
    logoUrl: null,
  },
] as const;

export const EDUCATION = [
  {
    id: '1',
    institution: 'University of Technology',
    degree: 'Bachelor of Science in Computer Science',
    startDate: '2016-09-01',
    endDate: '2020-06-01',
    description: 'Focus on Software Engineering and Web Technologies.',
  },
] as const;
