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
import { makeModal, slideshow, playbutton, thumbnails } from "../../js/libs/makeModal";
import { disablePageScroll, enablePageScroll } from '@fluejs/noscroll';
import Inputmask from "inputmask";

makeModal({ 
	class: 'modal', 
	preserve: true,
	classActive: 'active'
	select: '.somebutton', 
	modules: [ slideshow, playbutton, thumbnails ],
	slideshow: {
		navigation: false
	},
	init(underlay) {

	},
	open(modal, button) {
		disablePageScroll();
		
		Inputmask({ 
			"mask": "+7 (999) 999-99-99", 
			showMaskOnHover: false 
		}).mask(this.querySelectorAll('input[type="tel"]'));

		if (modal.slideshow) {
			this.addEventListener('click', (e) => modalFrame.move());
		}
	},
	close() {
		enablePageScroll();
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
				classActive: 'active',
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
			cb?.call(this.content, this);

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
			cb?.call(this.content, this, source);
		
			return true;
		}

		#underlay() {
			if (! this.modal) {
				const underlay = document.createElement('div');
				const body = document.createElement('div');
				const close = document.createElement('button');
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
			
			this.props.init?.call(this, this.modal);
		}
	}

	return new Modal(props);
};

// плагин галлереи
export const slideshow = {
	name: 'slideshow',

	init(modal, props = {}) {
		this.props = {
			classMod: 'gallery',
			navigation: true,
			...props
		};

		this.setupSlideshow = function(el) {
			const rel = el.attributes.rel?.value;
			if (!rel) return;

			let counter = 0;
			const current = modal.content.querySelector('img, video');

			[...document.querySelectorAll(`[rel="${rel}"]`)].forEach(item => {
				const data = item.dataset[modal.props.class];
				const source = item.querySelector('img, video');
				let child;

				if (!data) {
					child = source.cloneNode();
				} else {
					child = document.createElement('img');
					child.src = data;
				}

				if (child.src !== current.src) {
					Object.assign(child.dataset, source.dataset);
					modal.content.appendChild(child);
					counter++;
				} else {
					Object.assign(current.dataset, source.dataset);
				}
			});

			modal.content.classList.add(`${modal.props.class}__content_${this.props.classMod}`);
			current.classList.add(`${modal.props.classActive}`);
			
			if (counter > 1) {
				modal.slideshow = modal.content.querySelectorAll('img, video');
				modal.cnt = 0;

				if (this.props.navigation) {
					const navi = document.createElement('div');
					const prev = document.createElement('button');
					const next = document.createElement('button');
	
					navi.className = `${modal.props.class}__slideshow-navi`;
					prev.className = `${modal.props.class}__slideshow-prev`;
					next.className = `${modal.props.class}__slideshow-next`;
	
					navi.append(prev);
					navi.append(next);
					modal.body.append(navi);
					this.navi = navi;
	
					prev.addEventListener('click', () => this.slideshowMove(-1));
					next.addEventListener('click', () => this.slideshowMove());
				}
			}
		};

		this.slideshowMove = function(value = 1, isIndex = false) {
			const slides = modal.slideshow;
		
			slides[modal.cnt].classList.remove(modal.props.classActive);
			modal.cnt = isIndex
				? (value + slides.length) % slides.length
				: (modal.cnt + value + slides.length) % slides.length;
			slides[modal.cnt].classList.add(modal.props.classActive);
		
			modal._hooks.move.forEach(move => move());
			modal.props.move?.call(modal.content, modal);
		};
				

		// Добавить новый хук в базовый класс
		modal._hooks.move ||= [];
		
		// Добавить новый метод в базовый класс
		modal.move = this.slideshowMove.bind(this);
	},
	
	open(modal, el) {
		const data = el.dataset[`${modal.props.class}`];
		(!!data && data.startsWith('#')) || this.setupSlideshow(el);
	},
	
	close(modal) {
		delete modal.cnt;
		delete modal.slideshow;
		delete modal.slideshow;
		
		this.navi?.remove();
	}
};

// плагин кнопки для воспроизведения видео
export const playbutton = {
	name: 'playbutton',

	init(modal) {
		this.setPlayButton = (content, video) => {
			let play = content.querySelector('.modal__play');
	
			if (!! video?.canPlayType) {
				video.controls = true;
				play ||= document.createElement('button');
				play.className = 'modal__play';
				play.addEventListener('click', (e) => video.play());
				content.append(play);
	
				['pause', 'ended', 'playing'].forEach((event) => {
					video.addEventListener(event, (e) => {
						play.classList.toggle('playing', !(video.paused || video.ended));
					});
				});
			} else {
				content.querySelectorAll('video').forEach((video) => video.pause());
				play?.remove();
			}
		}
	},
	
	open(modal, el) {
		const { content, slideshow, props } = modal;
		const active = slideshow ? `.${props.classActive}` : '';
		
		this.setPlayButton(content, content.querySelector(`video${active}`));
	},
	
	move(modal) {
		const { content, props } = modal;
		const active = `.${props.classActive}`;
		
		this.setPlayButton(content, content.querySelector(`video${active}`));
	}
};

// плагин миниатюр для навигации в галерее
export const thumbnails = {
	name: 'thumbnails',

	init(modal, props = {}) {
		this.props = {
			count: 4, // сколько миниатюр видно одновременно
			maxSkip: 3,
			duration: 0.3,
			dragThreshold: 5,
			...props
		};

		this.isDragging = false;
		this.modal = modal;
		this.index = 0;

		this._boundOnMove = this.onDrag.bind(this);
		this._boundOnUp = this.onUp.bind(this);
	},

	get slideSize() {
		return this.slideWidth + this.gap;
	},

	get offset() {
		// на сколько нужно сдвинуть wrapper, чтобы отображалось count слайдов, начиная с нужного индекса
		return this.index * this.slideSize;
	},

	get maxIndex() {
		// максимально возможный индекс до которого можно прокрутить, чтобы во viewbox было ровно count слайдов
		return Math.max(0, this.slides.length - this.props.count);
	},

	open(modal) {
		if (!modal.slideshow) return;

		// Создаем обертку для миниатюр
		this.container = document.createElement('div');
		this.container.className = `${modal.props.class}__thumbs`;

		this.viewbox = document.createElement('div');
		this.viewbox.className = `${modal.props.class}__thumbs-viewbox`;

		this.wrapper = document.createElement('div');
		this.wrapper.className = `${modal.props.class}__thumbs-wrapper`;

		// Кнопки навигации
		this.btnPrev = document.createElement('button');
		this.btnPrev.className = `${modal.props.class}__thumbs-button ${modal.props.class}__thumbs-button_prev`;

		this.btnNext = document.createElement('button');
		this.btnNext.className = `${modal.props.class}__thumbs-button ${modal.props.class}__thumbs-button_next`;

		// Добавляем миниатюры
		this.slides = Array.from(modal.slideshow, (item, i) => {
			const slide = document.createElement('span');

			slide.className = `${modal.props.class}__thumbs-slide`;
			slide.style.backgroundImage = `url('${item.poster || item.src}')`;
			slide.addEventListener('click', () => this.isDragging || this.modal.move(i, true));
			this.wrapper.appendChild(slide);

			return slide;
		});
		
		// Строим структуру
		this.viewbox.appendChild(this.wrapper);
		this.container.appendChild(this.btnPrev);
		this.container.appendChild(this.viewbox);
		this.container.appendChild(this.btnNext);
		modal.body.appendChild(this.container);

		this.setupThumbSizes();
		this.bindEvents();
		this.updateActiveThumb();

		// Подписка на переключение слайдов
		modal._hooks.move.push(this.updateActiveThumb.bind(this));
	},

	setupThumbSizes() {
		const styles = getComputedStyle(this.wrapper);

		this.gap = parseFloat(styles.gap) || 0;
		this.slideWidth = (this.viewbox.clientWidth - this.gap * (this.props.count - 1)) / this.props.count;

		this.slides.forEach(slide => slide.style.flex = `0 0 ${this.slideWidth}px`);
		this.movingThumbs(this.index);
	},

	onDrag(e) {
		const dx = e.clientX - this.startX;
		const total = this.slideSize * this.slides.length - this.gap;
		const limit = total - this.viewbox.clientWidth + this.slideSize;
	
		const offset = Math.max(-limit, Math.min(this.startOffset + dx, this.slideSize));
	
		this.wrapper.style.transform = `translateX(${offset}px)`;
		this.isDragging ||= Math.abs(dx) > this.props.dragThreshold;
	},

	onUp(e) {
		// длина свайпа
		const dx = e.clientX - this.startX;

		window.removeEventListener('pointerup', this._boundOnUp);
		window.removeEventListener('pointermove', this._boundOnMove);
		window.removeEventListener('pointercancel', this._boundOnUp);

		// сколько слайдов сдвинуть на основе длины свайпа, но не больше, чем разрешено (maxSkip)
		const movedSlides = Math.min(this.props.maxSkip, Math.round(Math.abs(dx) / this.slideSize));

		// смещение к актуальному индексу
		movedSlides > 0
			? this.movingThumbs(this.index - Math.sign(dx) * movedSlides)
			: this.movingThumbs(this.index);
	},

	bindEvents() {
		// Drag/swipe поддержка
		this.wrapper.addEventListener('pointerdown', (e) => {
			e.preventDefault();
	
			this.wrapper.style.transition = 'none';
			this.isDragging = false;

			this.startX = e.clientX;
			this.startOffset = -this.index * (this.slideWidth + this.gap);

			window.addEventListener('pointerup', this._boundOnUp);
			window.addEventListener('pointermove', this._boundOnMove);
			window.addEventListener('pointercancel', this._boundOnUp);
		}, { passive: false });
	
		this.wrapper.querySelectorAll('*').forEach(el => {
			el.addEventListener('click', (e) => this.isDragging && e.preventDefault());
		});

		// кнопка вперед
		this.btnNext?.addEventListener('click', () => {
			// this.index < this.maxIndex && this.movingThumbs(this.index + 1);
			(this.modal.cnt < this.slides.length - 1) && this.modal.move(this.modal.cnt + 1, true);
		});
		
		// кнопка назад
		this.btnPrev?.addEventListener('click', () => {
			// this.index > 0 && this.movingThumbs(this.index - 1);
			this.modal.cnt > 0 && this.modal.move(this.modal.cnt - 1, true)
		});

		window.addEventListener('resize', () => this.setupThumbSizes());
	},

	movingThumbs(i) {
		this.index = Math.max(0, Math.min(i, this.maxIndex));
	  
		this.wrapper.style.transition = `transform ${this.props.duration}s`;
		this.wrapper.style.transform = `translateX(-${this.offset}px)`;
	},

	updateActiveThumb() {
		if (!this.slides?.length) return;
		this.slides.forEach(slide => slide.classList.remove('active'));
		this.slides[this.modal.cnt].classList.add('active');
		
		this.btnPrev.disabled = this.modal.cnt === 0;
		this.btnNext.disabled = this.modal.cnt === this.slides.length - 1;

		this.scrollToActiveThumb();
	},

	scrollToActiveThumb() {
		// Если активный слайд вышел за пределы видимости — подстраиваем индекс
		if (this.modal.cnt < this.index) {
			this.movingThumbs(this.modal.cnt);
		} else if (this.modal.cnt >= this.index + this.props.count) {
			this.movingThumbs(this.modal.cnt - this.props.count + 1);
		}
	},

	close(modal) {
		this.container?.remove();
	}
};
