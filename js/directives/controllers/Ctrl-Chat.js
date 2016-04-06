var chatCntrl = angular.module('chatCntrl', []);

chatCntrl.controller ('chatCntrlAll', [ '$scope', 'chatEasyrtcService', 'sounds',
  function($scope, chatEasyrtcService, sounds) {

    // *********************
    // CONFIGURE AND START CHAT_EASYRTC
    // *********************

    //**** CHAT MOVIES
    $scope.defaultDestiny = ' all'
    $scope.chat = chatEasyrtcService.getMsgLists();
    $scope.destiny = $scope.defaultDestiny;


    chatEasyrtcService.configureChat(
      function( who ,msgType, msg) {
         setTimeout(function() {
             $scope.$apply(function () {
                 console.log("Message received!who: " , who," type:" , msgType, "  msg  ", msg );
                //  $scope.chat.msgList.push(msg);
                //  $scope.audMsgReceived();
                // $scope.isSpecialMessage = false;
                // if ($scope.specialChatMessageReceived (msg))
                // $scope.specialChatMessageReceived (msg)
                // console.log("$scope.isSpecialMessage" , $scope.isSpecialMessage);
                // if (!$scope.isSpecialMessage){
                  // $scope.chat.chatList.push (msg);
                  chatEasyrtcService.updateMsgList (msg);
                  chatEasyrtcService.playSound(sounds.chatMessageAlert);
                // }

             }, 0);
         });
      }
    );


    $scope.changeDestiny = function (newDest) {
      if ($scope.destiny == newDest ){ $scope.destiny = $scope.defaultDestiny;}
      else {$scope.destiny = newDest;}
      console.log("New destiny: " , newDest);
    };

    $scope.send = function (msg) {

      var messageType = "chatMessage";
      $scope.chat.newMsg  = chatEasyrtcService.newMessage (
        messageType,
        $scope.myId,
        $scope.destiny,
        new Date(),
        msg,
        null
      )

      console.log("Sending message: " , $scope.chat.newMsg);
      if ($scope.destiny == $scope.defaultDestiny) {
        console.log("CACAACASCSA " , $scope.chat.newMsg);
        chatEasyrtcService.sendDataWS({ targetRoom: 'default' }, "message", $scope.chat.newMsg );
        // chatEasyrtcService.sendMessage (messageType, $scope.myId, { targetRoom: 'default' }, msg);
      } else {
        chatEasyrtcService.sendMessage (messageType, $scope.myId, $scope.destiny, msg);
        // chatEasyrtcService.sendDataWS($scope.chat.newMsg.to, $scope.chat.newMsg.msgType, $scope.chat.newMsg);
      }

      chatEasyrtcService.msgReceived("ME", $scope.chat.newMsg.msgType, $scope.chat.newMsg);

      $scope.destiny = $scope.defaultDestiny;

      // $scope.chat.msg = '';
    };



  }]);
