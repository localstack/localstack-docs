import React, { useState } from 'react';

// PostHog Survey ID
const POSTHOG_SURVEY_ID = '019c4ba3-c53b-0000-7cef-4903439f7e52';

// Declare PostHog on window
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

const POSITIVE_OPTIONS = [
  'The guide worked as expected',
  'Easy to find the information I needed',
  'Easy to understand',
  'Helped me decide to use the product',
  'Something else',
];

const NEGATIVE_OPTIONS = [
  'Hard to understand',
  'Incorrect information or code sample',
  'Missing the information I needed',
  'Other',
];

// Submit feedback to PostHog
// PostHog surveys use $survey_response, $survey_response_1, $survey_response_2, etc.
// for multiple question responses
const submitFeedbackToPostHog = (
  isHelpful: 'yes' | 'no',
  reason: string,
  additionalFeedback: string,
  pageUrl: string
): void => {
  if (typeof window === 'undefined' || !window.posthog) {
    console.error('PostHog not available');
    return;
  }

  const properties: Record<string, unknown> = {
    $survey_id: POSTHOG_SURVEY_ID,
    $survey_response: isHelpful === 'yes' ? 'Yes 👍' : 'No 👎',
    $survey_response_1: reason, // Selected option (what went wrong / what worked)
    pageUrl: pageUrl,
  };

  if (additionalFeedback.trim()) {
    properties.$survey_response_2 = additionalFeedback; // Additional comments
  }

  window.posthog.capture('survey sent', properties);
};

export const DocsFeedback: React.FC = () => {
  const [feedbackState, setFeedbackState] = useState<
    'initial' | 'positive' | 'negative' | 'submitted'
  >('initial');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleThumbsUp = () => {
    setFeedbackState('positive');
    setSelectedReason('');
    setAdditionalFeedback('');
  };

  const handleThumbsDown = () => {
    setFeedbackState('negative');
    setSelectedReason('');
    setAdditionalFeedback('');
  };

  const handleSubmit = () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '';
    const isPositive = feedbackState === 'positive';

    submitFeedbackToPostHog(
      isPositive ? 'yes' : 'no',
      selectedReason,
      additionalFeedback,
      pageUrl
    );

    setIsSubmitting(false);
    setFeedbackState('submitted');
  };

  const handleCancel = () => {
    setFeedbackState('initial');
    setSelectedReason('');
    setAdditionalFeedback('');
  };

  const options = feedbackState === 'positive' ? POSITIVE_OPTIONS : NEGATIVE_OPTIONS;

  if (feedbackState === 'submitted') {
    return (
      <div className="docs-feedback">
        <div className="docs-feedback-success">
          <svg
            className="docs-feedback-success-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l2.5 2.5L16 9" />
          </svg>
          <span>Thanks for your feedback!</span>
        </div>
      </div>
    );
  }

  if (feedbackState === 'positive' || feedbackState === 'negative') {
    return (
      <div className="docs-feedback">
        <div className="docs-feedback-expanded">
          <div className="docs-feedback-question">
            {feedbackState === 'positive' ? 'Great! What worked best for you?' : 'What went wrong?'}
          </div>
          <div className="docs-feedback-options">
            {options.map((option) => (
              <label key={option} className="docs-feedback-option">
                <input
                  type="radio"
                  name="feedback-reason"
                  value={option}
                  checked={selectedReason === option}
                  onChange={(e) => setSelectedReason(e.target.value)}
                />
                <span className="docs-feedback-option-text">{option}</span>
              </label>
            ))}
          </div>
          <textarea
            value={additionalFeedback}
            onChange={(e) => setAdditionalFeedback(e.target.value)}
            placeholder="Any additional feedback? (optional)"
            className="docs-feedback-textarea"
            rows={3}
          />
          <div className="docs-feedback-actions">
            <button
              onClick={handleCancel}
              className="docs-feedback-cancel-btn"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedReason}
              className="docs-feedback-submit-btn"
              type="button"
            >
              {isSubmitting ? 'Submitting...' : 'Submit feedback'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="docs-feedback">
      <div className="docs-feedback-initial">
        <span className="docs-feedback-label">Was this page helpful?</span>
        <div className="docs-feedback-buttons">
          <button
            onClick={handleThumbsUp}
            className="docs-feedback-btn"
            aria-label="Yes, this was helpful"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            Yes
          </button>
          <button
            onClick={handleThumbsDown}
            className="docs-feedback-btn"
            aria-label="No, this was not helpful"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
            </svg>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocsFeedback;
