import React, { useMemo, useState } from 'react';

export interface AzureShowcaseEntry {
  name: string;
  description: string;
  url: string;
  /** Blob URL of the upstream README; cards link here so they open a page. */
  readme?: string;
  image?: string;
  services: string[];
  deployment: string[];
  useCases: string[];
  ciVerified?: boolean;
}

interface Props {
  entries: AzureShowcaseEntry[];
  /** Noun used in the search placeholder and the result count. */
  noun: string;
  /** Samples report CI status; tutorials have none. */
  showCiStatus?: boolean;
}

const ALL = '';

/**
 * Card grid with search and facet filters for Azure samples and tutorials.
 *
 * Deliberately separate from the AWS and Snowflake showcases: everything here
 * links out to the source repository rather than to a copied page, the facets
 * differ, and keeping it apart means the shared components stay untouched.
 */
export const AzureShowcase: React.FC<Props> = ({ entries, noun, showCiStatus = false }) => {
  const [search, setSearch] = useState('');
  const [service, setService] = useState(ALL);
  const [deployment, setDeployment] = useState(ALL);
  const [useCase, setUseCase] = useState(ALL);

  const facet = (key: 'services' | 'deployment' | 'useCases') =>
    useMemo(
      () => [...new Set(entries.flatMap((e) => e[key]))].sort((a, b) => a.localeCompare(b)),
      [entries]
    );

  const allServices = facet('services');
  const allDeployments = facet('deployment');
  const allUseCases = facet('useCases');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries
      .filter((e) => {
        if (term) {
          const haystack = [e.name, e.description, ...e.services, ...e.deployment, ...e.useCases]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(term)) return false;
        }
        if (service && !e.services.includes(service)) return false;
        if (deployment && !e.deployment.includes(deployment)) return false;
        if (useCase && !e.useCases.includes(useCase)) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [entries, search, service, deployment, useCase]);

  const reset = () => {
    setSearch('');
    setService(ALL);
    setDeployment(ALL);
    setUseCase(ALL);
  };
  const filtering = Boolean(search || service || deployment || useCase);

  return (
    <div className="azure-showcase">
      <div className="azure-showcase-controls">
        <input
          type="text"
          className="azure-showcase-search"
          placeholder={`Search ${noun}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={`Search ${noun}`}
        />
        <div className="azure-showcase-filters">
          <select value={service} onChange={(e) => setService(e.target.value)} aria-label="Filter by service">
            <option value={ALL}>Services</option>
            {allServices.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={useCase} onChange={(e) => setUseCase(e.target.value)} aria-label="Filter by use case">
            <option value={ALL}>Use Cases</option>
            {allUseCases.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={deployment} onChange={(e) => setDeployment(e.target.value)} aria-label="Filter by deployment">
            <option value={ALL}>Deployment</option>
            {allDeployments.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <p className="azure-showcase-count">
        {filtered.length} {filtered.length === 1 ? noun.replace(/s$/, '') : noun}
        {filtering && (
          <button type="button" className="azure-showcase-reset" onClick={reset}>
            Clear filters
          </button>
        )}
      </p>

      {filtered.length === 0 ? (
        <div className="no-results"><p>Nothing matches those filters.</p></div>
      ) : (
        <div className="azure-showcase-grid">
          {filtered.map((entry) => (
            <a
              key={entry.url}
              href={entry.readme ?? entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="azure-showcase-card"
            >
              <div className="azure-showcase-heading">
                <h3>{entry.name}</h3>
                {showCiStatus && entry.ciVerified && (
                  <span className="azure-showcase-ci" title="Exercised by CI on every pull request">
                    CI verified
                  </span>
                )}
              </div>

              {entry.image && (
                <div className="azure-showcase-image">
                  <img src={entry.image} alt={`${entry.name} architecture`} loading="lazy" />
                </div>
              )}

              <div className="azure-showcase-body">
                <div className="azure-showcase-pills">
                  {entry.services.slice(0, 5).map((s) => (
                    <span key={s} className="azure-showcase-pill">{s}</span>
                  ))}
                  {entry.services.length > 5 && (
                    <span className="azure-showcase-pill">+{entry.services.length - 5}</span>
                  )}
                </div>
                <p className="azure-showcase-description">{entry.description}</p>
                <span className="azure-showcase-link">View on GitHub →</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default AzureShowcase;
