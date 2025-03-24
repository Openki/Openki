import { Base64 } from "meteor/base64";
import { EJSON } from "meteor/ejson";

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Assets {
  function getBinaryAsync(assetPath: string): Promise<EJSON | undefined>;

  function getTextAsync(assetPath: string): Promise<string | undefined>;
}

export async function base64PngImageData(path: string) {
  const binaryImage = await Assets.getBinaryAsync(path);

  return `data:image/png;base64,${Base64.encode(binaryImage)}`;
}
