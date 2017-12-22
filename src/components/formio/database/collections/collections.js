const collections = [

  /*
  |--------------------------------------------------------------------------
  | Local Collections
  |--------------------------------------------------------------------------
  |
  | Here you may define all of your collections for local storage.
  | Remember that every collection must have a Schema definition.
  |
  */
  {
    name: 'submissions',
    schema: require('../schemas/Submission.js').default,
    methods: {},
    sync: true
  },
  {
    name: 'forms',
    schema: require('../schemas/Form.js').default,
    methods: {

    },
    sync: true
  },
  {
    name: 'translations',
    schema: require('../schemas/Translations.js').default,
    methods: {},
    sync: true
  },
  {
    name: 'users',
    schema: require('../schemas/Users.js').default,
    methods: {},
    sync: true
  }
]
export default collections
