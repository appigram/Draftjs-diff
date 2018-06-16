import React from 'react'
import { CompositeDecorator } from 'draft-js'

// Decorators

const InsertSpan = (props) => <span {...props} className='diff-insert'>{props.children}</span>

const EqualSpan = (props) => <span {...props} className='diff-equal'>{props.children}</span>

const DeleteSpan = (props) => <span {...props} className='diff-delete'>{props.children}</span>

/**
 * @param {Strategies} strategies
 * @returns {Draft.Decorator}
 */
const diffDecorator = (strategies) => {
  return new CompositeDecorator([
    {
      strategy: strategies.getEqualStrategy(),
      component: EqualSpan
    },
    {
      strategy: strategies.getDeleteStrategy(),
      component: DeleteSpan
    },
    {
      strategy: strategies.getInsertStrategy(),
      component: InsertSpan
    }
  ])
}

export default diffDecorator
