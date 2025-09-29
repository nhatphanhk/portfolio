import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="h-full flex items-center justify-center py-20 text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to My Portfolio
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          A passionate full-stack developer
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/blog"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Blog
          </Link>
          <Link
            href="/project"
            className="px-6 py-3 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            View Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
