import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as UrlTools from '/imports/utils/url-tools';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	Record<string, unknown>,
	'kioskLink',
	Record<string, never>
>;

const template = Template.kioskLink;

template.helpers({
	link() {
		const filterParams = Session.get('kioskFilter');
		if (!filterParams) {
			return false;
		}

		delete filterParams.region; // HACK region is kept in the session (for bad reasons)
		const queryString = UrlTools.paramsToQueryString(filterParams);

		const options: { query?: string } = {};
		if (queryString.length) {
			options.query = queryString;
		}

		return Router.url('kioskEvents', {}, options);
	},
});

template.events({
	'click .js-remove-back-to-kiosk'() {
		return Session.set('kioskFilter', false);
	},
});
