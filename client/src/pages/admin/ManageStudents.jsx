import { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import { Plus, Search, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'student', phone: '',
        studentId: '', department: '', year: '', parentName: '', parentPhone: '', address: ''
    });

    const fetchStudents = async () => {
        try {
            const res = await authAPI.getUsers({ role: 'student', search, limit: 50 });
            setStudents(res.data.data);
        } catch (e) { toast.error('Failed to load students'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStudents(); }, [search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authAPI.register(form);
            toast.success('Student registered');
            setShowModal(false);
            setForm({ name: '', email: '', password: '', role: 'student', phone: '', studentId: '', department: '', year: '', parentName: '', parentPhone: '', address: '' });
            fetchStudents();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    const handleToggle = async (id) => {
        try {
            await authAPI.toggleUserStatus(id);
            toast.success('Status updated');
            fetchStudents();
        } catch (e) { toast.error('Failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this student?')) return;
        try {
            await authAPI.deleteUser(id);
            toast.success('Student deleted');
            fetchStudents();
        } catch (e) { toast.error('Failed'); }
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Students</h1>
                    <p className="page-description">Manage student registrations</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add Student
                </button>
            </div>

            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Search className="search-icon" />
                    <input className="form-input" placeholder="Search by name, email, or ID..."
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th><th>Student ID</th><th>Email</th>
                                <th>Department</th><th>Year</th><th>Room</th>
                                <th>Status</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(s => (
                                <tr key={s._id}>
                                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                                    <td>{s.studentId || '—'}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                                    <td>{s.department || '—'}</td>
                                    <td>{s.year || '—'}</td>
                                    <td>{s.room?.roomNumber || <span className="badge badge-default">Unassigned</span>}</td>
                                    <td>
                                        <span className={`badge badge-${s.isActive ? 'success' : 'danger'}`}>
                                            <span className="badge-dot"></span>{s.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleToggle(s._id)} title="Toggle status">
                                                {s.isActive ? <ToggleRight size={18} style={{ color: 'var(--success)' }} /> : <ToggleLeft size={18} />}
                                            </button>
                                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(s._id)} title="Delete" style={{ color: 'var(--danger)' }}>
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No students found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Register New Student</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Student ID</label>
                                        <input className="form-input" value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} required />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Password</label>
                                        <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Department</label>
                                        <select className="form-select" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                                            <option value="">Select</option>
                                            <option value="CSE">CSE</option><option value="ECE">ECE</option>
                                            <option value="ME">ME</option><option value="CE">CE</option>
                                            <option value="EE">EE</option><option value="IT">IT</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Year</label>
                                        <select className="form-select" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
                                            <option value="">Select</option>
                                            <option value="1st">1st Year</option><option value="2nd">2nd Year</option>
                                            <option value="3rd">3rd Year</option><option value="4th">4th Year</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Parent Phone</label>
                                        <input className="form-input" value={form.parentPhone} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Parent Name</label>
                                    <input className="form-input" value={form.parentName} onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <textarea className="form-textarea" rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Register Student</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageStudents;
