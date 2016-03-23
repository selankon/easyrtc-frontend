var audioVideoCntrl = angular.module('audioVideoCntrl', []);

audioVideoCntrl.controller ('audiovideoPage', [ '$scope', '$stateParams', '$mdDialog', '$mdMedia',
    function($scope, $stateParams, $mdDialog, $mdMedia) {
      $scope.roomId = $stateParams.roomId;
      $scope.myId = false;
      $scope.callInProgres = false;

      $scope.$watch(function() { return $mdMedia('gt-sm'); }, function(big) {
         $scope.screenIsSmall = big;
      });

      // ****  ACCEPT OR REJECT THE CALL
      easyrtc.setAcceptChecker(function(easyrtcid, callback) {
          callerPending = easyrtcid;
          var params = {
            title : "Incoming call",
            textContent : null,
            ariaLabel : "Incoming call",
            ok : "Accept",
            cancel : "Reject"
          };
          if( easyrtc.getConnectionCount() > 0 ) {
            params.textContent = "Drop current call and accept new from " + easyrtc.idToName(easyrtcid) + " ?";
          }
          else {
            params.textContent = "Accept incoming call from " + easyrtc.idToName(easyrtcid) + " ?";
          }
          console.log("incoming call", params.textContent);

          $scope.acceptTheCall = function(wasAccepted) {
           //  document.getElementById("acceptCallBox").style.display = "none";
            if( wasAccepted && easyrtc.getConnectionCount() > 0 ) {
              easyrtc.hangupAll();
            }
            callback(wasAccepted);
            callerPending = null;
          };

         //Show dialog
         $scope.showConfirm = function(data) {
           // Appending dialog to document.body to cover sidenav in docs app
           var confirm = $mdDialog.confirm()
                 .title(data.title)
                 .textContent(data.textContent)
                 .ariaLabel(data.ariaLabel)
                 .ok(data.ok)
                 .cancel(data.cancel);
           $mdDialog.show(confirm).then(function() {
             $scope.status = 'Call accepted.';
             $scope.acceptTheCall (true);
           }, function() {
             $scope.acceptTheCall (false);
             $scope.status = 'Call rejected.';
             alert ($scope.status);
           });

         };
         $scope.showConfirm(params);
        });


        // **** INIT ALL AND CONECT
        easyrtc.setStreamAcceptor( function(callerEasyrtcid, stream) {
          $scope.$apply(function() {
            $scope.callInProgres = stream.streamName;
            console.log(stream.streamName);
          });
          console.log("New Stream " , stream);
           var video = document.getElementById('caller');
           easyrtc.setVideoObjectSrc(video, stream);
       });

        easyrtc.setOnStreamClosed( function (callerEasyrtcid) {
          $scope.$apply(function() {$scope.callInProgres = false });
           easyrtc.setVideoObjectSrc(document.getElementById('caller'), "");
       });

      $scope.my_init = function (noVideo) {
         easyrtc.setRoomOccupantListener( loggedInListener);
         if (noVideo) {
           easyrtc.enableVideo(false);
           easyrtc.enableVideoReceive(false);
         }

         var connectSuccess = function(myId) {
           $scope.$apply(function() { $scope.myId = myId;});
           console.log("My easyrtcid is " + myId);
          }
          var connectFailure = function(errmesg) {
              console.log(errmesg);
          }
          easyrtc.initMediaSource(
                function(){       // success callback
                    var selfVideo = document.getElementById("self");

                    easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
                    easyrtc.setPeerListener(msgReceived);
                    easyrtc.connect($scope.roomId, connectSuccess, connectFailure);
                },
                connectFailure
          );
      };

     function loggedInListener(roomName, otherPeers) {
        $scope.$apply(function() { $scope.UserList = otherPeers;});
        $scope.startVideocallBtn  =  function(easyrtcid) {
                return function() {
                    performCall(easyrtcid);
                }
              };
      };
      $scope.performCall = function (easyrtcid) {
          easyrtc.call(
             easyrtcid,
             function(easyrtcid) {
               console.log("completed call to " + easyrtcid);
             },
             function(errorMessage) { console.log("err:" + errorMessage);},
             function(accepted, bywho) {
               $scope.$apply(function() {$scope.callInProgres = true });

                console.log((accepted?"accepted":"rejected")+ " by " + bywho);
             }
         );
      };

      //  **** VIDEO CALL BUTTONS AND CONTROLS
      $scope.stopVideo = function (bool , streamName){
        // bool = !bool;
        easyrtc.enableCamera(bool,streamName);
        console.log("Disable video ", bool , " " , streamName);
      };
      $scope.stopMicro = function (bool, streamName){
        easyrtc.enableMicrophone(bool,streamName);
        console.log("Disable micro ", bool , " " , streamName);
      };
      $scope.hangUpAll = function (){
        $scope.callInProgres = false;
        easyrtc.hangupAll();
      };
      $scope.disconnect = function (){
        easyrtc.disconnect();
        easyrtc.hangupAll();
        easyrtc.clearMediaStream( document.getElementById("self"));
        easyrtc.setVideoObjectSrc(document.getElementById("self"),"");
        easyrtc.closeLocalMediaStream();
        easyrtc.setRoomOccupantListener( function(){});
        $scope.UserList = null;
        $scope.myId = false;
        $scope.callInProgres=false;
      };

      // **** CHAT MOVIES
      $scope.defaultDestiny = 'To all'
      $scope.destiny = $scope.defaultDestiny;
      $scope.chat = {msgList: '', msg: ''};
      $scope.chat.msgList = [];

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
        // if ($scope.destiny == $scope.defaultDestiny) {
        //   easyrtc.sendDataWS({ targetRoom: 'default' }, "message", $scope.chat.newMsg );
        // } else {
        //   easyrtc.sendDataWS($scope.chat.newMsg.to, "message", $scope.chat.newMsg);
        // }
        msgReceived("Me", "message", $scope.chat.newMsg);

        $scope.destiny = $scope.defaultDestiny;

        // $scope.chat.msg = '';
      };

      var msgReceived = function (who, msgType, msg) {
          setTimeout(function() {
              $scope.$apply(function () {
                  // if (angular.isObject(msg)) {
                  //     who = content.from;
                  //     content = content.msg;
                  // }
                  console.log("Message received!" , msg, "  who  " , who);
                  $scope.chat.msgList.push(msg)
                  // $scope.chat.allMsgs += "<b>" + who + " </b> <span class=\"chat_timespan\">[<i>" + $filter('date')(new Date(), 'H:mm ss') + "</i>]</span> : &nbsp;" + content + "<br />";
              }, 0);
          });
      };

      $scope.changeDestiny = function (newDest) {
        if ($scope.destiny == newDest ){ $scope.destiny = $scope.defaultDestiny;}
        else {$scope.destiny = newDest;}
        console.log("New destiny: " , newDest);
      };


}]);

audioVideoCntrl.controller ('createRoomCntrl', [ '$scope', '$stateParams', '$state', 'URLS',
    function($scope, $stateParams, $state, URLS) {
      $scope.baseUrl = URLS.createRoom+"/"+URLS.audioVideo+"/";
      $scope.createRoomBtn = function (){
        // console.log("FDASF ", $scope.roomId);
        $state.go($scope.baseUrl+":roomId", { "roomId": $scope.roomId});
      }
}]);
