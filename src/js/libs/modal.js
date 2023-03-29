/* 
* Простое модальное окно. Слушает элементы имеющие data-атрибут с 
* именем укзанным в параметре cls при вызове. При клике по такому
* элементу либо находит блок, по id указанному в значении data-атрибута,
* либо, если в значении data-атрибута указана #, берет внутренний html этого 
* элемента и выводит в модальном окне. Может работать с внешними 
* скриптами (scrollLock, Inputmask), если они переданы в качестве
* параметров при вызове.
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
*/

export const makeModalFrame = function(props = {}) {
	class Modal {
		constructor(props) {
			this.props = {
				class: 'modal',
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

			if(this.scrollLock)
				this.scrollLock.disablePageScroll();

			if (typeof this.props.open === 'function') 
				return this.props.open.call(this.body, this);
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
			});

			document.addEventListener('click', (e) => {
				if (e.target == this.modal || e.target.classList.contains(`${this.props.class}__close`)) {
					e.preventDefault();
					this.close();
				}
			});
		}
	}

	return new Modal(props);
}