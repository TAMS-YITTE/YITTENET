import React, { useState } from 'react';
import { UploadCloud, FileCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [role, setRole] = useState('freelancer');
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', maxWidth: '600px' }}>
        <CheckCircle2 size={80} color="var(--status-success)" style={{ margin: '0 auto 2rem' }} />
        <h1 style={{ marginBottom: '1rem' }}>Inscription réussie !</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
          Bienvenue sur YITTE. Votre profil est en cours de validation. Vous allez être redirigé vers votre tableau de bord...
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '600px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Rejoignez YITTE</h1>
      
      <div className="card">
        {/* Role Selection */}
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nom complet</label>
            <input type="text" className="form-input" placeholder="Ex: Marie Dupont" required />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="marie@example.com" required />
          </div>
          
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input type="password" className="form-input" required />
          </div>

          {role === 'freelancer' && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(59,130,246,0.05)', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Onboarding Rapide 🚀
              </h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                Pas de formulaire de 50 pages. Déposez simplement votre CV ou un PDF de vos réalisations (Portfolio) et nous nous chargeons de générer votre profil.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)' }} onClick={() => document.getElementById('file-upload').click()}>
                {file ? (
                  <>
                    <FileCheck size={40} color="var(--status-success)" />
                    <span style={{ color: 'white' }}>{file.name} ajouté !</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={40} color="var(--text-muted)" />
                    <span style={{ color: 'var(--text-main)' }}>Cliquez pour uploader un fichier</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(PDF, JPG, PNG - Max 5MB)</span>
                  </>
                )}
                <input id="file-upload" type="file" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>ou collez un lien vers votre portfolio / LinkedIn :</span>
                <input type="url" className="form-input" style={{ marginTop: '0.5rem' }} placeholder="https://" />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}>
            Créer mon compte {role === 'freelancer' ? 'Prestataire' : 'Client'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Ou connectez-vous avec</span>
            <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
