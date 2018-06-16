import React from 'react'
import PropTypes from 'prop-types'
import { Editor, EditorState, ContentState } from 'draft-js'
import debounce from 'just-debounce'

import diffWordMode from './diffWordMode'
import diffDecoratorStrategies from './diffDecoratorStrategies'
import diffDecorator from './diffDecorator'

const EDITOR_PROP_SHAPE = PropTypes.shape({
  hidden: PropTypes.bool,
  initial: PropTypes.string,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  state: PropTypes.instanceOf(EditorState)
})

/**
 * Displays two Editor decorated with diffs.
 * @prop {Number} [debounceWait=-1] Milliseconds. Delay for the
 * updating the diffs. -1 to disable debouncing.
 * @prop {Object} [before] Props for the before editor (containing the old text)
 * @prop {Object} [after] Props for the after editor (containing the new text)
 * @prop {String} [before.initial=''] The initial before text
 * @prop {String} [after.initial=''] The initial after text
 * @prop {Boolean} [before.hidden=false] Whether to actually display an editor
 * @prop {Boolean} [after.hidden=false] Whether to actually display an editor
 * @prop {Boolean} [before.readOnly=false] Make the before editor read only.
 * @prop {Boolean} [after.readOnly=false] Make the after editor read only.
 * @prop {Function} [after.onChange] Callback called with the after EditorState changes.
 * @prop {Function} [before.onChange] Callback called when the before EditorState changes.
 * @prop {EditorState} [after.state] Be sure to pass back the
 * updated state if you listen to after.onChange.
 * @prop {EditorState} [before.state]  Be sure to pass back the
 * updated state if you listen to before.onChange.
 */
class DiffEditor extends React.Component {
  constructor (props) {
    super(props)
    // Anti-patterns everywhere...
    this.createInitialState(props)
  }

  componentWillReceiveProps (props) {
        // New initial state ?
    if (props.before.initial !== this.props.before.initial
         || props.after.initial !== this.props.after.initial) {
      return this.setState(this.createInitialState(props))
    } else {
      var newState = {
        beforeState: props.before.state || this.state.beforeState,
        afterState: props.after.state || this.state.afterState
      }
      if (this.props.debounceWait >= 0) {
                // Update diff later
        this.setState(newState)
        this.debouncedUpdateDiffs()
      } else {
                // Update diff now
        this.setState(this.diffDecorateEditors(newState))
      }
    }
  }

  createInitialState = (props) => {
    // Make a debounced diff update
    if (props.debounceWait >= 0) {
      this.debouncedUpdateDiffs =
            debounce(this.updateDiffs,
                     props.debounceWait,
                     false, // trailing
                     true) // guarantee waiting time
    }

    const state = {
      beforeState: props.before.state || this.editorStateFromText(props.before.initial),
      afterState: props.after.state || this.editorStateFromText(props.after.initial)
    }

    return this.diffDecorateEditors(state)
  }

  updateDiffs = () => {
    this.setState(this.diffDecorateEditors(this.state))
  }

  onChange = (beforeState, afterState) => {
        // Texts changed ?
    var afterChanged = this.contentChanged(this.state.afterState, afterState)
    var beforeChanged = this.contentChanged(this.state.beforeState, beforeState)

    var newState = {
      beforeState: beforeState,
      afterState: afterState
    }
    if (beforeChanged || afterChanged) {
            // Update diffs
      if (this.props.debounceWait >= 0) {
                // Update diff later
        this.setState(newState)
        this.debouncedUpdateDiffs()
      } else {
                // Update diff now
        this.setState(this.diffDecorateEditors(newState))
      }
    } else {
      this.setState(newState)
    }
  }

  onAfterChange = (afterState) => {
    var afterChanged = this.contentChanged(this.state.afterState, afterState)
    if (this.props.after.onChange && afterChanged) {
      this.props.after.onChange(afterState)
    } else {
      this.onChange(this.state.beforeState, afterState)
    }
  }

  onBeforeChange = (beforeState) => {
    var beforeChanged = this.contentChanged(this.state.beforeState, beforeState)
    if (this.props.before.onChange && beforeChanged) {
      this.props.before.onChange(beforeState)
    } else {
      this.onChange(beforeState, this.state.afterState)
    }
  }


  contentChanged = (editorState1, editorState2) => {
    return editorState1.getCurrentContent() !== editorState2.getCurrentContent()
  }

  editorStateFromText = (text) => {
    const content = ContentState.createFromText(text)
    return EditorState.createWithContent(content)
  }

  diffDecorateEditors = (state) => {
    const beforeState = state.beforeState
    const afterState = state.afterState

    const beforeContentState = beforeState.getCurrentContent()
    const afterContentState = afterState.getCurrentContent()

    const decorators = this.createDiffsDecorators(beforeContentState, afterContentState)

    return {
      beforeState: EditorState.set(beforeState, { decorator: decorators.before }),
      afterState: EditorState.set(afterState, { decorator: decorators.after })
    }
  }

  createDiffsDecorators = (beforeContentState, afterContentState) => {
    // Compute diff on whole texts
    const before = beforeContentState.getPlainText()
    const after = afterContentState.getPlainText()
    const diffs = diffWordMode(before, after)

    // Create strategies
    const beforeStrategies = diffDecoratorStrategies(diffs, false, beforeContentState.getBlockMap())
    const afterStrategies = diffDecoratorStrategies(diffs, true, afterContentState.getBlockMap())

    return {
      before: diffDecorator(beforeStrategies),
      after: diffDecorator(afterStrategies)
    }
  }

  render () {
    let before = null
    if (!this.props.before.hidden) {
      before = <div className='diff-before'>
        <Editor
          readOnly={this.props.before.readOnly}
          editorState={this.state.beforeState}
          onChange={this.onBeforeChange}
        />
      </div>
    }

    let after = null
    if (!this.props.after.hidden) {
      after = <div className='diff-after'>
        <Editor
          readOnly={this.props.after.readOnly}
          editorState={this.state.afterState}
          onChange={this.onAfterChange}
        />
      </div>
    }

    return (<div className='diff-editor'>
      {before}
      {after}
    </div>)
  }
}

DiffEditor.defaultProps = {
  before: {
    hidden: false,
    initial: '',
    onChange: null,
    readOnly: false,
    state: null
  },
  after: {
    hidden: false,
    initial: '',
    onChange: null,
    readOnly: false,
    state: null
  },
  debounceWait: -1
}

DiffEditor.propTypes = {
  before: EDITOR_PROP_SHAPE,
  after: EDITOR_PROP_SHAPE,
  debounceWait: PropTypes.number
}

export default DiffEditor
