import React, { useState } from 'react';
import { feedbackAPI } from '../services/api';

const FeedbackForm = ({ complaint, existingFeedback, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        rating: existingFeedback ? existingFeedback.rating : 5,
        comment: existingFeedback ? existingFeedback.comment : ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const value = e.target.name === 'rating' ? parseInt(e.target.value) : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate complaint status
        if (complaint.status !== 'CLOSED') {
            setError('Feedback can only be submitted for CLOSED complaints');
            setLoading(false);
            return;
        }

        try {
            if (existingFeedback) {
                // Update existing feedback
                await feedbackAPI.update(existingFeedback._id, {
                    rating: formData.rating,
                    comment: formData.comment
                });
            } else {
                // Create new feedback
                await feedbackAPI.create({
                    complaintId: complaint._id,
                    rating: formData.rating,
                    comment: formData.comment
                });
            }
            onSuccess();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="alert alert-info mb-3">
                <span>ℹ️</span>
                {existingFeedback ? 'Updating feedback for: ' : 'Providing feedback for: '}<strong>{complaint.title}</strong>
            </div>

            {error && (
                <div className="alert alert-error mb-3">
                    <span>⚠️</span>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Rating</label>
                    <div className="rating-selector">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <label key={star} className="rating-option">
                                <input
                                    type="radio"
                                    name="rating"
                                    value={star}
                                    checked={formData.rating === star}
                                    onChange={handleChange}
                                />
                                <span className="rating-stars">
                                    {'⭐'.repeat(star)}
                                </span>
                                <span className="rating-label">
                                    {star === 1 && 'Poor'}
                                    {star === 2 && 'Fair'}
                                    {star === 3 && 'Good'}
                                    {star === 4 && 'Very Good'}
                                    {star === 5 && 'Excellent'}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Comment</label>
                    <textarea
                        name="comment"
                        className="form-textarea"
                        placeholder="Share your experience and feedback"
                        value={formData.comment}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading
                            ? (existingFeedback ? 'Updating...' : 'Submitting...')
                            : (existingFeedback ? 'Update Feedback' : 'Submit Feedback')
                        }
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <style jsx>{`
        .rating-selector {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .rating-option {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: var(--bg-card);
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .rating-option:hover {
          border-color: var(--primary);
          background: var(--bg-card-hover);
        }

        .rating-option input[type="radio"] {
          margin: 0;
        }

        .rating-option input[type="radio"]:checked + .rating-stars {
          transform: scale(1.1);
        }

        .rating-stars {
          font-size: 1.25rem;
          transition: transform var(--transition-base);
        }

        .rating-label {
          color: var(--text-secondary);
          font-weight: 600;
        }

        .rating-option:has(input:checked) {
          border-color: var(--primary);
          background: var(--glass-bg);
        }

        .rating-option:has(input:checked) .rating-label {
          color: var(--text-primary);
        }
      `}</style>
        </div>
    );
};

export default FeedbackForm;
