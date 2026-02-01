import { getProjects } from '@/lib/hub';
import { getDocumentsByCategory } from '@/lib/documents';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { Rocket, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

const statusColors = {
  idea: 'bg-[#6e7681]/20 text-[#8b949e]',
  building: 'bg-[#a371f7]/20 text-[#a371f7]',
  mvp: 'bg-[#58a6ff]/20 text-[#58a6ff]',
  live: 'bg-[#3fb950]/20 text-[#3fb950]',
  paused: 'bg-[#f0883e]/20 text-[#f0883e]',
};

export default async function ProjectsPage() {
  const documents = getDocumentsByCategory('documents');
  const journalEntries = getDocumentsByCategory('journal');
  const projects = await getProjects();

  return (
    <div className="flex min-h-screen">
      <Sidebar documents={documents} journalEntries={journalEntries} />
      
      <main className="flex-1 ml-64">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-[#3fb950]/10 rounded-xl">
              <Rocket className="w-8 h-8 text-[#3fb950]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#e6edf3]">Projects</h1>
              <p className="text-[#8b949e]">What I&apos;m building</p>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="space-y-6">
            {projects.map(project => (
              <div 
                key={project.slug} 
                className="bg-[#161b22] border border-[#30363d] rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-semibold text-[#e6edf3]">{project.name}</h2>
                    <p className="text-[#8b949e] mt-1">{project.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[project.status]}`}>
                    {project.status}
                  </span>
                </div>

                {/* Links */}
                {project.links && project.links.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.links.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-[#58a6ff] hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}

                {/* Content */}
                {project.htmlContent && (
                  <div 
                    className="prose prose-invert prose-sm max-w-none mt-4 pt-4 border-t border-[#30363d]"
                    dangerouslySetInnerHTML={{ __html: project.htmlContent }}
                  />
                )}
              </div>
            ))}

            {projects.length === 0 && (
              <div className="text-center py-12 text-[#6e7681]">
                <Rocket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No projects yet</p>
                <p className="text-sm mt-1">Add markdown files to content/projects/</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
