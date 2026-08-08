import React, { useState } from 'react';
import SaasProductCard, { SaasProduct } from '../components/SaasProductCard';
import { supabase } from '../lib/supabaseClient';
import { Layers, Sparkles, ArrowUpRight } from 'lucide-react';
import SEO from '../components/SEO';

// ── Catalogue des 6 produits SaaS ────────────────────────
const SAAS_PRODUCTS: SaasProduct[] = [
  {
    id: 'finanalyse',
    name: 'Diagnostic Financier Automatisé',
    tagline: 'Analysez vos bilans en 2 minutes',
    description: 'Importez un FEC ou une liasse CERFA PDF et obtenez un rapport complet avec 40 ratios bancaires, SIG, CAF, BFR et scoring crédit.',
    features: [
      'Import FEC (.csv/.txt) ou CERFA PDF',
      '40 ratios bancaires (autonomie, gearing, DSO, DPO…)',
      'Comparaison sur 3 exercices (N-2, N-1, N)',
      'Vues CERFA 2050-2053 détaillées',
      'Export PDF professionnel',
      'Historique des analyses sauvegardé',
    ],
    price: 49,
    setupFee: 0,
    priceId: import.meta.env.VITE_STRIPE_PRICE_FINANALYSE || 'price_finanalyse_49eur',
    url: import.meta.env.VITE_FINANALYSE_URL || 'https://finanalyse.yitte.net',
    icon: '📊',
    category: 'finance',
  },
  {
    id: 'audit',
    name: 'Suite d\'Audit Interne',
    tagline: 'Gérez vos missions de A à Z',
    description: 'Planifiez des missions, détectez des findings, suivez les recommandations et générez des rapports d\'audit professionnels.',
    features: [
      'Dashboard exécutif avec KPIs',
      'Gestion des missions (Planned → Closed)',
      'Scoring de risque (impact × probabilité)',
      'Plans d\'action avec suivi de progression',
      'Timeline visuelle des jalons',
      'Rapports d\'audit exportables',
    ],
    price: 79,
    setupFee: 199,
    priceId: import.meta.env.VITE_STRIPE_PRICE_AUDIT || 'price_audit_79eur',
    url: import.meta.env.VITE_AUDIT_URL || 'https://audit.yitte.net',
    icon: '🔍',
    category: 'audit',
  },
  {
    id: 'logistique',
    name: 'Suite Logistique & Achats',
    tagline: 'Stocks, commandes, transport — tout au même endroit',
    description: 'Gérez vos achats, stocks, livraisons et coûts logistiques avec des modules prédictifs et du scan de factures IA.',
    features: [
      'Gestion des commandes et stocks',
      'Stock prédictif / anti-rupture (ML)',
      'Scan de factures PDF par IA',
      'Suivi de transport (Planned → Delivered)',
      'Analyse OPEX et benchmark marché',
      '13 modules opérationnels unifiés',
    ],
    price: 99,
    setupFee: 299,
    priceId: import.meta.env.VITE_STRIPE_PRICE_LOGISTIQUE || 'price_logistique_99eur',
    url: import.meta.env.VITE_LOGISTIQUE_URL || 'https://logistique.yitte.net',
    icon: '📦',
    category: 'logistique',
  },
  {
    id: 'resto',
    name: 'Site de Commande Marque Blanche',
    tagline: 'Votre resto en ligne en 1 jour',
    description: 'Créez un site de commande et livraison à votre marque pour votre restaurant. Menu, panier, paiement Stripe — tout intégré.',
    features: [
      'Site personnalisable (logo, couleurs, domaine)',
      'Menu CRUD illimité',
      'Paiement en ligne (CB, Apple Pay)',
      'Dashboard de gestion des commandes en direct',
      'Click & Collect + livraison',
      'Annuaire RestoParis inclus',
    ],
    price: 49,
    setupFee: 399,
    priceId: import.meta.env.VITE_STRIPE_PRICE_RESTO || 'price_resto_49eur',
    url: import.meta.env.VITE_RESTO_URL || 'https://restoparis.yitte.net',
    icon: '🍽️',
    category: 'food',
  },
  {
    id: 'conciergerie',
    name: 'Plateforme Conciergerie Airbnb',
    tagline: 'Gérez vos locations courte durée comme un pro',
    description: '5 portails en marque blanche : admin conciergerie, portail propriétaire, planning ménage, livret voyageur et paramétrage marque.',
    features: [
      'Portail Admin : CA, marges, prestations',
      'Portail Propriétaire : revenus, commissions, relevés',
      'Planning Ménage : checklists, photos de preuve',
      'Livret Voyageur : Wi-Fi, check-in, bonnes adresses',
      'White-label : marque, couleurs, sous-domaine',
      'Export PDF des relevés mensuels',
    ],
    price: 149,
    setupFee: 499,
    priceId: import.meta.env.VITE_STRIPE_PRICE_CONCIERGERIE || 'price_conciergerie_149eur',
    url: import.meta.env.VITE_CONCIERGERIE_URL || 'https://conciergedirect.yitte.net',
    icon: '🏠',
    category: 'proptech',
  },
  {
    id: 'finproject',
    name: 'Modèle Financier Projet EnR',
    tagline: 'Simulez votre projet solaire ou éolien sur 25 ans',
    description: 'Modèle financier professionnel pour projets EnR : production, revenus, charges, service de la dette, cash flows. Export Excel + PDF.',
    features: [
      'Projection 25 ans (solaire ou éolien)',
      'Calcul PMT, EBITDA, Cash Flow Net',
      'Simulation dégradation et inflation',
      'KPIs : revenus totaux, dette, cash flows',
      'Export Excel + PDF exécutif',
      'Utilisable en due diligence bancaire',
    ],
    price: 499,
    setupFee: 0,
    priceId: import.meta.env.VITE_STRIPE_PRICE_FINPROJECT || 'price_finproject_499eur',
    url: import.meta.env.VITE_FINPROJECT_URL || 'https://finproject.yitte.net',
    icon: '⚡',
    category: 'energie',
  },
];

const SaasCatalog: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (product: SaasProduct) => {
    setLoading(product.id);
    try {
      // Appeler l'Edge Function Supabase pour créer le checkout Stripe
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: {
          priceId: product.priceId,
          productId: product.id,
          productName: product.name,
          successUrl: `${product.url}/?welcome=true`,
          cancelUrl: `${window.location.origin}/saas`,
        },
      });

      if (error) throw error;

      // Rediriger vers Stripe Checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert('Erreur : impossible de créer la session de paiement.');
      }
    } catch (err: any) {
      console.error('Subscribe error:', err);
      alert(`Erreur lors de l'abonnement : ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="saas-catalog-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <SEO 
        title="Catalogue SaaS B2B — YITTENET" 
        description="Découvrez et souscrivez à des solutions SaaS professionnelles exclusives créées par les experts de YITTENET."
      />
      {/* ── EN-TÊTE ───────────────────────── */}
      <div className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/30 border border-blue-500/30 rounded-full text-blue-300 text-sm font-bold mb-6">
            <Sparkles size={16} />
            Solutions SaaS pour professionnels
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Des outils puissants pour votre business
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Finance, audit, logistique, restauration, conciergerie — choisissez le module qui correspond à votre activité. Abonnement mensuel, sans engagement.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SAAS_PRODUCTS.map((product) => (
            <SaasProductCard
              key={product.id}
              product={product}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-white rounded-2xl shadow-lg border border-slate-200 p-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
            <Layers size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Besoin d'une solution sur mesure ?
          </h2>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            Nous adaptons nos produits à vos besoins spécifiques. Contactez-nous pour un devis personnalisé ou une démonstration privée.
          </p>
          <a
            href="mailto:contact@yitte.net"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
          >
            Nous contacter
            <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SaasCatalog;