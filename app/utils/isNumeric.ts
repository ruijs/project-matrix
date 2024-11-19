export function isNumeric(val: string | number | undefined): boolean {
  return ((val !== undefined) && (val != null) &&
    (val !== '') &&
    !isNaN(Number(val.toString())))
}
