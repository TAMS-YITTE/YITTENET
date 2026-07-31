import { supabase } from './supabase';

// Le SYSTEM_PROMPT vit désormais côté serveur (supabase/functions/generate-brief),
// avec la clé API DeepSeek, pour ne rien exposer dans le bundle client.

// Helper pour extraire le JSON de la réponse du LLM
export const parseAIResponse = (text) => {
  try {
    // 1. Essayer de trouver le bloc JSON via les backticks
    const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    let metadataStr = null;
    let brief = text;

    if (jsonMatch && jsonMatch[1]) {
      metadataStr = jsonMatch[1];
      brief = text.replace(/```json\s*\{[\s\S]*?\}\s*```/, '').replace(/---[\s\n]*BLOC TECHNIQUE.*$/, '').trim();
    } else {
      // 2. Si le LLM n'a pas mis les backticks, on cherche de '{' jusqu'à la fin après le séparateur '---'
      const separatorIndex = text.lastIndexOf('---');
      if (separatorIndex !== -1) {
        const potentialJsonArea = text.substring(separatorIndex);
        const bracketIndex = potentialJsonArea.indexOf('{');
        if (bracketIndex !== -1) {
          metadataStr = potentialJsonArea.substring(bracketIndex);
          brief = text.substring(0, separatorIndex).trim();
        }
      }
    }

    const metadata = metadataStr ? JSON.parse(metadataStr) : {
      needs_client_review: true,
      review_points: ["Veuillez relire l'ensemble du brief."],
      incoherence_detected: false,
      match_criteria: { domain: null, experience_level: null, skills: [] }
    };

    return { brief, metadata };

  } catch (err) {
    console.error("Error parsing AI JSON block:", err);
    return {
      brief: text,
      metadata: {
        needs_client_review: true,
        review_points: ["Erreur de validation IA, veuillez vérifier tous les champs manuellement."],
        incoherence_detected: false,
        match_criteria: { domain: null, experience_level: null, skills: [] }
      }
    };
  }
};

export const generateJobBrief = async (clientInput) => {
  // Mode mock explicite pour le développement local sans backend IA configuré.
  // (La vraie clé DeepSeek vit désormais uniquement côté serveur dans l'Edge
  // Function generate-brief — plus jamais dans le bundle client.)
  const useMock = import.meta.env.VITE_AI_USE_MOCK === 'true';

  if (useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse = `**⚠️ Brouillon généré automatiquement — à relire et ajuster avant publication**

**Titre de la mission :** Création d'une marketplace de location avec paiement Crypto
**Domaine principal :** Web3
**Domaine secondaire (si applicable) :** No-Code
**Niveau d'expérience requis :** Confirmé

**Contexte et Objectif :**
Le client souhaite développer une marketplace permettant à des utilisateurs de louer du matériel de pointe. Le paiement s'effectuera en cryptomonnaies (USDC/USDT) via un smart contract garantissant la transaction (séquestre). L'interface utilisateur devra être simple et développée idéalement avec un outil No-Code (ex: Bubble) connecté au wallet Web3.

**Livrables attendus :**
- Smart Contract d'escrow (Solidity) déployé sur Polygon ou Arbitrum.
- Application Web/Mobile No-Code (Bubble) avec design responsive.
- Intégration du wallet (MetaMask / WalletConnect).
- Tableau de bord de suivi des locations.

**Compétences techniques requises :**
Solidity, Hardhat/Foundry, Bubble, ethers.js / wagmi

**Budget indicatif :** 3000€ - 5000€
**Délai indicatif :** 4 à 6 semaines

**Critères de succès :**
- Les paiements crypto sont bien bloqués puis débloqués selon l'état de la location.
- L'interface No-Code communique sans erreur avec la blockchain.

**Points de vigilance réglementaires :**
- Réception et séquestre de fonds : nécessite de vérifier si la qualification de PSAN (Prestataire de Services sur Actifs Numériques) s'applique selon la juridiction du client.

**Points d'attention :**
- Le budget de 3000-5000€ semble un peu serré pour un projet combinant un développement complet No-Code ET des smart contracts d'escrow sécurisés audités.

**Hypothèses à valider avec le client :**
- Le budget exact est à confirmer (fourchette très large).
- Les blockchains cibles (Polygon/Arbitrum) doivent être validées.

**English summary (for international freelancers):**
Context: The client wants to build an equipment rental marketplace where users pay in crypto (USDC/USDT) via an escrow smart contract, with a No-Code frontend.
Deliverables: Escrow Smart Contract (Polygon/Arbitrum), No-Code Web App (Bubble), Wallet Integration, Rental Dashboard.

---
BLOC TECHNIQUE (usage interne — ne pas afficher tel quel au client) :
\`\`\`json
{
  "needs_client_review": true,
  "review_points": [
    "Confirmer le budget réel alloué (risque d'être trop faible)",
    "Valider la blockchain souhaitée (Polygon ou Arbitrum suggérées)"
  ],
  "incoherence_detected": true,
  "match_criteria": {
    "domain": "web3",
    "experience_level": "confirme",
    "skills": ["Solidity", "Hardhat", "Bubble", "ethers.js"]
  }
}
\`\`\``;
        resolve(parseAIResponse(mockResponse));
      }, 2000);
    });
  }

  // Appel serveur : l'Edge Function generate-brief détient la clé DeepSeek.
  try {
    const { data, error } = await supabase.functions.invoke('generate-brief', {
      body: { clientInput },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    if (!data?.text) throw new Error('Réponse IA vide');

    return parseAIResponse(data.text);
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw error;
  }
};
