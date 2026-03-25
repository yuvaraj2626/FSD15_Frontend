import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AppShell = ({ children }) => {
    const { user, logout, isSupport, isUser } = useAuth();
    const { theme, changeTheme, isDark, THEMES } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showThemePicker, setShowThemePicker] = useState(false);
    const themePickerRef = useRef(null);

    // Close theme picker when clicking outside
    useEffect(() => {
        const handleClick = (e) => {
            if (themePickerRef.current && !themePickerRef.current.contains(e.target)) {
                setShowThemePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const themeOptions = [
        { key: THEMES.DARK, icon: '🌙', label: 'Dark' },
        { key: THEMES.LIGHT, icon: '☀️', label: 'Light' },
        { key: THEMES.SYSTEM, icon: '💻', label: 'System' },
    ];

    const activeThemeOption = themeOptions.find(o => o.key === theme) || themeOptions[0];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    // Breadcrumb map
    const breadcrumbs = {
        '/dashboard': 'Dashboard',
        '/analytics': 'Analytics',
        '/profile': 'Profile',
    };

    const currentPage = breadcrumbs[location.pathname] || 'Page';

    const getOpenCount = () => 0; // placeholder — could be passed as prop

    return (
        <div className="app-shell">
            {/* ── Sidebar ── */}
            <aside className="sidebar">
                {/* Logo */}
                <Link to="/" className="sidebar-logo">
                    <div className="sidebar-logo-icon">⚡</div>
                    <span className="sidebar-logo-text">ComplainHub</span>
                </Link>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {/* Main */}
                    <span className="nav-section-label">Main</span>

                    <Link
                        to="/dashboard"
                        className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                        <span className="nav-item-icon">🏠</span>
                        <span>Dashboard</span>
                    </Link>

                    {isSupport && (
                        <Link
                            to="/analytics"
                            className={`nav-item ${isActive('/analytics') ? 'active' : ''}`}
                        >
                            <span className="nav-item-icon">📊</span>
                            <span>Analytics</span>
                        </Link>
                    )}

                    {/* Tickets */}
                    <span className="nav-section-label" style={{ marginTop: '0.5rem' }}>Tickets</span>

                    <Link
                        to="/dashboard"
                        className={`nav-item ${isActive('/dashboard') && location.search.includes('status=OPEN') ? 'active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/dashboard?status=OPEN');
                        }}
                    >
                        <span className="nav-item-icon">🆕</span>
                        <span>Open Tickets</span>
                    </Link>

                    <Link
                        to="/dashboard"
                        className="nav-item"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/dashboard?status=IN_PROGRESS');
                        }}
                    >
                        <span className="nav-item-icon">⏳</span>
                        <span>In Progress</span>
                    </Link>

                    <Link
                        to="/dashboard"
                        className="nav-item"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/dashboard?status=CLOSED');
                        }}
                    >
                        <span className="nav-item-icon">✅</span>
                        <span>Closed</span>
                    </Link>

                    {/* Account */}
                    <span className="nav-section-label" style={{ marginTop: '0.5rem' }}>Account</span>

                    <button className="nav-item" onClick={() => setShowLogoutConfirm(true)}>
                        <span className="nav-item-icon">🚪</span>
                        <span>Sign Out</span>
                    </button>
                </nav>

                {/* User card at bottom */}
                <div className="sidebar-user">
                    <div className="sidebar-user-card">
                        <div className="user-avatar-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name}</div>
                            <div className="sidebar-user-role">{user?.role}</div>
                        </div>
                        <button
                            className="sidebar-logout-btn"
                            onClick={() => setShowLogoutConfirm(true)}
                            title="Sign out"
                        >
                            ↗
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main Pane ── */}
            <div className="app-main">
                {/* Top Bar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <div className="breadcrumb">
                            <span>ComplainHub</span>
                            <span className="breadcrumb-sep">/</span>
                            <span className="breadcrumb-current">{currentPage}</span>
                        </div>
                    </div>
                    <div className="topbar-right">
                        {/* ── Theme Picker ── */}
                        <div className="theme-picker-wrap" ref={themePickerRef}>
                            <button
                                id="theme-toggle-btn"
                                className="theme-toggle-btn"
                                onClick={() => setShowThemePicker(v => !v)}
                                title="Change theme"
                            >
                                <span className="theme-icon">{activeThemeOption.icon}</span>
                                <span>{activeThemeOption.label}</span>
                            </button>

                            {showThemePicker && (
                                <div className="theme-picker-dropdown">
                                    <div className="theme-picker-title">Appearance</div>
                                    {themeOptions.map(opt => (
                                        <button
                                            key={opt.key}
                                            id={`theme-option-${opt.key}`}
                                            className={`theme-option ${theme === opt.key ? 'active' : ''}`}
                                            onClick={() => {
                                                changeTheme(opt.key);
                                                setShowThemePicker(false);
                                            }}
                                        >
                                            <span className="theme-option-icon">{opt.icon}</span>
                                            <span className="theme-option-label">{opt.label}</span>
                                            {theme === opt.key && <span className="theme-option-check">✓</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── User Pill ── */}
                        <div className="topbar-user-pill">
                            <div className="user-avatar-sm" style={{ width: 26, height: 26, fontSize: '0.75rem' }}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span>{user?.name}</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="page-content">
                    {children}
                </main>
            </div>

            {/* ── Logout Confirm Modal ── */}
            {showLogoutConfirm && (
                <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-icon">🚪</div>
                        <h3>Sign Out?</h3>
                        <p>Are you sure you want to sign out of your account?</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleLogout}>
                                Yes, Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppShell;
