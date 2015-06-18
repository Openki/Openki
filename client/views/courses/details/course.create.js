Template.proposecourse.rendered = function () {
    var currentPath = Router.current().route.path(this)
    $('a[href!="' + currentPath + '"].nav_link').removeClass('active');
    $('a[href="' + currentPath + '"].subnav_link').parent().parent().parent().children('a').addClass('active');
}
