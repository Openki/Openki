
/* ------------------------- Startseite -------------------*/
//alert ("wilkommen auf der neuen fancy Schuel.ch Homepage");

// allgemeine praktische funktionen

Template.maincontent.route_is = function (data,options) {
// strube funktion, die irgendwas macht, aber es tut
// macht, dass das routing im template "maincontent" funtkioniert
    if ( Session.equals( 'page_id', data ) ) {
	return options.fn( this );
    }
    return options.inverse( this );
};

Accounts.ui.config({
	passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});