import { expect } from 'chai';
var contentStateBefore = require('./contentState');
var contentStateAfter = require('./contentStateWithImage');
var newContentState = require('./newContentState');
import { generateContentState } from '../lib/generateContentState';

describe('generateContentState', () => {
  context('with no differences', () => {
    it('returns nextContent', () => {
      const actual = generateContentState(contentStateAfter, contentStateAfter);
      const expected = contentStateAfter;
      expect(actual).to.deep.eq(expected);
    });
  });

  context('with an added block', () => {
    it('returns new content state with block marked', () => {
      const actual = generateContentState(contentStateBefore, contentStateAfter);
      const expected = newContentState;
      expect(actual).to.deep.eq(expected);
    });
  });
});
