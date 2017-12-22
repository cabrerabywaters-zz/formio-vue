const CSS = class {
  /**
   * [listen description]
   * @param  {[type]} vm [description]
   * @return {[type]}    [description]
   */
  static format (vm) {
  	vm.$eventHub.off('formio.change')
		vm.$eventHub.off('formio.render')
  	
  	vm.$eventHub.on('formio.change', (data) => {
  		CSS.paginationFormat()
  	})
  	vm.$eventHub.on('formio.render', (data) => {
  		CSS.paginationFormat()
  	})
  }

  static paginationFormat() {
  		let elementsNumber = 2

			let pages = document.getElementsByClassName('pagination')
			pages = pages[pages.length - 1].children
			console.log(pages)
			let activeIndex = -1

			for (let i = 0; i < pages.length; i++) {
			    if (pages[i].classList.contains('active')) {
			        activeIndex = i
			    }
			    pages[i].style.display = 'none'
			}
			let begin = activeIndex - elementsNumber < 0 ? 0 : activeIndex - elementsNumber
			let end = activeIndex + elementsNumber > pages.length ? pages.length : activeIndex + elementsNumber

			for (let i = begin; i < end; i++) {
			    pages[i].style.display = 'inline-block'
			}
  }
}
export default CSS
