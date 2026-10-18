#!/usr/bin/env node
/**
 * AKAD unified Obsidian vault bootstrap. No third-party dependencies.
 * Usage (from repository root):
 *   node scripts/setup-obsidian-vault.mjs              # preflight only
 *   node scripts/setup-obsidian-vault.mjs --apply      # create root vault config
 *   node scripts/setup-obsidian-vault.mjs --retire     # archive/remove nested .obsidian after validation
 *
 * Does not move/delete actual knowledge notes, or touch application files.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const repo = process.cwd();
const nested = ['Understand the System', 'Source Documents', 'Implementation'];
const documents = [
  'Understand the System/System Understanding/Start Here.md',
  'Source Documents/Documentation/REvised/AKAD_System_Design.md',
  'Implementation/Backend-Requirement-Matrix.md',
  '.project-memory/MEMORY.md',
  '.project-memory/process-context.md',
  '.project-memory/AKAD_Approval.md',
  '.project-memory/AKAD_Requirements_Changes.md',
  '.project-memory/AKAD_Ideas_and_Concepts.md',
  '00 Second Brain Home/Home.md',
];
const ignores = [
  'admin/', 'api/', 'css/', 'db/', 'js/', 'tests/', 'vendor/',
  'uploads/', 'event-rental/', 'scripts/', 'docs/'
];
const flag = process.argv.slice(2);
if (flag.length > 1 || flag.some(x => !['--apply','--retire','--verify'].includes(x))) {
  console.error('Usage: node scripts/setup-obsidian-vault.mjs [--apply | --retire | --verify]');
  process.exit(2);
}
const command = flag[0] || 'dry-run';
const at = (p) => path.join(repo, ...p.split('/'));
const exists = (p) => fs.existsSync(at(p));
const json = (p) => JSON.parse(fs.readFileSync(at(p), 'utf8'));
const copyIfMissing = (src, dst) => {
  if (!exists(src) || exists(dst)) return false;
  fs.copyFileSync(at(src),at(dst)); return true;
};
const assertRepo = () => {
  for (const root of ['.git', 'api', 'db', 'admin', 'Understand the System', 'Implementation', 'Source Documents', '.project-memory']) {
    if (!exists(root)) throw new Error(`Missing '${root}'. Run from your cloned Rental-Ops-Manager repository root.`);
  }
};
function printPreflight() {
  console.log(`Repository: ${repo}`);
  for (const doc of documents) console.log(`${exists(doc) ? 'OK' : 'MISSING'}  ${doc}`);
  for (const item of nested) console.log(`${exists(`${item}/.obsidian`) ? 'EXISTS' : 'ABSENT'}  ${item}/.obsidian`);
  if (exists('.obsidian/app.json')) console.log('Root .obsidian/app.json: present');
  else console.log('Root .obsidian/app.json: not created yet');
}
function backupItems(paths, label) {
  const parent = path.dirname(repo);
  const stamp = new Date().toISOString().replace(/[:.]/g,'-');
  const root = path.join(parent, `${path.basename(repo)}-obsidian-backup-${stamp}-${crypto.randomBytes(3).toString('hex')}`);
  fs.mkdirSync(root, {recursive:true});
  for (const p of paths) {
    if (!exists(p)) continue;
    const target = path.join(root,...p.split('/'));
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.cpSync(at(p),target,{recursive:true,errorOnExist:true,force:false});
  }
  // Document what was backed up, outside the repository and public docroot.
  fs.writeFileSync(path.join(root,'BACKUP-INFO.txt'),`AKAD Obsidian ${label}\nSource: ${repo}\nCreated: ${new Date().toISOString()}\nDo not place this folder in the public webroot.\n`);
  console.log(`Backup outside repo: ${root}`);
  return root;
}
function writeJson(file, data) {fs.writeFileSync(at(file),JSON.stringify(data,null,2)+'\n','utf8');}
function apply() {
  assertRepo();
  const required = documents.filter(p=>!p.startsWith('00 Second Brain Home/') && !exists(p));
  if (required.length) throw new Error('Missing required source notes: '+required.join(', '));
  const filesToBackup = [...nested.map(n=>`${n}/.obsidian`), '.gitignore'];
  if (exists('.obsidian')) filesToBackup.push('.obsidian');
  backupItems(filesToBackup,'configuration bootstrap');
  fs.mkdirSync(at('.obsidian'),{recursive:true});
  for (const f of ['appearance.json','core-plugins.json','graph.json']) {
    const src=`Understand the System/.obsidian/${f}`, dst=`.obsidian/${f}`;
    if (copyIfMissing(src,dst)) console.log(`Seeded ${dst}`);
  }
  const pluginsPath='.obsidian/core-plugins.json';
  if (exists(pluginsPath)) {
    const plugins=json(pluginsPath);
    // Avoid accidentally turning on cloud sync/publishing for a repository containing app code and memory.
    plugins.sync=false; plugins.publish=false;
    writeJson(pluginsPath,plugins);
  }
  const configPath='.obsidian/app.json';
  let settings=exists(configPath)?json(configPath):{};
  settings.alwaysUpdateLinks=true;
  settings.attachmentFolderPath=settings.attachmentFolderPath||'06 Vault Attachments';
  settings.userIgnoreFilters=[...new Set([...(Array.isArray(settings.userIgnoreFilters)?settings.userIgnoreFilters:[]),...ignores])];
  writeJson(configPath,settings);
  console.log('Created/updated root .obsidian/ configuration.');
  let g=exists('.gitignore')?fs.readFileSync(at('.gitignore'),'utf8'):'';
  g=g.split(/\r?\n/).filter(x=>x.trim()!=='!.project-memory/sync-vault.sh').join('\n').replace(/\n+$/,'')+'\n';
  const block=['# Obsidian: keep local window/plugin runtime state out of Git', '/.obsidian/workspace.json','/.obsidian/workspace-mobile.json','/.obsidian/plugins/','/.obsidian/cache/'];
  const add=block.filter(x=>!g.split('\n').includes(x));
  if(add.length){g+='\n'+add.join('\n')+'\n';fs.writeFileSync(at('.gitignore'),g,'utf8');console.log('Updated .gitignore for local Obsidian runtime state.');}
  console.log('Existing knowledge files and the three nested .obsidian directories were NOT moved or deleted.');
  console.log('Next: open the REPOSITORY ROOT as an Obsidian vault, enable Hidden Folders Access for .project-memory, then verify links.');
  console.log('After validation and with Obsidian CLOSED, run: node scripts/setup-obsidian-vault.mjs --retire');
}
function retire() {
  assertRepo();
  if(!exists('.obsidian/app.json')) throw new Error('Root vault not initialized; run --apply first.');
  const targets=nested.map(n=>`${n}/.obsidian`).filter(exists);
  if(!targets.length){console.log('No nested .obsidian directories remain. Nothing to retire.');return;}
  const root=backupItems(targets,'retire nested vault settings');
  // Validate backups exactly before deleting any original folder.
  function fingerprint(dir){
    const result=[];
    const walk=(d,p='')=>{for(const ent of fs.readdirSync(d,{withFileTypes:true})){const name=path.join(p,ent.name),f=path.join(d,ent.name);if(ent.isDirectory())walk(f,name);else if(ent.isFile())result.push([name,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]);else throw new Error('Unsupported symlink in settings: '+f);}};
    walk(dir);return JSON.stringify(result.sort((a,b)=>a[0].localeCompare(b[0])));
  }
  for(const original of targets){const backup=path.join(root,...original.split('/'));if(fingerprint(at(original))!==fingerprint(backup))throw new Error('Backup verification failed for '+original+'; no settings were deleted.');}
  for(const original of targets){fs.rmSync(at(original),{recursive:true,force:false});console.log(`Retired ${original} (verified archive in ${root})`);}
  console.log('All source notes, diagrams, implementation plans and .project-memory files are unchanged.');
  console.log('Review `git status` and commit only when satisfied.');
}
function verify() {
  assertRepo();printPreflight();
  let ok=true;
  for(const doc of documents){if(!exists(doc))ok=false;}
  if(!exists('.obsidian/app.json')) ok=false;
  else {const cfg=json('.obsidian/app.json');if(!cfg.alwaysUpdateLinks || !Array.isArray(cfg.userIgnoreFilters))ok=false;}
  console.log(ok?'PASS: required documents and root vault config exist.':'FAIL: setup has missing notes/configuration.');
  // Can't automatically certify link rendering, community plugins, Obsidian Sync or production isolation.
  console.log('Manual checks still needed: Obsidian opens dashboard; dotfolder indexed with desktop plugin; no production exposure.');
  if(!ok)process.exitCode=1;
}
try {
  if(command==='--apply')apply();
  else if(command==='--retire')retire();
  else if(command==='--verify')verify();
  else {assertRepo();printPreflight();console.log('Dry-run only. Use --apply to create the root vault settings.');}
}catch(err){console.error('ERROR:',err.message);process.exitCode=1;}
