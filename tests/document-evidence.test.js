const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../src/DocumentEvidence.gs');
const row=['C-1','accord','FILE-TEST','present','oui'];
test('attestation et référence requises',()=>assert.equal(E.fromRows([row],()=>true).forCandidature('C-1').accord,true));
test('document non validé reste absent',()=>assert.equal(E.fromRows([[...row.slice(0,4),'non']]).forCandidature('C-1').accord,false));
test('référence Drive manquante reste absente',()=>assert.equal(E.fromRows([[...row.slice(0,2),'','present','oui']]).forCandidature('C-1').accord,false));
test('document à vérifier ne vaut pas présent',()=>assert.equal(E.fromRows([[...row.slice(0,3),'a_verifier','oui']]).forCandidature('C-1').accord,false));
test('doublons interdits',()=>assert.throws(()=>E.fromRows([row,row]),/dupliquée/));
test('statuts inconnus interdits',()=>assert.throws(()=>E.fromRows([[...row.slice(0,3),'peut-être','oui']]),/invalide/));
test('aucune fuite de Drive_file_ID dans le dossier projeté',()=>assert.deepEqual(E.fromRows([row]).forCandidature('C-1'),{accord:true}));

test('sans autorisation technique les justificatifs restent non vérifiés',()=>assert.equal(E.fromRows([row]).forCandidature('C-1').accord,false));
test('Drive inaccessible refuse la preuve',()=>assert.equal(E.fromRows([row],()=>false).forCandidature('C-1').accord,false));
test('vérificateur non appelé lorsque validation métier manque',()=>{let called=false;E.fromRows([[...row.slice(0,4),'non']],()=>{called=true;return true;});assert.equal(called,false);});
