// questions.js — the single definition, shared by the student page and the
// projector view. Two copies would silently drift, and a live histogram
// labelled with the wrong question is worse than no histogram.
//
// Each question targets one objective of section 1.1. Each wrong answer maps to
// a documented error rather than being a random decoy, so what comes back is a
// profile of what to teach rather than a score. These are written for this
// diagnostic; they are not the homework.

export const Q = [
  { obj: '1.1/O3', tag: 'order of operations · sticky sign',
    t: 'What is <code>&minus;9<sup>2</sup></code>?',
    o: ['81', '&minus;81', '&minus;18', 'undefined'],
    key: 1,
    diag: { 0: 'sticky-sign: reads the minus as part of the base' } },

  { obj: '1.1/O3', tag: 'order of operations · precedence',
    t: 'What is <code>10 &minus; 2 &times; 4</code>?',
    o: ['32', '2', '&minus;2', '18'],
    key: 1,
    diag: { 0: 'left-to-right: subtracts before multiplying' } },

  { obj: '1.1/O3', tag: 'order of operations · grouping bar',
    t: 'What is <code>(6 + 4) &divide; 2</code>?',
    o: ['5', '8', '7', '3'],
    key: 0,
    diag: { 1: 'divides only the last term instead of the whole group' } },

  { obj: '1.1/O2', tag: 'evaluate · substituting a negative',
    t: 'If <code>x = &minus;3</code>, what is <code>x<sup>2</sup> &minus; 2x</code>?',
    o: ['3', '15', '&minus;3', '&minus;15'],
    key: 1,
    diag: { 0: 'squares the value but drops the sign on the second term',
            2: 'treats x² as negative' } },

  { obj: '1.1/O1', tag: 'name the property',
    t: 'Which property does <code>3 + (5 + 2) = (3 + 5) + 2</code> show?',
    o: ['commutative', 'associative', 'distributive', 'identity'],
    key: 1,
    diag: { 0: 'confuses regrouping with reordering' } },

  { obj: '1.1/O1', tag: 'name the property',
    t: 'Which property does <code>4(x + 7) = 4x + 28</code> show?',
    o: ['associative', 'commutative', 'distributive', 'inverse'],
    key: 2, diag: {} },

  { obj: '1.1/O4', tag: 'compare reals',
    t: 'Which is larger, <code>3/8</code> or <code>0.4</code>?',
    o: ['3/8', '0.4', 'they are equal', 'cannot tell'],
    key: 1,
    diag: { 0: 'compares the numerator to the decimal digits' } },

  { obj: '1.1/O5', tag: 'interval notation',
    t: 'Which interval means <code>x &gt; 2</code>?',
    o: ['[2, &infin;)', '(2, &infin;)', '(&minus;&infin;, 2)', '(2, &infin;]'],
    key: 1,
    diag: { 0: 'includes an endpoint the strict inequality excludes',
            3: 'closes a bracket on infinity' } },
];
