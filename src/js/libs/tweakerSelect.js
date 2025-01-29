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
const select = selectTweaker(document.querySelector('.someblock__select'), {
	name: 'select',
	select: function(i) {
		console.log(this, i);
	}
});
*/

export const tweakerSelect = (items, props = {}) => {
	class Select {
		constructor(select, props) {
			if(!select || select.tagName !== 'SELECT') return;

			this.props = {
				name: 'select',
				...props
			};

			this.select = select;
			this.options = select.querySelectorAll('option');
			this.currentClass = `${this.props.name}__item_current`;
			this.selectedIndex = [...this.options].findIndex(opt => opt.selected);

			this.wrapper = document.createElement('div');
			this.head = document.createElement('div');
			this.body = document.createElement('div');
			this.list = document.createElement('ul');

			this.wrapper.className = `${select.className} ${this.props.name}`;
			this.head.className = `${this.props.name}__head`;
			this.body.className = `${this.props.name}__body`;
			this.list.className = `${this.props.name}__list`;

			this.init();
		}

		render() {
			const previous = this.select.previousElementSibling;

			for(let data in this.select.dataset) {
				this.wrapper.dataset[`${data}`] = this.select.dataset[data];
				this.select.removeAttribute(`data-${data}`);
			}
	
			(previous) ? previous.after(this.wrapper) : this.select.parentNode.prepend(this.wrapper);

			this.body.append(this.list);
			this.wrapper.append(this.select, this.head, this.body);
			this.head.textContent = this.options[this.selectedIndex].textContent;
			this.select.removeAttribute('class');
			this.select.style.display = 'none';

			this.list.innerHTML = [...this.options]
				.map(opt => `<li class="${this.props.name}__item" data-value="${opt.value}">${opt.text}</li>`)
				.join('\n');

			this.items = [...this.list.children];
			this.items[this.selectedIndex].classList.add(this.currentClass);
		}

		update = (i, e) => {
			e?.preventDefault();

			this.wrapper.classList.remove(`${this.props.name}_opened`);
			this.head.textContent = this.items[i].textContent;
			this.select.value = this.items[i].getAttribute('data-value');
			
			this.items.forEach(item => item.classList.remove(this.currentClass));
			this.items[i].classList.add(this.currentClass);
			
			e && this.select.dispatchEvent(new Event("change"));
			e && (typeof this.props.select === 'function') && this.props.select.call(this.wrapper, i);
		}

		init() {
			this.render();

			this.head.addEventListener('click', () => this.wrapper.classList.toggle(`${this.props.name}_opened`));
			this.options.forEach((option, i) => option.addEventListener('click', () => this.update(i)));
			this.items.forEach((item, i) => item.addEventListener('click', e => this.update(i, e)));
				
			['click','touchstart'].forEach(event => {
				document.addEventListener(event, e => { 
					if (!this.wrapper.contains(e.target)) 
						this.wrapper.classList.remove(`${this.props.name}_opened`);
				}, { passive: false });
			});
		}
	}

	if (items instanceof NodeList || Array.isArray(items)) {
		items.forEach((item) => new Select(item, props));
	} else if (items instanceof HTMLElement) {
		return new Select(items, props);
	} else {
		throw new Error("Invalid input: expected NodeList, HTMLElement, or Array.");
	}
}