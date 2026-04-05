// ─── LoginPage.jsx ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields.'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🎉');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      attendee: { email: 'attendee@eventhub.in', password: 'Test@123' },
      organizer: { email: 'organizer@eventhub.in', password: 'Test@123' },
      admin: { email: 'admin@eventhub.in', password: 'Admin@123' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-card-hover p-8 w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 bg-saffron-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-display font-bold">EH</span>
          </div>
          <span className="font-display font-bold text-2xl text-gray-900">EventHub</span>
        </Link>

        <h1 className="font-display font-bold text-2xl text-gray-900 text-center mb-1">Welcome back!</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Sign in to continue to EventHub</p>

        {/* Demo buttons */}
        <div className="flex gap-2 mb-6">
          {['attendee', 'organizer', 'admin'].map(role => (
            <button key={role} onClick={() => fillDemo(role)}
              className="flex-1 text-xs py-1.5 px-2 border border-gray-200 rounded-lg hover:bg-saffron-50 hover:border-saffron-300 transition-all capitalize text-gray-600">
              {role}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mb-5">↑ Click to fill demo credentials</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com" className="input-field pl-10" />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••" className="input-field pl-10 pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2 flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-saffron-600 font-semibold hover:underline">Join free</Link>
        </p>
      </motion.div>
    </div>
  );
};

// ─── RegisterPage.jsx ──────────────────────────────────────────────────────────
export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultRole = new URLSearchParams(location.search).get('role') || 'attendee';
  const [form, setForm] = useState({ name: '', email: '', password: '', role: defaultRole });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill all fields.'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success(`Account created! Welcome to EventHub 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-card-hover p-8 w-full max-w-md"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 bg-saffron-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-display font-bold">EH</span>
          </div>
          <span className="font-display font-bold text-2xl text-gray-900">EventHub</span>
        </Link>

        <h1 className="font-display font-bold text-2xl text-gray-900 text-center mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Join thousands of event lovers</p>

        {/* Role selector */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl mb-6">
          {['attendee', 'organizer'].map(role => (
            <button
              key={role}
              type="button"
              onClick={() => setForm(p => ({ ...p, role }))}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
                form.role === role ? 'bg-white shadow text-saffron-600' : 'text-gray-500'
              }`}
            >
              {role === 'attendee' ? '🎟 Attendee' : '🎪 Organizer'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Rahul Sharma" className="input-field" />
          </div>
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="rahul@example.com" className="input-field pl-10" />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Min. 6 characters" className="input-field pl-10 pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            By signing up, you agree to our <span className="text-saffron-500 cursor-pointer">Terms of Service</span>
          </p>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : `Create ${form.role === 'organizer' ? 'Organizer' : ''} Account`}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-saffron-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

