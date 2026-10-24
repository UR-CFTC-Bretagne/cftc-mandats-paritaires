const test=require('node:test'),assert=require('node:assert/strict');
const rules=require('../src/InstanceRequirements.gs');
const row=['I-1','accord','Accord écrit','oui','oui'];
test('règle validée retenue',()=>{const p=rules.fromRows([row]).forInstance('I-1');assert.equal(p.status,'VALIDE');assert.equal(p.documents[0].required,true)});
test('règle non validée => attente',()=>assert.equal(rules.fromRows([[...row.slice(0,4),'non']]).forInstance('I-1').status,'A_VALIDER'));
test('sans règle validée => attente',()=>assert.equal(rules.fromRows([]).forInstance('I-1').status,'A_VALIDER'));
test('obligation fausse explicite',()=>assert.equal(rules.fromRows([[...row.slice(0,3),'non','oui']]).forInstance('I-1').documents[0].required,false));
test('doublons bloqués',()=>assert.throws(()=>rules.fromRows([row,row]),/dupliquée/));
test('drapeaux ambigus bloqués',()=>assert.throws(()=>rules.fromRows([[...row.slice(0,3),'peut-être','oui']]),/Drapeau/));
