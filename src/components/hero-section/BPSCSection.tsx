import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { getPublicProjects } from '@/lib/actions/project';
import type { getPublicBlogs } from '@/lib/actions/blog';
import type { getPublicCertifications } from '@/lib/actions/certification';

/**
 * Blog / Projects / Skills / Certifications preview section on the homepage.
 * Displays recent work with links to full list pages.
 */
interface BPSCSectionProps {
  projects: Awaited<ReturnType<typeof getPublicProjects>>;
  blogs: Awaited<ReturnType<typeof getPublicBlogs>>;
  certs: Awaited<ReturnType<typeof getPublicCertifications>>;
}

export function BPSCSection({ projects, blogs, certs }: BPSCSectionProps) {
  const featuredProjects = projects.filter(p => p.featured);
  const recentPosts = blogs.slice(0, 3);
  const certifications = certs.filter(c => c.status === 'ACTIVE').slice(0, 3);

  return (
    <section id="highlights" className="py-24">
      <div className="max-w-5xl mx-auto px-6 space-y-20">
        {/* Featured Projects */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-1">
                Work
              </p>
              <h2 className="text-2xl font-bold text-foreground">Featured Projects</h2>
            </div>
            <Link
              href="/project"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              All projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {featuredProjects.map(project => (
              <Link
                key={project.id}
                href={`/project/${project.slug}`}
                className="group block p-6 rounded-xl border border-border bg-card hover:border-foreground/30 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies?.slice(0, 4).map((tech: string) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs bg-muted rounded text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 4 && (
                    <span className="px-2 py-0.5 text-xs bg-muted rounded text-muted-foreground">
                      +{project.technologies.length - 4}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Blog Posts */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-1">
                Writing
              </p>
              <h2 className="text-2xl font-bold text-foreground">Recent Posts</h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              All posts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {recentPosts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex items-start justify-between py-5 hover:bg-muted/30 -mx-4 px-4 rounded-lg transition-colors"
              >
                <div className="flex-1 min-w-0 mr-8">
                  <h3 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors truncate">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        </div>

        {/* Certifications preview */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-1">
                Credentials
              </p>
              <h2 className="text-2xl font-bold text-foreground">Certifications</h2>
            </div>
            <Link
              href="/certifications"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              All certs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {certifications.map(cert => (
              <div
                key={cert.id}
                className="p-5 rounded-xl border border-border bg-card"
              >
                <p className="font-semibold text-foreground text-sm mb-1 line-clamp-2">
                  {cert.name}
                </p>
                <p className="text-xs text-muted-foreground mb-3">{cert.issuer}</p>
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Verify →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
