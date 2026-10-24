/** Adaptateur de configuration Apps Script, sans secrets dans GitHub. */
const MandatsImportSettings=(()=>{
 function read(){
   const p=PropertiesService.getScriptProperties();
   const sourceId=p.getProperty('SOURCE_SPREADSHEET_ID');
   const targetId=p.getProperty('TARGET_TEST_SPREADSHEET_ID');
   if(!sourceId||!targetId)throw new Error('Configurer SOURCE_SPREADSHEET_ID et TARGET_TEST_SPREADSHEET_ID');
   if(sourceId===targetId)throw new Error('Le référentiel de TEST doit être distinct de la source');
   const overrides={};
   ['date','nom','prenom','courriel','instance'].forEach(k=>overrides[k]=p.getProperty('FORM_HEADER_'+k.toUpperCase())||'');
   return {sourceId,targetId,overrides};
 }
 function assertTestWrites(){
   if(PropertiesService.getScriptProperties().getProperty('ALLOW_TEST_IMPORT_WRITES')!=='YES')
      throw new Error('Écriture désactivée : définir ALLOW_TEST_IMPORT_WRITES=YES');
 }
 return Object.freeze({read,assertTestWrites});
})();
