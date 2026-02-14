import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import {
    Users, BedDouble, CreditCard, MessageSquareWarning,
    TrendingUp, Building2, AlertTriangle, CheckCircle2
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await dashboardAPI.getStats();
                setStats(res.data.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading dashboard...</p>
            </div>
        );
    }

    if (!stats) return null;

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

    const complaintChartData = stats.complaintsByCategory?.map(c => ({
        name: c._id?.charAt(0).toUpperCase() + c._id?.slice(1),
        value: c.count
    })) || [];

    const occupancyData = [
        { name: 'Available', value: stats.rooms.available, color: '#10b981' },
        { name: 'Full', value: stats.rooms.full, color: '#f59e0b' },
        { name: 'Maintenance', value: stats.rooms.maintenance, color: '#ef4444' },
    ];

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-description">Overview of your hostel management system</p>
                </div>
            </div>

            <div className="stats-grid">
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                    <div className="stat-icon blue"><Users size={24} /></div>
                    <div className="stat-info">
                        <p className="stat-label">Total Students</p>
                        <h2 className="stat-value">{stats.students}</h2>
                    </div>
                </motion.div>

                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="stat-icon purple"><BedDouble size={24} /></div>
                    <div className="stat-info">
                        <p className="stat-label">Total Rooms</p>
                        <h2 className="stat-value">{stats.rooms.total}</h2>
                        <span className="stat-change up">{stats.occupancyRate}% occupied</span>
                    </div>
                </motion.div>

                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="stat-icon green"><CreditCard size={24} /></div>
                    <div className="stat-info">
                        <p className="stat-label">Revenue Collected</p>
                        <h2 className="stat-value">₹{stats.revenue.total?.toLocaleString()}</h2>
                        <span className="stat-change down">₹{stats.revenue.pending?.toLocaleString()} pending</span>
                    </div>
                </motion.div>

                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="stat-icon orange"><MessageSquareWarning size={24} /></div>
                    <div className="stat-info">
                        <p className="stat-label">Pending Complaints</p>
                        <h2 className="stat-value">{stats.complaints.pending}</h2>
                        <span className="stat-change up">{stats.complaints.resolved} resolved</span>
                    </div>
                </motion.div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Room Occupancy</h3>
                            <p className="card-subtitle">Current room status distribution</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={occupancyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={110}
                                paddingAngle={4}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {occupancyData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Complaints by Category</h3>
                            <p className="card-subtitle">Distribution of complaint types</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={complaintChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 8,
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Recent Complaints</h3>
                </div>
                <div className="table-container" style={{ border: 'none' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentComplaints?.map(c => (
                                <tr key={c._id}>
                                    <td style={{ fontWeight: 500 }}>{c.student?.name || 'N/A'}</td>
                                    <td>{c.title}</td>
                                    <td><span className="badge badge-default">{c.category}</span></td>
                                    <td>
                                        <span className={`badge badge-${c.priority === 'high' || c.priority === 'urgent' ? 'danger' : c.priority === 'medium' ? 'warning' : 'info'}`}>
                                            {c.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${c.status === 'resolved' ? 'success' : c.status === 'in-progress' ? 'warning' : 'danger'}`}>
                                            <span className="badge-dot"></span> {c.status}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {(!stats.recentComplaints || stats.recentComplaints.length === 0) && (
                                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No complaints yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
