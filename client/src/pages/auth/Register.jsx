import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import {
    Building2, User, Mail, Lock, Eye, EyeOff, Phone, GraduationCap,
    BookOpen, Calendar, Users, MapPin, ArrowRight, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', password: '', phone: '',
        studentId: '', department: '', year: '',
        parentName: '', parentPhone: '', address: ''
    });

    const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const validateStep = (s) => {
        if (s === 1) {
            if (!form.name || !form.email || !form.phone) {
                toast.error('Please fill all required fields');
                return false;
            }
            if (!/\S+@\S+\.\S+/.test(form.email)) {
                toast.error('Please enter a valid email');
                return false;
            }
            return true;
        }
        if (s === 2) {
            if (!form.studentId || !form.department || !form.year) {
                toast.error('Please fill all required fields');
                return false;
            }
            return true;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(step)) setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.password || form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await authAPI.registerStudent(form);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { num: 1, label: 'Personal', icon: User },
        { num: 2, label: 'Academic', icon: GraduationCap },
        { num: 3, label: 'Account', icon: Lock },
    ];

    const slideVariants = {
        enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 })
    };

    return (
        <div className="auth-page">
            <div className="auth-bg">
                <div className="auth-orb auth-orb-1"></div>
                <div className="auth-orb auth-orb-2"></div>
                <div className="auth-orb auth-orb-3"></div>
            </div>

            <motion.div
                className="auth-wrapper"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Left Hero */}
                <div className="auth-hero">
                    <div className="auth-hero-content">
                        <div className="auth-brand">
                            <div className="auth-brand-icon"><Building2 size={28} /></div>
                            <h1>HostelHub</h1>
                        </div>
                        <h2>Join Your<br /><span>Hostel Community</span></h2>
                        <p>Create your student account to access room details, meal schedules, fee tracking, and more.</p>
                        <div className="auth-features">
                            <div className="auth-feature"><CheckCircle2 size={16} /> Room allocation & details</div>
                            <div className="auth-feature"><CheckCircle2 size={16} /> Fee tracking & payments</div>
                            <div className="auth-feature"><CheckCircle2 size={16} /> Meal schedule access</div>
                            <div className="auth-feature"><CheckCircle2 size={16} /> Complaint management</div>
                        </div>
                    </div>
                </div>

                {/* Right Form */}
                <div className="auth-card">
                    <h2 className="auth-card-title">Student Registration</h2>
                    <p className="auth-card-subtitle">Fill in your details to create an account</p>

                    {/* Step indicators */}
                    <div className="step-indicators">
                        {steps.map(s => {
                            const Icon = s.icon;
                            return (
                                <div key={s.num} className={`step-dot ${step === s.num ? 'active' : ''} ${step > s.num ? 'done' : ''}`}>
                                    <div className="step-dot-circle">
                                        {step > s.num ? <CheckCircle2 size={16} /> : <Icon size={14} />}
                                    </div>
                                    <span className="step-dot-label">{s.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait" custom={step}>
                            {step === 1 && (
                                <motion.div key="s1" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                    <div className="form-group">
                                        <label className="form-label">Full Name *</label>
                                        <div className="auth-input-wrap"><User size={18} className="auth-input-icon" />
                                            <input className="form-input auth-input" placeholder="Your full name" value={form.name} onChange={e => updateField('name', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address *</label>
                                        <div className="auth-input-wrap"><Mail size={18} className="auth-input-icon" />
                                            <input type="email" className="form-input auth-input" placeholder="you@email.com" value={form.email} onChange={e => updateField('email', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number *</label>
                                        <div className="auth-input-wrap"><Phone size={18} className="auth-input-icon" />
                                            <input className="form-input auth-input" placeholder="+91 XXXXXXXXXX" value={form.phone} onChange={e => updateField('phone', e.target.value)} />
                                        </div>
                                    </div>
                                    <button type="button" className="btn btn-primary auth-btn" onClick={nextStep}>
                                        Continue <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}
                            {step === 2 && (
                                <motion.div key="s2" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                    <div className="form-group">
                                        <label className="form-label">Student ID *</label>
                                        <div className="auth-input-wrap"><GraduationCap size={18} className="auth-input-icon" />
                                            <input className="form-input auth-input" placeholder="e.g. STU2024001" value={form.studentId} onChange={e => updateField('studentId', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Department *</label>
                                        <div className="auth-input-wrap"><BookOpen size={18} className="auth-input-icon" />
                                            <select className="form-input auth-input form-select" value={form.department} onChange={e => updateField('department', e.target.value)}>
                                                <option value="">Select Department</option>
                                                <option>Computer Science</option>
                                                <option>Electrical Engineering</option>
                                                <option>Mechanical Engineering</option>
                                                <option>Civil Engineering</option>
                                                <option>Electronics</option>
                                                <option>Information Technology</option>
                                                <option>Business Administration</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Year *</label>
                                        <div className="auth-input-wrap"><Calendar size={18} className="auth-input-icon" />
                                            <select className="form-input auth-input form-select" value={form.year} onChange={e => updateField('year', e.target.value)}>
                                                <option value="">Select Year</option>
                                                <option>1</option>
                                                <option>2</option>
                                                <option>3</option>
                                                <option>4</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row-btns">
                                        <button type="button" className="btn btn-secondary auth-btn" onClick={prevStep}>
                                            <ArrowLeft size={18} /> Back
                                        </button>
                                        <button type="button" className="btn btn-primary auth-btn" onClick={nextStep}>
                                            Continue <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                            {step === 3 && (
                                <motion.div key="s3" custom={1} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
                                    <div className="form-group">
                                        <label className="form-label">Password *</label>
                                        <div className="auth-input-wrap"><Lock size={18} className="auth-input-icon" />
                                            <input type={showPassword ? 'text' : 'password'} className="form-input auth-input" placeholder="Min 6 characters" value={form.password} onChange={e => updateField('password', e.target.value)} />
                                            <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Parent/Guardian Name</label>
                                        <div className="auth-input-wrap"><Users size={18} className="auth-input-icon" />
                                            <input className="form-input auth-input" placeholder="Optional" value={form.parentName} onChange={e => updateField('parentName', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Address</label>
                                        <div className="auth-input-wrap"><MapPin size={18} className="auth-input-icon" />
                                            <input className="form-input auth-input" placeholder="Optional" value={form.address} onChange={e => updateField('address', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="form-row-btns">
                                        <button type="button" className="btn btn-secondary auth-btn" onClick={prevStep}>
                                            <ArrowLeft size={18} /> Back
                                        </button>
                                        <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                                            {loading ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                                                    Creating account...
                                                </span>
                                            ) : (<>Create Account <CheckCircle2 size={18} /></>)}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    <div className="auth-footer">
                        Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
