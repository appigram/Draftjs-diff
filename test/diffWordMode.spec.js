import { expect } from 'chai';
const diffWordMode = require('../lib/diffWordMode');
const data = require('./data');

describe('diffWordMode', () => {
  it('returns an array representing what has changed', () => {
    const actual = diffWordMode(data.text1, data.text2);
    const expected = [ [ 0, 'Shows how text ' ], [ -1, 'was' ], [ 1, 'is' ] ];
    expect(actual).to.deep.eq(expected);
  });
});

// TODO: deal with atomic blocks

// TODO: deal with entities?

// TODO: create rawContentState from the diffs
