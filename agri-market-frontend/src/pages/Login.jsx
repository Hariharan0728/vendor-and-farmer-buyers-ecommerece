import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/signin', { email, password });
      login(res.data);
      toast.success('Welcome back!');
      navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight: '80vh'}}>
      <div className="auth-card bg-white p-5 w-100" style={{maxWidth: '450px'}}>
        <div className="text-center mb-5">
          <h2 className="fw-bold" style={{color: 'var(--primary-color)', letterSpacing: '-1px'}}>Welcome Back</h2>
          <p className="text-muted">Sign in to continue to AgriMarket</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control premium-form-control" 
              placeholder="name@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-5">
            <label className="form-label d-flex justify-content-between">
              Password
              <a href="#" className="text-decoration-none" style={{color: 'var(--secondary-color)', fontSize: '0.9rem'}}>Forgot?</a>
            </label>
            <input 
              type="password" 
              className="form-control premium-form-control" 
              placeholder="Enter your password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn-premium w-100 py-3 mb-4">Sign In to Dashboard</button>
        </form>
        
        <div className="text-center text-muted">
          New to AgriMarket? <Link to="/signup" className="text-decoration-none fw-bold" style={{color: 'var(--primary-color)'}}>Create an account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
