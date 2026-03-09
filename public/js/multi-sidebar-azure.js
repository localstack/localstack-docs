// Multi-sidebar Azure visibility - Shows Azure option only when viewing Azure content
(function () {
  'use strict';

  const AZURE_OPTION_VALUE = 'Azure';

  function isViewingAzure() {
    const path = window.location.pathname;
    return path === '/azure' || path.startsWith('/azure/');
  }

  function getMultiSidebarSelect() {
    return document.querySelector('starlight-multi-sidebar-select');
  }

  function getSelectElement() {
    const container = getMultiSidebarSelect();
    return container?.querySelector('select');
  }

  function getAzureOption(select) {
    return select?.querySelector(`option[value="${AZURE_OPTION_VALUE}"]`);
  }

  function ensureAzureOptionExists(select) {
    if (getAzureOption(select)) return;
    const azureOption = document.createElement('option');
    azureOption.value = AZURE_OPTION_VALUE;
    azureOption.textContent = AZURE_OPTION_VALUE;
    // Insert after Snowflake (order: AWS, Snowflake, Azure)
    const snowflakeOption = select.querySelector('option[value="Snowflake"]');
    if (snowflakeOption?.nextElementSibling) {
      select.insertBefore(azureOption, snowflakeOption.nextElementSibling);
    } else {
      select.appendChild(azureOption);
    }
  }

  function removeAzureOption(select) {
    const azureOption = getAzureOption(select);
    if (azureOption) {
      azureOption.remove();
    }
  }

  function updateMultiSidebarForAzureVisibility() {
    const container = getMultiSidebarSelect();
    const select = getSelectElement();
    if (!container || !select) return;

    const viewingAzure = isViewingAzure();

    if (viewingAzure) {
      ensureAzureOptionExists(select);
      select.value = AZURE_OPTION_VALUE;
      // Show the Azure sidebar content
      const azureSidebar = container.querySelector(
        '[data-starlight-multi-sidebar-label="Azure"]'
      );
      const allSidebars = container.querySelectorAll(
        '[data-starlight-multi-sidebar-label]'
      );
      if (azureSidebar) {
        allSidebars.forEach((sidebar) => {
          sidebar.hidden = sidebar !== azureSidebar;
        });
      }
    } else {
      removeAzureOption(select);
      // Ensure a valid selection (AWS or Snowflake based on current path)
      const pathname = window.location.pathname;
      if (pathname.includes('/snowflake')) {
        select.value = 'Snowflake';
      } else {
        select.value = 'AWS';
      }
      // Show the appropriate sidebar
      const allSidebars = container.querySelectorAll(
        '[data-starlight-multi-sidebar-label]'
      );
      allSidebars.forEach((sidebar) => {
        const label = sidebar.dataset.starlightMultiSidebarLabel;
        sidebar.hidden = label !== select.value;
      });
    }
  }

  function init() {
    updateMultiSidebarForAzureVisibility();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Catch dynamically loaded content (e.g. after initial render)
  setTimeout(init, 100);
  setTimeout(init, 500);

  // Re-run on Astro view transitions (client-side navigation)
  document.addEventListener('astro:page-load', init);
})();
