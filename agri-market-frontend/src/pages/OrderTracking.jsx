import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];

function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{minHeight:'60vh'}}><div className="spinner-border" style={{color:'var(--primary-color)'}}></div></div>;
  if (!order) return <div className="text-center py-5 text-muted"><h4>Order not found.</h4></div>;

  const currentStep = STATUSES.indexOf(order.orderStatus);

  return (
    <div className="py-4">
      <h2 className="fw-bold mb-2" style={{color:'var(--primary-color)', fontSize:'2rem', letterSpacing:'-1px'}}>Track Order</h2>
      <p className="text-muted mb-5">Order ID: <code>{order.id}</code></p>

      <div className="row g-4">
        <div className="col-lg-8">
          {/* Status Tracker */}
          <div className="premium-card p-4 mb-4">
            <h5 className="fw-bold mb-4" style={{color:'var(--primary-color)'}}>Shipment Status</h5>
            <div className="d-flex align-items-start">
              {STATUSES.map((step, idx) => (
                <div key={step} className="d-flex align-items-center flex-grow-1">
                  <div className="d-flex flex-column align-items-center">
                    <div
                      style={{
                        width:'42px', height:'42px', borderRadius:'50%',
                        background: idx <= currentStep ? 'var(--secondary-color)' : '#e9ecef',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color: idx <= currentStep ? 'white' : '#adb5bd',
                        fontWeight:'700', fontSize:'0.9rem',
                        transition:'all 0.4s ease', boxShadow: idx <= currentStep ? '0 4px 12px rgba(46,168,84,0.3)' : 'none'
                      }}>
                      {idx < currentStep ? '✓' : idx + 1}
                    </div>
                    <span className="mt-2 text-center" style={{fontSize:'0.7rem', fontWeight:'600', color: idx <= currentStep ? 'var(--secondary-color)' : '#adb5bd', whiteSpace:'nowrap'}}>{step}</span>
                  </div>
                  {idx < STATUSES.length - 1 && (
                    <div style={{flex:1, height:'3px', background: idx < currentStep ? 'var(--secondary-color)' : '#e9ecef', margin:'0 4px 20px'}}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="premium-card p-4">
            <h5 className="fw-bold mb-4" style={{color:'var(--primary-color)'}}>Items Ordered</h5>
            {order.items?.map((item, i) => (
              <div key={i} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <div>
                  <div className="fw-semibold">{item.productName}</div>
                  <div className="text-muted" style={{fontSize:'0.9rem'}}>Qty: {item.quantity}</div>
                </div>
                <div className="fw-bold" style={{color:'var(--primary-color)'}}>₹{(item.unitPrice * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            <div className="d-flex justify-content-between fw-bold fs-5 mt-3">
              <span>Total Paid</span>
              <span style={{color:'var(--secondary-color)'}}>₹{order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="premium-card p-4 mb-4">
            <h6 className="fw-bold mb-3" style={{color:'var(--primary-color)'}}>Delivery Address</h6>
            {order.shippingAddress ? (
              <address className="text-muted mb-0" style={{lineHeight:'1.8'}}>
                {order.shippingAddress.street}<br/>
                {order.shippingAddress.city}, {order.shippingAddress.state}<br/>
                PIN: {order.shippingAddress.zipCode}
              </address>
            ) : <span className="text-muted">N/A</span>}
          </div>
          <div className="premium-card p-4">
            <h6 className="fw-bold mb-3" style={{color:'var(--primary-color)'}}>Payment</h6>
            <div className="d-flex justify-content-between text-muted mb-1">
              <span>Mode</span><span className="fw-semibold text-dark">{order.paymentMode}</span>
            </div>
            <div className="d-flex justify-content-between text-muted">
              <span>Status</span>
              <span className={`badge rounded-pill ${order.paymentStatus === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>{order.paymentStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderTracking;
