/* 
* Простая реализация табов, основанная на переключении классов.
* При нажатии на кнопку заголовка, переключается класс у соответствующего
* ей контентного блока.
* 
* @требуемая разметка
* 
<div class="tab">
	<div class="tab__buttons">
		<button class="tab__button active"></button>
		<button class="tab__button"></button>
		<button class="tab__button"></button>
	</div>
	<div class="tab__blocks">
		<div class="tab__block active"></div>
		<div class="tab__block"></div>
		<div class="tab__block"></div>
	</div>
</div>
* 
* @вызов
* 
import { driveTabs } from "../../js/libs/driveTabs";
driveTabs({
	container: '.tab',
	controls: '.tab__button',
	selects: '.tab__block',
	cls: 'active'
}, function() {
	this.classList.add('showing');

	this.addEventListener('animationend', e => {
		this.classList.remove('showing');
	}, { once: true });
});
* 
*/

export const driveTabs = (options = {}, cb) => {
	const containers = options.container || '.tab';
	const controls = options.controls || `.${containers}__button`;
	const selects = [options.selects].flat() || [`.${containers}__block`];
	const cls = options.cls || 'active';

	document.querySelectorAll(containers).forEach((container) => {
		const buttons = container.querySelectorAll(controls);
		const blocks = selects.map(set => container.querySelectorAll(set));

		buttons.forEach((button, i) => {
			button.addEventListener('click', (e) => {
				e.preventDefault();

				if (! e.target.classList.contains(`${cls}`)) {
					buttons.forEach((button, i) => {
						button.classList.remove(`${cls}`);
						blocks.map(set => set[i].classList.remove(`${cls}`));
					});
		
					button.classList.add(`${cls}`);

					blocks.map(set => {
						set[i].classList.add(`${cls}`);
						(typeof cb === 'function') && cb.call(set[i]);
					});
				}
			});
		});
	});
}