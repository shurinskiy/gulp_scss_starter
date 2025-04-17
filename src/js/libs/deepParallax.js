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