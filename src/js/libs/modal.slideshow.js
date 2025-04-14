export const slideshow = {
	name: 'slideshow',

	init(modal, props = {}) {
		this.props = props;

		this.setupSlideshow = function(el) {
			const rel = el.attributes.rel?.value;
			if (!rel) return;

			let counter = 0;
			const current = modal.content.querySelector('img, video');

			[...document.querySelectorAll(`[rel="${rel}"]`)].forEach(item => {
				const data = item.dataset[modal.props.class];
				const source = item.querySelector('img, video');
				let child;

				if (!data) {
					child = source.cloneNode();
				} else {
					child = document.createElement('img');
					child.src = data;
				}

				if (child.src !== current.src) {
					Object.assign(child.dataset, source.dataset);
					modal.content.appendChild(child);
					counter++;
				} else {
					Object.assign(current.dataset, source.dataset);
				}
			});

			modal.content.classList.add(`${modal.props.class}__content_${this.props.classMod}`);
			current.classList.add(`${this.props.classActive}`);
			
			if (counter > 1) {
				const navi = document.createElement('div');
				const prev = document.createElement('button');
				const next = document.createElement('button');
				this.items = modal.content.querySelectorAll('img, video');
				this.cnt = 0;

				navi.className = `${modal.props.class}__navi`;
				prev.className = `${modal.props.class}__prev`;
				next.className = `${modal.props.class}__next`;

				navi.append(prev);
				navi.append(next);
				modal.body.append(navi);
				this.navi = navi;

				prev.addEventListener('click', () => this.slideshowMove(-1));
				next.addEventListener('click', () => this.slideshowMove());

				modal.slideshow = true;
			}
		};

		this.slideshowMove = function(direction = 1) {
			this.items[this.cnt].classList.remove(this.props.classActive);
			this.cnt += direction;

			if (this.cnt < 0) this.cnt = this.items.length - 1;
			else if (this.cnt >= this.items.length) this.cnt = 0;

			this.items[this.cnt].classList.add(this.props.classActive);

			modal._hooks.move.forEach(move => move());
			(typeof modal.props.move === 'function') && modal.props.move.call(modal.content, modal);
		};

		// Добавить новый хук в базовый класс
		modal._hooks.move ||= [];
		
		// Добавить новый метод в базовый класс
		modal.move = this.slideshowMove.bind(this);
	},
	
	open(modal, el) {
		const data = el.dataset[`${modal.props.class}`];
		(!!data && data.startsWith('#')) || this.setupSlideshow(el);
	},
	
	close(modal) {
		delete this.cnt;
		delete this.items;
		delete modal.slideshow;
		
		this.navi?.remove();
	}
}