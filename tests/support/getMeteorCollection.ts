export function getMeteorCollection<T = Mongo.Collection<unknown>>(name: string, Meteor: unknown) {
  // @ts-expect-error We don't have a proper Meteor global type in this context
  // since the TS declaration merging only happens in the app code and not for tests.
  const collection = Meteor.connection._stores[name]?._getCollection() as T;

  if (!collection) {
    throw new Error(`Could not get collection "${name}".

Hint: It might not be loaded yet.

Make sure you call cy.allSubscriptionsReady() before getting collections.`);
  }

  return collection as T;
}
