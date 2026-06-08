#!/usr/bin/env node
// Idempotently upsert the CC-RULES managed block into a target file (CLAUDE.md).
// Usage: node apply-block.mjs <file>     (block body is read from stdin)
//
// Guarantees:
// - Existing file with a CC-RULES block      → replace only that block (user area preserved).
// - Existing file without a CC-RULES block    → append the block (existing content preserved).
// - Missing file                              → create it with the block.
// - Re-running is idempotent (no duplicate blocks).
// - Self-Learning rules accumulated after <!-- LEARN:ANCHOR --> are PRESERVED across regen.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const START = '<!-- CC-RULES:START -->';
const END = '<!-- CC-RULES:END -->';
const ANCHOR = '<!-- LEARN:ANCHOR -->';
const NOTE = '<!-- Managed by /claude-md. Edits inside this block are overwritten on regen; put custom rules outside it. -->';

const file = process.argv[2];
if (!file) { console.error('usage: apply-block.mjs <file>  (block body on stdin)'); process.exit(2); }

let body = '';
try { body = readFileSync(0, 'utf8'); } catch { /* empty */ }
body = body.replace(/^\n+|\n+$/g, '');
if (!body) { console.error('error: empty block body on stdin'); process.exit(2); }

let block = `${START}\n${NOTE}\n\n${body}\n${END}`;
const existing = existsSync(file) ? readFileSync(file, 'utf8') : null;

if (existing == null) {
  writeFileSync(file, block + '\n');
  console.log(`created ${file} with CC-RULES block`);
  process.exit(0);
}

const s = existing.indexOf(START);
const e = existing.indexOf(END);
if (s !== -1 && e !== -1 && e > s) {
  // preserve previously-learned rules (text between old anchor and old END)
  const oldBlock = existing.slice(s, e + END.length);
  const oai = oldBlock.indexOf(ANCHOR);
  if (oai !== -1) {
    const learned = oldBlock.slice(oai + ANCHOR.length, oldBlock.length - END.length).replace(/\s+$/, '');
    const nai = block.indexOf(ANCHOR);
    if (nai !== -1 && learned.trim()) {
      block = block.slice(0, nai + ANCHOR.length) + learned + block.slice(nai + ANCHOR.length);
    }
  }
  writeFileSync(file, existing.slice(0, s) + block + existing.slice(e + END.length));
  console.log(`updated CC-RULES block in ${file} (learned rules preserved)`);
} else {
  const sep = existing.endsWith('\n') ? '\n' : '\n\n';
  writeFileSync(file, existing + sep + block + '\n');
  console.log(`appended CC-RULES block to ${file}`);
}
process.exit(0);
