import React, { useState } from 'react';
import data from '@/data/replicator/coverage.json';
import { ChevronRight } from 'lucide-react';

type ReplicationTypeInfo = {
  policy_statements: string[];
  identifier: string | null;
};

type ResourceTreeInfo = {
  resources: string[];
  extra_policy_statements: string[];
};

type ExtraConfigField = {
  type: string;
  default: unknown;
  description: string;
};

type ResourceCoverage = {
  resource_type: string;
  service: string;
  single?: ReplicationTypeInfo;
  batch?: ReplicationTypeInfo;
  resource_tree?: ResourceTreeInfo;
  extra_config?: Record<string, ExtraConfigField>;
};

const coverage = data as ResourceCoverage[];

type StrategyKey = 'single' | 'batch' | 'tree';

const STRATEGY_META: Record<
  StrategyKey,
  { label: string; color: string; description: string }
> = {
  single: {
    label: 'Single',
    color: '#2563eb',
    description: 'Replicate one resource at a time by identifier or ARN.',
  },
  batch: {
    label: 'Batch',
    color: '#7c3aed',
    description: 'Discover and replicate many matching resources in one job.',
  },
  tree: {
    label: 'Tree',
    color: '#0d9488',
    description:
      'Use the TREE explore strategy to also replicate related child resources.',
  },
};

function StrategyBadge({
  strategy,
  active,
}: {
  strategy: StrategyKey;
  active: boolean;
}) {
  const meta = STRATEGY_META[strategy];
  return (
    <span
      title={
        active
          ? `${meta.label}: ${meta.description}`
          : `${meta.label} replication is not supported for this resource`
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: '16px',
        whiteSpace: 'nowrap',
        border: `1px solid ${active ? meta.color : 'var(--sl-color-gray-5)'}`,
        color: active ? '#fff' : 'var(--sl-color-gray-3)',
        background: active ? meta.color : 'transparent',
        opacity: active ? 1 : 0.6,
      }}
    >
      {meta.label}
    </span>
  );
}

function PolicyList({ statements }: { statements: string[] }) {
  if (!statements.length) {
    return (
      <span style={{ color: 'var(--sl-color-gray-3)' }}>
        No additional actions required
      </span>
    );
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {statements.map((statement) => (
        <code
          key={statement}
          style={{
            fontSize: '12px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'var(--sl-color-gray-6)',
            border: '1px solid var(--sl-color-gray-5)',
            whiteSpace: 'nowrap',
          }}
        >
          {statement}
        </code>
      ))}
    </div>
  );
}

function Identifier({ value }: { value: string | null }) {
  if (!value) {
    return (
      <span style={{ color: 'var(--sl-color-gray-3)' }}>None required</span>
    );
  }
  return (
    <code
      style={{
        fontSize: '12px',
        padding: '2px 6px',
        borderRadius: '4px',
        background: 'var(--sl-color-gray-6)',
        border: '1px solid var(--sl-color-gray-5)',
      }}
    >
      {value}
    </code>
  );
}

function DetailSection({
  strategy,
  children,
}: {
  strategy: StrategyKey;
  children: React.ReactNode;
}) {
  const meta = STRATEGY_META[strategy];
  return (
    <div
      style={{
        borderLeft: `3px solid ${meta.color}`,
        paddingLeft: '12px',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <StrategyBadge strategy={strategy} active />
        <span style={{ fontSize: '13px', color: 'var(--sl-color-gray-3)' }}>
          {meta.description}
        </span>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
          color: 'var(--sl-color-gray-3)',
          marginBottom: '4px',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function ResourceDetails({ resource }: { resource: ResourceCoverage }) {
  return (
    <div style={{ padding: '16px 20px', background: 'var(--sl-color-gray-7, var(--sl-color-gray-6))' }}>
      {resource.single && (
        <DetailSection strategy="single">
          <Field label="Identifier">
            <Identifier value={resource.single.identifier} />
          </Field>
          <Field label="Required IAM actions">
            <PolicyList statements={resource.single.policy_statements} />
          </Field>
        </DetailSection>
      )}

      {resource.batch && (
        <DetailSection strategy="batch">
          <Field label="Identifier">
            <Identifier value={resource.batch.identifier} />
          </Field>
          <Field label="Required IAM actions">
            <PolicyList statements={resource.batch.policy_statements} />
          </Field>
        </DetailSection>
      )}

      {resource.resource_tree && (
        <DetailSection strategy="tree">
          <Field label="Replicated related resources">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {resource.resource_tree.resources.map((r) => (
                <code
                  key={r}
                  style={{
                    fontSize: '12px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'var(--sl-color-gray-6)',
                    border: '1px solid var(--sl-color-gray-5)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r}
                </code>
              ))}
            </div>
          </Field>
          <Field label="Additional IAM actions">
            <PolicyList
              statements={resource.resource_tree.extra_policy_statements}
            />
          </Field>
        </DetailSection>
      )}

      {resource.extra_config && (
        <DetailSection strategy="single">
          <Field label="Extra configuration">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(resource.extra_config).map(([name, field]) => (
                <div key={name} style={{ fontSize: '13px' }}>
                  <code
                    style={{
                      fontSize: '12px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'var(--sl-color-gray-6)',
                      border: '1px solid var(--sl-color-gray-5)',
                    }}
                  >
                    {name}
                  </code>{' '}
                  <span style={{ color: 'var(--sl-color-gray-3)' }}>
                    ({field.type}
                    {field.default !== null && field.default !== undefined
                      ? `, default: ${JSON.stringify(field.default)}`
                      : ''}
                    )
                  </span>
                  <div style={{ marginTop: '2px' }}>{field.description}</div>
                </div>
              ))}
            </div>
          </Field>
        </DetailSection>
      )}
    </div>
  );
}

export default function ReplicatorCoverage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (resourceType: string) =>
    setExpanded((prev) => ({ ...prev, [resourceType]: !prev[resourceType] }));

  return (
    <div className="w-full" style={{ fontFamily: 'var(--font-aeonik-fono)' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '12px',
          fontSize: '13px',
          color: 'var(--sl-color-gray-2)',
        }}
      >
        {(Object.keys(STRATEGY_META) as StrategyKey[]).map((key) => (
          <span
            key={key}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <StrategyBadge strategy={key} active />
            <span>{STRATEGY_META[key].description}</span>
          </span>
        ))}
      </div>

      <div
        role="table"
        style={{
          border: '1px solid var(--sl-color-gray-5)',
          borderRadius: '8px',
          overflow: 'hidden',
          color: 'var(--sl-color-gray-1)',
        }}
      >
        <div
          role="row"
          className="hidden md:grid"
          style={{
            gridTemplateColumns:
              '1.75rem minmax(0, 1fr) 9rem minmax(0, 14rem)',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'var(--sl-color-gray-6)',
            borderBottom: '1px solid var(--sl-color-gray-5)',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <span aria-hidden="true" />
          <span role="columnheader">Resource Type</span>
          <span role="columnheader">Service</span>
          <span role="columnheader">Replication Strategies</span>
        </div>

        {coverage.map((resource, idx) => {
          const isOpen = !!expanded[resource.resource_type];
          return (
            <div
              key={resource.resource_type}
              role="row"
              style={{
                borderTop:
                  idx === 0 ? 'none' : '1px solid var(--sl-color-gray-5)',
              }}
            >
              <button
                type="button"
                onClick={() => toggle(resource.resource_type)}
                aria-expanded={isOpen}
                className="replicator-row w-full grid items-start gap-x-3 gap-y-2 grid-cols-[1.75rem_minmax(0,1fr)] md:grid-cols-[1.75rem_minmax(0,1fr)_9rem_minmax(0,14rem)] md:items-center hover:bg-[var(--sl-color-gray-6)] transition-colors"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--sl-color-gray-1)',
                  fontFamily: 'var(--font-aeonik-fono)',
                }}
              >
                <ChevronRight
                  size={16}
                  style={{
                    transition: 'transform 0.15s ease',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    color: 'var(--sl-color-gray-3)',
                    marginTop: '4px',
                    flexShrink: 0,
                  }}
                />
                <code
                  style={{
                    minWidth: 0,
                    fontSize: '13px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'var(--sl-color-gray-6)',
                    border: '1px solid var(--sl-color-gray-5)',
                    whiteSpace: 'normal',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    justifySelf: 'start',
                  }}
                >
                  {resource.resource_type}
                </code>
                <span
                  className="col-start-2 md:col-start-auto"
                  style={{
                    fontSize: '14px',
                    overflowWrap: 'anywhere',
                    minWidth: 0,
                  }}
                >
                  <span
                    className="md:hidden"
                    style={{
                      color: 'var(--sl-color-gray-3)',
                      marginRight: '6px',
                    }}
                  >
                    Service:
                  </span>
                  {resource.service}
                </span>
                <div
                  className="col-start-2 md:col-start-auto"
                  style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}
                >
                  <StrategyBadge strategy="single" active={!!resource.single} />
                  <StrategyBadge strategy="batch" active={!!resource.batch} />
                  <StrategyBadge
                    strategy="tree"
                    active={!!resource.resource_tree}
                  />
                </div>
              </button>
              {isOpen && <ResourceDetails resource={resource} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
