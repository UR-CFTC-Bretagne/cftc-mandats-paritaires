/** US-003 - Domaine pur des décisions, sans accès Workspace ni acte officiel. */
const MandatsDecisionDomain=(()=>{
 const RESULTATS=Object.freeze(['VALIDATION','REFUS','AJOURNEMENT']);
 const clean=value=>typeof value==='string'?value.trim():'';
 const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&
  !Number.isNaN(Date.parse(value+'T00:00:00Z'))&&
  new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
 function validate(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Décision absente');
  const fields=['decisionId','candidatureId','autorite','date','resultat','referencePV','justificatifDriveId'];
  const v={};
  for(const key of fields){
   v[key]=clean(input[key]);
   if(!v[key])throw Error('Champ obligatoire manquant : '+key);
   if(/^[=+@]/.test(v[key]) || (v[key].startsWith('-') && key!=='date'))throw Error('Valeur interdite pour une cellule Sheets : '+key);
  }
  if(!RESULTATS.includes(v.resultat))throw Error('Résultat de décision non autorisé');
  if(!validDate(v.date))throw Error('Date de décision invalide');
  // The legal competence of the authority cannot be established from text alone.
  const confirmed=input.competenceVerifiee===true;
  const evidence=input.justificatifVerifie===true;
  const linked=input.candidatureVerifiee===true;
  return Object.freeze({...v,competenceVerifiee:confirmed,justificatifVerifie:evidence,
    candidatureVerifiee:linked,pretPourRevue:confirmed&&evidence&&linked});
 }
 function propose(input,existingIds){
  const decision=validate(input);
  if(!Array.isArray(existingIds))throw Error('Index des décisions invalide');
  if(existingIds.some(id=>String(id)===decision.decisionId))throw Error('DECISION_ID dupliqué');
  return Object.freeze({decision,etat:'BROUILLON',designationAutorisee:false,notificationAutorisee:false});
 }
 function auditChange(oldValue,newValue,acteur,dateAction){
  if(!oldValue||!newValue||oldValue.decisionId!==newValue.decisionId)throw Error('Identité de décision incohérente');
  if(!clean(acteur)||!clean(dateAction))throw Error('Audit sans acteur ou horodatage');
  const changed=Object.keys(newValue).filter(key=>oldValue[key]!==newValue[key]);
  if(!changed.length)throw Error('Aucune modification à tracer');
  return Object.freeze({decisionId:newValue.decisionId,acteur:clean(acteur),horodatage:clean(dateAction),
    action:'REVISION',champsModifies:changed,designationAutorisee:false});
 }
 return Object.freeze({RESULTATS,validate,propose,auditChange});
})();
if(typeof module!=='undefined')module.exports=MandatsDecisionDomain;
