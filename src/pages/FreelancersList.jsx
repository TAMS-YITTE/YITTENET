import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Star, MapPin } from 'lucide-react';

const mockFreelancers = [
  {
    id: 'alex',
    name: 'Alexandre D.',
    domain: 'web3',
    title: 'Développeur Smart Contracts Senior',
    rating: 4.9,
    reviews: 12,
    rate: '500€/jour',
    skills: ['Solidity', 'Hardhat', 'Ethers.js', 'Audit'],
    verified: true,
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
  },
  {
    id: 'sarah',
    name: 'Sarah M.',
    domain: 'genai',
    title: 'Ingénieure IA & RAG Spécialiste',
    rating: 5.0,
    reviews: 8,
    rate: '650€/jour',
    skills: ['Python', 'OpenAI API', 'LangChain', 'VectorDB'],
    verified: true,
    avatar: 'https://i.pravatar.cc/150?u=b042581f4e29026704d'
  },
  {
    id: 'julien',
    name: 'Julien T.',
    domain: 'nocode',
    title: 'Expert Webflow & Automatisations Make',
    rating: 4.8,
    reviews: 24,
    rate: '400€/jour',
    skills: ['Webflow', 'Make', 'Airtable', 'Figma'],
    verified: false,
    avatar: 'https://i.pravatar.cc/150?u=c042581f4e29026704d'
  }
];

const FreelancersList = () => {
  const [filter, setFilter] = useState('all');

  const filteredFreelancers = filter === 'all' ? mockFreelancers : mockFreelancers.filter(f => f.domain === filter);

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Nos Talents Certifiés</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Découvrez notre réseau d'experts triés sur le volet, prêts à intervenir sur vos projets en toute sécurité grâce au paiement séquestre.
        </p>
      </div>

      {/* Tabs Filters */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <button 
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('all')}
        >Tous</button>
        <button 
          className={`btn ${filter === 'web3' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderColor: filter === 'web3' ? 'var(--domain-web3)' : undefined }}
          onClick={() => setFilter('web3')}
        >Web3</button>
        <button 
          className={`btn ${filter === 'genai' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderColor: filter === 'genai' ? 'var(--domain-genai-color)' : undefined }}
          onClick={() => setFilter('genai')}
        >IA Générative</button>
        <button 
          className={`btn ${filter === 'nocode' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderColor: filter === 'nocode' ? 'var(--domain-nocode)' : undefined }}
          onClick={() => setFilter('nocode')}
        >No-Code</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {filteredFreelancers.map(freelancer => (
          <Link to={`/profile/${freelancer.id}`} key={freelancer.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <img src={freelancer.avatar} alt={freelancer.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {freelancer.name}
                  {freelancer.verified && <ShieldCheck size={18} color="var(--primary)" />}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{freelancer.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', fontSize: '0.85rem' }}>
                  <Star size={14} fill="#F59E0B" /> {freelancer.rating} ({freelancer.reviews} avis)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', flex: 1 }}>
              {freelancer.skills.map(skill => (
                <span key={skill} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-main)' }}>
                  {skill}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span style={{ fontWeight: 'bold', color: 'white' }}>{freelancer.rate}</span>
              <span className={`badge badge-${freelancer.domain}`}>{freelancer.domain === 'genai' ? 'IA' : freelancer.domain.toUpperCase()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FreelancersList;
