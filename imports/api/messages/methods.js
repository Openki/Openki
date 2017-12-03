import ClientMessages from './messages.js';

export function AddMessage(message, type = 'info') {
	ClientMessages.insert({ message, type });
}

export function RemoveMessage(id) {
	ClientMessages.remove({ _id: id });
}
