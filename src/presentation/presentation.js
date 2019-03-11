const helpers = {
	// loadStyle: (url) => {
	// 	const styleTag = document.createElement('link');
	// 	styleTag.setAttribute('rel', 'stylesheet');
	// 	styleTag.setAttribute('href', url);
	// 	document.head.appendChild(styleTag);
	// 	return styleTag;
	// },
	getOffsetFromSlide: (slide, element) => {
		let offset = {
			top: 0,
			left: 0
		};
		while (element && element !== slide) {
			offset.top += element.offsetTop;
			offset.left += element.offsetLeft;
			element = element.offsetParent;
		}
		return offset;
	},
	showModal: (content, parent = null) => {
		const modal = document.createElement('div');
		modal.className = 'modal-container';

		const closeButton = document.createElement('div');
		closeButton.className = 'modal-close';
		closeButton.addEventListener('click', () => {
			helpers.hideModal(modal);
		});
		modal.appendChild(closeButton);

		const modalContent = document.createElement('div');
		modalContent.innerHTML = content;
		modalContent.className = 'modal-content';
		modal.appendChild(modalContent);

		parent = parent || document.body;
		parent && parent.appendChild(modal);

		return modal;
	},
	hideModal: (element) => {
		element = element || document.querySelector('.modal-container');
		if (element && element.parentElement) {
			element.parentElement.removeChild(element);
		}
	}
};

class Presentation {

	constructor(element, options) {
		this.defaultOptions = {
			slideGroupSelector: 'h1, .slide-group',
			slideStartSelector: 'h2, .slide',
			stepContentSelector: 'h3, h4, h5, h6, li, p, pre, img, tr',
			dropElementsSelector: 'p.caption',
			slideGroupClass: 'slide-group',
			slideGroupFullyVisibleClass: 'fully-visible',
			slideClass: 'slide',
			junkClass: 'junk',
			slideGroupHiddenClass: 'hidden',
			slideHiddenClass: 'hidden',
			contentHiddenClass: 'hidden',
			hideMouseClass: 'hide-mouse',
			fontSize: '29px',
			debug: false,
			position: 0,
			contentPosition: 0
		};

		this.options = JSON.parse(JSON.stringify(this.defaultOptions)); // defaults by value

		if (options) {
			this.setOptions(options);
		}

		this.setFontSize(element, this.options.fontSize)

		const presentationElement = this.parseDom(element);

		element.appendChild(presentationElement);

		this.updateSlidePerState();

		this.bindControls(document.body);
	}

	static getState(hash) {
		let stateObject = null;

		const bareHash = hash.replace(/^#/, '');
		const decodedHash = decodeURIComponent(bareHash);
		try {
			stateObject = JSON.parse(decodedHash);
		} catch(ignore) {}

		return stateObject;
	}

	static setState(stateObject) {
		let hash = '';

		if (stateObject && Object.keys(stateObject).length > 0) {
			hash = '#' + encodeURIComponent(JSON.stringify(stateObject));
		}

		history.replaceState(stateObject, 'presentation', hash);
	}

	setOptions(options) {
		let overrides = {};

		for (let key in this.options) {
			if (key in options) {
				this.options[key] = options[key];
			}

			if (this.options[key] !== this.defaultOptions[key]) {
				overrides[key] = this.options[key];
			}
		}

		Presentation.setState(overrides);
	}

	updateSlidePerState() {
		this.showSlideAtIndex(this.slides, this.options.position, this.options.contentPosition);
	}

	parseDom(element) {
		this.slides = [];
		let presentationEl = document.createElement('div');

		const makeSlideGroup = (parent) => {
			let newSlideGroup = document.createElement('div');
			newSlideGroup.classList.add(this.options.slideGroupClass);
			parent.appendChild(newSlideGroup);
			return newSlideGroup;
		};

		const makeSlide = (parent) => {
			let newSlide = document.createElement('div');
			newSlide.classList.add(this.options.slideClass);
			parent.appendChild(newSlide);
			this.slides.push(newSlide);
			return newSlide;
		};

		let parentElement = makeSlideGroup(presentationEl);
		let slideGroup, slide;
		while (element.firstChild) {
			const childElement = element.firstChild;
			if (childElement.nodeType === Node.ELEMENT_NODE && !childElement.matches(this.options.dropElementsSelector)) {
				if (childElement.matches(this.options.slideGroupSelector)) {
					parentElement = slideGroup = makeSlideGroup(presentationEl);
				} else if (childElement.matches(this.options.slideStartSelector)) {
					parentElement = slide = makeSlide(slideGroup);
					if (!childElement.innerText) {
						slide.setAttribute('x-no-header', true);
					}
				}
			}

			parentElement.appendChild(childElement);
		}

		if (slide.parentElement !== slideGroup) {
			// This group has now slides yet
			slide = makeSlide(slideGroup);
		}

		return presentationEl;
	}

	/**
	 * @param contentPositionOrVisibility either boolean or number
	 */
	showSlideAtIndex(element, index, contentPositionOrVisibility) {
		for (let i = 0; i < this.slides.length; i++) {
			if (i !== index) {
				this.slides[i].classList.add(this.options.slideHiddenClass);
				this.slides[i].parentElement.classList.add(this.options.slideGroupHiddenClass);
			}
		}

		this.slides[index].classList.remove(this.options.slideHiddenClass);
		this.slides[index].parentElement.classList.remove(this.options.slideGroupHiddenClass);

		const visibleContentElements = this.toggleAllContentOnSlide(this.slides[index], contentPositionOrVisibility);
		if (typeof contentPositionOrVisibility === 'boolean') {
			this.setOptions({contentPosition: visibleContentElements});
		}
	}

	goToSlide(index, contentVisible = true) {
		this.setOptions({position: index});
		this.showSlideAtIndex(this.slides, this.options.position, contentVisible);
	}

	previousSlide(contentVisible = true) {
		if (this.options.position > 0) {
			this.goToSlide(this.options.position - 1, contentVisible);
		}
	}

	nextSlide(contentVisible = true) {
		if (this.options.position < this.slides.length - 1) {
			this.goToSlide(this.options.position + 1, contentVisible);
		}
	}

	/**
	 * @param contentPositionOrVisibility either boolean or number
	 * @return count of visible elements
	 */
	toggleAllContentOnSlide(slide, contentPositionOrVisibility) {
		let visibleCount = 0;
		const stepContentElements = slide.querySelectorAll(this.options.stepContentSelector);

		if (!contentPositionOrVisibility && slide.hasAttribute('x-no-header')) {
			contentPositionOrVisibility = 1;
		}

		for (let i = 0; i < stepContentElements.length; i++) {
			const visible = contentPositionOrVisibility === true || (
				contentPositionOrVisibility !== false &&
				i < contentPositionOrVisibility
			);
			if (visible) visibleCount++;
			const classOperation = visible ? 'remove' : 'add';
			stepContentElements[i].classList[classOperation](this.options.contentHiddenClass);
		}
		if (this.options.debug) console.log(visibleCount);

		let scrollOptions = {
			left: 0,
			top: 0,
			behavior: 'smooth'
		};
		if (visibleCount > 0) {
			const bottomElement = stepContentElements[visibleCount - 1];
			const scrollPadding = parseFloat(this.options.fontSize, 10) * 3;
			scrollOptions.top = helpers.getOffsetFromSlide(slide, bottomElement).top + bottomElement.offsetHeight - slide.offsetHeight + scrollPadding;
		}
		slide.parentElement.classList[visibleCount === stepContentElements.length ? 'add' : 'remove'](this.options.slideGroupFullyVisibleClass);
		slide.scrollTo(scrollOptions);

		return visibleCount;
	}

	hideLastVisibleElement() {
		if (this.options.contentPosition > 0) {
			this.setOptions({contentPosition: this.options.contentPosition - 1});
			const currentSlide = this.slides[this.options.position];
			this.toggleAllContentOnSlide(currentSlide, this.options.contentPosition);
		}
	}

	showNextHiddenElement() {
		const currentSlide = this.slides[this.options.position];
		const visibleContentElements = this.toggleAllContentOnSlide(currentSlide, this.options.contentPosition + 1);
		if (visibleContentElements !== this.options.contentPosition) {
			this.setOptions({contentPosition: visibleContentElements});
		}
	}

	hideAllContent() {
		const currentSlide = this.slides[this.options.position];
		const visibleContentElements = this.toggleAllContentOnSlide(currentSlide, false);
		this.setOptions({contentPosition: visibleContentElements});
	}

	showAllContent() {
		const currentSlide = this.slides[this.options.position];
		const visibleContentElements = this.toggleAllContentOnSlide(currentSlide, true);
		this.setOptions({contentPosition: visibleContentElements});
	}

	setFontSize(element, fontSize) {
		this.setOptions({fontSize: fontSize});
		element.style.fontSize = this.options.fontSize;
	}

	adjustFontSize(element, direction) {
		const fontSize = (parseFloat(this.options.fontSize, 10) + direction) + 'px';
		this.setFontSize(element, fontSize);
	}

	showHelp(element) {
		// TODO: derive from actual control assignments, by including descriptions when binding.
		const keyboardShortcuts = [
			[['?'], 'Show this help'],
			[['Escape'], 'Close this window.'],
			[['ArrowUp'], 'hideLastVisibleElement'],
			[['ArrowDown'], 'showNextHiddenElement'],
			[['ArrowLeft'], 'previousSlide'],
			[['ArrowRight'], 'nextSlide: contents hidden'],
			[['Shift', 'ArrowUp'], 'hideAllContent'],
			[['Shift', 'ArrowDown'], 'showAllContent'],
			[['Shift', 'ArrowRight'], 'nextSlide'],
			[['Control', 'Shift', '+'], 'adjustFontSize +1'],
			[['Control', 'Shift', '-'], 'adjustFontSize -1'],
			[['Control', 'Shift', '0'], 'adjustFontSize default'],
			[['Home'], 'Go to first slide'],
			[['End'], 'Go to last slide']
		];
		let helpMarkup = '<table><thead><tr><td>Key</td><td>Action</td></tr></thead><tbody>';
		keyboardShortcuts.forEach(binding => {
			const keyMarkup = binding[0]
				.map(key => {
					return `<key>${key}</key>`;
				})
				.join(' + ');
			helpMarkup += `<tr><td>${keyMarkup}</td><td>${binding[1]}</td></tr>`;
		});
		helpMarkup += '</tbody></table>';
		helpers.hideModal();
		helpers.showModal(helpMarkup, element);
	}

	hideHelp() {
		helpers.hideModal();
	}

	bindControls(element) {
		let controls = {
			'?': () => this.showHelp(element),
			Escape: () => this.hideHelp(),
			ArrowUp: () => this.hideLastVisibleElement(),
			ArrowDown: () => this.showNextHiddenElement(),
			ArrowLeft: () => this.previousSlide(),
			ArrowRight: () => this.nextSlide(false),
			'Shift+ArrowUp': () => this.hideAllContent(),
			'Shift+ArrowDown': () => this.showAllContent(),
			'Shift+ArrowRight': () => this.nextSlide(), // don't hide content
			'Control+Shift++': () => this.adjustFontSize(element, 1),
			'Control+Shift+-': () => this.adjustFontSize(element, -1),
			'Control+Shift+0': () => this.setFontSize(element, this.defaultOptions.fontSize),
			Home: () => this.goToSlide(0, false),
			End: () => this.goToSlide(this.slides.length - 1),
		};

		// aliases
		controls['Shift+ArrowLeft'] = controls.ArrowLeft; // so that one is not punished for holding the shift key
		controls['Control+Shift+_'] = controls['Control+Shift+-'];
		controls['Control+Shift+)'] = controls['Control+Shift+0'];
		controls['Control+Shift+='] = controls['Control+Shift++'];
		controls['Shift+?'] = controls['?'];
		controls.PageUp = controls.ArrowLeft;
		controls.PageDown = controls['Shift+ArrowRight'];

		element.addEventListener('keydown', event => {
			element.classList.add(this.options.hideMouseClass);
			let keyTerms = [];
			if (event.metaKey) keyTerms.push('Meta');
			if (event.ctrlKey) keyTerms.push('Control');
			if (event.altKey) keyTerms.push('Alt');
			if (event.shiftKey) keyTerms.push('Shift');
			if (keyTerms.indexOf(event.key) === -1) {
				keyTerms.push(event.key);
			}
			const keyDescription = keyTerms.join('+');
			if (this.options.debug) console.log(keyDescription);
			if (keyDescription in controls) {
				event.preventDefault();
				controls[keyDescription](event);
			}
		});

		element.addEventListener('mousemove', event => {
			element.classList.remove(this.options.hideMouseClass);
		});

		const handleInternalLink = event => {
			event.preventDefault();
			const newState = Presentation.getState(event.target.getAttribute('href'));
			if (newState) {
				this.setOptions(newState);
				this.updateSlidePerState();
			}
		};

		const internalLinks = element.querySelectorAll('a[href^="#"]');
		if (internalLinks && internalLinks.length > 0) {
			internalLinks.forEach(link => {
				link.addEventListener('click', handleInternalLink);
			});
		}

		this.controls = controls; // to enable live debugging
	}

}

document.addEventListener('DOMContentLoaded', () => {
	// helpers.loadStyle('style.css'); // concat'd in build script

	window.presentation = new Presentation(
		document.body,
		Presentation.getState(window.location.hash)
	);

	window.debug = () => {
		window.presentation.setOptions({debug: !presentation.options.debug});
	}
});
