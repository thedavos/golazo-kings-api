const areArraysEqual = <T>(firstArray: T[], secondArray: T[]): boolean => {
  if (firstArray.length !== secondArray.length) return false;
  const sorted1 = [...firstArray].sort();
  const sorted2 = [...secondArray].sort();
  return sorted1.every((value, index) => value === sorted2[index]);
};

export default areArraysEqual;
