import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, Lock, X, UploadCloud, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // KYC States
  const [isVerified, setIsVerified] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycMethod, setKycMethod] = useState(''); // 'id' or 'wallet'
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Profile Edition States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    domain: '',
    experience_level: '',
    skills: '' // comma separated for simplicity in UI
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signup');
      return;
    }

    if (user && profile) {
      setProfileData({
        domain: profile.domain || '',
        experience_level: profile.experience_level || '',
        skills: profile.skills ? profile.skills.join(', ') : ''
      });
      fetchDashboardData();
    }
  }, [user, profile, authLoading, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (profile.role === 'client') {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            proposals (
              *,
              profiles!proposals_freelancer_id_fkey(full_name)
            )
          `)
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });
          
        if (!error && data) {
          setJobs(data);
        }
      } else {
        // Freelancer: for now we just show a generic message or empty list
        // in a full app, we would fetch jobs where freelancer applied
        setJobs([]);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const skillsArray = profileData.skills.split(',').map(s => s.trim()).filter(s => s !== '');
      const { error } = await supabase
        .from('profiles')
        .update({
          domain: profileData.domain || null,
          experience_level: profileData.experience_level || null,
          skills: skillsArray
        })
        .eq('id', user.id);
        
      if (error) throw error;
      setIsEditingProfile(false);
      // In a real app we would update the AuthContext profile here too
      alert('Profil mis à jour avec succès !');
    } catch (err) {
      alert("Erreur lors de la mise à jour : " + err.message);
    }
  };

  if (authLoading || loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Chargement du tableau de bord...</div>;
  }

  const activeJobs = jobs.filter(j => j.status !== 'completed');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const totalEscrow = activeJobs.reduce((acc, job) => acc + job.budget, 0);

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        Mon Tableau de bord
        {profile?.role === 'freelancer' && isVerified && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', backgroundColor: '#EFF6FF', color: '#2563EB', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid #BFDBFE' }}>
            <ShieldCheck size={16} /> Profil Vérifié
          </span>
        )}
      </h1>

      {/* KYC Alert for Freelancers */}
      {profile?.role === 'freelancer' && !isVerified && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #F87171', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <AlertCircle size={20} /> Vérification d'identité requise
            </h3>
            <p style={{ color: '#991B1B', fontSize: '0.9rem' }}>
              Pour garantir un environnement de confiance (et pouvoir utiliser le paiement séquestre), veuillez faire vérifier votre profil.
            </p>
          </div>
          <button onClick={() => setShowKycModal(true)} className="btn" style={{ backgroundColor: '#DC2626', color: 'white', border: 'none' }}>
            Vérifier mon identité
          </button>
        </div>
      )}

      {/* Freelancer Profile Edition */}
      {profile?.role === 'freelancer' && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Mes expertises (Matching)</h3>
            <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
              {isEditingProfile ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          
          {isEditingProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Domaine d'expertise</label>
                  <select className="form-input" value={profileData.domain} onChange={(e) => setProfileData({...profileData, domain: e.target.value})}>
                    <option value="">Sélectionner...</option>
                    <option value="web3">Web3 & Blockchain</option>
                    <option value="genai">IA Générative</option>
                    <option value="nocode">No-Code</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Niveau</label>
                  <select className="form-input" value={profileData.experience_level} onChange={(e) => setProfileData({...profileData, experience_level: e.target.value})}>
                    <option value="">Sélectionner...</option>
                    <option value="junior">Junior (1-2 ans)</option>
                    <option value="confirme">Confirmé (3-5 ans)</option>
                    <option value="expert">Expert (5+ ans)</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Compétences techniques (séparées par une virgule)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: React, Solidity, Node.js, Python, LangChain..."
                  value={profileData.skills}
                  onChange={(e) => setProfileData({...profileData, skills: e.target.value})}
                />
              </div>
              <button onClick={handleSaveProfile} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Enregistrer mon profil</button>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>
              {profileData.domain || profileData.skills ? (
                <div>
                  <strong>Domaine:</strong> {profileData.domain} &nbsp; | &nbsp;
                  <strong>Niveau:</strong> {profileData.experience_level} <br/>
                  <strong>Compétences:</strong> {profileData.skills}
                </div>
              ) : (
                <p style={{ margin: 0 }}>Complétez votre profil pour que l'algorithme YITTE vous propose automatiquement aux clients.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Missions en cours</p>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', margin: 0 }}>{activeJobs.length}</h2>
        </div>
        <div className="card" style={{ borderTop: '4px solid var(--status-pending)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{profile?.role === 'client' ? 'Engagé en séquestre' : 'Gains en attente'}</p>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', margin: 0 }}>{totalEscrow} €</h2>
        </div>
        <div className="card" style={{ borderTop: '4px solid var(--status-success)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Missions terminées</p>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', margin: 0 }}>{completedJobs.length}</h2>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{profile?.role === 'client' ? 'Vos missions publiées' : 'Vos missions actives'}</h2>
      
      {jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Vous n'avez aucune mission pour le moment.</p>
          {profile?.role === 'client' ? (
            <Link to="/post-job" className="btn btn-primary">Publier un besoin</Link>
          ) : (
            <Link to="/jobs" className="btn btn-primary">Explorer les missions</Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {jobs.map(job => (
            <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{job.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span className={`badge badge-${job.domain}`}>{job.domain.toUpperCase()}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <Clock size={14} /> Deadline: {job.deadline}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '250px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Budget / Séquestre</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{job.budget} €</span>
                  </div>
                  
                  {job.status === 'open' && (
                    <div style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid rgba(59,130,246,0.2)' }}>
                      Recherche de prestataire... ({job.proposals?.length || 0} devis)
                    </div>
                  )}
                  {job.status === 'in_progress' && (
                    <div style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: 'var(--status-pending)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <Lock size={16} /> Fonds sécurisés (En cours)
                    </div>
                  )}
                  {job.status === 'completed' && (
                    <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--status-success)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <CheckCircle2 size={16} /> Livré - Fonds libérés
                    </div>
                  )}
                </div>
              </div>
            
            {/* Affichage des devis pour le client */}
            {profile?.role === 'client' && job.status === 'open' && job.proposals && job.proposals.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-main)' }}>Devis reçus ({job.proposals.length})</h4>
                {job.proposals.map(prop => (
                  <div key={prop.id} style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{prop.profiles?.full_name || 'Freelance Anonyme'}</div>
                      <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{prop.amount} €</div>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
                      {prop.message}
                    </p>
                    <button 
                      onClick={() => navigate('/checkout')}
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                    >
                      Accepter et Payer (Séquestre)
                    </button>
                  </div>
                ))}
              </div>
            )}
            </div>
          ))}
        </div>
      )}

      {/* Modal KYC */}
      {showKycModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '1rem', position: 'relative', padding: '2rem' }}>
            <button onClick={() => setShowKycModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '0.5rem' }}>Vérification de confiance (KYC)</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Choisissez une méthode rapide pour obtenir votre badge "Profil Vérifié".
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div 
                onClick={() => setKycMethod('id')}
                style={{ border: `2px solid ${kycMethod === 'id' ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: '12px', padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s' }}
              >
                <div style={{ padding: '0.75rem', backgroundColor: '#F1F5F9', borderRadius: '8px', color: 'var(--text-main)' }}><UploadCloud size={24} /></div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Pièce d'identité</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Carte d'identité, Passeport (via Stripe Identity)</p>
                </div>
              </div>

              <div 
                onClick={() => setKycMethod('wallet')}
                style={{ border: `2px solid ${kycMethod === 'wallet' ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: '12px', padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s' }}
              >
                <div style={{ padding: '0.75rem', backgroundColor: '#F1F5F9', borderRadius: '8px', color: 'var(--text-main)' }}><Wallet size={24} /></div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Connexion Wallet Web3</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Signature cryptographique (idéal experts Blockchain)</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setIsVerifying(true);
                setTimeout(() => {
                  setIsVerifying(false);
                  setIsVerified(true);
                  setShowKycModal(false);
                }, 2500);
              }}
              className="btn btn-primary" 
              style={{ width: '100%' }} 
              disabled={!kycMethod || isVerifying}
            >
              {isVerifying ? 'Vérification en cours...' : 'Lancer la vérification'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
