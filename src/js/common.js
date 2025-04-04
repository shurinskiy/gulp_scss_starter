import "./polyfills.js";
import "./blocks.js";

/* Тут можно писать код общий для всего проекта и требующий единого пространства имен */

new ResizeObserver(() => {
	const root = document.documentElement;
	const vh = root.clientHeight / 100;
	// const vw = root.clientWidth / 100;

	root.style.setProperty('--vh', `${vh}px`);
	// root.style.setProperty('--vw', `${vw}px`);
}).observe(document.documentElement);