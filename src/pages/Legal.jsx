import React from 'react';
import { AlertTriangle } from 'lucide-react';

// Coordonnées légales de l'éditeur (données publiques du registre du commerce).
const COMPANY = {
  name: 'YITTE',
  form: 'SARL',
  siren: '919 805 028',
  siret: '919 805 028 00017',
  ape: '62.02A',
  address: '65 B rue Alexandre Bickart, 77500 Chelles, France',
  created: '03/10/2022',
  contact: 'contact@yitte.net',
};

const wrap = { maxWidth: '800px' };
const h2 = { marginTop: '2.5rem', marginBottom: '1rem', color: 'var(--text-main)' };
const p = { color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' };

// Bandeau d'avertissement : ces textes sont une TRAME et doivent être validés
// par un professionnel du droit avant toute mise en production réelle.
const DraftBanner = () => (
  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '1rem 1.25rem', backgroundColor: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.4)', borderRadius: '8px', marginBottom: '2.5rem' }}>
    <AlertTriangle size={20} color="#B45309" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
    <div style={{ fontSize: '0.85rem', color: '#92400E' }}>
      <strong>Trame à faire valider par un juriste.</strong> Ce document est un modèle de départ
      généré pour le prototype YITTE. Il n'a pas de valeur juridique définitive tant qu'il n'a
      pas été relu et adapté par un professionnel du droit.
    </div>
  </div>
);

const LegalNotice = () => (
  <>
    <h2 style={{ ...h2, marginTop: 0 }}>Éditeur du site</h2>
    <p style={p}>
      Le site YITTE (Your IT TEam) est édité par la société <strong>{COMPANY.name}</strong>, {COMPANY.form}{' '}
      immatriculée au Registre du Commerce et des Sociétés.
    </p>
    <ul style={{ ...p, listStyle: 'disc', paddingLeft: '1.5rem' }}>
      <li>Dénomination sociale : {COMPANY.name}</li>
      <li>Forme juridique : {COMPANY.form}</li>
      <li>SIREN : {COMPANY.siren}</li>
      <li>SIRET (siège) : {COMPANY.siret}</li>
      <li>Code APE : {COMPANY.ape}</li>
      <li>Siège social : {COMPANY.address}</li>
      <li>Date de création : {COMPANY.created}</li>
      <li>Contact : {COMPANY.contact}</li>
    </ul>
    <h2 style={h2}>Hébergement</h2>
    <p style={p}>
      Le site est hébergé par ses prestataires d'infrastructure (notamment Vercel Inc. pour le
      front-end et Supabase pour la base de données et l'authentification). Les coordonnées
      complètes des hébergeurs sont disponibles sur demande à {COMPANY.contact}.
    </p>
    <h2 style={h2}>Propriété intellectuelle</h2>
    <p style={p}>
      L'ensemble des éléments du site (marque, logo, textes, interface) est protégé par le droit
      de la propriété intellectuelle. Toute reproduction sans autorisation est interdite.
    </p>
  </>
);

const Terms = () => (
  <>
    <h2 style={{ ...h2, marginTop: 0 }}>1. Objet</h2>
    <p style={p}>
      Les présentes Conditions Générales de Vente et d'Utilisation (CGV/CGU) régissent l'accès et
      l'utilisation de la plateforme YITTE, marketplace mettant en relation des clients et des
      prestataires indépendants dans les domaines Web3, IA Générative et No-Code.
    </p>
    <h2 style={h2}>2. Rôle de la plateforme</h2>
    <p style={p}>
      YITTE agit en qualité d'intermédiaire technique. La plateforme n'est pas partie aux contrats
      de prestation conclus entre clients et prestataires, mais fournit un service de séquestre
      (dépôt des fonds) sécurisant le paiement jusqu'à la validation de la livraison.
    </p>
    <h2 style={h2}>3. Paiement et séquestre</h2>
    <p style={p}>
      Les paiements sont traités via notre prestataire Stripe. Les fonds d'une mission sont bloqués
      en séquestre puis libérés au prestataire après validation de la livraison par le client. Les
      commissions éventuelles de la plateforme sont indiquées avant toute transaction.
    </p>
    <h2 style={h2}>4. Droit de rétractation</h2>
    <p style={p}>
      Conformément au Code de la consommation, le consommateur dispose en principe d'un délai de
      rétractation de 14 jours. Pour les prestations de services numériques dont l'exécution a
      commencé avec l'accord exprès du client, ce droit peut ne pas s'appliquer. Les modalités
      précises doivent être détaillées ici après validation juridique.
    </p>
    <h2 style={h2}>5. Obligations des utilisateurs</h2>
    <p style={p}>
      Chaque utilisateur s'engage à fournir des informations exactes, à respecter la législation en
      vigueur et à ne pas détourner la plateforme de son objet (fraude, contournement du séquestre,
      contenus illicites).
    </p>
    <h2 style={h2}>6. Responsabilité</h2>
    <p style={p}>
      La responsabilité de YITTE est limitée à la fourniture du service d'intermédiation et de
      séquestre. La qualité des prestations relève de la responsabilité des prestataires.
    </p>
    <h2 style={h2}>7. Droit applicable</h2>
    <p style={p}>
      Les présentes CGV/CGU sont soumises au droit français. Tout litige relève des tribunaux
      compétents, sous réserve des dispositions protectrices du consommateur.
    </p>
  </>
);

const Privacy = () => (
  <>
    <h2 style={{ ...h2, marginTop: 0 }}>1. Responsable du traitement</h2>
    <p style={p}>
      Le responsable du traitement des données personnelles collectées sur YITTE est la société
      {' '}{COMPANY.name} ({COMPANY.siret}), {COMPANY.address}. Contact : {COMPANY.contact}.
    </p>
    <h2 style={h2}>2. Données collectées</h2>
    <p style={p}>
      Nous collectons : identité (nom, email), rôle (client/prestataire), données de profil
      (portfolio, CV), contenus échangés (messagerie, propositions) et données de transaction
      nécessaires au séquestre. Les données de paiement sont traitées directement par Stripe et ne
      transitent pas en clair par nos serveurs.
    </p>
    <h2 style={h2}>3. Finalités et base légale</h2>
    <p style={p}>
      Les données sont traitées pour l'exécution du service (base contractuelle), le respect de nos
      obligations légales, et avec votre consentement pour les traitements optionnels. Le
      consentement recueilli à l'inscription est horodaté et conservé.
    </p>
    <h2 style={h2}>4. Durée de conservation</h2>
    <p style={p}>
      Les données sont conservées le temps de la relation contractuelle, puis archivées selon les
      durées légales applicables (notamment comptables et fiscales).
    </p>
    <h2 style={h2}>5. Vos droits (RGPD)</h2>
    <p style={p}>
      Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition
      et de portabilité de vos données. Vous pouvez les exercer à tout moment en écrivant à
      {' '}{COMPANY.contact}. Vous pouvez également introduire une réclamation auprès de la CNIL
      (www.cnil.fr).
    </p>
    <h2 style={h2}>6. Sous-traitants</h2>
    <p style={p}>
      Nous faisons appel à des sous-traitants (Supabase pour l'hébergement des données, Stripe pour
      les paiements) présentant des garanties conformes au RGPD.
    </p>
    <h2 style={h2}>7. Cookies</h2>
    <p style={p}>
      Le site utilise les cookies strictement nécessaires à son fonctionnement (authentification).
      En cas d'ajout d'outils de mesure d'audience, un bandeau de consentement dédié sera mis en
      place.
    </p>
  </>
);

const DOCS = {
  legal: { title: 'Mentions légales', Component: LegalNotice },
  cgv: { title: 'Conditions Générales de Vente et d\'Utilisation', Component: Terms },
  privacy: { title: 'Politique de confidentialité', Component: Privacy },
};

const Legal = ({ doc }) => {
  const entry = DOCS[doc] || DOCS.legal;
  const { title, Component } = entry;

  return (
    <div className="container" style={{ padding: '4rem 0', ...wrap }}>
      <h1 style={{ marginBottom: '2rem' }}>{title}</h1>
      <DraftBanner />
      <Component />
      <p style={{ ...p, marginTop: '3rem', fontSize: '0.8rem' }}>
        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}.
      </p>
    </div>
  );
};

export default Legal;
