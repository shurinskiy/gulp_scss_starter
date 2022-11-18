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

export const scrollClassToggle = (items, cls = "active") => {
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