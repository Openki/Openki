
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