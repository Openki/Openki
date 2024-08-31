import { Mongo } from "meteor/mongo";

/** DB-Model */
export interface AlertEnity {
  /** ID */
  _id: string;
  type: string;
  message: string;
  title?: string | undefined;

  links?: { text: string; href: string }[] | undefined;
  /** Integer */
  timeout: number;
}
export const Alerts: Mongo.Collection<AlertEnity> = new Mongo.Collection(null); // Local collection for in-memory storage
