const helpers = {
    loadStyle: (url) => {
    const styleTag = document.createElement('link');
    styleTag.setAttribute('rel', 'stylesheet');
    styleTag.setAttribute('href', url);
    document.head.appendChild(styleTag);
    return styleTag;
  }
};

class Presentation {

  constructor(element, options) {

    this.element = element;

    this.options = {
      slideGroupSelector: 'h1, .slide-group',
      slideStartSelector: 'h2, .slide',
      stepContentSelector: 'h3, h4, h5, h6, li, p, pre',
      slideGroupClass: 'slide-group',
      slideClass: 'slide',
      junkClass: 'junk',
      slideGroupHiddenClass: 'hidden',
      slideHiddenClass: 'hidden',
      contentHiddenClass: 'hidden',
      fontSize: '40px',
      position: 0
    };

    if (options) {
      this.overrideOptions(options);
    }

    this.el = this.parseDom(element);

    element.appendChild(this.el);

    this.showSlideAtIndex(this.el, this.options.position, false);

    this.bindControls();
  }

  overrideOptions(options) {
    for (let key of options) {
      if (key in this.options) {
        this.options[key] = options[key];
      }
    }
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
      if (childElement.nodeType === Node.ELEMENT_NODE) {
        if (childElement.matches(this.options.slideGroupSelector)) {
          parentElement = slideGroup = makeSlideGroup(presentationEl);
        } else if (childElement.matches(this.options.slideStartSelector)) {
          parentElement = slide = makeSlide(slideGroup);
        }
      }

      parentElement.appendChild(childElement);
    }

    return presentationEl;
  }

  showSlideAtIndex(element, index, contentVisible = true) {
    for (let i = 0; i < this.slides.length; i++) {
      if (i !== index) {
        this.slides[i].classList.add(this.options.slideHiddenClass);
        this.slides[i].parentElement.classList.add(this.options.slideGroupHiddenClass);
      }
    }

    this.slides[index].classList.remove(this.options.slideHiddenClass);
    this.slides[index].parentElement.classList.remove(this.options.slideGroupHiddenClass);

    this.toggleAllContentOnSlide(this.slides[index], contentVisible);
  }

  previousSlide(contentVisible = true) {
    if (this.options.position > 0) {
      this.options.position--;
      this.showSlideAtIndex(this.el, this.options.position, contentVisible);
    }
  }

  nextSlide(contentVisible = true) {
    if (this.options.position < this.slides.length - 1) {
      this.options.position++;
      this.showSlideAtIndex(this.slides, this.options.position, contentVisible);
    }
  }

  toggleAllContentOnSlide(slide, visible) {
    const stepContentElements = slide.querySelectorAll(this.options.stepContentSelector);

    const classOperation = visible ? 'remove' : 'add';
    for (let i = 0; i < stepContentElements.length; i++) {
      stepContentElements[i].classList[classOperation](this.options.contentHiddenClass);
    }
  }

  hideLastVisibleElement() {
    const currentSlide = this.slides[this.options.position];
    const visibleStepContentSelector = this.options.stepContentSelector
      .replace(/(,|$)/g, ':not(.' + this.options.contentHiddenClass + ')$1');
    const allVisibleElements = currentSlide.querySelectorAll(visibleStepContentSelector);
    const lastVisibleElement = allVisibleElements[allVisibleElements.length - 1];

    if (lastVisibleElement) {
      lastVisibleElement.classList.add(this.options.contentHiddenClass);
    } else {
      this.previousSlide();
    }
  }

  showNextHiddenElement() {
    const currentSlide = this.slides[this.options.position];
    const hiddenStepContentSelector = this.options.stepContentSelector
      .replace(/(,|$)/g, '.' + this.options.contentHiddenClass + '$1');
    const nextHiddenElement = currentSlide.querySelector(hiddenStepContentSelector);

    if (nextHiddenElement) {
      nextHiddenElement.classList.remove(this.options.contentHiddenClass);
    } else {
      this.nextSlide(false);
    }
  }

  adjustFontSize(element, direction) {
    if (direction === 0) {
      document.body.style.fontSize = '';
    } else {
      const currentFontSize = getComputedStyle(document.body).fontSize;
      document.body.style.fontSize = (parseFloat(currentFontSize, 10) + direction) + 'px';
    }
  }

  bindControls() {
    const controls = {
      ArrowUp: () => this.hideLastVisibleElement(),
      ArrowDown: () => this.showNextHiddenElement(),
      ArrowLeft: () => this.previousSlide(),
      ArrowRight: () => this.nextSlide(),
      'Control+Shift++': () => this.adjustFontSize(this.element, 1),
      'Control+Shift+_': () => this.adjustFontSize(this.element, -1),
      'Control+Shift+)': () => this.adjustFontSize(this.element, 0)
    };
    document.body.addEventListener('keydown', event => {
      let keyTerms = [];
      if (event.metaKey) keyTerms.push('Meta');
      if (event.ctrlKey) keyTerms.push('Control');
      if (event.altKey) keyTerms.push('Alt');
      if (event.shiftKey) keyTerms.push('Shift');
      if (keyTerms.indexOf(event.key) === -1) {
        keyTerms.push(event.key);
      }
      const keyDescription = keyTerms.join('+');
      console.log(keyDescription);
      if (keyDescription in controls) {
        event.preventDefault();
        controls[keyDescription](event);
      }
    });
  }

}

document.addEventListener('DOMContentLoaded', () => {
  helpers.loadStyle('style.css');

  window.presentation = new Presentation(document.body);
});
