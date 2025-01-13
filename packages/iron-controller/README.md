Iron.Controller
====================================

A controller class for dynamic layouts.

## Example

```javascript
if (Meteor.isClient) {
  Template.PageOne.helpers({
    greeting: function () {
      // access the controller on this template or the closest parent ancestor
      // component
      var controller = Iron.controller();

      // access controller reactive state variables
      return controller.state.get('greeting');
    }
  });

  Meteor.startup(function () {
    controller = new Iron.Controller;

    // insert a controller into the dom just like an Iron.DynamicTemplate or
    // Iron.Layout.
    controller.insert({el: document.body});

    // set the layout template just like on an Iron.Layout
    controller.layout('MasterLayout');

    // wait on a function that can return true or false
    controller.wait(function () {
      return Session.get('sub1');
    });

    Deps.autorun(function (c) {
      // reactive ready() function returns true if all functions in the waitlist
      // have returned true and false otherwise
      if (controller.ready()) {

        // render the PageOne template with a data context
        controller.render('PageOne', {
          data: {title: 'Title from Data Context'}
        });
      } else {
        controller.render('Loading');
      }
    });

    // render Footer template to the footer region
    controller.render('Footer', {to: 'footer'});

    // set the greeting reactive state variable
    controller.state.set('greeting', 'EventedMind');
  });
}
```

```html
<template name="MasterLayout">
  <h1>Master Layout</h1>

  {{> yield}}

  <footer>
    {{> yield "footer"}}
  </footer>
</template>

<template name="PageOne">
  <h2>Page One: {{title}}</h2>

  <p>
    Hello, {{greeting}} (from a Controller reactive variable)
  </p>

</template>

<template name="Footer">
  Footer content goes here.
</template>

<template name="Loading">
  <p>
    Loading (Session.set('sub1', true) to finish loading)...
  </p>
</template>
```
