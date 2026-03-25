import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintsAPI } from '../services/api';
import ActivityTimeline from './ActivityTimeline';
import CommentPanel from './CommentPanel';
import './ComplaintList.css';

const ComplaintList = ({ complaints, onUpdate, onProvideFeedback }) => {
    const { isSupport } = useAuth();
    const [expandedId, setExpandedId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const handleStatusUpdate = async (complaintId, newStatus) => {
        setUpdatingId(complaintId);
        try {
            await complaintsAPI.update(complaintId, { status: newStatus });
            onUpdate();
        } catch (error) {
            console.error('Error updating complaint:', error);
            alert('Failed to update complaint status');
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'OPEN': 'badge-open',
            'IN_PROGRESS': 'badge-in-progress',
            'RESOLVED': 'badge-resolved',
            'CLOSED': 'badge-closed'
        };
        return `badge ${statusMap[status] || 'badge-open'}`;
    };

    const getPriorityBadgeClass = (priority) => {
        const priorityMap = {
            'Low': 'badge-low',
            'Medium': 'badge-medium',
            'High': 'badge-high',
            'Critical': 'badge-critical'
        };
        return `badge ${priorityMap[priority] || 'badge-medium'}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (complaints.length === 0) {
        return (
            <div className="empty-state glass-card">
                <div className="empty-icon">📭</div>
                <h3>No Complaints Found</h3>
                <p>There are no complaints matching your filters.</p>
            </div>
        );
    }

    return (
        <div className="complaint-list">
            {complaints.map((complaint) => (
                <div key={complaint._id} className="complaint-card glass-card">
                    <div className="complaint-header" onClick={() => toggleExpand(complaint._id)}>
                        <div className="complaint-title-section">
                            <h3>{complaint.title}</h3>
                            <div className="complaint-meta">
                                <span className="complaint-category">📁 {complaint.category}</span>
                                {isSupport && (
                                    <span className="complaint-user">
                                        👤 {complaint.userId?.name}
                                    </span>
                                )}
                                <span className="complaint-date">
                                    🕒 {formatDate(complaint.createdAt)}
                                </span>
                            </div>
                        </div>
                        <div className="complaint-badges">
                            <span className={getStatusBadgeClass(complaint.status)}>
                                {complaint.status.replace('_', ' ')}
                            </span>
                            <span className={getPriorityBadgeClass(complaint.priority)}>
                                {complaint.priority}
                            </span>
                            <span className="expand-icon">{expandedId === complaint._id ? '▲' : '▼'}</span>
                        </div>
                    </div>

                    {expandedId === complaint._id && (
                        <div className="complaint-body">
                            <div className="complaint-description">
                                <h4>Description</h4>
                                <p>{complaint.description}</p>
                            </div>

                            {complaint.assignedTo && (
                                <div className="complaint-assigned">
                                    <strong>Assigned to:</strong> {complaint.assignedTo.name}
                                </div>
                            )}

                            {/* ── Attachment ── */}
                            {complaint.attachmentUrl && (
                                <div className="complaint-attachment">
                                    <h4>📎 Attachment</h4>
                                    {/\.(jpg|jpeg|png|gif|webp)$/i.test(complaint.attachmentUrl) ? (
                                        <a
                                            href={`http://localhost:5000${complaint.attachmentUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="attachment-img-link"
                                        >
                                            <img
                                                src={`http://localhost:5000${complaint.attachmentUrl}`}
                                                alt="Complaint attachment"
                                                className="attachment-thumbnail"
                                            />
                                            <span className="attachment-img-hint">🔍 Click to view full size</span>
                                        </a>
                                    ) : (
                                        <a
                                            href={`http://localhost:5000${complaint.attachmentUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary btn-sm"
                                            download
                                        >
                                            ⬇️ Download Attachment
                                        </a>
                                    )}
                                </div>
                            )}

                            <div className="complaint-actions">
                                {isSupport && (
                                    <div className="status-update-section">
                                        <label>Update Status:</label>
                                        <div className="status-buttons">
                                            {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
                                                <button
                                                    key={status}
                                                    className={`btn btn-sm ${complaint.status === status ? 'btn-primary' : 'btn-secondary'}`}
                                                    onClick={() => handleStatusUpdate(complaint._id, status)}
                                                    disabled={updatingId === complaint._id || complaint.status === status}
                                                >
                                                    {updatingId === complaint._id && complaint.status !== status ? '...' : status.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!isSupport && complaint.status === 'CLOSED' && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => onProvideFeedback(complaint)}
                                    >
                                        ⭐ Provide Feedback
                                    </button>
                                )}
                            </div>

                            {/* Activity Timeline */}
                            <ActivityTimeline
                                complaintId={complaint._id}
                                complaintStatus={complaint.status}
                            />

                            {/* ── Chat / Comment Panel ── */}
                            <CommentPanel
                                complaintId={complaint._id}
                                complaintStatus={complaint.status}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ComplaintList;
