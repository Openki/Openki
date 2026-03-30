import { generatePublicUrl } from "/imports/utils/FileStorage";
import { PublicSettings } from "/imports/utils/PublicSettings";

describe("FileStorage utils", () => {
  it(
    generatePublicUrl.name + " should join a the full public URL for an asset",
    () => {
      const fileName = "some-file.png";
      const fullURL = generatePublicUrl(fileName);
      expect(fullURL).to.be(PublicSettings.s3.publicUrlBase + "/" + fileName);
    },
  );
});
