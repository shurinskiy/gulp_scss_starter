export const tweakerRangeSingle = (item, options = {}) => {
		
	class Range {
		constructor(item, options) {
			if(!item || !item instanceof Element) return;

			this.options = {
				class: 'range',
				min: item.min || 0,
				max: item.max || 100,
				current: item.value || 50,
				...options
			};

			this.$range = item;
			this.$outer = document.createElement('div');
			this.$progress = document.createElement('span');
			this.$wrapperRange = document.createElement('div');
			this.$wrapperNumber = document.createElement('div');
			this.$number = document.createElement('input');
			
			this.#render();
			this.#progress();
			this.init();
		}

		#render() {
			if (this.$range.type !== 'range') return;
			
			this.$outer.className = `${this.$range.className} ${this.options.class}`;
			Object.assign(this.$outer.dataset, this.$range.dataset);

			Object.keys(this.$range.dataset).forEach(dataKey => {
				delete this.$range.dataset[dataKey];
			});

			this.$range.removeAttribute('class');
			this.$number.type = 'number';
			this.$number.value = this.options.current;
			this.$range.parentNode.insertBefore(this.$outer, this.$range.nextSibling || null);

			this.$wrapperNumber.className = `${this.options.class}__value`;
			this.$wrapperRange.className = `${this.options.class}__slider`;

			this.$wrapperNumber.append(this.$number);
			this.$wrapperRange.append(this.$range, this.$progress);
			this.$outer.append(this.$wrapperNumber, this.$wrapperRange);
		}

		#progress() {
			const val = Math.min(this.$range.value, this.options.max);
			const offset = ((val - this.options.min) / (this.options.max - this.options.min) * 100).toFixed(2);
			this.$outer.style.setProperty("--progress", `${offset}`);
		}
		
		init() {
			this.$range.addEventListener('input', (e) => {
				this.$number.value = Math.min(+e?.currentTarget.value, this.options.max);
				this.#progress.call(this);
			});

			this.$number.addEventListener('input', (e) => {
				const value = Math.min(Math.max(this.options.min, +e?.currentTarget.value), this.options.max);
				this.$range.value = this.$number.value = value;
				this.#progress.call(this);
			});
		}
	}
	return new Range(item, options);
}