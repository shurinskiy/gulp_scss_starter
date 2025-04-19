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
	if (obj === null || typeof obj !== 'object') return obj;

	const newObj = Array.isArray(obj) ? [] : {};

	for (let prop in obj) {
		obj.hasOwnProperty(prop) && (newObj[prop] = cloneObj(obj[prop]));
	}

	return newObj;
};


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
	let height = el.offsetHeight;

	// Если элемент с "border-box", учитываем паддинги и бордеры
	if (computed.boxSizing !== "border-box") {
		height -= parseFloat(computed.paddingTop) 
			+ parseFloat(computed.borderBottomWidth)
			+ parseFloat(computed.borderTopWidth) 
			+ parseFloat(computed.paddingBottom);
	}

	// Если высота авто и элемент скрыт, клонируем его для вычислений
	if (computed.height === 'auto' && computed.display === 'none') {
		const clone = el.cloneNode(true);
		
		Object.assign(clone.style, {
			visibility: 'hidden', 
			overflow: 'visible', 
			maxHeight: 'none', 
			display: 'block', 
			opacity: '0'
		});

		el.after(clone);
		height = clone.offsetHeight;
		clone.remove();
	}

	return height;
};
  

/* 
* Плавная прокрутка к заданному элементу 
* @вызов:
* 
import { scrollToId } from "../../js/libs/utils";
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
import { scrollToTop } from "../../js/libs/utils";
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


/* 
* Обновление заданного массива в localStorage
* @вызов:
* 
import { updateLocalStorage } from "../../js/libs/utils";
updateLocalStorage('myArray', 'item1');
updateLocalStorage('myArray', 'item1', false);
* 
*/

export const updateLocalStorage = (key, item, add = true) => {
	const storage = JSON.parse(localStorage.getItem(key)) || [];
	const updated = add ? [...new Set([...storage, item])] : storage.filter(val => val !== item);
	localStorage.setItem(key, JSON.stringify(updated));
};


/* 
* Простая валидация формы
* @вызов:
* 
import { validate } from "../../js/libs/utils";
input.classList.toggle('error', !validate(input));
* 
*/

export const validate = (input) => {
	if (!input || !input.dataset.rules) return false;

	const rules = input.dataset.rules.split(',').map(rule => rule.trim()).filter(Boolean);
	if (!rules.length) return false;

	const value = input.value.trim();

	const patterns = {
		req: /.+/,
		email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
		phone: /^\+?\d{1,4}[-\d()\s]{5,20}$/,
		name: /^[a-zA-Zа-яА-ЯёЁ\s-]+$/,
		num: /^\d*$/,
	};

	for (const rule of rules) {
		if (rule.startsWith('min:') && value.length < +rule.slice(4)) return false;
		if (rule.startsWith('max:') && value.length > +rule.slice(4)) return false;
		if (patterns[rule] && !patterns[rule].test(value)) return false;
		if (!patterns[rule] && !rule.includes(':')) {
			console.warn(`Unknown rule: ${rule}`);
			return false;
		}
	}

	return true;
};


/* 
* Изменение высоты формы по мере ввода текста
* @вызов:
* 
import { textareaResize } from "../../js/libs/utils";
document.querySelectorAll('textarea').forEach(autoResizeTextarea);
* 
*/

export const textareaResize = (textarea) => {
	if (!textarea) return;

	const resize = () => {
		const style = getComputedStyle(textarea);
		const borderOffset = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);

		textarea.style.height = 'auto';
		textarea.style.height = (textarea.scrollHeight + borderOffset) + 'px';
	};

	textarea.addEventListener('input', resize);
	resize();
};