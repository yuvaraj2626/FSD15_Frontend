import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintsAPI, feedbackAPI } from '../services/api';
import ComplaintForm from '../components/ComplaintForm';
import ComplaintList from '../components/ComplaintList';
import FeedbackForm from '../components/FeedbackForm';
import './Dashboard.css';

const Dashboard = () => {
    const { user, isUser, isSupport } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showComplaintForm, setShowComplaintForm] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0
    });

    useEffect(() => {
        fetchComplaints();
        if (isSupport) {
            fetchFeedbacks();
        }
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await complaintsAPI.getAll();
            const complaintsData = response.data.complaints;
            setComplaints(complaintsData);

            // Calculate stats
            setStats({
                total: complaintsData.length,
                open: complaintsData.filter(c => c.status === 'OPEN').length,
                inProgress: complaintsData.filter(c => c.status === 'IN_PROGRESS').length,
                resolved: complaintsData.filter(c => c.status === 'RESOLVED').length,
                closed: complaintsData.filter(c => c.status === 'CLOSED').length
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            setLoading(false);
        }
    };

    const fetchFeedbacks = async () => {
        try {
            const response = await feedbackAPI.getAll();
            setFeedbacks(response.data.feedbacks);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        }
    };

    const handleComplaintCreated = () => {
        setShowComplaintForm(false);
        fetchComplaints();
    };

    const handleComplaintUpdated = () => {
        fetchComplaints();
    };

    const handleFeedbackSubmitted = () => {
        setShowFeedbackForm(false);
        setSelectedComplaint(null);
        fetchComplaints();
    };

    const handleProvideFeedback = (complaint) => {
        setSelectedComplaint(complaint);
        setShowFeedbackForm(true);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="gradient-text">
                            {isUser ? 'My Complaints' : 'Support Dashboard'}
                        </h1>
                        <p className="dashboard-subtitle">
                            {isUser
                                ? 'Track and manage your submitted complaints'
                                : 'Manage and resolve customer complaints'}
                        </p>
                    </div>
                    {isUser && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowComplaintForm(!showComplaintForm)}
                        >
                            {showComplaintForm ? '✕ Cancel' : '+ New Complaint'}
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card glass-card">
                        <div className="stat-icon" style={{ background: 'var(--gradient-1)' }}>
                            📊
                        </div>
                        <div className="stat-content">
                            <h3>{stats.total}</h3>
                            <p>Total Complaints</p>
                        </div>
                    </div>

                    <div className="stat-card glass-card">
                        <div className="stat-icon" style={{ background: 'var(--info)' }}>
                            🆕
                        </div>
                        <div className="stat-content">
                            <h3>{stats.open}</h3>
                            <p>Open</p>
                        </div>
                    </div>

                    <div className="stat-card glass-card">
                        <div className="stat-icon" style={{ background: 'var(--warning)' }}>
                            ⏳
                        </div>
                        <div className="stat-content">
                            <h3>{stats.inProgress}</h3>
                            <p>In Progress</p>
                        </div>
                    </div>

                    <div className="stat-card glass-card">
                        <div className="stat-icon" style={{ background: 'var(--success)' }}>
                            ✅
                        </div>
                        <div className="stat-content">
                            <h3>{stats.closed}</h3>
                            <p>Closed</p>
                        </div>
                    </div>
                </div>

                {/* Complaint Form */}
                {showComplaintForm && (
                    <div className="form-section glass-card">
                        <h2>Submit New Complaint</h2>
                        <ComplaintForm onSuccess={handleComplaintCreated} />
                    </div>
                )}

                {/* Feedback Form */}
                {showFeedbackForm && selectedComplaint && (
                    <div className="form-section glass-card">
                        <h2>Provide Feedback</h2>
                        <FeedbackForm
                            complaint={selectedComplaint}
                            onSuccess={handleFeedbackSubmitted}
                            onCancel={() => {
                                setShowFeedbackForm(false);
                                setSelectedComplaint(null);
                            }}
                        />
                    </div>
                )}

                {/* Complaints List */}
                <div className="complaints-section">
                    <ComplaintList
                        complaints={complaints}
                        onUpdate={handleComplaintUpdated}
                        onProvideFeedback={handleProvideFeedback}
                    />
                </div>

                {/* Feedbacks Section (Support Only) */}
                {isSupport && feedbacks.length > 0 && (
                    <div className="feedbacks-section glass-card">
                        <h2>Recent Feedback</h2>
                        <div className="feedback-list">
                            {feedbacks.slice(0, 5).map((feedback) => (
                                <div key={feedback._id} className="feedback-item">
                                    <div className="feedback-header">
                                        <div>
                                            <strong>{feedback.userId?.name}</strong>
                                            <span className="feedback-complaint">
                                                {feedback.complaintId?.title}
                                            </span>
                                        </div>
                                        <div className="feedback-rating">
                                            {'⭐'.repeat(feedback.rating)}
                                        </div>
                                    </div>
                                    <p className="feedback-comment">{feedback.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
