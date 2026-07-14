import path from "path";
import type { PutObjectCommandInput } from "@aws-sdk/client-s3";
import mime from "mime-types";
import { Mongo } from "meteor/mongo";
import { Match } from "meteor/check";

import { PrivateSettings } from "./PrivateSettings";
import { PublicSettings } from "./PublicSettings";
import { StringEnum } from "/imports/utils/CustomChecks";

function getBucket() {
  return PrivateSettings.s3.bucketEndpoint;
}

async function createS3Client() {
  if (Meteor.isServer) {
    const { S3 } = await import("@aws-sdk/client-s3");

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

  return undefined;
}

export const UploadFilePattern = Match.ObjectIncluding({
  mimeType: StringEnum("image/bmp", "image/png", "image/gif", "image/jpeg"),
  /** As base64url */
  content: String,
});
export type UploadFile = Match.PatternMatch<typeof UploadFilePattern>;

export function generatePublicUrl(fullFileName: string) {
  const { publicUrlBase } = PublicSettings.s3;
  return new URL(
    fullFileName,
    // Make sure the base URL ends with a trailing slash
    // so it can be resolved by the URL constructor.
    publicUrlBase.endsWith("/") ? publicUrlBase : publicUrlBase + "/",
  ).toString();
}

export async function upload(directoryName: string, file: UploadFile) {
  const fullKey = path.join(
    directoryName,
    `${new Mongo.ObjectID().toHexString()}.${mime.extension(file.mimeType)}`,
  );

  if (Meteor.isServer) {
    const { Upload } = await import("@aws-sdk/lib-storage");

    // s3 is always defined here because we run within the Meteor.isServer block
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const s3 = (await createS3Client())!;

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
  }

  return { fullFileName: fullKey, publicUrl: generatePublicUrl(fullKey) };
}

export async function renameDirectory(oldPrefix: string, newPrefix: string) {
  if (Meteor.isServer) {
    const { ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } =
      await import("@aws-sdk/client-s3");

    const s3 = await createS3Client();

    if (!s3) {
      return;
    }

    const bucket = getBucket();

    const listRes = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: oldPrefix }));

    const objects = listRes.Contents || [];

    for (const obj of objects) {
      if (!obj.Key) continue;

      const newKey = obj.Key.replace(oldPrefix, newPrefix);

      // 1. Copy object
      await s3.send(
        new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/${obj.Key}`,
          Key: newKey,
          ACL: "public-read",
        }),
      );

      // 2. Delete old object
      await s3.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: obj.Key,
        }),
      );
    }
  }
}

export async function remove(fullFileName: string) {
  return (await createS3Client())?.deleteObject({
    Bucket: getBucket(),
    Key: fullFileName,
  });
}
