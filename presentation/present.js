const helpers = {
	loadStyle: (url) => {
		const styleTag = document.createElement('link');
		styleTag.setAttribute('rel', 'stylesheet');
		styleTag.setAttribute('href', url);
		document.head.appendChild(styleTag);
		return styleTag;
	},
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
			fontSize: '40px',
			position: 0,
			contentPosition: 0
		};

		this.options = JSON.parse(JSON.stringify(this.defaultOptions)); // defaults by value

		if (options) {
			this.overrideOptions(options);
		}

		this.setFontSize(element, this.options.fontSize)

		const presentationElement = this.parseDom(element);

		element.appendChild(presentationElement);

		this.showSlideAtIndex(this.slides, this.options.position, this.options.contentPosition);

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

	overrideOptions(options) {
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
			this.overrideOptions({contentPosition: visibleContentElements});
		}
	}

	goToSlide(index, contentVisible = true) {
		this.overrideOptions({position: index});
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

		for (let i = 0; i < stepContentElements.length; i++) {
			const visible = contentPositionOrVisibility === true || (
				contentPositionOrVisibility !== false &&
				i < contentPositionOrVisibility
			);
			if (visible) visibleCount++;
			const classOperation = visible ? 'remove' : 'add';
			stepContentElements[i].classList[classOperation](this.options.contentHiddenClass);
		}

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
			this.overrideOptions({contentPosition: this.options.contentPosition - 1});
			const currentSlide = this.slides[this.options.position];
			this.toggleAllContentOnSlide(currentSlide, this.options.contentPosition);
		}
	}

	showNextHiddenElement() {
		const currentSlide = this.slides[this.options.position];
		const visibleContentElements = this.toggleAllContentOnSlide(currentSlide, this.options.contentPosition + 1);
		if (visibleContentElements !== this.options.contentPosition) {
			this.overrideOptions({contentPosition: visibleContentElements});
		}
	}

	hideAllContent() {
		const currentSlide = this.slides[this.options.position];
		const visibleContentElements = this.toggleAllContentOnSlide(currentSlide, false);
		this.overrideOptions({contentPosition: visibleContentElements});
	}

	showAllContent() {
		const currentSlide = this.slides[this.options.position];
		const visibleContentElements = this.toggleAllContentOnSlide(currentSlide, true);
		this.overrideOptions({contentPosition: visibleContentElements});
	}

	setFontSize(element, fontSize) {
		this.overrideOptions({fontSize: fontSize});
		element.style.fontSize = this.options.fontSize;
	}

	adjustFontSize(element, direction) {
		const fontSize = (parseFloat(this.options.fontSize, 10) + direction) + 'px';
		this.setFontSize(element, fontSize);
	}

	bindControls(element) {
		let controls = {
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
			Home: () => this.goToSlide(0),
			End: () => this.goToSlide(this.slides.length - 1)
		};

		// aliases
		controls['Shift+ArrowLeft'] = controls.ArrowLeft; // so that one is not punished for holding the shift key
		controls['Control+Shift+_'] = controls['Control+Shift+-'];
		controls['Control+Shift+)'] = controls['Control+Shift+0'];

		element.addEventListener('keydown', event => {
			let keyTerms = [];
			if (event.metaKey) keyTerms.push('Meta');
			if (event.ctrlKey) keyTerms.push('Control');
			if (event.altKey) keyTerms.push('Alt');
			if (event.shiftKey) keyTerms.push('Shift');
			if (keyTerms.indexOf(event.key) === -1) {
				keyTerms.push(event.key);
			}
			const keyDescription = keyTerms.join('+');
			// console.log(keyDescription);
			if (keyDescription in controls) {
				event.preventDefault();
				controls[keyDescription](event);
			}
		});
	}

}

document.addEventListener('DOMContentLoaded', () => {
	helpers.loadStyle('style.css');

	window.presentation = new Presentation(
		document.body,
		Presentation.getState(window.location.hash)
	);
});
