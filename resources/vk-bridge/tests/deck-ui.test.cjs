const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'app/index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app/app.js'),'utf8');
test('both decks have their own play pause, cue, sync, and seek',()=>{
for(const deck of ['a','b']){const upper=deck.toUpperCase();assert.match(html,new RegExp(`data-deck="${deck}" data-action="toggle"`));assert.match(html,new RegExp(`data-deck="${deck}" data-action="cue"`));assert.match(html,new RegExp(`data-deck="${deck}" data-action="sync"`));assert.match(html,new RegExp(`id="deck${upper}Seek"`))}
assert.match(app,/engine\.toggleDeck\(deck\)/);assert.match(app,/deck\.seek\(Number\(input\.value\)\)/);
});
test('UI preserves real model-backed separation and individual cue outputs',()=>{assert.match(html,/class="separate-stems" data-deck="a"/);assert.match(html,/class="separate-stems" data-deck="b"/);assert.match(app,/engine\.installStems\(deckName,entry\.stems\)/);assert.match(html,/id="cueOutput"/)});
