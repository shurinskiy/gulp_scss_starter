/* 
* Заставка с прогрессом предварительной загрузки 
* продолжительность анимации скрытия заставки после окончания
* загрузки, определяется свойством transition-duration у 
* элемента-обертки (надо задавать в стилях вручную).
* 
* @требуемая разметка:
* <div class="preloader">
* 	<div class="preloader__progress" data-count="0">Загрузка</div>
* </div>
* 
* @вызов:
* 
import { preloadingBar } from "../../js/libs/makePreloader";
preloadingBar({
	includeVideo: true,
	cls: 'preloader',
	area: 'body'
});
* 
* @типичные стили:
* 
.preloader {
	$self: &;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
	user-select: none;
	overflow: hidden;
	position: fixed;
	z-index: 9999;
	top: 0;
	left: 0;
	width: 100%;
	height: calc(var(--vh, 1vh) * 100);

	&_done {
		transition: opacity 0.8s;
		opacity: 0;
	}

	&__progress {
		&::before {
			content: '';
			height: 1px;
			transition: width 0.5s;
			width: calc(var(--progress, 0) * 1%);
			position: absolute;
			top: calc(50% + 1.1em);
			left: 0;
		}

		&::after {
			content: attr(data-count)'%';
		}
	}
}
* 
*/

export const preloadingBar = (options = {}) => {
	const {
		includeVideo = false,
		doneDelay = 1000,
		cls = 'preloader',
	} = options;

	const area = document.querySelector(options.area) || document;
	const progress = document.querySelector(`.${cls}__progress`);
	const wrapper = document.querySelector(`.${cls}`);

	let media = [];
	let ctr = 0;

	if (!wrapper) return;

	// Функция для сбора всех изображений и видео (если включено)
	const getMedia = () => {
		const elements = area.querySelectorAll('*:not(script)');
		elements.forEach((tag) => {
			const background = getComputedStyle(tag).backgroundImage;

			if (tag.tagName.toLowerCase() === 'img') {
				if (tag.src) media.push(tag.src);
				if (tag.srcset) {
					tag.srcset.split(',').forEach(src => {
						media.push(src.trim().split(' ')[0]);
					});
				}				
			} else if (includeVideo && tag.tagName.toLowerCase() === 'video' && tag.currentSrc) {
				media.push(tag.currentSrc);
			} else if (background && background !== 'none') {
				media.push(...parseUrl(background));
			}

			media = [...new Set(media)];
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
		setTimeout(() => {
			wrapper.classList.add(`${cls}_done`);
			const transitionDuration = parseFloat(getComputedStyle(wrapper).transitionDuration) || 1.2;
	
			setTimeout(() => {
				wrapper.remove();
			}, transitionDuration * 1000);
		}, doneDelay);
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

	const initOnReady = () => {
		document.readyState === 'complete' 
			? init() 
			: document.addEventListener('DOMContentLoaded', init);

		// Добавляем подстраховку на window.load, если что-то не догрузилось
		window.addEventListener('load', () => {
			(ctr < media.length) && (ctr = media.length) && loadDone();
		});
	};
	
	initOnReady();
};