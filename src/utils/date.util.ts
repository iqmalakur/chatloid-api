export const zeroPadding = (numText: string | number, length: number = 2) => {
  return `${numText}`.padStart(length, '0');
};

export const getTimeString = (date: Date) => {
  const hours: string = zeroPadding(date.getHours());
  const minutes: string = zeroPadding(date.getMinutes());
  const seconds: string = zeroPadding(date.getSeconds());
  const miliseconds: string = zeroPadding(date.getMilliseconds(), 3);

  return `${hours}:${minutes}:${seconds}.${miliseconds}`;
};
