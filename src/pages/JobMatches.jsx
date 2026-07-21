import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Sparkles, CheckCircle2, User, ArrowRight } from 'lucide-react';

const JobMatches = () => {
  const { id: jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const matchCriteria = location.state?.matchCriteria;

  useEffect(() => {
    if (!matchCriteria) {
      // Si pas de critères passés (ex: refresh page), on redirige vers le dashboard
      navigate('/dashboard');
      return;
    }
    
    fetchMatches();
  }, [jobId, matchCriteria]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data: allFreelancers, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'freelancer');
        
      if (error) throw error;

      // Scoring Engine
      const scoredFreelancers = allFreelancers.map(f => {
        let score = 0;
        const reasons = [];

        // 1. Domain match (+3)
        const fDomain = (f.domain || '').toLowerCase();
        const cDomain = (matchCriteria.domain || '').toLowerCase().replace(/é/g, 'e').replace(/\s+/g, '');
        if (fDomain && cDomain.includes(fDomain)) {
          score += 3;
          reasons.push('Domaine d\'expertise');
        }

        // 2. Experience level match (+2)
        const fLevel = (f.experience_level || '').toLowerCase();
        const cLevel = (matchCriteria.experience_level || '').toLowerCase();
        if (fLevel && cLevel.includes(fLevel)) {
          score += 2;
          reasons.push('Niveau correspondant');
        }

        // 3. Skills match (+1 per skill)
        const fSkills = (f.skills || []).map(s => s.toLowerCase());
        const cSkills = (matchCriteria.skills || []).map(s => s.toLowerCase());
        let commonSkills = 0;
        
        cSkills.forEach(cSkill => {
          if (fSkills.some(fSkill => fSkill.includes(cSkill) || cSkill.includes(fSkill))) {
            commonSkills += 1;
          }
        });
        
        if (commonSkills > 0) {
          score += commonSkills;
          reasons.push(`${commonSkills} compétence(s) en commun`);
        }

        return { ...f, score, reasons };
      });

      // Sort by score desc, keep only those with score > 0, limit to 5
      const bestMatches = scoredFreelancers
        .filter(f => f.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setFreelancers(bestMatches);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--primary)', borderRadius: '50%', marginBottom: '1.5rem' }}>
          <CheckCircle2 size={32} />
        </div>
        <h1 style={{ marginBottom: '0.5rem' }}>Mission publiée avec succès !</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          L'algorithme YITTE a analysé votre cahier des charges et trouvé les meilleurs experts.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
        <Sparkles size={20} color="var(--primary)" /> Top Profils Recommandés
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Analyse des compétences en cours...
        </div>
      ) : freelancers.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {freelancers.map((freelancer, idx) => (
            <div key={freelancer.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: idx === 0 ? '2px solid var(--primary)' : '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: '#F1F5F9', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94A3B8' }}>
                  <User size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {freelancer.full_name}
                    {idx === 0 && <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '12px' }}>Meilleur Match</span>}
                  </h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    Score de pertinence : <strong style={{ color: 'var(--text-main)' }}>{freelancer.score} pts</strong>
                  </div>
                  <div style={{ color: 'var(--status-success)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    ✓ {freelancer.reasons.join(' • ')}
                  </div>
                </div>
              </div>
              <button onClick={() => alert("Dans la version finale, cela enverra une notification directe au freelance ! L'email d'invitation part.")} className="btn btn-outline">
                Inviter
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: '1rem' }}>Aucun expert ne correspond parfaitement à 100% de vos critères techniques pour le moment.</p>
          <p style={{ fontSize: '0.9rem' }}>Votre mission est néanmoins publique, les freelances intéressés postuleront très bientôt !</p>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          Aller à mon Tableau de Bord <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default JobMatches;
