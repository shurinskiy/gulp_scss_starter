export const scrollClassToggle = (items) => {
	if (items.length) {
		const classToggle = function(item) {
			const repeat = item.dataset['repeat'] != undefined;
			const box = item.getBoundingClientRect();
			const shift = box.height/item.dataset['shift'] || 1;
			const over = box.bottom + shift > 0;
			const under = box.bottom - shift - window.innerHeight < 0;
	
			if (repeat || !item.classList.contains('active'))
				item.classList[(over && under) ? 'add': 'remove']('active');
		}
		
		for (let i = 0; i < items.length; i++) {
			window.addEventListener('scroll', () => classToggle(items[i]));
			classToggle(items[i]);
		}
	}
}


export const selectTweaker = (items, name = 'select') => {

	for (let i = 0; i < items.length; i++) {
		const select = items[i];
		const options = select.querySelectorAll('option');
		const _wrapper = document.createElement('div');
		const _head = document.createElement('div');
		const _list = document.createElement('ul');
		
		_wrapper.className = `${select.className} ${name}`;
		_head.className = `${name}__head`;
		_list.className = `${name}__list`;

		select.style.display = 'none';
		select.removeAttribute('class');
		select.parentNode.append(_wrapper);
		_wrapper.append(select, _head, _list);
		
		_head.textContent = options[0].textContent;
		_head.addEventListener('click', () => _wrapper.classList.toggle(`${name}_opened`));

		for (let k = 0; k < options.length; k++) {
			_list.insertAdjacentHTML('beforeend', `<li class="${name}__item" data-value="${options[k].value}">${options[k].text}</li>`);
		}

		[..._list.children].forEach( item => {
			item.addEventListener('click', () => {
				_wrapper.classList.remove(`${name}_opened`);
				_head.textContent = item.textContent;
				select.value = item.getAttribute('data-value');
			});
		});

		document.addEventListener('mouseup', e => { 
			if (!_wrapper.contains(e.target)) 
				_wrapper.classList.remove(`${name}_opened`);
		});
	}
}


export const makeAccordion = function(items, events = 'click', name = 'opened', toggle = false) {
	events.split(' ').forEach(event => {
		items.forEach(item => {
			item.addEventListener(event, function(e) {
				e.stopPropagation();
				items.forEach((item) => (item != this) && item.classList.remove(`${name}`));
			
				if (this.classList != `${name}`)
					this.classList[(toggle) ? 'toggle':'add'](`${name}`);
			});
		});
	});
}


export const galleryTweaker = (items, name = 'gallery', navigation = false) => {

	for (let i = 0; i < items.length; i++) {
		const frame = items[i];
		const images = frame.querySelectorAll('img');
		const _wrapper = document.createElement('div');
		const _thumbs = document.createElement('div');
		
		_wrapper.className = `${frame.className} ${name}`;
		_thumbs.className = `${name}__thumbs`;
		frame.className = `${name}__frame`;
		
		for (let j = 0; j < images.length; j++) {
			let active = j ? '':'active';
			let _image = document.createElement('div');
			_image.className = `${name}__image ${active}`;
			frame.append(_image);
			_image.append(images[j]);
		}

		frame.parentNode.append(_wrapper);
		_wrapper.append(frame, _thumbs);

		for (let k = 0; k < images.length; k++) {
			let active = k ? '':'active';
			let _thumb = document.createElement('span');
			_thumb.className = `${name}__thumb ${active}`;
			_thumb.style.backgroundImage = `url(${images[k].src})`;
			_thumb.style.backgroundSize = 'cover';
			_thumbs.append(_thumb);
		}

		if (navigation) {
			const _prev = document.createElement('button');
			const _next = document.createElement('button');
			_prev.className = `${name}__prev`;
			_next.className = `${name}__next`;
			_wrapper.append(_prev, _next);
		}

		_wrapper.addEventListener('click', function(e) {
			// индекс активного слайда
			let currentActive = [...images].findIndex(el => el.parentNode.classList.contains('active'));

			// убрать класс "active" у всех слайдов и у всех превьюшек
			let clearActive = () => {
				[...images].map((el) => { el.parentNode.classList.remove('active') });
				[..._thumbs.children].map((el) => { el.classList.remove('active') });
			}

			// сдвинуть индекс активного слайда в заданном направлении
			let moveActive = (direction) => {
				clearActive();
				currentActive += direction;

				if (currentActive >= images.length) {
					currentActive = 0;
				} else if(currentActive < 0) {
					currentActive = images.length - 1;
				}

				images[currentActive].parentNode.classList.add('active')
				_thumbs.children[currentActive].classList.add('active');
			}

			// если клик по превьюшке
			if(e.target.classList.contains(`${name}__thumb`)) {
				clearActive();
				images[[..._thumbs.children].findIndex(el => el == e.target)].parentNode.classList.add('active');
				e.target.classList.add('active');
			}

			// если клик по кнопке "prev"
			if (e.target.classList.contains(`${name}__prev`))
				moveActive(-1);

			// если клик по кнопке "next"
			if (e.target.classList.contains(`${name}__next`))
				moveActive(1);
		});
	}
}


export const makeParallax = (items, name = "parallax") => {
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const _underlay = document.createElement('div');
		const styles = {
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat',
			backgroundColor: 'transparent',
			backgroundImage: `url(${item.dataset.image})`,
			position: 'absolute',
			zIndex: 1,
			bottom: 0,
			right: 0,
			left: 0,
			top: 0,
		}

		Object.assign(_underlay.style, styles);
		_underlay.classList.add(`${name}__underlay`);

		item.classList.add(`${name}`);
		item.style.position = 'relative';
		item.style.overflow = 'hidden';
		item.prepend(_underlay);

		const translateY = () => {
			const box = item.getBoundingClientRect();
			const speed = item.dataset.speed || 10;
			const screen = window.innerHeight;
			
			if ((box.top < screen) && (box.bottom > 0)) {
				_underlay.style.top = `${(screen + box.height) / -speed}px`;
				_underlay.style.transform = `translateY(${box.bottom / speed}px)`;
			}
		}

		window.addEventListener('scroll', translateY);
		translateY();
	}
}