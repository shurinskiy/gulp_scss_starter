/* 
* Заставка с прогрессом предварительной загрузки 
* продолжительность анимации скрытия заставки после окончания
* загрузки, определяется свойством transition-duration у 
* элемента-обертки (надо задавать в стилях вручную).
* 
* @требуемая разметка:
* <div class="preloader">
* 	<div class="preloader__counter"></div>
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
	let images = [];
	const cls = options.class || 'preloader';
	const area = document.querySelector(options.area) || document;
	const _wrapper = document.querySelector(`.${cls}`);
	const _counter = document.querySelector(`.${cls}__counter`);
	const _progress = document.querySelector(`.${cls}__progress`);

	if (!_wrapper) return;

	const getImages = () => {
		area.querySelectorAll('*:not(script)').forEach((tag) => {
			let background = getComputedStyle(tag, null).backgroundImage;

			if (tag.src && tag.tagName.toLowerCase() == 'img') {
				images = [...images, tag.src];
			} else if (background !== 'none') {
				images = [...images, ...parseUrl(background)];
			}
		});
	}

	const parseUrl = (background) => {
		return background.split(',').reduce((images, part) => {
			if (part.includes('url')) {
				return [...images, part.trim().slice(4, -1).replace(/["']/g, "")];
			}
			
			return images;
		}, []);
	}

	const imagesLoaded = () => {
		let percent = Math.round(100 / images.length * ++ctr);

		if(_counter)
			_counter.innerText = percent;
		
		if(_progress)
			_progress.style.width = `${percent}%`;
		
		if(ctr === images.length) 
			loadDone();
	}
	
	const loadDone = () => {
		let computed = getComputedStyle(_wrapper, null);
		let delay = parseInt(computed.transitionDuration) * 1000;
		_wrapper.style.opacity = 0;

		setTimeout(() => { 
			_wrapper.remove();
		}, delay || 1200);
	}

	const init = () => {
		getImages();

		images.forEach((item, i) => {
			let clone = new Image();

			clone.onload = imagesLoaded;
			clone.onerror = imagesLoaded;
			clone.src = images[i];
		});
	}

	document.addEventListener('DOMContentLoaded', init, false);
}
