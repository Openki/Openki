import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
// "_id"           -> ID
// "message"       -> {
//   "type"      -> String
//   "message"   -> String
//   "timeout"   -> Integer
// }
export default Alerts = new Mongo.Collection(null);
