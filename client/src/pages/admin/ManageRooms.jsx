import { useState, useEffect } from 'react';
import { roomAPI, studentAPI } from '../../services/api';
import { Plus, Search, Edit2, Trash2, UserPlus, UserMinus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAllocateModal, setShowAllocateModal] = useState(false);
    const [editRoom, setEditRoom] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [students, setStudents] = useState([]);
    const [filters, setFilters] = useState({ block: '', status: '', search: '' });
    const [form, setForm] = useState({
        roomNumber: '', floor: '', block: '', type: 'double',
        capacity: 2, pricePerMonth: 5000, amenities: 'WiFi, Desk, Fan', description: ''
    });

    const fetchRooms = async () => {
        try {
            const params = {};
            if (filters.block) params.block = filters.block;
            if (filters.status) params.status = filters.status;
            if (filters.search) params.search = filters.search;
            const res = await roomAPI.getAll(params);
            setRooms(res.data.data);
        } catch (e) { toast.error('Failed to load rooms'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchRooms(); }, [filters]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...form,
                floor: parseInt(form.floor),
                capacity: parseInt(form.capacity),
                pricePerMonth: parseInt(form.pricePerMonth),
                amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean)
            };
            if (editRoom) {
                await roomAPI.update(editRoom._id, data);
                toast.success('Room updated');
            } else {
                await roomAPI.create(data);
                toast.success('Room created');
            }
            setShowModal(false);
            setEditRoom(null);
            resetForm();
            fetchRooms();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this room?')) return;
        try {
            await roomAPI.delete(id);
            toast.success('Room deleted');
            fetchRooms();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed to delete'); }
    };

    const openEdit = (room) => {
        setEditRoom(room);
        setForm({
            roomNumber: room.roomNumber, floor: room.floor, block: room.block,
            type: room.type, capacity: room.capacity, pricePerMonth: room.pricePerMonth,
            amenities: room.amenities?.join(', ') || '', description: room.description || ''
        });
        setShowModal(true);
    };

    const openAllocate = async (room) => {
        setSelectedRoom(room);
        try {
            const res = await studentAPI.getAll({ limit: 100 });
            setStudents(res.data.data.filter(s => !s.room));
        } catch (e) { }
        setShowAllocateModal(true);
    };

    const handleAllocate = async (studentId) => {
        try {
            await roomAPI.allocate(selectedRoom._id, { studentId });
            toast.success('Student allocated');
            setShowAllocateModal(false);
            fetchRooms();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    const handleDeallocate = async (roomId, studentId) => {
        if (!window.confirm('Remove student from room?')) return;
        try {
            await roomAPI.deallocate(roomId, { studentId });
            toast.success('Student removed');
            fetchRooms();
        } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    const resetForm = () => {
        setForm({ roomNumber: '', floor: '', block: '', type: 'double', capacity: 2, pricePerMonth: 5000, amenities: 'WiFi, Desk, Fan', description: '' });
    };

    const statusColors = { available: 'success', full: 'warning', maintenance: 'danger', reserved: 'info' };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Room Management</h1>
                    <p className="page-description">Manage hostel rooms and allocations</p>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setEditRoom(null); setShowModal(true); }}>
                    <Plus size={18} /> Add Room
                </button>
            </div>

            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Search className="search-icon" />
                    <input className="form-input" placeholder="Search rooms..." value={filters.search}
                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))} />
                </div>
                <select className="form-select" value={filters.block} onChange={(e) => setFilters(f => ({ ...f, block: e.target.value }))}>
                    <option value="">All Blocks</option>
                    <option value="A">Block A</option>
                    <option value="B">Block B</option>
                    <option value="C">Block C</option>
                </select>
                <select className="form-select" value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}>
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="full">Full</option>
                    <option value="maintenance">Maintenance</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-container"><div className="spinner"></div></div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Room No.</th>
                                <th>Block</th>
                                <th>Floor</th>
                                <th>Type</th>
                                <th>Occupancy</th>
                                <th>Price/Month</th>
                                <th>Status</th>
                                <th>Occupants</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(room => (
                                <tr key={room._id}>
                                    <td style={{ fontWeight: 600 }}>{room.roomNumber}</td>
                                    <td>{room.block}</td>
                                    <td>{room.floor}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{room.type}</td>
                                    <td>{room.occupants?.length || 0} / {room.capacity}</td>
                                    <td>₹{room.pricePerMonth?.toLocaleString()}</td>
                                    <td><span className={`badge badge-${statusColors[room.status]}`}><span className="badge-dot"></span>{room.status}</span></td>
                                    <td>
                                        {room.occupants?.map(o => (
                                            <span key={o._id} className="badge badge-primary" style={{ marginRight: 4, marginBottom: 4, cursor: 'pointer' }}
                                                onClick={() => handleDeallocate(room._id, o._id)}>
                                                {o.name} <X size={12} />
                                            </span>
                                        ))}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(room)} title="Edit"><Edit2 size={15} /></button>
                                            {room.occupants?.length < room.capacity && room.status !== 'maintenance' && (
                                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openAllocate(room)} title="Allocate"><UserPlus size={15} /></button>
                                            )}
                                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(room._id)} title="Delete" style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {rooms.length === 0 && (
                                <tr><td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No rooms found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editRoom ? 'Edit Room' : 'Add New Room'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Room Number</label>
                                        <input className="form-input" value={form.roomNumber} onChange={(e) => setForm(f => ({ ...f, roomNumber: e.target.value }))} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Block</label>
                                        <input className="form-input" value={form.block} onChange={(e) => setForm(f => ({ ...f, block: e.target.value }))} required />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Floor</label>
                                        <input className="form-input" type="number" value={form.floor} onChange={(e) => setForm(f => ({ ...f, floor: e.target.value }))} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Type</label>
                                        <select className="form-select" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
                                            <option value="single">Single</option>
                                            <option value="double">Double</option>
                                            <option value="triple">Triple</option>
                                            <option value="quad">Quad</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Capacity</label>
                                        <input className="form-input" type="number" min="1" max="6" value={form.capacity} onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value }))} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Price/Month (₹)</label>
                                        <input className="form-input" type="number" value={form.pricePerMonth} onChange={(e) => setForm(f => ({ ...f, pricePerMonth: e.target.value }))} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Amenities (comma-separated)</label>
                                    <input className="form-input" value={form.amenities} onChange={(e) => setForm(f => ({ ...f, amenities: e.target.value }))} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editRoom ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Allocate Modal */}
            {showAllocateModal && (
                <div className="modal-overlay" onClick={() => setShowAllocateModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Allocate Student to {selectedRoom?.roomNumber}</h3>
                            <button className="modal-close" onClick={() => setShowAllocateModal(false)}><X size={16} /></button>
                        </div>
                        <div className="modal-body">
                            {students.length > 0 ? students.map(s => (
                                <div key={s._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{s.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.studentId} · {s.department}</div>
                                    </div>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleAllocate(s._id)}>Allocate</button>
                                </div>
                            )) : (
                                <div className="empty-state" style={{ padding: 30 }}>
                                    <p className="empty-state-text">No unallocated students found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageRooms;
