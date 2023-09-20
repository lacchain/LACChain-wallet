export const toTitleCase = (str) => {
  if (!str) {
    return "";
  }
  const strArr = str.split(" ").map((word) => {
    return word[0].toUpperCase() + word.substring(1).toLowerCase();
  });
  return strArr.join(" ");
};
