import React, { useEffect, useMemo, useState } from 'react';

interface Service {
  title: string;
  description: string;
  href: string;
  provider: string;
  declaredProvider: string;
  resourceType: string;
}

interface ProviderGroup {
  namespace: string;
  slug: string;
  displayName: string;
  description: string;
  order: number;
  services: Service[];
}

interface SearchableAzureServicesProps {
  services: Service[];
  providerGroups: ProviderGroup[];
  ungrouped: Service[];
}

type ViewMode = 'flat' | 'provider';

const VIEW_STORAGE_KEY = 'azure-services-view';

const matches = (service: Service, term: string) =>
  service.title.toLowerCase().includes(term) ||
  service.description.toLowerCase().includes(term) ||
  service.provider.toLowerCase().includes(term) ||
  service.declaredProvider.toLowerCase().includes(term) ||
  service.resourceType.toLowerCase().includes(term);

const ServiceTile: React.FC<{ service: Service }> = ({ service }) => (
  <a href={service.href} className="service-box">
    <div className="service-box-content">
      <h3 className="service-box-title">{service.title}</h3>
      {service.resourceType && (
        <code className="azure-resource-type">{service.resourceType}</code>
      )}
      <p className="service-box-description">{service.description}</p>
    </div>
  </a>
);

export const SearchableAzureServices: React.FC<SearchableAzureServicesProps> = ({
  services,
  providerGroups,
  ungrouped,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<ViewMode>('provider');

  // Restore the reader's last choice; `?view=` still overrides it for links.
  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get('view');
    if (fromQuery === 'flat' || fromQuery === 'provider') {
      setView(fromQuery);
      return;
    }
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === 'flat' || stored === 'provider') setView(stored);
  }, []);

  const selectView = (next: ViewMode) => {
    setView(next);
    window.localStorage.setItem(VIEW_STORAGE_KEY, next);
  };

  const term = searchTerm.trim().toLowerCase();

  const filteredServices = useMemo(
    () => (term ? services.filter((s) => matches(s, term)) : services),
    [services, term]
  );

  // While searching, provider groups keep only their matching resource types so
  // a search still reaches into every provider rather than just the listing.
  const filteredGroups = useMemo(() => {
    if (!term) return providerGroups;
    return providerGroups
      .map((group) => ({
        ...group,
        services: group.services.filter((s) => matches(s, term)),
      }))
      .filter(
        (group) =>
          group.services.length > 0 ||
          group.displayName.toLowerCase().includes(term) ||
          group.namespace.toLowerCase().includes(term)
      );
  }, [providerGroups, term]);

  const totalShown = term ? filteredServices.length : services.length;
  const noResults = term.length > 0 && filteredServices.length === 0;

  return (
    <div className="searchable-services">
      <div className="search-container azure-services-controls">
        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search for Azure Service Name ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div
          className="azure-view-toggle"
          role="group"
          aria-label="Choose how to browse Azure services"
        >
          <button
            type="button"
            className={`azure-view-button ${view === 'provider' ? 'is-active' : ''}`}
            aria-pressed={view === 'provider'}
            onClick={() => selectView('provider')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2 2 7l10 5 10-5-10-5Z" />
              <path d="m2 17 10 5 10-5" />
              <path d="m2 12 10 5 10-5" />
            </svg>
            By resource provider
          </button>
          <button
            type="button"
            className={`azure-view-button ${view === 'flat' ? 'is-active' : ''}`}
            aria-pressed={view === 'flat'}
            onClick={() => selectView('flat')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            All resource types
          </button>
        </div>
      </div>

      {noResults ? (
        <div className="no-results">
          <p>No services found matching "{searchTerm}"</p>
        </div>
      ) : view === 'flat' ? (
        <>
          <p className="azure-services-count">
            {totalShown} resource {totalShown === 1 ? 'type' : 'types'}
          </p>
          <div className="service-grid">
            {filteredServices.map((service) => (
              <ServiceTile key={service.href} service={service} />
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="azure-services-count">
            {filteredGroups.length} resource{' '}
            {filteredGroups.length === 1 ? 'provider' : 'providers'}
            {term ? `, ${filteredServices.length} matching resource types` : ''}
          </p>
          <div className="service-grid">
            {/* Each provider is a real page, so the title, description and
                breadcrumb on the far side are rendered by Starlight. */}
            {filteredGroups.map((group) => (
              <a
                key={group.namespace}
                id={group.slug}
                href={`/azure/services/providers/${group.slug}/`}
                className="service-box"
              >
                <div className="service-box-content">
                  <h3 className="service-box-title">{group.displayName}</h3>
                  <code className="azure-provider-namespace">{group.namespace}</code>
                  <p className="service-box-description">{group.description}</p>
                  <span className="azure-provider-meta">
                    <span className="azure-provider-count">
                      {group.services.length} resource{' '}
                      {group.services.length === 1 ? 'type' : 'types'}
                    </span>
                  </span>
                </div>
              </a>
            ))}
          </div>

          {ungrouped.length > 0 && (
            <div className="azure-ungrouped">
              <h3>Not yet assigned to a resource provider</h3>
              <div className="service-grid">
                {ungrouped.map((service) => (
                  <ServiceTile key={service.href} service={service} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
