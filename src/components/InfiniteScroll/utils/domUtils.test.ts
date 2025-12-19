import { findCurrentArticleIndex, getAllFocusableElements, isElementVisible } from './domUtils';

describe('domUtils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('getAllFocusableElements', () => {
    it('should return all focusable elements in the document', () => {
      document.body.innerHTML = `
        <a href="#">Link</a>
        <button>Button</button>
        <input type="text" />
        <select><option>Option</option></select>
        <textarea></textarea>
        <div tabindex="0">Focusable div</div>
        <div tabindex="-1">Not focusable</div>
        <button disabled>Disabled button</button>
      `;

      const focusableElements = getAllFocusableElements();

      expect(focusableElements.length).toBeGreaterThan(0);
      expect(focusableElements.some((el) => el.tagName === 'A')).toBe(true);
      expect(focusableElements.some((el) => el.tagName === 'BUTTON' && !el.hasAttribute('disabled'))).toBe(true);
      expect(focusableElements.some((el) => el.tagName === 'INPUT')).toBe(true);
      expect(focusableElements.some((el) => el.tagName === 'SELECT')).toBe(true);
      expect(focusableElements.some((el) => el.tagName === 'TEXTAREA')).toBe(true);
    });

    it('should not include disabled buttons', () => {
      document.body.innerHTML = '<button disabled>Disabled</button>';
      const focusableElements = getAllFocusableElements();
      const disabledButton = Array.from(focusableElements).find((el) => el.hasAttribute('disabled'));
      expect(disabledButton).toBeUndefined();
    });

    it('should not include elements with tabindex="-1"', () => {
      document.body.innerHTML = '<div tabindex="-1">Not focusable</div>';
      const focusableElements = getAllFocusableElements();
      const negativeTabindex = Array.from(focusableElements).find((el) => el.getAttribute('tabindex') === '-1');
      expect(negativeTabindex).toBeUndefined();
    });
  });

  describe('isElementVisible', () => {
    it('should return true for visible elements', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      expect(isElementVisible(element)).toBe(true);
    });

    it('should return false for elements with display: none', () => {
      const element = document.createElement('div');
      element.style.display = 'none';
      document.body.appendChild(element);

      expect(isElementVisible(element)).toBe(false);
    });

    it('should return false for elements with visibility: hidden', () => {
      const element = document.createElement('div');
      element.style.visibility = 'hidden';
      document.body.appendChild(element);

      expect(isElementVisible(element)).toBe(false);
    });

    it('should return false for elements with opacity: 0', () => {
      const element = document.createElement('div');
      element.style.opacity = '0';
      document.body.appendChild(element);

      expect(isElementVisible(element)).toBe(false);
    });

    it('should return false for elements with aria-hidden="true"', () => {
      const element = document.createElement('div');
      element.setAttribute('aria-hidden', 'true');
      document.body.appendChild(element);

      expect(isElementVisible(element)).toBe(false);
    });

    it('should return true for elements with aria-hidden="false"', () => {
      const element = document.createElement('div');
      element.setAttribute('aria-hidden', 'false');
      document.body.appendChild(element);

      expect(isElementVisible(element)).toBe(true);
    });
  });

  describe('findCurrentArticleIndex', () => {
    it('should return -1 if activeElement is not an HTMLElement', () => {
      const articles = [document.createElement('article')];
      expect(findCurrentArticleIndex(null, articles)).toBe(-1);
    });

    it('should return the index when activeElement is itself an article', () => {
      const article1 = document.createElement('article');
      const article2 = document.createElement('article');
      const article3 = document.createElement('article');
      const articles = [article1, article2, article3];

      expect(findCurrentArticleIndex(article2, articles)).toBe(1);
    });

    it('should return the index of the article containing the active element', () => {
      const article1 = document.createElement('article');
      const article2 = document.createElement('article');
      const button = document.createElement('button');
      article2.appendChild(button);
      const articles = [article1, article2];

      expect(findCurrentArticleIndex(button, articles)).toBe(1);
    });

    it('should return -1 if the element is not in any article', () => {
      const article = document.createElement('article');
      const button = document.createElement('button');
      const articles = [article];

      expect(findCurrentArticleIndex(button, articles)).toBe(-1);
    });

    it('should return -1 for empty articles array', () => {
      const button = document.createElement('button');
      expect(findCurrentArticleIndex(button, [])).toBe(-1);
    });
  });


});
