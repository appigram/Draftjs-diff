import DiffMatchPatch from 'diff-match-patch'

const DIFF_TYPE = {
  EQUAL: DiffMatchPatch.DIFF_EQUAL,
  INSERT: DiffMatchPatch.DIFF_INSERT,
  DELETE: DiffMatchPatch.DIFF_DELETE
}

export default DIFF_TYPE
