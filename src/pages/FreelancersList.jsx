import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Star, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

const FreelancersList = () => {
  const [filter, setFilter] = useState('all');
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'freelancer');
        
      if (!error && data) {
        setFreelancers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFreelancers = filter === 'all' ? freelancers : freelancers.filter(f => f.domain === filter);

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Nos Talents Certifiés</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Découvrez notre réseau d'experts triés sur le volet, prêts à intervenir sur vos projets en toute sécurité.
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Chargement des talents...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {filteredFreelancers.map(freelancer => (
            <div key={freelancer.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: '#F1F5F9', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94A3B8' }}>
                  <User size={32} />
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {freelancer.full_name}
                    {freelancer.verified && <ShieldCheck size={18} color="var(--primary)" />}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    {freelancer.experience_level ? `Niveau ${freelancer.experience_level}` : 'Freelance Indépendant'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', flex: 1 }}>
                {(freelancer.skills || []).map(skill => (
                  <span key={skill} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }}>
                    {skill}
                  </span>
                ))}
                {(!freelancer.skills || freelancer.skills.length === 0) && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Compétences non renseignées</span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                  A partir de 400€/j
                </div>
                {/* On redirige vers dashboard car Profile public pas fini */}
                <Link to={`/dashboard`} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  Voir le profil
                </Link>
              </div>
            </div>
          ))}
          
          {filteredFreelancers.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', borderRadius: '12px' }}>
              Aucun profil trouvé pour ce domaine.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FreelancersList;
