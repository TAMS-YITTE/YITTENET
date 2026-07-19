import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronRight, Lock, FileCheck, CreditCard, Sparkles, Hexagon, Code2 } from 'lucide-react';

const domains = [
  {
    id: 'web3',
    title: 'Web3 & Blockchain',
    desc: 'Smart contracts, dApps, Tokenisation',
    icon: <Hexagon size={40} className="grad-web3" />,
    badgeClass: 'badge-web3'
  },
  {
    id: 'genai',
    title: 'IA Générative',
    desc: 'Agents IA, RAG, Fine-tuning LLM',
    icon: <Sparkles size={40} className="grad-genai" />,
    badgeClass: 'badge-genai'
  },
  {
    id: 'nocode',
    title: 'No-Code & Auto',
    desc: 'Sites, Apps internes, Zapier/Make',
    icon: <Code2 size={40} className="grad-nocode" />,
    badgeClass: 'badge-nocode'
  }
];

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section style={{ padding: '6rem 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '800px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(11,14,20,0) 70%)',
          zIndex: -1
        }}></div>
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--status-success)', padding: '0.5rem 1rem', borderRadius: '99px', marginBottom: '2rem', border: '1px solid rgba(16,185,129,0.2)' }}>
            <ShieldCheck size={18} />
            <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Paiement 100% sécurisé en séquestre</span>
          </div>
          
          <h1 style={{ fontSize: '4rem', maxWidth: '800px', margin: '0 auto 1.5rem', lineHeight: 1.1 }}>
            Trouvez la <span className="text-gradient grad-web3">Dream Team</span> pour vos projets Tech de pointe
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem' }}>
            YITTE connecte les meilleurs experts Web3, GenAI et No-Code à vos besoins, avec la garantie d'un paiement libéré <strong>uniquement</strong> à la livraison.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/post-job" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Publier un besoin gratuit
            </Link>
            <Link to="/freelancers" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Explorer les talents
            </Link>
          </div>
        </div>
      </section>

      {/* Domains Catalog */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem' }}>Explorez nos domaines d'expertise</h2>
            <p style={{ color: 'var(--text-muted)' }}>Découvrez les missions les plus demandées et lancez votre projet en un clic.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {domains.map(domain => (
              <Link to={`/domain/${domain.id}`} key={domain.id} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem', padding: '3rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  {domain.icon}
                </div>
                <div>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>{domain.title}</h3>
                  <p>{domain.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 500, marginTop: 'auto' }}>
                  Voir le catalogue <ChevronRight size={18} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Escrow Explanation */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 500px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>La sécurité avant tout, <br/>sans compromis.</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>Notre système de séquestre (Escrow) garantit que les fonds sont en sécurité pendant toute la durée du projet. Aucune mauvaise surprise.</p>
            
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: 'rgba(59,130,246,0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)' }}><CreditCard size={24} /></div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', color: 'white' }}>1. Dépôt initial</h4>
                  <p style={{ fontSize: '0.95rem' }}>Le client valide le devis et dépose les fonds sur un compte séquestre sécurisé.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: 'rgba(245,158,11,0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--status-pending)' }}><Lock size={24} /></div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', color: 'white' }}>2. Fonds bloqués</h4>
                  <p style={{ fontSize: '0.95rem' }}>Le prestataire travaille l'esprit tranquille, sachant que l'argent est déjà provisionné.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--status-success)' }}><FileCheck size={24} /></div>
                <div>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', color: 'white' }}>3. Paiement libéré</h4>
                  <p style={{ fontSize: '0.95rem' }}>Une fois le travail livré et validé par le client, les fonds sont automatiquement transférés au prestataire.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div style={{ flex: '1 1 400px', backgroundColor: 'var(--bg-card)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--border-color)', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <ShieldCheck size={64} style={{ color: 'var(--status-success)', margin: '0 auto 1rem' }} />
              <h3 style={{ color: 'white' }}>Statut de la transaction</h3>
            </div>
            
            <div style={{ backgroundColor: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Montant bloqué</span>
                <span style={{ fontWeight: 'bold', color: 'white' }}>2,500 €</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ width: '66%', height: '100%', backgroundColor: 'var(--status-pending)' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>En cours de réalisation</span>
                <span style={{ color: 'var(--status-pending)', fontWeight: 500 }}>En Séquestre</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
