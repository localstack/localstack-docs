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
      <div className="card-image">
        <img src={app.teaser} alt={app.title} loading="lazy" />
        <div className="card-overlay">
          <div className="card-badges">
            {app.pro && <span className="pro-badge">Pro</span>}
            <span className="complexity-badge">{app.complexity[0]}</span>
          </div>
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{app.title}</h3>
        <p className="card-description">{app.description}</p>
        
        <div className="card-footer">
          <div className="service-icons">
            {app.services.slice(0, 8).map((serviceCode) => (
              <div key={serviceCode} className="service-icon-wrapper" title={services[serviceCode] || serviceCode}>
                <img
                  src={`/images/aws/${serviceCode}.svg`}
                  alt={services[serviceCode] || serviceCode}
                  className="service-icon"
                />
              </div>
            ))}
            {app.services.length > 8 && (
              <div className="service-more">+{app.services.length - 8}</div>
            )}
          </div>
          
          <div className="tech-stack">
            {app.platform.slice(0, 3).map((platformCode) => (
              <span key={platformCode} className="tech-badge platform">
                {platforms[platformCode] || platformCode}
              </span>
            ))}
            {app.deployment.slice(0, 2).map((deploymentCode) => (
              <span key={deploymentCode} className="tech-badge deployment">
                {deployments[deploymentCode] || deploymentCode}
              </span>
            ))}
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

const FilterDropdown: React.FC<{
  title: string;
  items: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
  getDisplayName: (code: string) => string;
  isOpen: boolean;
  onToggleOpen: () => void;
}> = ({ title, items, selectedItems, onToggle, getDisplayName, isOpen, onToggleOpen }) => {
  return (
    <div className="filter-dropdown">
      <button className="filter-button" onClick={onToggleOpen}>
        {title} {selectedItems.length > 0 && <span className="filter-count">({selectedItems.length})</span>}
        <svg className={`chevron ${isOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className="filter-dropdown-content">
          <div className="filter-options">
            {items.map((item) => (
              <label key={item} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item)}
                  onChange={() => onToggle(item)}
                />
                <span className="checkmark"></span>
                <span className="option-text">{getDisplayName(item)}</span>
              </label>
            ))}
          </div>
        </div>
      )}
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
  }, [applications, filters, searchTerm, sortBy]);

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
    <div className="applications-showcase">
      <div className="showcase-header">
        <div className="header-top">
          <div className="search-section">
            <div className="search-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20">
                <path d="M8.5 3a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zM15.707 15.707a1 1 0 0 1-1.414-1.414l1.414 1.414z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              <input
                type="text"
                placeholder="Search applications, technologies, or use cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="search-clear"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          <div className="header-controls">
            <label className="pro-toggle">
              <input
                type="checkbox"
                checked={filters.showProOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, showProOnly: e.target.checked }))}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">Pro Only</span>
            </label>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'title' | 'complexity')}
              className="sort-select"
            >
              <option value="title">Sort by Title</option>
              <option value="complexity">Sort by Complexity</option>
            </select>
          </div>
        </div>

        <div className="filters-row">
          <div className="filter-dropdowns">
            <FilterDropdown
              title="Services"
              items={uniqueServices}
              selectedItems={filters.services}
              onToggle={(item) => toggleFilter('services', item)}
              getDisplayName={(code) => services[code] || code}
              isOpen={openDropdown === 'services'}
              onToggleOpen={() => setOpenDropdown(openDropdown === 'services' ? null : 'services')}
            />

            <FilterDropdown
              title="Deployment"
              items={uniqueDeployments}
              selectedItems={filters.deployments}
              onToggle={(item) => toggleFilter('deployments', item)}
              getDisplayName={(code) => deployments[code] || code}
              isOpen={openDropdown === 'deployments'}
              onToggleOpen={() => setOpenDropdown(openDropdown === 'deployments' ? null : 'deployments')}
            />

            <FilterDropdown
              title="Languages"
              items={uniquePlatforms}
              selectedItems={filters.platforms}
              onToggle={(item) => toggleFilter('platforms', item)}
              getDisplayName={(code) => platforms[code] || code}
              isOpen={openDropdown === 'platforms'}
              onToggleOpen={() => setOpenDropdown(openDropdown === 'platforms' ? null : 'platforms')}
            />

            <FilterDropdown
              title="Complexity"
              items={uniqueComplexities}
              selectedItems={filters.complexities}
              onToggle={(item) => toggleFilter('complexities', item)}
              getDisplayName={(code) => complexities.data[code] || code}
              isOpen={openDropdown === 'complexities'}
              onToggleOpen={() => setOpenDropdown(openDropdown === 'complexities' ? null : 'complexities')}
            />
          </div>

          <div className="results-info">
            <span className="results-count">
              {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
            </span>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="clear-filters">
                Clear filters
              </button>
            )}
          </div>
        </div>
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
            <div className="no-results-content">
              <svg className="no-results-icon" width="64" height="64" viewBox="0 0 64 64">
                <circle cx="28" cy="28" r="12" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M44 44l-8-8" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <h3>No applications found</h3>
              <p>Try adjusting your search terms or filters to find what you're looking for.</p>
              <button onClick={clearAllFilters} className="reset-button">
                Reset all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 