const test=require('node:test'),assert=require('node:assert/strict');
const r=require('../src/InstanceRegistry.gs');
const rows=[
 ['I1','Instance de test','Paritaire','oui','oui'],
 ['I2','Autre instance','Social','non','oui'],
 ['I3','À valider','Paritaire','oui','non']
];
test('résout une instance active et validée',()=>assert.equal(r.fromRows(rows).resolveName('instance de test').instance.id,'I1'));
test('ignore les instances inactives',()=>assert.equal(r.fromRows(rows).resolveName('Autre instance').status,'NON_RESOLU'));
test('ignore les instances non validées',()=>assert.equal(r.fromRows(rows).resolveName('À valider').status,'NON_RESOLU'));
test('détecte les noms actifs ambigus',()=>{
 const index=r.fromRows([...rows,['I4','INSTANCE DE TEST','Paritaire','oui','oui']]);
 assert.equal(index.resolveName('Instance de test').status,'AMBIGU');
});
test('refuse les identifiants dupliqués',()=>assert.throws(()=>r.fromRows([...rows,rows[0]]),/dupliqué/));
test('refuse une instance sans nom',()=>assert.throws(()=>r.fromRows([['I5','','','oui','oui']]),/sans identifiant ou nom/));
test('résolution sans mutation des lignes',()=>{
 const before=JSON.stringify(rows);r.fromRows(rows).resolveName('Instance de test');assert.equal(JSON.stringify(rows),before);
});
