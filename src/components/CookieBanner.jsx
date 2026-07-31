import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

const CookieBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('yitte_cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('yitte_cookie_consent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('yitte_cookie_consent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'var(--bg-card)',
      borderTop: '1px solid var(--border-color)',
      padding: '1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '2rem',
      zIndex: 9999,
      boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
      flexWrap: 'wrap'
    }}>
      <div style={{ flex: '1 1 300px' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={18} color="var(--primary)" />
          Nous respectons votre vie privée
        </h4>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          YITTE utilise des cookies pour assurer le bon fonctionnement de la plateforme (session, sécurité) 
          et analyser le trafic (statistiques anonymes). Vous pouvez personnaliser vos choix. 
          Pour en savoir plus, consultez notre <Link to="/confidentialite" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Politique de confidentialité</Link>.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={handleDecline} className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
          Refuser
        </button>
        <button onClick={handleAccept} className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
          Accepter tout
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
