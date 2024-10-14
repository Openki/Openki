export function resizeImage(base64: string, maxSize: number) {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const sharp = require("sharp");

  const content = base64.substring(base64.indexOf("base64") + 7);
  const imageBuffer = Buffer.from(content, "base64");

  return new Promise<string>((resolve, reject) => {
    const result = sharp(imageBuffer).resize({
      width: maxSize,
      heigth: maxSize,
      fit: "inside",
      withoutEnlargement: true,
    });

    result.toBuffer((err: Error, data: Buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString("base64"));
      }
    });
  });
}
