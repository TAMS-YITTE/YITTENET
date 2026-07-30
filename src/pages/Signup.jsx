import React, { useState } from 'react';
import { UploadCloud, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Signup = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [role, setRole] = useState('freelancer');
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const fullName = formData.get('fullName');
    const portfolioUrl = formData.get('portfolioUrl');

    try {
      if (isLogin) {
        // LOGIN FLOW
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        navigate('/dashboard');
      } else {
        // Garde-fou : le consentement est aussi bloqué côté UI (bouton désactivé),
        // mais on revérifie ici pour ne jamais créer de compte sans acceptation.
        if (!acceptedTerms || !acceptedPrivacy) {
          throw new Error('Vous devez accepter les CGV/CGU et la politique de confidentialité pour créer un compte.');
        }

        // SIGNUP FLOW — the profiles row is created server-side by a DB trigger
        // (see supabase/migrations/20260721120000_fix_signup_profile_trigger.sql),
        // fed from this metadata, so it doesn't depend on a client session existing yet.
        // Le consentement (accepted_terms/accepted_privacy) est horodaté par le trigger
        // (migration 20260727130000_legal_consent.sql).
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
              full_name: fullName,
              portfolio_url: portfolioUrl || null,
              accepted_terms: true,
              accepted_privacy: true,
            },
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          // If email confirmation is required, there's no session yet — an
          // authenticated storage upload would fail. Only attempt it when we
          // actually have a session (email confirmation disabled, or instant signup).
          if (role === 'freelancer' && file && authData.session) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${authData.user.id}-${Math.random()}.${fileExt}`;
            const { error: uploadError, data } = await supabase.storage
              .from('resumes')
              .upload(fileName, file);

            if (!uploadError && data) {
              const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(data.path);
              await supabase.from('profiles').update({ cv_url: urlData.publicUrl }).eq('id', authData.user.id);
            }
          }

          setSubmitted(true);
          setNeedsEmailConfirmation(!authData.session);
          if (authData.session) {
            setTimeout(() => navigate('/dashboard'), 2000);
          }
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', maxWidth: '600px' }}>
        <CheckCircle2 size={80} color="var(--status-success)" style={{ margin: '0 auto 2rem' }} />
        <h1 style={{ marginBottom: '1rem' }}>Inscription réussie !</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
          {needsEmailConfirmation
            ? 'Vérifiez votre boîte mail et confirmez votre adresse pour activer votre compte, puis connectez-vous.'
            : 'Bienvenue sur YITTE. Vous allez être redirigé vers votre tableau de bord...'}
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '600px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {isLogin ? 'Connexion' : 'Rejoignez YITTE'}
      </h1>
      
      <div className="card">
        {/* Toggle Login / Signup */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <button 
            className="btn"
            style={{ color: !isLogin ? 'var(--primary)' : 'var(--text-muted)', fontWeight: !isLogin ? 'bold' : 'normal' }}
            onClick={() => setIsLogin(false)}
          >S'inscrire</button>
          <span style={{ color: 'var(--border-color)', padding: '0.5rem' }}>|</span>
          <button 
            className="btn"
            style={{ color: isLogin ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isLogin ? 'bold' : 'normal' }}
            onClick={() => setIsLogin(true)}
          >Se connecter</button>
        </div>

        {errorMsg && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(233, 64, 87, 0.1)', color: 'var(--domain-genai-color)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(233, 64, 87, 0.2)' }}>
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        {/* Role Selection (only for signup) */}
        {!isLogin && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              className={`btn ${role === 'client' ? 'btn-primary' : 'btn-outline'}`} 
              style={{ flex: 1 }}
              onClick={() => setRole('client')}
            >
              Je suis Client
            </button>
            <button 
              className={`btn ${role === 'freelancer' ? 'btn-primary' : 'btn-outline'}`} 
              style={{ flex: 1 }}
              onClick={() => setRole('freelancer')}
            >
              Je suis Prestataire
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <input type="text" name="fullName" className="form-input" placeholder="Ex: Marie Dupont" required={!isLogin} />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" placeholder="marie@example.com" required />
          </div>
          
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input type="password" name="password" className="form-input" required />
          </div>

          {!isLogin && role === 'freelancer' && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(59,130,246,0.05)', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Onboarding Rapide 🚀
              </h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                Pas de formulaire de 50 pages. Déposez simplement votre CV ou un PDF de vos réalisations.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)' }} onClick={() => document.getElementById('file-upload').click()}>
                {file ? (
                  <>
                    <FileCheck size={40} color="var(--status-success)" />
                    <span style={{ color: 'var(--text-main)' }}>{file.name} ajouté !</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={40} color="var(--text-muted)" />
                    <span style={{ color: 'var(--text-main)' }}>Cliquez pour uploader un fichier</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(PDF, JPG, PNG - Max 5MB)</span>
                  </>
                )}
                <input id="file-upload" type="file" style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>ou collez un lien vers votre portfolio / LinkedIn :</span>
                <input type="url" name="portfolioUrl" className="form-input" style={{ marginTop: '0.5rem' }} placeholder="https://" />
              </div>
            </div>
          )}

          {!isLogin && (
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ marginTop: '0.15rem' }}
                />
                <span>
                  J'accepte les{' '}
                  <Link to="/cgv" target="_blank" style={{ color: 'var(--primary)' }}>Conditions Générales de Vente et d'Utilisation</Link>.
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  style={{ marginTop: '0.15rem' }}
                />
                <span>
                  J'ai lu et j'accepte la{' '}
                  <Link to="/confidentialite" target="_blank" style={{ color: 'var(--primary)' }}>Politique de confidentialité (RGPD)</Link>,
                  et je consens au traitement de mes données personnelles.
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', opacity: (!isLogin && (!acceptedTerms || !acceptedPrivacy)) ? 0.5 : 1 }}
            disabled={loading || (!isLogin && (!acceptedTerms || !acceptedPrivacy))}
          >
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : `Créer mon compte ${role === 'freelancer' ? 'Prestataire' : 'Client'}`)}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
