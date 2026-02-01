import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card glass-card">
                    <div className="auth-header">
                        <div className="auth-icon">🔐</div>
                        <h1 className="gradient-text">Welcome Back</h1>
                        <p className="auth-subtitle">Login to manage your complaints</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register" className="auth-link">
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="auth-demo-info glass-card">
                    <h3>🎯 Demo Credentials</h3>
                    <div className="demo-credentials">
                        <div className="demo-card">
                            <h4>👤 User Account</h4>
                            <p><strong>Email:</strong> user@demo.com</p>
                            <p><strong>Password:</strong> user123</p>
                        </div>
                        <div className="demo-card">
                            <h4>🛠️ Support Account</h4>
                            <p><strong>Email:</strong> support@demo.com</p>
                            <p><strong>Password:</strong> support123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
