/* ------------------------- Chat -------------------------*/

  Template.chat.lastMessage = function (){
    var tempList = Messages.find();
    var lastIndex = tempList.count() - 1; // berechne den Index der letzten Message
    var list = Messages.find().fetch();

    // wenns eine letzte message gibt, gib den text aus
    return list[lastIndex] && list[lastIndex].text;
  };

  Template.chat.isShowingChat = function (){
    // ist der Chat sichtbar?
    return Session.get("isShowingChat");
  }

  Template.chat.messages = function (){
    // gib alle Messages aus, umgekehrt sortiert nach "sent".
    return Messages.find({}, {sort:  {sent: -1}});
  }
  Template.chat.chatName = function (){
    // gib den chatName zur�ck, wie er in der Session gespeichert ist
    return Session.get("chatName");
  }
  Template.chat.isEditingChatName = function (){
    // wird der Chatname editiert?
    return Session.get("isEditingChatName");
  }
  Template.chat.events({
    'click #send' : function (){
        // bei click auf den button mit der id "send" speichere Message
        saveChatMessageAndName();
    },
    'keydown #message' : function(e){
        // bei keydown "Enter" speichere Message
        if(e.which==13)
        saveChatMessageAndName();
    },
    'click #editName' : function(e){
        // bei click auf chatname, verwandle es in ein inputfield, siehe html
        Session.set("isEditingChatName", true);
    },
    'click #deleteChat' : function (){
        var tempList = Messages.find();
        var count = tempList.count();
        var list = Messages.find().fetch();

        // gehe durch alle Messages in der DB und l�sch sie.
        for(var i=0; i<count; i++){
            Messages.remove(list[i]._id);
        }
    },
    'click #hide' : function (){
      // hide chat if it is showing, and vice versa
      Session.set("isShowingChat", !Session.get("isShowingChat"));
    }

  });



function saveChatMessageAndName(){

      var message = document.getElementById('message').value;
      if (message==""){
          // if user want to post a empty message, warn him and dont post
          alert("Please, type a message!");

      }else{
          // handle different possibilities of name-definitions
          var elemChatName = document.getElementById('chatName');
          var chatName = "unknown";

          // if no inputfield was in the html
          if(!elemChatName){
              chatName = Session.get("chatName");
          }
          // if inputfield and it is not empty, save into session
          else if(elemChatName.value != ""){
              chatName = elemChatName.value;
              Session.set("chatName", chatName );
          }

          // insert new message into the db, with text, username and date&time
          Messages.insert({text: message, sent: new Date(), name: chatName});
          // clear the input field
          document.getElementById('message').value = "";
          // set inputfield of the name to a normal "span", siehe html
          Session.set("isEditingChatName", false);

      }
}
