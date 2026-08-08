import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShoppingBag, User } from 'lucide-react';
import SEO from '../components/SEO';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('digital_products')
        .select(`
          *,
          profiles:freelancer_id(full_name, domain)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('category', filter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      const fallbackProducts = [
        {
          id: 'medl-smart-contract',
          category: 'web3',
          title: 'Smart Contract MEDL (Code Source)',
          description: 'Smart contract identique à celui en production, certifié et audité. Idéal pour lancer votre marketplace ou plateforme de leasing. (Réf: C:\\Users\\hp\\MedLease_Production)',
          price: 750,
          profiles: { full_name: 'Yitte Expert' }
        },
        {
          id: 'template-chatbot',
          category: 'nocode',
          title: 'Template ChatbotEmbed',
          description: 'Template complet prêt à l\'emploi pour intégrer un chatbot IA sur mesure sur n\'importe quel site web. Configuration ultra-rapide.',
          price: 49,
          profiles: { full_name: 'Yitte Expert' }
        },
        {
          id: 'template-resume',
          category: 'nocode',
          title: 'Template ResumeScanner',
          description: 'Outil complet d\'analyse de CV boosté par l\'IA. Automatisez le tri des candidatures. Code source et interface inclus.',
          price: 89,
          profiles: { full_name: 'Yitte Expert' }
        }
      ];

      // On applique le filtre localement si on utilise le fallback
      const finalProducts = (data && data.length > 0) ? data : fallbackProducts;
      const filteredFinal = filter === 'all' ? finalProducts : finalProducts.filter(p => p.category === filter);
      
      setProducts(filteredFinal);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'Tous les produits' },
    { id: 'web3', label: 'Web3 & Crypto' },
    { id: 'genai', label: 'IA Générative' },
    { id: 'nocode', label: 'No-Code & Scripts' },
    { id: 'legaltech', label: 'LegalTech' }
  ];

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <SEO 
        title="Boutique de Produits Digitaux — YITTENET" 
        description="Achetez des templates, plugins, scripts et formations créés par les meilleurs experts de la communauté YITTENET."
      />
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Boutique YITTE</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Découvrez des outils, templates et smart contracts prêts à l'emploi créés par les meilleurs experts de la plateforme.
        </p>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '30px',
              border: filter === cat.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              backgroundColor: filter === cat.id ? 'var(--primary)' : 'transparent',
              color: filter === cat.id ? 'white' : 'var(--text-main)',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Chargement de la boutique...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'var(--bg-card)', borderRadius: '12px' }}>
          <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>Aucun produit trouvé</h3>
          <p style={{ color: 'var(--text-muted)' }}>Il n'y a pas encore de produits dans cette catégorie.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {products.map((product) => (
            <Link 
              to={`/product/${product.id}`} 
              key={product.id}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span style={{ 
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                    color: 'var(--primary)', 
                    padding: '0.3rem 0.8rem', 
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {product.category}
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10B981' }}>
                    {product.price} €
                  </span>
                </div>
                
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', lineHeight: '1.4' }}>{product.title}</h3>
                
                <p style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '0.9rem', 
                  marginBottom: '1.5rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  flexGrow: 1
                }}>
                  {product.description}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <User size={16} />
                  <span>Créé par <strong>{product.profiles?.full_name}</strong></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;

