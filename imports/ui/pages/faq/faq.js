import { Router } from 'meteor/iron:router';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import ScssVars from '/imports/ui/lib/scss-vars.js';

import './faq.de.md';
import './faq.en.md';
import './faq.html';

Template.FAQ.onCreated(function() {
	this.headerTag = 'h3';
	this.contentTags = 'p, ul';

	this.scrollTo = id => {
		const idSelector = "#" + decodeURIComponent(id);
		const targetTitle = this.$(idSelector);
		if (targetTitle.length) {
			Meteor.defer(() => {
				targetTitle.nextUntil(this.headerTag).show();
				$(window).scrollTop(targetTitle.position().top - ScssVars.navbarHeight);
			});
		}
	};
});

Template.FAQ.onRendered(function() {
	// in order to create nice IDs for the questions also for non-english
	// alphabets we make our own ones
	this.$(this.headerTag).each(function() {
		const title = $(this);
		const id =
			title
			.text()
			.trim()
			.toLowerCase()
			.replace(/[_+.,!?@#$%^&*();\\\/|<>"'=]/g, "")
			.replace(/[ ]/g, "-");

		title.attr('id', id);
	});

	this.$('a').not('[href^="#"]').attr('target', '_blank');

	const hash = Router.current().params.hash;
	if (hash) this.scrollTo(hash);
});

Template.FAQ.helpers({
	localizedFAQ() {
		const templatePrefix = 'FAQ_';
		const templateNotFound = locale => !Template[templatePrefix + locale];

		// if the FAQ  doesn't exist with the specific locale fall back to the
		// more general one
		let locale = Session.get('locale');
		if (templateNotFound(locale)) locale = locale.slice(0, 2);

		// if this still doesn't work, use english locale
		if (templateNotFound(locale)) locale = 'en';

		return templatePrefix + locale;
	}
});

Template.FAQ.events({
	'click h3'(event, instance) {
		const title = $(event.currentTarget);
		title.nextUntil(instance.headerTag, instance.contentTags).toggle();
		title.toggleClass('active');
	},

	'click a[href^="#"]'(event, instance) {
		event.preventDefault();
		const href = $(event.currentTarget).attr('href');
		const id = href.substring(1); // Drop the hash-char
		instance.scrollTo(id);
	}
});
