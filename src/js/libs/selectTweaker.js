/* 
* Подменяет стантартный малоуправляемый html тег select 
* на более управляемую структуру, сохраняя функциональность селекта
* 
* @исходная разметка:
* 
<select class="someblock__select">
	<option value="0">consectetur</option>
	<option value="1">adipisicing</option>
	<option value="2">expedita</option>
</select>
* 
* @результирующая разметка:
* 
* <div class="someblock__select select">
* 	<select style="display: none;">
* 		<option value="0">consectetur</option>
* 		<option value="1">adipisicing</option>
* 		<option value="2">expedita</option>
* 	</select>
* 	<div class="select__head">consectetur</div>
* 		<ul class="select__list">
* 			<li class="select__item" data-value="0">consectetur</li>
* 			<li class="select__item" data-value="1">adipisicing</li>
* 			<li class="select__item" data-value="2">expedita</li>
* 		</ul>
* 	</div>
* </div>
* 
* @вызов:
* 
import { selectTweaker } from "../../js/libs/selectTweaker";
selectTweaker(document.querySelectorAll('.someblock__select'));
*/

export const selectTweaker = (items, name = 'select') => {

	[...items].forEach(select => {
		if (select.closest(`.${name}`)) return;

		const options = select.querySelectorAll('option');
		const previous = select.previousElementSibling;
		const currentClass = `${name}__item_current`;
		
		const _wrapper = document.createElement('div');
		const _head = document.createElement('div');
		const _list = document.createElement('ul');

		for(let data in select.dataset)
			_wrapper.dataset[`${data}`] = select.dataset[data];

		_wrapper.className = `${select.className} ${name}`;
		_head.className = `${name}__head`;
		_list.className = `${name}__list`;
	
		select.style.display = 'none';
		select.removeAttribute('class');
		
		(previous) ? previous.after(_wrapper) : select.parentNode.prepend(_wrapper);
		_wrapper.append(select, _head, _list);
		
		_head.textContent = options[0].textContent;

		for (let k = 0; k < options.length; k++) {
			_list.insertAdjacentHTML('beforeend', `<li class="${name}__item" data-value="${options[k].value}">${options[k].text}</li>`);
		}
		
		_head.addEventListener('click', () => _wrapper.classList.toggle(`${name}_opened`));
		
		[..._list.children].forEach((item, i) => {
			i || item.classList.add(currentClass);

			item.addEventListener('click', () => {
				_wrapper.classList.remove(`${name}_opened`);
				_head.textContent = item.textContent;
				select.value = item.getAttribute('data-value');
				
				[..._list.children].forEach(ch => ch.classList.remove(currentClass));
				item.classList.add(currentClass);
			});
		});
	
		['click','touchstart'].forEach(event => {
			document.addEventListener(event, e => { 
				if (!_wrapper.contains(e.target)) 
					_wrapper.classList.remove(`${name}_opened`);
			}, { passive: false });
		});
	});
}