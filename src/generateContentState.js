import diffAtomicBlocks from './diffAtomicBlocks'

const generateContentState = (prevContent, nextContent) => {
  let newContentState

  const diffBlocks = diffAtomicBlocks(prevContent, nextContent)

  if (!diffBlocks) {
    return nextContent
  }

  console.log(diffBlocks, nextContent.blocks)

  newContentState = nextContent

  // mark any differences on the newContentState;

  diffBlocks.map((diff) => {
    newContentState.blocks.find(b => {
      if (b.key === diff[1]) {
        b.data.diff = diff[0]
      }
    })
  })

  console.log(JSON.stringify(newContentState))

  return newContentState
}

export default generateContentState
