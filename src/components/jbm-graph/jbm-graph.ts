import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import solve from '../../math';

/**
 * This element graphs a given equation. Its x and y ranges can be set and customized.
 * Powered by 2DCanvas
 */
@customElement('jbm-graph')
export default class Graph extends LitElement {

  // some stuff for positioning the "lens" of the canvas
  @property() startX: number = -5;
  @property() startY: number = -3.75;
  @property() xRange: number = 10;
  @property() yRange: number = 7.5;
  // also size the camera
  @property() width: number = 300;
  @property() height: number = 150;
  // if ratio is set, size canvas according to maximum space rather than set values
  @property({ type: Number }) ratio: number | undefined;

  // the formula to render
  @property() formula: string = 'x^2';

  // style stuff, like colour
  @property() lineColour: string = 'red';
  @property() gridColour: string = 'rgba(0, 0, 0, 0.1)';
  @property() backgroundColour: string = 'white';

  @property() img: string | null = null;

  // keep track of whether the mouse is down to allow clicking to drag
  isMouseDown: boolean = false;
  _lastMouseX: number = -1;
  _lastMouseY: number = -1;
  _bindedMouseUp!: Function;
  _bindedMouseMove!: Function;

  // get a reference to the canvas for rendering
  // @ts-ignore
  @query('canvas') canvas: HTMLCanvasElement;
  // @ts-ignore
  gl: CanvasRenderingContext2D;

  // set the styles
  static styles = css`
    figure {
      display: inline-block;
      margin: 0;
      width: 100%;
    }
    canvas.fill {
      width: 100%;
    }
    canvas {
      box-shadow: 0 4px 16px rgba(127, 153, 150, 0.3);
      z-index: 1;
      position: relative;
      border-radius: 32px;
    }
  `;

  /**
   * When the document is created, the canvas should be written to.
   */
  firstUpdated () {

    // @ts-ignore
    this.gl = this.canvas.getContext('2d');

    // keep track of some mouse stuff to allow clicking and dragging
    // mouse should have to be clicked on the canvas, but moving and releasing can be anywhere
    this.canvas.addEventListener('mousedown', this.mouseDown.bind(this));

    this._bindedMouseUp = this.mouseUp.bind(this);
    this._bindedMouseMove = this.mouseMove.bind(this);

    // @ts-ignore
    addEventListener('mouseup', this._bindedMouseUp);
    // @ts-ignore
    addEventListener('mousemove', this._bindedMouseMove);

  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // @ts-ignore
    removeEventListener('mouseup', this._bindedMouseUp);
    // @ts-ignore
    removeEventListener('mousemove', this._bindedMouseMove);
  }

  // mouse up has to work anywhere

  // keep track of whether mouse is up or down
  mouseDown (event: MouseEvent) { this.isMouseDown = true; this._lastMouseX = event.clientX; this._lastMouseY = event.clientY }
  mouseUp () { this.isMouseDown = false; }
  mouseMove (event: MouseEvent) {

    // only do anything if the mouse is down
    if (this.isMouseDown) {

      // find out how many pixels per 1 on the grid
      const pixelsPerPointX = this.canvas.width / this.xRange;
      const pixelsPerPointY = this.canvas.height / this.yRange;

      // how much to adjust the canvas
      const moveX = (event.clientX - this._lastMouseX) / pixelsPerPointX;
      const moveY = (event.clientY - this._lastMouseY) / pixelsPerPointY;

      this.startX -= moveX;
      this.startY += moveY;

      // update the last mouse position for next time
      this._lastMouseX = event.clientX;
      this._lastMouseY = event.clientY;

    }

  }

  updated () {

    // if ratio, set the width and height properties
    if (this.ratio !== undefined) {
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.width / this.ratio;
    }

    // render
    this.gl.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawLine();

  }

  /**
   * draws a grid onto the canvas
   */
  drawGrid () {

    // find out how many pixels per 1 on the grid
    const pixelsPerPointX = this.canvas.width / this.xRange;
    const pixelsPerPointY = this.canvas.height / this.yRange;

    // draw with light grey
    this.gl.strokeStyle = this.gridColour;
    this.gl.lineWidth = 1;

    const adjustX = (this.startX % 1) * pixelsPerPointX; 
    const adjustY = (this.startY % 1) * pixelsPerPointY;

    // render all the squares
    for (let x = -1; x < this.xRange + 1; x++) {

      // if this line is at 0, make it black. Otherwise, light grey
      if (Math.ceil(this.startX) + x === 0) {
        this.gl.strokeStyle = "rgba(0, 0, 0, 0.5)";
      } else {
        this.gl.strokeStyle = this.gridColour;
      }

      this.gl.beginPath();
      this.gl.rect(x * pixelsPerPointX - adjustX, 0, 1, this.canvas.height);
      this.gl.stroke();

    }

    for (let y = -1; y < this.yRange + 1; y++) {

      // if this line is at 0, make it black. Otherwise, light grey
      if (Math.round(this.startY + this.yRange) - y + 1 === 0) {
        this.gl.strokeStyle = "rgba(0, 0, 0, 0.5)";
      } else {
        this.gl.strokeStyle = this.gridColour;
      }

      this.gl.beginPath();
      this.gl.rect(0, y * pixelsPerPointY + adjustY, this.canvas.width, 1);
      this.gl.stroke();

    }

  }

  /**
   * Draw the line on the graph using the solve method
   */
  drawLine () {

    // draw with red
    this.gl.strokeStyle = this.lineColour;
    this.gl.lineWidth = 4;

    // find out how many pixels per 1 on the grid
    const pixelsPerPointX = this.canvas.width / this.xRange;
    const pixelsPerPointY = this.canvas.height / this.yRange;

    // set up the line for drawing
    // @ts-ignore
    this.gl.moveTo(0, this.canvas.height - (solve(this.formula, this.startX) - this.startY) * pixelsPerPointY);
    this.gl.beginPath();

    // keep track of whether the pen is down
    let penDown = true;

    for (let x = this.startX; x < (this.startX + this.xRange); x += (this.xRange / this.canvas.width)) {

      // if y at this position is undefined, then don't draw anything, start a new stroke for next time.
      const result = solve(this.formula, x);

      if (result > this.startY + this.yRange || result < this.startY - 2) {

        // the line is outside of the visible area, so just ignore it for now
        // take the pen up if its down
        if (penDown) {
          this.gl.lineTo((x - this.startX) * pixelsPerPointX, this.canvas.height - (solve(this.formula, x) - this.startY) * pixelsPerPointY);
          this.gl.stroke();
          penDown = false;
        }
        // and then move to position
        this.gl.moveTo((x - this.startX) * pixelsPerPointX, this.canvas.height - (solve(this.formula, x) - this.startY) * pixelsPerPointY);

      } else {

        // add to the line!
        // start a line if the pen isn't down
        if (!penDown) {
          this.gl.beginPath();
          penDown = true;
        }

        this.gl.lineTo((x - this.startX) * pixelsPerPointX, this.canvas.height - (solve(this.formula, x) - this.startY) * pixelsPerPointY);
      }

    }

    this.gl.stroke();

  }

  render () {

    return html`
      <figure>
        <canvas class="${this.ratio ? "fill" : ''}" width=${this.width} height=${this.height}></canvas>
        <figcaption>${this.img ? html`<img src="${this.img}">` : ''}</figcaption>
      </figure>
    `;

  }

}