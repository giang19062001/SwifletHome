export interface ISearchItem {
  questions: string[];
  answer: string;
}

export const fuseConfig = {
  keys: ['questions'],
  threshold: 0.3, // Nhỏ hơn → kết quả chính xác hơn
  includeScore: true,
  ignoreLocation: true,
  ignoreFieldNorm: true,
};
