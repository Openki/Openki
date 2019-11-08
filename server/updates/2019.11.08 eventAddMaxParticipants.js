import Events from '/imports/api/events/events';

import UpdatesAvailable from '/server/lib/updates';


/** extend events with maxParticipants
  *
  * extend events-collection with the new field maxParticpants
  * and set a default value of 0
  */
UpdatesAvailable['2019.11.08 eventAddMaxParticipants'] = () => Events.update(
	{ maxParticipants: { $exists: false } },
	{ maxParticipants: 0 },
	{ multi: true },
);
