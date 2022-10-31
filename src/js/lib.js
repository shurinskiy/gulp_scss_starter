/* ======== Вспомогательные функции ======== */


// Проверка на объект (не массив)
export const isObject = (item) => {
	return (item && typeof item === 'object' && !Array.isArray(item));
}


//Слияние двух объектов с глубокой вложенностью
export const mergeDeep = (target, ...sources) => {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, {
					[key]: {}
				});
				mergeDeep(target[key], source[key]);
			} else {
				Object.assign(target, {
					[key]: source[key]
				});
			}
		}
	}
	return mergeDeep(target, ...sources);
}


// Глубокое клонирование объекта
export const cloneObj = (obj) => {
	let newObj = {}
 
	for (let prop in obj) {
		newObj[prop] = (typeof obj[prop] !== 'object') ? obj[prop] : cloneObj(obj[prop]);
	}
	return newObj;
}


// Получить высоту скрытого элемента
export const getHeight = (el) => {
	if (!el) return;

	const computed = window.getComputedStyle(el);
	let height = (computed.boxSizing === "border-box") ? el.offsetHeight : el.offsetHeight - parseFloat(computed.paddingTop) - parseFloat(computed.paddingBottom) - parseFloat(computed.borderTopWidth) - parseFloat(computed.borderBottomWidth);

	if (computed.height === 'auto' && computed.display === 'none') {
		if (!el?.cloneNode) return null;
		
		const clone = el.cloneNode(true);
		
		Object.assign(clone.style, {
			boxSizing: 'border-box',
			visibility: 'hidden',
			overflow: 'visible',
			maxHeight: 'none',
			display: 'block',
			height: 'auto',
			opacity: '0',
		});
		
		el.after(clone);
		height = clone.offsetHeight;
		clone.remove();
	}

	return height;
}


// Плавно скрыть элемент
export const slideUp = (el, duration = 500, cb) => {
	if ((el.style.transitionDuration && el.style.transitionProperty) || window.getComputedStyle(el).display === 'none') return;

	const set = {
		overflow: 'hidden',
		paddingBottom: 0,
		marginBottom: 0,
		paddingTop: 0,
		marginTop: 0,
		height: 0
	}
	
	const transition = {
		transitionProperty: 'height, margin, padding',
		transitionDuration: duration + 'ms',
		height: el.offsetHeight + 'px',
		boxSizing: 'border-box',
	}
		
	Object.assign(el.style, transition);
	el.offsetHeight;
	Object.assign(el.style, set);

	window.setTimeout(() => {
		el.removeAttribute('style');
		el.style.display = 'none';
		if (typeof cb === 'function') return cb.call(el);
	}, duration);
}


// Плавно показать элемент
export const slideDown = (el, duration = 500, cb) => {
	if ((el.style.transitionDuration && el.style.transitionProperty) || window.getComputedStyle(el).display !== 'none') return;

	el.style.display = 'block';

	const set = {
		overflow: 'hidden',
		paddingBottom: 0,
		marginBottom: 0,
		paddingTop: 0,
		marginTop: 0,
		height: 0
	}
	
	const transition = {
		transitionProperty: 'height, margin, padding',
		transitionDuration: duration + 'ms',
		height: el.offsetHeight + 'px',
		boxSizing: 'border-box',
	}

	Object.assign(el.style, set);
	el.offsetHeight;
	Object.assign(el.style, transition);

	el.style.removeProperty('padding-top');
	el.style.removeProperty('padding-bottom');
	el.style.removeProperty('margin-top');
	el.style.removeProperty('margin-bottom');

	window.setTimeout(() => {
		el.style.removeProperty('box-sizing');
		el.style.removeProperty('height');
		el.style.removeProperty('overflow');
		el.style.removeProperty('transition-duration');
		el.style.removeProperty('transition-property');
		if (typeof cb === 'function') return cb.call(el);
	}, duration);
}


// Плавно переключить отображение элемента
export const slideToggle = (el, duration, cb) => {
	if (window.getComputedStyle(el).display === 'none') {
		return slideDown(el, duration, cb);
	} else {
		return slideUp(el, duration, cb);
	}
}


/* ======== Готовые решения ======== */

/* 
* Переключатель класса для мобильного меню. Отслеживает клик по заданным
* кнопкам и переключает класс для заданного блока. Так же отслеживает клик
* по страничке за пределами заданного блока.
* 
* @разметка
* 
<div class="menu">
	<button class="menu__close"></button>
	<a class="menu__item" href="./">One</a>
	<a class="menu__item" href="./">Two</a>
	<a class="menu__item" href="./">Three</a>
</div>
<button class="menu__toggle"></button>
* 
* @вызов
* 
import { menuToggle } from "../../js/lib";
const menu = document.querySelector('.menu');
const toggles = document.querySelectorAll('.menu__toggle, .menu__close');
menuToggle(menu, toggles, 'opened');
* 
*/

export const menuToggle = (menu, toggles, cls = 'opened') => {

	if(!toggles || !menu) return;

	toggles.forEach(item => {
		item.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			menu.classList.toggle(`${cls}`);
		});
	});

	['click','touchstart'].forEach(event => {
		document.addEventListener(event, function(e) {
			if(menu.classList.contains(`${cls}`) && !e.target.closest(`.${menu.className.split(' ')[0]}`)) {
				e.preventDefault();
				menu.classList.remove(`${cls}`);
			}
		});
	});
}

/* 
* Упрощенный аналог wow.js. Отслеживает появление элемента снизу
* в области просмотра браузера. Добавляет и (опционально)
* убирает класс .active
* 
* @разметка:
* 
<div class="someblock" data-shift="-0.5"></div>
<div class="someblock" data-shift="0" data-repeat></div>
<div class="someblock" data-shift="0.5" data-repeat></div>
* 
* @параметры разметки: 
* 
* data-shift="0.5" - множитель показывающий на какую часть от своей 
* высоты, должен показаться снизу элемент, чтобы добавился класс.
* Принимает положительные и отрицательные значения.
* 
* data-repeat - убирать класс, если элемент вновь уходит за нижндюю
* границу браузера
* 
* @вызов:
* 
import { scrollClassToggle } from "../../js/lib";
scrollClassToggle(document.querySelectorAll('.someblock'), 'showed')
*/

export const scrollClassToggle = (items, cls="active") => {
	if (items.length) {
		const classToggle = (item) => {
			const repeat = item.dataset['repeat'] != undefined;
			const box = item.getBoundingClientRect();
			const shift = box.height * item.dataset['shift'] || 0;
			const over = box.bottom + shift > 0;
			const under = box.bottom + shift - window.innerHeight < 0;
	
			if (repeat || !item.classList.contains(`${cls}`))
				item.classList[(over && under) ? 'add': 'remove'](`${cls}`);
		};
		
		[...items].forEach(item => {
			window.addEventListener('scroll', () => classToggle(item));
			classToggle(item);
		});
	}
}

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
import { scrollBasedToggle } from "../../js/lib";
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
		
		window.addEventListener('scroll', () => classToggle(items, _wrapper, active));
	}
}

/* 
* Подменяет стантартный малоуправляемый html тег select 
* на более управляемую структуру, сохраняя функциональность селекта
* 
* @исходная разметка:
* 
<select class="someblock__select">
	<option value="0">consectetur</option>
	<option value="1">adipisicing</option>
	<option value="2">expedita</option>
</select>
* 
* @результирующая разметка:
* 
* <div class="someblock__select select">
* 	<select style="display: none;">
* 		<option value="0">consectetur</option>
* 		<option value="1">adipisicing</option>
* 		<option value="2">expedita</option>
* 	</select>
* 	<div class="select__head">consectetur</div>
* 		<ul class="select__list">
* 			<li class="select__item" data-value="0">consectetur</li>
* 			<li class="select__item" data-value="1">adipisicing</li>
* 			<li class="select__item" data-value="2">expedita</li>
* 		</ul>
* 	</div>
* </div>
* 
* @вызов:
* 
import { selectTweaker } from "../../js/lib";
selectTweaker(document.querySelectorAll('.someblock__select'));
*/

export const selectTweaker = (items, name = 'select') => {

	for (let i = 0; i < items.length; i++) {
		const select = items[i];
		const options = select.querySelectorAll('option');
		const _wrapper = document.createElement('div');
		const _head = document.createElement('div');
		const _list = document.createElement('ul');
		
		_wrapper.className = `${select.className} ${name}`;
		_head.className = `${name}__head`;
		_list.className = `${name}__list`;

		select.style.display = 'none';
		select.removeAttribute('class');
		select.parentNode.append(_wrapper);
		_wrapper.append(select, _head, _list);
		
		_head.textContent = options[0].textContent;
		_head.addEventListener('click', () => _wrapper.classList.toggle(`${name}_opened`));

		for (let k = 0; k < options.length; k++) {
			_list.insertAdjacentHTML('beforeend', `<li class="${name}__item" data-value="${options[k].value}">${options[k].text}</li>`);
		}

		[..._list.children].forEach( item => {
			item.addEventListener('click', () => {
				_wrapper.classList.remove(`${name}_opened`);
				_head.textContent = item.textContent;
				select.value = item.getAttribute('data-value');
			});
		});

		document.addEventListener('mouseup', e => { 
			if (!_wrapper.contains(e.target)) 
				_wrapper.classList.remove(`${name}_opened`);
		});
	}
}

/* 
* По событию добавляет (переключает) класс у текущего блока 
* и удаляет этот класс у всех соседних. Может обрабатывать 
* несколько событий (click, hower и т.д.)
* 
* @разметка
* 
<div class="accordeon">
	<div class="accordeon__item">
		<h2 class="accordeon__head opened"></h2>
		<div class="accordeon__block"></div>
	</div>
	<div class="accordeon__item">
		<h2 class="accordeon__head"></h2>
		<div class="accordeon__block"></div>
	</div>
	<div class="accordeon__item">
		<h2 class="accordeon__head"></h2>
		<div class="accordeon__block"></div>
	</div>
</div>
*
* @вызов (с уточнением контекста):
*
import { roughAccordion } from "../../js/lib";
document.querySelectorAll('.accordeon').forEach((accordeon) => {
	roughAccordion(accordeon.querySelectorAll('.accordeon__head'), { 
		events: 'click, mouseenter',
		cls: 'active',
		toggle: false
	});
});
*
* @параметры вызова:
*
* cls - переключаемый класс
* еvents - отслеживаемые события (строка, через запятую)
* toggle - не просто добавлять, а переключать класс у текущего элемента 
*/

export const roughAccordion = (items, options = {}) => {
	const cls = options.cls || 'opened';
	const events = options.events || 'click';
	const toggle = options.toggle;
	
	events.split(' ').forEach(event => {
		items.forEach(item => {
			item.addEventListener(event, function(e) {
				e.stopPropagation();
				items.forEach(item => (item != this) && item.classList.remove(`${cls}`));
			
				if (this.classList != `${cls}`)
					this.classList[(toggle) ? 'toggle':'add'](`${cls}`);
			});
		});
	});
}

/* 
* По событию анимированно скрывает (показывает) по высоте, текущий 
* элемент (добавляя ему класс при открытии) и скрывает все остальные 
* элементы (убирая класс). Может обрабатывать несколько событий (click, hower и т.д.)
* 
* @разметка
* 
<div class="accordeon">
	<div class="accordeon__item">
		<h2 class="accordeon__head opened"></h2>
		<div class="accordeon__block"></div>
	</div>
	<div class="accordeon__item">
		<h2 class="accordeon__head"></h2>
		<div class="accordeon__block"></div>
	</div>
	<div class="accordeon__item">
		<h2 class="accordeon__head"></h2>
		<div class="accordeon__block"></div>
	</div>
</div>
*
* @вызов (с уточнением контекста):
*
import { smoothAccordion } from "../../js/lib";
document.querySelectorAll('.accordeon').forEach((accordeon) => {
	smoothAccordion(accordeon.querySelectorAll('.accordeon__head'), { 
		events: 'click, mouseenter',
		cls: 'active,
		toggle: false
	});
});
*
* @параметры вызова:
*
* cls - переключаемый класс
* еvents - отслеживаемые события (строка, через запятую)
* toggle - не просто добавлять, а переключать класс у текущего элемента 
* duration - продолжительность анимационного эффекта
*/

export const smoothAccordion = function(items, options = {}) {
	const cls = options.cls || 'opened';
	const events = options.events || 'click';
	const duration = options.duration || 400;
	const toggle = options.toggle;

	events.split(' ').forEach(event => {
		items.forEach(item => {
			item.addEventListener(event, function(e) {
				e.stopPropagation();

				items.forEach(item => {
					if (item != this) {
						slideUp(item.nextElementSibling, duration);
						item.classList.remove(`${cls}`);
					}
				});

				if (toggle) {
					slideToggle(item.nextElementSibling, duration);
					this.classList.toggle(`${cls}`);
				} else {
					slideDown(item.nextElementSibling, duration);
					this.classList.add(`${cls}`);
				}
			})
		})
	});
}

/* 
* Простая галерея (например для детального вида продукта) 
* под главной картинкой подставляется навигация в виде превьюшек с 
* фоном от соответствующих картинок. Опционально, добавляеются 
* кнопки стрелочной навигации
* 
* @исходная разметка:
* 
<div class="someblock">
	<img src="https://source.unsplash.com/random/600x600?cats" alt="">
	<img src="https://source.unsplash.com/random/601x600?cats" alt="">
	<img src="https://source.unsplash.com/random/600x601?cats" alt="">
	<img src="https://source.unsplash.com/random/601x601?cats" alt="">
</div>
* 
* @результирующая разметка:
* 
* <div class="someblock gallery">
* 	<div class="gallery__frame">
* 		<div class="gallery__image active">
* 			<img src="https://source.unsplash.com/random/600x600?cats" alt="">
* 		</div>
* 		<div class="gallery__image">
* 			<img src="https://source.unsplash.com/random/601x600?cats" alt="">
* 		</div>
* 		<div class="gallery__image">
* 			<img src="https://source.unsplash.com/random/600x601?cats" alt="">
* 		</div>
* 		<div class="gallery__image">
* 			<img src="https://source.unsplash.com/random/601x601?cats" alt="">
* 		</div>
* 	</div>
* 	<div class="gallery__thumbs">
* 		<span class="gallery__thumb active" style="background-image: url(https://source.unsplash.com/random/600x600?cats)"></span>
* 		<span class="gallery__thumb" style="background-image: url(https://source.unsplash.com/random/601x600?cats);"></span>
* 		<span class="gallery__thumb" style="background-image: url(https://source.unsplash.com/random/600x601?cats);"></span>
* 		<span class="gallery__thumb" style="background-image: url(https://source.unsplash.com/random/601x601?cats);"></span>
* 	</div>
* 	<button class="gallery__prev"></button>
* 	<button class="gallery__next"></button>
* </div>
* 
* @вызов:
* 
import { makeGallery } from "../../js/lib";
makeGallery(document.querySelectorAll('.someblock'), { 
	cls: gallery,
	navigation: true 
});
* 
* @параметры вызова:
* 
* cls - имя класса галереи в динамически создаваемой разметке
* navigation - включение дополнительной стрелочной навигации
*/

export const makeGallery = (items, options = {}) => {
	const cls = options.cls || 'gallery';
	const navigation = options.navigation;

	for (let i = 0; i < items.length; i++) {
		const frame = items[i];
		const images = frame.querySelectorAll('img');
		const _wrapper = document.createElement('div');
		const _thumbs = document.createElement('div');
		
		_wrapper.className = `${frame.className} ${cls}`;
		_thumbs.className = `${cls}__thumbs`;
		frame.className = `${cls}__frame`;
		
		for (let j = 0; j < images.length; j++) {
			let active = j ? '':'active';
			let _image = document.createElement('div');
			let _thumb = document.createElement('span');
			_image.className = `${cls}__image ${active}`;
			_thumb.className = `${cls}__thumb ${active}`;
			_thumb.style.backgroundImage = `url(${images[j].src})`;
			frame.append(_image);
			_image.append(images[j]);
			_thumbs.append(_thumb);
		}

		frame.parentNode.append(_wrapper);
		_wrapper.append(frame, _thumbs);

		if (navigation) {
			const _prev = document.createElement('button');
			const _next = document.createElement('button');
			_prev.className = `${cls}__prev`;
			_next.className = `${cls}__next`;
			_wrapper.append(_prev, _next);
		}

		_wrapper.addEventListener('click', function(e) {
			// индекс активного слайда
			let currentActive = [...images].findIndex(el => el.parentNode.classList.contains('active'));

			// убрать класс "active" у всех слайдов и у всех превьюшек
			let clearActive = () => {
				[...images].map((el) => { el.parentNode.classList.remove('active') });
				[..._thumbs.children].map((el) => { el.classList.remove('active') });
			}

			// сдвинуть индекс активного слайда в заданном направлении
			let moveActive = (direction) => {
				clearActive();
				currentActive += direction;

				if (currentActive >= images.length) {
					currentActive = 0;
				} else if(currentActive < 0) {
					currentActive = images.length - 1;
				}

				images[currentActive].parentNode.classList.add('active')
				_thumbs.children[currentActive].classList.add('active');
			}

			// если клик по превьюшке
			if(e.target.classList.contains(`${cls}__thumb`)) {
				clearActive();
				images[[..._thumbs.children].findIndex(el => el == e.target)].parentNode.classList.add('active');
				e.target.classList.add('active');
			}

			// если клик по кнопке "prev"
			if (e.target.classList.contains(`${cls}__prev`))
				moveActive(-1);

			// если клик по кнопке "next"
			if (e.target.classList.contains(`${cls}__next`))
				moveActive(1);
		});
	}
}

/* 
* Простой, вертикальный параллакс-эффект. Создает для указанного
* блока - блок-подложку, с фоном задаваемым атрибутом data-image.
* При прокручивании страницы, смещает подложку относительно родительского
* блока, со скоростью определяемой коэффициентом из атрибута data-speed.
* 
* @исходная разметка 
* 
<div class="someblock" data-image="https://source.unsplash.com/random/350x650?nature" data-speed="7"></div>
* 
* @параметры разметки
* data-image - ссылка на изображение для подложки
* data-speed - коэффициент увеличения скорости эффекта
* 
* @результирующая разметка
* 
* <div class="someblock parallax" 
* 	data-image="https://source.unsplash.com/random/350x650?nature" 
* 	data-speed="7" 
* 	style="
* 		position: relative; 
* 		overflow: hidden;"
* >
* 	<div class="parallax__underlay" 
* 		style="
* 			background-size: cover; 
* 			background-position: center center; 
* 			background-repeat: no-repeat; 
* 			background-color: transparent; 
* 			background-image: url(https://source.unsplash.com/random/350x650?nature); 
* 			position: absolute; 
* 			z-index: 1; 
* 			inset: -206.067px 0px 0px; 
* 			transform: translateY(108.092px);"
* 	>
* 	</div>
* </div>
* 
* @вызов
* 
import { makeParallax } from "../../js/lib";
makeParallax(document.querySelectorAll('.someblock'));
* 
* @параметры вызова:
* 
* cls - имя класса в динамически создаваемой разметке
*/

export const makeParallax = (items, cls = "parallax") => {
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const _underlay = document.createElement('div');
		const styles = {
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat',
			backgroundColor: 'transparent',
			backgroundImage: `url(${item.dataset.image})`,
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
			const speed = item.dataset.speed || 10;
			const screen = window.innerHeight;
			
			if ((box.top < screen) && (box.bottom > 0)) {
				_underlay.style.top = `${(screen + box.height) / -speed}px`;
				_underlay.style.transform = `translateY(${box.bottom / speed}px)`;
			}
		}

		window.addEventListener('scroll', translateY);
		translateY();
	}
}

/* 
* Вспомогательная функция создающая подложку для будущего 
* использования с модальным окном и т.п. Подложка добавляется
* в конце тега body текущей странички
*
* @результирующая структура:
*
* <div class="modal" id="modal__underlay" data-scroll-lock-scrollable="">
* 	<div class="modal__body">
* 		<span class="modal__close"></span>
* 		<div class="modal__content"></div>
* 	</div>
* </div>
*
* @вызов:
*
addUnderlay('modal');
*/

export const addUnderlay = (cls = 'modal') => {
	if(! document.querySelector(`#${cls}__underlay`)) {
		const _underlay = document.createElement('div');
		const _body = document.createElement('div');
		const _close = document.createElement('span');
		const _content = document.createElement('div');
		
		_underlay.className = `${cls}`;
		_underlay.id = `${cls}__underlay`;
		_underlay.setAttribute('data-scroll-lock-scrollable', '');
		_body.className = `${cls}__body`;
		_close.className = `${cls}__close`;
		_content.className = `${cls}__content`;

		_body.append(_close);
		_body.append(_content);
		_underlay.append(_body);
		document.body.append(_underlay);
	}
}

/* 
* Простое модальное окно. Слушает элементы имеющие data-атрибут с 
* именем укзанным в параметре cls при вызове. При клике по такому
* элементу либо находит блок, по id указанному в значении data-атрибута,
* либо, если в значении data-атрибута указана #, берет внутренний html этого 
* элемента и выводит в модальном окне. Может работать с внешними 
* скриптами (scrollLock, Inputmask), если они переданы в качестве
* параметров при вызове.
* 
* @элемент для прослушивания:
* <span data-modal="someblock"></span>
* 
* @вызов:
* 
import { addUnderlay, makeModalFrame } from "../../js/lib";
addUnderlay('modal');
makeModalFrame({ cls: 'modal' });
* 
* @вызов с использованием внешних решений (передаются через callback функцию):
* 
import { addUnderlay, makeModalFrame } from "../../js/lib";
import scrollLock from 'scroll-lock';
import Inputmask from "inputmask";
addUnderlay('modal');
makeModalFrame({ el: '.some-el', cls: 'modal', scrollLock}, function() {
	Inputmask({ "mask": "+7 (999) 999-99-99", showMaskOnHover: false });
	Inputmask.mask(this.querySelectorAll('input[type="tel"]'));
});
*/

export const makeModalFrame = function(options = {}, cb) {
	const { scrollLock } = options;
	const cls = options.cls || 'modal';
	const select = options.el || `[data-${cls}]`;

	const modal = document.querySelector(`#${cls}__underlay`);
	const body = modal.querySelector(`.${cls}__content`);
	
	if (modal) {

		const close = function() {
			if(typeof scrollLock !== 'undefined') {
				scrollLock.clearQueueScrollLocks();
				scrollLock.enablePageScroll();
			}

			modal.className = `${cls}`;
			modal.style.display = "none";

			body.className = `${cls}__body`;
			body.innerHTML = '';
		}
		
		const open = function(el) {
			const id = el.dataset[`${cls}`] || 'error';
			const content = (id == '#') ? el.innerHTML : document.querySelector('#' + id).innerHTML;
			
			modal.className = `${cls}`;
			modal.classList.add(id != '#' ? `${cls}_${id}`:`${cls}_self`);
			modal.style.display = "block";

			body.innerHTML = '';
			body.className = `${cls}__content`;
			body.insertAdjacentHTML('beforeend', content);

			if(typeof scrollLock !== 'undefined')
				scrollLock.disablePageScroll();

			if (typeof cb === 'function') 
				return cb.call(body, el);
		}

		document.addEventListener('click', (e) => {
			let el = e.target.closest(select);

			if (el && el.dataset[`${cls}`]) {
				e.preventDefault();
				open(el);
			}
		});

		document.addEventListener('click', (e) => {
			if (e.target == modal || e.target.classList.contains(`${cls}__close`)) {
				e.preventDefault();
				close();
			}
		});
	}
}