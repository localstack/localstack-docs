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
  'Accurate',
  'Easy to understand',
  'Solved my problem',
  'Helped me decide to use the product',
  'Other',
];

const NEGATIVE_OPTIONS = [
  'Hard to understand',
  'Incorrect information',
  'Missing the information',
  'Other',
];

// Submit feedback to PostHog
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
    reason: reason,
    pageUrl: pageUrl,
  };

  if (additionalFeedback.trim()) {
    properties.$survey_response_1 = additionalFeedback;
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

  const options = feedbackState === 'positive' ? POSITIVE_OPTIONS : NEGATIVE_OPTIONS;

  if (feedbackState === 'submitted') {
    return (
      <div className="sidebar-feedback">
        <div className="sidebar-feedback-success">
          <svg
            className="sidebar-feedback-success-icon"
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
      <div className="sidebar-feedback">
        <div className="sidebar-feedback-expanded">
          <div className="sidebar-feedback-question">
            {feedbackState === 'positive' ? 'What did you like?' : 'What went wrong?'}
          </div>
          <div className="sidebar-feedback-options">
            {options.map((option) => (
              <label key={option} className="sidebar-feedback-option">
                <input
                  type="radio"
                  name="feedback-reason"
                  value={option}
                  checked={selectedReason === option}
                  onChange={(e) => setSelectedReason(e.target.value)}
                />
                <span className="sidebar-feedback-option-text">{option}</span>
              </label>
            ))}
          </div>
          <textarea
            value={additionalFeedback}
            onChange={(e) => setAdditionalFeedback(e.target.value)}
            placeholder="Tell us more about your experience."
            className="sidebar-feedback-textarea"
            rows={3}
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
            className="sidebar-feedback-submit-btn"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-feedback">
      <div className="sidebar-feedback-initial">
        <span className="sidebar-feedback-label">Was this helpful?</span>
        <div className="sidebar-feedback-thumbs">
          <button
            onClick={handleThumbsUp}
            className="sidebar-feedback-thumb"
            aria-label="Yes, this was helpful"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </button>
          <button
            onClick={handleThumbsDown}
            className="sidebar-feedback-thumb"
            aria-label="No, this was not helpful"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocsFeedback;
