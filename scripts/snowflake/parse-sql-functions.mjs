#!/usr/bin/env node
/**
 * Script to parse the Snowflake SQL functions markdown table and generate:
 * 1. JSON data file for the React component
 * 2. MDX file that uses the React component
 * 
 * This is run as part of the update-snowflake-feature-coverage workflow.
 * 
 * Usage: node scripts/snowflake/parse-sql-functions.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');

const INPUT_FILE = join(rootDir, 'src/content/docs/snowflake/sql-functions.md');
const OUTPUT_JSON = join(rootDir, 'public/data/snowflake/sql-functions.json');
const OUTPUT_MDX = join(rootDir, 'src/content/docs/snowflake/sql-functions.mdx');

function parseMarkdownTable(content) {
  const lines = content.split('\n');
  const functions = [];
  
  let inTable = false;
  let headerPassed = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      if (trimmedLine.includes('----')) {
        headerPassed = true;
        continue;
      }
      
      if (!inTable && trimmedLine.toLowerCase().includes('function') && trimmedLine.toLowerCase().includes('supported')) {
        inTable = true;
        continue;
      }
      
      if (inTable && headerPassed) {
        const cells = trimmedLine
          .split('|')
          .map(cell => cell.trim())
          .filter(cell => cell !== '');
        
        if (cells.length >= 2) {
          const functionName = cells[0];
          const supportedValue = cells[1];
          const supported = supportedValue === '✅';
          
          functions.push({
            name: functionName,
            supported: supported
          });
        }
      }
    }
  }
  
  return functions;
}

function extractFrontmatterAndOverview(content) {
  const lines = content.split('\n');
  let frontmatter = '';
  let overview = '';
  let inFrontmatter = false;
  let frontmatterEnded = false;
  let foundOverview = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle frontmatter
    if (line.trim() === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
        frontmatter += line + '\n';
        continue;
      } else {
        frontmatter += line + '\n';
        frontmatterEnded = true;
        inFrontmatter = false;
        continue;
      }
    }
    
    if (inFrontmatter) {
      frontmatter += line + '\n';
      continue;
    }
    
    // After frontmatter, capture overview until we hit the table
    if (frontmatterEnded) {
      // Stop when we hit the table
      if (line.trim().startsWith('|Function|') || line.trim().startsWith('||Function|')) {
        break;
      }
      overview += line + '\n';
    }
  }
  
  return { frontmatter: frontmatter.trim(), overview: overview.trim() };
}

function generateMdx(frontmatter, overview) {
  return `${frontmatter}

import SqlFunctionsCoverage from '../../../components/snowflake-coverage/SqlFunctionsCoverage';

${overview}
<br></br>

<SqlFunctionsCoverage client:load />
`;
}

function main() {
  console.log('Parsing SQL functions from markdown...');
  
  // Read the markdown file
  const content = readFileSync(INPUT_FILE, 'utf-8');
  
  // Parse the table
  const functions = parseMarkdownTable(content);
  
  console.log(`Found ${functions.length} SQL functions`);
  
  // Calculate statistics
  const supportedCount = functions.filter(f => f.supported).length;
  const unsupportedCount = functions.length - supportedCount;
  
  const output = {
    generated_at: new Date().toISOString(),
    total_functions: functions.length,
    supported_count: supportedCount,
    unsupported_count: unsupportedCount,
    functions: functions
  };
  
  // Ensure output directory exists
  mkdirSync(dirname(OUTPUT_JSON), { recursive: true });
  
  // Write the JSON file
  writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));
  console.log(`Generated JSON file at ${OUTPUT_JSON}`);
  
  // Extract frontmatter and overview from markdown
  const { frontmatter, overview } = extractFrontmatterAndOverview(content);
  
  // Generate MDX file
  const mdxContent = generateMdx(frontmatter, overview);
  writeFileSync(OUTPUT_MDX, mdxContent);
  console.log(`Generated MDX file at ${OUTPUT_MDX}`);
  
  // Remove the original markdown file (since MDX replaces it)
  if (existsSync(INPUT_FILE)) {
    unlinkSync(INPUT_FILE);
    console.log(`Removed original markdown file at ${INPUT_FILE}`);
  }
  
  console.log(`Statistics: ${supportedCount} supported, ${unsupportedCount} unsupported`);
}

main();
