import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const runner=path.join(repo,'tests/scenarios/run.mjs');
test('scenario selection cannot silently pass zero cases',()=>{
  const r=spawnSync(process.execPath,[runner,'--host','false','--only','does-not-exist'],{encoding:'utf8'});
  assert.equal(r.status,2);assert.match(r.stderr,/No scenarios match/);
});
test('matching output cannot hide a failed host process',()=>{
  const host=`'${process.execPath}' -e 'console.log("5.1 5.2 failed");process.exit(7)'`;
  const r=spawnSync(process.execPath,[runner,'--host',host,'--only','failed-runner-refused'],{encoding:'utf8'});
  const kept=r.stdout.match(/output and files kept in (.+)/)?.[1];
  try {assert.equal(r.status,1);assert.match(r.stdout,/host exited unsuccessfully: 7/);assert.match(r.stdout,/0\/1 scenarios passed/);}
  finally {if(kept)fs.rmSync(kept,{recursive:true,force:true});}
});
