import { useState, useEffect } from 'react';
import { feeAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, X, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const Fees = () => {
    const { user } = useAuth();
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({ status: '', month: '' });
    const [form, setForm] = useState({ student: '', amount: '', month: 'January', year: new Date().getFullYear(), dueDate: '' });
    const isAdmin = user?.role === 'admin';

    const fetchFees = async () => {
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.month) params.month = filters.month;
            const res = await feeAPI.getAll(params);
            setFees(res.data.data);
        } catch (e) { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchFees(); }, [filters]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await feeAPI.create({ ...form, amount: parseInt(form.amount), year: parseInt(form.year) });
            toast.success('Fee entry created');
            setShowModal(false);
            fetchFees();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    const handleMarkPaid = async (id) => {
        try {
            await feeAPI.update(id, { status: 'paid', paidAt: new Date(), paymentMethod: 'online' });
            toast.success('Marked as paid');
            fetchFees();
        } catch (e) { toast.error('Failed'); }
    };

    const statusColors = { paid: 'success', unpaid: 'danger', partial: 'warning', overdue: 'danger' };
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">{user?.role === 'student' ? 'My Fees' : 'Fee Management'}</h1>
                    <p className="page-description">{user?.role === 'student' ? 'View your fee payment history' : 'Manage student fee records'}</p>
                </div>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Add Fee
                    </button>
                )}
            </div>

            <div className="filter-bar">
                <select className="form-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                    <option value="">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="overdue">Overdue</option>
                </select>
                <select className="form-select" value={filters.month} onChange={e => setFilters(f => ({ ...f, month: e.target.value }))}>
                    <option value="">All Months</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : fees.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><CreditCard size={28} /></div>
                    <h3 className="empty-state-title">No fee records</h3>
                    <p className="empty-state-text">No fee records matching your filters</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                {user?.role !== 'student' && <th>Student</th>}
                                <th>Month</th><th>Year</th><th>Amount</th>
                                <th>Due Date</th><th>Status</th><th>Paid At</th>
                                {isAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {fees.map(f => (
                                <tr key={f._id}>
                                    {user?.role !== 'student' && <td style={{ fontWeight: 500 }}>{f.student?.name}</td>}
                                    <td>{f.month}</td>
                                    <td>{f.year}</td>
                                    <td style={{ fontWeight: 600 }}>₹{f.amount?.toLocaleString()}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—'}</td>
                                    <td><span className={`badge badge-${statusColors[f.status]}`}><span className="badge-dot"></span>{f.status}</span></td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{f.paidAt ? new Date(f.paidAt).toLocaleDateString() : '—'}</td>
                                    {isAdmin && (
                                        <td>
                                            {f.status !== 'paid' && (
                                                <button className="btn btn-success btn-sm" onClick={() => handleMarkPaid(f._id)}>Mark Paid</button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add Fee Entry</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Student ID (User ObjectId)</label>
                                    <input className="form-input" value={form.student} onChange={e => setForm(f => ({ ...f, student: e.target.value }))} required placeholder="Paste student _id" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Amount (₹)</label>
                                        <input className="form-input" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Month</label>
                                        <select className="form-select" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}>
                                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Year</label>
                                        <input className="form-input" type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Due Date</label>
                                        <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Fees;
