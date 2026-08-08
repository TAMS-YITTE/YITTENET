import React from 'react';
import { ArrowUpRight, ShieldCheck, Layers, Server, Clock } from 'lucide-react';

/**
 * Vitrine SaaS — catalogue des logiciels métier de l'écosystème Yitte.
 *
 * PRINCIPE DE DÉCENTRALISATION (tranché le 06/08/2026) :
 * cette page ne fait que LISTER et POINTER. Pas de SSO, pas de base commune,
 * pas de tableau de bord centralisé, pas de tunnel de paiement ici. Chaque
 * produit vit sur son sous-domaine, avec son propre compte et son propre
 * Stripe — c'est ce qui permet de vendre un produit seul sans démêler ses
 * données d'un hub.
 *
 * Conséquence directe : les boutons sont des <a> externes, jamais des <Link>
 * react-router.
 */

/**
 * `statut` gouverne l'affichage du bouton :
 *   'en_ligne' → lien réel vers le sous-domaine
 *   'bientot'  → bouton inactif « Bientôt disponible »
 *
 * ⚠️ Ne passer un produit à 'en_ligne' QUE lorsque son sous-domaine répond
 * réellement. Un bouton qui mène à un domaine non déployé est une promesse
 * non tenue affichée à un prospect.
 */
const PRODUITS = [
  {
    id: 'finanalyse',
    nom: 'FinAnalyse by Yitte',
    cible: 'Experts-comptables, analystes crédit, dirigeants',
    douleur: "Lire un bilan en quelques minutes plutôt qu'en une demi-journée. Import d'un FEC ou d'une liasse CERFA, soldes intermédiaires de gestion, retraitements crédit-bail et ratios bancaires.",
    prix: 'À partir de 49 €/mois',
    url: 'https://finanalyse.yitte.net',
    statut: 'en_ligne',
    teteDeGondole: true,
  },
  {
    id: 'finproject',
    nom: 'FinProject by Yitte',
    cible: 'Développeurs de projets EnR, financeurs',
    douleur: "Modéliser un projet solaire ou éolien sur 25 ans et le présenter en due diligence : service de la dette, DSCR, LLCR, TRI projet et TRI fonds propres.",
    prix: '499 € par projet',
    url: 'https://finproject.yitte.net',
    statut: 'en_ligne',
    teteDeGondole: true,
  },
  {
    id: 'audit',
    nom: 'Audit by Yitte',
    cible: 'Directions d\'audit interne et de contrôle',
    douleur: "Piloter des missions de bout en bout : constats, cotation du risque, plans d'action et suivi des recommandations, sans repartir d'un classeur à chaque mission.",
    prix: 'À partir de 79 €/mois',
    url: 'https://audit.yitte.net',
    statut: 'en_ligne',
    teteDeGondole: true,
  },
  {
    id: 'property',
    nom: 'Property by Yitte',
    cible: 'Diaspora et propriétaires bailleurs',
    douleur: "Savoir si le loyer a été encaissé quand le bien est à Dakar et vous à Paris. Quittances, photos horodatées et reporting mensuel.",
    prix: 'À partir de 59 €/mois',
    url: 'https://property.yitte.net',
    statut: 'bientot',
  },
  {
    id: 'transit',
    nom: 'Transit by Yitte',
    cible: 'Commissionnaires en douane agréés',
    douleur: "Suivre chaque dossier de transit sur les corridors CEDEAO et être alerté avant l'immobilisation, l'échéance de garantie ou les surestaries.",
    prix: 'À partir de 59 €/mois',
    url: 'https://transit.yitte.net',
    statut: 'bientot',
  },
  {
    id: 'tec',
    nom: 'Calculateur TEC',
    cible: 'Transitaires et importateurs',
    douleur: "Estimer les droits de douane, la TVA et les prélèvements communautaires avant l'arrivée de la marchandise. Sans compte, gratuit.",
    prix: 'Gratuit',
    url: 'https://transit.yitte.net/calculateur',
    statut: 'bientot',
    gratuit: true,
  },
  {
    id: 'officine',
    nom: 'Officine by Yitte',
    cible: 'Pharmacies et dépôts',
    douleur: "Chiffrer ce que vous jetez. Stock tenu lot par lot, alertes de péremption à 90, 60 et 30 jours, tour de garde et marge par référence.",
    prix: 'À partir de 59 €/mois',
    url: 'https://officine.yitte.net',
    statut: 'bientot',
  },
  {
    id: 'gardiennage',
    nom: 'Gardiennage by Yitte',
    cible: 'Sociétés de sécurité privée',
    douleur: "Prouver qu'un agent était bien à son poste. Pointage géolocalisé qui fonctionne hors-ligne, rondes scannées par QR et rapports d'incident.",
    prix: 'À partir de 49 €/mois',
    url: 'https://garde.yitte.net',
    statut: 'bientot',
  },
  {
    id: 'cabinet',
    nom: 'Cabinet by Yitte',
    cible: 'Avocats, notaires et huissiers',
    douleur: "Ne plus rater une échéance de procédure, et facturer le temps réellement passé. Dossiers, actes depuis modèles, relance des impayés.",
    prix: 'À partir de 49 €/mois',
    url: 'https://cabinet.yitte.net',
    statut: 'bientot',
  },
  {
    id: 'campus',
    nom: 'Campus by Yitte',
    cible: 'Écoles et établissements privés',
    douleur: "Recouvrer les frais de scolarité sans y passer ses journées. Échéancier par élève, relance WhatsApp aux tuteurs, bulletins PDF.",
    prix: 'À partir de 25 €/mois',
    url: 'https://campus.yitte.net',
    statut: 'bientot',
  },
  {
    id: 'cuisine',
    nom: 'Cuisine by Yitte',
    cible: 'Restaurants et établissements alimentaires',
    douleur: "Tenir son plan de maîtrise sanitaire autrement qu'au classeur papier, et savoir ce que chaque plat coûte réellement.",
    prix: 'À partir de 49 €/mois',
    url: 'https://cuisine.yitte.net',
    statut: 'bientot',
  },
  {
    id: 'groupage',
    nom: 'Groupage by Yitte',
    cible: 'Groupeurs de fret et expéditeurs',
    douleur: "Arrêter de répondre au téléphone toute la journée. Manifeste par conteneur, suivi par étapes et notification WhatsApp au destinataire.",
    prix: 'À partir de 39 €/mois',
    url: 'https://groupage.yitte.net',
    statut: 'bientot',
  },
  {
    id: 'importauto',
    nom: 'ImportAuto by Yitte',
    cible: 'Importateurs de véhicules d\'occasion',
    douleur: "Estimer les droits avant d'acheter et vérifier qu'un véhicule est admissible. Validation du VIN, règle d'âge par pays, suivi jusqu'à l'immatriculation.",
    prix: 'À partir de 49 €/mois',
    url: 'https://auto.yitte.net',
    statut: 'bientot',
  },
  {
    id: 'chantier',
    nom: 'Chantier by Yitte',
    cible: 'Entreprises du BTP',
    douleur: 'Suivre l\'avancement, les pointages et les décaissements de chaque chantier sans se noyer dans les fichiers Excel.',
    prix: 'À partir de 59 €/mois',
    url: 'https://chantier.yitte.net',
    statut: 'bientot',
  },
  {
    id: 'supplychain',
    nom: 'SupplyChain by Yitte',
    cible: 'Industriels et distributeurs',
    douleur: 'Piloter les approvisionnements, les stocks et les expéditions de bout en bout avec des alertes sur les ruptures.',
    prix: 'À partir de 79 €/mois',
    url: 'https://supply.yitte.net',
    statut: 'bientot',
  },
  {
    id: 'creditmanagement',
    nom: 'CreditManagement by Yitte',
    cible: 'Directions financières',
    douleur: 'Automatiser la relance client, suivre l\'encours et le DSO, et anticiper les défauts de paiement.',
    prix: 'À partir de 79 €/mois',
    url: 'https://credit.yitte.net',
    statut: 'bientot',
  },
  {
    id: 'rhflow',
    nom: 'RHFlow by Yitte',
    cible: 'DRH et managers',
    douleur: 'Centraliser les congés, les notes de frais, les entretiens annuels et le suivi du temps de travail.',
    prix: 'À partir de 49 €/mois',
    url: 'https://rh.yitte.net',
    statut: 'bientot',
  },
  {
    id: 'concierge',
    nom: 'Concierge by Yitte',
    cible: 'Conciergeries d\'entreprise et de luxe',
    douleur: 'Gérer les demandes clients, les prestataires externes et la facturation avec un suivi temps réel.',
    prix: 'À partir de 59 €/mois',
    url: 'https://concierge.yitte.net',
    statut: 'bientot',
  },
  {
    id: 'agenda',
    nom: 'Agenda by Yitte',
    cible: 'Professionnels libéraux et salons',
    douleur: 'Proposer la prise de rendez-vous en ligne, envoyer des rappels SMS et réduire les no-shows.',
    prix: 'À partir de 29 €/mois',
    url: 'https://agenda.yitte.net',
    statut: 'bientot',
  },
];

const GARANTIES = [
  { icone: Server, titre: 'Chaque logiciel est indépendant', texte: 'Son propre domaine, sa propre base. Aucune donnée partagée entre produits.' },
  { icone: ShieldCheck, titre: 'Vos données restent les vôtres', texte: 'Export à tout moment. Rien ne vous enferme dans la plateforme.' },
  { icone: Layers, titre: 'Conçu pour le terrain', texte: 'Réseau instable, coupures, WhatsApp plutôt que SMS. Pensé pour la réalité, pas pour la démo.' },
];

const Carte = ({ produit }) => {
  const enLigne = produit.statut === 'en_ligne';

  return (
    <div
      className="card"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.9rem', 
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        border: produit.teteDeGondole ? '2px solid var(--primary)' : '1px solid var(--border-color)',
        boxShadow: produit.teteDeGondole ? '0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)' : 'var(--shadow-sm)'
      }}
    >
      {produit.teteDeGondole && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          backgroundColor: 'var(--primary)',
          color: 'white',
          padding: '0.25rem 1rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          borderBottomLeftRadius: 'var(--radius-md)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          En vedette
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginTop: produit.teteDeGondole ? '1rem' : '0' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: 0 }}>{produit.nom}</h3>
        {!enLigne && (
          <span
            className="badge"
            style={{
              backgroundColor: 'rgba(245,158,11,0.12)',
              color: 'var(--status-pending)',
              fontSize: '0.7rem',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Clock size={12} /> Bientôt
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--primary)',
        }}
      >
        {produit.cible}
      </div>

      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, flex: 1 }}>{produit.douleur}</p>

      <div
        style={{
          paddingTop: '0.9rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: produit.gratuit ? 'var(--status-success)' : 'var(--text-main)',
            fontSize: '0.95rem',
          }}
        >
          {produit.prix}
        </span>

        {enLigne ? (
          <a
            href={produit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.9rem' }}
          >
            Découvrir la solution
            <ArrowUpRight size={16} />
          </a>
        ) : (
          <span
            className="btn btn-outline"
            aria-disabled="true"
            title={`${produit.url} n'est pas encore déployé`}
            style={{ padding: '0.6rem 1.1rem', fontSize: '0.9rem', opacity: 0.55, cursor: 'not-allowed' }}
          >
            Bientôt disponible
          </span>
        )}
      </div>
    </div>
  );
};

const LogicielsSaaS = () => {
  const enLigne = PRODUITS.filter((p) => p.statut === 'en_ligne').length;

  return (
    <div>
      {/* Hero */}
      <section style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', padding: '4.5rem 0' }}>
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
            <Layers size={15} />
            {PRODUITS.length} logiciels métier
          </div>

          <h1 style={{ marginBottom: '1rem' }}>
            Des logiciels B2B spécialisés, conçus pour la réalité du terrain
          </h1>

          <p style={{ fontSize: '1.1rem', lineHeight: 1.65 }}>
            Un métier, un outil. Pas une suite généraliste qu'il faut plier à votre activité :
            chaque logiciel règle une douleur précise et se vend seul, sans engagement.
          </p>
        </div>
      </section>

      {/* Catalogue */}
      <section className="container" style={{ padding: '3.5rem 1.5rem' }}>
        {enLigne === 0 && (
          <div
            style={{
              marginBottom: '2rem',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            <Clock size={18} style={{ color: 'var(--status-pending)', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Le catalogue est publié avant la mise en ligne des produits. Les fiches sont exactes,
              mais les sous-domaines ne répondent pas encore : les boutons resteront inactifs jusqu'au
              déploiement de chaque logiciel. Écrivez-nous pour une démonstration en attendant.
            </p>
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
          {PRODUITS.map((produit) => (
            <Carte key={produit.id} produit={produit} />
          ))}
        </div>
      </section>

      {/* Garanties */}
      <section style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', padding: '3.5rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '2rem',
            }}
          >
            {GARANTIES.map(({ icone: Icone, titre, texte }) => (
              <div key={titre} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(59,130,246,0.1)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icone size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>{titre}</h4>
                  <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: 1.55 }}>{texte}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="container" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', maxWidth: '680px' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>Un besoin qui ne rentre dans aucune case ?</h2>
        <p style={{ marginBottom: '1.75rem' }}>
          Ces logiciels sont nés de métiers précis. Si le vôtre n'y est pas, dites-nous ce qui vous coûte
          du temps ou de l'argent aujourd'hui — c'est comme ça que les précédents ont commencé.
        </p>
        <a
          href="mailto:contact@yitte.net?subject=Demande%20de%20d%C3%A9monstration"
          className="btn btn-primary"
          style={{ padding: '0.8rem 1.6rem' }}
        >
          Demander une démonstration
          <ArrowUpRight size={18} />
        </a>
      </section>
    </div>
  );
};

export default LogicielsSaaS;
