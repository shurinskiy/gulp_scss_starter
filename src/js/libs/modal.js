/* 
* Простое модальное окно. Слушает элементы имеющие data-атрибут с именем 
* укзанным в параметре cls при вызове (по умолчанию 'modal'). Выборка элементов 
* для прослушиваения, может уточняться параметром select при вызове. 
* 
* <a href="./" data-modal>some content..</a>:
* если нет значения - берет содержимое (some content..)
* 
* <a href="./" data-modal="#someblock"></a>:
* если начинается с "#", то находит элемент с id="someblock"
* 
* <a href="./" data-modal="./images/somepicture.png"></a>:
* если значение есть, но НЕ начинается с "#" - создает элемент img, в src указывает значение data-modal
* 
* <a href="./" data-modal="./images/somepicture.png" rel="gallery"></a>: 
* если значение есть, но НЕ начинается с "#", а так же имеет не пустой атрибут "rel" - создает элемент img, 
* в src указывает значение data-modal и создает галерею, из всех найденных, с таким же "rel"
* 
* <a href="./" data-modal rel="gallery"><img src="./images/somepicture.png" alt="" /></a>:
* если нет занчения, но есть не пустой атрибут "rel" - не создает img, а использует содержимое, как элемент галереи
* 
* 
* @элемент для прослушивания:
* <span class="somebutton" data-modal="someblock"></span>
* 
* @вызов:
* 
import { addUnderlay, makeModalFrame } from "../../js/lib";
import scrollLock from 'scroll-lock';
import Inputmask from "inputmask";

makeModalFrame({ 
	select: '.somebutton', 
	class: 'modal', 
	open: function(modal) {
		scrollLock.disablePageScroll();
		Inputmask({ 
			"mask": "+7 (999) 999-99-99", 
			showMaskOnHover: false 
		}).mask(this.querySelectorAll('input[type="tel"]'));
	},
	close: function() {
		scrollLock.enablePageScroll();
	}
});
* 
* @типичная структура html для создания галлереи:
* 
<div data-modal="./images/someimage-big-1.png" rel="gallery">
	<img src="./images/someimage-1.png" alt="" />
</div>
<div data-modal="./images/someimage-big-2.png" rel="gallery">
	<img src="./images/someimage-2.png" alt="" />
</div>
<div data-modal="./images/someimage-big-3.png" rel="gallery">
	<img src="./images/someimage-3.png" alt="" />
</div>
*/

export const makeModalFrame = function(props = {}) {
	class Modal {
		constructor(props) {
			this.props = {
				class: 'modal',
				slideshowClassMod: 'slideshow',
				slideshowClassActive: 'active',
				...props
			};

			this.select = this.props.select ?? `[data-${this.props.class}]`;
			this.modal = document.querySelector(`#${this.props.class}__underlay`);
			this.body = document.querySelector(`.${this.props.class}__body`);
			this.content = document.querySelector(`.${this.props.class}__content`);
			this.navi = document.querySelector(`.${this.props.class}__navi`);
			this.slideshow = false;
		
			this._init();
		}

		close(e, cb = this.props.close) {
			this.modal.className = `${this.props.class}`;
			this.modal.style.display = "none";
			
			this.content.className = `${this.props.class}__content`;
			this.content.innerHTML = '';
			this.navi?.remove();
			delete this.cnt, this.items;

			if (typeof cb === 'function') cb.call(this.content, this);
			return false;
		}

		open(el, cb = this.props.open) {
			const data = el.dataset[`${this.props.class}`];
			let content;

			if (!data) {
				content = el.innerHTML;
			} else if (data.startsWith('#')) {
				content = document.querySelector(data)?.innerHTML;
			} else {
				content = document.createElement('img');
				content.src = data;
			}

			this.modal.className = `${this.props.class}`;
			this.modal.classList.add(data.startsWith('#') ? `${this.props.class}_${data.replace('#', '')}`:`${this.props.class}_self`);
			this.modal.style.display = "block";
			
			this.content.innerHTML = '';
			this.content.className = `${this.props.class}__content`;
			this.content['insertAdjacent' + ((typeof content == 'string') ? 'HTML' : 'Element')]('beforeend', content ?? '');
			
			if (! data.startsWith('#'))
				this._slideshow(el.attributes.rel?.value);

			if (typeof cb === 'function') cb.call(this.content, this, el);
			return true;
		}
						
		move(direction = 1) {
			this.items[this.cnt].classList.remove(`${this.props.slideshowClassActive}`);
			this.cnt += direction;
			
			if (this.cnt < 0) { this.cnt = this.items.length - 1; }
			else if (this.cnt >= this.items.length) { this.cnt = 0; }
			
			this.items[this.cnt].classList.add(`${this.props.slideshowClassActive}`);

			if (typeof this.props.move === 'function') 
				return this.props.move.call(this.content, this);
		}

		_slideshow(rel) {
			if (! rel) return;
			
			let counter = 0;
			const current = this.content.querySelector('img, video');
			
			[...document.querySelectorAll(`[rel="${rel}"]`)].map(item => {
				const data = item.dataset[`${this.props.class}`];
				let child;

				if (!data) {
					child = item.querySelector('img, video').cloneNode();
				} else {
					child = document.createElement('img');
					child.src = data;
				}
				
				if (child.src !== current.src) {
					this.content.appendChild(child);
					counter++;
				}
			});

			this.content.classList.add(`${this.props.class}__content_${this.props.slideshowClassMod}`);
			current.classList.add(`${this.props.slideshowClassActive}`);

			if (counter > 1) {
				const navi = document.createElement('div');
				const prev = document.createElement('button');
				const next = document.createElement('button');
				this.items = this.content.querySelectorAll('img, video');
				this.cnt = 0;
	
				navi.className = `${this.props.class}__navi`;
				prev.className = `${this.props.class}__prev`;
				next.className = `${this.props.class}__next`;
	
				navi.append(prev);
				navi.append(next);
				this.body.append(navi);
				this.navi = navi;
	
				prev.addEventListener('click', () => this.move(-1));
				next.addEventListener('click', () => this.move());
	
				this.items.forEach(item => {
					item.addEventListener('click', () => { 
						if (item.tagName.toUpperCase() !== 'VIDEO')
							this.move(); 
					});
				});

				this.slideshow = true;
			}
		}

		_underlay() {
			if (! document.querySelector(`#${this.props.class}__underlay`)) {
				const underlay = document.createElement('div');
				const body = document.createElement('div');
				const close = document.createElement('span');
				const content = document.createElement('div');
				
				underlay.className = `${this.props.class}`;
				underlay.id = `${this.props.class}__underlay`;

				if(this.scrollLock)
					underlay.setAttribute('data-scroll-lock-scrollable', '');
	
				body.className = `${this.props.class}__body`;
				close.className = `${this.props.class}__close`;
				content.className = `${this.props.class}__content`;
		
				body.append(close);
				body.append(content);
				underlay.append(body);
				document.body.append(underlay);
	
				this.modal = underlay;
				this.body = body;
				this.content = content;
			}
		}

		_init() {
			this._underlay();

			document.addEventListener('click', (e) => {
				let el = e.target.closest(this.select);
				
				if (el && el.hasAttribute(`data-${this.props.class}`)) {
					e.preventDefault();
					this.open(el);
				}

				if (e.target == this.modal || e.target.classList.contains(`${this.props.class}__close`)) {
					e.preventDefault();
					this.close();
				}
			});
			
			document.addEventListener('keydown', (e) => {
				if (this.modal.style.display === 'block' && (e.key === "Escape" || e.key === "Esc"))
					this.close();
			})
		}
	}

	return new Modal(props);
}