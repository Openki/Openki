import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
// _id              -> ID
// name             -> String
// loc              -> Geodata {type:Point, coordinates: [long, lat]}  (not lat-long !)
// timeZone         -> String,  ex: "UTC+01:00"
// courseCount      -> Number of courses in that region, calculated field
// futureEventCount -> Number of future events in that region, calculated field
// featuredGroup    -> ID of featured group
// ===========================

export default Regions = new Mongo.Collection('Regions');
if (Meteor.isServer) Regions._ensureIndex({ loc : '2dsphere' });
