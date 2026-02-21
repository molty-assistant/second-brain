import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export interface ReportMeta {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
}

export interface Report extends ReportMeta {
  content: string;
  htmlContent: string;
}

function getReportsDir(): string {
  // Deploys can set this to wherever reports are persisted.
  // Locally, default to the OpenClaw workspace structure.
  return (
    process.env.MISSION_CONTROL_REPORTS_DIR ||
    path.resolve(process.cwd(), '..', 'memory', 'reports')
  );
}

function safeTitleFromSlug(slug: string) {
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function dateFromSlugOrStat(slug: string, stat: fs.Stats): string {
  // Common format: YYYY-MM-DD-nightly
  const m = slug.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m?.[1]) return m[1];
  return stat.mtime.toISOString().slice(0, 10);
}

export function getAllReports(): ReportMeta[] {
  const reportsDir = getReportsDir();
  if (!fs.existsSync(reportsDir)) return [];

  const files = fs
    .readdirSync(reportsDir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(reportsDir, file);
      const stat = fs.statSync(filePath);
      const slug = file.replace(/\.md$/, '');
      const raw = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(raw);
      const excerpt = content.split('\n\n')[0]?.slice(0, 220) || '';

      const title =
        (typeof data.title === 'string' && data.title) ||
        safeTitleFromSlug(slug);

      return {
        slug,
        title,
        date: dateFromSlugOrStat(slug, stat),
        excerpt: excerpt.replace(/[#*_`]/g, '').trim(),
      } satisfies ReportMeta;
    });

  return files.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getReport(slug: string): Promise<Report | null> {
  const reportsDir = getReportsDir();
  const filePath = path.join(reportsDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const stat = fs.statSync(filePath);
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  const processed = await remark().use(html, { sanitize: false }).process(content);

  const title =
    (typeof data.title === 'string' && data.title) || safeTitleFromSlug(slug);

  return {
    slug,
    title,
    date: dateFromSlugOrStat(slug, stat),
    excerpt: undefined,
    content,
    htmlContent: processed.toString(),
  };
}
