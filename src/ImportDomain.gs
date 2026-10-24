/** Fonctions pures testables sous Node. */
const MandatsImportDomain = (() => {
  const clean=v=>String(v===null||v===undefined?'':v).trim();
  const normalize=v=>clean(v).toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');
  const emailValid=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(v));
  function mapping(headers,overrides,aliases){
    const normalized=headers.map(normalize),indices={},errors=[];
    ['date','nom','prenom','courriel','instance'].forEach(key=>{
      const requested=clean(overrides[key]),names=requested?[requested]:(aliases[key]||[]);
      const index=names.map(normalize).map(n=>normalized.indexOf(n)).find(i=>i>=0);
      if(index===undefined){if(key!=='instance')errors.push('Colonne non trouvée : '+key);}
      else if(normalized.filter(n=>n===normalized[index]).length!==1)errors.push('En-tête ambigu : '+headers[index]);
      else indices[key]=index;
    });
    return {indices,errors};
  }
  function record(row,indices,sourceId){
    const get=k=>indices[k]===undefined?'':clean(row[indices[k]]);
    const value={sourceId,nom:get('nom'),prenom:get('prenom'),courriel:get('courriel').toLowerCase(),date:get('date'),instance:get('instance')};
    const errors=[];
    if(!value.nom)errors.push('nom manquant');
    if(!value.prenom)errors.push('prénom manquant');
    if(!emailValid(value.courriel))errors.push('courriel absent ou invalide');
    if(!value.date)errors.push('horodatage absent');
    return {value,errors};
  }
  function evaluate(record,peopleByEmail,candidatesBySource){
    if(record.errors.length)return {action:'REJET',reason:record.errors.join('; ')};
    const v=record.value;
    if(candidatesBySource[v.sourceId])return {action:'IGNORE',reason:'déjà importée'};
    const matches=peopleByEmail[v.courriel]||[];
    if(matches.length>1)return {action:'REJET',reason:'plusieurs personnes avec le même courriel'};
    if(matches.length===1&&(normalize(matches[0].nom)!==normalize(v.nom)||normalize(matches[0].prenom)!==normalize(v.prenom)))
      return {action:'REJET',reason:'identité différente pour ce courriel'};
    return {action:'IMPORT',personId:matches.length?matches[0].id:null};
  }
  return Object.freeze({clean,normalize,emailValid,mapping,record,evaluate});
})();
if(typeof module!=='undefined')module.exports=MandatsImportDomain;
