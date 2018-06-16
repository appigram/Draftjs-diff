import React from 'react'
import ReactDOM from 'react-dom'

import DraftDiff from '../src/index'
import data from '../test/data'

class Test extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      beforeState: undefined,
      afterState: undefined
    }
    this.onChange = this.onChange.bind(this)
  }

  onChange (afterState) {
    this.setState({
      afterState: afterState
    })
  }

  render () {
    const before = {
      initial: data.text1,
      state: this.state.beforeState
    }
    const after = {
      initial: data.text2,
      state: this.state.afterState,
      onChange: this.onChange
    }
    return <DraftDiff.DiffEditor before={before}
      after={after}
      debounceWait={-1} />
  }
}

ReactDOM.render(
  <Test />,
  document.getElementById('content')
)
