const Lenguage = class {
  /**
   * [listen description]
   * @param  {[type]} vm [description]
   * @return {[type]}    [description]
   */
  static listen (vm) {
    vm.$eventHub.$on('lenguageSelection', (lenguage) => {
      vm.formIO.language = lenguage.code
      vm.renderForm()
    })
  }

  /**
   * [off description]
   * @param  {[type]} vm [description]
   * @return {[type]}    [description]
   */
  static off(vm) {
    vm.$eventHub.$off('lenguageSelection', vm.renderForm)
  }
}
export default Lenguage
