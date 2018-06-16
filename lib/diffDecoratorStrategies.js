import Strategies from './strategies'
import DIFF_TYPE from './diffType'

const EMPTY_STRATEGY = () => {}

/**
 * @param {Array<diff_match_patch.Diff>} diffs
 * @param {Boolean} forNewText True if the text in blockMap is the new text.
 * @param {DraftJS.BlockMap} blockMap The BlockMap of the ContentState to decorate
 * @return {Strategies} Three strategies that identify ranges of text for each type of diff.
 * Only two of them will actually be relevant (equal and insert for
 * new text, or equal and delete for old text).
 */
const diffDecoratorStrategies = (diffs, forNewText, blockMap) => {
  const absoluteRanges = diffToAbsoluteRanges(diffs, forNewText)

  const modifiedMapping = mapRangesToBlocks(absoluteRanges.modified, blockMap)
  const equalMapping = mapRangesToBlocks(absoluteRanges.equal, blockMap)

  const modifiedStrategy = strategyFromMapping(modifiedMapping, blockMap)
  const equalStrategy = strategyFromMapping(equalMapping, blockMap)

  if (forNewText) {
    return new Strategies({
      delete: EMPTY_STRATEGY,
      equal: equalStrategy,
      insert: modifiedStrategy
    })
  } else {
    return new Strategies({
      delete: modifiedStrategy,
      equal: equalStrategy,
      insert: EMPTY_STRATEGY
    })
  }
}

/**
 * Returns the absolute ranges for equal and modified (insert or delete) texts.
 * @param {Array<diff_match_patch.Diff>} diffs
 * @param {Boolean} forNewText
 * @returns {Object<Array<Range>>} Two list of ranges (equal and modified)
 */
const diffToAbsoluteRanges = (diffs, forNewText) => {
  const absoluteRanges = {
    equal: [],
    modified: []
  }
  const typeToIgnore = forNewText ? DIFF_TYPE.DELETE : DIFF_TYPE.INSERT

  let charIndex = 0
  diffs.forEach(function (diff) {
    const diffType = diff[0]
    const diffText = diff[1]

    if (diffType === typeToIgnore) {
      return
    }

    const range = {
      start: charIndex,
      end: charIndex + diffText.length
    }
    if (diffType === DIFF_TYPE.EQUAL) {
      absoluteRanges.equal.push(range)
    } else {
      absoluteRanges.modified.push(range)
    }
    // Progress in the text
    charIndex += diffText.length
  })

  return absoluteRanges
}

/**
 * @param {Array<Range>} absoluteRanges The ranges for the whole text
 * @param {DraftJS.BlockMap} blockMap The BlockMap of the ContentState to decorate
 * @returns {Immutable.Map<BlockKey, Array<Range>>} Ranges are relative to each block.
 */
const mapRangesToBlocks = (absoluteRanges, blockMap) => {
  let blockStartIndex = 0
  return blockMap.map((block) => {
    const ranges = findRangesBetween(absoluteRanges, blockStartIndex, blockStartIndex + block.getLength())
    blockStartIndex += block.getLength() + 1 // Account for possible '\n'
    return ranges
  })
}

/**
 * @param {Array<Range>} ranges
 * @param {Number} start
 * @param {Number} end
 * @returns {Array<Range>} All the ranges that overlapped
 * start-end, cropped and re-indexed to be relative to start.
 */
const findRangesBetween = (ranges, start, end) => {
  const res = []
  ranges.forEach(function (range) {
    if (range.start < end && range.end > start) {
      // Crop the range
      const intersectionStart = Math.max(range.start, start)
      const intersectionEnd = Math.min(range.end, end)
      // Push relative range
      res.push({
        start: intersectionStart - start,
        end: intersectionEnd - start
      })
    }
  })
  return res
}

/**
 * @returns {Immutable.Map<BlockKey, Array<Range>>} mappedRanges
 * @returns {DraftJS.BlockMap} blockMap
 * @returns {DraftJS.DecoratorStrategy} A strategy applying to the
 * ranges provided for each block. Once the block's content change, the
 * block will not be decorated anymore.
 */
const strategyFromMapping = (mappedRanges, blockMap) => {
  // Save the original blockMap's content for later comparison
  return function (contentBlock, callback) {
    const key = contentBlock.getKey()
    const ranges = mappedRanges.get(key)
    if (!ranges) {
      return
    }
    const oldContent = blockMap.get(key).getText()
    const newContent = contentBlock.getText()
    // If the content is still the same
    if (oldContent === newContent) {
      ranges.forEach(function (range) {
        callback(range.start, range.end)
      })
    }
  }
}

export default diffDecoratorStrategies
