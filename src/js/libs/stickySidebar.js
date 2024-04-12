export const stickySidebar = (items, options = {}) => {
	class Sidebar {
		constructor(aside, options) {
			if(! aside) return;

			this.aside = aside;
			this.currPos = window.scrollY;
			this.position = getComputedStyle(aside).position;
			this.asideHeight = aside.offsetHeight;
			this.screenHeight = window.innerHeight;
			this.options = {
				top: 0,
				bottom: 0,
				...options
			}

			this.init();
		}

		asideScroll() {
			if(this.position !== 'sticky') return;

			if (this.asideHeight <= this.screenHeight) {
				this.aside.style.top = this.startScroll + 'px';
				return;
			}

			this.endScroll = window.innerHeight - this.aside.offsetHeight - this.options.bottom;
	
			let asideTop = parseInt(this.aside.style.top.replace('px;', ''));
	
			if (this.asideHeight > this.screenHeight) {
				if (window.scrollY < this.currPos) {
					if (asideTop < this.startScroll) {
						this.aside.style.top = (asideTop + this.currPos - window.scrollY) + 'px';
					} else if (asideTop >= this.startScroll && asideTop !== this.startScroll) {
						this.aside.style.top = this.startScroll + 'px';
					}
				} else {
					if (asideTop > this.endScroll) {
						this.aside.style.top = (asideTop + this.currPos - window.scrollY) + 'px';
					} else if (asideTop < (this.endScroll) && asideTop !== this.endScroll) {
						this.aside.style.top = this.endScroll + 'px';
					}
				}
			}
			this.currPos = window.scrollY;
		}
		
		_throttle = (fn) => {
			let timeout = null;
		
			return (...args) => {
				if (timeout === null) {
					
					timeout = setTimeout(() => {
						fn.apply(this, args);
						timeout = null;
					}, options.sensitivity)
				}
			}
		}

		init() {
			this.startScroll = +this.options.top;
			this.endScroll = window.innerHeight - this.asideHeight - this.options.bottom;
			this.aside.style.top = this.startScroll + 'px';

			window.addEventListener('scroll', this.asideScroll.bind(this), { capture: true, passive: true });

			window.addEventListener('resize', this._throttle(() => {
				this.position = getComputedStyle(this.aside).position;
				this.asideHeight = this.aside.offsetHeight;
				this.screenHeight = window.innerHeight;
				this.asideScroll();
			}));

			this.asideScroll();
		}
	}

	if(items instanceof NodeList) {
		items.forEach((item) => new Sidebar(item, options));
	} else {
		return new Sidebar(items, options);
	}
}