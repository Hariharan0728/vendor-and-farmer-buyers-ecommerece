import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="text-center">
      <div className="hero-gradient">
        <h1 className="hero-title">Cultivating<br/>The Future of Farming</h1>
        <p className="hero-subtitle mx-auto mt-4" style={{maxWidth: '600px'}}>
          Join the premium marketplace connecting modern farmers directly with top-tier vendors. Discover high-quality seeds, fertilizers, and technology.
        </p>
        <div className="mt-5">
          <Link to="/products" className="btn-premium mx-2">Explore Catalog</Link>
          <Link to="/signup" className="btn-premium-outline mx-2 bg-white">Become a Vendor</Link>
        </div>
        
        {/* Decorative elements */}
        <div style={{position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--accent-color)', borderRadius: '50%', filter: 'blur(80px)', opacity: '0.5'}}></div>
        <div style={{position: 'absolute', bottom: '-50px', left: '-50px', width: '250px', height: '250px', background: 'var(--secondary-color)', borderRadius: '50%', filter: 'blur(100px)', opacity: '0.4'}}></div>
      </div>
      
      <div className="row mt-5 pt-5 text-start">
        <div className="col-md-4 mb-4">
          <div className="p-4 bg-white rounded-4 shadow-sm h-100 border border-light">
            <h3 className="fs-4 fw-bold" style={{color: 'var(--primary-color)'}}>Verified Quality</h3>
            <p className="text-muted mt-3">Every vendor is KYC verified. We ensure that you only get the highest grade agricultural inputs.</p>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="p-4 bg-white rounded-4 shadow-sm h-100 border border-light">
            <h3 className="fs-4 fw-bold" style={{color: 'var(--primary-color)'}}>Direct Pricing</h3>
            <p className="text-muted mt-3">Cut out the middlemen. Connect directly with manufacturers and save on large bulk orders.</p>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="p-4 bg-white rounded-4 shadow-sm h-100 border border-light">
            <h3 className="fs-4 fw-bold" style={{color: 'var(--primary-color)'}}>Fast Delivery</h3>
            <p className="text-muted mt-3">Robust logistics network ensuring your fertilizers and seeds arrive right when you need them.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
