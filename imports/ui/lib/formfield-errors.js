export const FormfieldErrors = function(instance, errors) {
	instance.hasError = new ReactiveVar(false);

	instance.setError = key => {
		if (instance.hasError.get()) instance.resetErrors();

		const error = getMapping(key, instance.view.name);
		const selectors = error.selectors;

		selectors.forEach((selector, index) => {
			const formGroup = $(selector).parents('.form-group');

			formGroup.addClass('has-error');
			if (index === selectors.length - 1) {
				formGroup.append(
					'<span class="help-block warning-block">'
					+ error.text
					+ '</span>'
				);
			}
		});

		instance.hasError.set(true);
	};

	instance.resetErrors = () => {
		instance.$('.form-group').removeClass('has-error');
		instance.$('.warning-block').remove();
	};
};

getMapping = function(key, viewName) {
	if (Mappings[viewName] === undefined || Mappings[viewName][key] === undefined)  {
		return Mappings.default[key];
	}
	return  Mappings[viewName][key];
};

const Mappings = {

	'Template.loginFrame' : {
		'noUserName': {
			text: mf('login.warning.noUserName', 'Please enter your username or email to log in.'),
			selectors: ['#loginName']
		},
		'noCredentials': {
			text: mf('login.login.warning', 'Please enter your username or email and password to log in.'),
			selectors: ['#loginName', '#loginPassword']
		},
		'noPassword': {
			text: mf('login.password.password_incorrect', 'Incorrect password'),
			selectors: ['#loginPassword']
		},
		'userNotFound': {
			text: mf('login.username.usr_doesnt_exist', 'This user does not exist.'),
			selectors: ['#loginName']
		}
	},

	'Template.registerFrame': {
		'noUserName': {
			text: mf('register.warning.noUserName', 'Please enter a name for your new user.'),
			selectors: ['#registerName']
		},
		'noPassword': {
			text: mf('register.warning.noPasswordProvided', 'Please enter a password to register.'),
			selectors: ['#registerPassword']
		},
		'noEmail': {
			text: mf('register.warning.noEmailProvided', 'Please enter a email to register.'),
			selectors: ['#registerEmail']
		},
		'noCredentials': {
			text: mf('register.warning.noCredentials', 'Please enter a username, password and a email to register.'),
			selectors: ['#registerName', '#registerPassword', '#registerEmail']
		},
		'userExists': {
			text: mf('register.warning.userExists', 'This username already exists. Please choose another one.'),
			selectors: ['#registerName']
		},
		'emailNotValid': {
			text: mf('register.warning.emailNotValid', 'your email seems to have an error.'),
			selectors: ['#registerEmail']
		},
		'emailExists': {
			text: mf('register.warning.emailExists', 'This email already exists. Have you tried resetting your password?'),
			selectors: ['#registerEmail']
		}
	},

	'Template.emailRequestModal': {
		'noEmail': {
			text: mf('register.warning.noEmailProvided', 'Please enter a email to register.'),
			selectors: ['#registerEmail']
		},
		'emailNotValid': {
			text: mf('register.warning.emailNotValid', 'Your email seems to have an error.'),
			selectors: ['#registerEmail']
		},
		'emailExists': {
			text: mf('register.warning.emailExists', 'This email already exists. Have you tried resetting your password?'),
			selectors: ['#registerEmail']
		}
	},

	'default': {
		'noUserName': {
			text: mf('warning.noUserName', 'Please enter a name for your user.'),
			selectors: ['.formfield-error-username']
		},
		'userExists': {
			text: mf('warning.userExists', 'This username already exists. Please choose another one.'),
			selectors: ['.formfield-error-username']
		},
		'noEmail': {
			text: mf('warning.noEmailProvided', 'Please enter a email.'),
			selectors: ['.formfield-error-email']
		},
		'emailNotValid': {
			text: mf('warning.emailNotValid', 'Your email seems to have an error.'),
			selectors: ['.formfield-error-email']
		},
		'emailExists': {
			text: mf('warning.emailExists', 'This email is already taken.'),
			selectors: ['.formfield-error-email']
		},
		'nameError': {
			text: mf('update.username.failed', 'Failed to update username.'),
			selectors: ['.formfield-error-username']
		}
	}
};