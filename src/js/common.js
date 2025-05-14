import { throttle } from "./libs/utils";
import "./polyfills.js";
import "./blocks.js";

/* Тут можно писать код общий для всего проекта и требующий единого пространства имен */

function updateVH() {
	const vh = (window.visualViewport?.height || window.innerHeight) * 0.01;
	document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', throttle(updateVH, 200), { passive: true });
updateVH();