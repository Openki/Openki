import { Meteor } from 'meteor/meteor';

const EmailRequest = {

	showEmailRequest: () => {
		const user = Meteor.user();

		return user && !user.hasEmail();
	},

	showEmailValidation: () => {
		const user = Meteor.user();

		return user
			&& user.hasEmail()
			&& !user.hasVerifiedEmail()
			&& moment().subtract(7, 'days').isAfter(user.createdAt);
	},
};

export default EmailRequest;
