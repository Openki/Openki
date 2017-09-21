import Shariff from '/imports/ui/lib/shariff/shariff';

Template.sharing.onRendered(function() {
	this.autorun(() => {
		this.shariff = new Shariff(this.find('.shariff'), {
			lang: Session.get('locale'),
			mailtoUrl: 'mailto:',
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
	});
});
