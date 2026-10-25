#!/usr/bin/env node
/** Production preflight: no secrets or script IDs in errors. No Google API call. */
const fs=require('node:fs');
const path=require('node:path');
function validate(input){
 const {approved,prodId,confirmedId,testId,credentials,manifestText}=input;
 if(approved!=='YES')throw Error('MVP not approved');
 if(typeof prodId!=='string'||!/^[a-zA-Z0-9_-]{20,}$/.test(prodId))throw Error('Production target invalid');
 if(prodId!==confirmedId)throw Error('Production target not confirmed');
 if(!testId||prodId===testId)throw Error('Production and test target must differ');
 if(typeof credentials!=='string'||!credentials.trim())throw Error('No credentials');
 let auth,manifest;
 try{auth=JSON.parse(credentials);}catch(_e){throw Error('Bad credentials JSON');}
 if(!auth||typeof auth!=='object'||Array.isArray(auth)||(!auth.tokens&&!auth.token))throw Error('Bad credentials');
 try{manifest=JSON.parse(manifestText);}catch(_e){throw Error('Bad manifest JSON');}
 const allowed=['https://www.googleapis.com/auth/spreadsheets'];
 if(manifest.runtimeVersion!=='V8'||!Array.isArray(manifest.oauthScopes)||
    manifest.oauthScopes.length!==allowed.length||manifest.oauthScopes.some((x,i)=>x!==allowed[i]))
   throw Error('Unapproved OAuth scopes');
 return true;
}
if(require.main===module){
 try{
  validate({approved:process.env.APPROVED,prodId:process.env.PROD_ID,
   confirmedId:process.env.CONFIRMED_ID,testId:process.env.TEST_ID,
   credentials:process.env.CLASPRC,
   manifestText:fs.readFileSync(path.join(__dirname,'../dist/appsscript.json'),'utf8')});
  process.stdout.write('Production preflight passed. No deployment yet.\n');
 }catch(_err){
  process.stderr.write('Production preflight rejected: review approvals, target, credentials and scopes.\n');
  process.exitCode=1;
 }
}
module.exports={validate};
