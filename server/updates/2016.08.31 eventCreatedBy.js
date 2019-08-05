import Events from '/imports/api/events/events';

const UpdatesAvailable = [];

// eslint-disable-next-line func-names
UpdatesAvailable['2016.08.31 eventCreatedBy'] = function () {
	return Events.update({}, { $rename: { createdby: 'createdBy' } }, { multi: true });
};
