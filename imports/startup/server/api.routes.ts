import { Router } from 'meteor/iron:router';
import { WebApp } from 'meteor/webapp';
import moment from 'moment';
import { Api } from '/imports/Api';
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

const orderedResults = (params: any) => {
	const handler = params.handler as 'groups' | 'venues' | 'events' | 'courses';
	if (!Object.prototype.hasOwnProperty.call(Api, handler)) {
		throw new NoActionError('Invalid action');
	}

	const { query } = params;

	const sortStr = query.sort;
	const sorting = sortStr ? SortSpec.fromString(sortStr) : SortSpec.unordered();

	const filter = { ...query };
	delete filter.sort;
	delete filter.limit;
	delete filter.skip;

	const selectedLimit = Number.parseInt(query.limit || '', 10) || 100; // If nothing is specified, 100 enities are returned.
	const limit = Math.max(0, Math.min(PrivateSettings.apiMaxLimit, selectedLimit));
	const skip = Number.parseInt(query.skip || '', 10) || 0;
	const results = Api[handler](filter, limit, skip, sorting.spec());

	// Sort the results again so computed fields are sorted too
	// WARNING: In many cases this will be too late, because the limit
	// has already excluded results.
	return FieldOrdering(sorting).sorted(results as any);
};

const jsonSendResponder = function (res: any, process: any) {
	try {
		const body = {
			status: 'success',
			data: process(),
		};
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json; charset=utf-8');
		res.end(JSON.stringify(body, null, '\t'));
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

Router.route('api.0.json', {
	path: '/api/0/json/:handler',
	where: 'server',
	action() {
		jsonSendResponder(this.response, () => {
			return orderedResults(this.params);
		});
	},
});

const xmlSendResponder = function (res: any, process: AnimationPlayState) {
	try {
		const body = `<?xml version="1.0" encoding="UTF-8"?> ${process()}`;
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

const sortByTimeAndRoom = (results: any) =>
	results.reduce((accumulator: any, current: any) => {
		const currentDate = moment(current.start).format('YYYY-MM-DD');
		const currentRoom = current.venue.name || current.room;
		if (currentDate in accumulator) {
			const dateEvents = accumulator[currentDate];
			if (currentRoom in dateEvents) {
				dateEvents[currentRoom].push(current);
			} else {
				dateEvents[currentRoom] = [current];
			}
		} else {
			accumulator[currentDate] = {
				[currentRoom]: [current],
			};
		}
		return accumulator;
	}, {});

const removeHtmlTags = (str: string) => {
	return str ? str.replace(/<[^>]*>/g, '') : '';
};
Router.route('api.0.xml', {
	path: '/api/0/xml/:handler',
	where: 'server',
	action() {
		xmlSendResponder(this.response, () => {
			const results = orderedResults(this.params);
			const resultsByTimeAndRoom = sortByTimeAndRoom(results);

			let returnString = `
			<schedule xsi:noNamespaceSchemaLocation="https://c3voc.de/schedule/schema.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  			<generator name="human" />
  			<version>1.0</version>
			`;
			let dayIdx = 1;
			for (const [date, dateEvents] of Object.entries(resultsByTimeAndRoom)) {
				returnString += `
				<day date="${date}" end="${moment(date)
					.add(1, 'day')
					.startOf('day')}" index="${dayIdx++}" start="${moment(date).startOf('day')}">
				`;

				// @ts-ignore
				for (const [room, roomEvents] of Object.entries(dateEvents)) {
					returnString += `<room name="${room}">`;
					// @ts-ignore
					roomEvents.forEach((event) => {
						returnString += `
						 <event guid="${event.id}" id="${event.id}">
							<date>${date}</date>
							<start>${event.start}</start>
							<duration>${event.duration}</duration>
							<room>${room}</room>
							<slug>${event.slug}</slug>
							<url>${event.link}</url>
							<recording></recording>
							<title>${removeHtmlTags(event.title)}</title>
							<subtitle>${removeHtmlTags(event.subtitle)}</subtitle>
							<track></track>
							<type></type>
							<language></language>
							<abstract></abstract>
							<description>${removeHtmlTags(event.description)}</description>
							<logo></logo>
							<persons></persons>
							<links></links>
							<attachments></attachments>
							<do-not-record>false</do-not-record>
						 </event>
						`;
					});
					returnString += `</room>`;
				}
				returnString += `</day>`;
			}
			returnString += `</schedule>`;
			return returnString;
		});
	},
});
