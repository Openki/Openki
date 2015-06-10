Template.role_details.created = function() {
    this.enrolling = new ReactiveVar(false);
};

Template.role_details.helpers({
    enrolling: function() { return Template.instance().enrolling.get() },

    roleSubscribe: function() {
        return 'roles.'+this.type+'.subscribe';
    },  
    
    roleSubscribed: function() {
        return 'roles.'+this.type+'.subscribed';
    },
    
    maySubscribe: function(role) {
        var operator = Meteor.userId();
        
        // Show the participation buttons even when not logged-in.
        // fun HACK: if we pass an arbitrary string instead of falsy
        // the maySubscribe() will return true if the user could subscribe
        // if they were logged-in. Plain abuse of maySubscribe().
        if (!operator) operator = 'unlogged';

        return maySubscribe(operator, this.course, operator, role);
    }
});

Template.role_details.events({
    'click button.enrol': function(e, template) {
        if (pleaseLogin()) return;
        template.enrolling.set(true);
        return false;
    },
    
    'click button.subscribe': function (e, template) {
        if (template.find('.incognito')) {
            var incognito = $(template.find('.incognito')).prop('checked');
        } else incognito = false
        Meteor.call("add_role", this.course._id, Meteor.userId(), this.roletype.type, incognito);
        
        // Store the comment
        var comment = $(template.find('.enrol_as_comment')).val();
        Meteor.call("change_comment", this.course._id, comment);
        template.enrolling.set(false);
        return false;
    },

    'click button.cancel': function (e, template) {
        template.enrolling.set(false);
        return false;
    },

    'click button.unsubscribe': function () {
        Meteor.call('remove_role', this.course._id, this.roletype.type);
        return false;
    }
});
