import React, { useState, useMemo } from 'react';
import type { Application, FilterState } from './types';

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
    <div className="application-card">
      <a href={app.url} target="_blank" rel="noopener noreferrer" className="application-card-link">
        <div className="application-card-image">
          <img src={app.teaser} alt={app.title} loading="lazy" />
          {app.pro && <span className="pro-badge">Pro</span>}
        </div>
        <div className="application-card-content">
          <h3 className="application-card-title">{app.title}</h3>
          <p className="application-card-description">{app.description}</p>
          
          <div className="application-card-footer">
            <div className="service-icons">
              {app.services.slice(0, 6).map((serviceCode) => (
                <img
                  key={serviceCode}
                  src={`/images/aws/${serviceCode}.svg`}
                  alt={services[serviceCode] || serviceCode}
                  title={services[serviceCode] || serviceCode}
                  className="service-icon"
                />
              ))}
              {app.services.length > 6 && (
                <span className="service-count">+{app.services.length - 6}</span>
              )}
            </div>
            
            <div className="tech-stack">
              <div className="platforms">
                {app.platform.slice(0, 2).map((platformCode) => (
                  <span key={platformCode} className="tech-badge platform-badge">
                    {platforms[platformCode] || platformCode}
                  </span>
                ))}
                {app.platform.length > 2 && (
                  <span className="tech-badge">+{app.platform.length - 2}</span>
                )}
              </div>
              <div className="deployments">
                {app.deployment.slice(0, 2).map((deploymentCode) => (
                  <span key={deploymentCode} className="tech-badge deployment-badge">
                    {deployments[deploymentCode] || deploymentCode}
                  </span>
                ))}
                {app.deployment.length > 2 && (
                  <span className="tech-badge">+{app.deployment.length - 2}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

const FilterSection: React.FC<{
  title: string;
  items: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
  getDisplayName: (code: string) => string;
}> = ({ title, items, selectedItems, onToggle, getDisplayName }) => {
  return (
    <div className="filter-section">
      <h4 className="filter-title">{title}</h4>
      <div className="filter-items">
        {items.map((item) => (
          <label key={item} className="filter-item">
            <input
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={() => onToggle(item)}
              className="filter-checkbox"
            />
            <span className="filter-label">{getDisplayName(item)}</span>
          </label>
        ))}
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

  // Get unique values for filters
  const uniqueServices = useMemo(() => {
    const allServices = new Set(applications.flatMap(app => app.services));
    return Array.from(allServices).sort();
  }, [applications]);

  const uniquePlatforms = useMemo(() => {
    const allPlatforms = new Set(applications.flatMap(app => app.platform));
    return Array.from(allPlatforms).sort();
  }, [applications]);

  const uniqueDeployments = useMemo(() => {
    const allDeployments = new Set(applications.flatMap(app => app.deployment));
    return Array.from(allDeployments).sort();
  }, [applications]);

  const uniqueComplexities = useMemo(() => {
    const allComplexities = new Set(applications.flatMap(app => app.complexity));
    return complexities.order.filter(complexity => allComplexities.has(complexity));
  }, [applications, complexities.order]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          app.title.toLowerCase().includes(searchLower) ||
          app.description.toLowerCase().includes(searchLower) ||
          app.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Service filter
      if (filters.services.length > 0) {
        const hasService = filters.services.some(service => app.services.includes(service));
        if (!hasService) return false;
      }

      // Platform filter
      if (filters.platforms.length > 0) {
        const hasPlatform = filters.platforms.some(platform => app.platform.includes(platform));
        if (!hasPlatform) return false;
      }

      // Deployment filter
      if (filters.deployments.length > 0) {
        const hasDeployment = filters.deployments.some(deployment => app.deployment.includes(deployment));
        if (!hasDeployment) return false;
      }

      // Complexity filter
      if (filters.complexities.length > 0) {
        const hasComplexity = filters.complexities.some(complexity => app.complexity.includes(complexity));
        if (!hasComplexity) return false;
      }

      // Pro filter
      if (filters.showProOnly && !app.pro) {
        return false;
      }

      return true;
    });
  }, [applications, filters, searchTerm]);

  const toggleFilter = (filterType: keyof FilterState, item: string) => {
    if (filterType === 'showProOnly') return;
    
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(item)
        ? prev[filterType].filter(i => i !== item)
        : [...prev[filterType], item]
    }));
  };

  return (
    <div className="applications-showcase">
      <div className="showcase-header">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <label className="pro-filter">
            <input
              type="checkbox"
              checked={filters.showProOnly}
              onChange={(e) => setFilters(prev => ({ ...prev, showProOnly: e.target.checked }))}
            />
            <span>Pro only</span>
          </label>
        </div>
        <div className="results-count">
          {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="showcase-content">
        <aside className="filters-sidebar">
          <h3>Filters</h3>
          
          <FilterSection
            title="Services"
            items={uniqueServices}
            selectedItems={filters.services}
            onToggle={(item) => toggleFilter('services', item)}
            getDisplayName={(code) => services[code] || code}
          />

          <FilterSection
            title="Infrastructure Provisioned"
            items={uniqueDeployments}
            selectedItems={filters.deployments}
            onToggle={(item) => toggleFilter('deployments', item)}
            getDisplayName={(code) => deployments[code] || code}
          />

          <FilterSection
            title="Programming Language"
            items={uniquePlatforms}
            selectedItems={filters.platforms}
            onToggle={(item) => toggleFilter('platforms', item)}
            getDisplayName={(code) => platforms[code] || code}
          />

          <FilterSection
            title="Complexity"
            items={uniqueComplexities}
            selectedItems={filters.complexities}
            onToggle={(item) => toggleFilter('complexities', item)}
            getDisplayName={(code) => complexities.data[code] || code}
          />
        </aside>

        <main className="applications-grid">
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
              <p>No applications match your current filters.</p>
              <button 
                onClick={() => {
                  setFilters({
                    services: [],
                    platforms: [],
                    deployments: [],
                    complexities: [],
                    showProOnly: false,
                  });
                  setSearchTerm('');
                }}
                className="clear-filters-btn"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}; 