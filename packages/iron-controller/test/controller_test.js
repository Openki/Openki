String.prototype.compact = function () {
  return this.trim().replace(/\s/g, '').replace(/\n/g, '');
};

var ReactiveVar = function (value) {
  this._value = value;
  this._dep = new Deps.Dependency;
};

ReactiveVar.prototype.get = function () {
  this._dep.depend();
  return this._value;
};

ReactiveVar.prototype.set = function (value) {
  if (value !== this._value) {
    this._value = value;
    this._dep.changed();
  }
};

ReactiveVar.prototype.clear = function () {
  this._value = null;
  this._dep = new Deps.Dependency;
};

// a reactive template variable we can use
var reactiveTemplate = new ReactiveVar;

// a reactive data variable we can use
var reactiveData = new ReactiveVar;

var withDiv = function (callback) {
  var el = document.createElement('div');
  document.body.appendChild(el);
  try {
    callback(el);
  } finally {
    document.body.removeChild(el);
  }
};

var withRenderedTemplate = function (template, callback) {
  withDiv(function (el) {
    template = _.isString(template) ? Template[template] : template;
    Blaze.render(template, el);
    Deps.flush();
    callback(el);
  });
};

Tinytest.add('Controller - inheritance', function (test) {
  var calls = [];

  Parent = Iron.Controller.extend({
    parentProp: true
  });

  test.instanceOf(Parent.extend, Function);
  test.equal(Parent.__super__, Iron.Controller.prototype);
  test.isTrue(Parent.prototype.parentProp);

  Child = Parent.extend({
    childProp: true
  });

  test.instanceOf(Child.extend, Function);
  test.equal(Child.__super__, Parent.prototype);
  test.isTrue(Child.prototype.childProp);

  var c = new Child;
  test.isTrue(c.childProp);
  test.isTrue(c.parentProp);

  // test constructor overloading
  var calls = [];
  ChildB = Parent.extend({
    constructor: function () {
      calls.push('ChildB');
    }
  });

  var c = new ChildB;
  test.equal(calls.length, 1);
});

Template.ControllerChangeTest.helpers({
  id: function () {
    var c = Iron.controller();
    return c && c.options.id;
  }
});

Tinytest.add('Controller - change layout controllers', function (test) {
  var layout = new Iron.Layout;
  withRenderedTemplate(layout.create(), function (el) {
    // start off with no controller
    layout.render('ControllerChangeTest');
    Deps.flush();
    test.equal(el.innerHTML.compact(), "Controller-");

    // change the controller on the layout
    var c1 = new Iron.Controller({layout: layout, id: 1});
    Deps.flush();
    test.equal(el.innerHTML.compact(), "Controller-1");

    // now swap out the controller
    var c2 = new Iron.Controller({layout: layout, id: 2});
    Deps.flush();
    test.equal(el.innerHTML.compact(), "Controller-2");
  });
});

Template.ControllerTest.helpers({
  id: function () {
    var c = Iron.controller();
    return c && c.options.id;
  }
});

Template.ControllerChild.helpers({
  id: function () {
    var c = Iron.controller();
    return c && c.options.id;
  }
});

Tinytest.add('Controller - Iron.controller() lookup in helpers', function (test) {
  var layout = new Iron.Layout;
  withRenderedTemplate(layout.create(), function (el) {
    // start off with no controller
    layout.render('ControllerTest');
    Deps.flush();
    test.equal(el.innerHTML.compact(), "Parent-Child-");

    // set the controller on the layout
    var c1 = new Iron.Controller({layout: layout, id: 1});
    Deps.flush();

    // Iron.controller() should work for child templates and parent
    // templates
    test.equal(el.innerHTML.compact(), "Parent-1Child-1");
  });
});

var lastEvent = null;

Template.ControllerEventHandler.events({
  'click': function () {
    var c = Iron.controller();
    lastEvent = {id: c && c.options.id};
  }
});

Tinytest.add('Controller - Iron.controller() lookup in event handlers', function (test) {
  var layout = new Iron.Layout({template: 'ControllerEventHandler'});
  withRenderedTemplate(layout.create(), function (el) {
    test.equal(el.innerHTML.compact(), "<div>TriggerClick</div>");

    var c1 = new Iron.Controller({layout: layout, id: 1});
    Deps.flush();

    $(el).find('div').trigger('click');
    test.isTrue(lastEvent, 'last event is set');
    test.equal(lastEvent.id, 1);
  });
});

Template.ReactiveStateTest.helpers({
  postId: function () {
    var c = Iron.controller();
    return c && c.state.get('postId');
  }
});

Tinytest.add('Controller - reactive state variables', function (test) {
  var layout = new Iron.Layout;
  withRenderedTemplate(layout.create(), function (el) {
    layout.render('ReactiveStateTest');
    Deps.flush();
    test.equal(el.innerHTML.compact(), "");

    var c = new Iron.Controller({layout: layout});
    c.state.set('postId', 1);
    Deps.flush();
    test.equal(el.innerHTML.compact(), "1");

    var c = new Iron.Controller({layout: layout});
    c.state.set('postId', 2);
    Deps.flush();
    test.equal(el.innerHTML.compact(), "2");
  });
});
