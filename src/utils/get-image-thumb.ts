export enum EThumbSize {
  small = "64",
  medium = "128",
  large = "400"
}

export const getImgThumb = (path: string, size: EThumbSize) => {
  const splitPath = path.split("/");
  const fileNameWithExt = splitPath.pop();
  return `${splitPath.join("/")}/thumb@${size}_${fileNameWithExt}`;
};

export default getImgThumb;
