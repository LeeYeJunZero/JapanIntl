import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { schools, categories, regions, curricula, tags } from '../src/data.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
execFileSync(process.execPath, [join(ROOT, 'scripts/build.js')]);

const walk = (d) => readdirSync(d).flatMap((f) => statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]);
const htmls = walk(DIST).filter((f) => f.endsWith('index.html'));

test('data references are valid', () => {
  const has = (list, s) => list.some((x) => x.slug === s);
  assert.equal(new Set(schools.map((s) => s.slug)).size, schools.length);
  for (const s of schools) {
    assert.ok(has(categories, s.cat) && has(regions, s.region), s.slug);
    for (const c of s.curr) assert.ok(has(curricula, c), `${s.slug} ${c}`);
    for (const t of s.tags) assert.ok(has(tags, t), `${s.slug} ${t}`);
  }
});

test('every school gets a page', () => {
  for (const s of schools) assert.ok(existsSync(join(DIST, 'schools', s.slug, 'index.html')), s.slug);
  assert.ok(htmls.length > 100, `only ${htmls.length} pages`);
});

test('every internal link resolves', () => {
  for (const f of htmls) {
    for (const [, href] of readFileSync(f, 'utf8').matchAll(/(?:href|src)="([^"#:]*)"/g)) {
      if (!href) continue;
      const target = resolve(dirname(f), href);
      assert.ok(existsSync(href.endsWith('/') ? join(target, 'index.html') : target), `${f} -> ${href}`);
    }
  }
});
