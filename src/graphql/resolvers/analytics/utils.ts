
export const groupBy = <T>(data: T[], keyGetter: (item: T) => string) => {
  const map = new Map<string, T[]>();
  data.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
};

export const getWeekString = (date: Date): string => {
  const copy = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((copy.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${copy.getUTCFullYear()}-W${weekNo < 10 ? '0' + weekNo : weekNo}`;
};

export const standardDeviation = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const sqDiff = arr.map(n => Math.pow(n - mean, 2));
  const avgSqDiff = sqDiff.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(avgSqDiff);
};
