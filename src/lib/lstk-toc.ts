import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import GithubSlugger from 'github-slugger';

/**
 * Pages that compose their content from shared .mdx components (see src/components/lstk/)
 * don't get those components' headings picked up by Starlight's own per-file heading
 * extraction, since it only looks at the page's own compiled AST. This walks a page's raw
 * source, follows `<Component />` usages back to their imported .mdx file, and stitches
 * their headings back into the flat list in document order so the right-hand nav is accurate.
 */

const SRC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const IMPORT_RE = /^import\s+(\w+)\s+from\s+['"](@\/components\/[\w./-]+\.mdx)['"];?\s*$/;
const USAGE_RE = /^<([A-Z]\w*)(?:\s[^>]*)?\/>\s*$/;
const FENCE_RE = /^\s*(```|~~~)/;
const HEADING_RE = /^(#{1,6})\s+(.+?)\s*$/;

export interface FlatHeading {
  depth: number;
  slug: string;
  text: string;
}

function cleanHeadingText(raw: string): string {
  return raw
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/_([^_]*)_/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim();
}

function resolveAliasPath(aliasPath: string): string {
  return resolve(SRC_DIR, aliasPath.replace(/^@\//, ''));
}

/** Extract just the headings from a source file, in order, with no import/usage resolution. */
function extractHeadings(source: string): { depth: number; text: string }[] {
  const headings: { depth: number; text: string }[] = [];
  let inFence = false;
  for (const line of source.split('\n')) {
    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = HEADING_RE.exec(line);
    if (match) headings.push({ depth: match[1].length, text: cleanHeadingText(match[2]) });
  }
  return headings;
}

/** Extract headings and component usages from a top-level page, resolving usages by line order. */
function extractPageEvents(source: string) {
  type Event =
    | { line: number; type: 'heading'; depth: number; text: string }
    | { line: number; type: 'usage'; path: string };

  const events: Event[] = [];
  const importMap = new Map<string, string>();
  let inFence = false;

  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const headingMatch = HEADING_RE.exec(line);
    if (headingMatch) {
      events.push({ line: i, type: 'heading', depth: headingMatch[1].length, text: cleanHeadingText(headingMatch[2]) });
      continue;
    }

    const importMatch = IMPORT_RE.exec(line);
    if (importMatch) {
      importMap.set(importMatch[1], importMatch[2]);
      continue;
    }

    const usageMatch = USAGE_RE.exec(line);
    if (usageMatch && importMap.has(usageMatch[1])) {
      events.push({ line: i, type: 'usage', path: importMap.get(usageMatch[1])! });
    }
  }

  return events;
}

/**
 * Build the flat, ordered heading list for a page that may import shared .mdx components,
 * slugging each file's headings independently (a fresh Slugger per file) to match how Astro
 * compiles and slugs each .mdx file on its own.
 */
export function buildFlatHeadings(pageFilePath: string): FlatHeading[] {
  const pageSource = readFileSync(pageFilePath, 'utf-8');
  const events = extractPageEvents(pageSource);

  const flat: FlatHeading[] = [];
  const pageSlugger = new GithubSlugger();

  for (const event of events) {
    if (event.type === 'heading') {
      flat.push({ depth: event.depth, text: event.text, slug: pageSlugger.slug(event.text) });
    } else {
      const componentPath = resolveAliasPath(event.path);
      let componentSource: string;
      try {
        componentSource = readFileSync(componentPath, 'utf-8');
      } catch {
        continue;
      }
      const componentSlugger = new GithubSlugger();
      for (const heading of extractHeadings(componentSource)) {
        flat.push({ depth: heading.depth, text: heading.text, slug: componentSlugger.slug(heading.text) });
      }
    }
  }

  return flat;
}

/** Mirrors Starlight's own generateToC() nesting algorithm (@astrojs/starlight/utils/generateToC). */
export function injectHeadingsIntoToc(
  tocItems: { depth: number; slug: string; text: string; children: unknown[] }[],
  headings: FlatHeading[],
  { minHeadingLevel, maxHeadingLevel }: { minHeadingLevel: number; maxHeadingLevel: number }
) {
  function injectChild(items: any[], item: any): void {
    const lastItem = items.at(-1);
    if (!lastItem || lastItem.depth >= item.depth) {
      items.push(item);
    } else {
      injectChild(lastItem.children, item);
    }
  }

  for (const heading of headings) {
    if (heading.depth < minHeadingLevel || heading.depth > maxHeadingLevel) continue;
    injectChild(tocItems, { ...heading, children: [] });
  }
}
