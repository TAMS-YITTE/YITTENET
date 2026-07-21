import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, MapPin, X, CheckCircle2 } from 'lucide-react';

const mockJobs = [
  {
    id: '1',
    title: 'Création d\'un Smart Contract de Staking',
    domain: 'web3',
    budget: 2500,
    deadline: '2024-11-15',
    description: 'Nous cherchons un dev Solidity expérimenté pour créer un contrat de staking ERC20 sécurisé et optimisé en gaz.',
    client: 'DeFi Startup',
    postedAt: 'Il y a 2h'
  },
  {
    id: '2',
    title: 'Intégration RAG sur documentation interne',
    domain: 'genai',
    budget: 3500,
    deadline: '2024-12-01',
    description: 'Besoin de mettre en place un pipeline RAG avec OpenAI pour interroger notre base de connaissances Notion.',
    client: 'Tech Agency',
    postedAt: 'Il y a 5h'
  },
  {
    id: '3',
    title: 'Site vitrine Webflow pour Cabinet d\'avocats',
    domain: 'nocode',
    budget: 1200,
    deadline: '2024-10-30',
    description: 'Refonte complète de notre site avec Webflow, design fourni sur Figma. Besoin d\'animations fluides.',
    client: 'Cabinet Dupont',
    postedAt: 'Il y a 1 jour'
  },
  {
    id: '4',
    title: 'Audit de sécurité d\'une Marketplace NFT',
    domain: 'web3',
    budget: 4000,
    deadline: '2024-11-05',
    description: 'Audit complet de nos contrats Seaport modifiés avant lancement sur le mainnet Ethereum.',
    client: 'NFT Collect',
    postedAt: 'Il y a 2 jours'
  }
];

const JobsList = () => {
  const [filter, setFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [proposal, setProposal] = useState({ price: '', duration: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredJobs = filter === 'all' ? mockJobs : mockJobs.filter(j => j.domain === filter);

  const handleOpenProposal = (job) => {
    setSelectedJob(job);
    setProposal({ price: job.budget, duration: '', message: '' });
  };

  const handleSubmitProposal = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setAppliedJobIds(prev => [...prev, selectedJob.id]);
      setIsSubmitting(false);
      setSelectedJob(null);
    }, 1000);
  };

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Trouver une mission</h1>
          <p style={{ color: 'var(--text-muted)' }}>Découvrez les derniers besoins publiés et proposez vos services.</p>
        </div>
        <Link to="/post-job" className="btn btn-outline">Publier un besoin</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '3rem' }}>
        {/* Sidebar Filters */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
            <Filter size={18} /> Filtres
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="domain" checked={filter === 'all'} onChange={() => setFilter('all')} />
              Tous les domaines
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--domain-web3)' }}>
              <input type="radio" name="domain" checked={filter === 'web3'} onChange={() => setFilter('web3')} />
              Web3 & Blockchain
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--domain-genai-color)' }}>
              <input type="radio" name="domain" checked={filter === 'genai'} onChange={() => setFilter('genai')} />
              IA Générative
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--domain-nocode)' }}>
              <input type="radio" name="domain" checked={filter === 'nocode'} onChange={() => setFilter('nocode')} />
              No-Code
            </label>
          </div>
        </div>

        {/* Jobs Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Search Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" className="form-input" placeholder="Rechercher par mot-clé (ex: Solidity, RAG, Webflow...)" style={{ paddingLeft: '3rem' }} />
            </div>
            <button className="btn btn-primary">Rechercher</button>
          </div>

          {filteredJobs.map(job => (
            <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{job.title}</h3>
                  <span className={`badge badge-${job.domain}`}>{job.domain === 'genai' ? 'IA Générative' : job.domain.toUpperCase()}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{job.budget} €</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Budget fixe</div>
                </div>
              </div>
              
              <p>{job.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Publié {job.postedAt}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> Par {job.client}</span>
                </div>
                {appliedJobIds.includes(job.id) ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-success)', fontWeight: 'bold' }}>
                    <CheckCircle2 size={18} /> Proposition envoyée
                  </div>
                ) : (
                  <button onClick={() => handleOpenProposal(job)} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Faire une proposition</button>
                )}
              </div>
            </div>
          ))}
          
          {filteredJobs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', borderRadius: '12px' }}>
              Aucune mission trouvée pour ce domaine actuellement.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Proposition */}
      {selectedJob && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '1rem', position: 'relative', padding: '2rem' }}>
            <button onClick={() => setSelectedJob(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '0.5rem' }}>Faire une proposition</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Mission : <strong>{selectedJob.title}</strong>
            </p>

            <form onSubmit={handleSubmitProposal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Votre devis (€)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={proposal.price}
                  onChange={(e) => setProposal({...proposal, price: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Délai estimé</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: 3 semaines, 10 jours ouvrés..." 
                  value={proposal.duration}
                  onChange={(e) => setProposal({...proposal, duration: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Message de motivation</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  placeholder="Expliquez votre approche technique et pourquoi vous êtes le bon expert pour ce projet..."
                  value={proposal.message}
                  onChange={(e) => setProposal({...proposal, message: e.target.value})}
                  required
                ></textarea>
              </div>
              
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#F0FDF4', color: '#166534', borderRadius: '8px', fontSize: '0.85rem' }}>
                ℹ️ Si votre proposition est acceptée, le client déposera les fonds sous <strong>séquestre</strong> avant que vous ne commenciez le travail.
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={isSubmitting}>
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma proposition'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsList;
