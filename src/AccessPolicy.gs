/** API-002 — Politique d'accès en mémoire, aucune donnée réelle ni accès réseau.
 * Rôles et rattachements attestés uniquement par un fournisseur serveur fiable.
 */
const MandatsAccessPolicy=(()=>{
 const ROLES=Object.freeze(['UR_COORDINATEUR','UR_RESPONSABLE','UD_RESPONSABLE','SYNDICAT_RESPONSABLE','MANDATE']);
 const RESOURCE_FIELDS=Object.freeze({
  personnes:Object.freeze(['PERSONNE_ID','Nom','Prénom','Courriel','Syndicat_ID','UD_ID']),
  candidatures:Object.freeze(['CAND_ID','PERSONNE_ID','Instance_ID','Statut']),
  instances:Object.freeze(['INSTANCE_ID','Nom','Type','Actif']),
  decisions:Object.freeze(['DECISION_ID','CAND_ID','Date_decision','Resultat','Etat'])
 });
 const OPERATOR_FIELDS=Object.freeze({
  personnes:Object.freeze(['PERSONNE_ID','Nom','Prénom','Courriel','Syndicat_ID','UD_ID']),
  candidatures:Object.freeze(['CAND_ID','PERSONNE_ID','Instance_ID','Statut']),
  instances:RESOURCE_FIELDS.instances,
  decisions:RESOURCE_FIELDS.decisions
 });
 const SELF_FIELDS=Object.freeze({
  personnes:Object.freeze(['PERSONNE_ID','Nom','Prénom','Courriel']),
  candidatures:Object.freeze(['CAND_ID','PERSONNE_ID','Instance_ID','Statut']),
  instances:RESOURCE_FIELDS.instances,
  decisions:Object.freeze([])
 });
 const valid=v=>typeof v==='string'&&v.trim().length>0&&v.trim()===v;
 function authorize(principal,resource,record){
  if(!principal||!record||typeof principal!=='object'||typeof record!=='object')return false;
  if(!valid(principal.principalId)||!ROLES.includes(principal.role))return false;
  if(!Object.prototype.hasOwnProperty.call(RESOURCE_FIELDS,resource))return false;
  const rolesWithRegionalScope=['UR_COORDINATEUR','UR_RESPONSABLE'];
  if(resource==='instances')return rolesWithRegionalScope.includes(principal.role)||
    principal.role==='UD_RESPONSABLE'||principal.role==='SYNDICAT_RESPONSABLE'||principal.role==='MANDATE';
  // Les décisions restent limitées aux rôles UR : pas de transfert territorial implicite.
  if(resource==='decisions')return rolesWithRegionalScope.includes(principal.role)&&
    principal.decisionsAutorisees===true;
  if(rolesWithRegionalScope.includes(principal.role))return principal.dossiersRegionauxAutorises===true;
  if(principal.role==='UD_RESPONSABLE')
   return valid(principal.udId)&&valid(record.UD_ID)&&principal.udId===record.UD_ID;
  if(principal.role==='SYNDICAT_RESPONSABLE')
   return valid(principal.syndicatId)&&valid(record.Syndicat_ID)&&principal.syndicatId===record.Syndicat_ID;
  if(principal.role==='MANDATE')
   return valid(principal.personneId)&&valid(record.PERSONNE_ID)&&principal.personneId===record.PERSONNE_ID;
  return false;
 }
 function fields(principal,resource){
  if(!principal||!ROLES.includes(principal.role)||!RESOURCE_FIELDS[resource])return [];
  if(principal.role==='MANDATE')return [...SELF_FIELDS[resource]];
  if(resource==='decisions'&&principal.decisionsAutorisees!==true)return [];
  return [...OPERATOR_FIELDS[resource]];
 }
 function project(principal,resource,record){
  if(!authorize(principal,resource,record))throw Error('Accès refusé : périmètre non autorisé');
  const result=Object.create(null);
  for(const key of fields(principal,resource)){
   if(Object.prototype.hasOwnProperty.call(record,key))result[key]=record[key];
  }
  return Object.freeze(result);
 }
 return Object.freeze({ROLES,authorize,fields,project});
})();
if(typeof module!=='undefined')module.exports=MandatsAccessPolicy;
