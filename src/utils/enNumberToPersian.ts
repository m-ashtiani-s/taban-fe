export function convertToPersianNumber(num: number | string | null | undefined): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  if (num === null || num === undefined) return '';
  return num
    .toString()
    .split('')
    .map((char) => (/\d/.test(char) ? persianDigits[parseInt(char)] : char))
    .join('');
}
