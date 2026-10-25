const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const workflow=fs.readFileSync(path.join(__dirname,'../.github/workflows/deploy-test.yml'),'utf8');
const build=fs.readFileSync(path.join(__dirname,'../scripts/build-appsscript.js'),'utf8');
test('la livraison est limitée à main et à ce dépôt',()=>{
 assert.match(workflow,/github\.ref == 'refs\/heads\/main'/);
 assert.match(workflow,/github\.repository == 'UR-CFTC-Bretagne\/cftc-mandats-paritaires'/);
});
test('la livraison exige une activation TEST et une cible dédiée',()=>{
 assert.match(workflow,/ALLOW_TEST_CODE_DEPLOY/);
 assert.match(workflow,/APPS_SCRIPT_TEST_ID/);
 assert.match(workflow,/CLASPRC_JSON/);
 assert.match(workflow,/environment: apps-script-test/);
});
test('aucune publication automatique en production',()=>{
 assert.doesNotMatch(workflow,/environment: (production|prod)(\s|$)/m);
 assert.match(workflow,/clasp push --force/);
 assert.doesNotMatch(workflow,/clasp deploy/);
});
test('le manifeste est assemblé depuis le dépôt sans secrets',()=>{
 assert.match(build,/appsscript\.json/);
 assert.match(build,/\.gs/);
 assert.doesNotMatch(build,/\.clasprc|CLASPRC_JSON/);
});
