import React from 'react';

type PricingTier = 'Free' | 'Base' | 'Ultimate';

interface PricingBadgeProps {
  tags: string[];
}

const PricingBadge: React.FC<PricingBadgeProps> = ({ tags }) => {
  // Find pricing tags from the tags array
  const pricingTags = tags.filter((tag): tag is PricingTier => 
    ['Free', 'Base', 'Ultimate'].includes(tag)
  );
  
  if (pricingTags.length === 0) return null;
  
  // Sort by hierarchy and take the highest tier
  const sortedTags = pricingTags.sort((a, b) => {
    const order: Record<PricingTier, number> = { 'Free': 0, 'Base': 1, 'Ultimate': 2 };
    return order[a] - order[b];
  });
  
  const primaryPlan = sortedTags[sortedTags.length - 1];
  
  // Determine which plans have access based on inheritance
  const getAvailablePlans = (plan: PricingTier): PricingTier[] => {
    switch (plan) {
      case 'Free':
        return ['Free', 'Base', 'Ultimate'];
      case 'Base':
        return ['Base', 'Ultimate'];
      case 'Ultimate':
        return ['Ultimate'];
    }
  };
  
  const availablePlans = getAvailablePlans(primaryPlan);
  
  const getBadgeColor = (plan: PricingTier) => {
    switch (plan) {
      case 'Free':
        return '#10b981'; // green
      case 'Base':
        return '#3b82f6'; // blue  
      case 'Ultimate':
        return '#f59e0b'; // amber
    }
  };
  
  return (
    <div className="pricing-badge-container">
      <div className="pricing-badge-header">
        <span 
          className="pricing-badge-main"
          style={{ 
            backgroundColor: getBadgeColor(primaryPlan),
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          Available on {primaryPlan}
        </span>
      </div>
      <div className="pricing-badge-details">
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          This service is available on: {' '}
        </span>
        {availablePlans.map((plan, index) => (
          <span key={plan}>
            <span 
              style={{ 
                fontWeight: 600,
                color: getBadgeColor(plan)
              }}
            >
              {plan}
            </span>
            {index < availablePlans.length - 1 && (
              <span style={{ color: '#6b7280' }}> • </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export { PricingBadge };
export default PricingBadge; 