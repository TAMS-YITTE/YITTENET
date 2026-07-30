import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, ShieldCheck, FileDown, Lock, Star } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseStatus, setPurchaseStatus] = useState(null);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    fetchProductAndPurchaseStatus();
  }, [id, user]);

  const fetchProductAndPurchaseStatus = async () => {
    setLoading(true);
    setCheckingPurchase(true);
    try {
      // 1. Fetch Product
      const { data: prodData, error: prodError } = await supabase
        .from('digital_products')
        .select(`
          *,
          profiles:freelancer_id(full_name, domain, bio)
        `)
        .eq('id', id)
        .single();
        
      if (prodError) throw prodError;
      setProduct(prodData);

      // Avis publics sur le produit
      const { data: reviewsData } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false });
      setReviews(reviewsData || []);

      // 2. Fetch Purchase Status if user is logged in
      if (user) {
        const { data: purchData, error: purchError } = await supabase
          .from('purchases')
          .select('*')
          .eq('product_id', id)
          .eq('client_id', user.id)
          .eq('status', 'completed')
          .maybeSingle();
          
        if (purchError && purchError.code !== 'PGRST116') throw purchError;
        if (purchData) {
          setPurchaseStatus(purchData);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setCheckingPurchase(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      navigate('/signup');
      return;
    }
    if (profile?.role !== 'client') {
      alert("Seul un compte Client peut acheter des produits.");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke('create-product-checkout', {
        body: { productId: product.id }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création du paiement: " + err.message);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setSubmittingReview(true);
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: product.id,
          client_id: user.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') throw new Error('Vous avez déjà laissé un avis sur ce produit.');
        throw error;
      }
      setReviews((prev) => [data, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Chargement...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '4rem' }}>Produit introuvable.</div>;

  const isOwner = user && product.freelancer_id === user.id;
  const hasPurchased = purchaseStatus !== null;
  const canViewAsset = isOwner || hasPurchased;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;
  const alreadyReviewed = user && reviews.some((r) => r.client_id === user.id);
  const canReview = hasPurchased && !isOwner && !alreadyReviewed;

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Left Col: Details */}
        <div style={{ flex: '2 1 400px' }}>
          <span style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            color: 'var(--primary)', 
            padding: '0.3rem 0.8rem', 
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            display: 'inline-block'
          }}>
            {product.category}
          </span>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{product.title}</h1>
          {avgRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#F59E0B', fontSize: '0.95rem', marginBottom: '1rem' }}>
              <Star size={16} fill="#F59E0B" /> {avgRating}
              <span style={{ color: 'var(--text-muted)' }}>({reviews.length} avis)</span>
            </div>
          )}
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
            {product.description}
          </p>

          <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Créé par {product.profiles?.full_name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{product.profiles?.bio || "Expert YITTE"}</p>
          </div>
        </div>

        {/* Right Col: Checkout / Asset */}
        <div style={{ flex: '1 1 300px' }}>
          <div className="card" style={{ position: 'sticky', top: '100px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10B981', textAlign: 'center', marginBottom: '1.5rem' }}>
              {product.price} €
            </div>

            {canViewAsset ? (
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
                <ShieldCheck size={32} color="#10B981" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: '#065F46', marginBottom: '1rem' }}>Produit Débloqué</h3>
                <a 
                  href={product.asset_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
                >
                  <FileDown size={18} /> Accéder au fichier
                </a>
              </div>
            ) : (
              <div>
                <button 
                  onClick={handlePurchase}
                  className="btn btn-primary" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '1rem' }}
                >
                  <ShoppingCart size={20} /> Acheter maintenant
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Lock size={14} /> Paiement direct sécurisé (pas de séquestre)
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Avis produit */}
      <div className="card" style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Avis clients</h2>

        {canReview && (
          <form onSubmit={handleSubmitReview} style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Vous avez acheté ce produit — laissez votre avis :</p>
            {reviewError && (
              <div style={{ color: 'var(--domain-genai-color)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{reviewError}</div>
            )}
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  title={`${n} étoile${n > 1 ? 's' : ''}`}
                >
                  <Star size={26} color="#F59E0B" fill={n <= reviewForm.rating ? '#F59E0B' : 'none'} />
                </button>
              ))}
            </div>
            <textarea
              className="form-input"
              rows="3"
              placeholder="Votre commentaire (optionnel)…"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              style={{ marginBottom: '0.75rem' }}
            />
            <button type="submit" className="btn btn-primary" disabled={submittingReview}>
              {submittingReview ? 'Envoi…' : 'Publier mon avis'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Aucun avis pour le moment.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {reviews.map((review, i) => (
              <div key={review.id} style={{ borderBottom: i < reviews.length - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', marginBottom: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={14} color="#F59E0B" fill={n <= review.rating ? '#F59E0B' : 'none'} />
                  ))}
                </div>
                {review.comment && <p style={{ fontSize: '0.9rem', margin: 0 }}>"{review.comment}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
