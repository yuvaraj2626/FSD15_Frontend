import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { theme, changeTheme, THEMES } = useTheme();

    const themeOptions = [
        { key: THEMES.DARK, icon: '🌙', label: 'Dark' },
        { key: THEMES.LIGHT, icon: '☀️', label: 'Light' },
        { key: THEMES.SYSTEM, icon: '💻', label: 'System' },
    ];
    const activeOption = themeOptions.find(o => o.key === theme) || themeOptions[0];
    const cycleTheme = () => {
        const cycle = [THEMES.DARK, THEMES.LIGHT, THEMES.SYSTEM];
        changeTheme(cycle[(cycle.indexOf(theme) + 1) % cycle.length]);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const result = await login(formData.email, formData.password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const fillDemo = (type) => {
        if (type === 'user') {
            setFormData({ email: 'user@demo.com', password: 'user123' });
        } else {
            setFormData({ email: 'support@demo.com', password: 'support123' });
        }
        setError('');
    };

    return (
        <div className="auth-root">
            {/* Floating theme toggle */}
            <button
                id="login-theme-toggle"
                className="theme-toggle-btn"
                onClick={cycleTheme}
                title={`Switch theme (current: ${activeOption.label})`}
                style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 200 }}
            >
                <span className="theme-icon">{activeOption.icon}</span>
                <span>{activeOption.label}</span>
            </button>
            {/* Left Panel — Branding */}
            <div className="auth-panel auth-panel--brand">
                <div className="auth-brand-content">
                    <Link to="/" className="auth-logo">
                        <div className="auth-logo-icon">⚡</div>
                        <span className="auth-logo-text">ComplainHub</span>
                    </Link>
                    <div className="auth-brand-body">
                        <h2 className="auth-brand-headline">
                            Resolve faster.<br />Track smarter.
                        </h2>
                        <p className="auth-brand-sub">
                            The professional complaint management platform trusted by support teams to deliver exceptional customer experiences.
                        </p>
                        <div className="auth-stats-row">
                            <div className="auth-stat">
                                <span className="auth-stat-num">98%</span>
                                <span className="auth-stat-lbl">Resolution Rate</span>
                            </div>
                            <div className="auth-stat">
                                <span className="auth-stat-num">2.4h</span>
                                <span className="auth-stat-lbl">Avg Response</span>
                            </div>
                            <div className="auth-stat">
                                <span className="auth-stat-num">4.9★</span>
                                <span className="auth-stat-lbl">Avg Rating</span>
                            </div>
                        </div>
                    </div>
                    <div className="auth-brand-testimonial">
                        <div className="testimonial-avatar">J</div>
                        <div>
                            <p className="testimonial-text">"ComplainHub cut our resolution time in half. Best investment we made."</p>
                            <p className="testimonial-author">James K., Support Manager</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="auth-panel auth-panel--form">
                <div className="auth-form-card">
                    <div className="auth-form-header">
                        <h1>Welcome back</h1>
                        <p>Sign in to your account to continue</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-password-wrap">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    name="password"
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="pw-toggle"
                                    onClick={() => setShowPw(p => !p)}
                                >
                                    {showPw ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            style={{ height: 44, fontSize: '0.95rem' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span>
                                    Signing in...
                                </span>
                            ) : 'Sign In →'}
                        </button>
                    </form>

                    <div className="auth-divider"><span>or try a demo account</span></div>

                    <div className="demo-pills">
                        <button className="demo-pill" onClick={() => fillDemo('user')}>
                            <span className="demo-pill-icon">👤</span>
                            <div>
                                <div className="demo-pill-title">User Account</div>
                                <div className="demo-pill-sub">user@demo.com</div>
                            </div>
                        </button>
                        <button className="demo-pill demo-pill--support" onClick={() => fillDemo('support')}>
                            <span className="demo-pill-icon">🛠️</span>
                            <div>
                                <div className="demo-pill-title">Support Account</div>
                                <div className="demo-pill-sub">support@demo.com</div>
                            </div>
                        </button>
                    </div>

                    <p className="auth-switch">
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">Create one free →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
