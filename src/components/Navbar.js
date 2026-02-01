import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-brand">
                        <div className="brand-icon">⚡</div>
                        <span className="gradient-text">ComplaintHub</span>
                    </Link>

                    <div className="navbar-menu">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="nav-link">
                                    Dashboard
                                </Link>
                                <div className="user-menu">
                                    <div className="user-avatar">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="user-info">
                                        <span className="user-name">{user?.name}</span>
                                        <span className="user-role">{user?.role}</span>
                                    </div>
                                    <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-secondary btn-sm">
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-primary btn-sm">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
