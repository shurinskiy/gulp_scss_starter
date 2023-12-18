/* 
* Простая галерея (например для детального вида продукта) 
* под главной картинкой подставляется навигация в виде превьюшек с 
* фоном от соответствующих картинок. Опционально, добавляеются 
* кнопки стрелочной навигации
* 
* @исходная разметка:
* 
<div class="someblock">
	<img src="https://source.unsplash.com/random/600x600?cats" alt="">
	<img src="https://source.unsplash.com/random/601x600?cats" alt="">
	<img src="https://source.unsplash.com/random/600x601?cats" alt="">
	<img src="https://source.unsplash.com/random/601x601?cats" alt="">
</div>
* 
* @результирующая разметка:
* 
* <div class="someblock gallery">
* 	<div class="gallery__frame">
* 		<div class="gallery__image active">
* 			<img src="https://source.unsplash.com/random/600x600?cats" alt="">
* 		</div>
* 		<div class="gallery__image">
* 			<img src="https://source.unsplash.com/random/601x600?cats" alt="">
* 		</div>
* 		<div class="gallery__image">
* 			<img src="https://source.unsplash.com/random/600x601?cats" alt="">
* 		</div>
* 		<div class="gallery__image">
* 			<img src="https://source.unsplash.com/random/601x601?cats" alt="">
* 		</div>
* 	</div>
* 	<div class="gallery__thumbs">
* 		<span class="gallery__thumb active" style="background-image: url(https://source.unsplash.com/random/600x600?cats)"></span>
* 		<span class="gallery__thumb" style="background-image: url(https://source.unsplash.com/random/601x600?cats);"></span>
* 		<span class="gallery__thumb" style="background-image: url(https://source.unsplash.com/random/600x601?cats);"></span>
* 		<span class="gallery__thumb" style="background-image: url(https://source.unsplash.com/random/601x601?cats);"></span>
* 	</div>
* 	<button class="gallery__prev"></button>
* 	<button class="gallery__next"></button>
* </div>
* 
* @вызов:
* 
import { makeGallery } from "../../js/lib";
makeGallery(document.querySelectorAll('.someblock'), { 
	class: gallery,
	navigation: true,
	render: function() {
		console.log(this);
	}
});
* 
* @параметры вызова:
* 
* class - имя класса галереи в динамически создаваемой разметке
* thumbnails - блок кликабельных превьюшек, под галереей
* navigation - включение дополнительной стрелочной навигации
* render - функция обратного вызова после создания структуры галереи
*/

export const makeGallery = (items, options = {}) => {
	class Gallery {
		constructor(item, options) {
			if(!item || !item instanceof Element) return;

			this.options = {
				class: 'gallery',
				navigation: false,
				thumbnails: true,
				...options
			};

			this.$frame = item;
			this.$items = this.$frame.querySelectorAll('img, video');
			this.$wrapper = document.createElement('div');
			this.$thumbs = document.createElement('div');
			this.$prev = document.createElement('button');
			this.$next = document.createElement('button');

			this.render();
			this.$wrapper.addEventListener('click', (e) => this.clickHandler(e));
		}
		
		render() {
			this.$wrapper.className = `${this.$frame.className} ${this.options.class}`;
			this.$thumbs.className = `${this.options.class}__thumbs`;
			this.$frame.className = `${this.options.class}__frame`;

			this.$items.forEach((item, i) => {
				let active = i ? '':'active';
				let $item = document.createElement('div');
				$item.className = `${this.options.class}__item ${active}`;
				this.$frame.append($item);
				$item.append(item);
		
				if(this.options.thumbnails) {
					let $thumb = document.createElement('span');
					let bg = item.poster || item.src;
					$thumb.className = `${this.options.class}__thumb ${active}`;
					$thumb.style.backgroundImage = `url(${bg})`;
					this.$thumbs.append($thumb);
				}
			});

			this.$frame.parentNode.append(this.$wrapper);
			this.$wrapper.append(this.$frame);
			
			if(this.options.thumbnails) {
				this.$wrapper.append(this.$thumbs);
			}

			if (this.options.navigation) {
				const $prev = document.createElement('button');
				const $next = document.createElement('button');
				$prev.className = `${this.options.class}__prev`;
				$next.className = `${this.options.class}__next`;
				this.$frame.append($prev, $next);
			}

			if (typeof this.options.render === 'function')  {
				return this.options.render.call(this.$frame);
			}

		}

		clearActive() {
			[...this.$items].map((el) => { el.parentNode.classList.remove('active') });
			[...this.$thumbs.children].map((el) => { el.classList.remove('active') });
		}

		moveActive(direction = 1) {
			let currentActive = [...this.$items].findIndex(el => el.parentNode.classList.contains('active'));
			this.clearActive();
			currentActive += direction;

			if (currentActive >= this.$items.length) {
				currentActive = 0;
			} else if(currentActive < 0) {
				currentActive = this.$items.length - 1;
			}

			this.$items[currentActive].parentNode.classList.add('active')
			this.$thumbs.children[currentActive]?.classList.add('active');
		}

		clickHandler(e) {
			// если клик по превьюшке
			if(e.target.classList.contains(`${this.options.class}__thumb`)) {
				this.clearActive();
				this.$items[[...this.$thumbs.children].findIndex(el => el == e.target)].parentNode.classList.add('active');
				e.target.classList.add('active');
			}

			// если клик по кнопке "prev"
			if (e.target.classList.contains(`${this.options.class}__prev`))
				this.moveActive(-1);

			// если клик по кнопке "next"
			if (e.target.classList.contains(`${this.options.class}__next`))
				this.moveActive(1);
		}
	}

	if(items instanceof NodeList) {
		items.forEach((item) => new Gallery(item, options));
	} else {
		return new Gallery(items, options);
	}
}