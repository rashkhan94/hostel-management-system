import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Mail, Lock, Eye, EyeOff, BedDouble, UtensilsCrossed, CreditCard, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success(`Welcome back, ${user.name}!`);
            navigate(`/${user.role}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (demoEmail, demoPassword) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
    };

    const features = [
        { icon: BedDouble, label: 'Smart Room Management', desc: 'Automated allocation & tracking' },
        { icon: UtensilsCrossed, label: 'Meal Scheduling', desc: 'Weekly menus & dietary plans' },
        { icon: CreditCard, label: 'Fee Management', desc: 'Track payments & dues' },
        { icon: ShieldCheck, label: 'Complaint System', desc: 'Quick resolution & tracking' },
    ];

    return (
        <div className="auth-page">
            {/* Animated background */}
            <div className="auth-bg">
                <div className="auth-orb auth-orb-1"></div>
                <div className="auth-orb auth-orb-2"></div>
                <div className="auth-orb auth-orb-3"></div>
            </div>

            <motion.div
                className="auth-wrapper"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                {/* Left Hero Section */}
                <div className="auth-hero">
                    <div className="auth-hero-content">
                        <motion.div
                            className="auth-brand"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="auth-brand-icon">
                                <Building2 size={28} />
                            </div>
                            <h1>HostelHub</h1>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            Modern Hostel<br />
                            <span>Management System</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            Streamline your hostel operations with an all-in-one platform for rooms, meals, fees, and more.
                        </motion.p>

                        <motion.div
                            className="auth-features"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            {features.map((f, i) => {
                                const Icon = f.icon;
                                return (
                                    <motion.div
                                        key={i}
                                        className="auth-feature"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 + i * 0.1 }}
                                    >
                                        <div className="auth-feature-icon"><Icon size={18} /></div>
                                        <div>
                                            <div className="auth-feature-title">{f.label}</div>
                                            <div className="auth-feature-desc">{f.desc}</div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>

                    {/* Floating particles */}
                    <div className="auth-particles">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={`auth-particle auth-particle-${i + 1}`}></div>
                        ))}
                    </div>
                </div>

                {/* Right Login Card */}
                <motion.div
                    className="auth-card"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <h2 className="auth-card-title">Welcome Back</h2>
                    <p className="auth-card-subtitle">Sign in to your hostel account</p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <div className="auth-input-wrap">
                                <Mail size={18} className="auth-input-icon" />
                                <input
                                    type="email"
                                    className="form-input auth-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="auth-input-wrap">
                                <Lock size={18} className="auth-input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input auth-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="auth-divider"><span>Demo Credentials</span></div>

                    <div className="auth-demo-grid">
                        <button className="auth-demo-btn" onClick={() => fillDemo('admin@hostel.com', 'admin123')}>
                            <span className="auth-demo-emoji">👨‍💼</span>
                            <span className="auth-demo-role">Admin</span>
                        </button>
                        <button className="auth-demo-btn" onClick={() => fillDemo('warden@hostel.com', 'warden123')}>
                            <span className="auth-demo-emoji">🔑</span>
                            <span className="auth-demo-role">Warden</span>
                        </button>
                        <button className="auth-demo-btn" onClick={() => fillDemo('student1@hostel.com', 'student123')}>
                            <span className="auth-demo-emoji">🎓</span>
                            <span className="auth-demo-role">Student</span>
                        </button>
                    </div>

                    <div className="auth-footer">
                        New student? <Link to="/register" className="auth-link">Create an account</Link>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
