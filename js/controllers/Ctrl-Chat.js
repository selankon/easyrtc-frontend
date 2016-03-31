var chatCntrl = angular.module('chatCntrl', []);

chatCntrl.controller ('chatCntrlAll', [ '$scope', 'sounds',
  function($scope, sounds) {

    //**** CHAT MOVIES
    $scope.defaultDestiny = 'To all'
    $scope.destiny = $scope.defaultDestiny;
    $scope.chat = {msgList: '', msg: ''};
    $scope.chat.msgList = [];

    $scope.audMsgReceived = function (){
      var audio = new Audio(sounds.chatMessageAlert);
      audio.play();
    }

    $scope.send = function (msg) {

      // var msg = $scope.chat.newMsg.content;
      $scope.chat.newMsg  =  {
           from :  $scope.myId,
           to: $scope.destiny,
           date : new Date(),
           content : msg,
           meta : null
         };

      console.log("Sending message: " , $scope.chat.newMsg);
      if ($scope.destiny == $scope.defaultDestiny) {
        $scope.easyrtc.sendDataWS({ targetRoom: 'default' }, "message", $scope.chat.newMsg );
      } else {
        $scope.easyrtc.sendDataWS($scope.chat.newMsg.to, "message", $scope.chat.newMsg);
      }
      $scope.msgReceived("message", $scope.chat.newMsg);

      $scope.destiny = $scope.defaultDestiny;

      // $scope.chat.msg = '';
    };

    $scope.msgReceived = function ( msgType, msg) {
        setTimeout(function() {
            $scope.$apply(function () {
                // if (angular.isObject(msg)) {
                //     who = content.from;
                //     content = content.msg;
                // }
                console.log("Message received!" , msg, "  type  ", msgType );
                $scope.chat.msgList.push(msg);
                // var audio = new Audio(sounds.chatMessageAlert);
                // audio.play();
                $scope.audMsgReceived();
            }, 0);
        });
    };

    $scope.changeDestiny = function (newDest) {
      if ($scope.destiny == newDest ){ $scope.destiny = $scope.defaultDestiny;}
      else {$scope.destiny = newDest;}
      console.log("New destiny: " , newDest);
    };

  }]);
