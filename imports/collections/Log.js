export default Log = new Meteor.Collection('Log');

if (Meteor.isServer) {
	Log._ensureIndex({ tr: 1});
	Log._ensureIndex({ ts: 1});
	Log._ensureIndex({ rel: 1});
}

/** Record a new entry to the log
  *
  * @param  {String} track   - type of log entry
  * @param  {String} rel     - related ID
  * @param  {Object} body    - log body depending on track
  */
Log.record = function(track, rel, body) {
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