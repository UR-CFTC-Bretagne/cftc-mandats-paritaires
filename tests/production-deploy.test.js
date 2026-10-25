const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {validate}=require('../scripts/verify-production-deploy.js');
const workflow=fs.readFileSync(path.join(__dirname,'../.github/workflows/deploy-production.yml'),'utf8');
const defaults=()=>({approved:'YES',prodId:'PRODUCTION_ID_123456789012345',confirmedId:'PRODUCTION_ID_123456789012345',
 testId:'TEST_SCRIPT_ID_123456789012345',credentials:JSON.stringify({tokens:{default:{access_token:'fake'}}}),
 manifestText:JSON.stringify({runtimeVersion:'V8',oauthScopes:['https://www.googleapis.com/auth/spreadsheets']})});
test('la production refuse le MVP non approuvé',()=>assert.throws(()=>validate({...defaults(),approved:'NO'}),/approved/));
test('la cible doit correspondre à la production confirmée',()=>assert.throws(()=>validate({...defaults(),confirmedId:'OTHER_ID_123456789012345'}),/confirmed/));
test('la production doit être différente du test',()=>assert.throws(()=>validate({...defaults(),testId:defaults().prodId}),/differ/));
test('ne jamais étendre les permissions Drive sans revue',()=>{
 const d=defaults();d.manifestText=JSON.stringify({runtimeVersion:'V8',oauthScopes:['https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/drive']});
 assert.throws(()=>validate(d),/scopes/);
});
test('les paramètres approuvés permettent seulement de passer le préflight',()=>assert.equal(validate(defaults()),true));
test('workflow prod uniquement manuel et branche main',()=>{
 assert.match(workflow,/workflow_dispatch:/);
 assert.doesNotMatch(workflow,/^  push:/m);
 assert.match(workflow,/github\.ref == 'refs\/heads\/main'/);
 assert.match(workflow,/environment: apps-script-production/);
 assert.match(workflow,/MVP_RELEASE_APPROVED/);
});
