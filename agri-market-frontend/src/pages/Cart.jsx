import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await api.get(`/cart/${user.id}`);
      setCart(res.data);
    } catch (err) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (productId, qty) => {
    if (qty < 1) return;
    try {
      const res = await api.put(`/cart/${user.id}/update`, { productId, quantity: qty });
      setCart(res.data);
    } catch (err) { toast.error('Update failed'); }
  };

  const removeItem = async (productId) => {
    try {
      const res = await api.delete(`/cart/${user.id}/remove/${productId}`);
      setCart(res.data);
      toast.success('Item removed');
    } catch (err) { toast.error('Remove failed'); }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{minHeight:'60vh'}}><div className="spinner-border" style={{color:'var(--primary-color)'}}></div></div>;

  const items = cart?.items || [];

  return (
    <div className="py-4">
      <h2 className="fw-bold mb-5" style={{color:'var(--primary-color)', fontSize:'2rem', letterSpacing:'-1px'}}>Your Cart</h2>

      {items.length === 0 ? (
        <div className="text-center py-5">
          <h4 className="fw-normal text-muted">Your cart is empty.</h4>
          <Link to="/products" className="btn-premium mt-4 d-inline-block">Browse Products</Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="premium-card p-4">
              {items.map((item, idx) => (
                <div key={item.productId}>
                  <div className="d-flex align-items-center py-3 gap-4">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.productName} style={{width:'90px',height:'90px',objectFit:'cover',borderRadius:'14px'}} />
                      : <div style={{width:'90px',height:'90px',background:'#f0f0f0',borderRadius:'14px'}} className="d-flex align-items-center justify-content-center text-muted">N/A</div>
                    }
                    <div className="flex-grow-1">
                      <h5 className="fw-bold mb-1" style={{color:'var(--primary-color)'}}>{item.productName}</h5>
                      <div className="text-muted" style={{fontSize:'0.9rem'}}>₹{item.unitPrice} each</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-sm btn-outline-secondary rounded-circle" style={{width:'32px',height:'32px'}} onClick={() => updateQty(item.productId, item.quantity - 1)}>−</button>
                      <span className="fw-bold px-2">{item.quantity}</span>
                      <button className="btn btn-sm btn-outline-secondary rounded-circle" style={{width:'32px',height:'32px'}} onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                    </div>
                    <div className="fw-bold fs-5 ms-3" style={{color:'var(--secondary-color)', minWidth:'90px', textAlign:'right'}}>₹{(item.unitPrice * item.quantity).toFixed(2)}</div>
                    <button className="btn btn-sm text-danger" onClick={() => removeItem(item.productId)}>✕</button>
                  </div>
                  {idx < items.length - 1 && <hr className="my-0" />}
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="premium-card p-4 position-sticky" style={{top:'100px'}}>
              <h5 className="fw-bold mb-4" style={{color:'var(--primary-color)'}}>Order Summary</h5>
              <div className="d-flex justify-content-between mb-2 text-muted">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{cart.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 text-muted">
                <span>Delivery</span>
                <span className="text-success fw-semibold">Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                <span>Total</span>
                <span style={{color:'var(--primary-color)'}}>₹{cart.totalAmount?.toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="btn-premium w-100 py-3 text-center d-block" style={{textDecoration:'none'}}>
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
