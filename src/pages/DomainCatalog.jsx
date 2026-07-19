import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Terminal, MonitorSmartphone, Wallet, Image as ImageIcon, Search, Coins, 
  MessageSquare, Cpu, FileText, Database, Settings2, GitBranch,
  LayoutTemplate, BarChart3, Repeat, TableProperties, CheckSquare, ArrowRightLeft
} from 'lucide-react';

const domainData = {
  web3: {
    title: 'Web3 & Blockchain',
    color: 'var(--domain-web3)',
    bg: 'var(--domain-web3-bg)',
    gradClass: 'grad-web3',
    badgeClass: 'badge-web3',
    jobs: [
      { id: 1, title: 'Smart Contracts (Solidity)', desc: 'Création de contrats pour paiements, escrow, gouvernance.', icon: <Terminal size={32} color="var(--domain-web3)" /> },
      { id: 2, title: 'Création de dApps', desc: 'Interfaces connectées à une blockchain (wallet, on-chain).', icon: <MonitorSmartphone size={32} color="var(--domain-web3)" /> },
      { id: 3, title: 'Intégration de Wallet', desc: 'MetaMask, WalletConnect, Account Abstraction.', icon: <Wallet size={32} color="var(--domain-web3)" /> },
      { id: 4, title: 'Déploiement de NFT', desc: 'Collections, marketplace, mint.', icon: <ImageIcon size={32} color="var(--domain-web3)" /> },
      { id: 5, title: 'Audit de sécurité', desc: 'Audit approfondi de smart contract.', icon: <Search size={32} color="var(--domain-web3)" /> },
      { id: 6, title: 'Tokenisation d\'actifs', desc: 'Créer un token, gérer la distribution.', icon: <Coins size={32} color="var(--domain-web3)" /> },
    ]
  },
  genai: {
    title: 'IA Générative',
    color: 'var(--domain-genai-color)',
    bg: 'var(--domain-genai-bg)',
    gradClass: 'grad-genai',
    badgeClass: 'badge-genai',
    jobs: [
      { id: 1, title: 'Agents IA / Chatbots', desc: 'Service client ou automatisation interne.', icon: <MessageSquare size={32} color="var(--domain-genai-color)" /> },
      { id: 2, title: 'Intégration d\'un LLM', desc: 'API OpenAI, Claude dans une app existante.', icon: <Cpu size={32} color="var(--domain-genai-color)" /> },
      { id: 3, title: 'Création de contenu', desc: 'Textes, visuels, vidéos automatisées.', icon: <FileText size={32} color="var(--domain-genai-color)" /> },
      { id: 4, title: 'Mise en place de RAG', desc: 'Recherche augmentée sur vos documents internes.', icon: <Database size={32} color="var(--domain-genai-color)" /> },
      { id: 5, title: 'Fine-tuning de modèle', desc: 'Entraînement sur des données spécifiques métier.', icon: <Settings2 size={32} color="var(--domain-genai-color)" /> },
      { id: 6, title: 'Automatisation IA', desc: 'Tri d\'emails, résumé, reporting automatisé.', icon: <GitBranch size={32} color="var(--domain-genai-color)" /> },
    ]
  },
  nocode: {
    title: 'No-Code & Automatisation',
    color: 'var(--domain-nocode)',
    bg: 'var(--domain-nocode-bg)',
    gradClass: 'grad-nocode',
    badgeClass: 'badge-nocode',
    jobs: [
      { id: 1, title: 'Création de site vitrine', desc: 'Webflow, Framer pour petites entreprises.', icon: <LayoutTemplate size={32} color="var(--domain-nocode)" /> },
      { id: 2, title: 'Application interne', desc: 'Bubble, Glide pour la gestion métier.', icon: <BarChart3 size={32} color="var(--domain-nocode)" /> },
      { id: 3, title: 'Automatisation de tâches', desc: 'Zapier, Make entre outils existants.', icon: <Repeat size={32} color="var(--domain-nocode)" /> },
      { id: 4, title: 'Bases de données', desc: 'Mise en place Airtable, Notion complexes.', icon: <TableProperties size={32} color="var(--domain-nocode)" /> },
      { id: 5, title: 'Tunnels de conversion', desc: 'Typeform, Tally et intégrations avancées.', icon: <CheckSquare size={32} color="var(--domain-nocode)" /> },
      { id: 6, title: 'Migration No-Code', desc: 'Transfert d\'un site existant vers une solution no-code.', icon: <ArrowRightLeft size={32} color="var(--domain-nocode)" /> },
    ]
  }
};

const DomainCatalog = () => {
  const { id } = useParams();
  const domain = domainData[id];

  if (!domain) {
    return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Domaine introuvable</div>;
  }

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* Header */}
      <section style={{ backgroundColor: domain.bg, padding: '4rem 0', borderBottom: `1px solid ${domain.color}40` }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className={`badge ${domain.badgeClass}`} style={{ marginBottom: '1rem' }}>Catalogue de missions</span>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }} className={`text-gradient ${domain.gradClass}`}>
            {domain.title}
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-main)', maxWidth: '600px', margin: '0 auto' }}>
            Identifiez votre besoin parmi les prestations les plus demandées par nos clients et trouvez l'expert idéal.
          </p>
        </div>
      </section>

      {/* Grid of jobs */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {domain.jobs.map(job => (
              <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Illustration Placeholder */}
                <div style={{ 
                  height: '160px', 
                  backgroundColor: 'rgba(255,255,255,0.02)', 
                  borderRadius: '8px', 
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed var(--border-color)'
                }}>
                  {job.icon}
                </div>
                
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{job.title}</h3>
                <p style={{ marginBottom: '1.5rem', flex: 1 }}>{job.desc}</p>
                
                <Link to={`/post-job?domain=${id}&jobTitle=${encodeURIComponent(job.title)}`} className="btn" style={{ backgroundColor: domain.color, color: (id === 'web3' || id === 'nocode') ? '#000' : '#fff', width: '100%' }}>
                  Publier ce besoin
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DomainCatalog;
