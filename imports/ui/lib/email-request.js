const EmailRequest = {

	showEmailRequest: () => {
		const user = Meteor.user();

		return user && !user.emailAddress();
	},

	showEmailValidation: () => {
		const user = Meteor.user();

		return user
			&& user.emailAddress()
			&& !user.verifiedEmailAddress()
			&& moment().subtract(7, 'days').isAfter(user.createdAt);
	},
};

export default EmailRequest;
