import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { notificationAPI } from '../../services/api';
import {
    Bell, Sun, Moon, LogOut, User, Settings, ChevronDown, Menu
} from 'lucide-react';

const Navbar = ({ collapsed, title, subtitle, onMobileToggle }) => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await notificationAPI.getUnreadCount();
                setUnreadCount(res.data.count);
            } catch (e) { }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <nav className={`navbar ${collapsed ? 'collapsed' : ''}`}>
            <div className="navbar-left">
                <button className="btn-ghost btn-icon mobile-menu-btn" onClick={onMobileToggle}>
                    <Menu size={20} />
                </button>
                <div>
                    <div className="navbar-title">{title || 'Dashboard'}</div>
                    {subtitle && <div className="navbar-subtitle">{subtitle}</div>}
                </div>
            </div>

            <div className="navbar-right">
                <button className="navbar-btn" onClick={toggleTheme} title="Toggle theme">
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button className="navbar-btn"
                    onClick={() => navigate(`/${user?.role}/notifications`)}
                    title="Notifications"
                >
                    <Bell size={18} />
                    {unreadCount > 0 && <span className="badge"></span>}
                </button>

                <div className="dropdown" ref={userMenuRef}>
                    <div className="navbar-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
                        <div className="navbar-avatar">{getInitials(user?.name)}</div>
                        <div className="navbar-user-info">
                            <span className="navbar-user-name">{user?.name}</span>
                            <span className="navbar-user-role">{user?.role}</span>
                        </div>
                        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>

                    {showUserMenu && (
                        <div className="user-menu">
                            <div className="user-menu-item" onClick={() => { navigate(`/${user?.role}/profile`); setShowUserMenu(false); }}>
                                <User size={16} /> Profile
                            </div>
                            <div className="user-menu-divider"></div>
                            <div className="user-menu-item danger" onClick={handleLogout}>
                                <LogOut size={16} /> Logout
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
