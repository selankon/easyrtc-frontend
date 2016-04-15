var audioVideoCntrl = angular.module('audioVideoCntrl', []);

audioVideoCntrl.controller ('audiovideoPage', [ '$scope', '$stateParams', '$mdDialog', '$mdMedia', 'startupEasyrtcService', 'callEasyrtcService', 'mediaResources', 'soundPlayer',
    function($scope, $stateParams, $mdDialog, $mdMedia, startupEasyrtcService, callEasyrtcService, mediaResources, soundPlayer) {

      $scope.status = {
        msg : null,
        submsg : null,
        icon : null
      }
      // Used for change the status (icon on background)
      $scope.changeStatus = function (msg, submsg , icon) {
        $scope.status.msg = msg;
        $scope.status.submsg = submsg;
        $scope.status.icon = icon;

        // console.log("SCOPESTATUS " , $scope.status);
      }
      $scope.changeStatusTo = function (status, param) {
        // console.log("Changing status " , status);
        switch (status) {
          case "logedOff":
            $scope.changeStatus (
              "Not logged in" ,
              "You should share your camera <br> before videocall the world!",
              "fa-sign-in shake");

            break;
          case "logedIn":
            $scope.changeStatus (
              "Logged!" ,
              "Your Easyrtc Id is " + $scope.myId +"<br>Select user from userlist and start a call",
              "fa-user shake");
            break;
          case "calling":
            $scope.changeStatus (
              "Calling!" ,
              "Calling to " + param +"<br>Waiting response",
              "fa-phone shakeInfinite");
            break;
          case "rejected":
            $scope.changeStatus (
              "Call Rejected!" ,
              "Call rejected from " + param +"<br>Try it later",
              "fa-frown-o shake");
            break;
          case "completed":
            $scope.changeStatus (
              "Call Finished with success!" ,
              "Call to " + param +" finished succefully",
              "fa-hand-peace-o  shake");
            break;
          case "streamClosed":
            $scope.changeStatus (
              "Stream Closed by the Peer!" ,
              "Aparently, " + param +" <br>hang up the call",
              "fa-hand-peace-o  shake");
            break;
          default:
            $scope.changeStatus (
            "Something wrong?" ,
            "Something its not going on",
            "fa-question  shake");
          break;

        }
      }

      $scope.changeStatusTo ("logedOff");

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
           var audioCall = soundPlayer.createSoundObject (mediaResources.incomingCall);
           soundPlayer.play(audioCall);
           // Appending dialog to document.body to cover sidenav in docs app
           var confirm = $mdDialog.confirm()
                 .title(data.title)
                 .textContent(data.textContent)
                 .ariaLabel(data.ariaLabel)
                 .ok(data.ok)
                 .cancel(data.cancel);

           $mdDialog.show(confirm).then(function() {
            //  $scope.status = 'Call accepted.';
             $scope.acceptTheCall (true);
             soundPlayer.stop (audioCall);
           }, function() {
             $scope.acceptTheCall (false);
             soundPlayer.stop (audioCall);

            //  $scope.status = 'Call rejected.';
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
          callEasyrtcService.setVideoObjectSrc(document.getElementById('caller'), "");

          $scope.$apply(function() {
            console.log("STREAM CLOSED!" , callerEasyrtcid );
            $scope.setCallInProgres (false)

            $scope.changeStatusTo ("streamClosed", callerEasyrtcid);


             });
       });
       //Conect room success
      var loginSuccess = function (myId) {
       console.log("My easyrtcid is " + myId);
       $scope.$apply(function() {
         $scope.setMyId (myId);
         $scope.changeStatusTo ("logedIn");

       });

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
        $scope.changeStatusTo ("calling", easyrtcid);

        var audioOutgoingCall = soundPlayer.createSoundObject (mediaResources.outgoingCall);
        soundPlayer.playLoop(audioOutgoingCall);

          callEasyrtcService.call(
             easyrtcid,
             function(easyrtcid) {
               console.log("completed call to " + easyrtcid);
                $scope.$apply(function() {
                  soundPlayer.stop(audioOutgoingCall);

                  $scope.changeStatusTo ("completed",easyrtcid);

                });
             },
             function(errorMessage) {
               alert("err:" + errorMessage);
               console.log("err:" + errorMessage);
               soundPlayer.stop(audioOutgoingCall);

             },
             function(accepted, bywho) {
               $scope.$apply(function() {
                 $scope.setCallInProgres (accepted)
                 if (!accepted) {
                   $scope.changeStatusTo ("rejected",bywho);
                 }
                 soundPlayer.stop(audioOutgoingCall);


               });
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
        // $scope.changeStatusTo ("completed");

        callEasyrtcService.hangupAll();
      };
      $scope.disconnect = function (){
        callEasyrtcService.disconnectAll (document.getElementById("self"));
        $scope.changeStatusTo ("logedOff");
        $scope.UserList = null;
        $scope.setMyId (false);
        $scope.setCallInProgres(false);
      };








}]);

audioVideoCntrl.controller ('createRoomCntrl', [ '$scope', '$stateParams', '$state', 'URLS',
    function($scope, $stateParams, $state, URLS) {
      $scope.baseUrl = URLS.createRoom+"/"+URLS.audioVideo+"/";
      // $scope.createRoomBtn = function (){
      //   // console.log("FDASF ", $scope.roomId);
      //   $state.go($scope.baseUrl+":roomId", { "roomId": $scope.roomId});
      // }
}]);
