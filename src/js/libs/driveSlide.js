const driveSlide = {

	up(el, { duration = 500, opacity = false, callback } = {}) {
		if (el.timeout || window.getComputedStyle(el).display === 'none') return;
		el.style.display = 'block';
				
		Object.assign(el.style, {
			transitionProperty: 'height, margin, padding, opacity',
			transitionDuration: duration + 'ms',
			height: el.offsetHeight + 'px',
			boxSizing: 'border-box',
			opacity: 1,
		});

		requestAnimationFrame(() => {
			el.offsetHeight;
			Object.assign(el.style, {
				overflow: 'hidden',
				paddingBottom: 0,
				marginBottom: 0,
				paddingTop: 0,
				marginTop: 0,
				height: 0,
				...opacity && { opacity: 0 }
			});
		});
	
		el.timeout = window.setTimeout(() => {
			el.removeAttribute('style');
			el.style.display = 'none';
			callback?.call(el);
			delete el.timeout;
		}, duration);
	},


	down(el, { duration = 500, opacity = false, callback } = {}) {
		if (el.timeout || window.getComputedStyle(el).display !== 'none') return;
		el.style.display = 'block';

		const height = el.offsetHeight + 'px';
		const animateProps = ['padding-bottom', 'margin-bottom', 'padding-top', 'margin-top'];
		const resetProps = [
			'transition-duration',
			'transition-property',
			'box-sizing',
			'overflow',
			'opacity',
			'height',
		];
	
		Object.assign(el.style, {
			transitionProperty: 'height, margin, padding, opacity',
			boxSizing: 'border-box',
			overflow: 'hidden',
			paddingBottom: 0,
			marginBottom: 0,
			paddingTop: 0,
			marginTop: 0,
			height: 0,
			...opacity && { opacity: 0 }
		});
		
		requestAnimationFrame(() => {
			el.offsetHeight;
			Object.assign(el.style, {
				transitionDuration: duration + 'ms',
				opacity: 1,
				height,
			});
		
			requestAnimationFrame(() => {
				animateProps.forEach(pr => el.style.removeProperty(pr));
			});
		});
	
		el.timeout = window.setTimeout(() => {
			resetProps.forEach(pr => el.style.removeProperty(pr));
			callback?.call(el);
			delete el.timeout;
		}, duration);
	},


	toggle(el, options) {
		return window.getComputedStyle(el).display === 'none'
			? (this.down(el, options), true)
			: (this.up(el, options), false);
	},


	accordion(items, options = {}) {
		const {
			cls = 'opened',
			events = 'click',
			duration = 400,
			toggle = false
		} = options;
	
		const slide = this;
		
		events.split(/\s+/).forEach(event => {
			items.forEach(item => {
				const content = item.nextElementSibling;
				const parent = item.parentNode;
				
				item.addEventListener(event, function(e) {
					e.stopPropagation();
					if (options.lock) return;

					items.forEach(other => {
						if (other != this) {
							slide.up(other.nextElementSibling, { duration });
							other.parentNode.classList.remove(cls);
						}
					});
	
					if (toggle) {
						parent.classList.toggle(cls, slide.toggle(content, { duration }));
					} else {
						slide.down(content, { duration });
						parent.classList.add(cls);
					}

					options.lock = window.setTimeout(() => {
						delete options.lock;
					}, duration);
				});
			});
		});
	},


	accordionSimple(items, options = {}) {
		const {
			events = 'click',
			toggle = false,
			cls = 'opened'
		} = options;

		events.split(' ').forEach(event => {
			items.forEach(item => {
				item.addEventListener(event, function (e) {
					e.stopPropagation();
					items.forEach(other => (other !== this) && other.classList.remove(cls));
					this.classList.contains(cls) || this.classList[(toggle ? 'toggle' : 'add')](cls);
				});
			});
		});
	}
};

export default driveSlide;
export const { up, down, toggle, accordion, accordionSimple } = driveSlide;