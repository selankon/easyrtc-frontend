var chatCntrl = angular.module('chatCntrl', []);

chatCntrl.controller ('chatCntrlAll', [ '$scope', 'chatEasyrtcService',
  function($scope, chatEasyrtcService) {

    //**** CHAT MOVIES
    $scope.defaultDestiny = 'To all'
    $scope.chat = chatEasyrtcService.getMsgLists();
    $scope.destiny = $scope.defaultDestiny;

    $scope.changeDestiny = function (newDest) {
      if ($scope.destiny == newDest ){ $scope.destiny = $scope.defaultDestiny;}
      else {$scope.destiny = newDest;}
      console.log("New destiny: " , newDest);
    };

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
        chatEasyrtcService.sendDataWS({ targetRoom: 'default' }, "message", $scope.chat.newMsg );
      } else {
        chatEasyrtcService.sendDataWS($scope.chat.newMsg.to, "message", $scope.chat.newMsg);
      }
      chatEasyrtcService.msgReceived("ME","message", $scope.chat.newMsg);

      $scope.destiny = $scope.defaultDestiny;

      // $scope.chat.msg = '';
    };



  }]);
