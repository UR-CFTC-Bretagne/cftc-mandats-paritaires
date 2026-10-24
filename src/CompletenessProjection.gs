/** US-002 : projection pure du référentiel normalisé vers un dossier à contrôler. */
const MandatsCompletenessProjection = (() => {
  function project(person, candidature) {
    if (!Array.isArray(person) || !Array.isArray(candidature))
      throw new Error('Lignes de référentiel invalides');
    if (!person[0] || !candidature[0] || person[0] !== candidature[1])
      throw new Error('Rattachement personne/candidature invalide');
    return {
      nom: person[1], prenom: person[2], courriel: person[3],
      date: candidature[5], instance: candidature[4], // Instance_ID, jamais texte inventé
      documents: {}, verified: {}
    };
  }
  function inspectRows(people, applications, policy, domain, instanceRegistry) {
    const byId = new Map();
    for (const row of people) {
      const id = String(row[0] || '').trim();
      if (!id || byId.has(id)) throw new Error('PERSONNE_ID absent ou dupliqué');
      byId.set(id, row);
    }
    const seen = new Set();
    return applications.map(row => {
      const id = String(row[0] || '').trim();
      if (!id || seen.has(id)) throw new Error('CAND_ID absent ou dupliqué');
      seen.add(id);
      const person = byId.get(String(row[1] || '').trim());
      if (!person) return {candidatureId:id,status:'ANOMALIE_REFERENTIEL',missing:[],
        verificationPending:[],missingCount:0,pendingCount:0,
        diagnostic:'PERSONNE_INTRouvable'};
      const dossier = project(person,row);
      if (instanceRegistry && dossier.instance) {
        const instance = instanceRegistry.find(dossier.instance);
        if (!instance || !instance.active || !instance.validated) dossier.instance = '';
      }
      const result = domain.evaluate(dossier,policy);
      return {candidatureId:id,status:result.status,missing:result.missing,
        verificationPending:result.verificationPending,missingCount:result.missingCount,
        pendingCount:result.pendingCount};
    });
  }
  return Object.freeze({project,inspectRows});
})();
if (typeof module !== 'undefined') module.exports = MandatsCompletenessProjection;
