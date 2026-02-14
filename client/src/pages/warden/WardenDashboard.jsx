import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import {
    Users, BedDouble, MessageSquareWarning, CheckCircle2
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { motion } from 'framer-motion';

const WardenDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await dashboardAPI.getStats();
                setStats(res.data.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading-container"><div className="spinner"></div><p className="loading-text">Loading dashboard...</p></div>;
    if (!stats) return null;

    const occupancyData = [
        { name: 'Available', value: stats.rooms.available, color: '#10b981' },
        { name: 'Full', value: stats.rooms.full, color: '#f59e0b' },
        { name: 'Maintenance', value: stats.rooms.maintenance, color: '#ef4444' },
    ];

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Warden Dashboard</h1>
                    <p className="page-description">Monitor hostel operations</p>
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
                        <p className="stat-label">Rooms</p>
                        <h2 className="stat-value">{stats.rooms.total}</h2>
                        <span className="stat-change up">{stats.occupancyRate}% occupied</span>
                    </div>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="stat-icon orange"><MessageSquareWarning size={24} /></div>
                    <div className="stat-info">
                        <p className="stat-label">Pending Complaints</p>
                        <h2 className="stat-value">{stats.complaints.pending}</h2>
                    </div>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="stat-icon green"><CheckCircle2 size={24} /></div>
                    <div className="stat-info">
                        <p className="stat-label">Resolved</p>
                        <h2 className="stat-value">{stats.complaints.resolved}</h2>
                    </div>
                </motion.div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <div className="card-header">
                        <h3 className="card-title">Room Status</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}>
                                {occupancyData.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Complaints</h3>
                    </div>
                    {stats.recentComplaints?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {stats.recentComplaints.map(c => (
                                <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 10 }}>
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: 14 }}>{c.title}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.student?.name} · {new Date(c.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <span className={`badge badge-${c.status === 'resolved' ? 'success' : c.status === 'in-progress' ? 'warning' : 'danger'}`}>
                                        {c.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No recent complaints</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default WardenDashboard;
