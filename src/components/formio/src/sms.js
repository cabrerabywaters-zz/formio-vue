const SMS = class {
  /**
   * [listen description]
   * @param  {[type]} vm [description]
   * @return {[type]}    [description]
   */
  static listen (vm) {
    document.removeEventListener('messageRequested', function (e) {}, false)
    document.addEventListener('messageRequested', (e) => {
      if (!vm.$q.platform.is.cordova) {
        SMS.send({provider: 'AMAZON', data: e.detail.data}, vm)
      } else {
        SMS.send({provider: 'PHONE', data: e})
      }
    })
  }

  /**
   * [off description]
   * @param  {[type]} vm [description]
   * @return {[type]}    [description]
   */
  static send(e, vm) {
    if (e.provider === 'AMAZON') {
      SMS.Amazon(e.data, vm)
    } else if (e.provider === 'PHONE') {
      SMS.Cordova(e.data, vm)
    }
  }

  /**
   * [AmazonSMS description]
   * @param {[type]} data [description]
   */
  static Amazon(data, vm) {
      let Sender = require('aws-sms-send')
        let config = {
          AWS: {
            accessKeyId: '',
            secretAccessKey: '',
            region: ''
          },
          topicArn: ''
        }
         
        let sender = new Sender(config)
        let body = JSON.stringify(data)
        /* Send direct sms */
        sender.sendSms(body, 'FAST APP POC', false, String(data.phoneNumber))
        .then((response) => {
          console.log('SUccess', response)
          vm.$swal(
          'SMS Sent',
          'Your Message was sent!',
          'success'
          )
        })
        .catch(function(err) {
          console.log('error', err)
        })
  }

  static Cordova(data, vm) {
      let body = JSON.stringify(data)
       let number = String(data.phoneNumber)
        // CONFIGURATION
        let options = {
            replaceLineBreaks: false,
            android: {
                intent: ''
            }
        }
        let success = function () {
          vm.$swal(
            'SMS sent!',
            'Your message has been sent!',
            'success'
          )
        }
        let error = function (e) { alert('Message Failed:' + e) }
        sms.send(number, body, options, success, error)
  }
}
export default SMS
