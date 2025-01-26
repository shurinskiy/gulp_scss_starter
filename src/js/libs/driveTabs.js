/* 
* Простая реализация табов, основанная на переключении классов.
* При нажатии на кнопку заголовка, переключается класс у соответствующего
* ей контентного блока.
* 
* @требуемая разметка
* 
<div class="tab">
	<div class="tab__buttons">
		<button class="tab__button active"></button>
		<button class="tab__button"></button>
		<button class="tab__button"></button>
	</div>
	<div class="tab__blocks">
		<div class="tab__block active"></div>
		<div class="tab__block"></div>
		<div class="tab__block"></div>
	</div>
	<div class="tab__otherblocks">
		<a class="active" href="./">One</a>
		<a href="./">Two</a>
		<a href="./"><Three/a>
	</div>
</div>
* 
* @вызов
* 
import { driveTabs } from "../../js/libs/driveTabs";
tabs = driveTabs({
	container: '.tab',
	controls: '.tab__button',
	selects: ['.tab__block', '.tab__otherblocks a'],
	cls: 'active',
	onInit() {
		console.log(this);
	},
	onClick(i) {
		console.log(this, i);
	},
	onTab(set, i) {
		console.log(this, set, i);
	},
	onTick(i) {
		console.log(this, i);
	},
});
* 
*/

export const driveTabs = (props = {}) => {
	class Tabs {
		constructor(props) {
			this.props = {
				cls: 'active',
				...props
			}

			this.container = (this.props.container instanceof Element)
				? this.props.container
				: document.querySelector(this.props.container);

			this.controls = (this.props.controls instanceof NodeList)
				? this.props.controls
				: this.container.querySelectorAll(this.props.controls);

			this.selects = (this.props.selects instanceof NodeList)
				? [...[this.props.selects]]
				: [this.props.selects].flat().map(set => this.container.querySelectorAll(set));

			this.currentActive = [...this.controls].findIndex(ctrl => ctrl.classList.contains(this.props.cls));
			
			this.init();
		}
		
		setActive = (i, e) => {
			e?.preventDefault();

			if (typeof this.props.onClick === 'function' && e)
				this.props.onClick.call(this, i);

			if (! this.controls[i].classList.contains(this.props.cls)) {
				this.controls.forEach((button, i) => {
					button.classList.remove(this.props.cls);
					this.selects.map(set => set[i].classList.remove(this.props.cls));
				});
	
				this.controls[i].classList.add(this.props.cls);

				this.selects.map(set => {
					set[i].classList.add(this.props.cls);

					if (typeof this.props.onTab === 'function')
						this.props.onTab.call(this, set, i);
				});
			}

			if (typeof this.props.onTick === 'function')
				this.props.onTick.call(this, i);
		}

		move = (direction = 1) => {
			this.currentActive += direction;

			if (this.currentActive >= this.controls.length) {
				this.currentActive = 0;
			} else if(this.currentActive < 0) {
				this.currentActive = this.controls.length - 1;
			}

			this.setActive(this.currentActive);
		}

		init() {
			this.controls.forEach((button, i) => {
				button.addEventListener('click', (e) => this.setActive(i, e));
			});

			if (typeof this.props.onInit === 'function')
				this.props.onInit.call(this);
		}
	}
		
	return new Tabs(props);
}