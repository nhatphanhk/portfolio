import { Button } from '../ui/button';

export function AboutSection() {
  return (
    <section className="h-full py-20 text-center grid-cols-1 md:grid-cols-2 gap-8 grid">
      <div className="mx-auto px-4 flex flex-col items-center justify-center">
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
          <Button variant="default" size="lg">
            View My Work
          </Button>
          <Button variant="outline" size="lg">
            Contact Me
          </Button>
        </div>
      </div>
      <div className="mx-auto px-4 flex flex-col items-center"></div>
    </section>
  );
}
