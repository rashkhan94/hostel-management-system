import { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, X, Bell, Check, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', type: 'info', broadcast: true, targetRole: 'all' });
    const canCreate = user?.role === 'admin' || user?.role === 'warden';

    const fetchNotifications = async () => {
        try {
            const res = await notificationAPI.getAll();
            setNotifications(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await notificationAPI.create(form);
            toast.success('Notification sent');
            setShowModal(false);
            setForm({ title: '', message: '', type: 'info', broadcast: true, targetRole: 'all' });
            fetchNotifications();
        } catch (e) { toast.error('Failed'); }
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            fetchNotifications();
        } catch (e) { }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            toast.success('All marked as read');
            fetchNotifications();
        } catch (e) { }
    };

    const typeColors = { info: 'info', warning: 'warning', alert: 'danger', success: 'success' };
    const typeIcons = { info: '📢', warning: '⚠️', alert: '🚨', success: '✅' };

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Notifications</h1>
                    <p className="page-description">Stay updated with important announcements</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-secondary" onClick={handleMarkAllRead}>
                        <CheckCheck size={16} /> Mark All Read
                    </button>
                    {canCreate && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> New Notification
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : notifications.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><Bell size={28} /></div>
                    <h3 className="empty-state-title">No notifications</h3>
                    <p className="empty-state-text">You're all caught up!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {notifications.map(n => (
                        <div key={n._id} className="card" style={{
                            padding: '16px 20px',
                            opacity: n.isRead ? 0.7 : 1,
                            borderLeft: `3px solid var(--${typeColors[n.type] || 'info'})`,
                            cursor: 'pointer'
                        }}
                            onClick={() => !n.isRead && handleMarkRead(n._id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                                    <span style={{ fontSize: 20 }}>{typeIcons[n.type]}</span>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{n.title}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</div>
                                        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                                            <span>By: {n.createdBy?.name || 'System'}</span>
                                            <span>{timeAgo(n.createdAt)}</span>
                                            <span className={`badge badge-${typeColors[n.type]}`} style={{ padding: '1px 8px', fontSize: 11 }}>{n.type}</span>
                                        </div>
                                    </div>
                                </div>
                                {!n.isRead && (
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0, marginTop: 6 }}></span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Create Notification</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Message</label>
                                    <textarea className="form-textarea" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={3}></textarea>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Type</label>
                                        <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                            <option value="info">Info</option>
                                            <option value="warning">Warning</option>
                                            <option value="alert">Alert</option>
                                            <option value="success">Success</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Target Role</label>
                                        <select className="form-select" value={form.targetRole} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}>
                                            <option value="all">All Users</option>
                                            <option value="student">Students Only</option>
                                            <option value="warden">Wardens Only</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Send Notification</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Notifications;
