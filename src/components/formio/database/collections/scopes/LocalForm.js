import * as Database from 'database/Database'

const LocalForm = class {
  /**
   * [get description]
   * @param  {[type]} id [description]
   * @return {[type]}    [description]
   */
  static async get (id) {
  	id = id.replace(/\s/g, '')
  	let db = await Database.get()
 	let formRequest = await db.forms.findOne().where('data.name').eq(id).exec()
 	let formRequestID = await db.forms.findOne().where('data._id').eq(id).exec()
 	let formRequestPath = await db.forms.findOne().where('data.path').eq(id).exec()
 	
 	if (formRequest) {
 		return formRequest.data
 	}
 	if (formRequestID) {
 		return formRequestID.data
 	}
 	if (formRequestPath) {
 		return formRequestPath.data
 	}
  }

  static async sAll (vm, holder) {
  	vm.subscriptions.forEach(sub => sub.unsubscribe())
      const db = await Database.get()
      vm.subscriptions.push(
        db.forms
          .find()
          .$
          .subscribe(forms => {
            vm[holder] = forms
          })
      )
  }
}
export default LocalForm
