#!/usr/bin/env node
/** Preflight for TEST deployment only. Never display secrets or identifiers. */
const fs=require('node:fs');
const path=require('node:path');

function validate({scriptId,credentials,manifestText,expectedScriptId}){
  if(typeof scriptId!=='string'||!/^[A-Za-z0-9_-]{20,}$/.test(scriptId))
    throw Error('Identifiant Apps Script TEST invalide');
  if(typeof expectedScriptId!=='string'||scriptId!==expectedScriptId)
    throw Error('Projet de déploiement non confirmé');
  if(typeof credentials!=='string'||!credentials.trim())
    throw Error('Authentification clasp absente');
  let auth,manifest;
  try{auth=JSON.parse(credentials);}catch(_e){throw Error('Authentification clasp mal formée');}
  if(!auth||typeof auth!=='object'||Array.isArray(auth)||(!auth.tokens&&!auth.token))
    throw Error('Authentification clasp invalide');
  try{manifest=JSON.parse(manifestText);}catch(_e){throw Error('Manifeste Apps Script mal formé');}
  const allowed=['https://www.googleapis.com/auth/spreadsheets'];
  if(manifest.runtimeVersion!=='V8'||!Array.isArray(manifest.oauthScopes)||
     manifest.oauthScopes.length!==allowed.length||
     manifest.oauthScopes.some((scope,i)=>scope!==allowed[i]))
    throw Error('Permissions Apps Script différentes de la liste approuvée');
  return true;
}

if(require.main===module){
  try{
    const file=path.join(__dirname,'..','dist','appsscript.json');
    validate({
      scriptId:process.env.APPS_SCRIPT_TEST_ID,
      expectedScriptId:process.env.CONFIRMED_TEST_SCRIPT_ID,
      credentials:process.env.CLASPRC_JSON,
      manifestText:fs.readFileSync(file,'utf8')
    });
    process.stdout.write('Preflight TEST validé. Aucune écriture Google effectuée.\n');
  }catch(_e){
    // Never print exception internals: credentials or IDs may be involved.
    process.stderr.write('Preflight TEST refusé : vérifier la configuration, les identifiants et les scopes.\n');
    process.exitCode=1;
  }
}
module.exports={validate};
