import Shariff from '/imports/ui/lib/shariff';

Template.sharing.onRendered(function() {
	this.autorun(() => {
		this.shariff = new Shariff(this.find('.shariff'), {
			lang: Session.get('locale'),
			mailUrl: 'mailto:',
			services: [
				'twitter',
				'facebook',
				'whatsapp',
				'googleplus',
				'diaspora',
				'mail',
				'info',
			]
		});

		this.$('.fa').addClass('fa-fw');
	});
});
