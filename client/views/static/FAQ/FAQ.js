Router.map(function () {
	this.route('FAQ', {
		path: '/FAQ',
		template: 'FAQ',
		data() {
			return { hash: this.params.hash };
		}
	});
});

Template.FAQ.onRendered(function() {
	this.$('.faq-question-title').each(function() {
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

	if (this.data.hash) {
		const targetTitle = this.$('.faq-question-title#' + this.data.hash);
		targetTitle.next('.faq-question-answer').show();
		$(window).scrollTop(targetTitle.position().top - SCSSVars.navbarHeight);
	}
});

Template.FAQ.events({
	'click .js-toggle-answer'(event, instance) {
		const title = $(event.currentTarget);
		title.next('.faq-question-answer').toggle();
		title.toggleClass('active');
	}
});
