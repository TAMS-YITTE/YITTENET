import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { generateJobBrief } from '../lib/ai';
import { Wand2 } from 'lucide-react';

const PostJob = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    domain: 'web3',
    description: '',
    budget: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiMetadata, setAiMetadata] = useState(null);
  const [clientApproved, setClientApproved] = useState(false);

  const { user, profile } = useAuth();

  useEffect(() => {
    const domain = searchParams.get('domain');
    const jobTitle = searchParams.get('jobTitle');
    
    if (domain || jobTitle) {
      setFormData(prev => ({
        ...prev,
        domain: domain || prev.domain,
        title: jobTitle || prev.title
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || profile?.role !== 'client') {
      setErrorMsg("Vous devez être connecté en tant que Client pour publier un besoin.");
      setTimeout(() => navigate('/signup'), 3000);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.from('jobs').insert({
        client_id: user.id,
        title: formData.title,
        domain: formData.domain,
        description: formData.description,
        budget: parseInt(formData.budget, 10),
        deadline: formData.deadline,
        status: 'open'
      }).select().single();

      if (error) throw error;

      // Redirect to matches view instead of checkout
      navigate(`/job-matches/${data.id}`, { state: { matchCriteria: aiMetadata?.match_criteria } });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleGenerateAi = async () => {
    if (!aiPrompt.trim()) return;
    setGeneratingAi(true);
    setAiMetadata(null);
    setClientApproved(false);
    try {
      const generatedData = await generateJobBrief(aiPrompt);
      setFormData(prev => ({
        ...prev,
        description: generatedData.brief
      }));
      setAiMetadata(generatedData.metadata);
    } catch (err) {
      setErrorMsg("L'assistant IA a rencontré une erreur. Veuillez réessayer.");
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '2rem' }}>Publier un besoin</h1>
      
      {/* AI Assistant Block */}
      <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid var(--primary)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>
          <Wand2 size={20} /> Assistant IA de Rédaction
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Vous ne savez pas comment rédiger votre cahier des charges ? Décrivez simplement votre idée en une phrase et notre IA fera le reste.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <textarea 
            className="form-input" 
            placeholder="Ex: Je veux créer une marketplace de location de matériel avec paiement crypto..." 
            rows="2"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          ></textarea>
          <button 
            type="button" 
            onClick={handleGenerateAi}
            className="btn btn-outline" 
            style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            disabled={generatingAi || !aiPrompt.trim()}
          >
            {generatingAi ? 'Génération en cours...' : 'Générer le cahier des charges'}
          </button>
        </div>
      </div>

      {aiMetadata && aiMetadata.incoherence_detected && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #F87171', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <strong>⚠️ Attention :</strong> L'IA a détecté une incohérence potentielle dans votre brief (ex: budget insuffisant). Veuillez vérifier la section "Points d'attention" ci-dessous.
        </div>
      )}

      {aiMetadata && aiMetadata.needs_client_review && (
        <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #4ADE80', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#166534' }}>✅ Validation requise avant publication</h4>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            {aiMetadata.review_points && aiMetadata.review_points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
            <input 
              type="checkbox" 
              checked={clientApproved} 
              onChange={(e) => setClientApproved(e.target.checked)} 
              style={{ width: '18px', height: '18px', accentColor: '#166534' }}
            />
            J'ai relu le cahier des charges généré par l'IA et j'approuve son contenu.
          </label>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(233, 64, 87, 0.1)', color: 'var(--domain-genai-color)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(233, 64, 87, 0.2)' }}>
          {errorMsg}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Titre du besoin</label>
            <input 
              type="text" 
              name="title"
              className="form-input" 
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Création d'un smart contract de staking"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Domaine d'expertise</label>
            <select name="domain" className="form-select" value={formData.domain} onChange={handleChange} required>
              <option value="web3">Web3 & Blockchain</option>
              <option value="genai">IA Générative</option>
              <option value="nocode">No-Code & Automatisation</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description détaillée</label>
            <textarea 
              name="description"
              className="form-textarea" 
              rows="6"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez précisément ce que vous attendez du prestataire..."
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Budget estimé (€)</label>
              <input 
                type="number" 
                name="budget"
                className="form-input" 
                value={formData.budget}
                onChange={handleChange}
                placeholder="2500"
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Délai souhaité</label>
              <input 
                type="date" 
                name="deadline"
                className="form-input" 
                value={formData.deadline}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>
              <strong>Info :</strong> En publiant ce besoin, vous ne payez rien. Le paiement ne sera demandé (et mis en séquestre) qu'une fois que vous aurez sélectionné un prestataire et validé son devis.
            </p>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '2rem', width: '100%' }} disabled={loading || (aiMetadata?.needs_client_review && !clientApproved)}>
            {loading ? 'Publication en cours...' : 'Publier la mission'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
