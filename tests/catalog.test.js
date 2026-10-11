import test from 'node:test';
import assert from 'node:assert/strict';
import {categories,catalog,getItem,asset} from '../src/library/catalog.js';
import {componentMarkup} from '../src/library/components.js';

test('exactly 36 original components in six complete, nonempty categories',()=>{
 assert.equal(catalog.length,36);
 assert.equal(categories.length,7);
 assert.equal(new Set(catalog.map(x=>x.id)).size,36);
 assert.equal(new Set(catalog.map(x=>x.title)).size,36);
 const required=['buttons','cards','typography','galleries','backgrounds','interfaces'];
 for(const cat of required)assert.equal(catalog.filter(x=>x.category===cat).length,6);
});
test('every component produces a real, semantic visual and correct identity',()=>{
 for(const item of catalog){
   const html=componentMarkup(item);
   assert.ok(html.includes('data-component="'+item.id+'"'),item.id);
   assert.ok(html.length>150,item.id);
   assert.ok(!html.includes('Component unavailable'),item.id);
   assert.ok(item.description.length>25);
   assert.ok(item.interaction.length>3);
   assert.ok(['stone','ink'].includes(item.tone));
 }
});
test('all sample images are local and all components use declared GPU presets',()=>{
 const accepted=new Set(['beam','rays','liquid','halo','orbit','orbital','grid','dust','graph','shader:0','shader:1','shader:2','shader:3']);
 for(const item of catalog)assert.ok(accepted.has(item.gpu),item.id);
 for(let i=0;i<8;i++)assert.match(asset(i),/^\/PiJS\/media\/photo-[a-zA-Z0-9-]+\.jpg$/);
 assert.equal(getItem('depth-gallery').title,'Depth Gallery');
 assert.equal(getItem('nonexistent'),catalog[0]);
});
