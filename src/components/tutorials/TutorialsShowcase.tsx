import React, { useState, useMemo } from 'react';

interface Tutorial {
  title: string;
  description: string;
  slug: string;
  leadimage?: string;
  services: string[];
  platform: string[];
  deployment: string[];
  pro: boolean;
}

interface FilterState {
  services: string[];
  platforms: string[];
  deployments: string[];
  showProOnly: boolean;
}

interface TutorialsShowcaseProps {
  tutorials: Tutorial[];
  services: Record<string, string>;
  platforms: Record<string, string>;
  deployments: Record<string, string>;
}

const TutorialCard: React.FC<{ 
  tutorial: Tutorial; 
  services: Record<string, string>;
  platforms: Record<string, string>;
  deployments: Record<string, string>;
}> = ({ tutorial, services, platforms, deployments }) => {
  const imagePath = tutorial.leadimage ? `/images/aws/${tutorial.leadimage}` : '/images/aws/banner.png';
  
  return (
    <div className="tutorial-card">
      <div className="card-image">
        <img src={imagePath} alt={tutorial.title} loading="lazy" />
        <div className="card-badges">
          {tutorial.pro && <span className="pro-badge">Pro</span>}
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{tutorial.title}</h3>
        <p className="card-description">{tutorial.description}</p>
        
        <div className="card-footer">
          <div className="service-icons">
            {tutorial.services.slice(0, 8).map((serviceCode) => (
              <div key={serviceCode} className="service-icon" title={services[serviceCode] || serviceCode}>
                <img
                  src={`/images/aws/${serviceCode}.svg`}
                  alt={services[serviceCode] || serviceCode}
                />
              </div>
            ))}
            {tutorial.services.length > 8 && (
              <div className="service-more">+{tutorial.services.length - 8}</div>
            )}
          </div>
          
          <a 
            href={`/${tutorial.slug}/`}
            className="card-link"
          >
            Read Tutorial →
          </a>
        </div>
      </div>
    </div>
  );
};

export const TutorialsShowcase: React.FC<TutorialsShowcaseProps> = ({
  tutorials,
  services,
  platforms,
  deployments,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    services: [],
    platforms: [],
    deployments: [],
    showProOnly: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'services'>('title');

  // Get unique values for filters
  const uniqueServices = useMemo(() => {
    const allServices = new Set(tutorials.flatMap(tutorial => tutorial.services));
    return Array.from(allServices).sort((a, b) => (services[a] || a).localeCompare(services[b] || b));
  }, [tutorials, services]);

  const uniquePlatforms = useMemo(() => {
    const allPlatforms = new Set(tutorials.flatMap(tutorial => tutorial.platform));
    return Array.from(allPlatforms).sort((a, b) => (platforms[a] || a).localeCompare(platforms[b] || b));
  }, [tutorials, platforms]);

  const uniqueDeployments = useMemo(() => {
    const allDeployments = new Set(tutorials.flatMap(tutorial => tutorial.deployment));
    return Array.from(allDeployments).sort((a, b) => (deployments[a] || a).localeCompare(deployments[b] || b));
  }, [tutorials, deployments]);

  // Filter and sort tutorials
  const filteredTutorials = useMemo(() => {
    let filtered = tutorials.filter(tutorial => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          tutorial.title.toLowerCase().includes(searchLower) ||
          tutorial.description.toLowerCase().includes(searchLower) ||
          tutorial.services.some(service => (services[service] || service).toLowerCase().includes(searchLower)) ||
          tutorial.platform.some(platform => (platforms[platform] || platform).toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Other filters
      if (filters.services.length > 0 && !filters.services.some(service => tutorial.services.includes(service))) return false;
      if (filters.platforms.length > 0 && !filters.platforms.some(platform => tutorial.platform.includes(platform))) return false;
      if (filters.deployments.length > 0 && !filters.deployments.some(deployment => tutorial.deployment.includes(deployment))) return false;
      if (filters.showProOnly && !tutorial.pro) return false;

      return true;
    });

    // Sort tutorials
    return filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else {
        return b.services.length - a.services.length; // Sort by number of services
      }
    });
  }, [tutorials, filters, searchTerm, sortBy, services, platforms]);

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
      showProOnly: false,
    });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.services.length > 0 || 
    filters.platforms.length > 0 || 
    filters.deployments.length > 0 || 
    filters.showProOnly || 
    searchTerm.length > 0;

  return (
    <>
      <style>{`
        /* Tutorials Showcase */
        .tutorials-showcase {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Top Bar */
        .top-bar {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: var(--sl-color-bg-sidebar);
          border: 1px solid var(--sl-color-gray-6);
          border-radius: 0.5rem;
          flex-wrap: wrap;
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

        /* Tutorials Grid */
        .tutorials-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        /* Tutorial Cards */
        .tutorial-card {
          background: var(--sl-color-bg-sidebar);
          border: 1px solid var(--sl-color-gray-6);
          border-radius: 0.75rem;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .tutorial-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .card-image {
          position: relative;
          width: 100%;
          height: 200px;
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
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
          .tutorials-showcase {
            padding: 0 0.75rem;
          }

          .top-bar {
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

          .tutorials-grid {
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
      
      <div className="tutorials-showcase">
        <div className="top-bar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search tutorials..."
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

          <label className="pro-toggle">
            <input
              type="checkbox"
              checked={filters.showProOnly}
              onChange={(e) => setFilters(prev => ({ ...prev, showProOnly: e.target.checked }))}
            />
            Pro Only
          </label>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'title' | 'services')}
            className="sort-select"
          >
            <option value="title">A-Z</option>
            <option value="services">By Services</option>
          </select>

          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="clear-filters">
              Clear
            </button>
          )}
        </div>

        <div className="results-info">
          {filteredTutorials.length} tutorial{filteredTutorials.length !== 1 ? 's' : ''}
        </div>

        <div className="tutorials-grid">
          {filteredTutorials.map((tutorial, index) => (
            <TutorialCard
              key={`${tutorial.slug}-${index}`}
              tutorial={tutorial}
              services={services}
              platforms={platforms}
              deployments={deployments}
            />
          ))}
          
          {filteredTutorials.length === 0 && (
            <div className="no-results">
              <h3>No tutorials found</h3>
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
