// check.mjs — structural rules for the question set. Run before publishing.
import { Q } from './questions.js';

const fail = [];
const say = (i, m) => fail.push(`  ${String(i + 1).padStart(2, '0')} ${Q[i].tag}: ${m}`);

Q.forEach((q, i) => {
  const kind = q.kind || 'mc';
  if (!q.obj || !/^\d+\.\d+\/O\d+$/.test(q.obj)) say(i, `bad obj "${q.obj}"`);
  if (!q.tag) say(i, 'no tag');
  if (!Array.isArray(q.o) || q.o.length < 3) say(i, 'needs at least 3 options');
  if (q.o.length > 7) say(i, 'more options than there are letters');

  if (kind === 'mc') {
    if (typeof q.key !== 'number' || !(q.key in q.o)) say(i, `key ${q.key} out of range`);
    q.o.forEach((_, j) => {
      if (j !== q.key && !q.diag[j]) say(i, `option ${'ABCDEFG'[j]} has no named error`);
    });
    Object.keys(q.diag).forEach((j) => {
      if (+j === q.key) say(i, 'the correct option is tagged as an error');
      if (!(+j in q.o)) say(i, `diag names option ${j}, which does not exist`);
    });
  } else if (kind === 'multi') {
    if (!Array.isArray(q.keys) || !q.keys.length) say(i, 'no keys');
    if (q.keys.length === q.o.length) say(i, 'every option is correct — nothing is being asked');
    q.keys.forEach((j) => {
      if (!(j in q.o)) say(i, `key ${j} out of range`);
      if (!q.miss || !q.miss[j]) say(i, `option ${'ABCDEFG'[j]} belongs but has no note on omitting it`);
    });
    q.o.forEach((_, j) => {
      if (!q.keys.includes(j) && !q.diag[j]) say(i, `option ${'ABCDEFG'[j]} has no named error`);
    });
  } else say(i, `unknown kind "${kind}"`);

  if (new Set(q.o).size !== q.o.length) say(i, 'duplicate options');
});

const parts = Q.filter((q) => q.part).length;
const multi = Q.filter((q) => q.kind === 'multi').length;
const secs = [...new Set(Q.map((q) => q.obj.split('/')[0]))].sort();

console.log(`${Q.length} questions · ${parts} parts · ${multi} multi-select`);
console.log(`sections covered: ${secs.join(', ')}`);
const per = {};
for (const q of Q) per[q.obj.split('/')[0]] = (per[q.obj.split('/')[0]] || 0) + 1;
console.log('per section:', JSON.stringify(per));
if (fail.length) { console.log(`\n${fail.length} problems:`); console.log(fail.join('\n')); process.exit(1); }
console.log('\nevery option carries a named error.');
