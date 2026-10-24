/** Copyright 2026 Union Régionale CFTC Bretagne. SPDX-License-Identifier: Apache-2.0.
 * US-002 : diagnostic déterministe, sans accès Google et sans mutation du dossier.
 */
const MandatsCompletenessDomain = (() => {
  const hasValue = value => value !== null && value !== undefined &&
    (typeof value !== 'string' || value.trim() !== '') &&
    (!Array.isArray(value) || value.length > 0);
  const allowedStatuses = Object.freeze(['INCOMPLET','A_VERIFIER','PRET_A_INSTRUIRE']);

  function validatePolicy(policy) {
    if (!policy || !Array.isArray(policy.fields) || !Array.isArray(policy.documents))
      throw new Error('Politique de complétude invalide : fields et documents requis');
    const seen = new Set();
    for (const item of [...policy.fields,...policy.documents]) {
      if (!item || typeof item.key !== 'string' || !item.key.trim() ||
          typeof item.label !== 'string' || !item.label.trim() ||
          typeof item.required !== 'boolean')
        throw new Error('Règle de complétude mal formée');
      const key = item.key.trim();
      if (seen.has(key)) throw new Error('Clé de contrôle dupliquée : '+key);
      seen.add(key);
    }
    return policy;
  }
  function evaluate(dossier, policy) {
    validatePolicy(policy);
    if (!dossier || typeof dossier !== 'object') throw new Error('Dossier absent');
    const missingFields = policy.fields.filter(rule => rule.required && !hasValue(dossier[rule.key]))
      .map(rule => ({key:rule.key,label:rule.label,kind:'FIELD'}));
    const documents = dossier.documents && typeof dossier.documents === 'object' ? dossier.documents : {};
    const missingDocuments = policy.documents.filter(rule => rule.required && !hasValue(documents[rule.key]))
      .map(rule => ({key:rule.key,label:rule.label,kind:'DOCUMENT'}));
    const missing = [...missingFields,...missingDocuments];
    const pending = policy.fields.filter(rule => rule.verify === true && hasValue(dossier[rule.key]) &&
      !(dossier.verified && dossier.verified[rule.key] === true)).map(rule => ({key:rule.key,label:rule.label}));
    // 'PRET_A_INSTRUIRE' is not 'A_DECIDER': no decision/designation is implied.
    const status = missing.length ? 'INCOMPLET' : pending.length ? 'A_VERIFIER' : 'PRET_A_INSTRUIRE';
    return {status,missing,verificationPending:pending,complete:missing.length===0 && pending.length===0,
      missingCount:missing.length,pendingCount:pending.length};
  }
  return Object.freeze({evaluate,validatePolicy,hasValue,allowedStatuses});
})();
if (typeof module !== 'undefined') module.exports = MandatsCompletenessDomain;
