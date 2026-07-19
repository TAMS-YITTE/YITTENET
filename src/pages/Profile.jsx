import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Star, MapPin, Download, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '1000px' }}>
      {/* Header Profile */}
      <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--border-color)', backgroundImage: 'url(https://i.pravatar.cc/150?u=a042581f4e29026704d)', backgroundSize: 'cover' }}></div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Alexandre D. 
                <ShieldCheck size={24} color="var(--primary)" title="Identité vérifiée" />
              </h1>
              <p style={{ color: 'var(--domain-web3)', fontWeight: 500, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Développeur Smart Contracts Senior</p>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={16} /> Paris (Remote)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B' }}><Star size={16} fill="#F59E0B" /> 4.9 (12 avis)</span>
              </div>
            </div>
            <div>
              <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Contacter</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>À propos</h3>
            <p>Spécialisé dans le développement Solidity et l'architecture de dApps. J'ai réalisé plus de 20 projets DeFi et NFT sur Ethereum et Polygon. Sécurité et optimisation du gaz sont mes priorités absolues.</p>
          </div>
          
          <div className="card">
            <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Compétences</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Solidity', 'Hardhat', 'Ethers.js', 'React', 'The Graph', 'Audit Sécurité'].map(skill => (
                <span key={skill} className="badge" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>{skill}</span>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Avis récents</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--text-main)' }}>Création Smart Contract Staking</strong>
                  <span style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Star size={14} fill="#F59E0B" /> 5.0</span>
                </div>
                <p style={{ fontSize: '0.9rem' }}>"Travail impeccable, contrat sécurisé et livré en avance. Le système de séquestre a rendu la transaction très rassurante."</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Documents & CV</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a href="#" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileCheck size={18} /> CV_Alexandre.pdf</span>
                <Download size={18} />
              </a>
              <a href="#" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileCheck size={18} /> Portfolio_Projets.pdf</span>
                <Download size={18} />
              </a>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
            <h3 style={{ color: 'var(--status-success)', marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} /> Paiement YITTE
            </h3>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              Ce prestataire accepte exclusivement les paiements sécurisés via le séquestre YITTE. Vos fonds sont protégés jusqu'à la livraison.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
