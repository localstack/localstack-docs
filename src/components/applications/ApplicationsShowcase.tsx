import React, { useState, useMemo } from 'react';

interface Application {
  title: string;
  description: string;
  url: string;
  teaser: string;
  services: string[];
  platform: string[];
  deployment: string[];
  tags: string[];
  complexity: string[];
  pro: boolean;
  cloudPods: boolean;
}

interface FilterState {
  services: string[];
  platforms: string[];
  deployments: string[];
  complexities: string[];
  showProOnly: boolean;
}

interface ApplicationsShowcaseProps {
  applications: Application[];
  services: Record<string, string>;
  platforms: Record<string, string>;
  deployments: Record<string, string>;
  complexities: { data: Record<string, string>; order: string[] };
}

const ApplicationCard: React.FC<{ 
  app: Application; 
  services: Record<string, string>;
  platforms: Record<string, string>;
  deployments: Record<string, string>;
}> = ({ app, services, platforms, deployments }) => {
  return (
    <div className="app-card">
      <div className="card-image">
        <img src={app.teaser} alt={app.title} loading="lazy" />
        <div className="card-badges">
          {app.pro && <span className="pro-badge">Pro</span>}
          <span className="complexity-badge">{app.complexity[0]}</span>
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{app.title}</h3>
        <p className="card-description">{app.description}</p>
        
        <div className="card-footer">
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
          
          <a 
            href={app.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="card-link"
          >
            View Project →
          </a>
        </div>
      </div>
    </div>
  );
};

export const ApplicationsShowcase: React.FC<ApplicationsShowcaseProps> = ({
  applications,
  services,
  platforms,
  deployments,
  complexities,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    services: [],
    platforms: [],
    deployments: [],
    complexities: [],
    showProOnly: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'complexity'>('title');

  // Get unique values for filters
  const uniqueServices = useMemo(() => {
    const allServices = new Set(applications.flatMap(app => app.services));
    return Array.from(allServices).sort((a, b) => (services[a] || a).localeCompare(services[b] || b));
  }, [applications, services]);

  const uniquePlatforms = useMemo(() => {
    const allPlatforms = new Set(applications.flatMap(app => app.platform));
    return Array.from(allPlatforms).sort((a, b) => (platforms[a] || a).localeCompare(platforms[b] || b));
  }, [applications, platforms]);

  const uniqueDeployments = useMemo(() => {
    const allDeployments = new Set(applications.flatMap(app => app.deployment));
    return Array.from(allDeployments).sort((a, b) => (deployments[a] || a).localeCompare(deployments[b] || b));
  }, [applications, deployments]);

  const uniqueComplexities = useMemo(() => {
    const allComplexities = new Set(applications.flatMap(app => app.complexity));
    return complexities.order.filter(complexity => allComplexities.has(complexity));
  }, [applications, complexities.order]);

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let filtered = applications.filter(app => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          app.title.toLowerCase().includes(searchLower) ||
          app.description.toLowerCase().includes(searchLower) ||
          app.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          app.services.some(service => (services[service] || service).toLowerCase().includes(searchLower)) ||
          app.platform.some(platform => (platforms[platform] || platform).toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Other filters
      if (filters.services.length > 0 && !filters.services.some(service => app.services.includes(service))) return false;
      if (filters.platforms.length > 0 && !filters.platforms.some(platform => app.platform.includes(platform))) return false;
      if (filters.deployments.length > 0 && !filters.deployments.some(deployment => app.deployment.includes(deployment))) return false;
      if (filters.complexities.length > 0 && !filters.complexities.some(complexity => app.complexity.includes(complexity))) return false;
      if (filters.showProOnly && !app.pro) return false;

      return true;
    });

    // Sort applications
    return filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else {
        const complexityOrder = { basic: 0, intermediate: 1, advanced: 2 };
        const aComplexity = complexityOrder[a.complexity[0] as keyof typeof complexityOrder] ?? 1;
        const bComplexity = complexityOrder[b.complexity[0] as keyof typeof complexityOrder] ?? 1;
        return aComplexity - bComplexity;
      }
    });
  }, [applications, filters, searchTerm, sortBy, services, platforms]);

  const toggleFilter = (filterType: keyof FilterState, item: string) => {
    if (filterType === 'showProOnly') return;
    
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
      platforms: [],
      deployments: [],
      complexities: [],
      showProOnly: false,
    });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.services.length > 0 || 
    filters.platforms.length > 0 || 
    filters.deployments.length > 0 || 
    filters.complexities.length > 0 || 
    filters.showProOnly || 
    searchTerm.length > 0;

  return (
    <>
      <style>{`
        /* Clean Applications Showcase */
        .applications-showcase {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Top Bar */
        .top-bar {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: var(--sl-color-bg-sidebar);
          border: 1px solid var(--sl-color-gray-6);
          border-radius: 0.5rem;
        }

        .top-bar-row {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .top-bar-row:last-child {
          margin-bottom: 0;
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--sl-color-gray-5);
          border-radius: 0.375rem;
          background: var(--sl-color-bg);
          color: var(--sl-color-white);
          font-size: 0.875rem;
          margin-top: 0;
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
          padding: 0.75rem;
          border: 1px solid var(--sl-color-gray-5);
          border-radius: 0.375rem;
          background: var(--sl-color-bg);
          color: var(--sl-color-white);
          font-size: 0.875rem;
          min-width: 140px;
          margin-top: 0;
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
          border: 1px solid var(--sl-color-gray-5);
          border-radius: 0.375rem;
          background: var(--sl-color-bg);
          color: var(--sl-color-white);
          font-size: 0.875rem;
          min-width: 120px;
        }

        .clear-filters {
          background: var(--sl-color-accent);
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          cursor: pointer;
          white-space: nowrap;
        }

        .clear-filters:hover {
          background: var(--sl-color-accent-high);
        }

        .results-info {
          margin-bottom: 1rem;
          color: var(--sl-color-gray-2);
          font-size: 0.875rem;
        }

        /* Applications Grid */
        .applications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        /* Application Cards */
        .app-card {
          background: var(--sl-color-bg-sidebar);
          border: 1px solid var(--sl-color-gray-6);
          border-radius: 0.75rem;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          margin-top: 0;
        }

        .app-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .card-image {
          position: relative;
          width: 100%;
          height: 180px;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
          color: var(--sl-color-gray-6);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .card-content {
          padding: 1.25rem;
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
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .service-icons {
          display: flex;
          gap: 0.375rem;
          align-items: center;
          flex-wrap: wrap;
          flex: 1;
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
          color: white;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.875rem;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .card-link:hover {
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
        @media (max-width: 768px) {
          .applications-showcase {
            padding: 0 0.75rem;
          }

          .top-bar-row {
            flex-direction: column;
            align-items: stretch;
          }

          .search-container {
            min-width: auto;
            flex: none;
          }

          .filter-select,
          .sort-select {
            min-width: auto;
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
          <div className="top-bar-row">
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
              onChange={(e) => e.target.value ? toggleFilter('services', e.target.value) : null}
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
              value={filters.platforms[0] || ''} 
              onChange={(e) => e.target.value ? toggleFilter('platforms', e.target.value) : null}
              className="filter-select"
            >
              <option value="">Languages</option>
              {uniquePlatforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platforms[platform] || platform}
                </option>
              ))}
            </select>

            <select 
              value={filters.deployments[0] || ''} 
              onChange={(e) => e.target.value ? toggleFilter('deployments', e.target.value) : null}
              className="filter-select"
            >
              <option value="">Deployment</option>
              {uniqueDeployments.map((deployment) => (
                <option key={deployment} value={deployment}>
                  {deployments[deployment] || deployment}
                </option>
              ))}
            </select>

            <select 
              value={filters.complexities[0] || ''} 
              onChange={(e) => e.target.value ? toggleFilter('complexities', e.target.value) : null}
              className="filter-select"
            >
              <option value="">Complexity</option>
              {uniqueComplexities.map((complexity) => (
                <option key={complexity} value={complexity}>
                  {complexities.data[complexity] || complexity}
                </option>
              ))}
            </select>

            <label className="pro-toggle">
              <input
                type="checkbox"
                checked={filters.showProOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, showProOnly: e.target.checked }))}
              />
              Pro Only
            </label>

            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="clear-filters">
                Clear
              </button>
            )}
          </div>

          <div className="top-bar-row">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'title' | 'complexity')}
              className="sort-select"
            >
              <option value="title">A-Z</option>
              <option value="complexity">By Complexity</option>
            </select>
          </div>
        </div>

        <div className="results-info">
          {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
        </div>

        <div className="applications-grid">
          {filteredApplications.map((app, index) => (
            <ApplicationCard
              key={`${app.title}-${index}`}
              app={app}
              services={services}
              platforms={platforms}
              deployments={deployments}
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