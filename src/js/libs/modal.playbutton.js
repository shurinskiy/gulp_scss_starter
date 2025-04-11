export const playbutton = {
	name: 'playbutton',

	init(modal) {
		this.setPlayButton = (content, video) => {
			let play = content.querySelector('.modal__play');
	
			if (!! video?.canPlayType) {
				video.controls = true;
				play ||= document.createElement('button');
				play.className = 'modal__play';
				play.addEventListener('click', (e) => video.play());
				content.append(play);
	
				['pause', 'ended', 'playing'].forEach((event) => {
					video.addEventListener(event, (e) => {
						play.classList.toggle('playing', !(video.paused || video.ended));
					});
				});
			} else {
				content.querySelectorAll('video').forEach((video) => video.pause());
				play?.remove();
			}
		}
	},
	
	open(modal, el) {
		const { content, slideshow, props } = modal;
		const active = slideshow ? `.${props.slideshow?.classActive}` : '';
		
		this.setPlayButton(content, content.querySelector(`video${active}`));
	},
	
	move(modal) {
		const { content, props } = modal;
		const active = `.${props.slideshow?.classActive}`;
		
		this.setPlayButton(content, content.querySelector(`video${active}`));
	}
}