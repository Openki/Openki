import { EventEntity } from '../api/events/events';

export function AffectedReplicaSelectors(event: EventEntity) {
	// If the event itself is not in the DB, we don't expect it to have replicas
	if (!event._id) return { _id: "" }; // Finds nothing

	// Only replicas future from the edited event are updated
	// replicas in the past are never updated
	let futureDate = event.start;
	if (futureDate < new Date()) {
		futureDate = new Date();
	}

	const selector: Mongo.Selector<EventEntity> = {
		_id: { $ne: event._id }, // so the event is not considered to be its own replica
		start: { $gte: futureDate },
	};

	if (event.replicaOf) {
		selector.$or = [{ replicaOf: event.replicaOf }, { _id: event.replicaOf }];
	} else {
		selector.replicaOf = event._id;
	}

	return selector;
}

export default AffectedReplicaSelectors;
