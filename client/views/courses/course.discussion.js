  Template.discussion.post = function() {
  var posts = CourseDiscussions.find({parent_ID: null}, {sort: {time_updated: -1, time_created: -1}});
    var ordered_posts = [];// = posts.fetch();
  
    //ordered_posts = ordered_posts.concat(posts.fetch());
    //ordered_posts.concat(ordered_posts);
    
    
    posts.forEach(function (post){
        //alert(post.toSource());        
        ordered_posts.push(post);
        var answers = CourseDiscussions.find({parent_ID: post._id}, {sort: {time_created: -1}});
        //ordered_posts.push(answers);        
        answers.forEach(function (answer){
            ordered_posts.push(answer);
        });
        //ordered_posts.push(answers);
    });
    //alert(ordered_posts.toSource());
    return ordered_posts;
    
    //return CourseDiscussions.find({course_ID:Session.get("selected_course")}, {sort: {time_updated: -1, time_created: -1}});
 
};

Template.write_post.events({
    'click input.add': function () {
        var now = new Date();
        var timestamp = now.getTime();
        var user = Meteor.userId();
        var course = Session.get("selected_course");
        //alert("isanswer: "+message.elements["message_isanswer"].checked);
        if(Session.get("postID")){
        //CourseDiscussions.update({_id:Session.get("CommentID")},
        //    {$set:{
        //        "message_updated": timestamp
        //    }}
        //);
            CourseDiscussions.insert({
                "parent_ID":Session.get("postID"),
                "course_ID":course,
                "time_created":timestamp,
                "user_ID":user,
                "title":$("#post_title").val(),
                "text":$("#post_text").val()
            });
            CourseDiscussions.update({_id:Session.get("postID")},
                {$set:{
                    "time_updated":timestamp
                }}
            );
        }else{
            CourseDiscussions.insert({
                "course_ID":course,
                "time_created":timestamp,
                "user_ID":user,
                "title":$("#post_title").val(),
                "text":$("#post_text").val()
            });
        }
      
        Session.set("showPostDialog", false);
        Session.set("postID", false);
    },
    'click input.cancel': function () {
        Session.set("showPostDialog", false);
        Session.set("postID", false);
    }
  });

Template.postDialog.showPostDialog = function () {
    return Session.get("showPostDialog");
  };  
  
Template.discussion.events({
    'click input.answer': function (template) {
      //alert(this.toSource());
      Session.set("postID", this._id);      
      Session.set("showPostDialog", true);
      //alert("ID: "+document.forms[2].elements["message_id"].value);
    },
    'click input.showDialog': function () {
        Session.set("showPostDialog", true);
    }
});