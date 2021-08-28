import path from 'path';
import AWS from 'aws-sdk';
import mime from 'mime-types';
import { Mongo } from 'meteor/mongo';

import { PrivateSettings } from './PrivateSettings';

function getBucket() {
	return PrivateSettings.s3.bucketName;
}

function createS3Client() {
	return new AWS.S3({
		region: PrivateSettings.s3.region,
		endpoint: new AWS.Endpoint(PrivateSettings.s3.bucketEndpoint),
		s3BucketEndpoint: true,
		accessKeyId: PrivateSettings.s3.accessKeyId,
		secretAccessKey: PrivateSettings.s3.secretAccessKey,
	});
}

export interface File {
	name: string;
	content: Buffer;
	mimeType: string;
	encoding: string;
}

export function generatePublicUrl(fullFileName: string) {
	return path.join(PrivateSettings.s3.publicUrlBase, fullFileName);
}

export function upload(directoryName: string, file: File) {
	const fullKey = path.join(
		directoryName,
		`${new Mongo.ObjectID().toHexString()}.${mime.extension(file.mimeType)}`,
	);

	const s3 = createS3Client();

	const params: AWS.S3.PutObjectRequest = {
		Bucket: getBucket(),
		Key: fullKey,
		ContentType: file.mimeType,
		ContentEncoding: file.encoding,
		ACL: 'public-read',
		Body: file.content,
		Metadata: { originalName: file.name },
	};

	return s3
		.upload(params)
		.promise()
		.then(() => {
			return { fullFileName: fullKey, publicUrl: generatePublicUrl(fullKey) };
		});
}

export function remove(fullFileName: string) {
	return createS3Client()
		.deleteObject({
			Bucket: getBucket(),
			Key: fullFileName,
		})
		.promise();
}
