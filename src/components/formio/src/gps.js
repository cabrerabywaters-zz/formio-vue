const GPS = class {
  /**
   * [listen description]
   * @param  {[type]} vm [description]
   * @return {[type]}    [description]
   */
  static listen (vm) {
    // Remove previous registered events listeners
    document.removeEventListener('gpsSucceeded', function (e) {}, false)
    document.removeEventListener('gpsRequested', function (e) {}, false)
    document.removeEventListener('gpsError', function (e) {}, false)

    // Register the event listeners for this functionallity
    document.addEventListener('gpsRequested', (e) => {
      Loading.show({
        message: 'Getting GPS information',
        spinnerSize: 100
      })
    })
 
    document.addEventListener('gpsError', (e) => {
      Loading.hide()
      vm.$swal(
        'GPS Error!',
        'We could not get your GPS position',
        'error'
      )
    })

    document.addEventListener('gpsSucceeded', (e) => {
      Loading.hide()
      vm.renderForm()
      vm.$swal(
        'GPS Registered!',
        'Your GPS position was detected',
        'success'
      )
    })
  }
}
export default GPS
