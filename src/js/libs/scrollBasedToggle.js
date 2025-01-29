/* 
* Упрощенный аналог wow.js. Отслеживает появление элемента снизу
* в области просмотра браузера. Добавляет и (опционально)
* убирает класс .active
* 
* @разметка:
* 
<div class="someblock" data-animation="-0.5"></div>
<div class="someblock" data-animation="0" data-repeat></div>
<div class="someblock" data-animation="0.5" data-repeat-both></div>
<div class="someblock" data-animation="200px"></div>
* 
* @параметры разметки: 
* 
* data-animation="0.5" - показатель смещения. Относительный множитель 
* показывающий на какую часть от своей высоты, должен показаться снизу 
* элемент, чтобы добавился класс. Принимает положительные и отрицательные 
* значения. Так же, может абсолютно задаваться в пикселях. 
* 
* data-repeat - убирать класс, если элемент вновь уходит за нижндюю
* границу браузера
* 
* data-repeat-both - убирать класс, если элемент уходит за нижндюю 
* или верхнюю границу браузера
* 
* @вызов:
* 
import { scrollBasedToggle } from "../../js/libs/scrollBasedToggle";
let toggle = scrollBasedToggle({
	nodes: document.querySelectorAll('.someblock'), // это нужно, если есть элементы имеющие СВОЮ прокрутку, которую надо слушать
	progress: true,
	throttle: false,
	data: 'animation',
	class: 'showed',
	add() {
		console.log(this);
	},
	remove() {
		console.log(this);
	},
	tick(progress) {
		console.log(this, progress);
	}
});
toggle.init(); // переинициализация
toggle.init(false); // удаление добавленных классов и отвязка обработчиков
*
*/

export const scrollBasedToggle = (options = {}) => {
	class Toggle {
	
		constructor(options) {
			this.options = {
				throttle: 250,
				nodes: [],
				class: 'active',
				dataRun: 'animation',
				dataRepeat: 'repeat',
				dataRepeatBoth: 'repeatBoth',
				progress: false,
				...options
			}

			this.isTicking = false;
			this.nodes = [ window, ...this.options.nodes ];
			this.init();
		}


		setProgress(box, shift) {
			if (this.options.progress) {
				const end = box.top + window.scrollY;
				const start = box.top + window.scrollY - window.innerHeight + shift;
				let progress = Math.round((window.scrollY - start) / (end - start) * 100);
			
				(box.bottom - shift - window.innerHeight > 0) && (progress = 0);
				(box.top < 0) && (progress = 100);

				return progress;
			}
			
			return null;
		}


		scrollToggle(item) {
			let action;

			const box = item.getBoundingClientRect();
			const active = item.classList.contains(`${this.options.class}`);
			const repeat = item.dataset[this.options.dataRepeat] != undefined;
			const repeatBoth = item.dataset[this.options.dataRepeatBoth] != undefined;
			
			let shift = item.dataset[`${this.options.dataRun}`] || '0';
			shift = shift.includes('px') ? box.height - parseFloat(shift) : box.height * shift;
			
			const insideOver = box.bottom + shift > 0;
			const insideUnder = box.bottom - shift - window.innerHeight < 0;
			
			! insideUnder && repeat && active && (action = 'remove');
			! active && insideOver && insideUnder && (action = 'add');
			! (insideOver && insideUnder) && repeatBoth && active && (action = 'remove');
			
			if (action) {
				item.classList[action](`${this.options.class}`);
				(typeof this.options[action] === 'function') && this.options[action].call(item);
			}
			
			(typeof this.options.tick === 'function') && this.options.tick.call(item, this.setProgress(box, shift));
		}
		

		#onScroll(item) {
			if (!this.isTicking && !this.options.throttle) {
				this.isTicking = true;

				requestAnimationFrame(() => {
					this.scrollToggle(item);
					this.isTicking = false;
				});

			} else {
				this.scrollToggle(item);
			}
		}


		#throttle = (fn) => {
			let lastTime = 0;
		
			return (...args) => {
				if (this.options.throttle) {
					const now = new Date().getTime();
					
					if (now - lastTime >= this.options.throttle) {
						lastTime = now;
						fn.apply(this, args);
					}
				} else {
					fn.apply(this, args);
				}
			}
		}


		init(flag = true) {
			if (flag) {
				this.items = [...document.querySelectorAll(`[data-${this.options.dataRun}]`)].map(item => {
					item.handler = this.#throttle(this.#onScroll.bind(this, item));
					return item;
				});
			}

			this.items.forEach((item, i) => {
				item.classList.remove(`${this.options.class}`);

				this.nodes.forEach(node => {
					node[(flag ? 'add' : 'remove') + 'EventListener']('scroll', item.handler)
				});
				
				flag && this.#onScroll(item);
			});
		}
	}

	return new Toggle(options);
}