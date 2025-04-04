/* 
* Переключатель классов основанный на скролле. Метод принимает в параметры
* блок содержащий элементы, для которого создается обертка с тем же классом, 
* но с окончанием "-outer". Этой обертке, надо задать стилевую высоту, которая
* будет определять продолжительность эффекта. Высота обертки, должна быть гарантированно
* больше высоты блока с элементами.
* 
* @разметка:
* 
<div class="scroll__items">
	<div class="scroll__item active current"></div>
	<div class="scroll__item"></div>
	<div class="scroll__item"></div>
	<div class="scroll__item"></div>
</div>
* 
* @типичные стили:
* 
* &__items {
* 	position: sticky;
* 	top: 0;
* }
* 
* &__item {
* 	height: 1px;
* 	width: 100%;
* 	overflow: hidden;
* 	position: absolute;
* 	bottom: 0;
* 	will-change: scroll-position;
* 
* 	img {
* 		display: block;
* 		width: 100%;
* 		height: 100%;
* 		object-fit: cover;
* 	}
* 
* 	&.active {
* 		height: 100%;
* 		scale: dynamic(1, 0.5);
* 		opacity: dynamic(0, 1);
* 	}
* 	
* 	&.current {
* 		height: calc(var(--scroll-curr) * 1%);
* 		border-radius: dynamic(0px, 150px);
* 	}
* }
* 
* @вызов:
* 
import { scrollBasedMover } from "../../js/libs/scrollBasedMover";
const sticky = document.querySelector('.scroll__items');
const items = sticky?.querySelectorAll('.scroll__item');

if (sticky && items) {
	scrollBasedMover(sticky, items, { 
		currentClass: 'current',
		activeClass: 'active', 
		overallProp: 'scroll-all',
		currentProp: 'scroll-curr',
		lag: 400,
		gap: 400,
		onOver() {},
		onStart() {},
		onTick(step, currentPercentage) {},
		onUnder() {}
	});
}
* 
* @параметры вызова:
*
* sticky - блок содержащий целевые элементы.
* items - элементы у которых будут переключаться классы.
* activeClass - класс активного элемента
* resetActive - убирать класс активного элемента, у первого элемента при обратном скролле
* currentClass - класс текущего элемента
* previousClass - класс предыдущего элемента
* overallProp - создать у контейнера css переменную с этим именем и числовым значением от 0 до 100, основанном на скролле всего блока
* currentProp - создать у каждого элемента css переменную от 0 до 100, основанную на скролле только для этого элемента
* previousProp - создать у предыдущего элемента css переменную от 0 до 100
* lag - буферный участок вначале и в конце области обработки элементов
* gap - буферные участки между элементами, внутри области обработки
*
* @формула для работы с динамическим фактором:
* 
* значения между --from и --to, вычисляются по формуле
* calc(var(--from) + (var(--to) - var(--from)) * var(--scroll) * 0.01);
*
* или при помощи scss-функции из заготовок
* width: dynamic(50px, 200px);
*
*/

export const scrollBasedMover = (sticky, items, options = {}) => {
	const {
		currentClass = 'current',
		activeClass = 'active',
		previousProp = false,
		overallProp = false,
		currentProp = false,
		resetActive = true,
		gap = 0,
		lag = 0
	} = options;

	const name = sticky.className.split(' ')[0];
	const previous = sticky.previousElementSibling;
	const _wrapper = document.createElement('div');
	let position = '';
	
	_wrapper.className = `${name}-outer`;
	previous ? previous.after(_wrapper) : sticky.parentNode.prepend(_wrapper);
	_wrapper.append(sticky);
	
	if (items.length) {
		let isTicking = false;
		
		const scrollToggle = (items, outer) => {
			const rectOuter = outer.getBoundingClientRect();
			const rectInner = sticky.getBoundingClientRect();
			const topScroll = (rectOuter.top > 0) ? 0 : -rectOuter.top;
			const maxScroll = rectOuter.height - rectInner.height;

			const isOver = topScroll <= lag;
			const isUnder = topScroll >= (maxScroll - lag);

			// нормализованная ширина буфера между item
			const partGap = gap / (maxScroll - lag * 2);
			// нормализованная ширина item
			const partItem = (1 - partGap * (items.length - 1)) / items.length;
			// нормализованная доля перекрытия скроллом всей рабочей области
			const partScroll = isOver ? 0 : isUnder ? 1 : (topScroll - lag) / (maxScroll - lag * 2);
			// локальная позиция скролла внутри блока (item + gap)
			const partLocal = partScroll % (partItem + partGap);

			const step = Math.floor(partScroll / (partItem + partGap)); // индекс активного блока
			const allPercentage = overallProp && Math.min(Math.round((topScroll / maxScroll) * 100), 100); 
			const coverPercentage = (partLocal < partItem) ? Math.floor((partLocal / partItem) * 100) : 100;

			// Вывести общий процентаж
			overallProp && sticky.style.setProperty(`--${overallProp}`, allPercentage);

			// Работа, если в экране
			if (!isOver && !isUnder) {
				
				items.forEach((item, i) => {
					const resetValue = +(i < step) && 100;

					item.classList.toggle(activeClass, (i <= step));
					item.classList.toggle(currentClass, (i == step));
				
					previousProp && items[i - 1]?.style.setProperty(`--${previousProp}`, resetValue);
					currentProp && item.style.setProperty(`--${currentProp}`, resetValue);
				});
				
				previousProp && items[step - 1]?.style.setProperty(`--${previousProp}`, coverPercentage);
				currentProp && items[step].style.setProperty(`--${currentProp}`, coverPercentage);
				
				// вызов коллбэков
				(typeof options.onStart === 'function' && position !== 'inside') && options.onStart.call(sticky, step);
				(typeof options.onTick === 'function') && options.onTick.call(sticky, step, coverPercentage);
				position = 'inside';

			// Сброс, если выше экрана
			} else if (isOver && position !== 'over') {
				items[0].classList.remove(currentClass);
				resetActive && items[0].classList.remove(activeClass);
				currentProp && items[0].style.setProperty(`--${currentProp}`, 0);

				// вызов коллбэка
				(typeof options.onOver === 'function') && options.onOver.call(sticky);
				position = 'over';
	
			// Сброс, если ниже экрана
			} else if (isUnder && position !== 'under') {
				items.forEach(item => item.classList.add(activeClass));
				currentProp && items[items.length - 1].style.setProperty(`--${currentProp}`, 100);
				previousProp && items[items.length - 2]?.style.setProperty(`--${previousProp}`, 100);

				// вызов коллбэка
				(typeof options.onUnder === 'function') && options.onUnder.call(sticky);
				position = 'under';
			}
		};

		const onScroll = () => {
			if (!isTicking) {
				isTicking = true;

				requestAnimationFrame(() => {
					scrollToggle(items, _wrapper);
					isTicking = false;
				});
			}
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				window[(entry.isIntersecting ? 'add':'remove') +'EventListener']('scroll', onScroll, { capture: true, passive: true });
			});
		});

		observer.observe(_wrapper);
		scrollToggle(items, _wrapper);
	}
}