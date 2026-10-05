import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

// A successful bundler exit alone does not guarantee a usable Pages export.
const manifest = JSON.parse(readFileSync('dist/server/vinext-prerender.json', 'utf8'));
assert(manifest.routes.some(route => route.route === '/' && route.status === 'rendered'),
  'The portfolio homepage was not statically rendered');
const html = readFileSync('dist/client/index.html', 'utf8');
assert(html.includes('id="content"') && html.includes('id="work"'),
  'The exported homepage is missing its content');
assert(!html.includes('id="__next_error__"'), 'The exported homepage contains a server error');
console.log('Static homepage export verified.');
