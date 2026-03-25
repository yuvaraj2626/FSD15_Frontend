import React, { useState } from 'react';
import './SearchFilter.css';

const CATEGORIES = ['ALL', 'Technical', 'Billing', 'Service', 'Product', 'Other'];
const STATUSES = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITIES = ['ALL', 'Low', 'Medium', 'High', 'Critical'];
const SORT_OPTIONS = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' }
];

const SearchFilter = ({ onFilter, isSupport }) => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('ALL');
    const [category, setCategory] = useState('ALL');
    const [priority, setPriority] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const buildParams = (overrides = {}) => {
        const params = {
            search, status, category, priority,
            startDate, endDate, sortBy, sortOrder,
            page: 1, limit: 10,
            ...overrides
        };
        // Remove empty strings
        Object.keys(params).forEach(k => {
            if (params[k] === '' || params[k] === 'ALL') delete params[k];
        });
        return params;
    };

    const handleSearch = (e) => {
        e.preventDefault();
        onFilter(buildParams());
    };

    const handleReset = () => {
        setSearch(''); setStatus('ALL'); setCategory('ALL');
        setPriority('ALL'); setStartDate(''); setEndDate('');
        setSortBy('createdAt'); setSortOrder('desc');
        onFilter({});
    };

    const handleQuickFilter = (field, value) => {
        if (field === 'status') setStatus(value);
        if (field === 'priority') setPriority(value);
        onFilter(buildParams({ [field]: value === 'ALL' ? undefined : value }));
    };

    const hasActiveFilters = search || status !== 'ALL' || category !== 'ALL' ||
        priority !== 'ALL' || startDate || endDate;

    return (
        <div className="search-filter glass-card">
            {/* Search Row */}
            <form className="search-row" onSubmit={handleSearch}>
                <div className="search-input-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search complaints by title or description..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button type="button" className="search-clear" onClick={() => { setSearch(''); onFilter(buildParams({ search: undefined })); }}>✕</button>
                    )}
                </div>
                <button type="submit" className="btn btn-primary btn-sm">Search</button>
                <button
                    type="button"
                    className={`btn btn-secondary btn-sm ${showAdvanced ? 'active' : ''}`}
                    onClick={() => setShowAdvanced(p => !p)}
                >
                    🎛️ Filters {hasActiveFilters && <span className="filter-dot"></span>}
                </button>
                {hasActiveFilters && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>
                        🗑️ Clear
                    </button>
                )}
            </form>

            {/* Quick Status Filters */}
            <div className="quick-filters">
                {STATUSES.map(s => (
                    <button
                        key={s}
                        className={`quick-filter-btn ${status === s ? 'active' : ''}`}
                        onClick={() => handleQuickFilter('status', s)}
                    >
                        {s === 'ALL' ? 'All' : s.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="advanced-filters">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>Category</label>
                            <select
                                className="form-select filter-select"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Priority</label>
                            <select
                                className="form-select filter-select"
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                            >
                                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Sort By</label>
                            <select
                                className="form-select filter-select"
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                            >
                                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Order</label>
                            <select
                                className="form-select filter-select"
                                value={sortOrder}
                                onChange={e => setSortOrder(e.target.value)}
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="filter-group">
                            <label>From Date</label>
                            <input
                                type="date"
                                className="form-input filter-select"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="filter-group">
                            <label>To Date</label>
                            <input
                                type="date"
                                className="form-input filter-select"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="filter-group filter-group--actions">
                            <button className="btn btn-primary btn-sm" onClick={() => onFilter(buildParams())}>
                                ✅ Apply Filters
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={handleReset}>
                                🗑️ Reset All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchFilter;
