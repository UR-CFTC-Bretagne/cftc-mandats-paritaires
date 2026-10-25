/** API interne de lecture, sans endpoint réseau. Les droits sont vérifiés par requête.
 * L'adaptateur injecté doit provenir d'un contexte serveur de confiance.
 */
const MandatsDataAccess=(()=>{
 const RESOURCES=Object.freeze({
  personnes:Object.freeze({table:'Personnes',key:'PERSONNE_ID',scope:'personnes:read'}),
  candidatures:Object.freeze({table:'Candidatures',key:'CAND_ID',scope:'candidatures:read'}),
  instances:Object.freeze({table:'Instances',key:'INSTANCE_ID',scope:'instances:read'}),
  decisions:Object.freeze({table:'Decisions',key:'DECISION_ID',scope:'decisions:read'})
 });
 const id=value=>typeof value==='string'&&value.trim()===value&&value.length>0&&
   value.length<=128&&!/[\\/\r\n]/.test(value);
 function create({readTable,authorize,audit}){
  if(typeof readTable!=='function'||typeof authorize!=='function'||typeof audit!=='function')
   throw Error('Adaptateur, autorisation et audit obligatoires');
  function get(resource,recordId,context){
   const spec=RESOURCES[resource];
   if(!spec)throw Error('Ressource non autorisée');
   if(!id(recordId))throw Error('Identifiant invalide');
   // Ne jamais autoriser depuis un champ contrôlé par le client sans preuve serveur.
   if(!context||typeof context!=='object'||typeof context.principalId!=='string'||
      !context.principalId.trim())throw Error('Identité non attestée');
   if(authorize({principalId:context.principalId,action:spec.scope,recordId,resource})!==true)
    throw Error('Accès refusé');
   const result=readTable(spec.table);
   if(!result||!Array.isArray(result.headers)||!Array.isArray(result.rows))
    throw Error('Référentiel indisponible');
   const keyIndex=result.headers.indexOf(spec.key);
   if(keyIndex<0)throw Error('Schéma du référentiel incompatible');
   let found=null;
   for(const row of result.rows){
    if(!Array.isArray(row)||row.length!==result.headers.length)throw Error('Référentiel incohérent');
    if(row[keyIndex]===recordId){
     if(found)throw Error('Identifiant dupliqué dans le référentiel');
     found=row;
    }
   }
   // Audit obligatoire : si l'audit échoue, aucune donnée nominative n'est retournée.
   if(audit({principalId:context.principalId,action:spec.scope,resource,recordId,
             resultat:found?'LU':'ABSENT'})!==true)throw Error('Audit indisponible');
   if(!found)return null;
   const projected=Object.create(null);
   for(let i=0;i<result.headers.length;i++){
    if(Object.prototype.hasOwnProperty.call(projected,result.headers[i]))
     throw Error('En-tête dupliqué');
    projected[result.headers[i]]=found[i];
   }
   return Object.freeze(projected);
  }
  return Object.freeze({get});
 }
 return Object.freeze({RESOURCES,create});
})();
if(typeof module!=='undefined')module.exports=MandatsDataAccess;
