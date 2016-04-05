var audioVideoCntrl = angular.module('audioVideoCntrl', []);

audioVideoCntrl.controller ('audiovideoPage', [ '$scope', '$stateParams', '$mdDialog', '$mdMedia', 'startupEasyrtcService', 'callEasyrtcService',
    function($scope, $stateParams, $mdDialog, $mdMedia, startupEasyrtcService, callEasyrtcService) {
      $scope.setCallInProgres = function (value){
        $scope.callInProgres = value;
      };
      $scope.setMyId = function (value){
        $scope.myId = value;
      };
      $scope.roomId = $stateParams.roomId;
      $scope.setMyId (false);
      $scope.setCallInProgres (false);

      $scope.$watch(function() { return $mdMedia('gt-sm'); }, function(big) {
         $scope.screenIsSmall = big;
      });

      // *********************
      // CONFIGURE AND START EASYRTC
      // *********************
      $scope.easyrtc = startupEasyrtcService.getEasyrtc();
      startupEasyrtcService.configureChanels(true);
      startupEasyrtcService.setRoomOccupantListener( loggedInListener);
      startupEasyrtcService.setAcceptChecker( acceptChecker );

      // **** LOGGED IN loggedInListener
      function loggedInListener(roomName, otherPeers) {
         $scope.$apply(function() { $scope.UserList = otherPeers;});
         $scope.startVideocallBtn  =  function(easyrtcid) {
                 return function() {
                     performCall(easyrtcid);
                 }
               };
       };

      // ****  ACCEPT OR REJECT THE CALL
      function acceptChecker (easyrtcid, callback) {
          callerPending = easyrtcid;
          var params = {
            title : "Incoming call",
            textContent : null,
            ariaLabel : "Incoming call",
            ok : "Accept",
            cancel : "Reject"
          };
          if( $scope.easyrtc.getConnectionCount() > 0 ) {
            params.textContent = "Drop current call and accept new from " + $scope.easyrtc.idToName(easyrtcid) + " ?";
          }
          else {
            params.textContent = "Accept incoming call from " + $scope.easyrtc.idToName(easyrtcid) + " ?";
          }
          console.log("incoming call", params.textContent);

          $scope.acceptTheCall = function(wasAccepted) {
           //  document.getElementById("acceptCallBox").style.display = "none";
            if( wasAccepted && $scope.easyrtc.getConnectionCount() > 0 ) {
              $scope.hangUpAll();
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
        }

        // **** INIT ALL AND CONECT
        callEasyrtcService.setStreamAcceptor( function(callerEasyrtcid, stream) {
          $scope.$apply(function() {
            $scope.callInProgres = stream.streamName;
            console.log("Set stream acceptor " , stream.streamName);
          });
          console.log("New Stream " , stream);
           var video = document.getElementById('caller');
           callEasyrtcService.setVideoObjectSrc(document.getElementById('caller'), stream);
       });

        $scope.easyrtc.setOnStreamClosed( function (callerEasyrtcid) {
          $scope.$apply(function() {$scope.setCallInProgres (false) });
           callEasyrtcService.setVideoObjectSrc(document.getElementById('caller'), "");
       });
       //Conect room success
      var loginSuccess = function (myId) {
       console.log("My easyrtcid is " + myId);
       $scope.$apply(function() { $scope.setMyId (myId);});

      }
      //Failed to connect to Room
      var loginFailure = function(errorCode, message) {
         startupEasyrtcService.showError(errorCode, message);
         console.log(errorCode, message);
      }

      // **** CONNECT WITH THE SERVER
      $scope.my_init = function (noVideo) {
          callEasyrtcService.initMediaSource(
                function(){       // success callback
                    var selfVideo = document.getElementById("self");
                    callEasyrtcService.setVideoObjectSrc(selfVideo, $scope.easyrtc.getLocalStream());
                    callEasyrtcService.connect($scope.roomId, loginSuccess, loginFailure);
                },
                loginFailure
          );
      };

      $scope.performCall = function (easyrtcid) {
          callEasyrtcService.call(
             easyrtcid,
             function(easyrtcid) {
               console.log("completed call to " + easyrtcid);
             },
             function(errorMessage) { console.log("err:" + errorMessage);},
             function(accepted, bywho) {
               $scope.$apply(function() {$scope.setCallInProgres (true) });
                console.log((accepted?"accepted":"rejected")+ " by " + bywho);
             }
         );
      };

      //  **** VIDEO CALL BUTTONS AND CONTROLS
      $scope.stopVideo = function (bool , streamName){
        // bool = !bool;
        callEasyrtcService.enableCamera(bool,streamName);
        console.log("Disable video ", bool , " " , streamName);
      };
      $scope.stopMicro = function (bool, streamName){
        callEasyrtcService.enableMicrophone(bool,streamName);
        console.log("Disable micro ", bool , " " , streamName);
      };
      $scope.hangUpAll = function (){
        $scope.setCallInProgres (false);
        callEasyrtcService.hangupAll();
      };
      $scope.disconnect = function (){
        callEasyrtcService.disconnectAll (document.getElementById("self"));
        $scope.UserList = null;
        $scope.setMyId (false);
        $scope.setCallInProgres(false);
      };



      //CHAT MOVIES
      // $scope.audMsgReceived = function (){
      //   var audio = new Audio(sounds.chatMessageAlert);
      //   audio.play();
      // }
      // $scope.chat = {msgList: '', msg: ''};
      // $scope.chat.msgList = [];
      // $scope.msgReceived = function ( who ,msgType, msg) {
      //     setTimeout(function() {
      //         $scope.$apply(function () {
      //             console.log("Message received!who: " , who," type:" , msgType, "  msg  ", msg );
      //             $scope.chat.msgList.push(msg);
      //             $scope.audMsgReceived();
      //         }, 0);
      //     });
      // };




}]);

audioVideoCntrl.controller ('createRoomCntrl', [ '$scope', '$stateParams', '$state', 'URLS',
    function($scope, $stateParams, $state, URLS) {
      $scope.baseUrl = URLS.createRoom+"/"+URLS.audioVideo+"/";
      // $scope.createRoomBtn = function (){
      //   // console.log("FDASF ", $scope.roomId);
      //   $state.go($scope.baseUrl+":roomId", { "roomId": $scope.roomId});
      // }
}]);
