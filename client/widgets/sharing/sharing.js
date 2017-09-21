import Shariff from 'shariff';
import 'shariff/build/shariff.min.css';

Template.sharing.onRendered(function() {
	this.autorun(() => {
		this.shariff = new Shariff(this.find('.shariff'), {
			lang: Session.get('locale'),
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

		// Remove href and target from mail button. Instead install a click
		// event handler which opens a mail form.
		const mailAction = this.find('.shariff-button.mail a');
		if (mailAction) {
			mailAction.removeAttribute('target');
			mailAction.removeAttribute('href');
		}
	});
});

Template.sharing.events({
	'click .shariff-button.mail a'(event) {
		event.stopPropagation();
		console.log('e-mail button clicked! FIXME: open modal or something.')
	}
});
