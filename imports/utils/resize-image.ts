import { PublicSettings } from "./PublicSettings";

export function resizeImage(base64: string, maxSize: number) {
  if (!PublicSettings.feature.resizeImagesOnServer) {
    // eslint-disable-next-line no-console
    console.info("Resizing images with sharp.node on the server is disabled.");
    return base64.substring(base64.indexOf("base64") + 7);
  }

  // Fixed: https://github.com/lovell/sharp/issues/537
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const sharp = require("./build/Release/sharp.node");

  const content = base64.substring(base64.indexOf("base64") + 7);
  const imageBuffer = Buffer.from(content, "base64");

  return new Promise<string>((resolve, reject) => {
    const result = sharp(imageBuffer).resize(maxSize, maxSize, {
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
