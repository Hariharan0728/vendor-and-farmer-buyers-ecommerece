import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function VendorDashboard() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('add');
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    categoryId: '',
    unit: '50 kg bag',
    price: '',
    stockQuantity: '',
    applicableCrops: '',
    registrationNumber: '',
  });

  useEffect(() => {
    api.get('/public/categories').then(r => setCategories(r.data)).catch(() => {});
    fetchMyProducts();
  }, []);

  const fetchMyProducts = () => {
    if (user?.id) {
      api.get(`/vendor/products/my?vendorId=${user.id}`)
        .then(r => setMyProducts(r.data))
        .catch(() => {});
    }
  };

  // Convert uploaded image file to base64
  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageBase64(reader.result); // base64 string, stored directly
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => handleImageFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageFile(e.dataTransfer.files[0]);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageBase64) {
      toast.error('Please upload a product image before listing.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        categoryId: formData.categoryId,
        unit: formData.unit,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        applicableCrops: formData.applicableCrops.split(',').map(s => s.trim()).filter(Boolean),
        registrationNumber: formData.registrationNumber || null,
        vendorId: user?.id,
        images: [imageBase64],
        status: 'ACTIVE',
      };

      await api.post('/vendor/products', payload);
      toast.success('✅ Product listed successfully!');
      fetchMyProducts();

      // Reset form
      setFormData({ name: '', description: '', brand: '', categoryId: '', unit: '50 kg bag', price: '', stockQuantity: '', applicableCrops: '', registrationNumber: '' });
      clearImage();
      setActiveTab('products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/vendor/products/${id}`);
      setMyProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const categoryName = (id) => categories.find(c => c.id === id)?.name || '';

  return (
    <div className="py-4">
      {/* Header */}
      <div className="mb-5 d-flex justify-content-between align-items-end flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: 'var(--primary-color)', fontSize: '2rem', letterSpacing: '-1px' }}>
            Vendor Dashboard
          </h2>
          <p className="text-muted mb-0">
            Welcome back, <strong>{user?.name}</strong>. Manage your product listings below.
          </p>
        </div>
        <div className="d-flex gap-2">
          <div className="premium-card px-4 py-3 text-center">
            <div className="fw-bold fs-4" style={{ color: 'var(--primary-color)' }}>{myProducts.length}</div>
            <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Listings</div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="d-flex gap-2 mb-4">
        {[{ key: 'add', label: '+ Add New Product' }, { key: 'products', label: `My Products (${myProducts.length})` }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={activeTab === t.key ? 'btn-premium py-2 px-4' : 'btn-premium-outline py-2 px-4'}
            style={{ fontSize: '0.9rem', borderRadius: '50px' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── ADD PRODUCT ─── */}
      {activeTab === 'add' && (
        <div className="row g-4">
          {/* Form */}
          <div className="col-lg-7">
            <div className="premium-card p-4 p-lg-5">
              <h5 className="fw-bold mb-4" style={{ color: 'var(--primary-color)' }}>Product Details</h5>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">

                  <div className="col-12">
                    <label className="form-label">Product Name *</label>
                    <input type="text" className="form-control premium-form-control"
                      placeholder="e.g. Premium Wheat Seeds HD-2967"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Category *</label>
                    <select className="form-select premium-form-control"
                      value={formData.categoryId}
                      onChange={e => setFormData({ ...formData, categoryId: e.target.value })} required>
                      <option value="">Select category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Brand / Manufacturer *</label>
                    <input type="text" className="form-control premium-form-control"
                      placeholder="e.g. AgriGenetics Pvt. Ltd."
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })} required />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description *</label>
                    <textarea className="form-control premium-form-control" rows="3"
                      placeholder="Describe the product — variety, usage, benefits, soil type..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Unit *</label>
                    <select className="form-select premium-form-control"
                      value={formData.unit}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                      <option value="50 kg bag">50 kg bag</option>
                      <option value="25 kg bag">25 kg bag</option>
                      <option value="10 kg packet">10 kg packet</option>
                      <option value="1 kg packet">1 kg packet</option>
                      <option value="1 Litre bottle">1 Litre bottle</option>
                      <option value="500 gm packet">500 gm packet</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Price (₹) *</label>
                    <input type="number" min="1" step="0.01" className="form-control premium-form-control"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Stock Quantity *</label>
                    <input type="number" min="1" className="form-control premium-form-control"
                      placeholder="e.g. 500"
                      value={formData.stockQuantity}
                      onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })} required />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Applicable Crops <span className="text-muted fw-normal">(comma-separated)</span></label>
                    <input type="text" className="form-control premium-form-control"
                      placeholder="Wheat, Rice, Cotton, Maize, Soybean"
                      value={formData.applicableCrops}
                      onChange={e => setFormData({ ...formData, applicableCrops: e.target.value })} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Regulatory Reg. No. <span className="text-muted fw-normal">(pesticides only — optional)</span></label>
                    <input type="text" className="form-control premium-form-control"
                      placeholder="CIB-XXXX-YYYY"
                      value={formData.registrationNumber}
                      onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })} />
                  </div>

                  <div className="col-12 mt-2">
                    <button type="submit" className="btn-premium w-100 py-3" disabled={submitting}>
                      {submitting
                        ? <span><span className="spinner-border spinner-border-sm me-2"></span>Listing...</span>
                        : '🌿 Publish to Marketplace'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Image Upload Panel */}
          <div className="col-lg-5">
            <div className="premium-card p-4 p-lg-5 h-100 d-flex flex-column">
              <h5 className="fw-bold mb-2" style={{ color: 'var(--primary-color)' }}>Product Image *</h5>
              <p className="text-muted mb-4" style={{ fontSize: '0.88rem' }}>
                Upload a clear photo of your product — bag, bottle, or the actual crop/seed. JPG, PNG, WEBP up to 5 MB.
              </p>

              {/* Drop Zone */}
              {!imagePreview ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    flex: 1, minHeight: '260px', border: `2px dashed ${dragOver ? 'var(--secondary-color)' : '#c8e6c9'}`,
                    borderRadius: '18px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '30px',
                    background: dragOver ? 'rgba(46,168,84,0.05)' : '#f9fcf9',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📷</div>
                  <div className="fw-bold" style={{ color: 'var(--primary-color)', fontSize: '1rem' }}>
                    Click to upload or drag & drop
                  </div>
                  <div className="text-muted mt-1" style={{ fontSize: '0.85rem' }}>
                    Supported: JPG, PNG, WEBP (max 5MB)
                  </div>
                  <div className="mt-3 px-4 py-2 rounded-pill fw-semibold" style={{ background: 'var(--primary-color)', color: 'white', fontSize: '0.85rem' }}>
                    Browse Files
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative', flex: 1, minHeight: '260px' }}>
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    style={{ width: '100%', height: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: '16px' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                    <button type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ background: 'white', border: 'none', borderRadius: '50px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                      Change
                    </button>
                    <button type="button" onClick={clearImage}
                      style={{ background: '#ff4444', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: '700' }}>
                      ✕
                    </button>
                  </div>
                  <div className="mt-3 p-3 rounded-3" style={{ background: 'rgba(46,168,84,0.08)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600' }}>
                      ✅ Image ready — this will appear on the product listing
                    </span>
                  </div>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInput} />
            </div>
          </div>
        </div>
      )}

      {/* ─── MY PRODUCTS ─── */}
      {activeTab === 'products' && (
        <div>
          {myProducts.length === 0 ? (
            <div className="text-center py-5">
              <div style={{ fontSize: '4rem' }}>📦</div>
              <h4 className="fw-normal text-muted mt-3">No products listed yet.</h4>
              <button className="btn-premium mt-3 py-2 px-5" onClick={() => setActiveTab('add')}>
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {myProducts.map(p => (
                <div key={p.id} className="col-md-4 col-sm-6">
                  <div className="premium-card h-100 d-flex flex-column">
                    <div style={{ position: 'relative', overflow: 'hidden', height: '200px' }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
                      ) : (
                        <div style={{ height: '100%', background: '#f4f7f4' }} className="d-flex align-items-center justify-content-center text-muted">
                          No Image
                        </div>
                      )}
                      <span className="badge position-absolute top-0 start-0 m-2 px-3 py-2 rounded-pill"
                        style={{ background: 'var(--primary-color)', fontSize: '0.75rem' }}>
                        {categoryName(p.categoryId)}
                      </span>
                    </div>
                    <div className="p-4 d-flex flex-column flex-grow-1">
                      <h5 className="fw-bold mb-1" style={{ color: 'var(--primary-color)' }}>{p.name}</h5>
                      <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{p.brand}</p>
                      <p className="text-muted mt-1 flex-grow-1" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                        {p.description?.slice(0, 80)}{p.description?.length > 80 ? '...' : ''}
                      </p>
                      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                        <div>
                          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--secondary-color)' }}>₹{p.price}</div>
                          <div className="text-muted" style={{ fontSize: '0.78rem' }}>per {p.unit}</div>
                        </div>
                        <div className="text-end">
                          <div className="fw-semibold" style={{ color: '#1a251e' }}>{p.stockQuantity ?? '—'}</div>
                          <div className="text-muted" style={{ fontSize: '0.78rem' }}>in stock</div>
                        </div>
                      </div>
                      <button className="btn btn-outline-danger btn-sm mt-3 rounded-pill w-100"
                        onClick={() => handleDelete(p.id)}>
                        Delete Product
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VendorDashboard;
