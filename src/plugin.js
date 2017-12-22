import formio from './components/formio/formio.vue';

module.exports = {
  install: function (Vue, options) {
    Vue.component('formio', formio)
  }
}