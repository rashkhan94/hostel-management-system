import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, BedDouble, Users, ClipboardList,
    CreditCard, UtensilsCrossed, Bell, Settings,
    ChevronLeft, ChevronRight, Building2, UserCog,
    MessageSquareWarning, FileText
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ collapsed, setCollapsed }) => {
    const { user } = useAuth();
    const location = useLocation();

    const adminLinks = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/rooms', icon: BedDouble, label: 'Rooms' },
        { to: '/admin/students', icon: Users, label: 'Students' },
        { to: '/admin/wardens', icon: UserCog, label: 'Wardens' },
        { to: '/admin/fees', icon: CreditCard, label: 'Fees' },
        { to: '/admin/complaints', icon: MessageSquareWarning, label: 'Complaints' },
        { to: '/admin/meals', icon: UtensilsCrossed, label: 'Meal Schedule' },
        { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
    ];

    const wardenLinks = [
        { to: '/warden', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/warden/rooms', icon: BedDouble, label: 'Rooms' },
        { to: '/warden/students', icon: Users, label: 'Students' },
        { to: '/warden/complaints', icon: MessageSquareWarning, label: 'Complaints' },
        { to: '/warden/meals', icon: UtensilsCrossed, label: 'Meal Schedule' },
        { to: '/warden/notifications', icon: Bell, label: 'Notifications' },
    ];

    const studentLinks = [
        { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/student/room', icon: BedDouble, label: 'My Room' },
        { to: '/student/fees', icon: CreditCard, label: 'My Fees' },
        { to: '/student/complaints', icon: MessageSquareWarning, label: 'Complaints' },
        { to: '/student/meals', icon: UtensilsCrossed, label: 'Meal Schedule' },
        { to: '/student/notifications', icon: Bell, label: 'Notifications' },
    ];

    const links = user?.role === 'admin' ? adminLinks
        : user?.role === 'warden' ? wardenLinks
            : studentLinks;

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <Building2 size={20} />
                </div>
                <span className="sidebar-brand">HostelHub</span>
            </div>

            <div className="sidebar-section-title">
                {user?.role === 'admin' ? 'Administration' : user?.role === 'warden' ? 'Warden Panel' : 'Student Portal'}
            </div>

            <nav className="sidebar-nav">
                {links.map(link => {
                    const Icon = link.icon;
                    const isActive = link.to === `/${user?.role}`
                        ? location.pathname === link.to
                        : location.pathname.startsWith(link.to);

                    return (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon className="nav-icon" size={20} />
                            <span className="nav-label">{link.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    {!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
