import React, { useState } from 'react';
import { UploadCloud, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Signup = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [role, setRole] = useState('freelancer');
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
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
        // SIGNUP FLOW
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          let cvUrl = null;

          // Upload File if any (for freelancers)
          if (role === 'freelancer' && file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${authData.user.id}-${Math.random()}.${fileExt}`;
            const { error: uploadError, data } = await supabase.storage
              .from('resumes')
              .upload(fileName, file);
              
            if (!uploadError && data) {
              const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(data.path);
              cvUrl = urlData.publicUrl;
            }
          }

          // Create Profile
          const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            role,
            full_name: fullName,
            portfolio_url: portfolioUrl || null,
            cv_url: cvUrl
          });

          if (profileError) throw profileError;

          setSubmitted(true);
          setTimeout(() => navigate('/dashboard'), 2000);
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
          Bienvenue sur YITTE. Vous allez être redirigé vers votre tableau de bord...
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }} disabled={loading}>
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : `Créer mon compte ${role === 'freelancer' ? 'Prestataire' : 'Client'}`)}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
