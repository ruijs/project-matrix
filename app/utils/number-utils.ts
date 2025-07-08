export function roundWithPrecision(number: number, precision: number) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

/**
 * If two numbers are equal within a specified precision.
 * This is useful for comparing floating-point numbers where precision matters.
 * @param a - The first number to compare.
 * @param b - The second number to compare.
 * @param precision - The number of decimal places to consider for the comparison.
 */
export function areEqualWithPrecision(a: number, b: number, precision: number): boolean {
  const factor = Math.pow(10, precision);
  return Math.round(a * factor) === Math.round(b * factor);
}

/**
 * If two numbers are not equal within a specified precision.
 * This is useful for comparing floating-point numbers where precision matters.
 * @param a
 * @param b
 * @param precision
 * @returns
 */
export function areNotEqualWithPrecision(a: number, b: number, precision: number): boolean {
  return !areEqualWithPrecision(a, b, precision);
}
