/* 
* Упрощенный аналог wow.js. Отслеживает появление элемента снизу
* в области просмотра браузера. Добавляет и (опционально)
* убирает класс .active
* 
* @разметка:
* 
<div class="someblock" data-shift="2"></div>
<div class="someblock" data-shift="2" data-repeat></div>
<div class="someblock" data-shift="2" data-repeat></div>
* 
* @параметры разметки: 
* 
* data-shift="2" - множитель показывающий на какую часть от своей 
* высоты, должен показаться снизу элемент, чтобы добавился класс
* 
* data-repeat - убирать класс, если элемент вновь уходит за нижндюю
* границу браузера
* 
* @вызов:
* 
import { scrollClassToggle } from "../../js/lib";
scrollClassToggle(document.querySelectorAll('.someblock'))
*/

export const scrollClassToggle = (items) => {
	if (items.length) {
		const classToggle = function(item) {
			const repeat = item.dataset['repeat'] != undefined;
			const box = item.getBoundingClientRect();
			const shift = box.height/item.dataset['shift'] || 1;
			const over = box.bottom + shift > 0;
			const under = box.bottom - shift - window.innerHeight < 0;
	
			if (repeat || !item.classList.contains('active'))
				item.classList[(over && under) ? 'add': 'remove']('active');
		}
		
		for (let i = 0; i < items.length; i++) {
			window.addEventListener('scroll', () => classToggle(items[i]));
			classToggle(items[i]);
		}
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
* несколько событик (click, hower и т.д.)
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
import { makeAccordion } from "../../js/lib";
document.querySelectorAll('.accordeon').forEach((accordeon) => {
	makeAccordion(accordeon.querySelectorAll('.accordeon__head'), { 
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
*/

export const makeAccordion = function(items, options = {}) {
	const cls = options.cls || 'opened';
	const events = options.events || 'click';
	const toggle = options.toggle;

	events.split(' ').forEach(event => {
		items.forEach(item => {
			item.addEventListener(event, function(e) {
				e.stopPropagation();
				items.forEach((item) => (item != this) && item.classList.remove(`${cls}`));
			
				if (this.classList != `${cls}`)
					this.classList[(toggle) ? 'toggle':'add'](`${cls}`);
			});
		});
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
			_image.className = `${cls}__image ${active}`;
			frame.append(_image);
			_image.append(images[j]);
		}

		frame.parentNode.append(_wrapper);
		_wrapper.append(frame, _thumbs);

		for (let k = 0; k < images.length; k++) {
			let active = k ? '':'active';
			let _thumb = document.createElement('span');
			_thumb.className = `${cls}__thumb ${active}`;
			_thumb.style.backgroundImage = `url(${images[k].src})`;
			_thumbs.append(_thumb);
		}

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

export const addUnderlay = function(cls = 'modal') {
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
* @вызов с передачей внешних скриптов:
* 
import { addUnderlay, makeModalFrame } from "../../js/lib";
import scrollLock from 'scroll-lock';
import Inputmask from "inputmask";
addUnderlay('modal');
makeModalFrame({ 
	cls: 'modal',
	scrollLock,
	Inputmask: Inputmask({
		"mask": "+7 (999) 999-99-99", 
		showMaskOnHover: false
	})
});
*/

export const makeModalFrame = function(options = {}) {
	const { scrollLock, Inputmask } = options;
	const cls = options.cls || 'modal';

	const modal = document.querySelector(`#${cls}__underlay`);
	const body = modal.querySelector(`.${cls}__content`);
	
	if (modal) {
		const close = function(e) {
			e.preventDefault();
			if(typeof scrollLock !== 'undefined') {
				scrollLock.clearQueueScrollLocks();
				scrollLock.enablePageScroll();
			}

			modal.className = `${cls}`;
			modal.style.display = "none";
			body.innerHTML = '';
		}

		const open = function(e) {
			e.preventDefault();
			
			if (getComputedStyle(modal).display !== 'none') 
				close(e);

			const id = e.target.dataset[`${cls}`] || 'error';
			const content = (id == '#') ? e.target.innerHTML : document.querySelector('#' + id).innerHTML;

			body.insertAdjacentHTML('beforeend', content);
			modal.classList.add(id != '#' ? `${cls}_${id}`:`${cls}_self`);
			modal.style.display = "block";

			if(typeof scrollLock !== 'undefined')
				scrollLock.disablePageScroll();
			
			if(typeof Inputmask !== 'undefined') 
				Inputmask.mask(body.querySelectorAll('input[type="tel"]'));
		}

		window.addEventListener('click', (e) => {
			if (e.target.hasAttribute(`data-${cls}`)) 
				open(e);

			if (e.target == modal || e.target.classList.contains(`${cls}__close`))
				close(e);
		});
	}
}
