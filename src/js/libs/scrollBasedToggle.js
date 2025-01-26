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
* @стили:
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
* 		scale: calc(1 + (0.5 - 1) * (var(--scroll-prev) * 0.01)); // плавное изменение от 1 до 0.5
* 		opacity: calc(1 - var(--scroll-prev) * 0.01); // плавное изменение от 0 до 1
* 	}
* 	
* 	&.current {
* 		height: calc(var(--scroll-curr) * 1%);
* 		border-radius: calc(150px - (var(--scroll-curr) * 0.01px) * 150); // плавное изменение от 0 до 150px
* 	}
* }
* 
* @вызов:
* 
import { scrollBasedToggle } from "../../js/libs/scroll";
const sticky = document.querySelector('.scroll__items');
const items = sticky?.querySelectorAll('.scroll__item');

if (sticky && items) {
	scrollBasedToggle(sticky, items, { 
		currentClass: 'current',
		activeClass: 'actuve', 
		overallProp: 'scroll-all',
		currentProp: 'scroll-curr',
		lag: 400,
		onOver(sticky) {
		},
		onStart(sticky) {
		},
		onTick(sticky, step, currentPercentage) {
		},
		onUnder(sticky) {
		}
	});
}
* 
* @параметры вызова:
*
* sticky - блок содержащий целевые элементы.
* items - элементы у которых будут переключаться классы.
* activeClass - класс активного элемента
* previousClass - класс предыдущего элемента
* currentClass - класс текущего элемента
* overallProp - создать у контейнера css переменную с этим именем и числовым
* значением от 0 до 100, основанном на скролле всего блока
* currentProp - создать у каждого элемента css переменную от 0 до 100, основанную
* на скролле только для этого элемента
* previousProp - создать у предыдущего элемента css переменную от 0 до 100
*/

export const scrollBasedToggle = (sticky, items, options = {}) => {
	const {
		currentClass = 'current',
		activeClass = 'active',
		previousProp = false,
		overallProp = false,
		currentProp = false,
		resetActive = true,
		lag = 0
	} = options;

	const name = sticky.className.split(' ')[0];
	const previous = sticky.previousElementSibling;
	const _wrapper = document.createElement('div');
	let position = '';
	
	_wrapper.className = `${name}-outer`;
	(previous) ? previous.after(_wrapper) : sticky.parentNode.prepend(_wrapper);
	_wrapper.append(sticky);
	
	if (items.length) {
		let isTicking = false;
		
		const scrollToggle = (items, outer) => {
			const box = outer.getBoundingClientRect();
			const scrollTop = Math.abs(box.top);
			const maxScroll = outer.scrollHeight - lag - window.innerHeight;
			const rest = scrollTop / maxScroll * items.length;
			const step = Math.min(Math.trunc(rest), items.length - 1);
			
			let allPercentage = overallProp && Math.round((scrollTop / maxScroll) * 100);
			let currentPercentage = (currentProp || previousProp) && Math.floor((rest * 100) % 100);

			// Работа, если в экране
			if ((lag + box.top) < 0 && (box.bottom - window.innerHeight) > lag) {
				items.forEach((item, i) => {
					const resetValue = +(i < step) && 100;

					item.classList.toggle(activeClass, (i <= step));
					item.classList.toggle(currentClass, (i == step));
					previousProp && items[i - 1]?.style.setProperty(`--${previousProp}`, resetValue);
					currentProp && item.style.setProperty(`--${currentProp}`, resetValue);
				});
				
				previousProp && items[step - 1]?.style.setProperty(`--${previousProp}`, currentPercentage);
				currentProp && items[step].style.setProperty(`--${currentProp}`, currentPercentage);
				overallProp && sticky.style.setProperty(`--${overallProp}`, allPercentage);

				// вызов коллбэков
				(typeof options.onStart === 'function' && position !== 'inside') && options.onStart.call(sticky, step);
				(typeof options.onTick === 'function') && options.onTick.call(sticky, step, currentPercentage);
				position = 'inside';
				
			// Сброс, если выше экрана
			} else if ((lag + box.top > 0) && position !== 'over') {
				allPercentage = 0;
				items[0].classList.remove(currentClass);
				resetActive && items[0].classList.remove(activeClass);
				currentProp && items[0].style.setProperty(`--${currentProp}`, 0);
				overallProp && sticky.style.setProperty(`--${overallProp}`, 0);

				// вызов коллбэка
				(typeof options.onOver === 'function') && options.onOver.call(sticky);
				position = 'over';
				
			// Сброс, если ниже экрана
			} else if (box.bottom - lag < window.innerHeight && position !== 'under') {
				items.forEach(item => item.classList.add(activeClass));
				overallProp && sticky.style.setProperty(`--${overallProp}`, 100);
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