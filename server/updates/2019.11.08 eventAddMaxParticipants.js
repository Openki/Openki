import UpdatesAvailable from '/server/lib/updates';
/** Clean bogus null recipients
  *
  * extend events-collection with the new field maxParticpants
  * and set a default value of 0
  */
/* eslint-disable-next-line no-undef */
UpdatesAvailable['2019.11.08 eventAddMaxParticipants'] = () => {
	return Events.update(
		{ maxParticipants: { $exists: false } },
		{ maxParticipants: 0 },
		{ multi: true },
	);
};
