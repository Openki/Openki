mfPkg.init('en');

getSlug = function(Text){
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}

search_user=function(username){

		result=Meteor.users.findOne({username:username})
		return result;
}

escapeRegex = function (string){
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}



checkInsert = function(err, id) {
	if (err) throw err
}

checkUpdateOne = function(err, aff) {
	if (err) throw err;
	if (aff != 1) throw "Query affected "+aff+" docs, expected 1"
}

saneHtml = function(unsaneHtml) {
	return sanitizeHtml(unsaneHtml, {
		allowedTags: [ 'br', 'p', 'b', 'i', 'u', 'a', 'h3', 'h4', 'blockquote'],
		allowedAttributes: {
			'a': [ 'href' ]
		}
	});
}