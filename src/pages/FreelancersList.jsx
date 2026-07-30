import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Star, User, Crown, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const FreelancersList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [freelancers, setFreelancers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratings, setRatings] = useState({}); // { freelancerId: { avg, count } }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      let query = supabase.from('profiles').select('*').eq('role', 'freelancer');
      
      if (searchQuery.trim()) {
        query = query.or(`full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
      }

      const [{ data, error }, { data: reviewsData }] = await Promise.all([
        query,
        supabase.from('reviews').select('freelancer_id, rating'),
      ]);

      if (!error && data) {
        // Boost Premium : les abonnés remontent en tête de l'annuaire.
        const sorted = [...data].sort((a, b) => (b.is_premium ? 1 : 0) - (a.is_premium ? 1 : 0));
        setFreelancers(sorted);
      }

      if (reviewsData) {
        const agg = {};
        reviewsData.forEach((r) => {
          if (!agg[r.freelancer_id]) agg[r.freelancer_id] = { sum: 0, count: 0 };
          agg[r.freelancer_id].sum += r.rating;
          agg[r.freelancer_id].count += 1;
        });
        const out = {};
        Object.entries(agg).forEach(([id, { sum, count }]) => {
          out[id] = { avg: (sum / count).toFixed(1), count };
        });
        setRatings(out);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFreelancers = filter === 'all' ? freelancers : freelancers.filter(f => f.domain === filter);

  const startChat = async (freelancerId) => {
    if (!user) {
      navigate('/signup');
      return;
    }
    
    try {
      // 1. Check if conversation already exists
      const { data: existing, error: searchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', user.id)
        .eq('freelancer_id', freelancerId)
        .maybeSingle();
        
      if (existing) {
        navigate('/messages');
        return;
      }

      // 2. Create new conversation
      const { data: newConv, error: insertError } = await supabase
        .from('conversations')
        .insert({
          client_id: user.id,
          freelancer_id: freelancerId
        })
        .select()
        .single();
        
      if (insertError) throw insertError;
      navigate('/messages');
    } catch (err) {
      console.error('Erreur chat:', err);
      alert('Impossible de démarrer la conversation.');
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Nos Talents Certifiés</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Découvrez notre réseau d'experts triés sur le volet, prêts à intervenir sur vos projets en toute sécurité.
        </p>
      </div>

      <form onSubmit={fetchFreelancers} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
        <input 
          type="text" 
          placeholder="Rechercher par nom, compétence, mot-clé..." 
          className="form-input" 
          style={{ flex: 1 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>Rechercher</button>
      </form>

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
        <button 
          className={`btn ${filter === 'legaltech' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderColor: filter === 'legaltech' ? 'var(--text-main)' : undefined }}
          onClick={() => setFilter('legaltech')}
        >LegalTech</button>
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
                  <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {freelancer.full_name}
                    {freelancer.verified && <ShieldCheck size={18} color="var(--primary)" />}
                    {freelancer.is_premium && (
                      <span title="Prestataire Premium" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', fontWeight: 700, color: '#B45309', backgroundColor: 'rgba(245,158,11,0.15)', padding: '0.15rem 0.5rem', borderRadius: '20px' }}>
                        <Crown size={12} /> Premium
                      </span>
                    )}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    {freelancer.experience_level ? `Niveau ${freelancer.experience_level}` : 'Freelance Indépendant'}
                  </p>
                  {ratings[freelancer.id] && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', fontSize: '0.85rem' }}>
                      <Star size={14} fill="#F59E0B" /> {ratings[freelancer.id].avg}
                      <span style={{ color: 'var(--text-muted)' }}>({ratings[freelancer.id].count})</span>
                    </div>
                  )}
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
                  {freelancer.tjm ? `A partir de ${freelancer.tjm}€/j` : 'TJM sur devis'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => startChat(freelancer.id)} className="btn btn-primary" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Envoyer un message">
                    <MessageCircle size={18} />
                  </button>
                  <Link to={`/profile/${freelancer.id}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Voir le profil
                  </Link>
                </div>
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
