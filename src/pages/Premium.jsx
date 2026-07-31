import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const PRICE_LABEL = '49€';

const BENEFITS = [
  { icon: ShieldCheck, title: 'Badge "Vérifié Premium"', desc: 'Un badge distinctif sur votre profil et dans l\'annuaire, gage de sérieux pour les clients.' },
  { icon: TrendingUp, title: 'Boost de visibilité', desc: 'Votre profil remonte en tête des résultats de l\'annuaire des prestataires.' },
  { icon: Sparkles, title: 'Priorité sur les missions', desc: 'Mise en avant renforcée auprès des clients à la recherche d\'experts.' },
];

const Premium = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isFreelancer = profile?.role === 'freelancer';
  const isPremium = profile?.is_premium;

  const handleSubscribe = async () => {
    setErrorMsg('');
    if (!user) {
      navigate('/signup');
      return;
    }
    if (!isFreelancer) {
      setErrorMsg('Seuls les comptes Prestataire peuvent souscrire au Premium.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      setErrorMsg(err.message || 'Erreur lors de la création de l\'abonnement.');
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      setErrorMsg(err.message || 'Erreur lors de l\'ouverture du portail de gestion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '780px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', backgroundColor: 'rgba(245,158,11,0.12)', color: '#F59E0B', borderRadius: '50%', marginBottom: '1.5rem' }}>
          <Crown size={36} />
        </div>
        <h1 style={{ marginBottom: '0.75rem' }}>YITTE Premium</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Démarquez-vous et attirez plus de clients. Réservé aux prestataires.
        </p>
      </div>

      {errorMsg && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(233,64,87,0.1)', color: 'var(--domain-genai)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(233,64,87,0.2)' }}>
          {errorMsg}
        </div>
      )}

      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
            {PRICE_LABEL}<span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}> / mois</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Sans engagement, résiliable à tout moment.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '0.15rem' }}><Icon size={22} /></div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check size={16} color="var(--status-success)" /> {title}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {authLoading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chargement…</div>
        ) : isPremium ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-success)', fontWeight: 'bold', marginBottom: '1rem' }}>
              <ShieldCheck size={20} /> Vous êtes abonné Premium
            </div>
            <button onClick={handleManage} disabled={loading} className="btn btn-outline" style={{ width: '100%', padding: '1rem' }}>
              {loading ? 'Ouverture…' : 'Gérer mon abonnement'}
            </button>
          </div>
        ) : (
          <button onClick={handleSubscribe} disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}>
            {loading ? 'Redirection vers le paiement…' : `Passer Premium — ${PRICE_LABEL}/mois`}
          </button>
        )}

        {!isFreelancer && !authLoading && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
            Cette offre est réservée aux comptes Prestataire.
          </p>
        )}
      </div>
    </div>
  );
};

export default Premium;
