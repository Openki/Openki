import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Session } from 'meteor/session';

import * as Viewport from '/imports/ui/lib/viewport';

import '/imports/ui/components/alerts';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<'frameLayout'>;

const template = Template.frameLayout;

template.onRendered(() => {
	Viewport.update();
	$(window).on('resize', () => {
		Viewport.update();
	});
	Session.set('isRetina', window.devicePixelRatio === 2);
});

template.events({
	/* Workaround to prevent iron-router from messing with server-side downloads
	 *
	 * Class 'js-download' must be added to those links.
	 */
	'click .js-download'(event) {
		event.stopPropagation();
	},
});
