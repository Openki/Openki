
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



checkInsert = function(err, id) {
	if (err) throw err
}

checkUpdateOne = function(err, aff) {
	console.log(err, aff)
	if (err) throw err;
	if (aff != 1) throw "Query affected "+aff+" docs, expected 1"
}