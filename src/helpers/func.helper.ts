export const generateCode = (code: string, keyword: string, lengthNum: number) => {
  const lastCode = code;

  const numberPart = lastCode.substring(3);
  let nextNumber = parseInt(numberPart, 10) + 1;

  const nextNumberString = nextNumber.toString().padStart(lengthNum, '0');

  return `${keyword}${nextNumberString}`;
};

export function diffByTwoArr(arr1: any[], arr2: any[], field: string) {
  const arrCompare = new Set(arr1.map((item) => item[field]));
  return arr2.filter((item) => !arrCompare.has(item[field]));
}

export function sortByDate<T>(
  field: keyof T,
  ...arrays: T[][]
): T[] {
  const merged = arrays.flat();

  return merged.sort((a, b) => {
    const dateA = new Date(a[field] as any).getTime();
    const dateB = new Date(b[field] as any).getTime();
    return dateA - dateB;
  });
}

export function formatPrice(price: string | number){
  return Number(price).toLocaleString('vi-VN')
}

export function replaceNbspToSpace(str) {
  if (typeof str !== "string") return str;
  return str.replace(/&nbsp;/g, " ");
}
