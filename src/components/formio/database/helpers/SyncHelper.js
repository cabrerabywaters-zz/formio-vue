import _ from 'lodash'
import deep from 'deep-diff'
class SyncHelper {
  /**
   * [offlineOnlineSyc description]
   * @param  {[type]} LocalResults  [description]
   * @param  {[type]} OnlineResults [description]
   * @return {[type]}               [description]
   */
  static offlineOnlineSync ({ LocalResults, OnlineResults, isOnline, collection }) {
    let Sync = []
    LocalResults = _.map(LocalResults, 'data')
    Sync = !isOnline ? [] : this.compare(LocalResults, OnlineResults)
    return _.uniqBy(Sync, '_id')
  }

  /**
   * Compares the Local Forms with the Online Forms.
   * It returns the Forms that have been updated
   * or the new ones since the last sync
   * @param  {Array} LocalResults  [description]
   * @param  {Array} OnlineResults [description]
   * @return {Array}               [description]
   */
  static compare (LocalResults, OnlineResults) {
    let result = []
    let self = this
    // Check for updates
    _.forEach(LocalResults, function (LocalResult) {
      _.forEach(OnlineResults, function (OnlineResult) {
        if (LocalResult._id === OnlineResult._id) {
          let differences = false
          if (LocalResult.components) {
            differences = differences = deep.diff(self.deleteNulls(LocalResult.components), self.deleteNulls(OnlineResult.components))
          } else if (LocalResult.data) {
            differences = differences = deep.diff(self.deleteNulls(LocalResult.data), self.deleteNulls(OnlineResult.data))
          }

          if (differences) {
            let form = self.deleteNulls(OnlineResult)
            result.push(form)
          }
        }
      })
    })
    // Check for new forms
    _.forEach(OnlineResults, function (OnlineResult) {
      if (!(_.find(LocalResults, { '_id': OnlineResult._id }))) {
        let form = self.deleteNulls(OnlineResult)
        result.push(form)
      }
    })
    // If the local Database is empty
    if (LocalResults.length === 0) {
      _.forEach(OnlineResults, function (OnlineResult) {
        let form = self.deleteNulls(OnlineResult)
        result.push(form)
      })
    }

    return result
  }
  /**
   * Removes all the null values from an Object
   * or from an array
   * @param  {Object, Array} object [description]
   * @return {Object, Array}        [description]
   */
  static deleteNulls (object) {
    let obj = object
    var isArray = obj instanceof Array
    for (var k in obj) {
      if (obj[k] === null) isArray ? obj.splice(k, 1) : delete obj[k]
      else if (typeof obj[k] === 'object') this.deleteNulls(obj[k])
    }
    return obj
  }
}
export default SyncHelper
