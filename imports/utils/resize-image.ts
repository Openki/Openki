import { PublicSettings } from "./PublicSettings";

export async function resizeImage(base64: string, maxSize: number): Promise<string>;
export async function resizeImage(
  base64: string,
  maxWidth: number,
  maxHeigth: number,
): Promise<string>;
export async function resizeImage(base64: string, maxWidth: number, maxHeigth = maxWidth) {
  if (!PublicSettings.feature.resizeImagesOnServer) {
    console.info("Resizing images with sharp on the server is disabled.");
    return base64.substring(base64.indexOf("base64") + 7);
  }

  const sharp = (await import("sharp")).default;

  const content = base64.substring(base64.indexOf("base64") + 7);
  const imageBuffer = Buffer.from(content, "base64");

  return new Promise<string>((resolve, reject) => {
    const result = sharp(imageBuffer).resize(maxWidth, maxHeigth, {
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
