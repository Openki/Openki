Log = new Meteor.Collection('Log');
Log._ensureIndex({ tr: 1});
Log._ensureIndex({ ts: 1});
Log._ensureIndex({ rel: 1});

Openki = {};

/** Record a new entry to the log
  *
  * @param  {String} track   - type of log entry
  * @param  {String} rel     - related ID
  * @param  {Object} body    - log body depending on track
  */
Openki.Log = function(track, rel, body) {
	check(track, String);
	check(rel, [String]);
	check(body, Object);
	var entry =
		{ tr: track
		, ts: new Date()
		, rel: rel
		, body: body
		};

	Log.insert(entry);
};