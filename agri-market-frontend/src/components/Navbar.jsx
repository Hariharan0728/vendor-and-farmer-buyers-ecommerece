import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isVendor  = user?.role === 'ROLE_VENDOR'  || user?.role === 'VENDOR';
  const isFarmer  = user?.role === 'ROLE_FARMER'  || user?.role === 'FARMER';
  const isAdmin   = user?.role === 'ROLE_ADMIN'   || user?.role === 'ADMIN';

  return (
    <nav className="navbar navbar-expand-lg glass-nav">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4" to="/" style={{ letterSpacing: '-0.5px' }}>
          <span style={{ color: '#2ea854' }}>Agri</span><span style={{ color: '#0f3e25' }}>Market</span>
        </Link>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto gap-1">
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/products">Marketplace</Link>
            </li>

            {isFarmer && (
              <li className="nav-item">
                <Link
                  className="nav-link fw-semibold"
                  style={{ color: 'var(--secondary-color)' }}
                  to="/farmer/dashboard"
                >
                  🌾 My Dashboard
                </Link>
              </li>
            )}

            {isVendor && (
              <li className="nav-item">
                <Link
                  className="nav-link fw-semibold"
                  style={{ color: 'var(--secondary-color)' }}
                  to="/vendor/dashboard"
                >
                  📦 Vendor Dashboard
                </Link>
              </li>
            )}
          </ul>

          <ul className="navbar-nav align-items-center gap-2">
            {user ? (
              <>
                {/* Cart — farmers only */}
                {isFarmer && (
                  <li className="nav-item">
                    <Link
                      to="/cart"
                      className="btn btn-light border rounded-pill px-3 py-2 fw-semibold"
                      style={{ fontSize: '0.88rem' }}
                    >
                      🛒 Cart
                    </Link>
                  </li>
                )}

                {/* User avatar */}
                <li className="nav-item">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2ea854, #0f3e25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '800', fontSize: '1rem', flexShrink: 0
                    }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="d-none d-lg-block">
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1a251e', lineHeight: 1 }}>{user.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#5c6b61' }}>
                        {user.role?.replace('ROLE_', '')}
                      </div>
                    </div>
                  </div>
                </li>

                <li className="nav-item">
                  <button
                    className="btn-premium-outline py-2 px-3"
                    style={{ fontSize: '0.82rem', borderRadius: '50px' }}
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold" style={{ color: '#1a251e' }} to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn-premium py-2 px-4" style={{ textDecoration: 'none' }} to="/signup">
                    Get Started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
