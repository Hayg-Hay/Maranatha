// Geometry mocks verify measurement ordering, not real-browser appearance.
import assert from 'node:assert/strict';
import { measureGrammarChipCard } from './tools/grammar-chip-layout-fixture.mjs';

function specimen({ width = 104, chipWidth = 60, wrap = false, overlap = false, clipped = false } = {}) {
  let baselineWidth = 72;
  const origin = () => ({left:wrap && baselineWidth > 72 ? 0 : 100 + baselineWidth - 72, top:wrap && baselineWidth > 72 ? 180 : 100});
  const rectangle = (left, top, width, height) => ({left,top,right:left+width,bottom:top+height,width,height});
  const baseline = {style:{set width(value) { baselineWidth = parseFloat(value); }},getBoundingClientRect:() => rectangle(0,0,baselineWidth,90)};
  const chip = {scrollWidth:clipped?80:60, clientWidth:60, getBoundingClientRect:() => rectangle(origin().left+10,origin().top+90,chipWidth,16)};
  const caret = {getBoundingClientRect:() => rectangle(origin().left+10+chipWidth+(overlap?-4:4),origin().top+92,6,10)};
  const card = {getBoundingClientRect:() => rectangle(origin().left,origin().top,width,109), querySelector:s => s === '.iw-case-chip' ? chip : caret};
  const style = () => ({borderLeftWidth:'1px',borderRightWidth:'1px',paddingLeft:'7px',paddingRight:'7px'});
  return () => measureGrammarChipCard(baseline,card,style);
}

let checks = 0;
function check(name, run) { run(); checks++; console.log('PASS ' + name); }
check('remeasures card position after baseline moves its flex sibling', () => {
  const measure = specimen();
  assert.equal(measure().fits,true);
  assert.deepEqual(measure(),measure());
  assert.equal(measure().heightDelta,19);
});
check('remeasures both axes when equal-width baseline forces a new flex row', () => assert.equal(specimen({wrap:true})().fits,true));
check('real overflow still fails and identifies the offending elements', () => {
  const result = specimen({chipWidth:100})();
  assert.equal(result.fits,false);
  assert.ok(result.issues.includes('chip outside card content'));
  assert.ok(result.issues.includes('caret outside card content'));
});
check('overlap and text clipping still fail separately', () => {
  assert.ok(specimen({overlap:true})().issues.includes('chip and caret overlap'));
  assert.ok(specimen({clipped:true})().issues.includes('chip text clipped'));
});
console.log(`\n${checks}/${checks} layout-checker logic checks passed (mock geometry only).`);
