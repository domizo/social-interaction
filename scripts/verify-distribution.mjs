import {readFile,readdir} from 'node:fs/promises';
import {strict as assert} from 'node:assert';
import {execFileSync} from 'node:child_process';
import {verifyLicenseSources} from './licenses.mjs';

const {license,notices}=await verifyLicenseSources();
const root=JSON.parse(await readFile('package.json','utf8'));
const archive=`public/downloads/social-interaction-lab-react-${root.version}.tgz`;
for(const dir of ['public','dist']){
 assert.equal(await readFile(`${dir}/LICENSE.txt`,'utf8'),license,`${dir}: exact project license`);
 assert.equal(await readFile(`${dir}/THIRD_PARTY_NOTICES.txt`,'utf8'),notices,`${dir}: complete third-party notice`);
}
for(const file of ['LICENSE','THIRD_PARTY_NOTICES.md']){
 const source=await readFile(file,'utf8');assert.equal(await readFile(`package/${file}`,'utf8'),source);
 assert.equal(execFileSync('tar',['-xOf',archive,`package/${file}`],{encoding:'utf8'}),source,`archive: exact ${file}`);
}
const pkg=JSON.parse(execFileSync('tar',['-xOf',archive,'package/package.json'],{encoding:'utf8'}));
assert.equal(pkg.license,'MIT');assert.equal(pkg.private,true);assert.equal(pkg.version,root.version);
assert.deepEqual(await readFile(`dist/downloads/social-interaction-lab-react-${root.version}.tgz`),await readFile(archive));
const demoLink=/https?:\/\/[^\s"'<>)]*\.chatgpt\.site(?:[\/\s"'<>)]|$)/i;
async function scan(path){for(const entry of await readdir(path,{withFileTypes:true})){const name=`${path}/${entry.name}`;if(entry.isDirectory())await scan(name);else if(/\.(?:md|txt|json|tsx?|m?js|css|html|ya?ml)$/.test(entry.name))assert.ok(!demoLink.test(await readFile(name,'utf8')),`Remove authored demo-site link: ${name}`);}}
for(const dir of ['src','docs','scripts','tests','e2e','.github','package','dist'])await scan(dir);
for(const file of ['README.md','README.ja.md','CHANGELOG.md','CONTRIBUTING.md','LICENSE','THIRD_PARTY_NOTICES.md'])assert.ok(!demoLink.test(await readFile(file,'utf8')),`Remove authored demo-site link: ${file}`);
assert.ok(!JSON.stringify(pkg).includes('UNLICENSED'));
console.log('PASS: MIT metadata, exact installed runtime/font licenses, served notices, packed license/notices, unchanged downloaded archive, and no authored hosted-demo links.');
