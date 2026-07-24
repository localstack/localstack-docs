import { resolve } from 'node:path';
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { buildFlatHeadings, injectHeadingsIntoToc } from './lib/lstk-toc';

// Pages under these paths compose their content from shared .mdx components (see
// src/components/lstk/), whose headings Starlight's own per-file extraction can't see.
const PAGES_WITH_SHARED_COMPONENT_HEADINGS = [
  /^\/aws\/developer-tools\/running-localstack\/lstk$/,
  /^\/azure\/developer-tools\/lstk$/,
  /^\/snowflake\/developer-tools\/lstk$/,
];

export const onRequest = defineRouteMiddleware((context) => {
  const locals = context.locals as typeof context.locals & {
    starlightUtils?: {
      multiSidebar?: any[];
    };
  };
  const { starlightRoute } = locals;

  const pathname = context.url.pathname.replace(/\/+$/, '') || '/';
  const sidebarContextOverrides = [
    {
      match: /^\/azure\/services\/[^/]+$/,
      sidebarLabel: 'Azure',
      currentLinkHref: '/azure/services/',
    },
    {
      match: /^\/snowflake\/features\/[^/]+$/,
      sidebarLabel: 'Snowflake',
      currentLinkHref: '/snowflake/features/',
    },
  ];
  const sidebarContextOverride = sidebarContextOverrides.find(({ match }) =>
    match.test(pathname)
  );

  if (sidebarContextOverride) {
    const { sidebarLabel, currentLinkHref } = sidebarContextOverride;

    const markLinkCurrent = (entry: any): boolean => {
      if (entry.type === 'link' && entry.href === currentLinkHref) {
        entry.isCurrent = true;
        return true;
      }
      if (entry.type === 'group') {
        return entry.entries.some((nestedEntry: any) => markLinkCurrent(nestedEntry));
      }
      return false;
    };

    const resetGroupCurrentState = (entry: any) => {
      if (entry.type === 'link') {
        entry.isCurrent = false;
        return;
      }
      if (entry.type === 'group') {
        entry.entries.forEach((nestedEntry: any) => resetGroupCurrentState(nestedEntry));
      }
    };

    for (const entry of starlightRoute.sidebar) {
      if (entry.type !== 'group') continue;
      if (entry.label === sidebarLabel) {
        markLinkCurrent(entry);
      } else {
        resetGroupCurrentState(entry);
      }
    }

    const multiSidebarData = locals.starlightUtils?.multiSidebar;
    if (Array.isArray(multiSidebarData)) {
      multiSidebarData.forEach((data: any) => {
        data.isCurrentSidebar = data.label?.label === sidebarLabel;
      });
    }
  }

  if (starlightRoute.toc && PAGES_WITH_SHARED_COMPONENT_HEADINGS.some((match) => match.test(pathname))) {
    const pageFilePath = resolve(process.cwd(), starlightRoute.entry.filePath);
    const flatHeadings = buildFlatHeadings(pageFilePath);
    const overview = starlightRoute.toc.items[0];
    const items = overview ? [overview] : [];
    injectHeadingsIntoToc(items as any, flatHeadings, starlightRoute.toc);
    starlightRoute.toc.items = items as typeof starlightRoute.toc.items;
  }

  const overviewItem = starlightRoute.toc?.items[0];
  if (overviewItem) overviewItem.text = 'Back to top';
});
