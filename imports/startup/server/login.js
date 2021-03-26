import { Accounts } from 'meteor/accounts-base';
import Log from '/imports/api/log/log';

// Record a login attempt in the log
const registerAttempt = (track) => (attempt) => {
	const body = { ...attempt };
	if (attempt.user) {
		body.userId = attempt.user._id;
		body.username = attempt.user.username;
	}

	// Too much (secret) info in the user object
	delete body.user;

	const rel = [];
	if (body.userId) {
		rel.push(body.userId);
	}

	Log.record(track, rel, body);
};

Accounts.onLogin(registerAttempt('Login.Success'));
Accounts.onLoginFailure(registerAttempt('Login.Failure'));
Accounts.onLogout(registerAttempt('Logout'));
