import moment from 'moment';
import { v5 as uuidv5 } from 'uuid';
import { ApiEvent } from '/imports/Api';
import { Router } from 'meteor/iron:router';
import { FilteringReadError } from '/imports/utils/filtering';
import { NoActionError, orderedResults } from './api.routes.utils';

const OPENKI_UUID_NAMESPACE = 'bfcc029a-5d16-4863-af43-17277e2e717b';

const sortByTimeAndRoom = (results: ApiEvent[]) =>
	results.reduce((accumulator: { [date: string]: { [room: string]: ApiEvent[] } }, current: ApiEvent) => {
		const currentDate = moment(current.start).format('YYYY-MM-DD');

		let currentRoom;
		if (current.venue?.name && current.room) {
			currentRoom = `${current.venue?.name} (${current.room})`;
		} else {
			currentRoom = current.venue?.name || current.room;
		}

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

const sanitizeXMLvalues = (str: string) =>
	str
		? str
			.replace(/<.*?>/g, '')
			.replace(/&/g, '&amp;')
			.replace(/>/g, '&gt;')
			.replace(/</g, '&lt;')
			.replace(/"/g, '&quot;')
		: '';

const xmlSendResponder = function (res: any, process: any) {
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

const pseudoHash = function(str: string) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}


Router.route('api.0.xml', {
	path: '/api/0/xml/schedule',
	where: 'server',
	action() {
		xmlSendResponder(this.response, () => {
			const results = orderedResults(this.params, 'events');

			const resultsByTimeAndRoom = sortByTimeAndRoom(results);

			let returnString = `
			<schedule xsi:noNamespaceSchemaLocation="https://c3voc.de/schedule/schema.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  			<generator name="human" />
  			<version>1.0</version>
			  <conference>
				<acronym>anarchy23</acronym>
				<title>Anarchy 2023</title>
				<start>2023-07-19</start>
				<end>2023-07-23</end>
				<days>5</days>
				<time_zone_name>Europe/Zurich</time_zone_name>
				<base_url>https://anarchy2023.org/en/program/workshops</base_url>
			</conference>			
			`;

			let dayIdx = 1;
			// eslint-disable-next-line no-restricted-syntax
			for (const [date, dateEvents] of Object.entries(resultsByTimeAndRoom)) {
				returnString += `
				<day date="${date}" 
				     end="${moment(date).add(1, 'day').startOf('day').format('YYYY-MM-DDTHH:mm:ssZ')}"
					 index="${dayIdx}" 
					 start="${moment(date).startOf('day').format('YYYY-MM-DDTHH:mm:ssZ')}">
				`;
				dayIdx += 1;
				// eslint-disable-next-line no-restricted-syntax
				for (const [room, roomEvents] of Object.entries(dateEvents)) {
					returnString += `<room name="${room}">`;
					// eslint-disable-next-line no-loop-func
					roomEvents.forEach(
						// eslint-disable-next-line no-loop-func
						(event: any) => {
							const durationMinutes = (`00${(event.duration % 60)}`).slice(-2);
							const duration = `${Math.floor(event.duration / 60)}:${durationMinutes}`;
							returnString += `
							<event id="${pseudoHash(event.id)}" guid="${uuidv5(event.id, OPENKI_UUID_NAMESPACE)}">
								<date>${moment(event.start).format('YYYY-MM-DDTHH:mm:ssZ')}</date>
								<start>${moment(event.start).format('HH:mm')}</start>
								<duration>${duration}</duration>								
 								<room>${room}</room>
								<slug>${event.slug || ''}</slug>
								<url>${event.link || ''}</url>
								<recording>
									<license/>
									<optout>false</optout>
								</recording>
								<title>${sanitizeXMLvalues(event.title)}</title>
								<subtitle></subtitle>
								<type></type>
								<language></language>
								<abstract></abstract>
								<description>${sanitizeXMLvalues(event.description)}</description>
								<logo></logo>
								<persons>	
							`;
							// eslint-disable-next-line no-loop-func
							event.groups.forEach((group: any) => {
								returnString += `<person id="${group.id}">${group.name}</person>`;
							});
							returnString += `
								</persons>
								<links></links>
								<attachments></attachments>
							</event>
						`;
						},
					);
					returnString += `</room>`;
				}
				returnString += `</day>`;
			}
			returnString += `</schedule>`;
			return returnString;
		});
	},
});
