import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const REFRESH_INTERVAL = 10000; // 10 seconds

function FarmerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newProductIds, setNewProductIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const prevProductIds = useRef(new Set());
  const refreshTimer = useRef(null);

  const fetchAll = useCallback(async (silent = false) => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/public/products'),
        api.get('/public/categories'),
      ]);

      const incoming = prodRes.data;
      const incomingIds = new Set(incoming.map(p => p.id));

      // Detect new products added by vendors
      if (prevProductIds.current.size > 0) {
        const added = [...incomingIds].filter(id => !prevProductIds.current.has(id));
        if (added.length > 0) {
          setNewProductIds(prev => new Set([...prev, ...added]));
          toast(`🌱 ${added.length} new product${added.length > 1 ? 's' : ''} added by a vendor!`, {
            icon: '🆕',
            style: { background: '#0f3e25', color: '#fff', fontFamily: 'Outfit, sans-serif', borderRadius: '12px' }
          });
        }
      }

      prevProductIds.current = incomingIds;
      setProducts(incoming);
      setCategories(catRes.data);
      setLastRefresh(new Date());
    } catch (err) {
      if (!silent) toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/orders/user/${user.id}`);
      setOrders(res.data.slice(0, 5)); // latest 5
    } catch {}
  }, [user]);

  const fetchCart = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/cart/${user.id}`);
      setCart(res.data);
    } catch {}
  }, [user]);

  useEffect(() => {
    fetchAll(false);
    fetchOrders();
    fetchCart();

    // Auto-refresh products every 10 seconds
    refreshTimer.current = setInterval(() => {
      fetchAll(true);
    }, REFRESH_INTERVAL);

    return () => clearInterval(refreshTimer.current);
  }, [fetchAll, fetchOrders, fetchCart]);

  const addToCart = async (productId) => {
    try {
      const res = await api.post(`/cart/${user.id}/add`, { productId, quantity: 1 });
      setCart(res.data);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const dismissNew = (id) => {
    setNewProductIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const categoryName = (id) => categories.find(c => c.id === id)?.name || '';

  const statusColor = (s) => ({ PLACED: '#f59e0b', CONFIRMED: '#3b82f6', PACKED: '#8b5cf6', SHIPPED: '#06b6d4', DELIVERED: '#10b981', CANCELLED: '#ef4444' }[s] || '#6b7280');

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="text-center">
        <div className="spinner-border mb-3" style={{ color: 'var(--primary-color)', width: '3rem', height: '3rem' }}></div>
        <p className="text-muted fw-medium">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="py-4">
      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-5">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: 'var(--primary-color)', fontSize: '2rem', letterSpacing: '-1px' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
            Your marketplace is live-updating every 10 seconds.{' '}
            <span className="text-success fw-medium">
              Last refreshed: {lastRefresh.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div className="d-flex gap-3">
          {/* Stats */}
          {[
            { label: 'Products', value: products.length, icon: '🌾' },
            { label: 'Cart Items', value: cart?.items?.length || 0, icon: '🛒' },
            { label: 'My Orders', value: orders.length, icon: '📦' },
          ].map(s => (
            <div key={s.label} className="premium-card px-4 py-3 text-center" style={{ minWidth: '90px' }}>
              <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
              <div className="fw-bold fs-4" style={{ color: 'var(--primary-color)', lineHeight: 1 }}>{s.value}</div>
              <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="row g-4">
        {/* ── LEFT: Product Marketplace ── */}
        <div className="col-lg-8">
          {/* Search & Filters */}
          <div className="premium-card p-3 mb-4">
            <div className="row g-2 align-items-center">
              <div className="col">
                <input
                  type="text"
                  className="form-control premium-form-control"
                  placeholder="🔍  Search products, brands..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: '#f6f9f6' }}
                />
              </div>
              <div className="col-auto">
                <button
                  className="btn btn-sm rounded-pill fw-semibold"
                  style={{ background: '#e8f5e9', color: 'var(--primary-color)', padding: '8px 16px' }}
                  onClick={() => fetchAll(false)}
                >
                  ↻ Refresh
                </button>
              </div>
            </div>
            {/* Category Tabs */}
            <div className="d-flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className="rounded-pill px-4 py-2 fw-semibold border-0"
                style={{
                  fontSize: '0.85rem',
                  background: selectedCategory === 'ALL' ? 'var(--primary-color)' : '#f0f4f1',
                  color: selectedCategory === 'ALL' ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >All Products</button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="rounded-pill px-4 py-2 fw-semibold border-0"
                  style={{
                    fontSize: '0.85rem',
                    background: selectedCategory === cat.id ? 'var(--primary-color)' : '#f0f4f1',
                    color: selectedCategory === cat.id ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.2s'
                  }}
                >{cat.name}</button>
              ))}
            </div>
          </div>

          {/* Live update pulse indicator */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%', background: '#2ea854',
              animation: 'pulse 2s infinite', boxShadow: '0 0 0 0 rgba(46,168,84,0.4)'
            }}></div>
            <span className="text-muted" style={{ fontSize: '0.82rem' }}>
              Live — {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} shown
            </span>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: '3rem' }}>🔍</div>
              <h5 className="fw-normal mt-3">No products found.</h5>
            </div>
          ) : (
            <div className="row g-3">
              {filteredProducts.map(product => {
                const isNew = newProductIds.has(product.id);
                return (
                  <div key={product.id} className="col-md-6">
                    <div
                      className="premium-card h-100"
                      style={{
                        border: isNew ? '2px solid var(--secondary-color)' : '2px solid transparent',
                        transition: 'border 0.3s ease'
                      }}
                    >
                      <div style={{ position: 'relative', overflow: 'hidden', height: '180px' }}>
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                          />
                        ) : (
                          <div style={{ height: '100%', background: '#f4f7f4' }} className="d-flex align-items-center justify-content-center text-muted">
                            <span style={{ fontSize: '2.5rem' }}>🌾</span>
                          </div>
                        )}
                        <span
                          className="badge position-absolute top-0 start-0 m-2 rounded-pill px-3"
                          style={{ background: 'rgba(15,62,37,0.85)', backdropFilter: 'blur(4px)', fontSize: '0.72rem' }}
                        >
                          {categoryName(product.categoryId)}
                        </span>
                        {isNew && (
                          <span
                            className="badge position-absolute top-0 end-0 m-2 rounded-pill px-3"
                            style={{ background: 'var(--secondary-color)', fontSize: '0.72rem', animation: 'pulse 1.5s infinite' }}
                            onClick={() => dismissNew(product.id)}
                          >
                            🆕 NEW
                          </span>
                        )}
                      </div>
                      <div className="p-3 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h6 className="fw-bold mb-0" style={{ color: 'var(--primary-color)', fontSize: '0.95rem' }}>{product.name}</h6>
                          <span className="text-muted ms-2" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{product.brand}</span>
                        </div>
                        <p className="text-muted mb-3" style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                          {product.description?.slice(0, 70)}{product.description?.length > 70 ? '...' : ''}
                        </p>
                        {product.applicableCrops?.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mb-3">
                            {product.applicableCrops.slice(0, 3).map(crop => (
                              <span key={crop} className="badge rounded-pill"
                                style={{ background: '#e8f5e9', color: 'var(--primary-color)', fontSize: '0.7rem', fontWeight: '600' }}>
                                {crop}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                          <div>
                            <div className="fw-bold" style={{ color: 'var(--secondary-color)', fontSize: '1.2rem' }}>₹{product.price}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>per {product.unit}</div>
                          </div>
                          <button
                            className="btn-premium py-2 px-3"
                            style={{ fontSize: '0.82rem', borderRadius: '50px' }}
                            onClick={() => addToCart(product.id)}
                          >
                            + Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="col-lg-4">
          {/* Cart Summary */}
          {cart?.items?.length > 0 && (
            <div className="premium-card p-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0" style={{ color: 'var(--primary-color)' }}>🛒 Cart Summary</h6>
                <Link to="/cart" style={{ fontSize: '0.82rem', color: 'var(--secondary-color)', textDecoration: 'none', fontWeight: '600' }}>View All →</Link>
              </div>
              {cart.items.slice(0, 3).map(item => (
                <div key={item.productId} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div>
                    <div className="fw-semibold" style={{ fontSize: '0.85rem', color: '#1a251e' }}>{item.productName}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>Qty: {item.quantity}</div>
                  </div>
                  <div className="fw-bold" style={{ color: 'var(--secondary-color)', fontSize: '0.9rem' }}>
                    ₹{(item.unitPrice * item.quantity).toFixed(0)}
                  </div>
                </div>
              ))}
              {cart.items.length > 3 && (
                <div className="text-muted text-center mt-2" style={{ fontSize: '0.8rem' }}>
                  +{cart.items.length - 3} more items
                </div>
              )}
              <div className="d-flex justify-content-between fw-bold mt-3 pt-2 border-top">
                <span>Total</span>
                <span style={{ color: 'var(--primary-color)' }}>₹{cart.totalAmount?.toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="btn-premium w-100 py-2 mt-3 text-center d-block" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                Checkout →
              </Link>
            </div>
          )}

          {/* Recent Orders */}
          <div className="premium-card p-4">
            <h6 className="fw-bold mb-3" style={{ color: 'var(--primary-color)' }}>📦 Recent Orders</h6>
            {orders.length === 0 ? (
              <div className="text-center py-3 text-muted" style={{ fontSize: '0.88rem' }}>
                No orders yet. Start shopping!
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div>
                    <div className="fw-semibold" style={{ fontSize: '0.85rem', color: '#1a251e' }}>
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      ₹{order.totalAmount?.toFixed(0)} · {order.paymentMode}
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-end gap-1">
                    <span className="badge rounded-pill px-3" style={{ background: statusColor(order.orderStatus), fontSize: '0.7rem' }}>
                      {order.orderStatus}
                    </span>
                    <Link to={`/orders/${order.id}`} style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', textDecoration: 'none', fontWeight: '600' }}>
                      Track →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 rgba(46,168,84,0.5); }
          70%  { box-shadow: 0 0 0 8px rgba(46,168,84,0); }
          100% { box-shadow: 0 0 0 0 rgba(46,168,84,0); }
        }
      `}</style>
    </div>
  );
}

export default FarmerDashboard;
