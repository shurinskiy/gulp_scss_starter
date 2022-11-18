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
import scrollLock from 'scroll-lock';
import { menuToggle } from "../../js/lib";
const menu = document.querySelector('.menu');
const toggles = document.querySelectorAll('.menu__toggle, .menu__close');
menuToggle(menu, toggles,  {
	scrollLock: scrollLock,
	cls: 'opened'
});
* 
*/

export const menuToggle = (menu, toggles, options = {}) => {
	if(!toggles || !menu) return;
	
	const { scrollLock } = options;
	const cls = options.cls || 'opened';
	
	const menuOpen = (e) => {
		e.preventDefault();
		e.stopPropagation();
		menu.classList.add('opened');

		if(typeof scrollLock !== 'undefined') {
			Object.assign(menu.style, { maxWidth: parseInt(getComputedStyle(menu).maxWidth) + scrollLock.getPageScrollBarWidth() + 'px' });
			scrollLock.disablePageScroll();
		}
	}
	
	const menuClose = (e) => {
		e.stopPropagation();
		menu.classList.remove(`${cls}`);
		menu.removeAttribute('style');
		
		if(typeof scrollLock !== 'undefined') {
			scrollLock.clearQueueScrollLocks();
			scrollLock.enablePageScroll();
		}
	}

	['click','touchstart'].forEach(event => {
		toggles.forEach(toggle => {
			toggle.addEventListener(event, function(e) {
				menu.classList.contains(`${cls}`) ? menuClose(e) : menuOpen(e);
			});
		});
		
		document.addEventListener(event, (e) => {
			if(menu.classList.contains(`${cls}`) && !e.target.closest(`.${menu.className.split(' ')[0]}`)) {
				e.preventDefault();
				menuClose(e);
			}
		});
	});
}