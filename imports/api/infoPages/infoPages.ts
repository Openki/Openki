import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { runBackgroundTasks } from "/imports/utils/background-tasks";

/** DB-Model */
export interface InfoPagesEntity {
  /** URL-path of the page /info/:slug */
  slug: string;
  /** eg. en, de, de-ZH */
  locale: string;
  /** Helps to find the most exact language. eg. de-ZH: 3, de: 2, en: 1 */
  accuracy: number;
  /** title of the page, shown in the browser's title bar or in the page's tab */
  title: string;
  /** the content of the page, its supports markdown */
  body: string;
}

/*
Example
You can add a multi-line page with this script:
db.getCollection('InfoPages').insert({
	"slug" : "faq",
	"locale" : "de",
	"accuracy" : 2,
	"title" : "Häufige Fragen",
	"body" : `## Allgemein
### Was ist Openki?
Openki ist eine offene Bildungsplattform.`
})
 */

export class InfoPagesCollection extends Mongo.Collection<InfoPagesEntity> {
  constructor() {
    super("InfoPages");

    if (Meteor.isServer && runBackgroundTasks) {
      this.createIndex({ slug: 1, locale: 1, accuracy: -1 });
    }
  }
}

export const InfoPages = new InfoPagesCollection();
