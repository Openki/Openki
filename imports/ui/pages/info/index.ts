import { Router } from 'meteor/iron:router';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import $ from 'jquery';
import { Meteor } from 'meteor/meteor';

import { ScssVars } from '/imports/ui/lib/scss-vars';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'infoPage',
	never,
	{ headerTag: string; contentTags: string; scrollTo: (id: string) => void }
>;

const template = Template.infoPage;

template.onCreated(function () {
	const instance = this;

	instance.headerTag = 'h3';
	instance.contentTags = 'p, ul';

	instance.scrollTo = (id) => {
		const idSelector = `#${decodeURIComponent(id)}`;
		const targetTitle = instance.$(idSelector);
		if (targetTitle.length) {
			Meteor.defer(() => {
				targetTitle.nextUntil(instance.headerTag).show();
				$(window).scrollTop(targetTitle.position().top - ScssVars.navbarHeight);
			});
		}
	};
});

template.onRendered(function () {
	const instance = this;

	// in order to create nice IDs for the questions also for non-english
	// alphabets we make our own ones
	instance.$(instance.headerTag).each(function () {
		const title = $(instance);
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

template.events({
	'click h3'(event, instance) {
		const title = $(event.currentTarget);
		title.nextUntil(instance.headerTag, instance.contentTags).toggle();
		title.toggleClass('active');
	},

	'click a[href^="#"]'(event, instance) {
		event.preventDefault();
		const href = $(event.currentTarget).attr('href');
		const id = href?.substring(1); // Drop the hash-char
		if (!id) {
			return;
		}
		instance.scrollTo(id);
	},
});
