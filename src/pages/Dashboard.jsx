import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>Mon Tableau de bord</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Missions en cours</p>
          <h2 style={{ fontSize: '2.5rem', color: 'white', margin: 0 }}>2</h2>
        </div>
        <div className="card" style={{ borderTop: '4px solid var(--status-pending)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Fonds en séquestre</p>
          <h2 style={{ fontSize: '2.5rem', color: 'white', margin: 0 }}>4,500 €</h2>
        </div>
        <div className="card" style={{ borderTop: '4px solid var(--status-success)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Missions terminées</p>
          <h2 style={{ fontSize: '2.5rem', color: 'white', margin: 0 }}>12</h2>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Missions Actives</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Job Card 1 */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Création Smart Contract Staking</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Prestataire: <Link to="/profile/alex" style={{ color: 'var(--primary)' }}>Alexandre D.</Link></p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span className="badge badge-web3">Web3</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}><Clock size={14} /> Livraison prévue : 24 Oct</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', minWidth: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Séquestre</span>
              <span style={{ fontWeight: 'bold', color: 'white' }}>2,500 €</span>
            </div>
            <div style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: 'var(--status-pending)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Lock size={16} /> Fonds sécurisés (En cours)
            </div>
            <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}>Voir la messagerie</button>
          </div>
        </div>

        {/* Job Card 2 */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Intégration RAG sur docs internes</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Prestataire: <Link to="/profile/sarah" style={{ color: 'var(--primary)' }}>Sarah M.</Link></p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span className="badge badge-genai">IA Générative</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}><Clock size={14} /> En attente de validation</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', minWidth: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Séquestre</span>
              <span style={{ fontWeight: 'bold', color: 'white' }}>2,000 €</span>
            </div>
            <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--status-success)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid rgba(16,185,129,0.2)' }}>
              <AlertCircle size={16} /> Livré - Valider le paiement
            </div>
            <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}>Libérer les fonds</button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Mock Lock icon as it was missing from lucide import
const Lock = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

export default Dashboard;
