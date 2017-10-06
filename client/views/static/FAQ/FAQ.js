Router.map(function () {
	this.route('FAQ', {
		path: '/FAQ',
		template: 'FAQ',
		data() {
			return { hash: this.params.hash };
		}
	});
});

Template.FAQ.onCreated(function() {
	this.headerTag = 'h3';
	this.contentTags = 'p, ul';

	this.scrollTo = id => {
		if (id.indexOf('#') < 0) id = '#' + id;
		const targetTitle = this.$(this.headerTag + id);
		targetTitle.nextUntil(this.headerTag, this.contentTags).show();
		$(window).scrollTop(targetTitle.position().top - SCSSVars.navbarHeight);
	}
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

	if (this.data.hash) this.scrollTo(this.data.hash);
});

Template.FAQ.helpers({
	localizedFAQ() {
		const templatePrefix = 'FAQ_';
		const templateExists = locale => !!Template[templatePrefix + locale];

		// if the FAQ  doesn't exist with the specific locale fall back to the
		// more general one
		let locale = Session.get('locale');
		if (!templateExists(locale)) locale = locale.slice(0, 2);

		// if this still doesn't work, use english locale
		if (!templateExists(locale)) locale = 'en';

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
		const id = $(event.currentTarget).attr('href');
		instance.scrollTo(id);
	}
});
