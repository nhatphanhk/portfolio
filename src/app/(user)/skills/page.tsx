import { MainLayout } from '@/components/shared';
import { Code2, Palette, Database, Zap, Brain, Rocket } from 'lucide-react';

export default function SkillsPage() {
  const skills = [
    {
      icon: Code2,
      title: 'Web Development',
      description:
        'Building responsive and performant web applications with modern frameworks',
      level: 95,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Palette,
      title: 'UI/UX Design',
      description: 'Creating intuitive and visually appealing user interfaces',
      level: 88,
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Database,
      title: 'Database Design',
      description: 'Architecting scalable and efficient database solutions',
      level: 90,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Performance',
      description: 'Optimizing applications for speed and efficiency',
      level: 85,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Brain,
      title: 'Problem Solving',
      description:
        'Analyzing complex challenges and delivering elegant solutions',
      level: 92,
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Rocket,
      title: 'DevOps',
      description: 'Deploying and maintaining production systems',
      level: 82,
      color: 'from-teal-500 to-blue-500',
    },
  ];
  return (
    <MainLayout>
      <div className="col-span-full py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold  mb-4 tracking-tight">
            Skills & Expertise
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <p className="text-xl text-slate-600 max-w-2xl">
              A showcase of technical proficiencies and professional
              capabilities
            </p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 shadow-sm">
              {skills.length} skills
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-stretch">
          {skills.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <div
                key={index}
                role="article"
                tabIndex={0}
                className="group bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 h-full flex flex-col"
              >
                <div className="flex flex-col items-center justify-between mb-4 gap-y-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${skill.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                    aria-hidden="true"
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-base sm:text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 leading-tight">
                    {skill.title}
                  </h3>
                  <span className="inlin</div>e-flex items-center px-3 rounded-full text-xs font-medium bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 shadow-sm">
                    {skill.level}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
