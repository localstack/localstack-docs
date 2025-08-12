import React, { useState, useMemo } from 'react';

interface Application {
  name: string;
  description: string;
  githubUrl: string;
  teaser: string;
  services: string[];
  integrations: string[];
  useCases: string[];
}

interface FilterState {
  services: string[];
  useCases: string[];
  integrations: string[];
}

interface ApplicationsShowcaseProps {
  applications: Application[];
  services: Record<string, string>;
  integrations: Record<string, string>;
}

const ApplicationCard: React.FC<{ 
  app: Application; 
  services: Record<string, string>;
  integrations: Record<string, string>;
}> = ({ app, services, integrations }) => {
  return (
    <a 
      href={app.githubUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="app-card"
    >
      <div className="card-image">
        <img src={app.teaser} alt={app.name} loading="lazy" />
        <div className="card-badges">
          {/* Removed badges since they're not in the new data structure */}
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{app.name}</h3>
        <div className="service-icons">
          {app.services.slice(0, 10).map((serviceCode) => (
            <div key={serviceCode} className="service-icon" title={services[serviceCode] || serviceCode}>
              <img
                src={`/images/aws/${serviceCode}.svg`}
                alt={services[serviceCode] || serviceCode}
              />
            </div>
          ))}
          {app.services.length > 10 && (
            <div className="service-more">+{app.services.length - 10}</div>
          )}
        </div>
        <p className="card-description">{app.description}</p>
        
        <div className="card-footer">
          
          <span className="card-link">
            View Project →
          </span>
        </div>
      </div>
    </a>
  );
};

export const ApplicationsShowcase: React.FC<ApplicationsShowcaseProps> = ({
  applications,
  services,
  integrations,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    services: [],
    useCases: [],
    integrations: [],
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name'>('name');

  // Get unique values for filters
  const uniqueServices = useMemo(() => {
    const allServices = new Set(applications.flatMap(app => app.services));
    return Array.from(allServices).sort((a, b) => (services[a] || a).localeCompare(services[b] || b));
  }, [applications, services]);

  const uniqueUseCases = useMemo(() => {
    const allUseCases = new Set(applications.flatMap(app => app.useCases));
    return Array.from(allUseCases).sort();
  }, [applications]);

  const uniqueIntegrations = useMemo(() => {
    const allIntegrations = new Set(applications.flatMap(app => app.integrations));
    return Array.from(allIntegrations).sort((a, b) => (integrations[a] || a).localeCompare(integrations[b] || b));
  }, [applications, integrations]);

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let filtered = applications.filter(app => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          app.name.toLowerCase().includes(searchLower) ||
          app.description.toLowerCase().includes(searchLower) ||
          app.useCases.some(useCase => useCase.toLowerCase().includes(searchLower)) ||
          app.services.some(service => (services[service] || service).toLowerCase().includes(searchLower)) ||
          app.integrations.some(integration => (integrations[integration] || integration).toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Other filters
      if (filters.services.length > 0 && !filters.services.some(service => app.services.includes(service))) return false;
      if (filters.useCases.length > 0 && !filters.useCases.some(useCase => app.useCases.includes(useCase))) return false;
      if (filters.integrations.length > 0 && !filters.integrations.some(integration => app.integrations.includes(integration))) return false;

      return true;
    });

    // Sort applications
    return filtered.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }, [applications, filters, searchTerm, sortBy, services, integrations]);

  const isSingleResult = filteredApplications.length === 1;
  const gridStyle = useMemo<React.CSSProperties>(() => ({
    justifyContent: isSingleResult ? 'start' : 'stretch',
    gridTemplateColumns: isSingleResult ? 'repeat(1, minmax(360px, 520px))' : undefined,
  }), [isSingleResult]);

  const toggleFilter = (filterType: keyof FilterState, item: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(item)
        ? prev[filterType].filter(i => i !== item)
        : [...prev[filterType], item]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      services: [],
      useCases: [],
      integrations: [],
    });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.services.length > 0 || 
    filters.useCases.length > 0 || 
    filters.integrations.length > 0 || 
    searchTerm.length > 0;

  return (
    <>
      <style>{`
        /* Clean Applications Showcase */
        .applications-showcase {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.25rem;
        }

        /* Top Bar */
        .top-bar {
          margin: 0 0 0.75rem 0;
          padding: 0 0 0.25rem 0;
          background: transparent;
          border: 0;
          border-radius: 0.5rem;
        }

        .top-bar-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(180px, 260px)) auto;
          gap: 0.75rem 0.75rem;
          align-items: stretch; /* ensure all cells share identical row height */
          grid-auto-rows: 40px; /* compact controls */
          margin: 0;
        }

        .top-bar-row:last-child {
          margin-bottom: 0;
        }

        .search-container {
          position: relative;
          min-width: 0;
          width: 100%;
          max-width: 300px; /* reduce visual length */
          display: flex;
          align-items: center;
          height: 100%;
          grid-column: 1 / -1; /* span full width on next row */
          justify-self: start;
        }

        .search-input {
          width: 100%;
          padding: 0.625rem 2.25rem 0.625rem 0.875rem;
          border: 1px solid #999CAD;
          border-radius: 0.5rem;
          background: var(--sl-color-bg);
          color: var(--sl-color-white);
          font-size: 0.9rem;
          height: 100%;
          line-height: 1.2;
        }

        

        .search-input:focus {
          outline: none;
          border-color: var(--sl-color-accent);
        }

        .search-clear {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--sl-color-gray-3);
          font-size: 1.25rem;
          cursor: pointer;
          width: 1.5rem;
          height: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-clear:hover {
          color: var(--sl-color-white);
        }

        .filter-select {
          padding: 0.625rem 0.875rem;
          border: 1px solid #999CAD;
          border-radius: 0.5rem;
          background: var(--sl-color-bg);
          color: var(--sl-color-white);
          font-size: 0.95rem;
          min-width: 0;
          width: 100%;
          height: 100%;
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--sl-color-accent);
        }

        .pro-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--sl-color-white);
          cursor: pointer;
          white-space: nowrap;
          margin-top: 0.375rem;
        }

        .sort-select {
          padding: 0.75rem;
          border: 1px solid #999CAD;
          border-radius: 0.375rem;
          background: var(--sl-color-bg);
          color: var(--sl-color-white);
          font-size: 0.875rem;
          min-width: 120px;
        }

        .clear-filters {
          background: transparent;
          color: var(--sl-color-accent);
          border: none;
          padding: 0 0.25rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          height: 100%;
          cursor: pointer;
          white-space: nowrap;
        }

        .clear-filters:hover {
          background: var(--sl-color-accent-high);
        }

        .results-info { display: none; }

        /* Applications Grid */
        .applications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.25rem;
          margin-top: 1.5rem; /* extra breathing room below filters */
        }

        /* Application Cards */
        .app-card {
          background: var(--sl-color-bg-sidebar);
          border: 1px solid #999CAD;
          border-radius: 0.75rem;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          margin-top: 0;
          display: flex;
          flex-direction: column;
          height: 100%;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }

        .app-card:hover {
          transform: translateY(-2px);
          border-color: var(--sl-color-accent);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .card-image {
          position: relative;
          width: 100%;
          min-height: 160px;
          max-height: 220px;
          overflow: hidden;
          background: #FFFFFF;
          border-radius: 0.5rem 0.5rem 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-image img {
          max-width: 100%;
          max-height: 200px;
          width: auto;
          height: auto;
          object-fit: contain;
          image-rendering: high-quality;
          image-rendering: -webkit-optimize-contrast;
        }

        .card-badges {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          display: flex;
          gap: 0.5rem;
          flex-direction: column;
          align-items: flex-end;
        }

        .pro-badge {
          background: var(--sl-color-accent);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .complexity-badge {
          background: rgba(255, 255, 255, 0.9);
          color: var(--sl-color-gray-3);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .card-content {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .card-title {
          margin: 0 0 0.75rem 0;
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--sl-color-white);
          line-height: 1.3;
        }

        .card-description {
          margin: 0 0 1.25rem 0;
          color: var(--sl-color-gray-2);
          line-height: 1.5;
          font-size: 0.875rem;
        }

        .card-footer {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 1rem;
          margin-top: auto;
          width: 100%;
        }

        .service-icons {
          display: flex;
          gap: 0.375rem;
          align-items: center;
          flex-wrap: wrap;
          flex: 1;
          margin: 0 0 0.75rem 0;
        }

        .service-icon {
          width: 1.75rem;
          height: 1.75rem;
          padding: 0.125rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          margin-top: 0;
        }

        .service-icon:hover {
          transform: scale(1.1);
        }

        .service-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .service-more {
          padding: 0.25rem 0.5rem;
          background: var(--sl-color-bg);
          border: 1px solid var(--sl-color-gray-6);
          border-radius: 0.25rem;
          font-size: 0.75rem;
          color: var(--sl-color-gray-3);
        }

        .card-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--sl-color-white);
          font-weight: 500;
          font-size: 0.875rem;
          padding: 0.5rem 0.75rem 0.5rem 0;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
          white-space: nowrap;
          margin-left: 0;
        }

        .app-card:hover .card-link {
          color: var(--sl-color-accent);
        }

        /* No Results */
        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem 1rem;
          color: var(--sl-color-gray-2);
        }

        .no-results h3 {
          margin: 0 0 0.5rem 0;
          color: var(--sl-color-white);
        }

        .no-results p {
          margin: 0 0 1.5rem 0;
        }

        .reset-button {
          background: var(--sl-color-accent);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          cursor: pointer;
        }

        .reset-button:hover {
          background: var(--sl-color-accent-high);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .top-bar-row {
            grid-template-columns: 1fr 1fr auto;
          }
        }

        @media (max-width: 768px) {
          .applications-showcase {
            padding: 0 0.75rem;
          }

          .top-bar-row {
            grid-template-columns: 1fr;
          }

          .search-container {
            min-width: auto;
          }

          .filter-select,
          .sort-select {
            min-width: auto;
            width: 100%;
          }

          .applications-grid {
            grid-template-columns: 1fr;
          }

          .card-footer {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .service-icons {
            justify-content: center;
          }
        }
      `}</style>
      
      <div className="applications-showcase">
        <div className="top-bar">
          <div className="top-bar-row" role="region" aria-label="Sample apps filters">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="search-clear">
                  ×
                </button>
              )}
            </div>
            
            <select 
              value={filters.services[0] || ''} 
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                services: e.target.value ? [e.target.value] : []
              }))}
              className="filter-select"
            >
              <option value="">Services</option>
              {uniqueServices.map((service) => (
                <option key={service} value={service}>
                  {services[service] || service}
                </option>
              ))}
            </select>

            <select 
              value={filters.useCases[0] || ''} 
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                useCases: e.target.value ? [e.target.value] : []
              }))}
              className="filter-select"
            >
              <option value="">Use Cases</option>
              {uniqueUseCases.map((useCase) => (
                <option key={useCase} value={useCase}>
                  {useCase}
                </option>
              ))}
            </select>

            <select 
              value={filters.integrations[0] || ''} 
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                integrations: e.target.value ? [e.target.value] : []
              }))}
              className="filter-select"
            >
              <option value="">Integrations</option>
              {uniqueIntegrations.map((integration) => (
                <option key={integration} value={integration}>
                  {integrations[integration] || integration}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="clear-filters" aria-label="Clear all filters">
                Clear filters
              </button>
            )}
          </div>

          {/* Removed sorting options since we only sort by name now */}
        </div>

        {/* results count removed per request */}

        <div className="applications-grid" style={gridStyle}>
          {filteredApplications.map((app, index) => (
            <ApplicationCard
              key={`${app.name}-${index}`}
              app={app}
              services={services}
              integrations={integrations}
            />
          ))}
          
          {filteredApplications.length === 0 && (
            <div className="no-results">
              <h3>No applications found</h3>
              <p>Try adjusting your search or filters.</p>
              <button onClick={clearAllFilters} className="reset-button">
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}; 