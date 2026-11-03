const test = require('node:test');
const assert = require('node:assert/strict');
const {transitionPlan,phraseTransitionDelay} = require('../app/engine.js');
test('confident compatible beat grids get a 32 beat mix',()=>{
 const p=transitionPlan({bpm:120,confidence:.9,energy:.5},{bpm:122,confidence:.8,energy:.55});
 assert.equal(p.beats,32);assert.equal(p.duration,16);assert.equal(p.mode,'BEATGRID PHRASE MIX');
});
test('large energy jump shortens mix to 16 beats',()=>{
 assert.equal(transitionPlan({bpm:120,confidence:.9,energy:.1},{bpm:120,confidence:.9,energy:.8}).beats,16);
});
test('unverified or incompatible grids never perform tempo match',()=>{
 for(const p of [transitionPlan({bpm:90,confidence:.9},{bpm:150,confidence:.9}),transitionPlan({bpm:120,confidence:.1},{bpm:122,confidence:.9})]){
 assert.equal(p.beats,0); assert.equal(p.rate,1);
 }
});
test('phrase delay aligns on 16-beat boundary and accepts an existing boundary',()=>{
 assert.equal(phraseTransitionDelay(0,8,120,0,16),0);
 assert.ok(Math.abs(phraseTransitionDelay(3,8,120,0,16)-5)<1e-9);
});
