import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, LayoutDashboard, MessageSquare, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-color)',
      zIndex: 50,
      padding: '1rem 0'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Logo */}
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.4rem' }}>
            Y
          </div>
          <span style={{ letterSpacing: '1px' }}>YITTE</span>
        </Link>

        {/* Links */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/jobs" style={{ color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.2s', textDecoration: 'none' }}>Missions</Link>
          <Link to="/freelancers" style={{ color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.2s', textDecoration: 'none' }}>Prestataires</Link>
          <Link to="/marketplace" style={{ color: 'var(--primary)', fontWeight: 600, transition: 'color 0.2s', textDecoration: 'none' }}>Boutique</Link>
          {user && (
            <Link to="/messages" style={{ color: 'var(--text-main)', fontWeight: 500, transition: 'color 0.2s', textDecoration: 'none' }}>Messagerie</Link>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-success)', fontSize: '0.875rem' }}>
            <ShieldCheck size={16} /> Paiement Séquestre
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <>
              {profile?.role === 'client' && (
                <Link to="/post-job" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Publier un besoin</Link>
              )}
              {profile?.role === 'freelancer' && (
                <Link to="/premium" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: profile?.is_premium ? '#F59E0B' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }} title={profile?.is_premium ? 'Abonnement Premium actif' : 'Passer Premium'}>
                  <Crown size={18} /> Premium
                </Link>
              )}
              <Link to="/messages" className="btn" style={{ padding: '0.5rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }} title="Messagerie">
                <MessageSquare size={20} />
              </Link>
              <Link to="/dashboard" className="btn btn-outline" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LayoutDashboard size={18} /> Tableau de bord
              </Link>
              <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem', color: 'var(--text-muted)' }} title="Déconnexion">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/signup" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Connexion</Link>
              <Link to="/post-job" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Publier un besoin</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
