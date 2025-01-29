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
import { driveMenu } from "../../js/libs/driveMenu";
const menu = document.querySelector('.menu');
const toggles = document.querySelectorAll('.menu__toggle, .menu__close');
driveMenu(menu, toggles,  {
	scrollLock,
	class: 'opened',
	globalClose: true,
	omitToClose: '.modal, .form',
	open: function() {
		const maxw = parseInt(getComputedStyle(this).maxWidth);
		const scrollw = scrollLock.getPageScrollBarWidth();

		Object.assign(this.style, { maxWidth: maxw + scrollw + 'px' });
		scrollLock.disablePageScroll();
	},
	close: function() {
		scrollLock.clearQueueScrollLocks();
		scrollLock.enablePageScroll();
	}
});
* 
*/

export const driveMenu = (menu, toggles, options = {}) => {
	class Menu {
		constructor(menu, toggles, options) {
			if(!menu || !menu instanceof Element || !toggles) return;

			this.options = {
				class: false,
				globalClose: true,
				...options
			};

			this._init();
			this.opened = false;
		}

		menuOpen(e, cb = this.options.open) {
			if(e) {
				e.preventDefault();
				e.stopPropagation();
			}

			this.options.class && menu.classList.add(`${this.options.class}`);
			this.opened = true;

			if (typeof cb === 'function') cb.call(menu, e?.currentTarget);
			return true;
		}
		

		menuClose(e, cb = this.options.close) {
			if (e) e.stopPropagation();

			this.options.class && menu.classList.remove(`${this.options.class}`);
			this.opened = false;
			
			if (typeof cb === 'function') cb.call(menu, e?.currentTarget);
			return false;
		}
	
		menuToggle(e) {
			this.opened ? this.menuClose(e) : this.menuOpen(e);
		}


		_omitToClose(e) {
			const omits = this.options.omitToClose?.split(",").map((item) => item.trim());
			return omits?.some(omit => !!e.target.closest(`${omit}`));
		}

		
		_init() {
			toggles.forEach(toggle => {
				toggle.addEventListener('click', (e) => this.menuToggle(e));
			});

			if(this.options.globalClose) {
				['click','touchstart'].forEach(event => {
					document.addEventListener(event, (e) => {
						const isself = e.target.closest(`.${menu.className.split(' ')[0]}`);

						if(this.opened && !isself && !this._omitToClose(e)) {
							e.preventDefault();
							this.menuClose(e);
						}
					}, { passive: false });
				});
			}
		}
	}

	return new Menu(menu, toggles, options);
}