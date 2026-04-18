import { defineMiddleware } from 'astro:middleware';
import { isLikelyHtmlDocumentPath, wantsMarkdownResponse } from './lib/markdownNegotiation';

/** RFC 8288 Link header for homepage agent discovery (mirrors public/_headers). */
const HOME_LINK =
  '</llms.txt>; rel="service-doc"; type="text/plain", ' +
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/json", ' +
  '</sitemap-index.xml>; rel="describedby"; type="application/xml", ' +
  '</.well-known/mcp/server-card.json>; rel="alternate"; type="application/json", ' +
  '</.well-known/agent-skills/index.json>; rel="alternate"; type="application/json"';

function applyHomepageLink(response: Response, pathname: string): Response {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean !== '/' && clean !== '/index.html') {
    return response;
  }
  response.headers.set('Link', HOME_LINK);
  return response;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url } = context;

  if (request.method !== 'GET') {
    const response = await next();
    return applyHomepageLink(response, url.pathname);
  }

  const negotiate =
    wantsMarkdownResponse(request.headers.get('accept')) && isLikelyHtmlDocumentPath(url.pathname);

  if (!negotiate) {
    const response = await next();
    return applyHomepageLink(response, url.pathname);
  }

  const response = await next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return applyHomepageLink(response, url.pathname);
  }

  const html = await response.text();
  const { htmlDocumentToMarkdown, estimateMarkdownTokens } = await import('./lib/markdownNegotiation');
  const markdown = await htmlDocumentToMarkdown(html, url);
  if (!markdown.trim()) {
    return applyHomepageLink(
      new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      }),
      url.pathname,
    );
  }

  const tokens = estimateMarkdownTokens(markdown);
  const headers = new Headers();
  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  headers.set('Vary', 'Accept');
  headers.set('x-markdown-tokens', String(tokens));

  const out = new Response(markdown, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
  return applyHomepageLink(out, url.pathname);
});
