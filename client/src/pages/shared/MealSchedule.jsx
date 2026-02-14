import { useState, useEffect } from 'react';
import { mealAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Edit2, X, UtensilsCrossed, Coffee, Sun, Moon as MoonIcon, Cookie } from 'lucide-react';
import toast from 'react-hot-toast';

const MealSchedule = () => {
    const { user } = useAuth();
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMeal, setEditMeal] = useState(null);
    const [form, setForm] = useState({ day: 'Monday', breakfast: '', lunch: '', dinner: '', snacks: '' });
    const canEdit = user?.role === 'admin' || user?.role === 'warden';

    const fetchMeals = async () => {
        try {
            const res = await mealAPI.getAll();
            setMeals(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchMeals(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await mealAPI.upsert(form);
            toast.success('Meal schedule updated');
            setShowModal(false);
            fetchMeals();
        } catch (e) { toast.error('Failed to update'); }
    };

    const openEdit = (meal) => {
        setEditMeal(meal);
        setForm({ day: meal.day, breakfast: meal.breakfast, lunch: meal.lunch, dinner: meal.dinner, snacks: meal.snacks });
        setShowModal(true);
    };

    const dayColors = {
        Monday: '#3b82f6', Tuesday: '#8b5cf6', Wednesday: '#10b981',
        Thursday: '#f59e0b', Friday: '#ef4444', Saturday: '#06b6d4', Sunday: '#ec4899'
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Meal Schedule</h1>
                    <p className="page-description">Weekly meal plan for the hostel</p>
                </div>
            </div>

            {meals.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><UtensilsCrossed size={28} /></div>
                    <h3 className="empty-state-title">No meal schedule set</h3>
                    <p className="empty-state-text">The meal schedule hasn't been configured yet</p>
                </div>
            ) : (
                <div className="meal-grid">
                    {meals.map(meal => (
                        <div className="meal-card" key={meal._id}>
                            <div className="meal-card-day" style={{ color: dayColors[meal.day] || 'var(--accent-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {meal.day}
                                {canEdit && (
                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(meal)}>
                                        <Edit2 size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="meal-item">
                                <Coffee size={14} style={{ flexShrink: 0, color: '#f59e0b', marginTop: 2 }} />
                                <span className="meal-item-label">Breakfast</span>
                                <span className="meal-item-value">{meal.breakfast}</span>
                            </div>
                            <div className="meal-item">
                                <Sun size={14} style={{ flexShrink: 0, color: '#10b981', marginTop: 2 }} />
                                <span className="meal-item-label">Lunch</span>
                                <span className="meal-item-value">{meal.lunch}</span>
                            </div>
                            <div className="meal-item">
                                <MoonIcon size={14} style={{ flexShrink: 0, color: '#8b5cf6', marginTop: 2 }} />
                                <span className="meal-item-label">Dinner</span>
                                <span className="meal-item-value">{meal.dinner}</span>
                            </div>
                            <div className="meal-item">
                                <Cookie size={14} style={{ flexShrink: 0, color: '#ef4444', marginTop: 2 }} />
                                <span className="meal-item-label">Snacks</span>
                                <span className="meal-item-value">{meal.snacks}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Edit {form.day} Menu</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Breakfast</label>
                                    <input className="form-input" value={form.breakfast} onChange={e => setForm(f => ({ ...f, breakfast: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Lunch</label>
                                    <input className="form-input" value={form.lunch} onChange={e => setForm(f => ({ ...f, lunch: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Dinner</label>
                                    <input className="form-input" value={form.dinner} onChange={e => setForm(f => ({ ...f, dinner: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Snacks</label>
                                    <input className="form-input" value={form.snacks} onChange={e => setForm(f => ({ ...f, snacks: e.target.value }))} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default MealSchedule;
