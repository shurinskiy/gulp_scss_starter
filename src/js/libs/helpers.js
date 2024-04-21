/* ======== Вспомогательные функции ======== */


// Проверка на объект (не массив)
export const isObject = (item) => {
	return (item && typeof item === 'object' && !Array.isArray(item));
}


// Слияние двух объектов с глубокой вложенностью
export const mergeDeep = (target, ...sources) => {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, {
					[key]: {}
				});
				mergeDeep(target[key], source[key]);
			} else {
				Object.assign(target, {
					[key]: source[key]
				});
			}
		}
	}
	return mergeDeep(target, ...sources);
}


// Глубокое клонирование объекта
export const cloneObj = (obj) => {
	let newObj = {}
	
	for (let prop in obj) {
		newObj[prop] = (typeof obj[prop] !== 'object') ? obj[prop] : cloneObj(obj[prop]);
	}
	return newObj;
}


// Отложить вызов функции
export const throttle = (fn, delay = 250) => {
	let timeout = null;

	return (...args) => {
		if (timeout === null) {
			// fn.apply(this, args);
			
			timeout = setTimeout(() => {
				fn.apply(this, args);
				timeout = null;
			}, delay)
		}
	}
}

/* window.addEventListener("resize", throttle(() => {
	console.log('hello');
}, 200)); */



// Полная загрузка документа
export const documentReady = function (cb) {
	if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
		cb();
	} else {
		document.addEventListener('DOMContentLoaded', cb);
	}
}


// Получить ширину прокрутки
export const getScrollSize = function () {
	const outer = document.createElement('div');
	const inner = document.createElement('div');
	outer.style.overflow = 'scroll';
	outer.classList.add('scrollbar');
	document.body.appendChild(outer);
	outer.appendChild(inner);
	
	const scrollbarSize = outer.offsetWidth - inner.offsetWidth;
	document.body.removeChild(outer);
	
	return scrollbarSize;
}


// Получить высоту скрытого элемента
export const getHeight = (el) => {
	if (!el) return;

	const computed = window.getComputedStyle(el);
	let height = (computed.boxSizing === "border-box") ? el.offsetHeight : el.offsetHeight - parseFloat(computed.paddingTop) - parseFloat(computed.paddingBottom) - parseFloat(computed.borderTopWidth) - parseFloat(computed.borderBottomWidth);

	if (computed.height === 'auto' && computed.display === 'none') {
		if (!el?.cloneNode) return null;
		
		const clone = el.cloneNode(true);
		
		Object.assign(clone.style, {
			boxSizing: 'border-box',
			visibility: 'hidden',
			overflow: 'visible',
			maxHeight: 'none',
			display: 'block',
			height: 'auto',
			opacity: '0',
		});
		
		el.after(clone);
		height = clone.offsetHeight;
		clone.remove();
	}

	return height;
}


// Плавно скрыть элемент
export const slideUp = (el, options = {}) => {
	if ((el.style.transitionDuration && el.style.transitionProperty) || window.getComputedStyle(el).display === 'none') return;

	const duration = options.duration || 500;
	const opacity = options.opacity && { opacity: 0 };

	const set = {
		overflow: 'hidden',
		paddingBottom: 0,
		marginBottom: 0,
		paddingTop: 0,
		marginTop: 0,
		height: 0,
		...opacity
	}
	
	const transition = {
		transitionProperty: 'height, margin, padding, opacity',
		transitionDuration: duration + 'ms',
		height: el.offsetHeight + 'px',
		boxSizing: 'border-box',
		opacity: 1,
	}
		
	Object.assign(el.style, transition);
	el.offsetHeight;
	Object.assign(el.style, set);

	window.setTimeout(() => {
		el.removeAttribute('style');
		el.style.display = 'none';
		
		if (typeof options.callback === 'function') 
			return callback.call(el);
	}, duration);
}


// Плавно показать элемент
export const slideDown = (el, options = {}) => {
	if ((el.style.transitionDuration && el.style.transitionProperty) || window.getComputedStyle(el).display !== 'none') return;

	el.style.display = 'block';
	const duration = options.duration || 500;
	const opacity = options.opacity && { opacity: 0 };

	const set = {
		overflow: 'hidden',
		paddingBottom: 0,
		marginBottom: 0,
		paddingTop: 0,
		marginTop: 0,
		height: 0,
		...opacity
	}
	
	const transition = {
		transitionProperty: 'height, margin, padding, opacity',
		transitionDuration: duration + 'ms',
		height: el.offsetHeight + 'px',
		boxSizing: 'border-box',
		opacity: 1,
	}

	Object.assign(el.style, set);
	el.offsetHeight;
	Object.assign(el.style, transition);

	el.style.removeProperty('padding-top');
	el.style.removeProperty('padding-bottom');
	el.style.removeProperty('margin-top');
	el.style.removeProperty('margin-bottom');

	window.setTimeout(() => {
		el.style.removeProperty('box-sizing');
		el.style.removeProperty('height');
		el.style.removeProperty('opacity');
		el.style.removeProperty('overflow');
		el.style.removeProperty('transition-duration');
		el.style.removeProperty('transition-property');

		if (typeof options.callback === 'function') 
			return callback.call(el);
	}, duration);
}


// Плавно переключить отображение элемента
export const slideToggle = (el, options) => {
	if (window.getComputedStyle(el).display === 'none') {
		slideDown(el, options);
		return true;
	} else {
		slideUp(el, options);
		return false;
	}
}


/* 
* Плавная прокрутка к заданному элементу 
* @вызов:
* 
import { scrollToId } from "../../js/libs/helpers.js";
scrollToId(document.querySelectorAll('a[href^="#"]'));
* 
*/

export const scrollToId = (items) => {
	items.forEach(item => {
		item.addEventListener('click', (e) => {
			e.preventDefault();
			document.getElementById(item.getAttribute('href').substring(1)).scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		});
	});		
}

/* 
* Плавная прокрутка к верху страницы
* @вызов:
* 
import { scrollToTop } from "../../js/libs/helpers.js";
scrollToTop(document.querySelector('a[href^="top"]'));
* 
*/

export const scrollToTop = (item) => {
	if (item) {
		item.addEventListener('click', (e) => {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}
}