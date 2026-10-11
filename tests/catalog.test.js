import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, collections, findStudy } from '../src/data.js';
import { buildsA } from '../src/effects-a.js';
import { buildsB } from '../src/effects-b.js';
import { buildsC } from '../src/effects-c.js';

test('exactly 100 studies, unique identifiers and titles', () => {
  assert.equal(catalog.length,100);
  assert.equal(new Set(catalog.map(s=>s.id)).size,100);
  assert.equal(new Set(catalog.map(s=>s.title)).size,100);
  assert.equal(catalog[0].id,'study-001');
  assert.equal(catalog.at(-1).id,'study-100');
});
test('10 categories, 10 studies per category, 20 builders', () => {
  assert.equal(collections.length,10);
  const engines={...buildsA,...buildsB,...buildsC};
  assert.equal(Object.keys(engines).length,20);
  for(const coll of collections) {
    const studies=catalog.filter(s=>s.category===coll.key);
    assert.equal(studies.length,10);
    assert.equal(coll.families.length,2);
    for(const s of studies) {
      assert.equal(typeof engines[s.family],'function');
      assert.ok(s.variant>=0&&s.variant<=4);
    }
  }
});
test('links, summaries and find behavior', () => {
  for(const s of catalog) {
    assert.match(s.reference.url,/^https:\/\/www\.awwwards\.com\/sites\//);
    assert.ok(s.summary.length>20);
    assert.ok(s.tip.length>20);
  }
  assert.equal(findStudy('study-050').number,50);
  assert.equal(findStudy('unknown').number,1);
});
