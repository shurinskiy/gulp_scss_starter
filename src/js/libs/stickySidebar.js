/* 
* Простая реализация прилипающего сайдбара, когда сайдбар плавно следует 
* за прокруткой страницы, но с дополнительной логикой для ограничения
* области прокрутки. Если сайдбар короче высоты экрана — он остаётся на месте. 
* Если длиннее — плавно скроллится в пределах экрана, не выходя за границы.
* 
* Важно! - крайние значения для верхнего и нижнего 'прилипания', берет из стилей
* элемента - top и bottom, соответственно. По этому, если они по дизайну, отличаются
* от 0 - их обязательно нужно задавать в css. Такой подход, кроме того, еще позволяет
* задавать разные значения top и bottom в медиазапросах, что дает возможность для адаптации
* 
* 
* @разметка:
* 
<aside class="aside">
	<div class="aside__sidebar"></div>
</aside>
* 
* 
* @необходимые стили: 
* 
.aside {
	&__sidebar {
		position: sticky;
		bottom: 20px;
		top: 0px;
	}
}
* 
* 
* @вызов:
* 
import { stickySidebar } from "../../js/libs/stickySidebar";

stickySidebar(document.querySelector('.aside__sidebar'), {
	resizeSensitivity: 100,
	easing: 0.2
});
* 
* @параметры вызова:
*
* resizeSensitivity - скорость реагирования на resize для обновления стартовых данных
* easing - скорость анимации остановки скролла
* 
*/

export const stickySidebar = (items, options = {}) => {
	class Sidebar {
		constructor(aside, options) {
			if(! aside) return;
			
			this.options = {
				resizeSensitivity: 250,
				easing: 0.5,
				...options
			}

			this.aside = aside;
			this.currPos = window.scrollY;
			this.styles = window.getComputedStyle(aside);
			this.startScroll = parseInt(this.styles.top, 10);
			this.availableHeightTop = window.innerHeight - this.startScroll;
			this.availableHeightBottom = window.innerHeight - parseInt(this.styles.bottom, 10);
			this.aside.style.top = this.startScroll + 'px';
			
			this.currentTop = this.startScroll;
			this.targetTop = this.startScroll;
			this.ticking = false;
			
			this.easing = Math.max(0.05, Math.min(this.options.easing ?? 0.1, 1));
			this.#init();
		}

		#asideScroll() {
			if(this.styles.position !== 'sticky') return;
			
			if (this.aside.offsetHeight <= this.availableHeightTop) {
				this.targetTop = this.startScroll;
				this.#startAnimation();
				return;
			}
			
			const endScroll = this.availableHeightBottom - this.aside.offsetHeight
			
			if (this.aside.offsetHeight > this.availableHeightTop) { // если не влезает в экран
				if (window.scrollY < this.currPos) { // скроллим вверх
					if (this.targetTop < this.startScroll) { 
						this.targetTop += this.currPos - window.scrollY; // задаем позицию к которой будем стремиться
					} else {
						this.targetTop = this.startScroll; // останавливаем у крайнего значения
					}
				} else {
					if (this.targetTop > endScroll) { // скроллим вниз
						this.targetTop += this.currPos - window.scrollY;
					} else {
						this.targetTop = endScroll;
					}
				}
			}

			this.currPos = window.scrollY;
			this.#startAnimation();
		}

		#startAnimation() {
			if (this.ticking) return;
			this.ticking = true;
			requestAnimationFrame(this.#animatePosition.bind(this));
		}

		#animatePosition() {
			const diff = this.targetTop - this.currentTop;

			if (Math.abs(diff) < 1) { // догнали заданную скроллом позицию
				this.currentTop = this.targetTop;
				this.aside.style.top = `${this.currentTop}px`;
				this.ticking = false;
				return;
			}

			this.currentTop += diff * this.easing; // догоняем заданную скроллом позицию
			this.aside.style.top = `${this.currentTop}px`;

			requestAnimationFrame(this.#animatePosition.bind(this));
		}
		
		#throttle(fn) {
			let timeout = null;
		
			return (...args) => {
				if (timeout === null) {
					
					timeout = setTimeout(() => {
						fn.apply(this, args);
						timeout = null;
					}, options.resizeSensitivity)
				}
			}
		}

		#init() {
			window.addEventListener('scroll', this.#asideScroll.bind(this), { capture: true, passive: true });
			window.addEventListener('resize', this.#throttle(() => {
				const { top } = this.aside.style;

				this.aside.removeAttribute('style');
				this.styles = window.getComputedStyle(this.aside);
				this.startScroll = parseInt(this.styles.top, 10);
				this.availableHeightTop = window.innerHeight - this.startScroll;
				this.availableHeightBottom = window.innerHeight - parseInt(this.styles.bottom, 10);
				this.currentTop = this.targetTop = parseFloat(top);
				this.aside.style.top = top;
				this.#asideScroll();
			}));

			this.#asideScroll();
		}
	}

	if(items instanceof NodeList) {
		items.forEach((item) => new Sidebar(item, options));
	} else {
		return new Sidebar(items, options);
	}
}