if (Meteor.isClient) {
  Meteor.startup(function () {
    log = function (name, thisArg, args) {
      console.log('****************************');
      console.log(name);
      console.log(thisArg);
      console.log(args);
      console.log('****************************');
    };

    dynamic = new Iron.DynamicTemplate(/* {template: 'One', data: getData} */);  

    dynamic.template('One');

    _.each(['onCreated', 'onMaterialized', 'onRendered', 'onDestroyed'], function (hook) {
      dynamic[hook](function () {
        log(hook, this, arguments);
      });
    });


    dynamic.insert({el: '#container'});

    setInterval(function () {
      dynamic.data({title: Random.id()});
    }, 2000);
  });
}
