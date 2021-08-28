import { Router } from 'meteor/iron:router';
import Busboy from 'busboy';
import http from 'http';

import * as FileStorage from '/imports/utils/FileStorage';

Router.onBeforeAction(function (
	req: http.IncomingMessage,
	_res: http.ServerResponse,
	next: () => void,
) {
	const files: FileStorage.File[] = []; // Store files in an array and then pass them to request.

	if (req.method === 'POST') {
		const busboy = new Busboy({ headers: req.headers });
		busboy.on('file', function (_fieldname, fileContent, filename, encoding, mimeType) {
			const file = {} as FileStorage.File; // create an image object

			file.name = filename;
			file.mimeType = mimeType;
			file.encoding = encoding;

			// buffer the read chunks
			const buffer: any[] = [];

			fileContent.on('data', function (data) {
				buffer.push(data);
			});
			fileContent.on('end', function () {
				// concat the chunks
				file.content = Buffer.concat(buffer);
				// push the image object to the file array
				files.push(file);
			});
		});

		busboy.on('finish', function () {
			// Pass the file array together with the request
			(req as any).files = files;
			next();
		});
		// Pass request to busboy
		req.pipe(busboy);
	} else {
		next();
	}
});
