const test=require('node:test'),assert=require('node:assert/strict');
const {validate}=require('../scripts/verify-test-deploy.js');
const id='TEST_APP_SCRIPT_ID_1234567890';
const valid=()=>({scriptId:id,expectedScriptId:id,credentials:JSON.stringify({tokens:{default:{access_token:'fictitious'}}}),manifestText:JSON.stringify({runtimeVersion:'V8',oauthScopes:['https://www.googleapis.com/auth/spreadsheets']})});
test('preflight accepte une cible TEST explicitement confirmée',()=>assert.equal(validate(valid()),true));
test('refuse les identifiants non confirmés',()=>assert.throws(()=>validate({...valid(),expectedScriptId:'OTHER_SCRIPT_ID_123456789'}),/non confirmé/));
test('refuse une cible vide ou invalide',()=>assert.throws(()=>validate({...valid(),scriptId:'x'}),/invalide/));
test('refuse un jeton manquant',()=>assert.throws(()=>validate({...valid(),credentials:'{}'}),/invalide/));
test('refuse un JSON de jeton invalide sans fuite',()=>assert.throws(()=>validate({...valid(),credentials:'{private-secret'}),/mal formée/));
test('refuse permissions Drive même en complément de Sheets',()=>{
 const data=valid();data.manifestText=JSON.stringify({runtimeVersion:'V8',oauthScopes:['https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/drive']});
 assert.throws(()=>validate(data),/Permissions/);
});
test('refuse une extension des permissions et un manifeste invalide',()=>{
 assert.throws(()=>validate({...valid(),manifestText:'{}'}),/Permissions/);
 assert.throws(()=>validate({...valid(),manifestText:'not JSON'}),/Manifeste/);
});
