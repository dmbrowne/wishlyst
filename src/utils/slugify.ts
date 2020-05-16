export const slugify = (txt: string) => {
  return txt
    .trim()
    .toLowerCase()
    .replace(/\s/g, "-")
    .replace(/\W/g, "");
};
