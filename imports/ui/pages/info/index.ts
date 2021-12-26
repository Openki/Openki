import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import $ from 'jquery';
import { Meteor } from 'meteor/meteor';

import { ScssVars } from '/imports/ui/lib/scss-vars';

import './template.html';
import './styles.scss';

Template.infoPage.onCreated(function () {
	this.headerTag = 'h3';
	this.contentTags = 'p, ul';

	this.scrollTo = (/** @type {string} */ id) => {
		const idSelector = `#${decodeURIComponent(id)}`;
		const targetTitle = this.$(idSelector);
		if (targetTitle.length) {
			Meteor.defer(() => {
				targetTitle.nextUntil(this.headerTag).show();
				$(window).scrollTop(targetTitle.position().top - ScssVars.navbarHeight);
			});
		}
	};
});

Template.infoPage.onRendered(function () {
	// in order to create nice IDs for the questions also for non-english
	// alphabets we make our own ones
	this.$(this.headerTag).each(function () {
		const title = $(this);
		const id = title
			.text()
			.trim()
			.toLowerCase()
			.replace(/[_+.,!?@#$%^&*();\\/|<>"'=]/g, '')
			.replace(/[ ]/g, '-');

		title.attr('id', id);
	});

	this.$('a').not('[href^="#"]').attr('target', '_blank');

	const { hash } = Router.current().params;
	if (hash) {
		this.scrollTo(hash);
	}
});

Template.infoPage.events({
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
	},
});
