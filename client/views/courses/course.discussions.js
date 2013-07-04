Template.messages.message = function() {
    return CourseDiscussions.find({course_ID:Session.get("selected_course")},
                                  {sort: {message_updated: -1, message_time: -1, answers:{message_time: -1}}});
  };
  
Template.write_message.events({
    'click input.write': function () {
      var now = new Date();
      var timestamp = now.getTime();
      var user = Meteor.userId();
      var course = Session.get("selected_course");
      var message = document.forms[0];
      //alert("isanswer: "+message.elements["message_isanswer"].checked);
      if(Session.get("CommentID")){
        CourseDiscussions.update({_id:Session.get("CommentID")},
                        {$set:{"message_updated": timestamp}});
        CourseDiscussions.update({_id:Session.get("CommentID")}, 
                        {$push:{answers:{"message_title":message.elements["message_titel"].value,
                      "message_text":message.elements["message_text"].value,
                      "message_time":timestamp,
                      "user_ID":user,
                      "course_ID":course}}});
      }else{
        CourseDiscussions.insert({"message_title":message.elements["message_titel"].value,
                      "message_text":message.elements["message_text"].value,
                      "message_time":timestamp,
                      "user_ID":user,
                      "course_ID":course});
      }
      
      Session.set("showCommentDialog", false);
      Session.set("CommentID", false);
    },
    'click input.cancel': function () {
      Session.set("showCommentDialog", false);
      Session.set("CommentID", false);
    }
  });

Template.commentDialog.showCommentDialog = function () {
    return Session.get("showCommentDialog");
  };  
  
  Template.messages.events({
    'click input.answerbutton': function (template) {
      //alert(this.toSource());
      Session.set("CommentID", this._id);      
      Session.set("showCommentDialog", true);
      //alert("ID: "+document.forms[2].elements["message_id"].value);
    },
    'click input.showDialog': function () {
      Session.set("showCommentDialog", true);
    }
  });