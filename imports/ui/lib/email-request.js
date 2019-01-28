export default EmailRequest = {

	showEmailRequest: () => {
		const user = Meteor.user();

		return user != undefined && ! user.emailAddress();
	},

	showEmailValidation: () => {
		const user = Meteor.user();

		return user != undefined
			&& user.emailAddress()
			&& ! user.verifiedEmailAddress()
			&& moment().subtract(7, 'days').isAfter(user.createdAt);
	},
};
