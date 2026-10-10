import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {execFileSync} from 'node:child_process';
const root=process.cwd(),dir=await mkdtemp(join(tmpdir(),'social-archive-'));try{
 const archive=execFileSync('git',['archive','HEAD'],{cwd:root,maxBuffer:30*1024*1024});execFileSync('tar',['-xf','-','-C',dir],{input:archive});
 execFileSync('npm',['ci','--ignore-scripts','--cache','/tmp/social-lab-npm-cache'],{cwd:dir,stdio:'inherit'});
 for(const cmd of ['check','test','build','verify:consumer'])execFileSync('npm',['run',cmd],{cwd:dir,stdio:'inherit'});
 console.log('PASS: clean tracked git archive → npm ci → check → tests → build → external consumer.');
}finally{await rm(dir,{recursive:true,force:true});}
