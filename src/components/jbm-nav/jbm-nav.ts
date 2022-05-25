import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * This element graphs a given equation. Its x and y ranges can be set and customized.
 * Powered by 2DCanvas
 */
@customElement('jbm-nav')
export default class Nav extends LitElement {

  // which page is currently selected
  @property({ type: Number }) page = 1;

  static styles = css`
    nav {
      width: 96px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    button {
      position: relative;
      width: 64px;
      height: 64px;
      box-shadow: 0 8px 16px rgba(127, 153, 150, 0.6);
      background: #ebfffe;
      border: solid 2px #abcfcb;
      border-radius: 16px;
      transform: scale(0.9);
      opacity: 0.5;
      transition: opacity 0.2s, transform 0.2s;
      cursor: pointer;
      font-size: 20px;
    }
    /**
     * Disabled button is the active page
    */
    button:disabled {
      transform: scale(1);
      opacity: 1;
      cursor: default;
      border: solid 2px #80cbc4;
    }
    button:not(:disabled):hover {
      transform: scale(1) rotate(10deg);
      opacity: 1;
    }
    button:first-child {
      margin-bottom: 1rem;
    }
  `;

  render () {

    return html`
      <nav>
        <button ?disabled=${this.page === 1}>I</button>
        <button ?disabled=${this.page === 2}>II</button>
      </nav>
    `;

  }

}