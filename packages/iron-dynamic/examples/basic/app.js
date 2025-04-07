if (Meteor.isClient) {
  Template.WithDynamicTemplate.helpers({
    getTemplate: function () {
      return Session.get('template');
    }
  });

  Template.WithParentDataContext.helpers({
    getData: function () {
      return {
        title: Session.get('parentData')
      };
    }
  });

  Template.InlineDataContext.helpers({
    getData: function () {
      return {
        title: Session.get('inlineTitle')
      };
    }
  });

  Template.InlineBlock.helpers({
    getTemplate: function () {
      return Session.get('template');
    }
  });

  Template.UsingHelpers.helpers({
    getData: function () {
      return Session.get('data');
    },

    getTemplate: function () {
      return Session.get('template');
    }
  });
}
