// Loads game source files (plain browser scripts) into a sandbox so their pure functions can be tested in Node.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

export function load(files, globals = {}, expose = []) {
  const ctx = vm.createContext(Object.assign({ Intl, Date, Math, JSON, String, Number, Array, Object, Uint8Array, URLSearchParams, console }, globals));
  for (const f of files) vm.runInContext(readFileSync(new URL(`../../src/${f}`, import.meta.url), 'utf8'), ctx, { filename: f });
  // const declarations stay inside the script scope: copy the ones we need onto the sandbox object
  vm.runInContext(expose.map(n => `this.${n} = ${n};`).join('\n'), ctx);
  return ctx;
}
