import { Button } from '../ui/button';

export function AboutSection() {
  return (
    <section className="h-full flex items-center justify-center py-20 text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Hi, I'm [Your Name]
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          Full Stack Developer & Designer
        </p>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          I create beautiful, functional web applications using modern
          technologies. Passionate about clean code, user experience, and
          solving complex problems.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="default">View My Work</Button>
          <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Contact Me
          </button>
        </div>
      </div>
    </section>
  );
}
