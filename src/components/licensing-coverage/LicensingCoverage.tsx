import React, { useState, useMemo } from 'react';
import data from '@/data/licensing/current-plans.json';

type ServiceEntry = {
  name: string;
  serviceId: string;
  minimumPlan: string;
};

type Category = {
  name: string;
  services: ServiceEntry[];
};

type EnhancementEntry = {
  name: string;
  docsUrl?: string;
  plans: Record<string, boolean | string>;
};

type LicensingData = {
  metadata: Record<string, any>;
  categories: Category[];
  enhancements: EnhancementEntry[];
};

const licensingData = data as LicensingData;

const PLAN_HIERARCHY = ['Hobby', 'Base', 'Ultimate', 'Enterprise'];
const ALL_PLANS = ['Hobby', 'Base', 'Ultimate', 'Enterprise', 'Student'];

function isAvailable(minimumPlan: string, plan: string): boolean {
  if (plan === 'Student') return isAvailable(minimumPlan, 'Ultimate');
  const minIdx = PLAN_HIERARCHY.indexOf(minimumPlan);
  const planIdx = PLAN_HIERARCHY.indexOf(plan);
  if (minIdx === -1 || planIdx === -1) return false;
  return planIdx >= minIdx;
}

function renderCellValue(value: boolean | string): React.ReactNode {
  if (value === true) return '✅';
  if (value === false) return '❌';
  return value;
}

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  border: '1px solid #999CAD',
  background: '#AFB2C2',
  color: 'var(--sl-color-gray-1)',
  fontFamily: 'AeonikFono',
  fontSize: '14px',
  fontWeight: '500',
  lineHeight: '16px',
  letterSpacing: '-0.15px',
  padding: '12px 8px',
};

const bodyFont: React.CSSProperties = {
  color: 'var(--sl-color-gray-1)',
  fontFamily: 'AeonikFono',
  fontSize: '14px',
  fontWeight: '400',
  lineHeight: '16px',
  letterSpacing: '-0.15px',
};

const cellStyle: React.CSSProperties = {
  border: '1px solid #999CAD',
  padding: '12px 8px',
  textAlign: 'center',
  whiteSpace: 'normal',
};

const categoryRowStyle: React.CSSProperties = {
  border: '1px solid #999CAD',
  padding: '10px 8px',
  fontFamily: 'AeonikFono',
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--sl-color-gray-1)',
  background: 'color-mix(in srgb, var(--sl-color-gray-6) 50%, transparent)',
};

const inputStyle: React.CSSProperties = {
  color: '#707385',
  fontFamily: 'AeonikFono',
  fontSize: '14px',
  fontWeight: '500',
  lineHeight: '24px',
  letterSpacing: '-0.2px',
};

export default function LicensingCoverage() {
  const [filter, setFilter] = useState('');
  const lowerFilter = filter.toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!lowerFilter) return licensingData.categories;
    return licensingData.categories
      .map((cat) => ({
        ...cat,
        services: cat.services.filter((svc) =>
          svc.name.toLowerCase().includes(lowerFilter)
        ),
      }))
      .filter((cat) => cat.services.length > 0);
  }, [lowerFilter]);

  const filteredEnhancements = useMemo(() => {
    if (!lowerFilter) return licensingData.enhancements;
    return licensingData.enhancements.filter((e) =>
      e.name.toLowerCase().includes(lowerFilter)
    );
  }, [lowerFilter]);

  const hasResults =
    filteredCategories.length > 0 || filteredEnhancements.length > 0;

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3 mb-4 mt-3">
        <input
          type="text"
          placeholder="Filter by service or feature name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-sm"
          style={inputStyle}
        />
      </div>

      <div className="block max-w-full overflow-x-auto overflow-y-hidden">
        <table
          style={{
            display: 'table',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            width: '100%',
            minWidth: '100%',
          }}
        >
          <colgroup>
            <col style={{ width: '34%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ ...headerStyle, textAlign: 'left' }}>
                AWS Services
              </th>
              {ALL_PLANS.map((plan) => (
                <th key={plan} style={headerStyle}>
                  {plan}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={bodyFont}>
            {!hasResults && (
              <tr>
                <td
                  colSpan={ALL_PLANS.length + 1}
                  style={{ ...cellStyle, textAlign: 'center', padding: '24px' }}
                >
                  No matching services or features found.
                </td>
              </tr>
            )}
            {filteredCategories.map((cat) => (
              <React.Fragment key={cat.name}>
                <tr>
                  <td
                    colSpan={ALL_PLANS.length + 1}
                    style={categoryRowStyle}
                  >
                    {cat.name}
                  </td>
                </tr>
                {cat.services.map((svc, idx) => (
                  <tr key={`${cat.name}-${idx}`}>
                    <td style={{ ...cellStyle, textAlign: 'left' }}>
                      {svc.serviceId ? (
                        <a href={`/aws/services/${svc.serviceId}/`}>
                          {svc.name}
                        </a>
                      ) : (
                        svc.name
                      )}
                    </td>
                    {ALL_PLANS.map((plan) => (
                      <td key={plan} style={cellStyle}>
                        {renderCellValue(isAvailable(svc.minimumPlan, plan))}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {filteredEnhancements.length > 0 && (
              <>
                <tr>
                  <td
                    colSpan={ALL_PLANS.length + 1}
                    style={categoryRowStyle}
                  >
                    Emulator Enhancements
                  </td>
                </tr>
                {filteredEnhancements.map((enh, idx) => (
                  <tr key={`enh-${idx}`}>
                    <td style={{ ...cellStyle, textAlign: 'left' }}>
                      {enh.docsUrl ? (
                        <a href={enh.docsUrl}>{enh.name}</a>
                      ) : (
                        enh.name
                      )}
                    </td>
                    {ALL_PLANS.map((plan) => (
                      <td
                        key={plan}
                        style={{
                          ...cellStyle,
                          fontSize:
                            typeof enh.plans[plan] === 'string'
                              ? '12px'
                              : '14px',
                        }}
                      >
                        {renderCellValue(enh.plans[plan])}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
