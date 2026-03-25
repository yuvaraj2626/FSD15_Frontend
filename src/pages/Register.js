import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', role: 'USER'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
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
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match'); return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters'); return;
        }
        setLoading(true);
        const result = await register(formData.name, formData.email, formData.password, formData.role);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const pwStrength = () => {
        const pw = formData.password;
        if (!pw) return null;
        if (pw.length < 4) return { label: 'Weak', color: '#ef4444', w: '30%' };
        if (pw.length < 6) return { label: 'Fair', color: '#f59e0b', w: '55%' };
        if (pw.length < 9) return { label: 'Good', color: '#22c55e', w: '75%' };
        return { label: 'Strong', color: '#10b981', w: '100%' };
    };
    const strength = pwStrength();

    return (
        <div className="auth-root">
            {/* Floating theme toggle */}
            <button
                id="register-theme-toggle"
                className="theme-toggle-btn"
                onClick={cycleTheme}
                title={`Switch theme (current: ${activeOption.label})`}
                style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 200 }}
            >
                <span className="theme-icon">{activeOption.icon}</span>
                <span>{activeOption.label}</span>
            </button>
            {/* Left Panel */}
            <div className="auth-panel auth-panel--brand">
                <div className="auth-brand-content">
                    <Link to="/" className="auth-logo">
                        <div className="auth-logo-icon">⚡</div>
                        <span className="auth-logo-text">ComplainHub</span>
                    </Link>
                    <div className="auth-brand-body">
                        <h2 className="auth-brand-headline">
                            Get started in<br />under 2 minutes.
                        </h2>
                        <p className="auth-brand-sub">
                            Join support teams and customers who use ComplainHub to resolve issues faster and deliver better outcomes.
                        </p>
                        <div className="auth-feature-list">
                            {[
                                '✅ Free to get started',
                                '✅ Role-based access control',
                                '✅ Real-time ticket tracking',
                                '✅ Analytics & insights',
                                '✅ Feedback collection',
                            ].map(f => (
                                <div key={f} className="auth-feature-item">{f}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="auth-panel auth-panel--form">
                <div className="auth-form-card">
                    <div className="auth-form-header">
                        <h1>Create your account</h1>
                        <p>Fill in the details below to get started</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row-2">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="John Smith"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Account Type</label>
                                <select
                                    name="role"
                                    className="form-select"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="USER">👤 Customer / User</option>
                                    <option value="SUPPORT">🛠️ Support Agent</option>
                                </select>
                            </div>
                        </div>

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
                            />
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="Min. 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                {strength && (
                                    <div className="pw-strength">
                                        <div className="pw-strength-bar">
                                            <div style={{ width: strength.w, background: strength.color, height: '100%', borderRadius: 4, transition: 'width 0.3s ease' }} />
                                        </div>
                                        <span style={{ color: strength.color, fontSize: '0.75rem' }}>{strength.label}</span>
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-input"
                                    placeholder="Re-enter password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
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
                                    Creating account...
                                </span>
                            ) : 'Create Account →'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">Sign in →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
