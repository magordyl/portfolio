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

export const collections = { projects, writing, log };
