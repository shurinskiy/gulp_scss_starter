export const itemsLimiter = (items, options = {}) => {
	class Limiter {
		constructor(element, options) {
			if(!element || !element.dataset.hidden) return;
			
			this.element = element;
			this.items = [...element.children];
			this.count = +element.dataset.hidden;
			this.more = document.createElement('button');
			this.options = {
				buttonText: 'Show all',
				buttonClass: 'more',
				effectClass: 'showing',
				...options
			}

			this.init();
		}

		init() {
			this.more.className = this.options.buttonClass;
			this.more.innerText = this.options.buttonText;

			this.items.forEach((item, i) => {
				if (i >= this.count)
					item.style.display = 'none';
			});
	
			if (this.items.length > this.count) {
				this.element.parentNode.append(this.more);
			
				this.more.addEventListener('click', e => {
					this.items.forEach((item, i) => {
	
						if (i >= this.count) {
							item.classList.add('showing');
							item.removeAttribute('style');
		
							item.addEventListener('animationend', e => {
								item.classList.remove('showing');
							}, { once: true });
						}
					});
	
					this.more.remove();
				});
			}
		}
	}

	if(items instanceof NodeList) {
		items.forEach((item) => new Limiter(item, options));
	} else {
		return new Limiter(items, options);
	}
}