/**
 * Класс для адаптивного перемещения DOM-элементов в зависимости от ширины экрана.
 * Работает на основе data-атрибута и может использовать псевдонимы брейкпоинтов.
 * При достижении указанного брейкпоинта, элемент перемещается в целевой контейнер,
 * в заданную позицию. Когда условие не выполняется — возвращается на исходную позицию.
 * 
 * Пример HTML:
 * <div data-moved=".target, md, first">Контент</div>
 * <div class="target"></div>
 * 
 * Пример JS:
 * const move = new driveAdaptive({
 *   type: "max", // или "min"
 *   movedClass: "moved",
 *   aliases: { md: 960, lg: 1280 }
 * });
 * 
 * Синтаксис атрибута:
 * data-moved="селектор, брейкпоинт, позиция"
 *   - селектор: CSS-селектор контейнера-приемника
 *   - брейкпоинт: число или псевдоним
 *   - позиция: "first", "last" или индекс
 * 
 * Значения по умолчанию:
 *   - брейкпоинт = "780"
 *   - позиция = "last"
 *
 * Можно вызывать .init() повторно, если DOM обновился.
 */

export class driveAdaptive {
	constructor({type = "max", movedClass = "moved", aliases = {}}) {
		this.type = type; // Тип адаптации: 'min' или 'max'
		this.movedClass = movedClass;
		this.aliases = aliases; // Дополнительные псевдонимы для брейкпоинтов
		this.nodes = document.querySelectorAll(`[data-${movedClass}]`);
		this.objects = []; // Массив объектов с описанием перемещаемых элементов

		this.init(); // Инициализация при создании экземпляра
	}

	init() {
		this.objects = Array.from(this.nodes).map(node => {
			const [
				selector, 
				rawBreakpoint = "780", 
				place = "last"
			] = node.dataset[this.movedClass].trim().split(",").map(s => s.trim());

			const destination = document.querySelector(selector) || console.warn(`adaptiveMove: destination selector '${selector}' not found.`);

			return {
				element: node,
				parent: node.parentNode,
				destination,
				index: this.#indexInParent(node.parentNode, node),
				breakpoint: this.#resolveBreakpoint(rawBreakpoint) ?? rawBreakpoint,
				place
			};
		});

		this.#arraySort(this.objects); // Сортировка по условиям

		this.mediaQueries = [...new Set(
			this.objects.map(item => `(${this.type}-width: ${item.breakpoint}px),${item.breakpoint}`)
		)];

		this.mediaQueries.forEach(media => {
			const [mediaQuery, breakpoint] = media.split(",");
			const matchMedia = window.matchMedia(mediaQuery);
			const relevantObjects = this.objects.filter(obj => obj.breakpoint === breakpoint);

			matchMedia.addEventListener("change", () => this.#mediaHandler(matchMedia, relevantObjects));
			this.#mediaHandler(matchMedia, relevantObjects); // Первичная проверка
		});
	}
	
	// Преобразование псевдонима брейкпоинта в значение, если определено в настройках
	#resolveBreakpoint(value) {
		return Object.prototype.hasOwnProperty.call(this.aliases, value)
			? this.aliases[value].toString()
			: undefined;
	}
	
	// Обработчик медиа-запроса: перемещение или возврат элементов
	#mediaHandler(matchMedia, objects) {
		if (matchMedia.matches) {
			objects.forEach(obj => {
				if (!obj.destination) return; // Fail-safe: пропустить, если нет места назначения

				obj.index = this.#indexInParent(obj.parent, obj.element);
				this.#moveTo(obj.place, obj.element, obj.destination);
			});
		} else {
			for (let i = objects.length - 1; i >= 0; i--) {
				const obj = objects[i];
				if (obj.element.classList.contains(this.movedClass)) {
					this.#moveBack(obj.parent, obj.element, obj.index);
				}
			}
		}
	}

	// Перемещение элемента
	#moveTo(place, element, destination) {
		element.classList.add(this.movedClass);
		if (place === "last" || place >= destination.children.length) {
			destination.append(element);
		} else if (place === "first") {
			destination.prepend(element);
		} else {
			destination.children[place].before(element);
		}
	}

	// Возврат элемента на исходное место
	#moveBack(parent, element, index) {
		element.classList.remove(this.movedClass);
		if (parent.children[index] !== undefined) {
			parent.children[index].before(element);
		} else {
			parent.append(element);
		}
	}

	// Получение индекса элемента в родителе
	#indexInParent(parent, element) {
		return [...parent.children].indexOf(element);
	}

	// Сортировка массива по breakpoint и place
	#arraySort(arr) {
		const priority = place => {
			if (place === "first") return -1;
			if (place === "last") return 9999;
			return parseInt(place, 10);
		};

		arr.sort((a, b) => {
			if (a.breakpoint === b.breakpoint) {
				return this.type === "min"
					? priority(a.place) - priority(b.place)
					: priority(b.place) - priority(a.place);
			}
			return this.type === "min"
				? a.breakpoint - b.breakpoint
				: b.breakpoint - a.breakpoint;
		});
	}
}