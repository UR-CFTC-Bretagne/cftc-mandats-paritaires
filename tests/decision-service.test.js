const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../src/DecisionService.gs'),'utf8');
const proposal={decision:{decisionId:'D-1',candidatureId:'C-1',resultat:'VALIDATION'}};
function createEnv({missing=false,blank=false,allow='NO'}={}){
 let writes=0,opened=0;
 const sheets={Candidatures:missing?null:{getLastRow:()=>blank?0:2}};
 const book={getSheetByName:name=>sheets[name]||null,insertSheet:()=>{writes++;throw Error('unexpected creation')}};
 const domain={propose:()=>proposal};
 const repo={DECISION_HEADERS:['id'],AUDIT_HEADERS:['id'],validateSnapshot:()=>true};
 const context={
 MandatsDecisionDomain:domain,MandatsDecisionRepository:repo,
 MandatsImportSettings:{read:()=>({sourceId:'SOURCE',targetId:'TEST'})},
 SpreadsheetApp:{openById:()=>{opened++;return book}},
 MandatsSheetsRepository:{readTable:()=>[]},
 MANDATS_CONFIG:{CAND_HEADERS:['id']},
 PropertiesService:{getScriptProperties:()=>({getProperty:()=>allow})},
 LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
 Error
 };
 vm.runInNewContext(src+';this.service=MandatsDecisionService;',context);
 return {service:context.service,writes:()=>writes,opened:()=>opened};
}
test('simulation refuse une feuille Candidatures absente',()=>{
 const e=createEnv({missing:true});
 assert.throws(()=>e.service.simulate({}),/absente ou sans en-têtes/);
 assert.equal(e.writes(),0);
});
test('simulation refuse une feuille Candidatures vide',()=>{
 const e=createEnv({blank:true});
 assert.throws(()=>e.service.simulate({}),/absente ou sans en-têtes/);
});
test('écriture refusée sans opt-in, avant ouverture du classeur',()=>{
 const e=createEnv({allow:'NO'});
 assert.throws(()=>e.service.saveDraftTest({},'AGENT'),/non autorisée/);
 assert.equal(e.opened(),0);
});
test('écriture refuse une source non renseignée avant toute création',()=>{
 const e=createEnv({allow:'YES',missing:true});
 assert.throws(()=>e.service.saveDraftTest({},'AGENT'),/absente ou sans en-têtes/);
 assert.equal(e.writes(),0);
});
