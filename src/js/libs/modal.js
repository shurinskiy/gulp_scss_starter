/* 
* Простое модальное окно. Слушает элементы имеющие data-атрибут с именем 
* укзанным в параметре cls при вызове (по умолчанию 'modal'). Выборка элементов 
* для прослушиваения, может уточняться параметром select при вызове. При клике по 
* такому элементу либо находит блок, по id указанному в значении data-атрибута,
* либо, если в значении data-атрибута указана # (удобно для увеличения изображения, 
* например), берет внутренний html этого элемента и выводит в модальном окне. 
* Если элемент содержит атрибут rel, скрипт ожидает, что внутри будет изображение, 
* ищет другие изображения, обернутые в элемент содержащий атрибут rel с таким же 
* значением, и создает внутри текущего окна, из этих изображений, галерею с навигацией. 
* Может работать с внешними скриптом для блокировки прокрутки документа (scrollLock), 
* если ссылка на него передана в качестве параметра при вызове.
* 
* @элемент для прослушивания:
* <span data-modal="someblock"></span>
* 
* @вызов:
* 
import { makeModalFrame } from "../../js/lib";
makeModalFrame({ class: 'modal' });
* 
* @вызов с использованием внешних решений (передаются через callback функцию):
* 
import { addUnderlay, makeModalFrame } from "../../js/lib";
import scrollLock from 'scroll-lock';
import Inputmask from "inputmask";
addUnderlay('modal');
makeModalFrame({ 
	select: '.some-el', 
	class: 'modal', 
	scrollLock,
	open: function(modal) {
		Inputmask({ 
			"mask": "+7 (999) 999-99-99", 
			showMaskOnHover: false 
		}).mask(this.querySelectorAll('input[type="tel"]'));
	},
	close: function() {
		// some code on close modal
	}
});
* 
* @структура html для создания галлереи:
* 
<div data-modal="#" rel="gallery">
	<img src="./images/someimage-1.png" alt="" />
</div>
<div data-modal="#" rel="gallery">
	<img src="./images/someimage-2.png" alt="" />
</div>
<div data-modal="#" rel="gallery">
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
			this.scrollLock = (typeof this.props.scrollLock !== 'undefined') && this.props.scrollLock;
			this.slideshow = false;
		
			this._init();
		}

		close() {
			if(this.scrollLock) {
				this.scrollLock.clearQueueScrollLocks();
				this.scrollLock.enablePageScroll();
			}
			
			this.modal.className = `${this.props.class}`;
			this.modal.style.display = "none";
			
			this.content.className = `${this.props.class}__content`;
			this.content.innerHTML = '';
			this.navi?.remove();
			delete this.cnt, this.items;

			if (typeof this.props.close === 'function') 
				return this.props.close.call(this.content);
		}

		open(el) {
			const data = el.dataset[`${this.props.class}`];
			let content;

			if (!data) {
				content = el.innerHTML;
			} else if (data.includes('#')) {
				content = document.querySelector(data)?.innerHTML;
			} else {
				content = document.createElement('img');
				content.src = data;
			}

			this.modal.className = `${this.props.class}`;
			this.modal.classList.add(data.includes('#') ? `${this.props.class}_${data.replace('#', '')}`:`${this.props.class}_self`);
			this.modal.style.display = "block";
			
			this.content.innerHTML = '';
			this.content.className = `${this.props.class}__content`;
			this.content['insertAdjacent' + ((typeof content == 'string') ? 'HTML' : 'Element')]('beforeend', content ?? '');
			
			if (! data.includes('#'))
				this._slideshow(el.attributes.rel?.value);

			if (this.scrollLock)
				this.scrollLock.disablePageScroll();

			if (typeof this.props.open === 'function') 
				return this.props.open.call(this.content, this, el);
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