import LocalForm from 'database/collections/scopes/LocalForm'
import LocalSubmission from 'database/collections/scopes/LocalSubmission'
import LocalTranslation from 'database/collections/scopes/LocalTranslation'
import Formio from 'formiojs'
import router from 'config/router'
import store from 'config/store'
import md5 from 'md5'
import {MD5_KEY} from 'config/env'
import Auth from 'modules/Auth/api/Auth'
import _ from 'lodash'

const OFFLINE_PLUGIN = class {
  /**
	 * Stores the Formio submission locally, to allow for
	 * offline use. Then the submission can manually 
	 * be poushed to Form.io afterward
	 * @param  {[type]} formSubmission [description]
	 * @param  {[type]} formio         [description]
	 * @param  {[type]} redirect       [description]
	 * @param  {[type]} hashField      [description]
	 * @param  {[type]} formId         [description]
	 * @param  {[type]} eventHub       [description]
	 * @return {[type]}                [description]
	 */
  static storeForm (formSubmission, formio, redirect, hashField, formId, eventHub) {
    console.log('Trying to store something', formSubmission)
    if ((typeof hashField !== 'undefined')) {
      formSubmission.data.hashedPassword = md5(formSubmission.data.password, MD5_KEY)
      store.dispatch('storeUserLocally', {data: formSubmission.data, sync: false, formio: formio})
        .then(() => {
          router.push({path: '/login'})
        })
        .catch((error) => {
          console.log(error)
        })
    } else {
      store.dispatch('addSubmission', {
        formSubmission: formSubmission,
        formio: formio,
        User: Auth.user().data
      })
        .then((created) => {
          if (!created) {
            return
          }
            var draftStatus = new CustomEvent('draftStatus',
              {
                'detail': {'data': created, 'text': 'Draft Saved'}
              }
            )
            document.dispatchEvent(draftStatus)

            if (formSubmission._id) {
              if (formSubmission.redirect === true) {
                 router.push({
                  name: 'formio_form_show',
                  params: {
                   idForm: formId
                 }
                })
              }
            } else {
              router.push({
                name: 'formio_submission_update',
                 params: {
                  idForm: formId,
                  idSubmission: created._id
                }
              })
            }
          return created
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }

  /**
   * Defines the Offline Plugin to use with Form.io JS
   * library. When we want to create an online submission
   * this plugin must be desactivated.
   * @param  {[type]} formId         [description]
   * @param  {[type]} getCurrentForm [description]
   * @param  {[type]} storeForm      [description]
   * @param  {[type]} hashField      [description]
   * @param  {[type]} redirect       [description]
   * @param  {[type]} eventHub       [description]
   * @return {[type]}                [description]
   */
  static getPlugin (formId, getCurrentForm, storeForm, hashField, redirect, eventHub) {
    let plugin = {
      priority: 0,
      staticRequest: async (args) => {
      	// Try to get the form associated to the static request
      	let formId = args.url.split('/')
        formId = formId[4] ? formId[4] : ''
        let form = await LocalForm.get(formId)

        // If there is no form associated, we stop
      	if (!form) {
      		return
      	}

        // If its a external call to form.io (Local Resources) 
        if (args.url.indexOf('form.io') === -1 && args.method === 'GET') {
        	let a = {'count': 811, 'previous': null, 'results': [{'url': 'https://pokeapi.co/api/v2/pokemon/1/', 'name': 'aaa'}, {'url': 'https://pokeapi.co/api/v2/pokemon/2/', 'name': 'ivysaur'}, {'url': 'https://pokeapi.co/api/v2/pokemon/3/', 'name': 'venusaur'}, {'url': 'https://pokeapi.co/api/v2/pokemon/4/', 'name': 'charmander'}, {'url': 'https://pokeapi.co/api/v2/pokemon/5/', 'name': 'charmeleon'}, {'url': 'https://pokeapi.co/api/v2/pokemon/6/', 'name': 'charizard'}, {'url': 'https://pokeapi.co/api/v2/pokemon/7/', 'name': 'squirtle'}, {'url': 'https://pokeapi.co/api/v2/pokemon/8/', 'name': 'wartortle'}, {'url': 'https://pokeapi.co/api/v2/pokemon/9/', 'name': 'blastoise'}, {'url': 'https://pokeapi.co/api/v2/pokemon/10/', 'name': 'caterpie'}, {'url': 'https://pokeapi.co/api/v2/pokemon/11/', 'name': 'metapod'}, {'url': 'https://pokeapi.co/api/v2/pokemon/12/', 'name': 'butterfree'}, {'url': 'https://pokeapi.co/api/v2/pokemon/13/', 'name': 'weedle'}, {'url': 'https://pokeapi.co/api/v2/pokemon/14/', 'name': 'kakuna'}, {'url': 'https://pokeapi.co/api/v2/pokemon/15/', 'name': 'beedrill'}, {'url': 'https://pokeapi.co/api/v2/pokemon/16/', 'name': 'pidgey'}, {'url': 'https://pokeapi.co/api/v2/pokemon/17/', 'name': 'pidgeotto'}, {'url': 'https://pokeapi.co/api/v2/pokemon/18/', 'name': 'pidgeot'}, {'url': 'https://pokeapi.co/api/v2/pokemon/19/', 'name': 'rattata'}, {'url': 'https://pokeapi.co/api/v2/pokemon/20/', 'name': 'raticate'}], 'next': 'https://pokeapi.co/api/v2/pokemon/?offset=20'}
        	return a
        }
        
        let submissions = await LocalSubmission.stored(Auth.user()._id, form.name)
        let jsonSubmissions = this.LocalToJson(submissions)
      	return jsonSubmissions
      },
      request: async (args) => {
      	// If we are trying to get a form we load it locally
        if (args.method === 'GET' && args.type === 'form') {
          let form = await LocalForm.get(args.formio.formId)
          return form
        }
        // If we are trying to get submissions from that form
        if ((args.method === 'POST' || args.method === 'PUT') && args.type === 'submission') {
        	let form = await LocalForm.get(args.formio.formId)
   
          let formioURL = 'https://' + form.machineName.split(':')[0] + '.form.io/' + form.path
     
          let formio = new Formio(formioURL)
          let dStoreForm = _.debounce(this.storeForm, 300)
          dStoreForm(args.data, formio, redirect, hashField, formId, eventHub)
          return args.data
        }
      }
    }
    return plugin
  }

  /**
   * Transforms the Local RxDB submissions that
   * are dinamic, to an static array so we
   * can use it as Json input for the
   * selects
   * @param {[type]} rxDBData [description]
   */
  static LocalToJson (rxDBData) {
  	let transformedArray = []
  	_.forEach(rxDBData, function (element) {
		  transformedArray.push(element.data)
    })
    return transformedArray
  }

  static async getLocalTranslations () {
  	 let translations = await LocalTranslation.getFormTranslations()
  	 return translations
  }
}

export default OFFLINE_PLUGIN
