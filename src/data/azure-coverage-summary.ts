/**
 * Aggregate API-coverage figures per Azure resource provider.
 *
 * Reads the same `src/data/azure-coverage/*.json` files that the per-service
 * coverage tables use — the ones regenerated weekly from the emulator by
 * `.github/workflows/update-azure-coverage.yml` — so these numbers never drift
 * from what the service pages show.
 *
 * Data-plane pseudo-namespaces are folded into their real ARM parent, matching
 * how the services page groups them.
 */
import { canonicalProvider } from './azure-providers';

interface CoverageFile {
  service: string;
  details: Record<string, Record<string, { implemented?: boolean }>>;
}

const files = import.meta.glob<CoverageFile>('./azure-coverage/*.json', {
  eager: true,
  import: 'default',
});

export interface ProviderCoverage {
  namespace: string;
  /** Operation groups (resource types) the emulator routes for this provider. */
  resourceTypes: number;
  implemented: number;
  total: number;
  /** 0-100, rounded to one decimal. */
  percent: number;
  /** Namespaces folded in, e.g. Microsoft.BlobStorage under Microsoft.Storage. */
  absorbed: string[];
}

/**
 * Maturity bands. The thresholds are a documentation convention, not something
 * the emulator reports — chosen so that "Broad" means most of the surface is
 * present rather than merely the happy path.
 */
export type CoverageBand = 'Broad' | 'Partial' | 'Early';

export function coverageBand(percent: number): CoverageBand {
  if (percent >= 70) return 'Broad';
  if (percent >= 25) return 'Partial';
  return 'Early';
}

let cached: Map<string, ProviderCoverage> | null = null;

export function coverageByProvider(): Map<string, ProviderCoverage> {
  if (cached) return cached;

  const acc = new Map<string, ProviderCoverage>();

  for (const raw of Object.values(files)) {
    if (!raw?.service || !raw.details) continue;
    const declared = raw.service;
    const namespace = canonicalProvider(declared);

    const entry =
      acc.get(namespace) ??
      {
        namespace,
        resourceTypes: 0,
        implemented: 0,
        total: 0,
        percent: 0,
        absorbed: [] as string[],
      };

    for (const operations of Object.values(raw.details)) {
      entry.resourceTypes += 1;
      for (const op of Object.values(operations)) {
        entry.total += 1;
        if (op?.implemented) entry.implemented += 1;
      }
    }
    if (declared !== namespace && !entry.absorbed.includes(declared)) {
      entry.absorbed.push(declared);
    }
    acc.set(namespace, entry);
  }

  for (const entry of acc.values()) {
    entry.percent = entry.total
      ? Math.round((entry.implemented / entry.total) * 1000) / 10
      : 0;
    entry.absorbed.sort();
  }

  cached = acc;
  return acc;
}

export function coverageFor(namespace: string): ProviderCoverage | undefined {
  return coverageByProvider().get(canonicalProvider(namespace));
}

export function coverageTotals() {
  const all = [...coverageByProvider().values()];
  const implemented = all.reduce((n, p) => n + p.implemented, 0);
  const total = all.reduce((n, p) => n + p.total, 0);
  return {
    providers: all.length,
    resourceTypes: all.reduce((n, p) => n + p.resourceTypes, 0),
    implemented,
    total,
    percent: total ? Math.round((implemented / total) * 1000) / 10 : 0,
  };
}
