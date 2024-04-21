import { slideUp, slideDown, slideToggle } from "./helpers";

/* 
* По событию анимированно скрывает (показывает) по высоте, текущий 
* элемент (добавляя ему класс при открытии) и скрывает все остальные 
* элементы (убирая класс). Может обрабатывать несколько событий (click, hower и т.д.)
* 
* @разметка
* 
<div class="accordeon">
	<div class="accordeon__item">
		<h2 class="accordeon__head opened"></h2>
		<div class="accordeon__block"></div>
	</div>
	<div class="accordeon__item">
		<h2 class="accordeon__head"></h2>
		<div class="accordeon__block"></div>
	</div>
	<div class="accordeon__item">
		<h2 class="accordeon__head"></h2>
		<div class="accordeon__block"></div>
	</div>
</div>
*
* @вызов (с уточнением контекста):
*
import { smoothAccordion } from "../../js/libs/accordions";
document.querySelectorAll('.accordeon').forEach((c) => {
	smoothAccordion(accordeon.querySelectorAll('.accordeon__head'), { 
		events: 'click, mouseenter',
		cls: 'active',
		toggle: false
	});
});
*
* @параметры вызова:
*
* cls - переключаемый класс
* еvents - отслеживаемые события (строка, через запятую)
* toggle - не просто добавлять, а переключать класс у текущего элемента 
* duration - продолжительность анимационного эффекта
*/

export const smoothAccordion = function(items, options = {}) {
	const cls = options.cls || 'opened';
	const events = options.events || 'click';
	const duration = options.duration || 400;
	const toggle = options.toggle;

	events.split(' ').forEach(event => {
		items.forEach(item => {
			item.addEventListener(event, function(e) {
				e.stopPropagation();

				items.forEach(item => {
					if (item != this) {
						slideUp(item.nextElementSibling, { duration: duration });
						item.classList.remove(`${cls}`);
					}
				});

				if (toggle) {
					slideToggle(item.nextElementSibling, { duration: duration });
					this.classList.toggle(`${cls}`);
				} else {
					slideDown(item.nextElementSibling, { duration: duration });
					this.classList.add(`${cls}`);
				}
			})
		})
	});
}

/* 
* По событию добавляет (переключает) класс у текущего блока 
* и удаляет этот класс у всех соседних. Может обрабатывать 
* несколько событий (click, hower и т.д.)
* 
* @разметка
* 
<div class="accordeon">
	<div class="accordeon__item">
		<h2 class="accordeon__head opened"></h2>
		<div class="accordeon__block"></div>
	</div>
	<div class="accordeon__item">
		<h2 class="accordeon__head"></h2>
		<div class="accordeon__block"></div>
	</div>
	<div class="accordeon__item">
		<h2 class="accordeon__head"></h2>
		<div class="accordeon__block"></div>
	</div>
</div>
*
* @вызов (с уточнением контекста):
*
import { roughAccordion } from "../../js/libs/accordions";
document.querySelectorAll('.accordeon').forEach((accordeon) => {
	roughAccordion(accordeon.querySelectorAll('.accordeon__head'), { 
		events: 'click, mouseenter',
		cls: 'active',
		toggle: false
	});
});
*
* @параметры вызова:
*
* cls - переключаемый класс
* еvents - отслеживаемые события (строка, через запятую)
* toggle - не просто добавлять, а переключать класс у текущего элемента 
*/

export const roughAccordion = (items, options = {}) => {
	const cls = options.cls || 'opened';
	const events = options.events || 'click';
	const toggle = options.toggle;
	
	events.split(' ').forEach(event => {
		items.forEach(item => {
			item.addEventListener(event, function(e) {
				e.stopPropagation();
				items.forEach(item => (item != this) && item.classList.remove(`${cls}`));
			
				if (this.classList != `${cls}`)
					this.classList[(toggle) ? 'toggle':'add'](`${cls}`);
			});
		});
	});
}