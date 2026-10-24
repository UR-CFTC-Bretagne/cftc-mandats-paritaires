const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
for(const file of fs.readdirSync(path.join(__dirname,'../src')).filter(f=>f.endsWith('.gs'))){
 new vm.Script(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),{filename:file});
 console.log('Syntaxe OK : '+file);
}
