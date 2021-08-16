import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Spacebars } from 'meteor/spacebars';

import '/imports/ui/components/report/report';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	Record<string, unknown>,
	'notFound',
	Record<string, unknown>
>;

const template = Template.notFound;

template.helpers({
	backArrow() {
		const isRTL = Session.equals('textDirectionality', 'rtl');
		const direction = isRTL ? 'right' : 'left';
		return Spacebars.SafeString(
			`<span class="fa fa-arrow-${direction} fa-fw" aria-hidden="true"></span>`,
		);
	},
});

template.events({
	'click .js-go-back'() {
		window.history.back();
	},
});
