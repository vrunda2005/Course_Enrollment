import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <h1>Course Enrollment</h1>
            <div className="links">
                <Link to="/" className={isActive('/')}>Dashboard</Link>
                <Link to="/students" className={isActive('/students')}>Students</Link>
                <Link to="/courses" className={isActive('/courses')}>Courses</Link>
                <Link to="/enrollments" className={isActive('/enrollments')}>Enrollments</Link>
            </div>
            <div className="user-actions">
                <span className="user-info">
                    {user?.username} ({user?.role})
                </span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;
