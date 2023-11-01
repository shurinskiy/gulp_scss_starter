/* 
* Masonry плитка слева направо, с произвольным количеством колонок,
* с одинаковой высотой колонок.
* 
* @разметка
* 
<div class="masonry">
	<div class="masonry__item">
		<img src="./images/masonry/masonry-image-1.jpg" alt="">
	</div>
	<div class="masonry__item">
		<img src="./images/masonry/masonry-image-2.jpg" alt="">
	</div>
	<div class="masonry__item">
		<img src="./images/masonry/masonry-image-3.jpg" alt="">
	</div>
		...
</div>
* 
* @вызов
* 
import { masonryBuilder } from "../../js/libs/masonry";
masonryBuilder(document.querySelector('.masonry', {
	columns: 3, // если нет колонок в стилях
	gap: 10,	// то же..
	layout: function() {
		console.log(this.containerNode);
	}
}));
* 
* @стили (необходимый минимум)
*	.masonry {
		position: relative;
		overflow: hidden;
		column-count: 5;
		column-gap: 10px;
	}
	.masonry__item {
		overflow: hidden;

		img {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}
* 
*/

export const masonryBuilder = (element, options = {}) => {
	class Masonry {
		constructor(element, options) {
			if(!element) return;
			
			this.containerNode = element;
			this.childrenNodes = element.children;
			this.childrenData = [];

			this.options = {
				sensitivity: 150,
				columns: 4,
				gap: 5,
				...options
			}

			this.init();
		}

		setLayout() {
			const container = getComputedStyle(this.containerNode);
			const columns = parseInt(container.columnCount) || this.options.columns;
			const gap = parseInt(container.columnGap) || this.options.gap;
			const widthImage = (parseInt(container.width) - gap * (columns - 1)) / columns;
			
			this.childrenData = this.childrenData.map(child => ({
				...child,
				currentWidth: widthImage,
				currentHeight: Math.floor(widthImage * child.ratio)
			}));

			const heightColumns = Array(columns).fill(0);
			const sizeColumns = Array(columns).fill(0);

			this.childrenData.forEach((child, i) => {
				heightColumns[i % columns] += child.currentHeight + gap;
				sizeColumns[i % columns] += 1;
			});

			const minHeightColumn = Math.min(...heightColumns);
			const diffImages = heightColumns.map((heightColumn, i) => (heightColumn - minHeightColumn) / sizeColumns[i]);
			const topSets = Array(columns).fill(0);
			
			this.childrenData = this.childrenData.map((child, i) => {
				const indexColumn = i % columns;
				const left = indexColumn * widthImage + gap * indexColumn;
				const currentHeight = child.currentHeight - diffImages[indexColumn];
				const top = topSets[indexColumn];
				topSets[indexColumn] += currentHeight + gap;

				return {
					...child,
					currentHeight,
					left,
					top
				}
			});
			
			this.containerNode.style.height = `${minHeightColumn - gap}px`;
			
			this.childrenData.forEach((child) => {
				child.childNode.style.position = 'absolute';
				child.childNode.style.top = `${child.top}px`;
				child.childNode.style.left = `${child.left}px`;
				child.childNode.style.width = `${child.currentWidth}px`;
				child.childNode.style.height = `${child.currentHeight}px`;
			});

			if (typeof this.options.layout === 'function') 
				return this.options.layout.call(this);
		}

		_throttle = (fn) => {
			let timeout = null;
		
			return (...args) => {
				if (timeout === null) {
					
					timeout = setTimeout(() => {
						fn.apply(this, args);
						timeout = null;
					}, options.sensitivity)
				}
			}
		}

		init(flag = true) {
			if (flag) {
				this.childrenData = [...this.childrenNodes].map((childNode) => {
					let img = childNode.querySelector('img');
	
					return (img) ? { 
						childNode, 
						origWidth: img.naturalWidth,
						ratio: img.naturalHeight / img.naturalWidth
					} : {};
				});

				this.setLayout();
				this.handler = this._throttle(this.setLayout.bind(this));
				window.addEventListener('resize', this.handler);
			} else {
				window.removeEventListener('resize', this.handler);
				setTimeout(() => {
					[...this.childrenData].forEach((child) => child.childNode.removeAttribute('style'));
				}, options.sensitivity);
			}
		}
	}

	return new Masonry(element, options);
}