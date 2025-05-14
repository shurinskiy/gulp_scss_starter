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
		<div class="deep__item" data-depth></div>
		<div class="deep__item" data-depth></div>
		<div class="deep__item" data-depth></div>
		<div class="deep__item" data-depth></div>
	</div>
</div>
* 
* 
* @вызов:
* 
import { deepParallax } from "../../js/lib/deepParallax";

deepParallax(document.querySelector('.deep__sticky'), { 
	perspective: 1500,
	name: 'depth',
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
* speed - коэффициент полноты использования доступной прокрутки
* deep - расстояние до самого дальнего слайда (от плоскости экрана)
* fade - момент исчезновения самого ближнего слайда (к плоскости экрана)
*/

export const deepParallax = (container, options = {}) => {
	if (! container) return;
	
	const {
		fade = 1,
		deep = 1000,
		name = 'depth',
		perspective = 1500,
		speed: customSpeed,
	} = options;
	
	const items = container.querySelectorAll(`[data-${name}]`);
	const cls = container.className.split(' ')[0];
	const wrapper = document.createElement('div');
	const total = items.length - 1;
	let ticking = false;

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

	const render = () => {
		const rectOuter = wrapper.getBoundingClientRect();
		const rectInner = container.getBoundingClientRect();
		const maxScroll = rectOuter.height - rectInner.height;
		const topScroll = Math.min((rectOuter.top > 0 ? 0 : -rectOuter.top), maxScroll);

		const lastDepth = parseFloat(items[total]?.dataset[name]) || total;
		const speed = customSpeed ?? ((deep * lastDepth) / maxScroll || 0);

		items.forEach((item, i) => {
			const itemDepth = parseFloat(item.dataset[name]) || i;
			let moveZ = (topScroll * speed) - (deep * itemDepth);
			const isVisible = moveZ < deep / fade;

			(i == total) && (moveZ = Math.min(moveZ, 0));

			item.style.zIndex ||= items.length - i;
			item.style.willChange ||= 'transform, opacity';
			item.style.pointerEvents = isVisible ? 'auto' : 'none';
			item.style.transform = `translateZ(${moveZ}px)`;
			item.style.opacity = isVisible ? 1 : 0;
		});
	}

	const onScroll = () => {
		if (! ticking) {
			ticking = true;

			window.requestAnimationFrame(() => {
				render();
				ticking = false;
			});
		}
	};

	render();
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll);
};