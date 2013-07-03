
get_timestamp = function (){
	var now = new Date();
	return now.getTime();		
}


format_date= function (date){
	var d= new Date(date);
	var curr_date = d.getDate();
	var curr_month = d.getMonth() + 1; //Months are zero based
	var curr_year = d.getFullYear(); 
	var date_string=curr_date + "." + curr_month + "." + curr_year;
	return date_string;	
}

display_username= function (userid){
  var user= Meteor.users.findOne({_id:userid});
  if(user.username){
  	  return user.username;	  
  }else{
  	  return "userid: "+user._id; // solange .username noch nix ist, haben wir nur die _id...
  }
}
