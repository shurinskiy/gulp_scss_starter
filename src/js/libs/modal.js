/* 
* Вспомогательная функция создающая подложку для будущего 
* использования с модальным окном и т.п. Подложка добавляется
* в конце тега body текущей странички
*
* @результирующая структура:
*
* <div class="modal" id="modal__underlay" data-scroll-lock-scrollable="">
* 	<div class="modal__body">
* 		<span class="modal__close"></span>
* 		<div class="modal__content"></div>
* 	</div>
* </div>
*
* @вызов:
*
addUnderlay('modal');
*/

export const addUnderlay = (cls = 'modal') => {
	if(! document.querySelector(`#${cls}__underlay`)) {
		const _underlay = document.createElement('div');
		const _body = document.createElement('div');
		const _close = document.createElement('span');
		const _content = document.createElement('div');
		
		_underlay.className = `${cls}`;
		_underlay.id = `${cls}__underlay`;
		_underlay.setAttribute('data-scroll-lock-scrollable', '');
		_body.className = `${cls}__body`;
		_close.className = `${cls}__close`;
		_content.className = `${cls}__content`;

		_body.append(_close);
		_body.append(_content);
		_underlay.append(_body);
		document.body.append(_underlay);
	}
}

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
import { addUnderlay, makeModalFrame } from "../../js/lib";
addUnderlay('modal');
makeModalFrame({ cls: 'modal' });
* 
* @вызов с использованием внешних решений (передаются через callback функцию):
* 
import { addUnderlay, makeModalFrame } from "../../js/lib";
import scrollLock from 'scroll-lock';
import Inputmask from "inputmask";
addUnderlay('modal');
makeModalFrame({ 
	el: '.some-el', 
	cls: 'modal', 
	scrollLock,
	open: function() {
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
	const { scrollLock } = props;
	const cls = props.cls || 'modal';
	const select = props.el || `[data-${cls}]`;

	const modal = document.querySelector(`#${cls}__underlay`);
	const body = modal.querySelector(`.${cls}__content`);
	
	if (modal) {

		const close = function() {
			if(typeof scrollLock !== 'undefined') {
				scrollLock.clearQueueScrollLocks();
				scrollLock.enablePageScroll();
			}
			
			modal.className = `${cls}`;
			modal.style.display = "none";
			
			body.className = `${cls}__content`;
			body.innerHTML = '';

			if (typeof props.close === 'function') 
				return props.close.call(body);
		}
		
		const open = function(el) {
			const id = el.dataset[`${cls}`] || 'error';
			const content = (id == '#') ? el.innerHTML : document.querySelector('#' + id).innerHTML;
			
			modal.className = `${cls}`;
			modal.classList.add(id != '#' ? `${cls}_${id}`:`${cls}_self`);
			modal.style.display = "block";

			body.innerHTML = '';
			body.className = `${cls}__content`;
			body.insertAdjacentHTML('beforeend', content);

			if(typeof scrollLock !== 'undefined')
				scrollLock.disablePageScroll();

			if (typeof props.open === 'function') 
				return props.open.call(body, el);
		}

		if(this) {
			open(this);

		} else {
			document.addEventListener('click', (e) => {
				let el = e.target.closest(select);
				
				if (el && el.dataset[`${cls}`]) {
					e.preventDefault();
					open(el);
				}
			});
		}

		document.addEventListener('click', (e) => {
			if (e.target == modal || e.target.classList.contains(`${cls}__close`)) {
				e.preventDefault();
				close();
			}
		});
	}
}