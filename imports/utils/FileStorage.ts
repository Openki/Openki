import path from 'path';
import AWS from 'aws-sdk';
import mime from 'mime-types';
import { Mongo } from 'meteor/mongo';

import { PrivateSettings } from './PrivateSettings';
import { PublicSettings } from './PublicSettings';

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

export interface UploadFile {
	name: string;
	mimeType: string;
	/** As BinaryString */
	content: string;
}

export function generatePublicUrl(fullFileName: string) {
	return new URL(fullFileName, PublicSettings.s3.publicUrlBase).href;
}

export function upload(directoryName: string, file: UploadFile) {
	const fullKey = path.join(
		directoryName,
		`${new Mongo.ObjectID().toHexString()}.${mime.extension(file.mimeType)}`,
	);

	const s3 = createS3Client();

	const params: AWS.S3.PutObjectRequest = {
		Bucket: getBucket(),
		Key: fullKey,
		ContentType: file.mimeType,
		ACL: 'public-read',
		Body: Buffer.from(file.content, 'binary'),
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
