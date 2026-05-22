import React, {useState} from 'react';
import data from '@/data/replicator/coverage.json';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface StrategyDetail {
  policy_statements: string[];
  identifier: string | null;
}

interface ResourceTree {
  resources: string[];
  extra_policy_statements: string[];
}

interface ExtraConfigField {
  type: string;
  default: string;
  description: string;
}

interface Resource {
  resource_type: string;
  service: string;
  single?: StrategyDetail;
  batch?: StrategyDetail;
  resource_tree?: ResourceTree;
  extra_config?: Record<string, ExtraConfigField>;
}

const coverage = data as Resource[];

type StrategyKind = 'single' | 'batch' | 'tree';

const STRATEGY_STYLES: Record<
  StrategyKind,
  { background: string; color: string; }
> = {
  single: {background: '#e1e3eb', color: '#3a3c47'},
  batch: {background: '#afbcfa', color: '#1e40af'},
  tree: {background: '#c8aefd', color: '#3b05a7'},
};

const STRATEGY_DESCRIPTIONS: Record<StrategyKind, string> = {
  single: 'Replicates one specific resource identified by its ID.',
  batch:
    'Replicates multiple resources in one job (e.g. all SSM parameters under a path).',
  tree: 'Replicates this resource together with its dependent child resources.',
};

const legendStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.5rem',
  flexWrap: 'wrap',
}

const legendTitleStyle: React.CSSProperties = {
  color: "var(--gray-neutral-400)",
  fontFamily: "var(--font-aeonik-fono)",
  fontSize: "14px",
}

const legendItemsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1rem',
  paddingLeft: '0.5rem',
  flexWrap: 'wrap',
  color: "var(--gray-neutral-400)",
  fontSize: "14px",
};

const legendItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

const pillStyle: React.CSSProperties = {
  padding: '2px 8px',
  border: '1px dashed #999CAD',
  borderRadius: '4px',
  fontFamily: 'var(--font-aeonik-fono)',
  fontSize: '12px',
  fontWeight: 500,
  whiteSpace: 'nowrap',
};

const badgeStyle = (kind: StrategyKind): React.CSSProperties => {
  const c = STRATEGY_STYLES[kind];
  return {
    ...pillStyle,
    background: c.background,
    color: c.color,
    border: `1px solid`,
  };
};

const configPillStyle: React.CSSProperties = {
  ...pillStyle,
  border: '1px dashed #999CAD',
  opacity: 0.85,
};

const codeChipStyle: React.CSSProperties = {
  fontFamily: 'var(--font-aeonik-fono)',
  fontSize: '12.5px',
};

const cardStyle = (kind: StrategyKind): React.CSSProperties => ({
  border: `1px solid ${STRATEGY_STYLES[kind].background}`,
  borderRadius: '6px',
  margin: 0
});

const cardHeaderStyle = (kind: StrategyKind): React.CSSProperties => {
  const c = STRATEGY_STYLES[kind];
  return {
    background: c.background,
    color: c.color,
    padding: '6px 12px',
    fontWeight: 600,
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };
};

const cardBodyStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '10px 12px',
};

const cardDescriptionStyle: React.CSSProperties = {
  opacity: 0.75,
  fontSize: '12px',
};

const cardLabelStyle: React.CSSProperties = {
  marginBottom: '3px',
  fontWeight: 600,
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
  margin: 0,
  paddingLeft: 0,
  listStyle: 'none',
};

const emptyStyle: React.CSSProperties = {opacity: 0.6};

const rowToggleStyle = (isOpen: boolean): React.CSSProperties => ({
  display: "inline-block",
  flexShrink: 0,
  opacity: 0.7,
  marginRight: '4px',
  transition: 'transform 0.15s',
  transform: isOpen ? 'rotate(90deg)' : 'none',
});

const expandedCellStyle: React.CSSProperties = {
  padding: '8px',
  border: '1px solid #999CAD',
  background: 'var(--sl-color-gray-6)',
};

const strategiesGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
  gap: '12px',
  alignItems: 'stretch',
  width: '100%',
  minWidth: 0,
};

const extraConfigStyle: React.CSSProperties = {
  marginTop: '12px',
  padding: '12px',
  border: '1px solid #999CAD',
  borderRadius: '6px',
  background: 'var(--sl-color-gray-5)',
  color: 'var(--sl-color-gray-1)',
  textAlign: 'left',
};

const extraConfigTitleStyle: React.CSSProperties = {
  marginBottom: '8px',
  fontWeight: 600,
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const extraConfigFieldStyle: React.CSSProperties = {
  marginBottom: '8px',
  fontSize: '13px',
};

const extraConfigMetaStyle: React.CSSProperties = {opacity: 0.7};

const extraConfigDescriptionStyle: React.CSSProperties = {
  marginTop: '4px',
  opacity: 0.9,
};

const tableStyle: React.CSSProperties = {
  borderCollapse: 'collapse',
  tableLayout: 'auto',
  width: '100%',
  display: 'table',
}

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  border: '1px solid #999CAD',
  background: 'var(--sl-color-gray-5)',
  color: 'var(--sl-color-gray-1)',
  fontFamily: 'var(--font-aeonik-fono)',
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '16px',
  letterSpacing: '-0.15px',
  padding: '12px 8px',
};

const cellStyle: React.CSSProperties = {
  textAlign: 'center',
  border: '1px solid #999CAD',
  padding: '12px 8px',
  whiteSpace: 'nowrap',
};

const badgesContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '4px',
};

const bodyStyle: React.CSSProperties = {
  color: 'var(--sl-color-gray-1)',
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '16px',
};

const buttonStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
};

function StrategyBadge({kind, label}: { kind: StrategyKind; label: string }) {
  return <span style={badgeStyle(kind)}>{label}</span>;
}

function CodeChip({children}: { children: React.ReactNode }) {
  return <code style={codeChipStyle}>{children}</code>;
}

function StrategyCard({
                        kind,
                        label,
                        identifier,
                        identifiers,
                        identifierLabel,
                        actions,
                        actionsLabel,
                        emptyActionsLabel,
                      }: {
  kind: StrategyKind;
  label: string;
  identifier?: string | null;
  identifiers?: string[] | null;
  identifierLabel?: string;
  actions: string[];
  actionsLabel?: string;
  emptyActionsLabel?: string;
}) {
  return (
    <div style={cardStyle(kind)}>
      <div style={cardHeaderStyle(kind)}>{label}</div>
      <div style={cardBodyStyle}>
        <div style={cardDescriptionStyle}>{STRATEGY_DESCRIPTIONS[kind]}</div>
        <div>
          <div style={cardLabelStyle}>{identifierLabel ?? 'Identifier'}</div>
          {identifier ? (
            <CodeChip>{identifier}</CodeChip>
          ) : identifiers ? (
            <ul style={listStyle}>
              {identifiers.map((iden) => (
                <li key={iden}>
                  <CodeChip>{iden}</CodeChip>
                </li>
              ))}
            </ul>
          ) : (
            <span style={emptyStyle}>None required</span>
          )}
        </div>
        <div>
          <div style={cardLabelStyle}>
            {actionsLabel ?? 'Required IAM Actions'}
          </div>
          {actions.length === 0 ? (
            <span style={emptyStyle}>{emptyActionsLabel ?? 'None'}</span>
          ) : (
            <ul style={listStyle}>
              {actions.map((a) => (
                <li key={a}>
                  <CodeChip>{a}</CodeChip>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ResourceRow({isOpen, row, toggle}: { isOpen: boolean, row: Resource, toggle: () => void }) {
  return (
    <TableRow onClick={toggle} role="button" aria-expanded={isOpen} style={{cursor: 'pointer'}}>
      <TableCell style={{...cellStyle, textAlign: 'left',}}>
        <span aria-hidden="true" style={rowToggleStyle(isOpen)}>▶</span>
        {row.resource_type}
      </TableCell>
      <TableCell style={cellStyle}>{row.service}</TableCell>
      <TableCell style={cellStyle}>
        <div style={badgesContainerStyle}>
          {row.single && <StrategyBadge kind="single" label="Single"/>}
          {row.batch && <StrategyBadge kind="batch" label="Batch"/>}
          {row.resource_tree && <StrategyBadge kind="tree" label="Tree"/>}
          {row.extra_config && (<span style={configPillStyle}>+ config</span>)}
        </div>
      </TableCell>
    </TableRow>
  )
}

function ExpandedRow({row}: { row: Resource }) {
  return (
    <TableRow>
      <TableCell colSpan={3} style={expandedCellStyle}>
        <div style={strategiesGridStyle}>
          {row.single && (
            <StrategyCard
              kind="single"
              label="Single Resource"
              identifier={row.single!.identifier}
              actions={row.single!.policy_statements}
            />
          )}
          {row.batch && (
            <StrategyCard
              kind="batch"
              label="Batch"
              identifier={row.batch!.identifier}
              actions={row.batch!.policy_statements}
            />
          )}
          {row.resource_tree && (
            <StrategyCard
              kind="tree"
              label="Tree"
              identifierLabel="Child Resources"
              identifiers={
                row.resource_tree!.resources.length > 0
                  ? row.resource_tree!.resources
                  : null
              }
              actions={
                row.resource_tree!.extra_policy_statements
              }
              actionsLabel="Extra IAM Actions (in addition to Single/Batch)"
              emptyActionsLabel="No extra actions required"
            />
          )}
        </div>
        {row.extra_config && (
          <div style={extraConfigStyle}>
            <div style={extraConfigTitleStyle}>Extra Configuration</div>
            {Object.entries(row.extra_config).map(
              ([name, field]) => (
                <div key={name} style={extraConfigFieldStyle}>
                  <div>
                    <CodeChip>{name}</CodeChip>
                    <span style={extraConfigMetaStyle}>
                                    ( {field.type}{field.default && (
                      <span>, default: <CodeChip>{field.default}</CodeChip>)</span>
                    ) || ' )'}
                                  </span>
                  </div>
                  <div style={extraConfigDescriptionStyle}>{field.description}</div>
                </div>
              )
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}

export default function ReplicatorCoverage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () =>
    setExpanded(new Set(coverage.map((r) => r.resource_type)));
  const collapseAll = () => setExpanded(new Set());

  const allOpen = expanded.size === coverage.length;

  return (
    <React.Fragment>
      <button
        type="button"
        onClick={allOpen ? collapseAll : expandAll}
        className="px-3 py-1 border rounded"
        style={buttonStyle}
      >
        {allOpen ? 'Collapse all' : 'Expand all'}
      </button>
      <div style={legendStyle}>
        <span style={legendTitleStyle}>Legend:</span>
        <div style={legendItemsStyle}>
          <span style={legendItemStyle}>
            <StrategyBadge kind="single" label="Single"/>
            <span>One resource</span>
          </span>
          <span style={legendItemStyle}>
            <StrategyBadge kind="batch" label="Batch"/>
            <span>Many similar resources in one job</span>
          </span>
          <span style={legendItemStyle}>
            <StrategyBadge kind="tree" label="Tree"/>
            <span>Tree of related resources</span>
          </span>
        </div>
      </div>
      <Table style={tableStyle}>
        <TableHeader>
          <TableRow>
            <TableHead style={{...headerStyle, textAlign: 'left'}}>Resource Type</TableHead>
            <TableHead style={headerStyle}>Service</TableHead>
            <TableHead style={headerStyle}>Replication Strategies</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody style={bodyStyle}>
          {coverage.map((row) => {
            const key = row.resource_type;
            const isOpen = expanded.has(key);
            return (
              <React.Fragment key={key}>
                <ResourceRow isOpen={isOpen} row={row} toggle={() => toggle(key)}/>
                {isOpen && <ExpandedRow row={row}/>}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}

// Testing instructions:
// 1. Verify that the table expands to 100% width of its container
// 2. Check that columns maintain their widths during pagination
// 3. Test with different viewport sizes to ensure responsive behavior
// 4. Try resizing columns to ensure the resize functionality works
// 5. Verify that content in cells is properly displayed with ellipsis for overflow
