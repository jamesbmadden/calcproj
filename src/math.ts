/**
 * all the functions for computing math stuff
 */

/**
 * given an equation as a string and an x value, calculate the result
 * @param eq The equation to solve, as a string
 * @param x The value of x to use
 * @returns {number} The resulting number, if solvable.
 */
export default function solve (eq: string, x: number): number {

  // convert the equation to a usable expression
  // first, any ^ with the javascript exponent thing, then x with the value
  const ex = eq.replaceAll('^', '**').replaceAll('x', `(${x})`);

  // now evaluate
  const result: number = eval(ex);

  return result;

}