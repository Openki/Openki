interface Image {
  content: string;
  mimeType: "image/bmp" | "image/png" | "image/gif" | "image/jpeg";
}

export async function resizeImage(image: Image, maxSize: number): Promise<Image>;
export async function resizeImage(
  image: Image,
  maxWidth: number,
  maxHeigth: number,
): Promise<Image>;
export async function resizeImage(file: Image, maxWidth: number, maxHeigth = maxWidth) {
  // create custom version of Jimp to not load font plugin. It makes problem with meteor.
  // Source: https://jimp-dev.github.io/jimp/guides/custom-jimp/, https://github.com/jimp-dev/jimp/blob/main/packages/jimp/src/index.ts
  const { createJimp } = await import("@jimp/core");

  const bmp = (await import("@jimp/js-bmp")).default;
  const gif = (await import("@jimp/js-gif")).default;
  const jpeg = (await import("@jimp/js-jpeg")).default;
  const png = (await import("@jimp/js-png")).default;
  const resize = await import("@jimp/plugin-resize");

  const plugins = [resize.methods];

  const formats = [bmp, gif, jpeg, png];

  const Jimp = createJimp({
    formats: formats,
    plugins: plugins,
  });

  const content = file.content.substring(file.content.indexOf("base64") + 7);
  const imageBuffer = Buffer.from(content, "base64");

  const image = await Jimp.read(imageBuffer);

  if (image.bitmap.width > maxWidth || image.bitmap.height > maxHeigth) {
    image.scaleToFit({ w: maxWidth, h: maxHeigth });
  }

  const resizedContent = await image.getBase64(file.mimeType);

  return {
    content: resizedContent.substring(resizedContent.indexOf("base64") + 7),
    mimeType: file.mimeType,
  };
}
