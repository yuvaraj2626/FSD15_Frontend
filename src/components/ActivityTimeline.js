import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ActivityTimeline.css';


const STATUS_ICONS = {
    OPEN: '🆕', IN_PROGRESS: '⏳', RESOLVED: '✔️', CLOSED: '✅'
};

const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ActivityTimeline = ({ complaintId, complaintStatus }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);

    useEffect(() => {
        if (complaintId) fetchComments();
        // eslint-disable-next-line
    }, [complaintId]);

    const fetchComments = async () => {
        try {
            // Use the /api/comments/:id route which returns ALL event types (system, status_change, comment)
            const res = await api.get(`/comments/${complaintId}`);
            setComments(res.data.comments);
        } catch (err) {
            setError('Could not load activity.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setSubmitting(true);
        setError('');
        try {
            const res = await api.post(`/comments/${complaintId}`, { text: newComment.trim() });
            setComments(prev => [...prev, res.data.comment]);
            setNewComment('');
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            setError('Failed to add comment.');
        } finally {
            setSubmitting(false);
        }
    };

    const getItemClass = (type) => {
        if (type === 'status_change') return 'timeline-item timeline-item--status';
        if (type === 'system') return 'timeline-item timeline-item--system';
        return 'timeline-item';
    };

    const getAvatar = (comment) => {
        if (comment.type === 'system') return '⚙️';
        if (comment.type === 'status_change') return '🔄';
        const name = comment.userId?.name || 'U';
        return name.charAt(0).toUpperCase();
    };

    const isTextAvatar = (comment) => comment.type === 'comment';

    return (
        <div className="activity-timeline">
            <h3 className="timeline-title">💬 Activity Timeline</h3>

            {loading ? (
                <div className="timeline-loading">
                    <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></div>
                </div>
            ) : (
                <div className="timeline-list">
                    {comments.length === 0 && (
                        <div className="timeline-empty">No activity yet. Be the first to comment!</div>
                    )}

                    {comments.map((comment) => (
                        <div key={comment._id} className={getItemClass(comment.type)}>
                            <div className={`timeline-avatar ${isTextAvatar(comment) ? 'timeline-avatar--text' : 'timeline-avatar--emoji'} ${comment.userId?.role === 'SUPPORT' ? 'timeline-avatar--support' : ''}`}>
                                {getAvatar(comment)}
                            </div>
                            <div className="timeline-content">
                                <div className="timeline-meta">
                                    <span className="timeline-author">
                                        {comment.type === 'system' ? 'System'
                                            : comment.type === 'status_change' ? 'Status Update'
                                                : comment.userId?.name || 'User'}
                                        {comment.userId?.role === 'SUPPORT' && comment.type === 'comment' && (
                                            <span className="support-badge">Support Agent</span>
                                        )}
                                    </span>
                                    <span className="timeline-time">{formatTime(comment.createdAt)}</span>
                                </div>
                                <p className="timeline-text">
                                    {comment.type === 'status_change' ? (
                                        <>
                                            {STATUS_ICONS[comment.oldStatus]} → {STATUS_ICONS[comment.newStatus]}
                                            {' '}<strong>{comment.oldStatus}</strong> → <strong>{comment.newStatus}</strong>
                                        </>
                                    ) : comment.text}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            )}

            {/* Comment Input */}
            {!loading && (
                <form className="timeline-input-form" onSubmit={handleSubmit}>
                    {error && <div className="alert alert-error" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>{error}</div>}
                    <div className="timeline-input-row">
                        <div className="timeline-input-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <input
                            type="text"
                            className="timeline-input"
                            placeholder="Add a comment or update..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            disabled={submitting}
                            maxLength={500}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm timeline-send-btn"
                            disabled={submitting || !newComment.trim()}
                        >
                            {submitting ? '...' : '➤'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ActivityTimeline;
