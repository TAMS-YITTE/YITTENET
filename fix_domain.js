const fs = require('fs');
const path = require('path');
const filePath = 'C:/Users/hp/Documents/Yittenet/src/pages/DomainCatalog.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Ajouter les icones manquantes
content = content.replace(
  'ArrowRightLeft\n',
  'ArrowRightLeft,\n  ShieldCheck, ScrollText, UserCheck, FileDigit\n'
);

// 2. Ajouter le bloc legaltech
const end = '  }\n};';
const idx = content.lastIndexOf(end);
if (idx !== -1) {
  const legaltechBlock = `  },\n  legaltech: {\n    title: 'LegalTech & Conformit?',\n    color: 'var(--domain-genai-color)',\n    bg: 'var(--domain-genai-bg)',\n    gradClass: 'grad-genai',\n    badgeClass: 'badge-genai',\n    jobs: [\n      { id: 1, title: 'Contrats & CGV', desc: 'R?daction de CGV, contrats de prestation, NDA, licences.', icon: <ScrollText size={32} color="var(--domain-genai-color)" /> },\n      { id: 2, title: 'Mise en conformit? RGPD', desc: 'Audit, registre de traitement, politiques de confidentialit?.', icon: <ShieldCheck size={32} color="var(--domain-genai-color)" /> },\n      { id: 3, title: 'KYC & V?rification', desc: 'Int?gration Stripe Identity, Onfido, v?rification d\'identit?.', icon: <UserCheck size={32} color="var(--domain-genai-color)" /> },\n      { id: 4, title: 'Due Diligence startup', desc: 'Analyse de risques, conformit? lev?e de fonds, data room.', icon: <FileDigit size={32} color="var(--domain-genai-color)" /> },\n      { id: 5, title: 'R?gulation crypto / PSAN', desc: 'Analyse juridique du token, enregistrement AMF, statut PSAN.', icon: <Coins size={32} color="var(--domain-genai-color)" /> },\n      { id: 6, title: 'Mentions l?gales & cookies', desc: 'G?n?ration et mise ? jour des pages l?gales obligatoires.', icon: <FileText size={32} color="var(--domain-genai-color)" /> },\n    ]\n  }\n};\n`;
  content = content.substring(0, idx) + legaltechBlock;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('DomainCatalog.jsx OK');
} else {
  console.error('Motif non trouve');
}
