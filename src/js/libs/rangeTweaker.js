/* 
* В качестве исходной разметки, используется пара инпутов с типом "range",
* в обертке с любым классом или идентификатором. В результате создается 
* структура из двух полей с типом "range" и двух полей с типом "number", 
* связанных в соответствии с заданными опциями. А так-же элемента span, 
* ширина которого зависит от значений заданных движками или полями ввода.
* Стилизацию структуры, нужно производить самостоятельно.
* 
* @исходная разметка:
* 
<div class="someblock">
	<input type="range">
	<input type="range">
</div>
* 
* @результирующая разметка:
* 
<div class="someblock range">
	<div class="range__values">
		<input type="number">
		<input type="number">
	</div>
	<div class="range__slider">
		<input type="range" min="0" max="10000" step="100">
		<input type="range" min="0" max="10000" step="100">
		<span style="left: 25%; right: 25%;"></span>
	</div>
</div>
* 
* @вызов:
* 
import { rangeTweaker } from "../../js/libs/rangeTweaker";
rangeTweaker(document.querySelectorAll('.someblock'), {
	maxPrice: 10000,
	startMin: 2500,
	startMax: 7500,
	input: false,
	step: 100,
	gap: 1000
});
*/

export const rangeTweaker = (item, options = {}) => {
	class Range {
		constructor(item, options) {
			if(!item || !item instanceof Element) return;

			this.options = {
				class: 'range',
				maxPrice: 10000,
				startMin: 2500,
				startMax: 7500,
				input: true,
				step: 100,
				gap: 1000,
				...options
			};

			this.$wrapper = item;
			this.$prices = [];
			this.$controls = [...item.children].filter(child => child.type === 'range');
			this.$progress = document.createElement('span');
			this.$slider = document.createElement('div');
			this.$top = document.createElement('div');
			this.render();
			this.init();
		}

		render() {
			if (! this.$controls || this.$controls.length !== 2) return;

			this.$wrapper.classList.add(this.options.class);
			this.$top.classList.add(`${this.options.class}__values`);
			this.$slider.classList.add(`${this.options.class}__slider`);
			
			this.$controls.forEach((control, i) => {
				const value = i ? this.options.startMax : this.options.startMin;
				
				this.$prices[i] = document.createElement('input');
				this.$prices[i].disabled = !this.options.input;
				this.$prices[i].type = 'number';
				this.$prices[i].value = value;
				
				control.min = 0;
				control.max = this.options.maxPrice;
				control.step = this.options.step;
				control.value = value;

				this.$top.append(this.$prices[i]);
				this.$slider.append(control);
			});
			
			this.$slider.append(this.$progress);
			this.$wrapper.append(this.$top, this.$slider);
		}

		setControls(e) {
			let min = +this.$controls[0].value;
			let max = +this.$controls[1].value;
	
			if ((max - min) < this.options.gap) {
				if (e?.currentTarget === this.$controls[0]) {
					this.$controls[0].value = max - this.options.gap;
				} else {
					this.$controls[1].value = min + this.options.gap;
				}
			} else {
				this.$prices[0].value = min;
				this.$prices[1].value = max;
				this.$progress.style.left = ((min / this.options.maxPrice) * 100) + "%";
				this.$progress.style.right = 100 - (max / this.options.maxPrice) * 100 + "%";
			}
		}

		setPrices(e) {
			let min = +this.$prices[0].value;
			let max = +this.$prices[1].value;
			
			if ((max - min >= this.options.gap) && max <= this.$controls[1].max) {
				if (e?.currentTarget === this.$prices[0]) {
					this.$controls[0].value = min;
					this.$progress.style.left = ((min / this.options.maxPrice) * 100) + "%";
				} else {
					this.$controls[1].value = max;
					this.$progress.style.right = 100 - (max / this.options.maxPrice) * 100 + "%";
				}
			}
		}

		init() {
			this.$controls.forEach(control => {
				control.addEventListener("input", this.setControls.bind(this));
			});	
		
			this.options.input && this.$prices.forEach(price => {
				price.addEventListener("input", this.setPrices.bind(this));
			});
			
			this.setControls();
		}
	}
	return new Range(item, options);
}