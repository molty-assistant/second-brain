import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const contentDirectory = path.join(process.cwd(), 'content');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, content, tags, frontmatter } = body;

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const dir = path.join(contentDirectory, category);
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${slug}.md`);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Document already exists' }, { status: 409 });
    }

    // Build frontmatter
    const fm: Record<string, unknown> = {
      title,
      date: new Date().toISOString().split('T')[0],
      ...frontmatter,
    };

    if (tags && tags.length > 0) {
      fm.tags = tags;
    }

    // Create markdown content
    const fmLines = Object.entries(fm)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n${value.map(v => `  - ${v}`).join('\n')}`;
        }
        return `${key}: "${value}"`;
      })
      .join('\n');

    const markdown = `---
${fmLines}
---

${content || ''}
`;

    fs.writeFileSync(filePath, markdown, 'utf8');

    return NextResponse.json({ 
      success: true, 
      slug: `${category}/${slug}`,
      path: filePath 
    });

  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
