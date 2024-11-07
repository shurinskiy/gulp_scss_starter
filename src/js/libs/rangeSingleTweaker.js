export const rangeSingleTweaker = (item, options = {}) => {
		
	class Range {
		constructor(item, options) {
			if(!item || !item instanceof Element) return;

			this.options = {
				class: 'range',
				min: item.min || 0,
				max: item.max || 1000,
				current: item.value || 100,
				...options
			};

			this.$range = item;
			this.$wrapper = document.createElement('div');
			this.$value = document.createElement('input');
			this.$progress = document.createElement('span');
			
			this.render();
			this.progress();
			this.init();
		}

		render() {
			if (this.$range.type !== 'range') return;
			const previous = this.$range.previousElementSibling;
			
			this.$wrapper.className = `${this.$range.className} ${this.options.class}`;
			Object.assign(this.$wrapper.dataset, this.$range.dataset);

			Object.keys(this.$range.dataset).forEach(dataKey => {
				delete this.$range.dataset[dataKey];
			});

			this.$range.removeAttribute('class');
			this.$value.type = 'number';
			this.$value.value = this.options.current;

			(previous) ? previous.after(this.$wrapper) : select.parentNode.prepend(this.$wrapper);
			this.$wrapper.append(this.$value, this.$range, this.$progress);
		}

		progress() {
			const val = Math.min(this.$range.value, this.options.max);
			const offset = ((val - this.options.min) / (this.options.max - this.options.min) * 100).toFixed(2);
			this.$progress.style.setProperty("width", `${offset}%`);
		}
		
		init() {
			this.$range.addEventListener('input', (e) => {
				this.$value.value = Math.min(+e?.currentTarget.value, this.options.max);
				this.progress.call(this);
			});

			this.$value.addEventListener('input', (e) => {
				const value = Math.min(Math.max(this.options.min, +e?.currentTarget.value), this.options.max);
				this.$range.value = this.$value.value = value;
				this.progress.call(this);
			});
		}
	}
	return new Range(item, options);
}