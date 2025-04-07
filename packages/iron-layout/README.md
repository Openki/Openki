Iron.Layout
==============================================================================
Dynamic layout with support for rendering dynamic templates into regions.

Iron.Layout is the page rendering engine for Iron.Router. Layouts can also
be used independently for composing templates. For example, your app might
have a standard dialog box layout and you want to populate content dynamically
into the dialog box depending upon what kind of dialog it is.

## Reusing Templates with a Layout

```html
<template name="DialogBox">
  <div id="header">
    {{> yield "header"}}
  </div>
  
  <div id="main">
    {{> yield}}
  </div>
  
  <div id="footer">
    {{> yield "footer"}}
  </div>
</template>

<template name="SomeDialog">
  {{#Layout template="DialogBox" data=getSomeDataContext}}
    {{#contentFor "header"}}
      <h1>My Header</h1>
    {{/contentFor}}
    
    <p>
      The main content goes here.
    </p>
    
    {{#contentFor "footer"}}
      Footer content goes here.
    {{/contentFor}}
  {{/Layout}}
</template>
```

## From JavaScript
```html
<body>
  <div id="optional-container">
  </div>
</body>
```

```javascript
if (Meteor.isClient) {
  Meteor.startup(function () {
    layout = new Iron.Layout({/* template: 'MyLayout', data: dataFunction */ });
    
    // insert the layout with an optinoal container element
    layout.insert({el: '#optional-container'});
    
    // set the template for the layout
    layout.template('DialogBox');
    
    // set the data context for the layout
    layout.data({title: 'Some Layout Title'});
    
    // render MainTemplate into the main region of the layout
    layout.render('MainTemplate');
    
    // render the MyHeader template to the 'header' region of the layout.
    layout.render('MyHeader', {to: 'header'});
    
    // render the MyFooter template to the 'footer' region of the layout. Also set a custom data context for the region.
    layout.render('MyFooter', {to: 'footer', data: {title: 'Custom footer data context'}});
  });
}
```

## Rendering Transactions
```javascript
if (Meteor.isClient) {
  Meteor.startup(function () {
    layout = new Iron.Layout({template: 'DialogBox'});
    
    // insert the layout with an optinoal container element
    layout.insert({el: '#optional-container'});
    
    // start recording which regions have been rendered into
    layout.beginRendering();
    
    // render MainTemplate into the main region of the layout
    layout.render('MainTemplate');
    
    // render the MyHeader template to the 'header' region of the layout.
    layout.render('MyHeader', {to: 'header'});
    
    // render the MyFooter template to the 'footer' region of the layout. Also set a custom data context for the region.
    layout.render('MyFooter', {to: 'footer', data: {title: 'Custom footer data context'}});
    
    // force a Deps.flush and get an object of
    // regions that have been rendered. In this case:
    // => {"main": true, "header": true, "footer": true}
    var renderedRegions = layout.endRendering();
  });
}
```
