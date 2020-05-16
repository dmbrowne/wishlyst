const getBase64FromUrl = (url: string, callback: (base64: string) => any) => {
  const img = new Image();
  img.setAttribute("crossOrigin", "anonymous");
  img.onload = function() {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0);
    }
    callback(canvas.toDataURL("image/jpg"));
  };
  img.src = url;
};

export default getBase64FromUrl;
