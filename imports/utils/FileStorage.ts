import path from "path";
import { PutObjectCommandInput, S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import mime from "mime-types";
import urljoin from "url-join";
import { Mongo } from "meteor/mongo";
import { Match } from "meteor/check";

import { PrivateSettings } from "./PrivateSettings";
import { PublicSettings } from "./PublicSettings";

function getBucket() {
  return PrivateSettings.s3.bucketEndpoint;
}

function createS3Client() {
  return new S3({
    region: PrivateSettings.s3.region,
    endpoint: PrivateSettings.s3.bucketEndpoint,
    bucketEndpoint: true,
    credentials: {
      accessKeyId: PrivateSettings.s3.accessKeyId,
      secretAccessKey: PrivateSettings.s3.secretAccessKey,
    },
  });
}

export const UploadFilePattern = Match.ObjectIncluding({
  mimeType: String,
  /** As base64url */
  content: String,
});
export type UploadFile = Match.PatternMatch<typeof UploadFilePattern>;

export function generatePublicUrl(fullFileName: string) {
  return urljoin(PublicSettings.s3.publicUrlBase, fullFileName);
}

export async function upload(directoryName: string, file: UploadFile) {
  const fullKey = path.join(
    directoryName,
    `${new Mongo.ObjectID().toHexString()}.${mime.extension(file.mimeType)}`,
  );

  const s3 = createS3Client();

  const params: PutObjectCommandInput = {
    Bucket: getBucket(),
    Key: fullKey,
    ContentType: file.mimeType,
    ACL: "public-read",
    Body: Buffer.from(file.content, "base64url"),
  };

  await new Upload({
    client: s3,
    params,
  }).done();

  return { fullFileName: fullKey, publicUrl: generatePublicUrl(fullKey) };
}

export function remove(fullFileName: string) {
  return createS3Client().deleteObject({
    Bucket: getBucket(),
    Key: fullFileName,
  });
}
