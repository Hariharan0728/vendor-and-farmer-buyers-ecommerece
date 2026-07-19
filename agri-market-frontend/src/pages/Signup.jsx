import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'FARMER'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // --- Attempt Registration ---
      await api.post('/auth/signup', formData);
      toast.success('Account created! Logging you in...');

      // Auto-login after successful registration
      await autoLogin(formData.email, formData.password);

    } catch (err) {
      const message = err.response?.data?.message || '';

      if (message.includes('already in use') || message.includes('already exist')) {
        // --- Email already registered → auto-login instead ---
        toast('Account already exists. Logging you in...', {
          icon: '🔑',
          style: { background: '#0f3e25', color: '#fff', fontFamily: 'Outfit, sans-serif', borderRadius: '12px' }
        });
        await autoLogin(formData.email, formData.password);
      } else {
        toast.error(message || 'Registration failed. Please try again.');
        setLoading(false);
      }
    }
  };

  const autoLogin = async (email, password) => {
    try {
      const res = await api.post('/auth/signin', { email, password });
      login(res.data);
      toast.success(`Welcome back, ${res.data.name}! 👋`);

      // Route based on role
      const role = res.data.role;
      if (role?.includes('FARMER')) navigate('/farmer/dashboard');
      else if (role?.includes('VENDOR')) navigate('/vendor/dashboard');
      else navigate('/products');
    } catch (loginErr) {
      // Account exists but password is wrong
      toast.error('An account with this email already exists. Please login with your correct password.');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="auth-card bg-white p-5 w-100" style={{ maxWidth: '560px' }}>
        <div className="text-center mb-5">
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌾</div>
          <h2 className="fw-bold" style={{ color: 'var(--primary-color)', letterSpacing: '-1px' }}>
            Join AgriMarket
          </h2>
          <p className="text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-decoration-none fw-bold" style={{ color: 'var(--secondary-color)' }}>
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control premium-form-control"
                placeholder="Your full name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control premium-form-control"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control premium-form-control"
                placeholder="name@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control premium-form-control"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="col-12">
              <label className="form-label">I want to...</label>
              <div className="row g-2 mt-1">
                {[
                  { value: 'FARMER', icon: '👨‍🌾', label: 'Buy Products', sub: 'Farmer / Buyer' },
                  { value: 'VENDOR', icon: '🏪', label: 'Sell Products', sub: 'Vendor / Seller' }
                ].map(r => (
                  <div className="col-6" key={r.value}>
                    <div
                      onClick={() => setFormData({ ...formData, role: r.value })}
                      className="text-center p-3 rounded-3"
                      style={{
                        cursor: 'pointer',
                        border: formData.role === r.value ? '2px solid var(--secondary-color)' : '2px solid #e9ecef',
                        background: formData.role === r.value ? 'rgba(46,168,84,0.06)' : '#fafafa',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontSize: '1.8rem' }}>{r.icon}</div>
                      <div className="fw-bold mt-1" style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>{r.label}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{r.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-premium w-100 py-3 mt-4"
            disabled={loading}
            style={{ fontSize: '1rem' }}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2"></span>Please wait...</>
              : 'Create Account & Continue'}
          </button>
        </form>

        <p className="text-center text-muted mt-4" style={{ fontSize: '0.8rem' }}>
          If this email is already registered, you'll be automatically logged in.
        </p>
      </div>
    </div>
  );
}

export default Signup;
