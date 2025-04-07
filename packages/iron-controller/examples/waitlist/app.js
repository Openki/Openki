if (Meteor.isClient) {
  list = new Iron.WaitList;
  handle = new Blaze.ReactiveVar(false);
  count = 0;

  Deps.autorun(function (c) {
    if (count > 5) return;

    count++;
    list.ready();
    list.wait(function () { return handle.get(); });
  });
}
