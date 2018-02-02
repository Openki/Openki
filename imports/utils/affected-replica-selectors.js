export default AffectedReplicaSelectors = function(event) {
	// If the event itself is not in the DB, we don't expect it to have replicas
	if (!event._id) return { _id: -1 }; // Finds nothing

	// Only replicas future from the edited event are updated
	// replicas in the past are never updated
	var futureDate = event.start;
	if (futureDate < new Date()) futureDate = new Date();

	var selector = {
		_id: { $ne: event._id }, // so the event is not considered to be its own replica
		start: { $gte: futureDate }
	};

	if (event.replicaOf) {
		selector.$or = [
			{ replicaOf: event.replicaOf },
			{ _id: event.replicaOf }
		];
	} else {
		selector.replicaOf = event._id;
	}

	return selector;
};
