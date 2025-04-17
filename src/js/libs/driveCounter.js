export function driveCounter(items, props = {}) {

	class Counter {
		constructor(items, props) {
			if(!items || !(items instanceof NodeList)) return;

			this.props = {
				duration: 1.2,
				unobserve: false,
				...props
			};

			this.items = items;
			this.elements = new Map();

			this.init(this.items);
		}

		moveNum(elem, num) {
			const STEPS = Math.floor(this.props.duration * 60);
			const increment = num / STEPS;
			let count = 0;
		
			const updateNumber = () => {
				count++;
				if (count <= STEPS) {
					elem.textContent = Math.floor(increment * count).toLocaleString();
					requestAnimationFrame(updateNumber);
				}
			};
			requestAnimationFrame(updateNumber);
		};

		handlerObserver = (entries, observer) => {
			entries.forEach((entry) => {
				const target = entry.target;
				target.textContent = 0;
				
				if (entry.isIntersecting) {
					this.moveNum(target, this.elements.get(target));
					this.unobserve && observer.unobserve(target);
				} else {
					target.textContent = 0;
				}
			});
		};
	
		init(countList) {
			const observer = new IntersectionObserver(this.handlerObserver, {
				rootMargin: '0px 0px 0px 0px',
				threshold: 0,
			});
		
			countList.forEach(item => {
				this.elements.set(item, +item.textContent);
				observer.observe(item);
			});
		};
	

	}

	return new Counter(items, props);
}