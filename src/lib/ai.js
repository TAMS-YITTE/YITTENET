import { supabase } from './supabase';

// Le SYSTEM_PROMPT vit désormais côté serveur (supabase/functions/generate-brief),
// avec la clé API Gemini, pour ne rien exposer dans le bundle client.

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
  // Appel serveur : l'Edge Function generate-brief détient la clé de l'IA.
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
