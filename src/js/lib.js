export const scrollClassToggle = (items) => {
	if (items.length) {
		const classToggle = function(item) {
			let repeat = item.dataset['repeat'] != undefined;
			let shift = item.offsetHeight/item.dataset['shift'] || 1;
			let over = item.getBoundingClientRect().bottom + shift > 0;
			let under = item.getBoundingClientRect().bottom - shift - window.innerHeight < 0;
	
			if (repeat || !item.classList.contains('active'))
				item.classList[(over && under) ? 'add': 'remove']('active');
		}
		
		for (let i = 0; i < items.length; i++) {
			window.addEventListener('scroll', () => classToggle(items[i]));
			classToggle(items[i]);
		}
	}
}


export const selectTweaker = (items, name='select') => {

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
