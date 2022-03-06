import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import '/imports/ui/components/alerts';

import './frame-body.html';

const Template = TemplateAny as TemplateStaticTyped<'frameLayout'>;

const template = Template.frameLayout;

template.events({
	/* Workaround to prevent iron-router from messing with server-side downloads
	 *
	 * Class 'js-download' must be added to those links.
	 */
	'click .js-download'(event) {
		event.stopPropagation();
	},
});
