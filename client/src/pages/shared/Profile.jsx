import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { User, Mail, Phone, Building2, BookOpen, Calendar, MapPin, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '', phone: user?.phone || '',
        address: user?.address || '', parentName: user?.parentName || '',
        parentPhone: user?.parentPhone || ''
    });
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await authAPI.updateProfile(form);
            updateUser(res.data.data);
            toast.success('Profile updated');
            setEditing(false);
        } catch (e) { toast.error('Failed to update'); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        try {
            await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            toast.success('Password changed');
            setChangingPassword(false);
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    };

    const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">My Profile</h1>
            </div>

            <div className="profile-grid">
                <div className="card profile-sidebar" style={{ padding: 30 }}>
                    <div className="profile-avatar-lg">{getInitials(user?.name)}</div>
                    <h2 className="profile-name">{user?.name}</h2>
                    <p className="profile-role">{user?.role}</p>
                    <div style={{ marginTop: 20 }}>
                        <span className={`badge badge-${user?.isActive ? 'success' : 'danger'}`} style={{ fontSize: 13, padding: '6px 16px' }}>
                            {user?.isActive ? '● Active' : '● Inactive'}
                        </span>
                    </div>
                    {user?.studentId && (
                        <div style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 14 }}>
                            ID: {user.studentId}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Personal Information</h3>
                            {!editing && (
                                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>Edit</button>
                            )}
                        </div>
                        {editing ? (
                            <form onSubmit={handleUpdate}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                                </div>
                                {user?.role === 'student' && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Parent Name</label>
                                            <input className="form-input" value={form.parentName} onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Parent Phone</label>
                                            <input className="form-input" value={form.parentPhone} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))} />
                                        </div>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ display: 'grid', gap: 14 }}>
                                {[
                                    { icon: Mail, label: 'Email', value: user?.email },
                                    { icon: Phone, label: 'Phone', value: user?.phone || '—' },
                                    { icon: MapPin, label: 'Address', value: user?.address || '—' },
                                    { icon: BookOpen, label: 'Department', value: user?.department || '—' },
                                    { icon: Calendar, label: 'Year', value: user?.year || '—' },
                                    { icon: Shield, label: 'Role', value: user?.role },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                                        <item.icon size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, color: 'var(--text-muted)', minWidth: 100 }}>{item.label}</span>
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Security</h3>
                        </div>
                        {changingPassword ? (
                            <form onSubmit={handleChangePassword}>
                                <div className="form-group">
                                    <label className="form-label">Current Password</label>
                                    <input className="form-input" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <input className="form-input" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Confirm Password</label>
                                        <input className="form-input" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button type="submit" className="btn btn-primary">Change Password</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setChangingPassword(false)}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <button className="btn btn-secondary" onClick={() => setChangingPassword(true)}>Change Password</button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
