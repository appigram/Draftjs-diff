const diff = require('deep-diff').diff;

export function diffAtomicBlocks (prevContent, nextContent) {
  // we only need to diff the blocks and not worry about entity map
  const differences = diff(prevContent.blocks, nextContent.blocks);

  if (!differences) {
    return false;
  }

  const keyMap = differences.map(diff => diffBlock(diff));

  return keyMap;
}

function diffBlock(diff) {
  // if item has been added, return 1 and the key
  if (diff.item.kind === 'N') {
    return [1, diff.item.rhs.key];
  // if item has been removed, return -1 and the key
  } else if (diff.item.kind === 'D') {
    return [-1, diff.item.lhs.key]
  }
}
