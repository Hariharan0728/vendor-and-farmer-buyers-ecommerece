import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMode, setPaymentMode] = useState('COD');
  const [address, setAddress] = useState({ street: '', city: '', state: '', zipCode: '', type: 'HOME' });
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/cart/${user.id}`).then(r => { setCart(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const placeOrder = async () => {
    if (!address.street || !address.city || !address.state) { toast.error('Please fill in your delivery address'); return; }
    setPlacing(true);
    try {
      const order = await api.post(`/orders/place/${user.id}`, { paymentMode, shippingAddress: address });
      toast.success('Order placed successfully!');
      navigate(`/orders/${order.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{minHeight:'60vh'}}><div className="spinner-border" style={{color:'var(--primary-color)'}}></div></div>;

  return (
    <div className="py-4">
      <h2 className="fw-bold mb-5" style={{color:'var(--primary-color)', fontSize:'2rem', letterSpacing:'-1px'}}>Checkout</h2>
      <div className="row g-4">
        <div className="col-lg-7">
          {/* Delivery Address */}
          <div className="premium-card p-4 mb-4">
            <h5 className="fw-bold mb-4" style={{color:'var(--primary-color)'}}>Delivery Address</h5>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Street / Area</label>
                <input className="form-control premium-form-control" placeholder="123, Farm Road, Village Name" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label">City</label>
                <input className="form-control premium-form-control" placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
              </div>
              <div className="col-md-3">
                <label className="form-label">State</label>
                <input className="form-control premium-form-control" placeholder="State" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} />
              </div>
              <div className="col-md-3">
                <label className="form-label">PIN Code</label>
                <input className="form-control premium-form-control" placeholder="XXXXXX" value={address.zipCode} onChange={e => setAddress({...address, zipCode: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Payment Mode */}
          <div className="premium-card p-4">
            <h5 className="fw-bold mb-4" style={{color:'var(--primary-color)'}}>Payment Method</h5>
            <div className="row g-3">
              {[
                { mode: 'COD', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
                { mode: 'ONLINE', label: 'UPI / Card', icon: '💳', desc: 'Pay securely via Razorpay' },
                { mode: 'WALLET', label: 'AgriWallet', icon: '👜', desc: 'Use your pre-loaded balance' }
              ].map(p => (
                <div key={p.mode} className="col-md-4">
                  <div
                    onClick={() => setPaymentMode(p.mode)}
                    className={`p-3 rounded-3 border-2 text-center cursor-pointer ${paymentMode === p.mode ? 'border-success bg-success bg-opacity-10' : 'border-light bg-light'}`}
                    style={{cursor:'pointer', border: paymentMode === p.mode ? '2px solid var(--secondary-color)' : '2px solid transparent', transition:'all 0.2s'}}
                  >
                    <div style={{fontSize:'1.8rem'}}>{p.icon}</div>
                    <div className="fw-bold mt-1" style={{fontSize:'0.9rem', color:'var(--primary-color)'}}>{p.label}</div>
                    <div className="text-muted" style={{fontSize:'0.78rem'}}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="premium-card p-4 position-sticky" style={{top:'100px'}}>
            <h5 className="fw-bold mb-4" style={{color:'var(--primary-color)'}}>Order Summary</h5>
            {cart?.items?.map(item => (
              <div key={item.productId} className="d-flex justify-content-between mb-2 text-muted">
                <span className="text-truncate me-2">{item.productName} ×{item.quantity}</span>
                <span className="fw-semibold text-dark">₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
              <span>Total</span>
              <span style={{color:'var(--primary-color)'}}>₹{cart?.totalAmount?.toFixed(2) || '0.00'}</span>
            </div>
            <button className="btn-premium w-100 py-3" onClick={placeOrder} disabled={placing}>
              {placing ? 'Placing Order...' : `Place Order — ₹${cart?.totalAmount?.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
