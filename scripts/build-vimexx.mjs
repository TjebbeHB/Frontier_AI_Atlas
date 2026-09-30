import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'outputs/vimexx/upload');
await build({
  configFile: false,
  root: path.join(root, 'deployment/vimexx/site'),
  publicDir: false,
  plugins: [react()],
  resolve: { alias: { '@': root } },
  css: { postcss: { plugins: [tailwindcss()] } },
  build: { outDir: output, emptyOutDir: true, sourcemap: false },
});
await cp(path.join(root,'public/logos'), path.join(output,'logos'), {recursive:true});
await cp(path.join(root,'public/favicon.svg'), path.join(output,'favicon.svg'));
await cp(path.join(root,'deployment/vimexx/htaccess'), path.join(output,'.htaccess'));

async function files(directory, prefix='') {
  const result=[];
  for(const entry of await readdir(directory,{withFileTypes:true})) {
    const relative=path.posix.join(prefix,entry.name);
    if(entry.isDirectory()) result.push(...await files(path.join(directory,entry.name),relative));
    else result.push(relative);
  }
  return result.sort();
}
const list=await files(output);
const manifest=[];
for(const file of list) {
  const data=await readFile(path.join(output,file));
  manifest.push({file,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});
}
if(list.some(file=>/(^|\/)(quest|\.env|node_modules|server|\.openai)(\/|$)/.test(file)))throw new Error('Unexpected non-public file in package');
await mkdir(path.dirname(output),{recursive:true});
await writeFile(path.join(path.dirname(output),'manifest.json'),JSON.stringify({builtAt:new Date().toISOString(),files:manifest},null,2)+'\n');
console.log(`Vimexx package: ${output}\n${list.length} public files; game and server files excluded.`);
