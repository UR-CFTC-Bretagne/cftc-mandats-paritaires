/** Référentiel instances : moteur pur, sans accès Google ni auto-désignation. */
const MandatsInstanceRegistry = (() => {
  const clean = v => String(v === null || v === undefined ? '' : v).trim();
  const normalize = v => clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').replace(/\s+/g,' ');
  const HEADERS = Object.freeze(['INSTANCE_ID','Nom','Type','Actif','Validation_metier']);
  function fromRows(rows) {
    if (!Array.isArray(rows)) throw new Error('Référentiel des instances invalide');
    const byId = new Map(), byName = new Map();
    for (const row of rows) {
      if (!Array.isArray(row) || row.length < HEADERS.length) throw new Error('Ligne instance mal formée');
      const id = clean(row[0]), name = clean(row[1]);
      if (!id || !name) throw new Error('Instance sans identifiant ou nom');
      if (byId.has(id)) throw new Error('INSTANCE_ID dupliqué');
      const item = Object.freeze({id,name,type:clean(row[2]),active:normalize(row[3])==='oui',
        validated:normalize(row[4])==='oui'});
      byId.set(id,item);
      const key=normalize(name),list=byName.get(key)||[];
      list.push(item);byName.set(key,list);
    }
    return Object.freeze({
      find(id) {return byId.get(clean(id)) || null;},
      resolveName(name) {
        const matches=(byName.get(normalize(name))||[]).filter(i=>i.active && i.validated);
        return matches.length===1 ? {status:'MATCH',instance:matches[0]} :
          {status:matches.length>1?'AMBIGU':'NON_RESOLU',instance:null};
      }
    });
  }
  return Object.freeze({HEADERS,fromRows,normalize});
})();
if (typeof module!=='undefined') module.exports=MandatsInstanceRegistry;
