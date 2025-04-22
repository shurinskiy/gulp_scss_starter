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
import { deepParallax } from "../../js/lib/deepParallax";
const sticky = document.querySelector('.deep__sticky');
const items = sticky?.querySelectorAll('.deep__item');

sticky && items && deepParallax(sticky, items, { 
	perspective: 1500,
	deep: 1000,
	fade: 0.9,
	speed: 5,
});
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
	if (!container || !items?.length) return;

	const {
		fade = 1,
		speed = 5,
		perspective = 1500,
		deep = 1000,
	} = options;

	const depth = -Math.abs(deep);
	const cls = container.className.split(' ')[0];
	const wrapper = document.createElement('div');

	// Обертка для sticky-блока
	wrapper.className = `${cls}-wrapper`;
	wrapper.style.position = 'relative';

	// Стили контейнера (sticky)
	Object.assign(container.style, {
		perspective: `${perspective}px`,
		transformStyle: 'preserve-3d',
		position: 'sticky',
		top: '0',
	});

	// Вставляем wrapper в DOM и оборачиваем container
	container.parentNode.append(wrapper);
	wrapper.append(container);

	const init = () => {
		const top = wrapper.offsetTop;
		const bottom = top + wrapper.offsetHeight;
		const maxShift = (container.scrollHeight - window.innerHeight) * speed;

		items.forEach((item, i) => {
			item.style.zIndex = items.length - i;

			// Если страница ещё не проскроллена — просто разложить по глубине
			if (top <= 0) {
				item.style.transform = `translateZ(${depth * i}px)`;
				
			// Если скролл дошел до конца — заморозить на финальных позициях
			} else if (bottom >= wrapper.scrollHeight) {
				item.style.transform = `translateZ(${(depth * i) + maxShift}px)`;
				item.style.opacity = (i > items.length - 2) ? 1 : 0;
			}
		});
	};

	const update = () => {
		const top = container.offsetTop;
		const bottom = top + container.offsetHeight;
		const step = container.offsetTop * speed;
		
		if (top > 0 && bottom < wrapper.scrollHeight) {

			items.forEach((item, i) => {
				const move = (depth * i) + step;
				const isActive = move < Math.abs(depth) / fade;

				item.style.transform = `translateZ(${move}px)`;
				item.style.opacity = isActive ? 1 : 0;
				item.style.pointerEvents = isActive ? 'auto' : 'none';
			});
		}
	};

	init();
	window.addEventListener('scroll', () => update());
};