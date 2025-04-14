/* 
* Простое модальное окно. Слушает элементы имеющие data-атрибут с именем 
* укзанным в параметре class при вызове (по умолчанию 'modal'). Выборка элементов 
* для прослушиваения, может уточняться параметром select при вызове. 
* 
* <a href="./" data-modal>some content..</a>:
* если нет значения - берет свое содержимое (some content..)
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
import { makeModal } from "../../js/libs/modal";
import { slideshow } from "../../js/libs/modal.slideshow";
import { playbutton } from "../../js/libs/modal.playbutton";
import scrollLock from 'scroll-lock';
import Inputmask from "inputmask";

makeModal({ 
	select: '.somebutton', 
	class: 'modal', 
	modules: [ slideshow, playbutton ],
	slideshow: {
		classMod: 'gallery',
		classActive: 'active'
	},
	init(underlay) {
		underlay.setAttribute('data-scroll-lock-scrollable', '');
	},
	open(modal, button) {
		scrollLock.disablePageScroll();
		
		Inputmask({ 
			"mask": "+7 (999) 999-99-99", 
			showMaskOnHover: false 
		}).mask(this.querySelectorAll('input[type="tel"]'));

		if (modal.slideshow) {
			this.addEventListener('click', (e) => modalFrame.move());
		}
	},
	close() {
		scrollLock.enablePageScroll();
	},
	move(modal) {
		// работает только если подключен slideshow
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

export const makeModal = function(props = {}) {
	class Modal {
		constructor(props) {
			this.props = {
				modules: [],
				class: 'modal',
				preserve: false,
				...props
			};

			this.select = this.props.select ?? `[data-${this.props.class}]`;
			this.modal = document.querySelector(`#${this.props.class}__underlay`);
			this.body = document.querySelector(`.${this.props.class}__body`);
			this.content = document.querySelector(`.${this.props.class}__content`);
			this._hooks = { open: [], close: [] };
			this.detached = null;

			this.#init();
		}


		close(cb = this.props.close) {
			this.modal.className = `${this.props.class}`;
			this.modal.style.display = "none";
			
			this.content.className = `${this.props.class}__content`;
			this.content.innerHTML = '';

			if (this.props.preserve && this.detached) {
				const { node, parent, next } = this.detached;

				if (next && next.parentNode === parent) {
					parent.insertBefore(node, next);
				} else {
					parent.appendChild(node);
				}
				this.detached = null;
			}

			// вызов хука close у плагинов
			this._hooks.close.forEach(close => close());
			(typeof cb === 'function') && cb.call(this.content, this);

			return false;
		}


		open(source, cb = this.props.open) {
			const isData = source.hasAttribute(`data-${this.props.class}`);
			const data = source.dataset[this.props.class];
			let content = null;
			let mod = 'self';
			
			if (source instanceof HTMLElement && !isData) {
				// Прямо переданный целевой блок
				content = source;
				mod = 'custom';
				
				if (this.props.preserve) {
					this.detached = { 
						node: content, 
						parent: content.parentNode, 
						next: content.nextSibling 
					};
				}
				
			} else {
				// Обычный режим — кнопка с data-modal
				if (isData && !data) {
					content = source.innerHTML;

				} else if (data.startsWith('#')) {
					const node = document.querySelector(data);
					mod = data.slice(1);
		
					if (this.props.preserve && node) {
						this.detached = { node, parent: node.parentNode, next: node.nextSibling };
						content = node;

					} else {
						content = node?.innerHTML;
					}

				} else {
					content = document.createElement('img');
					content.src = data;
				}
			}
		
			this.modal.className = this.props.class;
			this.modal.classList.add(`${this.props.class}_${mod}`);
			this.modal.style.display = "block";
		
			this.content.innerHTML = '';
			this.content.className = `${this.props.class}__content`;
			this.content['insertAdjacent' + (typeof content === 'string' ? 'HTML' : 'Element')]('beforeend', content ?? '');
		
			// вызов хука open у плагинов
			this._hooks.open.forEach(open => open(source));
			if (typeof cb === 'function') cb.call(this.content, this, source);
		
			return true;
		}
		

		#underlay() {
			if (! this.modal) {
				const underlay = document.createElement('div');
				const body = document.createElement('div');
				const close = document.createElement('span');
				const content = document.createElement('div');
				
				underlay.className = `${this.props.class}`;
				underlay.id = `${this.props.class}__underlay`;
	
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


		#init() {
			this.#underlay();

			// инициализация плагинов и их хуков
			this.props.modules.forEach(plugin => {
				if (plugin && typeof plugin === 'object') {
					plugin.init?.(this, this.props[plugin.name]);
					
					Object.keys(this._hooks).forEach(hook => {
						if (typeof plugin[hook] === 'function') {
							this._hooks[hook].push(plugin[hook].bind(plugin, this));
						}
					});
				}
			});

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
			});
			
			(typeof this.props.init === 'function') && this.props.init.call(this, this.modal);
		}
	}

	return new Modal(props);
}