export const driveSlide = {

	up(el, { duration = 500, opacity = false, callback } = {}) {
		if (el.timeout || window.getComputedStyle(el).display === 'none') return;
				
		Object.assign(el.style, {
			transitionProperty: 'height, margin, padding, opacity',
			transitionDuration: duration + 'ms',
			height: el.offsetHeight + 'px',
			boxSizing: 'border-box',
			opacity: 1,
		});

		requestAnimationFrame(() => {
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
			delete el.dataset.sliding;
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
		
		events.split(' ').forEach(event => {
			items.forEach(item => {
				const content = item.nextElementSibling;
				const parent = item.parentNode;
				
				content.style.display = 'none';
				parent.classList.contains(cls) && (content.style.display = 'block');

				item.addEventListener(event, function(e) {
					e.stopPropagation();
	
					items.forEach(other => {
						if (other != this) {
							slide.up(other.nextElementSibling, { duration });
							other.parentNode.classList.remove(cls);
						}
					});
	
					if (toggle) {
						slide[parent.classList.toggle(cls) ? 'down' : 'up'](content, { duration });
					} else {
						parent.classList.add(cls);
						slide.down(content, { duration });
					}
				});
			});
		});
	}
}