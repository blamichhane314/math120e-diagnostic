// questions.js — the single definition, shared by the student page and the
// projector view.
//
// Coverage is the span of Exam 1: sections 1.1 through 1.7 and 2.4. A second
// diagnostic after that exam can reuse this file with a different question set.
//
// Two kinds of item:
//
//   kind 'mc'     one answer. `key` is the correct index; `diag` names, for
//                 every other index, the specific error that produces it. An
//                 option with no nameable error does not belong in the list —
//                 an untagged distractor yields a response that says only
//                 "wrong", which is the least useful thing a wrong answer can
//                 say.
//
//   kind 'multi'  several answers. `keys` lists the indices that belong.
//                 `diag[i]` says why including i is a mistake; `miss[i]` says
//                 what is lost by leaving i out. These ask what a problem
//                 draws on rather than what its answer is, so they report
//                 whether a student sees a problem's structure — which is a
//                 different thing from whether they can grind it out.

export const Q = [

  /* ── arithmetic and the order of operations ─────────────────── */

  { part: 'Arithmetic and the order of operations',
    kind: 'mc', obj: '1.1/O3', tag: 'order of operations · sticky sign',
    t: 'What is <code>&minus;9<sup>2</sup></code>?',
    o: ['81', '&minus;81', '&minus;18', '&minus;9'],
    key: 1,
    diag: { 0: 'sticky sign: reads the minus as part of the base and squares &minus;9',
            2: 'multiplies the base by the exponent instead of raising to it',
            3: 'treats the exponent as having no effect' } },

  { kind: 'mc', obj: '1.1/O3', tag: 'order of operations · precedence',
    t: 'What is <code>10 &minus; 2 &times; 4</code>?',
    o: ['32', '2', '&minus;2', '18'],
    key: 1,
    diag: { 0: 'left to right: subtracts first, then multiplies 8 by 4',
            2: 'computes 2 &times; 4 &minus; 10 — the subtraction the wrong way round',
            3: 'drops the minus and adds the product' } },

  { kind: 'mc', obj: '1.1/O3', tag: 'order of operations · grouping',
    t: 'What is <code>(6 + 4) &divide; 2</code>?',
    o: ['5', '8', '7', '10'],
    key: 0,
    diag: { 1: 'divides only the last term: 6 + 4 &divide; 2',
            2: 'divides only the first term: 6 &divide; 2 + 4',
            3: 'adds inside the parentheses and never divides' } },

  { kind: 'mc', obj: '1.1/O2', tag: 'evaluate · substituting a negative',
    t: 'If <code>x = &minus;3</code>, what is <code>x<sup>2</sup> &minus; 2x</code>?',
    o: ['15', '3', '&minus;3', '&minus;15'],
    key: 0,
    diag: { 1: 'substitutes the negative into x&sup2; but treats &minus;2x as if x were positive',
            2: 'sticky sign: reads x&sup2; as &minus;9, then handles &minus;2x correctly',
            3: 'both errors: &minus;9 &minus; 6' } },

  { kind: 'mc', obj: '1.1/O1', tag: 'name the property',
    t: 'Which property does <code>4(x + 7) = 4x + 28</code> show?',
    o: ['associative', 'commutative', 'distributive', 'inverse'],
    key: 2,
    diag: { 0: 'the associative property regroups a sum; here a factor was multiplied through',
            1: 'the commutative property reorders terms; nothing was reordered',
            3: 'an inverse undoes an operation; nothing was undone' } },

  /* ── exponents and polynomials ──────────────────────────────── */

  { part: 'Exponents and polynomials',
    kind: 'mc', obj: '1.2/O2', tag: 'multiplying powers',
    t: 'Simplify <code>(2x<sup>3</sup>)(5x<sup>4</sup>)</code>.',
    o: ['10x<sup>7</sup>', '10x<sup>12</sup>', '7x<sup>7</sup>', '7x<sup>12</sup>'],
    key: 0,
    diag: { 1: 'multiplies the exponents instead of adding them',
            2: 'adds the coefficients instead of multiplying them',
            3: 'both: adds the coefficients and multiplies the exponents' } },

  { kind: 'mc', obj: '1.2/O3', tag: 'degree and leading coefficient',
    t: 'For <code>&minus;4x<sup>3</sup> + 7x<sup>2</sup> &minus; x + 9</code>, ' +
       'what are the degree and the leading coefficient?',
    o: ['degree 3, leading coefficient &minus;4',
        'degree 3, leading coefficient 4',
        'degree 4, leading coefficient 9',
        'degree 9, leading coefficient &minus;4'],
    key: 0,
    diag: { 1: 'sticky sign: drops the minus from the leading coefficient',
            2: 'counts the terms as the degree and takes the constant as leading',
            3: 'takes the largest number appearing as the degree' } },

  { kind: 'mc', obj: '1.2/O4', tag: 'subtracting polynomials',
    t: 'Simplify <code>(5x<sup>2</sup> &minus; 3x + 2) &minus; (2x<sup>2</sup> + 4x &minus; 1)</code>.',
    o: ['3x<sup>2</sup> &minus; 7x + 3', '3x<sup>2</sup> + x + 1',
        '3x<sup>2</sup> &minus; 7x + 1', '7x<sup>2</sup> + x + 1'],
    key: 0,
    diag: { 1: 'the minus reaches the first term of the bracket only',
            2: 'the minus reaches the x term but not the constant',
            3: 'adds the two polynomials instead of subtracting' } },

  { kind: 'mc', obj: '1.2/O5', tag: 'multiplying binomials',
    t: 'Simplify <code>(x + 3)(x &minus; 5)</code>.',
    o: ['x<sup>2</sup> &minus; 2x &minus; 15', 'x<sup>2</sup> &minus; 15',
        'x<sup>2</sup> + 2x &minus; 15', 'x<sup>2</sup> &minus; 8x &minus; 15'],
    key: 0,
    diag: { 1: 'multiplies first by first and last by last, with no cross terms',
            2: 'gets the middle term but with the sign reversed',
            3: 'treats both cross terms as negative: &minus;5x &minus; 3x' } },

  /* ── factoring ──────────────────────────────────────────────── */

  { part: 'Factoring',
    kind: 'mc', obj: '1.3/O1', tag: 'greatest common factor',
    t: 'Factor <code>12x<sup>3</sup> &minus; 18x<sup>2</sup></code> completely.',
    o: ['6x<sup>2</sup>(2x &minus; 3)', '6x(2x<sup>2</sup> &minus; 3x)',
        '2x<sup>2</sup>(6x &minus; 9)', '6x<sup>2</sup>(2x &minus; 3x)'],
    key: 0,
    diag: { 1: 'correct, but not complete — only one of the two common powers of x is taken out',
            2: 'correct, but not complete — only part of the common numerical factor is taken out',
            3: 'leaves an x inside that has already been taken outside' } },

  { kind: 'mc', obj: '1.3/O2', tag: 'factoring a trinomial',
    t: 'Factor <code>x<sup>2</sup> + 7x + 12</code>.',
    o: ['(x + 3)(x + 4)', '(x + 2)(x + 6)', '(x + 1)(x + 12)', '(x &minus; 3)(x &minus; 4)'],
    key: 0,
    diag: { 1: 'a pair whose product is 12 but whose sum is 8, not 7',
            2: 'takes the constant and 1 without checking the sum',
            3: 'the right numbers with both signs wrong — this expands to x&sup2; &minus; 7x + 12' } },

  { kind: 'mc', obj: '1.3/O3', tag: 'leading coefficient not 1',
    t: 'Factor <code>2x<sup>2</sup> + 7x + 3</code>.',
    o: ['(2x + 1)(x + 3)', '(2x + 3)(x + 1)', '(x + 1)(x + 3)', '(2x + 7)(x + 3)'],
    key: 0,
    diag: { 1: 'the right constants in the wrong places — this expands to 2x&sup2; + 5x + 3',
            2: 'ignores the leading coefficient entirely',
            3: 'uses the middle coefficient as one of the factors' } },

  /* ── fractions, radicals, negative exponents ────────────────── */

  { part: 'Fractions, radicals and negative exponents',
    kind: 'mc', obj: '1.4/O1', tag: 'the fraction bar groups',
    t: 'Simplify <code>(3x + 6) &divide; 3</code>.',
    o: ['x + 2', 'x + 6', '3x + 2', '2'],
    key: 0,
    diag: { 1: 'cancels the 3 against 3x only — the bar groups the whole numerator',
            2: 'cancels the 3 against the 6 only',
            3: 'cancels 3x against 3 and drops the x' } },

  { kind: 'mc', obj: '1.5/O1', tag: 'negative exponent',
    t: 'What is <code>2<sup>&minus;3</sup></code>?',
    o: ['1/8', '&minus;8', '&minus;6', '8'],
    key: 0,
    diag: { 1: 'reads a negative exponent as a negative answer',
            2: 'multiplies the base by the exponent and keeps the sign',
            3: 'ignores the minus on the exponent' } },

  { kind: 'mc', obj: '1.5/O2', tag: 'rational exponent',
    t: 'What is <code>27<sup>2/3</sup></code>?',
    o: ['9', '18', '6', '243'],
    key: 0,
    diag: { 1: 'multiplies 27 by 2/3',
            2: 'takes the cube root, then multiplies by 2 instead of squaring',
            3: 'reads the exponent as 27&sup2; &divide; 3' } },

  /* ── equations and inequalities ─────────────────────────────── */

  { part: 'Equations and inequalities',
    kind: 'mc', obj: '1.6/O1', tag: 'first-degree equation',
    t: 'Solve <code>3x &minus; 7 = 2x + 5</code>.',
    o: ['x = 12', 'x = &minus;2', 'x = 12/5', 'x = &minus;2/5'],
    key: 0,
    diag: { 1: 'subtracts 7 from both sides instead of adding it',
            2: 'adds the x terms instead of subtracting',
            3: 'both errors together' } },

  { kind: 'mc', obj: '1.6/O2', tag: 'equation with fractions',
    t: 'Solve <code>x/3 + 1/2 = 5/6</code>.',
    o: ['x = 1', 'x = 2', 'x = 1/3', 'x = 4'],
    key: 0,
    diag: { 1: 'clears the fractions correctly but never divides by the 2 left behind',
            2: 'stops at x/3 = 1/3 and reports that as x',
            3: 'adds 1/2 instead of subtracting it' } },

  { kind: 'mc', obj: '1.7/O1', tag: 'quadratic by factoring',
    t: 'Solve <code>x<sup>2</sup> &minus; 5x + 6 = 0</code>.',
    o: ['x = 2 or x = 3', 'x = &minus;2 or x = &minus;3',
        'x = 5 or x = 6', 'x = 1 or x = 6'],
    key: 0,
    diag: { 1: 'reads the roots straight off the factors without changing sign',
            2: 'reads the coefficients as the roots',
            3: 'a pair multiplying to 6 but summing to 7, not 5' } },

  { kind: 'mc', obj: '1.7/O2', tag: 'reading a, b, c',
    t: 'For <code>2x<sup>2</sup> &minus; 3x &minus; 5 = 0</code>, which values go ' +
       'into the quadratic formula?',
    o: ['a = 2, b = &minus;3, c = &minus;5', 'a = 2, b = 3, c = 5',
        'a = 2, b = &minus;3, c = 5', 'a = 2, b = 3, c = &minus;5'],
    key: 0,
    diag: { 1: 'drops the sign from both b and c',
            2: 'drops the sign from c',
            3: 'drops the sign from b' } },

  { kind: 'mc', obj: '2.4/O1', tag: 'dividing an inequality by a negative',
    t: 'Solve <code>&minus;2x &lt; 6</code>.',
    o: ['x &gt; &minus;3', 'x &lt; &minus;3', 'x &gt; 3', 'x &lt; 3'],
    key: 0,
    diag: { 1: 'does not reverse the inequality when dividing by a negative',
            2: 'reverses the inequality but loses the sign on the 3',
            3: 'neither reverses the inequality nor keeps the sign' } },

  { kind: 'mc', obj: '2.4/O2', tag: 'endpoints',
    t: 'Which inequality describes every number from <code>&minus;1</code> up to ' +
       'but <em>not</em> including <code>4</code>?',
    o: ['&minus;1 &le; x &lt; 4', '&minus;1 &lt; x &le; 4',
        '&minus;1 &lt; x &lt; 4', '&minus;1 &le; x &le; 4'],
    key: 0,
    diag: { 1: 'the two endpoints are the wrong way round',
            2: 'excludes &minus;1, which is included',
            3: 'includes 4, which is excluded' } },

  /* ── what a problem uses ────────────────────────────────────── */

  { part: 'What a problem uses',
    note: 'These three ask what a problem <em>draws on</em>, not what its answer ' +
          'is. Do not solve them. Choose every idea you would need.',
    kind: 'multi', obj: '1.3/O1', tag: 'structure · factoring out a GCF',
    t: 'To factor <code>12x<sup>3</sup> &minus; 18x<sup>2</sup></code> completely, ' +
       'which of these do you need?',
    o: ['the greatest common factor of 12 and 18',
        'the rule for dividing powers of the same base',
        'the distributive property, run backwards',
        'the quadratic formula',
        'setting each factor equal to zero'],
    keys: [0, 1, 2],
    diag: { 3: 'the quadratic formula solves an equation; this is an expression, ' +
               'not set equal to anything',
            4: 'the zero-product property applies to an equation, for the same reason' },
    miss: { 0: 'the 6 in 6x&sup2; is exactly the common factor of 12 and 18',
            1: 'x&sup3; &divide; x&sup2; = x is what leaves 2x inside the bracket',
            2: 'factoring is the distributive property read right to left' } },

  { kind: 'multi', obj: '1.7/O2', tag: 'structure · evaluating the quadratic formula',
    t: 'To evaluate <code>( &minus;(&minus;5) + &radic;( (&minus;5)<sup>2</sup> ' +
       '&minus; 4&middot;1&middot;6 ) ) &divide; (2&middot;1)</code>, ' +
       'which of these do you need?',
    o: ['the order of operations',
        'squaring a negative number',
        'the fraction bar as a grouping symbol',
        'factoring a trinomial',
        'the rules for multiplying powers of x'],
    keys: [0, 1, 2],
    diag: { 3: 'the formula is what you reach for when factoring is not the route taken',
            4: 'there is no x left in this expression' },
    miss: { 0: 'the square, the multiplication and the subtraction under the root ' +
               'each have to happen in turn',
            1: '(&minus;5)&sup2; is 25, not &minus;25 — the parentheses are the whole point',
            2: 'everything above the bar is divided by 2, not just the last term' } },

  { kind: 'multi', obj: '1.2/O4', tag: 'structure · subtracting polynomials',
    t: 'To simplify <code>(5x<sup>2</sup> &minus; 3x + 2) &minus; ' +
       '(2x<sup>2</sup> + 4x &minus; 1)</code>, which of these do you need?',
    o: ['the distributive property',
        'combining like terms',
        'adding and subtracting signed numbers',
        'the rules for multiplying powers of the same base',
        'factoring out a common factor'],
    keys: [0, 1, 2],
    diag: { 3: 'no powers are multiplied here — x&sup2; and x are collected, not combined',
            4: 'nothing is factored; the terms are collected as they stand' },
    miss: { 0: 'the minus in front of the bracket has to reach every term inside it',
            1: '5x&sup2; and 2x&sup2; are like terms; 5x&sup2; and 3x are not',
            2: '2 &minus; (&minus;1) is the step most often lost' } },
];
