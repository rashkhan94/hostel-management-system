import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ title, subtitle }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleMobileToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const closeMobile = () => {
        setMobileOpen(false);
    };

    return (
        <div className="app-layout">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                closeMobile={closeMobile}
            />
            <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
                <Navbar
                    collapsed={collapsed}
                    title={title}
                    subtitle={subtitle}
                    onMobileToggle={handleMobileToggle}
                />
                <div className="page-container animate-in">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
