import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-card)',
      borderTop: '1px solid var(--border-color)',
      padding: '4rem 0 2rem 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>YITTE</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Your IT TEam.<br/>
            La marketplace de confiance pour vos projets Web3, IA Générative et No-Code. Paiement bloqué en séquestre pour 100% de sérénité.
          </p>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', color: 'white' }}>Domaines</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><Link to="/domain/web3" style={{ color: 'var(--text-muted)' }}>Web3 & Blockchain</Link></li>
            <li><Link to="/domain/genai" style={{ color: 'var(--text-muted)' }}>IA Générative</Link></li>
            <li><Link to="/domain/nocode" style={{ color: 'var(--text-muted)' }}>No-Code & Automatisation</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', color: 'white' }}>Plateforme</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><Link to="/jobs" style={{ color: 'var(--text-muted)' }}>Trouver une mission</Link></li>
            <li><Link to="/freelancers" style={{ color: 'var(--text-muted)' }}>Rechercher un prestataire</Link></li>
            <li><Link to="/post-job" style={{ color: 'var(--text-muted)' }}>Publier un besoin</Link></li>
          </ul>
        </div>

      </div>
      <div className="container" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
        &copy; {new Date().getFullYear()} YITTE. Tous droits réservés. Prototype.
      </div>
    </footer>
  );
};

export default Footer;
