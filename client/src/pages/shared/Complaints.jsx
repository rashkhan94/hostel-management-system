import { useState, useEffect } from 'react';
import { complaintAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Plus, X, MessageSquareWarning } from 'lucide-react';
import toast from 'react-hot-toast';

const Complaints = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [filters, setFilters] = useState({ status: '', category: '' });
    const [form, setForm] = useState({ title: '', description: '', category: 'maintenance', priority: 'medium' });
    const [updateForm, setUpdateForm] = useState({ status: '', remarks: '', priority: '' });

    const fetchComplaints = async () => {
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.category) params.category = filters.category;
            const res = await complaintAPI.getAll(params);
            setComplaints(res.data.data);
        } catch (e) { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchComplaints(); }, [filters]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await complaintAPI.create(form);
            toast.success('Complaint submitted');
            setShowModal(false);
            setForm({ title: '', description: '', category: 'maintenance', priority: 'medium' });
            fetchComplaints();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const data = {};
            if (updateForm.status) data.status = updateForm.status;
            if (updateForm.remarks) data.remarks = updateForm.remarks;
            if (updateForm.priority) data.priority = updateForm.priority;
            await complaintAPI.update(selectedComplaint._id, data);
            toast.success('Complaint updated');
            setShowUpdateModal(false);
            fetchComplaints();
        } catch (e) { toast.error('Failed to update'); }
    };

    const openUpdate = (c) => {
        setSelectedComplaint(c);
        setUpdateForm({ status: c.status, remarks: c.remarks || '', priority: c.priority });
        setShowUpdateModal(true);
    };

    const statusColors = { pending: 'danger', 'in-progress': 'warning', resolved: 'success', rejected: 'default' };
    const priorityColors = { low: 'info', medium: 'warning', high: 'danger', urgent: 'danger' };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Complaints</h1>
                    <p className="page-description">{user?.role === 'student' ? 'Submit & track your complaints' : 'Manage student complaints'}</p>
                </div>
                {user?.role === 'student' && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> New Complaint
                    </button>
                )}
            </div>

            <div className="filter-bar">
                <select className="form-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select className="form-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                    <option value="">All Categories</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="noise">Noise</option>
                    <option value="internet">Internet</option>
                    <option value="security">Security</option>
                    <option value="other">Other</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : complaints.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><MessageSquareWarning size={28} /></div>
                    <h3 className="empty-state-title">No complaints found</h3>
                    <p className="empty-state-text">{user?.role === 'student' ? 'You haven\'t submitted any complaints yet' : 'No complaints match your filters'}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                {user?.role !== 'student' && <th>Student</th>}
                                <th>Title</th><th>Category</th><th>Priority</th>
                                <th>Status</th><th>Room</th><th>Date</th>
                                {user?.role !== 'student' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.map(c => (
                                <tr key={c._id}>
                                    {user?.role !== 'student' && <td style={{ fontWeight: 500 }}>{c.student?.name}</td>}
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{c.title}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</div>
                                    </td>
                                    <td><span className="badge badge-default">{c.category}</span></td>
                                    <td><span className={`badge badge-${priorityColors[c.priority]}`}>{c.priority}</span></td>
                                    <td><span className={`badge badge-${statusColors[c.status]}`}><span className="badge-dot"></span>{c.status}</span></td>
                                    <td style={{ color: 'var(--text-muted)' }}>{c.roomNumber || '—'}</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                                    {user?.role !== 'student' && (
                                        <td>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openUpdate(c)}>Update</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* New Complaint Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Submit Complaint</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="electrical">Electrical</option>
                                            <option value="plumbing">Plumbing</option>
                                            <option value="cleaning">Cleaning</option>
                                            <option value="noise">Noise</option>
                                            <option value="internet">Internet</option>
                                            <option value="security">Security</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Priority</label>
                                        <select className="form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={4}></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Complaint Modal */}
            {showUpdateModal && (
                <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Update Complaint</h3>
                            <button className="modal-close" onClick={() => setShowUpdateModal(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="modal-body">
                                <div className="card" style={{ marginBottom: 16, background: 'var(--bg-tertiary)' }}>
                                    <h4 style={{ marginBottom: 4 }}>{selectedComplaint?.title}</h4>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedComplaint?.description}</p>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>By: {selectedComplaint?.student?.name} | Room: {selectedComplaint?.roomNumber || 'N/A'}</p>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select className="form-select" value={updateForm.status} onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))}>
                                            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Priority</label>
                                        <select className="form-select" value={updateForm.priority} onChange={e => setUpdateForm(f => ({ ...f, priority: e.target.value }))}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Remarks</label>
                                    <textarea className="form-textarea" value={updateForm.remarks} onChange={e => setUpdateForm(f => ({ ...f, remarks: e.target.value }))} rows={3}></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Complaints;
