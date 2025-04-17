/* 
* Простой, вертикальный параллакс-эффект. Создает для указанного
* блока - блок-подложку, с фоновым изображением исходного блока.
* При прокручивании страницы, смещает подложку относительно родительского
* блока, со скоростью определяемой коэффициентом из атрибута data-speed.
* 
* @исходная разметка 
* 
<div class="someblock" data-speed="0.8"></div>
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
			backgroundImage: !item.dataset.image
				? getComputedStyle(item).backgroundImage
				: `url(${item.dataset.image})`,
			willChange: 'transform',
			position: 'absolute',
			zIndex: 1,
			bottom: 0,
			right: 0,
			left: 0,
			top: 0,
		}
		let ticking = false;

		Object.assign(_underlay.style, styles);
		_underlay.classList.add(`${cls}__underlay`);

		item.classList.add(cls);
		item.style.position = 'relative';
		item.style.overflow = 'hidden';
		item.prepend(_underlay);

		const translateY = () => {
			const box = item.getBoundingClientRect();
			const speed = Math.min(Math.max(0, +item.dataset.speed || 0.5), 1);
			const screen = window.innerHeight;
			
			if (box.bottom > 0 && box.top < screen) {
				_underlay.style.top = `${(screen + box.height) / -speed}px`;
				_underlay.style.transform = `translateY(${box.bottom / speed}px)`;
			}
		}

		const onScroll = () => {
			if (! ticking) {
				requestAnimationFrame(() => {
					translateY();
					ticking = false;
				});

				ticking = true;
			}
		}

		window.addEventListener('scroll', onScroll, { capture: true, passive: true });
		translateY();
	});
}