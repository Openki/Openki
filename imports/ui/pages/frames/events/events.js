import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import './events.html';

Template.frameEvents.onRendered(function() {
	var instance = this;
	this.autorun(function() {
		instance.$("a").attr("target", "_blank");
	});
});
