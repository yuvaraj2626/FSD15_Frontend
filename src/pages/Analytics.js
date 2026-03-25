import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { analyticsAPI } from '../services/api';
import './Analytics.css';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, ArcElement,
    PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const CATEGORY_COLORS = ['#7c3aed', '#a855f7', '#ec4899', '#06b6d4', '#10b981'];
const STATUS_COLORS = {
    OPEN: '#06b6d4', IN_PROGRESS: '#f59e0b', RESOLVED: '#10b981', CLOSED: '#22c55e'
};
const PRIORITY_COLORS = {
    Low: '#06b6d4', Medium: '#f59e0b', High: '#f97316', Critical: '#ef4444'
};

const StatCard = ({ icon, label, value, sub, gradient }) => (
    <div className="analytics-stat-card glass-card" style={{ '--card-gradient': gradient }}>
        <div className="analytics-stat-icon">{icon}</div>
        <div className="analytics-stat-body">
            <div className="analytics-stat-value">{value}</div>
            <div className="analytics-stat-label">{label}</div>
            {sub && <div className="analytics-stat-sub">{sub}</div>}
        </div>
    </div>
);

const Analytics = () => {
    const [overview, setOverview] = useState(null);
    const [byCategory, setByCategory] = useState([]);
    const [byStatus, setByStatus] = useState([]);
    const [byPriority, setByPriority] = useState([]);
    const [trend, setTrend] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [ovRes, catRes, statRes, priRes, trendRes, ratRes] = await Promise.all([
                analyticsAPI.getOverview(),
                analyticsAPI.getByCategory(),
                analyticsAPI.getByStatus(),
                analyticsAPI.getByPriority(),
                analyticsAPI.getTrend(),
                analyticsAPI.getRatings()
            ]);
            setOverview(ovRes.data.overview);
            setByCategory(catRes.data.byCategory);
            setByStatus(statRes.data.byStatus);
            setByPriority(priRes.data.byPriority);
            setTrend(trendRes.data.trend);
            setRatings(ratRes.data.ratings);
        } catch (err) {
            setError('Failed to load analytics data.');
        } finally {
            setLoading(false);
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#e2e8f0',
                    font: { family: 'Inter', size: 13 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15,12,40,0.95)',
                titleColor: '#e2e8f0',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(124,58,237,0.4)',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                ticks: { color: '#94a3b8', font: { family: 'Inter' } },
                grid: { color: 'rgba(255,255,255,0.05)' }
            },
            y: {
                ticks: { color: '#94a3b8', font: { family: 'Inter' } },
                grid: { color: 'rgba(255,255,255,0.05)' },
                beginAtZero: true
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#e2e8f0',
                    font: { family: 'Inter', size: 13 },
                    padding: 16
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15,12,40,0.95)',
                titleColor: '#e2e8f0',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(124,58,237,0.4)',
                borderWidth: 1
            }
        }
    };

    const categoryChartData = {
        labels: byCategory.map(d => d._id),
        datasets: [{
            label: 'Complaints',
            data: byCategory.map(d => d.count),
            backgroundColor: CATEGORY_COLORS,
            borderRadius: 8,
            borderWidth: 0
        }]
    };

    const statusChartData = {
        labels: byStatus.map(d => d._id),
        datasets: [{
            data: byStatus.map(d => d.count),
            backgroundColor: byStatus.map(d => STATUS_COLORS[d._id] || '#7c3aed'),
            borderWidth: 0,
            hoverOffset: 8
        }]
    };

    const priorityChartData = {
        labels: byPriority.map(d => d._id),
        datasets: [{
            data: byPriority.map(d => d.count),
            backgroundColor: byPriority.map(d => PRIORITY_COLORS[d._id] || '#7c3aed'),
            borderWidth: 0,
            hoverOffset: 8
        }]
    };

    // Generate last 30 days labels
    const trendLabels = trend.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const trendChartData = {
        labels: trendLabels,
        datasets: [{
            label: 'Complaints Submitted',
            data: trend.map(d => d.count),
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(124,58,237,0.15)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#7c3aed',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };

    const ratingChartData = {
        labels: [1, 2, 3, 4, 5].map(r => `${r} ⭐`),
        datasets: [{
            label: 'Responses',
            data: [1, 2, 3, 4, 5].map(r => {
                const found = ratings.find(d => d._id === r);
                return found ? found.count : 0;
            }),
            backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#22c55e'],
            borderRadius: 8,
            borderWidth: 0
        }]
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analytics-page">
                <div className="container">
                    <div className="alert alert-error">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            <div className="container">
                {/* Header */}
                <div className="analytics-header">
                    <div>
                        <h1 className="gradient-text">📊 Analytics Dashboard</h1>
                        <p className="analytics-subtitle">Real-time insights into your complaint management system</p>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={fetchAll}>
                        🔄 Refresh
                    </button>
                </div>

                {/* KPI Cards */}
                {overview && (
                    <div className="analytics-kpi-grid">
                        <StatCard icon="📋" label="Total Complaints" value={overview.totalComplaints} gradient="linear-gradient(135deg,#7c3aed,#a855f7)" />
                        <StatCard icon="🆕" label="Open" value={overview.openComplaints} gradient="linear-gradient(135deg,#06b6d4,#0ea5e9)" />
                        <StatCard icon="⏳" label="In Progress" value={overview.inProgressComplaints} gradient="linear-gradient(135deg,#f59e0b,#f97316)" />
                        <StatCard icon="✅" label="Resolved/Closed" value={overview.resolvedComplaints + overview.closedComplaints} sub={`${overview.resolutionRate}% resolution rate`} gradient="linear-gradient(135deg,#10b981,#22c55e)" />
                        <StatCard icon="👥" label="Total Users" value={overview.totalUsers} gradient="linear-gradient(135deg,#ec4899,#f43f5e)" />
                        <StatCard icon="⭐" label="Avg. Rating" value={`${overview.avgRating}/5`} sub={`${overview.totalFeedbacks} feedbacks`} gradient="linear-gradient(135deg,#f59e0b,#eab308)" />
                    </div>
                )}

                {/* Charts Row 1 */}
                <div className="analytics-charts-row">
                    <div className="analytics-chart-card glass-card">
                        <h3>📂 Complaints by Category</h3>
                        <div className="chart-wrapper">
                            {byCategory.length > 0 ? (
                                <Bar data={categoryChartData} options={chartOptions} />
                            ) : <p className="no-data">No data available yet</p>}
                        </div>
                    </div>

                    <div className="analytics-chart-card analytics-chart-card--sm glass-card">
                        <h3>🔵 Status Breakdown</h3>
                        <div className="chart-wrapper">
                            {byStatus.length > 0 ? (
                                <Doughnut data={statusChartData} options={doughnutOptions} />
                            ) : <p className="no-data">No data available yet</p>}
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="analytics-charts-row">
                    <div className="analytics-chart-card analytics-chart-card--wide glass-card">
                        <h3>📈 Complaint Trend (Last 30 Days)</h3>
                        <div className="chart-wrapper">
                            {trend.length > 0 ? (
                                <Line data={trendChartData} options={chartOptions} />
                            ) : <p className="no-data">No complaint trend data yet</p>}
                        </div>
                    </div>
                </div>

                {/* Charts Row 3 */}
                <div className="analytics-charts-row">
                    <div className="analytics-chart-card analytics-chart-card--sm glass-card">
                        <h3>🚨 Priority Distribution</h3>
                        <div className="chart-wrapper">
                            {byPriority.length > 0 ? (
                                <Doughnut data={priorityChartData} options={doughnutOptions} />
                            ) : <p className="no-data">No data available yet</p>}
                        </div>
                    </div>

                    <div className="analytics-chart-card glass-card">
                        <h3>⭐ Rating Distribution</h3>
                        <div className="chart-wrapper">
                            {ratings.length > 0 ? (
                                <Bar data={ratingChartData} options={chartOptions} />
                            ) : <p className="no-data">No feedback ratings yet</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
