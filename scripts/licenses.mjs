import {readFile,copyFile,mkdir} from 'node:fs/promises';
import {strict as assert} from 'node:assert';

const dependencies=[
 ['react','LICENSE','React runtime and JSX runtime','MIT'],
 ['react-dom','LICENSE','React DOM runtime','MIT'],
 ['scheduler','LICENSE','React scheduler runtime','MIT'],
 ['@fontsource-variable/dm-sans','LICENSE','DM Sans font files','OFL-1.1'],
 ['@fontsource/ibm-plex-mono','LICENSE','IBM Plex Mono font files','OFL-1.1'],
 ['vite','LICENSE.md','Generated modulepreload helper (Vite core license)','MIT'],
];
export async function expectedNotices(){
 const lock=JSON.parse(await readFile('package-lock.json','utf8'));
 let output='# Third-party notices / 第三者のライセンス通知\n\n'+
 'Social Interaction Lab project code is covered by LICENSE. The following components retain their own licenses and copyright notices.\n'+
 '本プロジェクトのコードには LICENSE が適用されます。以下の構成要素には、それぞれのライセンスと著作権表示が適用されます。\n\n'+
 'Scope: the built playground bundles React, React DOM, Scheduler, a Vite-generated modulepreload helper, and the listed font assets. Versions below are the exact package-lock.json resolutions, verified against the installed packages. License text is copied verbatim from each installed package; the Vite entry contains only its complete core-license section. These notices do not assert that build-time tooling dependencies are included in the playground.\n\n'+
 'The installable React component archive does not bundle these React runtimes or fonts: React is a peer dependency, and the consuming application chooses its runtime and typography. This notice is included with the archive as distribution context. Preserve the relevant notices when redistributing the corresponding software or font files. Other development dependencies retain the licenses provided with their packages.\n\n';
 for(const [name,file,purpose,license] of dependencies){
  const base=`node_modules/${name}`;const pkg=JSON.parse(await readFile(`${base}/package.json`,'utf8'));
  assert.equal(pkg.version,lock.packages[base]?.version,`${name} installed version must match lockfile`);
  assert.equal(pkg.license,license,`${name} license changed; review before release`);
  let body=await readFile(`${base}/${file}`,'utf8');
  if(name==='vite'){const boundary='\n# Licenses of bundled dependencies';assert.ok(body.includes(boundary));body=body.slice(0,body.indexOf(boundary));}
  output+=`## ${name} ${pkg.version}\n\n${purpose}. License: ${license}. Source: ${base}/${file}.\n\n`+body+(body.endsWith('\n')?'':'\n')+'\n';
 }
 return output;
}
export async function verifyLicenseSources(){
 const pkg=JSON.parse(await readFile('package.json','utf8')),lock=JSON.parse(await readFile('package-lock.json','utf8'));
 assert.equal(pkg.license,'MIT');assert.equal(lock.packages[''].license,'MIT');assert.equal(pkg.private,true,'Keep the npm publishing guard');
 const license=await readFile('LICENSE','utf8');assert.ok(license.startsWith('MIT License\n\nCopyright (c) 2026 domizo\n'));assert.ok(license.includes('THE SOFTWARE IS PROVIDED "AS IS"'));
 assert.equal(await readFile('THIRD_PARTY_NOTICES.md','utf8'),await expectedNotices(),'Update third-party notices intentionally when resolved dependencies change');
 return {license,notices:await readFile('THIRD_PARTY_NOTICES.md','utf8')};
}
export async function prepareServedNotices(){
 await verifyLicenseSources();await mkdir('public',{recursive:true});
 await copyFile('LICENSE','public/LICENSE.txt');await copyFile('THIRD_PARTY_NOTICES.md','public/THIRD_PARTY_NOTICES.txt');
}
