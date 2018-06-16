import { expect } from 'chai'
import { diffAtomicBlocks } from '../lib/diffAtomicBlocks'

import contentStateBefore from './contentstate'
import contentStateAfter from './contentstatewithimage'

describe('diffAtomicBlocks', () => {
  context('with no difference', () => {
    it('returns false', () => {
      const actual = diffAtomicBlocks(contentStateBefore, contentStateBefore)
      expect(actual).to.eq(false)
    })
  })

  context('with differences', () => {
    it('returns an array representing the differences', () => {
      const actual = diffAtomicBlocks(contentStateBefore, contentStateAfter)
      expect(Array.isArray(actual)).to.eq(true)
    })

    context('with an atomic block added', () => {
      it('shows the atomic blocks which were added', () => {
        const actual = diffAtomicBlocks(contentStateBefore, contentStateAfter)
        const expected = [ [1, '86ekh'] ]
        expect(actual).to.deep.eq(expected)
      })
    })

    context('with an atomic block removed', () => {
      it('shows the atomic blocks which were removed', () => {
        const actual = diffAtomicBlocks(contentStateAfter, contentStateBefore)
        const expected = [ [-1, '86ekh'] ]
        expect(actual).to.deep.eq(expected)
      })
    })
  })
})
