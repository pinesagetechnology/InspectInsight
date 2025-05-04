export const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getColorForRating = (rating: number): number => {
  if (rating >= 1 || rating < 4) {
    return 0xff0000; // red
  } else if (rating >= 4 || rating < 7) {
    return 0xffa500; // orange
  } else if (rating >= 7 || rating < 9) {
    return 0x7fff00; // yellow-green
  } else {
    return 0x00ff00; // green
  }
};

export const FormatDateOnly = (value: string) => {
  if (!value) return '';

  const date = new Date(value);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
