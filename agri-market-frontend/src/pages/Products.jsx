import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/public/products');
        setProducts(res.data);
      } catch (err) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = async (productId) => {
    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }
    try {
      await api.post(`/cart/${user.id}/add`, { productId, quantity: 1 });
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/vendor/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
  const isVendor = user?.role === 'ROLE_VENDOR' || user?.role === 'VENDOR';

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{minHeight: '50vh'}}>
        <div className="spinner-border" style={{color: 'var(--primary-color)'}} role="status"></div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <h2 className="fw-bold" style={{color: 'var(--primary-color)', fontSize: '2.5rem', letterSpacing: '-1px'}}>Marketplace</h2>
          <p className="text-muted mb-0">Discover premium seeds, fertilizers, and equipment.</p>
        </div>
      </div>

      <div className="row g-4">
        {products.length === 0 ? (
          <div className="col-12 text-center text-muted py-5">
            <h4 className="fw-normal">No products available at the moment.</h4>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="col-lg-4 col-md-6">
              <div className="premium-card h-100 d-flex flex-column">
                <div style={{position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(0,0,0,0.05)'}}>
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} className="card-img-top" alt={product.name} />
                  ) : (
                    <div className="card-img-top d-flex justify-content-center align-items-center bg-light" style={{color: '#adb5bd'}}>
                      <span className="fs-5 fw-medium">No Image</span>
                    </div>
                  )}
                  <span className="badge bg-white text-dark shadow-sm position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill fw-semibold">
                    {product.brand}
                  </span>
                </div>
                
                <div className="card-body d-flex flex-column flex-grow-1">
                  <h5 className="card-title text-truncate">{product.name}</h5>
                  <p className="card-text text-muted flex-grow-1" style={{fontSize: '0.95rem', lineHeight: '1.6'}}>
                    {product.description}
                  </p>
                  
                  <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted" style={{fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600'}}>Price</div>
                      <div className="price-tag">₹{product.price}</div>
                    </div>
                    <div className="text-end">
                      <div className="text-muted mb-1" style={{fontSize: '0.8rem'}}>Per {product.unit}</div>
                      <div className="d-flex justify-content-end gap-2">
                        {(isAdmin || isVendor) && (
                          <button className="btn btn-outline-danger py-2 px-3 shadow-sm" onClick={() => handleDelete(product.id)}>
                            Delete
                          </button>
                        )}
                        <button className="btn-premium py-2 px-4 shadow-sm" onClick={() => addToCart(product.id)}>
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Products;
