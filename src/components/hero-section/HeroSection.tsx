import Link from 'next/link';
import { Button } from '../ui/button';

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
          <Button variant="default" size="lg">
            <Link href="/blog">View Blog</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
