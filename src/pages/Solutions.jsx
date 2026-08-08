import React, { useState } from 'react';
import { Layers, ArrowUpRight, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';

/**
 * Vitrine des 6 produits SaaS vendables de l'écosystème Yitte.
 *
 * Chaque produit reste autonome sur son sous-domaine (compte, base, données) :
 * cette page ne fait que référencer et, quand un price_id Stripe est configuré,
 * ouvrir une caisse. Le bouton « Découvrir » est donc toujours un <a> externe,
 * jamais un <Link> react-router.
 *
 * Un produit sans VITE_STRIPE_PRICE_* configuré n'affiche pas de bouton
 * « S'abonner » : mieux vaut pas de caisse qu'une caisse cassée.
 */

const PRODUCTS = [
  {
    id: 'finanalyse',
    icon: '📊',
    name: 'Diagnostic Financier Automatisé',
    tagline: 'Analysez vos bilans en 2 min',
    description:
      "Importez un FEC ou une liasse CERFA et obtenez un rapport complet : soldes intermédiaires de gestion, 40 ratios bancaires, BFR et scoring crédit.",
    price: '49 €',
    period: '/mois',
    url: 'https://finanalyse.yitte.net',
    priceId: import.meta.env.VITE_STRIPE_PRICE_FINANALYSE,
    mode: 'subscription',
  },
  {
    id: 'audit',
    icon: '🔍',
    name: "Suite d'Audit Interne",
    tagline: 'Gérez vos missions de A à Z',
    description:
      "Planifiez vos missions, cotez les risques, suivez les plans d'action et générez des rapports d'audit exportables.",
    price: '79 €',
    period: '/mois',
    url: 'https://audit.yitte.net',
    priceId: import.meta.env.VITE_STRIPE_PRICE_AUDIT,
    mode: 'subscription',
  },
  {
    id: 'logistique',
    icon: '📦',
    name: 'Suite Logistique & Achats',
    tagline: 'Stocks, commandes, transport',
    description:
      "Achats, stock prédictif anti-rupture, scan de factures par IA et suivi de transport réunis dans une seule application.",
    price: '99 €',
    period: '/mois',
    url: 'https://logistique.yitte.net',
    priceId: import.meta.env.VITE_STRIPE_PRICE_LOGISTIQUE,
    mode: 'subscription',
  },
  {
    id: 'resto',
    icon: '🍽️',
    name: 'Site de Commande Marque Blanche',
    tagline: 'Votre resto en ligne en 1 jour',
    description:
      "Un site de commande et de livraison à votre marque : menu, panier, paiement CB et tableau de bord des commandes en direct.",
    price: '49 €',
    period: '/mois',
    url: 'https://restoparis.yitte.net',
    priceId: import.meta.env.VITE_STRIPE_PRICE_RESTO,
    mode: 'subscription',
  },
  {
    id: 'conciergerie',
    icon: '🏠',
    name: 'Plateforme Conciergerie Airbnb',
    tagline: 'Gérez vos locations courte durée',
    description:
      "Cinq portails en marque blanche : admin, propriétaire, planning ménage, livret voyageur et paramétrage de la marque.",
    price: '149 €',
    period: '/mois',
    url: 'https://conciergedirect.yitte.net',
    priceId: import.meta.env.VITE_STRIPE_PRICE_CONCIERGERIE,
    mode: 'subscription',
  },
  {
    id: 'finproject',
    icon: '⚡',
    name: 'Modèle Financier Projet EnR',
    tagline: 'Simulez un projet solaire/éolien sur 25 ans',
    description:
      "Production, revenus, service de la dette, DSCR et cash flows sur 25 ans. Export Excel et PDF utilisable en due diligence.",
    price: '499 €',
    period: '',
    url: 'https://finproject.yitte.net',
    priceId: import.meta.env.VITE_STRIPE_PRICE_FINPROJECT,
    // Paiement unique : pas d'abonnement, la caisse doit passer en mode 'payment'.
    mode: 'payment',
  },
];

const ProductCard = ({ product, onSubscribe, loading }) => {
  const canBuy = Boolean(product.priceId);
  const isOneShot = product.mode === 'payment';

  return (
    <div
      className="card"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', height: '100%' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <span style={{ fontSize: '2rem', lineHeight: 1 }} aria-hidden="true">{product.icon}</span>
        <span
          className="badge"
          style={{
            backgroundColor: 'rgba(59,130,246,0.1)',
            color: 'var(--primary)',
            fontSize: '0.7rem',
            whiteSpace: 'nowrap',
          }}
        >
          {isOneShot ? 'Paiement unique' : 'SaaS'}
        </span>
      </div>

      <div>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>{product.name}</h3>
        <div
          style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            color: 'var(--primary)',
          }}
        >
          {product.tagline}
        </div>
      </div>

      <p style={{ fontSize: '0.93rem', lineHeight: 1.6, color: 'var(--text-muted)', flex: 1, margin: 0 }}>
        {product.description}
      </p>

      <div
        style={{
          paddingTop: '0.9rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.9rem',
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.35rem' }}>
          {product.price}
          {product.period && (
            <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}>{product.period}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <a
            href={product.url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.9rem', flex: 1 }}
          >
            Découvrir <ArrowUpRight size={16} />
          </a>
          {canBuy && (
            <button
              type="button"
              onClick={() => onSubscribe(product)}
              disabled={loading}
              className="btn btn-primary"
              style={{
                padding: '0.6rem 1.1rem',
                fontSize: '0.9rem',
                flex: 1,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'wait' : 'pointer',
              }}
            >
              {loading ? 'Redirection…' : isOneShot ? 'Acheter' : "S'abonner"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Solutions = () => {
  const [loadingId, setLoadingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubscribe = async (product) => {
    setErrorMsg('');
    setLoadingId(product.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-saas-checkout', {
        body: {
          priceId: product.priceId,
          productId: product.id,
          productName: product.name,
          mode: product.mode,
          successUrl: `${product.url}/?welcome=true`,
          cancelUrl: `${window.location.origin}/solutions?checkout=cancelled`,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error('Impossible de créer la session de paiement.');
      window.location.href = data.url;
    } catch (err) {
      setErrorMsg(err.message || 'Erreur lors de la création de la session de paiement.');
      setLoadingId(null);
    }
  };

  return (
    <div>
      <SEO
        title="Nos solutions SaaS — YITTE"
        description="Six logiciels métier prêts à l'emploi : diagnostic financier, audit interne, logistique, commande en ligne, conciergerie et modélisation de projets EnR."
      />

      {/* En-tête */}
      <section style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '820px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={15} />
            {PRODUCTS.length} solutions professionnelles
          </div>

          <h1 style={{ marginBottom: '1rem' }}>Des outils prêts à l'emploi pour votre activité</h1>

          <p style={{ fontSize: '1.1rem', lineHeight: 1.65, color: 'var(--text-muted)' }}>
            Finance, audit, logistique, restauration, conciergerie, énergie. Chaque solution est
            autonome sur son propre domaine et se souscrit seule, sans engagement.
          </p>
        </div>
      </section>

      {/* Catalogue */}
      <section className="container" style={{ padding: '3.5rem 1.5rem' }}>
        {errorMsg && (
          <div
            style={{
              marginBottom: '2rem',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(233,64,87,0.08)',
              border: '1px solid rgba(233,64,87,0.25)',
              color: 'var(--domain-genai)',
              fontSize: '0.9rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
            alignItems: 'stretch',
          }}
        >
          {PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSubscribe={handleSubscribe}
              loading={loadingId === product.id}
            />
          ))}
        </div>
      </section>

      {/* CTA bas de page */}
      <section style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', padding: '3.5rem 0' }}>
        <div className="container" style={{ maxWidth: '680px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(59,130,246,0.1)',
              color: 'var(--primary)',
              marginBottom: '1.25rem',
            }}
          >
            <Layers size={26} />
          </div>
          <h2 style={{ marginBottom: '0.75rem' }}>Besoin sur mesure ?</h2>
          <p style={{ marginBottom: '1.75rem', color: 'var(--text-muted)' }}>
            Nous adaptons ces solutions à votre métier. Écrivez-nous pour un devis ou une
            démonstration privée.
          </p>
          <a
            href="mailto:contact@yitte.net?subject=Demande%20sur%20mesure"
            className="btn btn-primary"
            style={{ padding: '0.8rem 1.6rem' }}
          >
            Nous contacter <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Solutions;
