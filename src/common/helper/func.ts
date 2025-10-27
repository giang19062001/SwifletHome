export const generateCode =  (code, keyword, lengthNum) => {
  const lastCode = code

  const numberPart = lastCode.substring(3);
  let nextNumber = parseInt(numberPart, 10) + 1;

  const nextNumberString = nextNumber.toString().padStart(lengthNum, '0');

  return `${keyword}${nextNumberString}`;
};
