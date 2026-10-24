/** Menu de simulation uniquement ; l'import test nécessite une exécution explicite. */
function onOpen(){
 SpreadsheetApp.getUi().createMenu('Mandats CFTC Bretagne')
 .addItem('Simuler import candidatures (lecture seule)','afficherSimulationImport').addToUi();
}
function afficherSimulationImport(){
 try{
  const r=simulerImportCandidatures();
  SpreadsheetApp.getUi().alert('Simulation : '+r.counts.IMPORT+' à importer, '+r.counts.IGNORE+' déjà importées, '+r.counts.REJET+' anomalies. Voir les journaux anonymisés.');
 }catch(e){SpreadsheetApp.getUi().alert('Simulation impossible : '+e.message);}
}
