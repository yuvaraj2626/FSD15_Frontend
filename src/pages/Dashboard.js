import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { complaintsAPI, feedbackAPI } from '../services/api';
import ComplaintForm from '../components/ComplaintForm';
import ComplaintList from '../components/ComplaintList';
import FeedbackForm from '../components/FeedbackForm';
import SearchFilter from '../components/SearchFilter';
import Pagination from '../components/Pagination';
import './Dashboard.css';

const Dashboard = () => {
    const { user, isUser, isSupport } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [activeFilters, setActiveFilters] = useState({});
    const [globalStats, setGlobalStats] = useState({
        total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0
    });

    // Sync sidebar quick-filter from query param
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const statusParam = params.get('status');
        if (statusParam) {
            const newFilters = { status: statusParam };
            setActiveFilters(newFilters);
            fetchComplaints(newFilters);
        } else {
            setActiveFilters({});
            fetchComplaints({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const fetchComplaints = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const response = await complaintsAPI.getAll({ limit: 10, ...params });
            const { complaints: list, pagination: pages } = response.data;
            setComplaints(list);
            setPagination(pages);

            // Update global stats only for unfiltered view
            if (!params.status && !params.search && !params.category && !params.priority) {
                setGlobalStats({
                    total: pages?.total ?? list.length,
                    open: list.filter(c => c.status === 'OPEN').length,
                    inProgress: list.filter(c => c.status === 'IN_PROGRESS').length,
                    resolved: list.filter(c => c.status === 'RESOLVED').length,
                    closed: list.filter(c => c.status === 'CLOSED').length
                });
            }
        } catch (err) {
            console.error('Failed to fetch complaints:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFeedbacks = useCallback(async () => {
        try {
            const res = await feedbackAPI.getAll();
            setFeedbacks(res.data.feedbacks);
        } catch (err) {
            console.error('Failed to fetch feedbacks:', err);
        }
    }, []);

    useEffect(() => {
        // Only on mount without query params
        if (!location.search) {
            fetchComplaints({});
        }
        if (isSupport) fetchFeedbacks();
    }, [fetchComplaints, fetchFeedbacks, isSupport, location.search]);

    const handleFilter = (params) => {
        setActiveFilters(params);
        // Clear sidebar URL filter
        if (location.search) navigate('/dashboard', { replace: true });
        fetchComplaints({ ...params, page: 1 });
    };

    const handlePageChange = (page) => {
        fetchComplaints({ ...activeFilters, page });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTicketCreated = () => {
        setShowTicketForm(false);
        fetchComplaints(activeFilters);
        if (isSupport) fetchFeedbacks();
    };

    const handleComplaintUpdated = () => {
        fetchComplaints({ ...activeFilters, page: pagination?.page || 1 });
    };

    const handleFeedbackSubmitted = () => {
        setShowFeedbackForm(false);
        setSelectedComplaint(null);
        fetchComplaints(activeFilters);
    };

    const handleProvideFeedback = (complaint) => {
        setSelectedComplaint(complaint);
        setShowFeedbackForm(true);
    };

    const currentStatusLabel = () => {
        const s = activeFilters.status;
        if (!s) return 'All Tickets';
        return s.replace('_', ' ');
    };

    return (
        <>
            {/* ── Page Header ── */}
            <div className="dashboard-page-header">
                <div>
                    <h1>{isUser ? '🎫 My Tickets' : '🛠️ Support Queue'}</h1>
                    <p className="dashboard-subtitle">
                        {activeFilters.status
                            ? `Showing: ${currentStatusLabel()} tickets`
                            : isUser
                                ? 'Submit, track, and manage your support requests'
                                : 'Review, assign and resolve customer tickets'}
                    </p>
                </div>
                {isUser && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowTicketForm(f => !f)}
                    >
                        {showTicketForm ? '✕ Cancel' : '+ New Ticket'}
                    </button>
                )}
            </div>

            {/* ── KPI Row ── */}
            <div className="kpi-row">
                <div className="kpi-card">
                    <div className="kpi-icon kpi-icon--total">📋</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{globalStats.total}</div>
                        <div className="kpi-label">Total Tickets</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon kpi-icon--open">🆕</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{globalStats.open}</div>
                        <div className="kpi-label">Open</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon kpi-icon--progress">⏳</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{globalStats.inProgress}</div>
                        <div className="kpi-label">In Progress</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon kpi-icon--closed">✅</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{globalStats.closed}</div>
                        <div className="kpi-label">Closed</div>
                    </div>
                </div>
            </div>

            {/* ── Feedback Form (inline) ── */}
            {showFeedbackForm && selectedComplaint && (
                <div className="form-section">
                    <h2>⭐ Rate Your Experience — {selectedComplaint.title}</h2>
                    <FeedbackForm
                        complaint={selectedComplaint}
                        onSuccess={handleFeedbackSubmitted}
                        onCancel={() => { setShowFeedbackForm(false); setSelectedComplaint(null); }}
                    />
                </div>
            )}

            {/* ── 2-Column Grid ── */}
            <div className={isSupport && feedbacks.length > 0 ? 'dashboard-grid' : ''}>

                {/* ── Main Column ── */}
                <div className="dashboard-main">
                    {/* New Ticket Form */}
                    {showTicketForm && (
                        <div className="section-card" style={{ marginBottom: '1.25rem' }}>
                            <div className="section-card-header">
                                <span className="section-card-title">✏️ New Ticket</span>
                                <button className="btn btn-ghost btn-sm" onClick={() => setShowTicketForm(false)}>
                                    ✕ Close
                                </button>
                            </div>
                            <div className="section-card-body">
                                <ComplaintForm onSuccess={handleTicketCreated} />
                            </div>
                        </div>
                    )}

                    {/* Search & Filter */}
                    <SearchFilter onFilter={handleFilter} isSupport={isSupport} />

                    {/* Ticket List */}
                    <div className="section-card" style={{ marginTop: '1.25rem' }}>
                        <div className="section-card-header">
                            <span className="section-card-title">
                                🎫 {currentStatusLabel()}
                                {pagination && (
                                    <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-3)', marginLeft: 6 }}>
                                        ({pagination.total} total)
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="section-card-body">
                            {loading ? (
                                <div className="loading-container">
                                    <div className="spinner"></div>
                                </div>
                            ) : (
                                <>
                                    <ComplaintList
                                        complaints={complaints}
                                        onUpdate={handleComplaintUpdated}
                                        onProvideFeedback={handleProvideFeedback}
                                    />
                                    <Pagination
                                        pagination={pagination}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Sidebar Column (Support only) ── */}
                {isSupport && feedbacks.length > 0 && (
                    <div className="dashboard-sidebar-col">
                        <div className="section-card">
                            <div className="section-card-header">
                                <span className="section-card-title">⭐ Recent Feedback</span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                                    {feedbacks.length} total
                                </span>
                            </div>
                            <div className="section-card-body">
                                <div className="feedback-list">
                                    {feedbacks.slice(0, 6).map(fb => (
                                        <div key={fb._id} className="feedback-item">
                                            <div className="feedback-header">
                                                <div>
                                                    <strong>{fb.userId?.name}</strong>
                                                    <span className="feedback-complaint">{fb.complaintId?.title}</span>
                                                </div>
                                                <span className="feedback-rating">
                                                    {'⭐'.repeat(fb.rating)}
                                                </span>
                                            </div>
                                            {fb.comment && (
                                                <p className="feedback-comment">"{fb.comment}"</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Dashboard;
