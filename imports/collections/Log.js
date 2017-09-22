/** The Application Log records user and system decisions. It is intended to
  * become the single source of truth within the application.
  *
  * The log is helpful in reconstructing the state of the app when things
  * went wrong. when wrong values were recorded, these log entries are not
  * changed, but new ones with the corrected values written.
  * It is important that log entries are not changed once written. Only in these
  * instances should we consider it:
  *  - An update needs to rename the track names or add relation ID
  *  - An update needs to update the body of a track
  *  - When we really want to.
  * So Changes should only happen while the service is down and we boot into a
  * new world.
  *
  * There are four fields to every log-entry:
  *    tr (track String)
  *       This separates log entries into classes.
  *       Entries on the same track are expected to have a similarily
  *       structured body, but this structure may change over time.
  *
  *   rel (list of relation ID)
  *       List of lookup ID strings. These are used to select log-entries in
  *       queries.
  *
  *    ts (timestamp Date)
  *       The time the log entry was recorded.
  *
  *  body (Object)
  *       Contents of the log entry. These are not indexed and depend on the
  *       track.
  */
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


Log.findFilter = function(filter, limit) {
	check(filter,
		{ start: Match.Optional(Date)
		, rel: Match.Optional([String])
		, tr: Match.Optional([String])
		}
	);
	check(limit, Number);

	const query = {};
	if (filter.start) query.ts = { $lte: filter.start };
	if (filter.rel) query.$or = [ { _id: { $in: filter.rel} }, { rel: { $in: filter.rel } } ];
	if (filter.tr) query.tr = { $in: filter.tr };

	return Log.find(query, { sort: { ts: -1 }, limit: limit });
};
