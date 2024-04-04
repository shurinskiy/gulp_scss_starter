/* 
* Таймер обратного отсчета. Необходима стилилизация динамически создаваемых блоков
* и их псевдоэлементов.
* 
* @исходная разметка
* 
<div class="someblock"></div>
* 
* @результирующая разметка
* 
<div class="someblock clock">
	<div className="clock__digit"></div>
	<div className="clock__digit"></div>
	<div className="clock__digit"></div>
	<div className="clock__digit"></div>
</div>
* 
* @стили (необходимый минимум)
* 
.b-clock {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-auto-rows: minmax(160px, auto);
	grid-gap: 40px;
	font-family: sans-serif;
	font-weight: 900;
	font-size: 110px;
	line-height: 1;

	&__digit {
		position: relative;
		overflow: hidden;
		height: 100%;

		&::before, &::after {
			position: absolute;
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		&::before {
			content: attr(data-time-before);
			bottom: 100%;
		}
		
		&::after {
			content: attr(data-time-after);
			bottom: 0;
		}

		&.flipped {
			&::before, &::after {
				transform: translateY(100%);
				transition: transform 0.7s linear;
			}
		}
	}
}

* 
* @вызов
* 
import { countdownTimer } from "../../js/libs/countdownTimer";
countdownTimer(document.querySelector('.someblock'), { 
	class: 'timer',
	date: 'Mar 25, 2024 20:32:00',
	types: 'd,h,m,s',
	effectClass: 'flipped',
	digitWrapper: true,
	finished: function() {
		console.log(this);
	}
});
* 
*/

export const countdownTimer = (element, options = {}) => {
	class Timer {
		constructor(element, options) {
			if(!element || element.hasChildNodes()) return;

			this.options = {
				class: 'timer',
				types: 'd,h,m,s',
				effectClass: 'flipped',
				digitWrapper: false,
				date: 'Apr 5, 2024 15:37:25',
				...options
			}

			this.$shell = element;
			this.rest = new Date(this.options.date).getTime();
			this.types = this.options.types.split(',');
			this.diff = this.rest - new Date();
			this.interval = null;
			this.digits = {};
			this.init();
		}

		current() {
			this.diff = this.rest - new Date();
			
			const day = Math.floor(this.diff / (1000 * 60 * 60 * 24)),
				hur = Math.floor((this.diff / (1000 * 60 * 60)) % 24),
				min = Math.floor((this.diff / 1000 / 60) % 60),
				sec = Math.floor((this.diff / 1000) % 60);

			const values = { 
				d: { curr: day, next: (day == 0) ? 0 : day - 1 },
				h: { curr: hur, next: (hur == 0) ? 23 : hur - 1 }, 
				m: { curr: min, next: (min == 0) ? 59 : min - 1 }, 
				s: { curr: sec, next: (sec == 0) ? 59 : sec - 1 }
			};

			for (const val in values) {
				values[val].curr = (this.diff <= 0) ? "00" : ("0" + values[val].curr).slice(-2);
				values[val].next = (this.diff <= 0) ? "00" : ("0" + values[val].next).slice(-2);
			}

			if(this.diff <= 0) {
				this.interval = clearInterval(this.interval);

				if (typeof this.options.finished === 'function')
					this.options.finished.call(this.$shell);
			}

			return {...values };
		}

		update() {
			const values = this.current();

			for (const digit in this.digits) {
				const value = values[digit];
				const card = this.digits[digit]
				const before = getComputedStyle(card, ':before');
				const data = card.dataset;
				let timer;
				
				if (! data.timeBefore || this.diff <= 0) {
					data.timeBefore = value.next;
					data.timeAfter = value.curr;
				} else if (data.timeBefore !== value.next) {
					card.classList.add(this.options.effectClass);
					
					timer = setTimeout(() => {
						card.classList.remove(this.options.effectClass);
						data.timeBefore = value.next;
						data.timeAfter = value.curr;
						clearTimeout(timer);
					}, parseFloat(before.transitionDuration) * 1000);
				}
			}
		}

		init() {
			if (! this.$shell.classList.contains(this.options.class))
				this.$shell.classList.add(this.options.class);

			this.types.map(type => {
				const $cover = document.createElement('div');
				const $digit = document.createElement('div');
				$cover.className = `${this.options.class}__cover`;
				$digit.className = `${this.options.class}__digit`;

				if(this.options.digitWrapper) {
					$cover.append($digit);
					this.$shell.append($cover);
				} else {
					this.$shell.append($digit);
				}

				this.digits[type] = $digit;
			});

			this.update();

			if (this.diff > 0)
				this.interval = setInterval(this.update.bind(this), 1000);
		}
	}

	return new Timer(element, options);
}
