Template.navbar.helpers ({
    kioskMode: function() {
        return Session.get('kiosk_mode');
    },

    checkActiveRoute: function() {
        var currentRoute = Router.current().route
        this.$('a[href="' + currentRoute.path(this) + '"].nav_link').addClass('active');
        this.$('a[href!="' + currentRoute.path(this) + '"].nav_link').removeClass('active');
    }
});
