import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, User } from 'lucide-react';

const Navbar = () => {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      backgroundColor: 'rgba(11, 14, 20, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-color)',
      zIndex: 50,
      padding: '1rem 0'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--domain-web3))',
            borderRadius: '8px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>Y</div>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>YITTE</span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/jobs" style={{ color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.2s' }}>Missions</Link>
          <Link to="/freelancers" style={{ color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.2s' }}>Prestataires</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-success)', fontSize: '0.875rem' }}>
            <ShieldCheck size={16} /> Paiement Séquestre
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/signup" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Connexion</Link>
          <Link to="/post-job" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Publier un besoin</Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
