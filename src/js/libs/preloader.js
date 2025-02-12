/* 
* Заставка с прогрессом предварительной загрузки 
* продолжительность анимации скрытия заставки после окончания
* загрузки, определяется свойством transition-duration у 
* элемента-обертки (надо задавать в стилях вручную).
* 
* @требуемая разметка:
* <div class="preloader">
* 	<div class="preloader__progress"></div>
* </div>
* 
* @вызов:
* 
import { preloadingBar } from "../../js/libs/preloader";
preloadingBar({ class: 'preloader', area: 'body' });
* 
*/

export const preloadingBar = (options = {}) => {
	let ctr = 0;
	let media = [];
	const cls = options.class || 'preloader';
	const area = document.querySelector(options.area) || document;
	const wrapper = document.querySelector(`.${cls}`);
	const progress = document.querySelector(`.${cls}__progress`);
	const includeVideo = options.includeVideo || false;

	if (!wrapper) return;

	// Функция для сбора всех изображений и видео (если включено)
	const getMedia = () => {
		const elements = area.querySelectorAll('*:not(script)');
		elements.forEach((tag) => {
			const background = getComputedStyle(tag).backgroundImage;

			if (tag.tagName.toLowerCase() === 'img' && tag.src) {
				media.push(tag.src);
			} else if (includeVideo && tag.tagName.toLowerCase() === 'video' && tag.currentSrc) {
				media.push(tag.currentSrc);
			} else if (background && background !== 'none') {
				media.push(...parseUrl(background));
			}
		});
	};

	// Парсинг URL из background-image
	const parseUrl = (background) => {
		return background.split(',').reduce((result, part) => {
			if (part.includes('url')) {
				const url = part.trim().slice(4, -1).replace(/["']/g, "");
				result.push(url);
			}
			return result;
		}, []);
	};

	// Обновление прогресса
	const updateProgress = () => {
		const percent = Math.round((++ctr / media.length) * 100);

		if (progress) {
			progress.style.setProperty('--progress', percent);
			progress.dataset.count = percent;
		}

		(ctr === media.length) && loadDone();
	};

	// Завершение прелоадера
	const loadDone = () => {
		wrapper.classList.add(`${cls}_done`);

		const transitionDuration = parseFloat(getComputedStyle(wrapper).transitionDuration) || 1.2;
		setTimeout(() => {
			wrapper.remove();
		}, transitionDuration * 1000);
	};

	// Инициализация загрузки медиа
	const init = () => {
		getMedia();
		! media.length && loadDone();

		media.forEach((src) => {
			if (includeVideo && (src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.ogg'))) {
				const video = document.createElement('video');
				video.onloadeddata = updateProgress;
				video.onerror = updateProgress;
				video.src = src;
			} else {
				const img = new Image();
				img.onload = updateProgress;
				img.onerror = updateProgress;
				img.src = src;
			}
		});
	};

	document.addEventListener('DOMContentLoaded', init);
};