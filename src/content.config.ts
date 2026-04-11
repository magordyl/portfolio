import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tldr: z.string().max(120),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    live: z.url().optional(),
    hero: z.string().optional(),
    summary: z.string().max(240),
    weight: z.number().default(0),
    featured: z.boolean().default(false),
    depth: z.enum(['full', 'lightweight']).default('full'),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    summary: z.string().max(240),
    related_projects: z.array(reference('projects')).default([]),
  }),
});

const log = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/log' }),
  schema: z.object({
    title: z.string().max(80),
    date: z.coerce.date(),
    summary: z.string().max(160),
    related_project: reference('projects').optional(),
    related_writing: reference('writing').optional(),
  }),
});

const transcripts = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/transcripts' }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    date: z.coerce.date(),
    project: reference('projects').optional(),
    context: z.string(),
    note: z.string().default(''),
    sourceSessionId: z.string(),
    turns: z.array(
      z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string(),
        collapsedTools: z.array(z.string()).optional(),
      })
    ).min(2).max(8),
  }),
});

export const collections = { projects, writing, log, transcripts };
