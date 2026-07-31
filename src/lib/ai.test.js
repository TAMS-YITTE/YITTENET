import { describe, it, expect } from 'vitest';
import { parseAIResponse } from './ai';

describe('parseAIResponse', () => {
  it('extracts JSON block and brief from a valid DeepSeek response', () => {
    const input = `**Titre :** Audit SC
**Description :** Vérifier le code

---
\`\`\`json
{
  "needs_client_review": false,
  "review_points": [],
  "incoherence_detected": false,
  "match_criteria": {
    "domain": "web3",
    "experience_level": "expert",
    "skills": ["Solidity", "Hardhat"]
  }
}
\`\`\``;

    const result = parseAIResponse(input);
    expect(result.brief).toContain('Audit SC');
    expect(result.brief).not.toContain('```json');
    expect(result.metadata.needs_client_review).toBe(false);
    expect(result.metadata.match_criteria.domain).toBe('web3');
    expect(result.metadata.match_criteria.skills).toEqual(['Solidity', 'Hardhat']);
  });

  it('returns fallback metadata when no JSON block is present', () => {
    const input = 'Juste un texte sans JSON structuré.';
    const result = parseAIResponse(input);

    expect(result.brief).toBe(input);
    expect(result.metadata.needs_client_review).toBe(true);
    expect(result.metadata.review_points.length).toBeGreaterThan(0);
    expect(result.metadata.match_criteria.domain).toBeNull();
  });

  it('handles empty string gracefully', () => {
    const result = parseAIResponse('');
    expect(result.brief).toBe('');
    expect(result.metadata.needs_client_review).toBe(true);
  });
});