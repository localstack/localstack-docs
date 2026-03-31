#!/usr/bin/env node

/**
 * Syncs the `tags` frontmatter in service docs with the canonical
 * licensing data in src/data/licensing/current-plans.json.
 *
 * Usage:  node scripts/sync-licensing-tags.mjs [--dry-run]
 *
 * --dry-run   Print what would change without writing files.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

const JSON_PATH = join(ROOT, 'src/data/licensing/current-plans.json');
const SERVICES_DIR = join(ROOT, 'src/content/docs/aws/services');

const PLAN_HIERARCHY = ['Hobby', 'Base', 'Ultimate', 'Enterprise'];

const dryRun = process.argv.includes('--dry-run');

const licensingData = JSON.parse(readFileSync(JSON_PATH, 'utf-8'));

const serviceTagsMap = new Map();

for (const category of licensingData.categories) {
  for (const svc of category.services) {
    if (!svc.serviceId) continue;
    if (!serviceTagsMap.has(svc.serviceId)) {
      serviceTagsMap.set(svc.serviceId, new Set());
    }
    serviceTagsMap.get(svc.serviceId).add(svc.minimumPlan);
  }
}

function deriveTags(serviceId) {
  const plans = serviceTagsMap.get(serviceId);
  if (!plans) return null;
  return [...plans].sort(
    (a, b) => PLAN_HIERARCHY.indexOf(a) - PLAN_HIERARCHY.indexOf(b)
  );
}

const files = readdirSync(SERVICES_DIR).filter((f) => f.endsWith('.mdx'));

let updated = 0;
let skipped = 0;
let unchanged = 0;

for (const file of files) {
  const serviceId = file.replace('.mdx', '');

  if (serviceId === 'index') continue;

  const expectedTags = deriveTags(serviceId);

  if (!expectedTags) {
    skipped++;
    continue;
  }

  const filePath = join(SERVICES_DIR, file);
  const content = readFileSync(filePath, 'utf-8');

  const fmMatch = content.match(/^(---\n)([\s\S]*?\n)(---)/);
  if (!fmMatch) {
    console.warn(`  WARN: no frontmatter in ${file}, skipping`);
    skipped++;
    continue;
  }

  const fmOpen = fmMatch[1];
  const fmBody = fmMatch[2];
  const fmClose = fmMatch[3];
  const afterFm = content.slice(fmMatch[0].length);

  const tagsLine = `tags: [${expectedTags.map((t) => `"${t}"`).join(', ')}]`;

  const existingTagsMatch = fmBody.match(
    /^tags:\s*\[([^\]]*)\][^\S\n]*$/m
  );

  let newFmBody;

  if (existingTagsMatch) {
    const currentTags = existingTagsMatch[1]
      .split(',')
      .map((t) => t.trim().replace(/["']/g, ''))
      .filter(Boolean)
      .sort((a, b) => PLAN_HIERARCHY.indexOf(a) - PLAN_HIERARCHY.indexOf(b));

    if (
      currentTags.length === expectedTags.length &&
      currentTags.every((t, i) => t === expectedTags[i])
    ) {
      unchanged++;
      continue;
    }

    newFmBody = fmBody.replace(/^tags:\s*\[.*\][^\S\n]*$/m, tagsLine);
  } else {
    newFmBody = fmBody + tagsLine + '\n';
  }

  const newContent = fmOpen + newFmBody + fmClose + afterFm;

  if (dryRun) {
    const oldStr = existingTagsMatch
      ? existingTagsMatch[0].trim()
      : '(none)';
    console.log(`  WOULD UPDATE ${file}: ${oldStr} → ${tagsLine}`);
  } else {
    writeFileSync(filePath, newContent, 'utf-8');
    const oldStr = existingTagsMatch
      ? existingTagsMatch[0].trim()
      : '(none)';
    console.log(`  UPDATED ${file}: ${oldStr} → ${tagsLine}`);
  }
  updated++;
}

console.log(
  `\nDone${dryRun ? ' (dry run)' : ''}. Updated: ${updated}, Unchanged: ${unchanged}, Skipped (not in JSON): ${skipped}`
);
