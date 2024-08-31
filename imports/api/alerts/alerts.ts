import { Mongo } from "meteor/mongo";

export interface Action {
  text: string;
  href: string;
}

/** DB-Model */
export interface AlertEnity {
  /** ID */
  _id: string;
  type: string;
  message: string;
  title?: string | undefined;

  actions?: Action[] | undefined;
  /** Integer */
  timeout: number;
}
export const Alerts: Mongo.Collection<AlertEnity> = new Mongo.Collection(null); // Local collection for in-memory storage
