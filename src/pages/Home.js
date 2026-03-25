import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Home.css';

const Home = () => {
    const { isAuthenticated } = useAuth();
    const { theme, changeTheme, THEMES } = useTheme();

    const themeOptions = [
        { key: THEMES.DARK, icon: '🌙', label: 'Dark' },
        { key: THEMES.LIGHT, icon: '☀️', label: 'Light' },
        { key: THEMES.SYSTEM, icon: '💻', label: 'System' },
    ];
    const activeOption = themeOptions.find(o => o.key === theme) || themeOptions[0];

    const cycleTheme = () => {
        const cycle = [THEMES.DARK, THEMES.LIGHT, THEMES.SYSTEM];
        const next = cycle[(cycle.indexOf(theme) + 1) % cycle.length];
        changeTheme(next);
    };

    return (
        <div className="home">
            {/* Floating theme toggle on public pages */}
            <button
                id="home-theme-toggle"
                className="theme-toggle-btn"
                onClick={cycleTheme}
                title={`Switch theme (current: ${activeOption.label})`}
                style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 200 }}
            >
                <span className="theme-icon">{activeOption.icon}</span>
                <span>{activeOption.label}</span>
            </button>
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">⚡ Professional Complaint Management</div>
                        <h1 className="hero-title">
                            Streamline Your <span className="gradient-text">Complaint Resolution</span> Process
                        </h1>
                        <p className="hero-description">
                            A powerful, modern platform for managing customer complaints efficiently.
                            Track, resolve, and gather feedback all in one place.
                        </p>
                        <div className="hero-actions">
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="btn btn-primary btn-lg">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary btn-lg">
                                        Get Started
                                    </Link>
                                    <Link to="/login" className="btn btn-secondary btn-lg">
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title gradient-text">Key Features</h2>
                    <div className="features-grid">
                        <div className="feature-card glass-card">
                            <div className="feature-icon">🎯</div>
                            <h3>Easy Complaint Submission</h3>
                            <p>Users can quickly submit complaints with detailed information and categorization.</p>
                        </div>

                        <div className="feature-card glass-card">
                            <div className="feature-icon">📊</div>
                            <h3>Real-time Tracking</h3>
                            <p>Monitor complaint status in real-time from submission to resolution.</p>
                        </div>

                        <div className="feature-card glass-card">
                            <div className="feature-icon">🔐</div>
                            <h3>Secure Authentication</h3>
                            <p>JWT-based authentication ensures your data is protected and secure.</p>
                        </div>

                        <div className="feature-card glass-card">
                            <div className="feature-icon">👥</div>
                            <h3>Role-Based Access</h3>
                            <p>Different dashboards for users and support staff with appropriate permissions.</p>
                        </div>

                        <div className="feature-card glass-card">
                            <div className="feature-icon">⚡</div>
                            <h3>Quick Resolution</h3>
                            <p>Support team can efficiently manage and update complaint statuses.</p>
                        </div>

                        <div className="feature-card glass-card">
                            <div className="feature-icon">⭐</div>
                            <h3>Feedback System</h3>
                            <p>Collect valuable feedback after complaint resolution for continuous improvement.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title gradient-text">How It Works</h2>
                    <div className="steps-grid">
                        <div className="step-card glass-card">
                            <div className="step-number">1</div>
                            <h3>Submit Complaint</h3>
                            <p>Users register and submit their complaints with relevant details.</p>
                        </div>

                        <div className="step-card glass-card">
                            <div className="step-number">2</div>
                            <h3>Track Progress</h3>
                            <p>Monitor your complaint status as it moves through different stages.</p>
                        </div>

                        <div className="step-card glass-card">
                            <div className="step-number">3</div>
                            <h3>Get Resolution</h3>
                            <p>Support team reviews and resolves your complaint efficiently.</p>
                        </div>

                        <div className="step-card glass-card">
                            <div className="step-number">4</div>
                            <h3>Provide Feedback</h3>
                            <p>Share your experience once the complaint is closed.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-card glass-card">
                        <h2>Ready to Get Started?</h2>
                        <p>Join thousands of satisfied users managing their complaints efficiently</p>
                        {!isAuthenticated && (
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Create Free Account
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
