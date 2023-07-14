import { Router } from 'meteor/iron:router';
import { WebApp } from 'meteor/webapp';
import { toXML } from 'jstoxml';

import { jsonApi } from '/imports/Api';
import { FieldOrdering } from '/imports/utils/field-ordering';
import { FilteringReadError } from '/imports/utils/filtering';
import { SortSpec } from '/imports/utils/sort-spec';
import { PrivateSettings } from '/imports/utils/PrivateSettings';

WebApp.rawConnectHandlers.use('/api', (_req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	return next();
});

class NoActionError {
	message: string;

	constructor(message: string) {
		this.message = message;
	}
}

const xmlSendResponder = function (res: any, process: any) {
	try {
		const body =   `<?xml version="1.0" encoding="UTF-8"?> ${process()}`;
        /* {
			status: 'success',
			data: process(),
		}; */
        console.log('booty', body);
        res.statusCode = 200;
		res.setHeader('Content-Type', 'application/xml');
		res.end(body);
	} catch (e) {
		const body: any = {};
		if (e instanceof FilteringReadError || e instanceof NoActionError) {
			res.statusCode = 400;
			body.status = 'fail';
			body.data = {};
			if ((e as any).name) {
				body.data[(e as any).name] = e.message;
			} else {
				body.data.error = e.message;
			}
		} else {
			/* eslint-disable-next-line no-console */
			console.log(e, e.stack);
			res.statusCode = 500;
			body.status = 'error';
			body.message = 'Server error';
		}
		res.end(JSON.stringify(body, null, '\t'));
	}
};

Router.route('api.0.xml', {
	path: '/api/0/xml/:handler',
	where: 'server',
	action() {
		xmlSendResponder(this.response, () => {
			const handler = this.params.handler as 'events';
			if (!Object.prototype.hasOwnProperty.call(jsonApi, handler)) {
				throw new NoActionError('Invalid action');
			}

			const { query } = this.params;

			const sortStr = query.sort;
			const sorting = sortStr ? SortSpec.fromString(sortStr) : SortSpec.unordered();

			const filter = { ...query };
			delete filter.sort;
			delete filter.limit;
			delete filter.skip;

			const selectedLimit = Number.parseInt(query.limit || '', 10) || 100; // If nothing is specified, 100 enities are returned.
			const limit = Math.max(0, Math.min(PrivateSettings.apiMaxLimit, selectedLimit));
			const skip = Number.parseInt(query.skip || '', 10) || 0;
			const results = jsonApi[handler](filter, limit, skip, sorting.spec());
            const orderedResults = FieldOrdering(sorting).sorted(results as any);
			return '<events>' + toXML(orderedResults,{indent: '    '}) + '</events>';

			// Sort the results again so computed fields are sorted too
			// WARNING: In many cases this will be too late, because the limit
			// has already excluded results.
			/* TODO */
            // return FieldOrdering(sorting).sorted(results as any);
		});
	},
});
