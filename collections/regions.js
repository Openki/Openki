// ======== DB-Model: ========
// "_id"      -> ID
// "name"     -> String
// "loc"      -> Geodata {type:Point, coordinates: [long, lat]}  (not lat-long !)
// "timeZone" -> String,  ex: "UTC+01:00"
// ===========================Regions = new Meteor.Collection("Regions");

Regions = new Meteor.Collection("Regions");
if (Meteor.isServer) Regions._ensureIndex({loc : "2dsphere"});

