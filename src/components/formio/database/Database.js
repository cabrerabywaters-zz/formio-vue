import 'babel-polyfill'
import * as RxDB from 'rxdb'
import collections from './collections/collections'
import { Platform } from 'quasar'
import Auth from 'modules/Auth/api/Auth'
import _ from 'lodash'
import * as Database from 'database/Database'
import store from 'config/store'
import Connection from 'modules/Wrappers/Connection'
/* SYNC_URL */
import { LOCAL_DB_PASSWORD } from 'config/env'

/*
|--------------------------------------------------------------------------
| RxDB Plugins
|--------------------------------------------------------------------------
| Require all the RxDB adapters that you would 
| like to use in your application
|
*/
RxDB.plugin(require('pouchdb-adapter-idb'))
RxDB.plugin(require('pouchdb-replication')) // enable syncing
RxDB.plugin(require('pouchdb-adapter-http')) // enable syncing over http
RxDB.plugin(require('pouchdb-adapter-cordova-sqlite'))
RxDB.plugin(require('pouchdb-adapter-localstorage'))
// const syncURL = SYNC_URL
let dbPromise = null

/*
|--------------------------------------------------------------------------
| RxDB Config
|--------------------------------------------------------------------------
| This is the configuration for the Local DB creation.
| Also you will find the sync methods for 
| the external server (FORM.io)
|
*/

/**
 * [description]
 * @return {[type]} [description]
 */
const _create = async function () {
  let database = {
    name: store.getters.getMachineUrl,
    password: LOCAL_DB_PASSWORD
  }
  if (Platform.is.mobile) {
    database.adapter = 'localstorage'
  } else if (Platform.is.cordova) {
    database.adapter = 'cordova-sqlite'
  } else {
    database.adapter = 'idb'
  }
 
  console.log('#########################')
  console.log('We are using', database.adapter)
  console.log('#########################')
  // database.multiInstance = Platform.is.desktop ? false : false
  database.multiInstance = false
  const db = await RxDB.create(database)

  window['db'] = db // write to window for debugging
  await Promise.all(collections.map(colData => db.collection(colData)))
  // sync
  /*
  collections.filter(col => col.sync).map(col => col.name).map(colName => db[colName].sync({
      remote: syncURL + colName + '/'
  }));
      */
  return db
}

/**
 * [get description]
 * @return {[type]} [description]
 */
export function get () {
  if (!dbPromise) { dbPromise = _create() }
  return dbPromise
}

/**
 * [description]
 * @param  {[type]} options.db       [description]
 * @param  {[type]} options.isOnline [description]
 * @return {[type]}                  [description]
 */
const syncSubmissions = async ({ db, isOnline }) => {
  let usersAreSync = await areUsersSynced()

  if (usersAreSync) {
    let filter = await db.submissions.find().exec()
    // updated incomplete submission
    filter = _.filter(filter, function (o) {
      return (o.data.sync === false && o.data.draft === false)
    })

    filter = _.orderBy(filter, ['data.created'], ['asc'])

    if (filter.length > 0) {
      console.log('there are offline submissions', filter)
      store.dispatch('sendOfflineData', { offlineSubmissions: filter, isOnline })
    }
  }
}

const DsyncSubmissions = _.debounce(syncSubmissions, 1000)

/**
 * [description]
 * @return {[type]} [description]
 */
const getUsersToSync = async () => {
  const db = await Database.get()
  let filter = await db.users.find({ 'data.sync': false }).exec()
  return _.filter(filter, function (o) {
    return (o.data.sync === false)
  })
}

/**
 * [description]
 * @return {[type]} [description]
 */
const areUsersSynced = async () => {
  let users = await getUsersToSync()
  return !!users && Array.isArray(users) && users.length === 0
}
/**
 * [description]
 * @param  {[type]} options.db       [description]
 * @param  {[type]} options.isOnline [description]
 * @return {[type]}                  [description]
 */
const syncUsers = async ({ db, isOnline }) => {
  let filter = await getUsersToSync()

  if (filter.length > 0) {
    store.dispatch('sendOfflineData', { offlineSubmissions: filter, isOnline })
  }
}

const DsyncUsers = _.debounce(syncUsers, 1000)

/**
 * [description]
 * @param  {[type]} vm [description]
 * @return {[type]}    [description]
 */
export const sync = async function (vm) {
  const db = await Database.get()
  const isOnline = await Connection.heartBeat(vm)

  if (Auth.check() && isOnline) {
    await DsyncSubmissions({ db, isOnline })
  }

  if (isOnline) {
    await DsyncUsers({ db, isOnline })
  }
}
