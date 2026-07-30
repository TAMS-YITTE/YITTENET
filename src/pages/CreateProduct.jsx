import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, Link as LinkIcon, DollarSign } from 'lucide-react';

const CreateProduct = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    file_url: '',
    cover_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirection de sécurité
  if (!user || profile?.role !== 'freelancer') {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Accès refusé</h2>
        <p style={{ color: 'var(--text-muted)' }}>Seuls les freelances peuvent créer des produits.</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Retour</button>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const priceInt = parseInt(formData.price, 10);
      if (isNaN(priceInt) || priceInt <= 0) {
        throw new Error("Le prix doit être un nombre positif.");
      }

      const { data, error: insertError } = await supabase
        .from('digital_products')
        .insert({
          freelancer_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: priceInt,
          file_url: formData.file_url || null,
          cover_url: formData.cover_url || null
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      // Succès
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <ShoppingBag size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Mettre en vente un service</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Créez un "produit sur étagère" (ex: Audit express, Script prêt à l'emploi) que les clients pourront acheter immédiatement sans passer par un devis.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label className="form-label" style={{ fontWeight: 'bold' }}>Titre du service / produit *</label>
            <input 
              type="text" 
              name="title"
              className="form-input" 
              placeholder="Ex: Audit de sécurité de votre Smart Contract ERC20"
              required 
              minLength={3}
              maxLength={200}
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Catégorie *</label>
              <select name="category" className="form-input" required value={formData.category} onChange={handleChange}>
                <option value="">Sélectionner une catégorie...</option>
                <option value="web3">Web3 & Crypto</option>
                <option value="genai">IA Générative</option>
                <option value="nocode">No-Code & Scripts</option>
                <option value="legaltech">LegalTech</option>
              </select>
            </div>
            
            <div>
              <label className="form-label" style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Prix de vente <DollarSign size={16} /> *
              </label>
              <input 
                type="number" 
                name="price"
                className="form-input" 
                placeholder="Ex: 500"
                min="1"
                required 
                value={formData.price}
                onChange={handleChange}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Le client paiera ce montant en une fois.</span>
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 'bold' }}>Description complète *</label>
            <textarea 
              name="description"
              className="form-input" 
              rows="6"
              placeholder="Détaillez ce que le client obtiendra pour ce prix, vos délais, et votre méthode..."
              required
              minLength={10}
              maxLength={5000}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LinkIcon size={16} /> Lien du Livrable (Privé)
            </label>
            <input 
              type="url" 
              name="file_url"
              className="form-input" 
              placeholder="Ex: https://drive.google.com/..."
              value={formData.file_url}
              onChange={handleChange}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ce lien sera révélé uniquement aux acheteurs après paiement.</span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 2rem' }}>
              {loading ? 'Création...' : 'Mettre en vente'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
