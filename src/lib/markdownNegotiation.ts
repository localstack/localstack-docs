import { parseHTML } from 'linkedom';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeRemark)
  .use(remarkGfm)
  .use(remarkStringify, { bulletOther: '*', listItemIndent: 'one' });

/** Rough token estimate for x-markdown-tokens (similar intent to Cloudflare’s header). */
export function estimateMarkdownTokens(markdown: string): number {
  return Math.max(1, Math.ceil(markdown.length / 4));
}

export function wantsMarkdownResponse(acceptHeader: string | null): boolean {
  if (!acceptHeader || !acceptHeader.includes('text/markdown')) {
    return false;
  }
  for (const part of acceptHeader.split(',')) {
    const semi = part.indexOf(';');
    const type = (semi === -1 ? part : part.slice(0, semi)).trim().toLowerCase();
    if (type !== 'text/markdown') continue;
    const rest = semi === -1 ? '' : part.slice(semi);
    const qMatch = rest.match(/q\s*=\s*([\d.]+)/i);
    const q = qMatch ? parseFloat(qMatch[1]) : 1;
    return !Number.isNaN(q) && q > 0;
  }
  return true;
}

/**
 * Skip obvious static/binary paths so we do not buffer non-HTML in middleware.
 */
export function isLikelyHtmlDocumentPath(pathname: string): boolean {
  if (pathname.includes('/_astro/')) return false;
  const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
  if (!match) return true;
  const ext = match[1].toLowerCase();
  return ext === 'html' || ext === 'htm';
}

function yamlScalar(s: string): string {
  return JSON.stringify(s);
}

/**
 * Convert Starlight HTML to markdown (main column only), aligned with CopyPageDropdown extraction.
 */
export async function htmlDocumentToMarkdown(html: string, pageUrl: URL): Promise<string> {
  const { document } = parseHTML(html);
  const main =
    document.querySelector('.sl-markdown-content') ||
    document.querySelector('main article') ||
    document.querySelector('main');
  if (!main) {
    return '';
  }

  const title = document.querySelector('title')?.textContent?.trim() || 'Documentation';
  const canonical =
    document.querySelector('link[rel="canonical"]')?.getAttribute('href') || pageUrl.href;

  const body = String(await processor.process(main.innerHTML)).trim();

  return [
    '---',
    `title: ${yamlScalar(title)}`,
    `source: ${canonical}`,
    '---',
    '',
    body,
    '',
  ].join('\n');
}
