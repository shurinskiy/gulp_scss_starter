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
	scrollLock,
	cls: 'opened',
	open: function() {
		console.log(this)
	},
	close: function() {
		...
	}
});
* 
*/

export const menuToggle = (menu, toggles, props = {}) => {
	if(!toggles || !menu) return;
	
	const { scrollLock } = props;
	const cls = props.cls || 'opened';
	
	const menuOpen = (e) => {
		e.preventDefault();
		e.stopPropagation();
		menu.classList.add('opened');

		if(typeof scrollLock !== 'undefined') {
			Object.assign(menu.style, { maxWidth: parseInt(getComputedStyle(menu).maxWidth) + scrollLock.getPageScrollBarWidth() + 'px' });
			scrollLock.disablePageScroll();
		}

		if (typeof props.open === 'function') 
			return props.open.call(menu);
	}
	
	const menuClose = (e) => {
		e.stopPropagation();
		menu.classList.remove(`${cls}`);
		menu.removeAttribute('style');
		
		if(typeof scrollLock !== 'undefined') {
			scrollLock.clearQueueScrollLocks();
			scrollLock.enablePageScroll();
		}

		if (typeof props.close === 'function') 
			return props.close.call(menu);
	}

	toggles.forEach(toggle => {
		toggle.addEventListener('click', function(e) {
			menu.classList.contains(`${cls}`) ? menuClose(e) : menuOpen(e);
		});
	});

	['click','touchend'].forEach(event => {
		document.addEventListener(event, (e) => {
			if(menu.classList.contains(`${cls}`) && !e.target.closest(`.${menu.className.split(' ')[0]}`)) {
				e.preventDefault();
				menuClose(e);
			}
		}, true);
	});
}