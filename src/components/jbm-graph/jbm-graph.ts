import { LitElement, html } from 'lit';
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
  @property() startY: number = -2;
  @property() xRange: number = 10;
  @property() yRange: number = 4;

  // the formula to render
  @property() formula: string = 'x^2';

  // get a reference to the canvas for rendering
  // @ts-ignore
  @query('canvas') canvas: HTMLCanvasElement;
  // @ts-ignore
  gl: CanvasRenderingContext2D;

  /**
   * When the document is created, the canvas should be written to.
   */
  firstUpdated () {

    // @ts-ignore
    this.gl = this.canvas.getContext('2d');

  }

  updated () {

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

    console.log(pixelsPerPointX, pixelsPerPointY);

    // draw with light grey
    this.gl.strokeStyle = '#e3e3e3';
    this.gl.lineWidth = 1;

    // render all the squares
    for (let x = 0; x < this.xRange; x++) {

      for (let y = 0; y < this.yRange; y++) {

        this.gl.beginPath();
        this.gl.rect(x * pixelsPerPointX, y * pixelsPerPointY, pixelsPerPointX, pixelsPerPointY);
        this.gl.stroke();

      }

    }

  }

  /**
   * Draw the line on the graph using the solve method
   */
  drawLine () {

    // draw with red
    this.gl.strokeStyle = 'red';
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

      console.log(x, result);
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
        <canvas></canvas>
        <figcaption>${this.formula}</figcaption>
      </figure>
    `;

  }

}