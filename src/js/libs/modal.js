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
			this.body = document.querySelector(`.${this.props.class}__content`);
			this.scrollLock = (typeof this.props.scrollLock !== 'undefined') && this.props.scrollLock;
		
			this._init();
		}

		close() {
			if(this.scrollLock) {
				this.scrollLock.clearQueueScrollLocks();
				this.scrollLock.enablePageScroll();
			}
			
			this.modal.className = `${this.props.class}`;
			this.modal.style.display = "none";
			
			this.body.className = `${this.props.class}__content`;
			this.body.innerHTML = '';
			delete this.cnt, this.images;

			if (typeof this.props.close === 'function') 
				return this.props.close.call(this.body);
		}

		open(el) {
			const id = el.dataset[`${this.props.class}`] || 'error';
			const content = (id == '#') ? el.innerHTML : document.querySelector('#' + id)?.innerHTML;
			
			this.modal.className = `${this.props.class}`;
			this.modal.classList.add(id != '#' ? `${this.props.class}_${id}`:`${this.props.class}_self`);
			this.modal.style.display = "block";
			
			this.body.innerHTML = '';
			this.body.className = `${this.props.class}__content`;
			this.body.insertAdjacentHTML('beforeend', content ?? '');
			
			this._slideshow(el.attributes.rel?.value);

			if(this.scrollLock)
				this.scrollLock.disablePageScroll();

			if (typeof this.props.open === 'function') 
				return this.props.open.call(this.body, this);
		}
						
		move(direction = 1) {
			this.images[this.cnt].classList.remove(`${this.props.slideshowClassActive}`);
			this.cnt += direction;
			
			if (this.cnt < 0) { this.cnt = this.images.length - 1; }
			else if (this.cnt >= this.images.length) { this.cnt = 0; }
			
			this.images[this.cnt].classList.add(`${this.props.slideshowClassActive}`);
		}

		_slideshow(rel) {
			if (! rel) return;
			const current = this.body.querySelector('img');
			const images_related = document.querySelectorAll(`[rel="${rel}"] img`);
			const images_cleared = [...images_related].filter(image => !image.isEqualNode(current));

			this.body.classList.add(`${this.props.class}__content_${this.props.slideshowClassMod}`);
			current.classList.add(`${this.props.slideshowClassActive}`);
			images_cleared.map(image => { this.body.appendChild(image.cloneNode()) });

			if (images_cleared) {
				const _prev = document.createElement('button');
				const _next = document.createElement('button');
				this.images = this.body.querySelectorAll('img');
				this.cnt = 0;
	
				_prev.className = `${this.props.class}__prev`;
				_next.className = `${this.props.class}__next`;
	
				this.body.append(_prev);
				this.body.append(_next);
	
				_prev.addEventListener('click', () => this.move(-1));
				_next.addEventListener('click', () => this.move());
	
				this.images.forEach(image => {
					image.addEventListener('click', () => { this.move() });
				});
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
				this.body = content;
			}
		}

		_init() {
			this._underlay();

			document.addEventListener('click', (e) => {
				let el = e.target.closest(this.select);
				
				if (el && el.dataset[`${this.props.class}`]) {
					e.preventDefault();
					this.open(el);
				}

				if (e.target == this.modal || e.target.classList.contains(`${this.props.class}__close`)) {
					e.preventDefault();
					this.close();
				}
			});
		}
	}

	return new Modal(props);
}