import DIFF_TYPE from './diffType'

/**
 * Structure to hold the three types of strategies together
 */
class Strategies {
  constructor (props) {
    this.del = props.delete
    this.equal = props.equal
    this.insert = props.insert
  }
  /**
   * @param {DiffType} type
   * @returns {Draft.DecoratorStrategy} The strategy for the given type of diff
   */
  getStrategy = (type) => {
    switch (type) {
      case DIFF_TYPE.EQUAL :
        return this.equal
      case DIFF_TYPE.INSERT :
        return this.insert
      case DIFF_TYPE.DELETE :
        return this.del
      default:
        throw new Error('Unknown diff type ' + type)
    }
  }

  getEqualStrategy = () => this.equal

  getDeleteStrategy = () => this.del

  getInsertStrategy = () => this.insert
}

export default Strategies
