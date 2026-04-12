#!/usr/bin/env node
/**
 * session-utils.mjs
 * Shared utilities for session JSONL discovery, parsing, and redaction.
 * Used by bookmark-transcript.mjs, writing-topic.mjs, and future capture scripts.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const PROJECTS_DIR = join(homedir(), '.claude', 'projects', 'C--Users-User-Documents-Claude-code');

/**
 * Find the most recent session JSONL file.
 * @param {object} opts
 * @param {number} opts.maxStaleMs - Max age in ms before considering stale (default: 5 min)
 * @returns {{ path: string, name: string, mtime: number }} The most recent session file
 * @throws If no session files found or most recent is stale
 */
export function findActiveSession({ maxStaleMs = 5 * 60 * 1000 } = {}) {
  if (!existsSync(PROJECTS_DIR)) {
    throw new Error(`Claude projects directory not found:\n  ${PROJECTS_DIR}`);
  }

  const jsonlFiles = readdirSync(PROJECTS_DIR)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => {
      const fullPath = join(PROJECTS_DIR, f);
      return { name: f, path: fullPath, mtime: statSync(fullPath).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);

  if (jsonlFiles.length === 0) {
    throw new Error('No session JSONL files found.');
  }

  const mostRecent = jsonlFiles[0];
  const msSinceModified = Date.now() - mostRecent.mtime;

  if (msSinceModified > maxStaleMs) {
    const mins = Math.round(msSinceModified / 60000);
    throw new Error(
      `Most recent session file was last modified ${mins} minute(s) ago.\n` +
      `  File: ${mostRecent.name}\n` +
      'Capturing from a stale session is almost always a mistake.'
    );
  }

  return mostRecent;
}

/**
 * Parse a session JSONL file into an array of event objects.
 * @param {string} filePath - Absolute path to the JSONL file
 * @returns {object[]} Parsed events
 */
export function parseSessionEvents(filePath) {
  const rawLines = readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
  const events = [];
  for (let i = 0; i < rawLines.length; i++) {
    try {
      events.push(JSON.parse(rawLines[i]));
    } catch {
      // Skip malformed lines silently
    }
  }
  return events;
}

/**
 * Check if an event is a real user turn (not system-injected).
 */
export function isRealUserTurn(ev) {
  if (ev.type !== 'user') return false;
  if (ev.isMeta === true) return false;

  const content = ev.message?.content;
  if (!content) return false;

  if (typeof content === 'string') {
    const trimmed = content.trim();
    if (
      trimmed.startsWith('<command-name>') ||
      trimmed.startsWith('<local-command-stdout>') ||
      trimmed.startsWith('<local-command-caveat>') ||
      trimmed.startsWith('<system-reminder>')
    ) return false;
    return trimmed.length > 0;
  }

  if (Array.isArray(content)) {
    return content.some(b => b.type === 'text' && b.text?.trim().length > 0);
  }

  return false;
}

/**
 * Extract text from a user turn event.
 */
export function extractUserText(ev) {
  const content = ev.message?.content;
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) {
    return content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim();
  }
  return '';
}

/**
 * Apply redaction to a string (secrets, paths, emails).
 */
export function redact(text) {
  // Windows absolute paths → ~/...
  text = text.replace(/C:\\Users\\User\\([^\s"'<>]+)/g, (_, r) => '~/' + r.replace(/\\/g, '/'));
  text = text.replace(/C:\/Users\/User\/([^\s"'<>]+)/g, '~/$1');
  text = text.replace(/\/c\/Users\/User\/([^\s"'<>]+)/g, '~/$1');
  // Email addresses
  text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[redacted-email]');
  // Common token prefixes
  text = text.replace(/sk-[a-zA-Z0-9_-]{20,}/g, '[REDACTED]');
  text = text.replace(/gh[ps]_[a-zA-Z0-9]{20,}/g, '[REDACTED]');
  text = text.replace(/Bearer\s+[a-zA-Z0-9._-]{20,}/g, 'Bearer [REDACTED]');
  return text;
}

/**
 * Get the session ID from parsed events.
 */
export function getSessionId(events) {
  return events.find(ev => ev.sessionId)?.sessionId || 'unknown';
}

/**
 * Extract recent user messages from a parsed session for context capture.
 * @param {object[]} events - Parsed session events
 * @param {number} count - Number of recent user messages to extract (default: 5)
 * @returns {string[]} Array of redacted user message first-sentences
 */
export function extractRecentUserContext(events, count = 5) {
  const userTurns = events.filter(isRealUserTurn);
  const recent = userTurns.slice(-count);
  return recent.map(ev => {
    const text = redact(extractUserText(ev));
    // Take first sentence or first 120 chars
    const firstSentence = text.split(/[.!?]\s/)[0];
    return firstSentence.length > 120 ? firstSentence.slice(0, 120) + '...' : firstSentence;
  }).filter(Boolean);
}
