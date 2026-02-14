import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { roomAPI, complaintAPI, feeAPI, mealAPI } from '../../services/api';
import { BedDouble, CreditCard, MessageSquareWarning, UtensilsCrossed, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [room, setRoom] = useState(null);
    const [fees, setFees] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [todayMeal, setTodayMeal] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user?.room) {
                    const roomRes = await roomAPI.getOne(typeof user.room === 'object' ? user.room._id : user.room);
                    setRoom(roomRes.data.data);
                }
                const [feesRes, complaintsRes, mealsRes] = await Promise.all([
                    feeAPI.getAll({ limit: 5 }),
                    complaintAPI.getAll({ limit: 5 }),
                    mealAPI.getAll()
                ]);
                setFees(feesRes.data.data);
                setComplaints(complaintsRes.data.data);
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const today = days[new Date().getDay()];
                setTodayMeal(mealsRes.data.data?.find(m => m.day === today));
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [user]);

    const unpaidFees = fees.filter(f => f.status === 'unpaid' || f.status === 'overdue');
    const pendingComplaints = complaints.filter(c => c.status === 'pending' || c.status === 'in-progress');

    if (loading) return <div className="loading-container"><div className="spinner"></div><p className="loading-text">Loading dashboard...</p></div>;

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p className="page-description">Here's your hostel overview</p>
                </div>
            </div>

            <div className="stats-grid">
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                    <div className="stat-icon blue"><BedDouble size={24} /></div>
                    <div className="stat-info">
                        <p className="stat-label">My Room</p>
                        <h2 className="stat-value">{room?.roomNumber || 'N/A'}</h2>
                        {room && <span className="stat-change up">Block {room.block} · Floor {room.floor}</span>}
                    </div>
                </motion.div>

                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className={`stat-icon ${unpaidFees.length > 0 ? 'red' : 'green'}`}><CreditCard size={24} /></div>
                    <div className="stat-info">
                        <p className="stat-label">Pending Fees</p>
                        <h2 className="stat-value">{unpaidFees.length}</h2>
                        {unpaidFees.length > 0 ? (
                            <span className="stat-change down">₹{unpaidFees.reduce((a, f) => a + f.amount, 0).toLocaleString()} due</span>
                        ) : (
                            <span className="stat-change up">All paid!</span>
                        )}
                    </div>
                </motion.div>

                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className={`stat-icon ${pendingComplaints.length > 0 ? 'orange' : 'green'}`}><MessageSquareWarning size={24} /></div>
                    <div className="stat-info">
                        <p className="stat-label">Active Complaints</p>
                        <h2 className="stat-value">{pendingComplaints.length}</h2>
                    </div>
                </motion.div>

                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="stat-icon cyan"><UtensilsCrossed size={24} /></div>
                    <div className="stat-info">
                        <p className="stat-label">Today's Meal</p>
                        <h2 className="stat-value" style={{ fontSize: 16 }}>{todayMeal?.day || 'N/A'}</h2>
                    </div>
                </motion.div>
            </div>

            <div className="charts-grid">
                {/* Today's Meal Card */}
                {todayMeal && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">🍽️ Today's Menu — {todayMeal.day}</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={{ padding: 14, background: 'var(--bg-tertiary)', borderRadius: 10 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--warning)', marginBottom: 4 }}>☀️ BREAKFAST</div>
                                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{todayMeal.breakfast}</div>
                            </div>
                            <div style={{ padding: 14, background: 'var(--bg-tertiary)', borderRadius: 10 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', marginBottom: 4 }}>🌞 LUNCH</div>
                                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{todayMeal.lunch}</div>
                            </div>
                            <div style={{ padding: 14, background: 'var(--bg-tertiary)', borderRadius: 10 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: 4 }}>🌙 DINNER</div>
                                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{todayMeal.dinner}</div>
                            </div>
                            <div style={{ padding: 14, background: 'var(--bg-tertiary)', borderRadius: 10 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', marginBottom: 4 }}>🍪 SNACKS</div>
                                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{todayMeal.snacks}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Room Details Card */}
                {room && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">🏠 Room Details</h3>
                        </div>
                        <div style={{ display: 'grid', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Room Number</span>
                                <span style={{ fontWeight: 600 }}>{room.roomNumber}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Type</span>
                                <span style={{ textTransform: 'capitalize' }}>{room.type}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Block / Floor</span>
                                <span>Block {room.block} · Floor {room.floor}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Occupancy</span>
                                <span>{room.occupants?.length || 0} / {room.capacity}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Rent</span>
                                <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>₹{room.pricePerMonth?.toLocaleString()}/mo</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                                {room.amenities?.map((a, i) => (
                                    <span key={i} className="badge badge-primary">{a}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default StudentDashboard;
