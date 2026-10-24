/** US-002 : orchestration READ ONLY, sans mutation du référentiel. */
const MandatsCompletenessService = (() => {
  const C=MANDATS_CONFIG,R=MandatsSheetsRepository,D=MandatsCompletenessDomain;
  const P=MandatsCompletenessProjection,Policy=MandatsCompletenessPolicy;
  function evaluateSnapshot(people, applications, instanceRows, requirementRows) {
    const registry=MandatsInstanceRegistry.fromRows(instanceRows || []);
    const requirements=MandatsInstanceRequirements.fromRows(requirementRows || []);
    return P.inspectRows(people,applications,Policy,D,registry,requirements);
  }
  function simulationTest() {
    // Restriction temporaire explicite : seul le classeur cible de TEST de US-001.
    const configuration=MandatsImportSettings.read();
    const book=SpreadsheetApp.openById(configuration.targetId);
    const persons=R.readTable(book.getSheetByName(C.TARGET_PERSONNES),C.PERSON_HEADERS);
    const applications=R.readTable(book.getSheetByName(C.TARGET_CANDIDATURES),C.CAND_HEADERS);
    // Résumé agrégé seulement : pas de nom/courriel dans les journaux Apps Script.
    const instanceSheet=book.getSheetByName('Instances');
    const instanceRows=R.readTable(instanceSheet,MandatsInstanceRegistry.HEADERS);
    const requirementsSheet=book.getSheetByName('Exigences_instances');
    const requirementsRows=R.readTable(requirementsSheet,MandatsInstanceRequirements.HEADERS);
    const diagnostics=evaluateSnapshot(persons,applications,instanceRows,requirementsRows);
    const summary={total:diagnostics.length,INCOMPLET:0,A_VERIFIER:0,
      PRET_A_INSTRUIRE:0,ANOMALIE_REFERENTIEL:0};
    for(const row of diagnostics)summary[row.status]++;
    Logger.log(JSON.stringify(summary));
    return {summary,diagnostics}; // Ne transmettre qu'aux utilisateurs autorisés.
  }
  return Object.freeze({evaluateSnapshot,simulationTest});
})();
function simulerCompletudeCandidaturesTest(){
 return MandatsCompletenessService.simulationTest();
}
