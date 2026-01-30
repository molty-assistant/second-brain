import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'content');

export interface Document {
  slug: string;
  title: string;
  date: string;
  category: 'documents' | 'journal';
  tags?: string[];
  excerpt?: string;
  content?: string;
  htmlContent?: string;
}

export interface DocumentMeta {
  slug: string;
  title: string;
  date: string;
  category: 'documents' | 'journal';
  tags?: string[];
  excerpt?: string;
}

function getFilesRecursively(dir: string, category: 'documents' | 'journal'): DocumentMeta[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  
  const files = fs.readdirSync(dir);
  const documents: DocumentMeta[] = [];
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      documents.push(...getFilesRecursively(filePath, category));
    } else if (file.endsWith('.md')) {
      const slug = file.replace(/\.md$/, '');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      
      // Extract first paragraph as excerpt
      const excerpt = content.split('\n\n')[0]?.substring(0, 200) || '';
      
      documents.push({
        slug: `${category}/${slug}`,
        title: data.title || slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
        date: data.date || stat.mtime.toISOString().split('T')[0],
        category,
        tags: data.tags || [],
        excerpt: excerpt.replace(/[#*_`]/g, '').trim(),
      });
    }
  }
  
  return documents;
}

export function getAllDocuments(): DocumentMeta[] {
  const documents = getFilesRecursively(path.join(contentDirectory, 'documents'), 'documents');
  const journal = getFilesRecursively(path.join(contentDirectory, 'journal'), 'journal');
  
  return [...documents, ...journal].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getDocumentsByCategory(category: 'documents' | 'journal'): DocumentMeta[] {
  return getFilesRecursively(path.join(contentDirectory, category), category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getDocument(slug: string): Promise<Document | null> {
  const [category, ...rest] = slug.split('/');
  const fileName = rest.join('/');
  const filePath = path.join(contentDirectory, category, `${fileName}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  
  const processedContent = await remark()
    .use(html, { sanitize: false })
    .process(content);
  
  const stat = fs.statSync(filePath);
  
  return {
    slug,
    title: data.title || fileName.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
    date: data.date || stat.mtime.toISOString().split('T')[0],
    category: category as 'documents' | 'journal',
    tags: data.tags || [],
    content,
    htmlContent: processedContent.toString(),
  };
}

export function searchDocuments(query: string): DocumentMeta[] {
  const allDocs = getAllDocuments();
  const lowerQuery = query.toLowerCase();
  
  return allDocs.filter(doc => 
    doc.title.toLowerCase().includes(lowerQuery) ||
    doc.excerpt?.toLowerCase().includes(lowerQuery) ||
    doc.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
