import { AddMessage } from '/imports/api/messages/methods.js';

export default function ShowServerError(message, err) {
	AddMessage(mf('_serverError', { ERROR: err, MESSAGE: message}, 'There was an error on the server: "{MESSAGE} ({ERROR})." Sorry about this.'), 'danger');
}
