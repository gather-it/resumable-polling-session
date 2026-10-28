import {createSession} from '../dist/index.js';
export const tick=()=>new Promise(resolve=>setImmediate(resolve));
export const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
export const protocol={select:s=>s.initial?{request:'initial'}:s.commands.length?{request:s.commands[0].value,command:s.commands[0]}:s.complete?undefined:{request:'poll',waitsForCadence:true,interruptible:true},advance:(cursor,r)=>({cursor:cursor+1,complete:r.complete??true,pollAfterMs:r.delay??0})};
export const session=(options={})=>createSession({scope:{id:'synthetic'},cursor:0,protocol,operation:async()=>({complete:true}),onResponse:()=>{},...options});


import {spawnSync as packedSpawn} from 'node:child_process';
import {mkdtempSync as packedTemp, writeFileSync as packedWrite, rmSync as packedRemove} from 'node:fs';
import {tmpdir as packedTmpdir} from 'node:os';
import {join as packedJoin} from 'node:path';
import {fileURLToPath as packedPath} from 'node:url';
export function verifyPacked(t, exercise) {
  const directory=packedTemp(packedJoin(packedTmpdir(),'consumer-'));
  t.after(()=>packedRemove(directory,{recursive:true,force:true}));
  const root=packedPath(new URL('../',import.meta.url));
  const run=(command,args,cwd)=>{
    const result=packedSpawn(command,args,{cwd,encoding:'utf8',timeout:60000});
    if(result.status!==0) throw new Error('Packed consumer check failed: '+String(result.stderr).slice(0,400));
    return result.stdout;
  };
  const npm=process.platform==='win32'?'npm.cmd':'npm';
  const cache=packedJoin(directory,'cache');
  const [manifest]=JSON.parse(run(npm,['pack','--ignore-scripts','--json','--pack-destination',directory,'--cache',cache],root));
  if(!manifest.files.length || !manifest.files.every(file=>file.path==='package.json'||file.path==='README.md'||file.path==='LICENSE'||file.path.startsWith('dist/'))) throw new Error('Unexpected packed files');
  if(!manifest.files.some(file=>file.path==='LICENSE')) throw new Error('Packed license missing');
  if(manifest.files.some(file=>file.path.endsWith('.map'))) throw new Error('Source maps must not ship');
  packedWrite(packedJoin(directory,'package.json'),JSON.stringify({name:'isolated-consumer',private:true,type:'module'}));
  run(npm,['install','--offline','--ignore-scripts','--omit=dev','--no-audit','--no-fund','--package-lock=false','--cache',cache,packedJoin(directory,manifest.filename)],directory);
  packedWrite(packedJoin(directory,'exercise.mjs'),exercise);
  run(process.execPath,['exercise.mjs'],directory);
}
