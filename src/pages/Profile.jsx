import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Star, Download, FileCheck, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';

const DOMAIN_LABELS = { web3: 'Web3 & Blockchain', genai: 'IA Générative', nocode: 'No-Code & Automatisation' };
const LEVEL_LABELS = { junior: 'Junior', confirme: 'Confirmé', expert: 'Expert' };

const Profile = () => {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      const [{ data: profileData, error: profileError }, { data: reviewsData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('reviews').select('*').eq('freelancer_id', id).order('created_at', { ascending: false })
      ]);

      if (!active) return;

      if (profileError || !profileData) {
        setNotFound(true);
      } else {
        setProfile(profileData);
        setReviews(reviewsData || []);
      }
      setLoading(false);
    };

    fetchData();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Chargement du profil...</div>;
  }

  if (notFound) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Ce profil n'existe pas ou n'est plus disponible.</p>
        <Link to="/freelancers" className="btn btn-outline" style={{ marginTop: '1rem' }}>Voir les prestataires</Link>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '1000px' }}>
      {/* Header Profile */}
      <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#F1F5F9' }}></div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {profile.full_name}
                {profile.verified && <ShieldCheck size={24} color="var(--primary)" title="Identité vérifiée" />}
                {profile.is_premium && (
                  <span title="Prestataire Premium vérifié" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#B45309', backgroundColor: 'rgba(245,158,11,0.15)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                    <Crown size={14} /> Premium
                  </span>
                )}
              </h1>
              {profile.domain && (
                <p style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  {DOMAIN_LABELS[profile.domain] || profile.domain}
                  {profile.experience_level && ` · ${LEVEL_LABELS[profile.experience_level] || profile.experience_level}`}
                </p>
              )}
              {averageRating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', fontSize: '0.9rem' }}>
                  <Star size={16} fill="#F59E0B" /> {averageRating} ({reviews.length} avis)
                </div>
              )}
            </div>
            <div>
              <Link to={`/post-job?domain=${profile.domain || ''}`} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                Inviter sur une mission
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>À propos</h3>
            <p>{profile.bio || "Ce prestataire n'a pas encore complété sa présentation."}</p>
          </div>

          <div className="card">
            <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Compétences</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(profile.skills || []).length > 0 ? profile.skills.map(skill => (
                <span key={skill} className="badge" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>{skill}</span>
              )) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Compétences non renseignées</span>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Avis récents</h3>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Aucun avis pour le moment.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reviews.map((review, i) => (
                  <div key={review.id} style={{ borderBottom: i < reviews.length - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star size={14} fill="#F59E0B" /> {review.rating.toFixed(1)}
                      </span>
                    </div>
                    {review.comment && <p style={{ fontSize: '0.9rem' }}>"{review.comment}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Documents & CV</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {profile.cv_url && (
                <a href={profile.cv_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileCheck size={18} /> CV</span>
                  <Download size={18} />
                </a>
              )}
              {profile.portfolio_url && (
                <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileCheck size={18} /> Portfolio</span>
                </a>
              )}
              {!profile.cv_url && !profile.portfolio_url && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Aucun document renseigné.</p>
              )}
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
