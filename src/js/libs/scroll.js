/* 
* Переключатель классов основанный на скролле. Метод принимает в параметры
* блок содержащий элементы, для которого создается обертка с тем же классом, 
* но с окончанием "-outer". Этой обертке, надо задать стилевую высоту, которая
* будет определять продолжительность эффекта. Высота обертки, должна быть гарантированно
* больше высоты блока с элементами.
* 
* @разметка:
* 
<div class="scroll__items">
	<div class="scroll__item active current"></div>
	<div class="scroll__item"></div>
	<div class="scroll__item"></div>
	<div class="scroll__item"></div>
</div>
* 
* 
* @вызов:
* 
import { scrollBasedToggle } from "../../js/libs/scroll";
const sticky = document.querySelector('.scroll__items');
const items = sticky?.querySelectorAll('.scroll__item');

if (sticky && items) {
	scrollBasedToggle(sticky, items, { 
		current: 'current',
		active: 'actuve', 
		first: false, 
	});
}
* 
* @параметры вызова:
*
* sticky - блок содержащий целевые элементы.
* items - элементы у которых будут переключаться классы.
* active - класс активного элемента
* current - класс текущего элемента
* first - убирать или нет классы первого элемента при полной прокрутке вверх
*/

export const scrollBasedToggle = (sticky, items, options = {}) => {
	const current = options.current || 'current';
	const active = options.active || 'active';
	const first = options.first || false;
	const name = sticky.className.split(' ')[0];
	const _wrapper = document.createElement('div');

	_wrapper.className = `${name}-outer`;
	sticky.parentNode.append(_wrapper);
	_wrapper.append(sticky);

	Object.assign(sticky.style, {
		position: 'sticky',
		top: 0
	});

	if (items.length) {
		const classToggle = (items, outer, active) => {
			const box = outer.getBoundingClientRect();
			const step = Math.floor(Math.abs(box.top) / outer.scrollHeight * (items.length + 1));
			
			if (box.top < 0 && box.bottom - window.innerHeight > 0) {
				for (let i = 0; i < items.length; i++) {
					items[i].classList[(i <= step) ? 'add':'remove'](`${active}`);
					items[i].classList.remove(`${current}`);
				}
				items[step].classList.add(`${current}`);

			} else if (box.top > 0 && first) {
				items[0].classList.remove(`${active}`, `${current}`);
			}
		};
		
		window.addEventListener('scroll', () => classToggle(items, _wrapper, active), { capture: true, passive: true });
	}
}

/* 
* Упрощенный аналог wow.js. Отслеживает появление элемента снизу
* в области просмотра браузера. Добавляет и (опционально)
* убирает класс .active
* 
* @разметка:
* 
<div class="someblock" data-animation="-0.5"></div>
<div class="someblock" data-animation="0" data-repeat></div>
<div class="someblock" data-animation="0.5" data-repeat></div>
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
* @вызов:
* 
import { scrollClassToggle } from "../../js/libs/scroll";
let toggle = scrollClassToggle({
	nodes: document.querySelectorAll('.someblock'), // это нужно, если есть элементы имеющие СВОЮ прокрутку, которую надо слушать
	data: 'animation',
	class: 'showed',
	onadd: (item) => {

	},
	onremove: (item) => {

	},
});
toggle.init(); // переинициализация
toggle.init(false); // удаление добавленных классов и отвязка обработчиков
*
*/

export const scrollClassToggle = (options = {}) => {
	class Toggle {
	
		constructor(options) {
			this.options = {
				throttle: 250,
				nodes: [],
				data: 'animation',
				class: 'active',
				...options
			}

			this.nodes = [ window, ...this.options.nodes ];
			this.init();
		}

		_throttle = (fn) => {
			let timeout = null;
		
			return (...args) => {
				if (timeout === null) {
					
					timeout = setTimeout(() => {
						fn.apply(this, args);
						timeout = null;
					}, this.options.throttle);
				}
			}
		}

		toggle = (item) => {
			let action;
			const box = item.getBoundingClientRect();
			const repeat = item.dataset['repeat'] != undefined;
			const active = item.classList.contains(`${this.options.class}`);
			
			let shift = item.dataset[`${this.options.data}`] || '0';
			shift = shift.includes('px') ? box.height - parseFloat(shift) : box.height * shift;
			
			const over = box.bottom + shift > 0;
			const under = box.bottom - shift - window.innerHeight < 0;

			if (over && under && !active) action = 'add';
			if (!(over && under) && active && repeat) action = 'remove';
			
			if (action) {
				item.classList[action](`${this.options.class}`);
	
				if (typeof this.options[`on${action}`] === 'function')
					return this.options[`on${action}`].call(item);
			}
		};

		init(flag = true) {
			if (flag) {
				this.items = [...document.querySelectorAll(`[data-${this.options.data}]`)].map((item, i) => {
					item.handler = this._throttle(this.toggle.bind(this, item));
					item.index = i;
					return item;
				});
			}

			this.items.forEach((item) => {
				item.classList.remove(`${this.options.class}`);

				this.nodes.forEach(node => {
					node[(flag ? 'add' : 'remove') + 'EventListener']('scroll', item.handler)
				});
				
				flag && this.toggle(item);
			});
		}
	}

	return new Toggle(options);
}


/* 
* Простой, вертикальный параллакс-эффект. Создает для указанного
* блока - блок-подложку, с фоновым изображением исходного блока.
* При прокручивании страницы, смещает подложку относительно родительского
* блока, со скоростью определяемой коэффициентом из атрибута data-speed.
* 
* @исходная разметка 
* 
<div class="someblock" data-speed="7"></div>
* 
* @параметры разметки
* data-image - ссылка на изображение для подложки
* data-speed - коэффициент увеличения скорости эффекта
* 
* @вызов
* 
import { makeParallax } from "../../js/libs/scroll";
makeParallax('.someblock');
* 
* @параметры вызова:
* 
* cls - имя класса в динамически создаваемой разметке
*/

export const makeParallax = (selector, cls = "parallax") => {
	document.querySelectorAll(selector).forEach(item => {
		const _underlay = document.createElement('div');
		const styles = {
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat',
			backgroundColor: 'transparent',
			backgroundImage: `${getComputedStyle(item, null).backgroundImage}`,
			position: 'absolute',
			zIndex: 1,
			bottom: 0,
			right: 0,
			left: 0,
			top: 0,
		}

		Object.assign(_underlay.style, styles);
		_underlay.classList.add(`${cls}__underlay`);

		item.classList.add(`${cls}`);
		item.style.position = 'relative';
		item.style.overflow = 'hidden';
		item.prepend(_underlay);

		const translateY = () => {
			const box = item.getBoundingClientRect();
			const speed = Math.min(Math.max(0, item.dataset.speed || 0.5), 1);
			const screen = window.innerHeight;
			
			if ((box.top < screen) && (box.bottom > 0)) {
				_underlay.style.top = `${(screen + box.height) / -speed}px`;
				_underlay.style.transform = `translateY(${box.bottom / speed}px)`;
			}
		}

		window.addEventListener('scroll', translateY, { capture: true, passive: true });
		translateY();
	});
}

/* 
* Уходящий в глубину странички, параллакс-эффект. Метод принимает в параметры
* блок содержащий элементы, для которого создается обертка с тем же классом, 
* но с окончанием "-wrapper". Этой обертке, надо задать стилевую высоту, которая
* будет определять продолжительность эффекта.
* 
* @разметка:
* 
<div class="deep__sticky">
	<div class="deep__items">
		<div class="deep__item"></div>
		<div class="deep__item"></div>
		<div class="deep__item"></div>
		<div class="deep__item"></div>
	</div>
</div>
* 
* 
* @вызов:
* 
import { deepParallax } from "../../js/lib";
const sticky = document.querySelector('.deep__sticky');
const items = sticky?.querySelectorAll('.deep__item');

if (sticky && items) {
	deepParallax(sticky, items, { 
		speed: 5,
		fade: 0.9, 
		deep: 1000,
		perspective: 1500
	});
}
* 
* @параметры вызова:
*
* sticky - блок содержащий целевые элементы.
* items - элементы у которых будут переключаться классы.
* perspective - глубина перспективы (от плоскости экрана)
* speed - скорость перемещения элементов при прокрутке 
* deep - расстояние до самого дальнего слайда (от плоскости экрана)
* fade - момент исчезновения самого ближнего слайда (к плоскости экрана)
*/

export const deepParallax = (container, items, options = {}) => {
	const fade = options.fade || 1;
	const speed = options.speed || 5;
	const deep = -options.deep || -1000;
	const perspective = options.perspective || 1500;
	const name = container.className.split(' ')[0];
	const _wrapper = document.createElement('div');

	_wrapper.className = `${name}-wrapper`;
	container.parentNode.append(_wrapper);
	_wrapper.append(container);

	Object.assign(_wrapper.style, { position: 'relative' });
	Object.assign(container.style, {
		perspective: `${perspective}px`,
		transformStyle: 'preserve-3d',
		position: 'sticky',
		top: 0
	});

	let initDeep = () => {
		let top = _wrapper.offsetTop;
		let bottom = top + _wrapper.offsetHeight;
		let max = (container.scrollHeight - window.innerHeight) * speed;

		items.forEach((item, i) => {
			item.style.zIndex = items.length - i;

			if (top <= 0) {
				item.style.transform = `translateZ(${deep * i}px)`;
				
			} else if (bottom >= _wrapper.scrollHeight) {
				item.style.transform = `translateZ(${(deep * i) + max}px)`;
				item.style.opacity = (i > items.length - 2) ? 1 : 0;
			}
		});
	};

	let moveDeep = () => {
		let top = container.offsetTop;
		let bottom = top + container.offsetHeight;
		let step = container.offsetTop * speed;
		
		if (top > 0 && bottom < _wrapper.scrollHeight) {

			items.forEach((item, i) => {
				let move = (deep * i) + step;

				item.style.transform = `translateZ(${move}px)`;
				item.style.opacity = move < Math.abs(deep) / fade ? 1 : 0;
			});
		}
	};

	if (items.length) {
		initDeep();
		window.addEventListener('scroll', () => moveDeep(), { capture: true, passive: true });
	}
};
