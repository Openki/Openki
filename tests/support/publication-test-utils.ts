import { getMeteorCollection } from "./getMeteorCollection";

export function expectNoDataReturnedFromPublication({
  publication,
  args = [],
  collectionName,
}: {
  /** Meteor publication name */
  publication: string;
  /** Subscription arguments */
  args?: unknown[];
  /** Collection name */
  collectionName: string;
}) {
  cy.testSubscription(publication, ...args).then(({ subscription, Meteor }) => {
    const collection = getMeteorCollection(collectionName, Meteor);

    expect(collection.find().fetch()).length(0);

    // Cleanup
    subscription.stop();
  });
}

export function expectPublicationReturnsData({
  publication,
  args = [],
  collectionName,
}: {
  /** Meteor publication name */
  publication: string;
  /** Subscription arguments */
  args?: unknown[];
  /** Collection name */
  collectionName: string;
}) {
  cy.testSubscription(publication, ...args).then(({ subscription, Meteor }) => {
    const collection = getMeteorCollection(collectionName, Meteor);

    expect(collection.find().fetch().length).to.be.above(0);

    // Cleanup
    subscription.stop();
  });
}
