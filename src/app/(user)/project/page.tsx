import { MainLayout } from '@/components/shared';
import Link from 'next/link';

export default function ProjectPage() {
  return (
    <MainLayout>
      <div className="col-span-full">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Projects
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          Here are some of the projects I've worked on, showcasing my skills and
          experience.
        </p>

        {/* Projects grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-64 bg-gradient-to-br from-green-500 to-blue-600"></div>
              <div className="p-6">
                <Link
                  href={`/project/${index + 1}`}
                  className="text-2xl font-semibold text-gray-900 dark:text-white mb-3"
                >
                  Project {index + 1}
                </Link>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  A comprehensive description of this project, including the
                  technologies used, challenges faced, and solutions
                  implemented.
                </p>

                {/* Tech stack tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {['React', 'TypeScript', 'Tailwind CSS', 'Next.js'].map(
                    tech => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                      >
                        {tech}
                      </span>
                    )
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex space-x-4">
                  <Link
                    href="#"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Live
                  </Link>
                  <Link
                    href="#"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    View Code
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
