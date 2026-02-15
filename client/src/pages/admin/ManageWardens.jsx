import { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import { UserCog, Plus, Trash2, ToggleLeft, ToggleRight, Search, X, Mail, Lock, Phone, User } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageWardens = () => {
    const [wardens, setWardens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchWardens = async () => {
        try {
            const res = await authAPI.getUsers({ role: 'warden', search });
            setWardens(res.data.data);
        } catch (e) {
            toast.error('Failed to load wardens');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWardens(); }, [search]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) {
            toast.error('Please fill required fields');
            return;
        }
        setSubmitting(true);
        try {
            await authAPI.register({ ...formData, role: 'warden' });
            toast.success('Warden added successfully!');
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', phone: '' });
            fetchWardens();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add warden');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await authAPI.toggleUserStatus(id);
            toast.success('Status updated');
            fetchWardens();
        } catch (e) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
        try {
            await authAPI.deleteUser(id);
            toast.success('Warden removed');
            fetchWardens();
        } catch (e) {
            toast.error('Failed to remove warden');
        }
    };

    return (
        <div>
            <div className="card-header" style={{ marginBottom: 20 }}>
                <div>
                    <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <UserCog size={22} /> Manage Wardens
                    </h2>
                    <p className="card-subtitle">Add, remove, or manage warden access</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add Warden
                </button>
            </div>

            <div className="filter-bar" style={{ marginBottom: 20 }}>
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        className="form-input"
                        placeholder="Search wardens..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 40 }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</div>
            ) : wardens.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <UserCog size={48} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                    <p style={{ color: 'var(--text-muted)' }}>No wardens found. Add your first warden!</p>
                </div>
            ) : (
                <div className="card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wardens.map(w => (
                                <tr key={w._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="navbar-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                                                {w.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            {w.name}
                                        </div>
                                    </td>
                                    <td>{w.email}</td>
                                    <td>{w.phone || '—'}</td>
                                    <td>
                                        <span className={`status-badge ${w.isActive ? 'success' : 'danger'}`}>
                                            {w.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-ghost btn-icon" title={w.isActive ? 'Deactivate' : 'Activate'} onClick={() => handleToggle(w._id)}>
                                                {w.isActive ? <ToggleRight size={20} style={{ color: 'var(--success)' }} /> : <ToggleLeft size={20} style={{ color: 'var(--text-muted)' }} />}
                                            </button>
                                            <button className="btn btn-ghost btn-icon" title="Remove" onClick={() => handleDelete(w._id, w.name)}>
                                                <Trash2 size={18} style={{ color: 'var(--danger)' }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Warden Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Warden</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAdd}>
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input className="form-input" placeholder="Warden name" value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input type="email" className="form-input" placeholder="warden@hostel.com" value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password *</label>
                                <input type="password" className="form-input" placeholder="Min 6 characters" value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input className="form-input" placeholder="Optional" value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
                                    {submitting ? 'Adding...' : 'Add Warden'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageWardens;
