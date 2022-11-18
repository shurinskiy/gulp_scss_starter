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
	cls: gallery,
	navigation: true 
});
* 
* @параметры вызова:
* 
* cls - имя класса галереи в динамически создаваемой разметке
* navigation - включение дополнительной стрелочной навигации
*/

export const makeGallery = (items, options = {}) => {
	const cls = options.cls || 'gallery';
	const navigation = options.navigation;

	for (let i = 0; i < items.length; i++) {
		const frame = items[i];
		const images = frame.querySelectorAll('img');
		const _wrapper = document.createElement('div');
		const _thumbs = document.createElement('div');
		
		_wrapper.className = `${frame.className} ${cls}`;
		_thumbs.className = `${cls}__thumbs`;
		frame.className = `${cls}__frame`;
		
		for (let j = 0; j < images.length; j++) {
			let active = j ? '':'active';
			let _image = document.createElement('div');
			let _thumb = document.createElement('span');
			_image.className = `${cls}__image ${active}`;
			_thumb.className = `${cls}__thumb ${active}`;
			_thumb.style.backgroundImage = `url(${images[j].src})`;
			frame.append(_image);
			_image.append(images[j]);
			_thumbs.append(_thumb);
		}

		frame.parentNode.append(_wrapper);
		_wrapper.append(frame, _thumbs);

		if (navigation) {
			const _prev = document.createElement('button');
			const _next = document.createElement('button');
			_prev.className = `${cls}__prev`;
			_next.className = `${cls}__next`;
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
			if(e.target.classList.contains(`${cls}__thumb`)) {
				clearActive();
				images[[..._thumbs.children].findIndex(el => el == e.target)].parentNode.classList.add('active');
				e.target.classList.add('active');
			}

			// если клик по кнопке "prev"
			if (e.target.classList.contains(`${cls}__prev`))
				moveActive(-1);

			// если клик по кнопке "next"
			if (e.target.classList.contains(`${cls}__next`))
				moveActive(1);
		});
	}
}