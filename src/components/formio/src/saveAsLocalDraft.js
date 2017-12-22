import { Toast } from 'quasar'
const SaveAsDraft = class {
  /**
   * [listen description]
   * @param  {[type]} vm [description]
   * @return {[type]}    [description]
   */
  static listen (vm) {
  }

  /**
   * [listen description]
   * @param  {[type]} vm [description]
   * @return {[type]}    [description]
   */
  static listenSaved (vm) {
    document.removeEventListener('draftSaved', function (e) {}, false)
    document.addEventListener('draftSaved', (e) => {
        Toast.create.positive({
        html: 'Saved as Draft',
        icon: 'done',
        timeout: 1000
      })
    })
  }
}
export default SaveAsDraft
