import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
// "_id"           -> ID
// "message"       -> {
//   "type"      -> String
//   "message"   -> String
//   "timeout"   -> Integer
// }
const Alerts = new Mongo.Collection(null);

export default Alerts;
