import { getMeteorCollection } from "./getMeteorCollection";

/**
 * This method is useful to verify that a publication does not return any data,
 * for when called with invalid arguments - or when the current user can't access the resource.
 */
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

/**
 * This method is useful to verify that a publication returns data when called with valid
 * arguments, and the current user has valid authorization.
 */
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
