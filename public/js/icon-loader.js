// Icon loader script - Adds CSS classes to navigation items based on their text content
(function () {
  'use strict';

  // Configuration object for text-to-class mappings
  const iconMappings = {
    Welcome: 'cube-icon',
    'Getting Started': 'rocket-icon',
    'Local AWS Services': 'cube-icon',
    Features: 'cube-icon',
    'Sample Apps': 'file-icon',
    Capabilities: 'starburst-icon',
    Tooling: 'wrench-icon',
    Integrations: 'connections-icon',
    Enterprise: 'buildings-icon',
    Tutorials: 'book-icon',
    Changelog: 'change-icon',
    'SQL Functions': 'sql-icon',
    'Licensing & Tiers': 'pricing-icon',
  };

  // Function to add classes to navigation elements based on text content
  function addIconClassesToNavigation() {
    // Find all navigation elements in the sidebar
    const sidebarContent = document.querySelector('.sidebar-content');
    if (!sidebarContent) {
      console.warn('Sidebar content not found');
      return;
    }

    // Look for top-level navigation items
    const topLevelNavs = sidebarContent.querySelectorAll('.top-level');
    if (!topLevelNavs) {
      console.warn('Top-level navigation not found');
      return;
    }

    // Find all navigation links and summary elements (for collapsible sections)
    let navElements = [];
    for (const topLevelNav of topLevelNavs) {
      navElements.push(...topLevelNav.querySelectorAll('span'));
    }

    navElements.forEach((element) => {
      // Get the text content, trimming whitespace
      const textContent = element.textContent.trim();

      // Check if this text matches any of our mappings
      if (iconMappings.hasOwnProperty(textContent)) {
        const classToAdd = iconMappings[textContent];

        // Add the class to the element
        element.classList.add(classToAdd);

        console.log(
          `Added class "${classToAdd}" to element with text "${textContent}"`
        );
      }
    });
  }

  // Function to initialize the icon loader
  function initIconLoader() {
    // Run immediately if DOM is already loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addIconClassesToNavigation);
    } else {
      // DOM is already loaded
      addIconClassesToNavigation();
    }

    // Also run after a short delay to catch any dynamically loaded content
    setTimeout(addIconClassesToNavigation, 500);
  }

  // Start the icon loader
  initIconLoader();

  // Export function for manual triggering if needed
  window.LocalStackIconLoader = {
    refresh: addIconClassesToNavigation,
    addMapping: function (text, className) {
      iconMappings[text] = className;
      addIconClassesToNavigation();
    },
  };

  function handleDropdownNavigation() {
    const leftNavSelect = document.querySelector('select.astro-oojz3yon');
    if (leftNavSelect) {
      leftNavSelect.addEventListener('change', (event) => {
        const selectedValue = event.target.value;
        console.log('Dropdown changed to:', selectedValue);
        
        if (selectedValue === 'AWS') {
          window.location.href = '/aws/';
        } else if (selectedValue === 'Snowflake') {
          window.location.href = '/snowflake/';
        }
        
        setTimeout(() => {
          window.LocalStackIconLoader.refresh();
        }, 100);
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleDropdownNavigation);
  } else {
    handleDropdownNavigation();
  }
  setTimeout(handleDropdownNavigation, 500);
})();
