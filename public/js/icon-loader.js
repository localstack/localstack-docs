// Icon loader script - Adds CSS classes to navigation items based on their text content
(function () {
  'use strict';

  const iconMappings = {
    Welcome: 'cube-icon',
    'Getting Started': 'rocket-icon',
    'Quickstart Library': 'lightning-icon',
    'Local AWS Services': 'cube-icon',
    'Local Azure Services': 'cube-icon',
    Features: 'cube-icon',
    'Feature Coverage': 'buildings-icon',
    'Sample Apps': 'file-icon',
    Connecting: 'plug-icon',
    'Developer Tools': 'wrench-icon',
    Capabilities: 'starburst-icon',
    Customization: 'starburst-icon',
    Tooling: 'wrench-icon',
    'CI Pipelines': 'change-icon',
    Integrations: 'connections-icon',
    'Organizations & Admin': 'users-icon',
    Enterprise: 'buildings-icon',
    'Quickstart Library': 'book-icon',
    Tutorials: 'book-icon',
    Changelog: 'change-icon',
    'SQL Functions': 'sql-icon',
    'Licensing & Tiers': 'pricing-icon',
    'Help & Support': 'help-icon',
  };

  let sidebarRaf = 0;
  let sidebarObserver;

  function addIconClassesToNavigation() {
    const sidebarContent = document.querySelector('.sidebar-content');
    if (!sidebarContent) {
      return;
    }

    const topLevelNavs = sidebarContent.querySelectorAll('.top-level');
    if (!topLevelNavs.length) {
      return;
    }

    const navElements = [];
    for (const topLevelNav of topLevelNavs) {
      for (const span of topLevelNav.querySelectorAll('span')) {
        // Only consider labels that belong directly to this top-level list,
        // not labels nested inside a collapsed sub-section's own list.
        if (span.closest('ul') === topLevelNav) {
          navElements.push(span);
        }
      }
    }

    for (const element of navElements) {
      if (element.children && element.children.length > 0) {
        continue;
      }

      const textContent = element.textContent.trim();
      if (!Object.prototype.hasOwnProperty.call(iconMappings, textContent)) {
        continue;
      }

      const classToAdd = iconMappings[textContent];
      if (!element.classList.contains(classToAdd)) {
        element.classList.add(classToAdd);
      }
    }
  }

  function scheduleSidebarIcons() {
    if (sidebarRaf) {
      cancelAnimationFrame(sidebarRaf);
    }
    sidebarRaf = requestAnimationFrame(function () {
      sidebarRaf = 0;
      addIconClassesToNavigation();
    });
  }

  let sidebarPendingObserver;

  function attachSidebarObserver() {
    if (sidebarObserver) {
      return;
    }
    const sidebarContent = document.querySelector('.sidebar-content');
    if (!sidebarContent) {
      return;
    }

    if (sidebarPendingObserver) {
      sidebarPendingObserver.disconnect();
      sidebarPendingObserver = null;
    }

    sidebarObserver = new MutationObserver(scheduleSidebarIcons);
    sidebarObserver.observe(sidebarContent, {
      childList: true,
      subtree: true,
    });
  }

  function ensureSidebarWatch() {
    attachSidebarObserver();
    if (sidebarObserver || sidebarPendingObserver) {
      return;
    }
    sidebarPendingObserver = new MutationObserver(function () {
      if (sidebarObserver) {
        return;
      }
      requestAnimationFrame(attachSidebarObserver);
    });
    sidebarPendingObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    window.setTimeout(function () {
      if (sidebarPendingObserver) {
        sidebarPendingObserver.disconnect();
        sidebarPendingObserver = null;
      }
    }, 8000);
  }

  function initIconLoader() {
    function run() {
      addIconClassesToNavigation();
      ensureSidebarWatch();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }
  }

  initIconLoader();

  window.LocalStackIconLoader = {
    refresh: function () {
      addIconClassesToNavigation();
    },
    addMapping: function (text, className) {
      iconMappings[text] = className;
      addIconClassesToNavigation();
    },
  };

  let dropdownAttached = false;

  function attachDropdownOnce() {
    if (dropdownAttached) {
      return true;
    }
    const leftNavSelect = document.querySelector(
      'starlight-multi-sidebar-select select',
    );
    if (!leftNavSelect) {
      return false;
    }
    dropdownAttached = true;
    leftNavSelect.addEventListener('change', function (event) {
      const selectedValue = event.target.value;

      if (selectedValue === 'AWS') {
        window.location.href = '/aws/';
      } else if (selectedValue === 'Snowflake') {
        window.location.href = '/snowflake/';
      } else if (selectedValue === 'Azure') {
        window.location.href = '/azure/';
      }

      requestAnimationFrame(function () {
        window.LocalStackIconLoader.refresh();
      });
    });
    return true;
  }

  function initDropdownNavigation() {
    if (attachDropdownOnce()) {
      return;
    }
    const mo = new MutationObserver(function () {
      if (attachDropdownOnce()) {
        mo.disconnect();
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(function () {
      mo.disconnect();
    }, 8000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdownNavigation, {
      once: true,
    });
  } else {
    initDropdownNavigation();
  }
})();
