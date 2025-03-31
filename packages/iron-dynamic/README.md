Iron.DynamicTemplate
===============================================================
Dynamic templates and data contexts for Meteor.

## Templates and Helpers

```html
<body>
  {{> DynamicTemplate template=getTemplate data=getDataContext}}
</body>

<template name="MyDynamicTemplate">
  My Template Content with Title: {{title}}
</template>
```

```javascript
if (Meteor.isClient) {
  UI.body.helpers({
   getTemplate: function () {
     return 'MyDynamicTemplate';
   },
   
   getDataContext: function () {
     return { title: 'My Title' };
   }
  });
}
```

## Parent Data Contexts

```html
<body>
  {{#with someParentData}}
    {{> DynamicTemplate template=getTemplate}}
  {{/with}}
</body>
```

## Default Template Content

```html
<body>
  {{#DynamicTemplate template=getTemplate}}
    No template yet? No problem just render this default content.
  {{/DynamicTemplate}}
</body>
```

## From JavaScript
```html
<body>
 <div id="optional-container">
 </div>
</body>

<template name="MyDynamicTemplate">
  My Template Content with Title: {{title}}
</template>
```

```javascript
if (Meteor.isClient) {
  Meteor.startup(function () {
    // create a new DynamicTemplate instance and optionally set the initial template and data.
    dynamic = new Iron.DynamicTemplate({ /* template: 'One', data: getData */});
    
    // render the component and insert it into the dom defaulting to document.body.
    dynamic.insert({el: '#optional-container'});
    
    // dynamically set the template.
    dynamic.template('MyDynamicTemplate');
    
    // dynamically set the data context.
    dynamic.data({title: 'My Title'});
    
    // clear the dynamic template
    dynamic.clear();
  });
}
```
