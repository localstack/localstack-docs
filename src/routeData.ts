import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

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

  const overviewItem = starlightRoute.toc?.items[0];
  if (overviewItem) overviewItem.text = 'Back to top';
});
