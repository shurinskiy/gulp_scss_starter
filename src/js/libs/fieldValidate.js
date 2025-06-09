/*
* Валидация поля формы по data-атрибуту data-rules
* 
* @типичная разметка
* <input data-rules="req,email,min:8">
* 
* Поддерживаемые правила:
* - req — обязательное поле
* - email — проверка email
* - phone — номер телефона
* - name — имя (буквы, дефис, пробел)
* - num — только цифры
* - min:8 — минимальная длина
* 
* @типичное исползование
* 
import { fieldValidate } from "../../js/libs/fieldValidate";

(() => {
	const form = document.querySelector('form.form__inner');
	if (! form) return;

	const inputs = form.querySelectorAll('.form__field input');

	const validate = function(input) {
		const check = fieldValidate(input, 'en');
		input.parentNode.classList.toggle('error', !check.valid);
		input.parentNode.querySelector('.form__error').innerText = check.message ?? '';
	}

	inputs.forEach(input => {
		['change', 'blur'].forEach(event => {
			input.addEventListener(event, e => validate(input));
		});
	});

	form.addEventListener('submit', e => {
		e.preventDefault();
		inputs.forEach(input => validate(input));
	});

})();
* 
*/

const messages = {
	ru: {
		omit: 'Это поле должно быть пустым',
		req: 'Поле обязательно для заполнения',
		email: 'Введите корректный email',
		phone: 'Введите корректный номер телефона',
		name: 'Имя содержит недопустимые символы',
		num: 'Поле должно содержать только цифры',
		url: 'Введите корректный URL',
		login: 'Логин должен содержать только латинские буквы, цифры, дефис или подчёркивание',
		password: 'Пароль должен содержать минимум одну букву и цифру',
		min: (n) => `Минимум ${n} символов`,
		max: (n) => `Максимум ${n} символов`,
		exact: (n) => `Должно быть ровно ${n} символов`,
		unknown: (rule) => `Ошибка валидации: ${rule}`,
	},
	en: {
		omit: 'This field must be left blank',
		req: 'This field is required',
		email: 'Enter a valid email address',
		phone: 'Enter a valid phone number',
		name: 'Name contains invalid characters',
		num: 'Only digits are allowed',
		url: 'Enter a valid URL',
		login: 'Login may contain only Latin letters, numbers, dashes or underscores',
		password: 'Password must contain at least one letter and one digit',
		min: (n) => `Minimum ${n} characters`,
		max: (n) => `Maximum ${n} characters`,
		exact: (n) => `Must be exactly ${n} characters`,
		unknown: (rule) => `Validation error: ${rule}`,
	}
};


export const fieldValidate = (input, lang = 'ru') => {
	if (!input || !input.dataset.rules) {
		return { valid: false, message: messages[lang]?.unknown('input') || 'Validation error' };
	}

	const value = input.value.trim();
	const rules = input.dataset.rules.split(',').map(r => r.trim()).filter(Boolean);

	const patterns = {
		req: /.+/,
		num: /^\d*$/,
		omit: /^$/,
		name: /^[a-zA-Zа-яА-ЯёЁ\s-]+$/,
		phone: /^\+?\d{1,4}[-\d()\s]{5,20}$/,
		email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
		url: /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i,
		password: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
		login: /^[a-zA-Z0-9_-]+$/,
	};

	for (const rule of rules) {
		if (rule.startsWith('min:')) {
			const len = +rule.slice(4);
			if (value.length < len) return { valid: false, message: messages[lang]?.min(len) };
			continue;
		}
		if (rule.startsWith('max:')) {
			const len = +rule.slice(4);
			if (value.length > len) return { valid: false, message: messages[lang]?.max(len) };
			continue;
		}
		if (rule.startsWith('exact:')) {
			const len = +rule.slice(6);
			if (value.length !== len) return { valid: false, message: messages[lang]?.exact(len) };
			continue;
		}
		if (patterns[rule]) {
			if (!patterns[rule].test(value)) return { valid: false, message: messages[lang]?.[rule] };
			continue;
		}
		if (!rule.includes(':')) {
			console.warn(`Неизвестное правило: ${rule}`);
			return { valid: false, message: messages[lang]?.unknown(rule) };
		}
	}

	return { valid: true };
};