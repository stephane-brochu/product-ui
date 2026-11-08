/** Group display digits without converting exact decimal strings to Number. */
export function formatExactNumber(value: string | null): string | null {
  if (value === null) return null;
  const [integer, fraction] = value.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}
