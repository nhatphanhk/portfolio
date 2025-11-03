import { MainLayout } from '@/components/shared';
import { Link } from 'lucide-react';

export default function NotFound() {
  return (
    <MainLayout>
      <div className="col-span-full">
        <div className="py-20 text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
            Blog Post Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            The blog post you're looking for doesn't exist or may have been
            moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/blog"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Blog
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
