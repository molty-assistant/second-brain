---
title: Use Next.js for Second Brain
date: 2025-01-30
status: decided
context: Need a framework for the second brain web app that supports both static content and dynamic features
decision: Use Next.js with App Router and file-based content storage
consequences:
  - Fast development with familiar React patterns
  - Good SEO with server rendering
  - Easy deployment to Vercel
  - Content lives as markdown files in git
---

## Context

We needed to choose a framework for building the Second Brain application. Requirements included:
- Fast page loads
- Markdown content support
- Easy to extend with dynamic features
- Good developer experience

## Decision

We chose Next.js 15 with the App Router because:
1. Server components for fast initial loads
2. Built-in markdown processing support
3. Familiar React patterns
4. Excellent ecosystem

## Consequences

- Learning curve for App Router patterns
- All content stored as markdown files
- Easy git-based version control for content
