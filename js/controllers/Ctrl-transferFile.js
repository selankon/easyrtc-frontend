var fileTransferCntrl = angular.module('fileTransferCntrl', []);

fileTransferCntrl.controller ('fileRoomCntrl', [ '$scope', '$stateParams', '$state',  '$mdDialog', 'Upload', '$timeout', 'startupEasyrtcService', 'callEasyrtcService', 'ftEasyrtcService', 'chatEasyrtcService', 'fileListsService',
    function($scope, $stateParams, $state, $mdDialog, Upload, $timeout, startupEasyrtcService, callEasyrtcService, ftEasyrtcService, chatEasyrtcService, fileListsService) {
      $scope.setMyId = function (value){
        $scope.myId = value;
      }
      $scope.roomId = $stateParams.roomId;
      $scope.setMyId (false);
      $scope.noDCs = {}; // which users don't support data channels
      $scope.dropAreaName = "droparea_";




      // **** Accept file download
      // $scope.easyrtc.setAcceptChecker(function(easyrtcid, responsefn) {
      //     var params = {
      //       title : "Download File",
      //       textContent : null,
      //       ariaLabel : "Download File",
      //       ok : "Download",
      //       cancel : "Reject"
      //     };
      //     if( $scope.easyrtc.getConnectionCount() > 0 ) {
      //       params.textContent = "Cancel file transfer from " + $scope.easyrtc.idToName(easyrtcid) + " ?";
      //     }
      //     else {
      //       params.textContent = "Accept download file from " + $scope.easyrtc.idToName(easyrtcid) + " ?";
      //     }
      //     console.log("incoming call", params.textContent);
      //
      //     $scope.acceptTheCall = function(wasAccepted) {
      //      //  document.getElementById("acceptCallBox").style.display = "none";
      //       if( wasAccepted && $scope.easyrtc.getConnectionCount() > 0 ) {
      //         $scope.easyrtc.hangupAll();
      //       }
      //       responsefn(wasAccepted);
      //     };
      //
      //    //Show dialog
      //    $scope.showConfirm = function(data) {
      //      // Appending dialog to document.body to cover sidenav in docs app
      //      var confirm = $mdDialog.confirm()
      //            .title(data.title)
      //            .textContent(data.textContent)
      //            .ariaLabel(data.ariaLabel)
      //            .ok(data.ok)
      //            .cancel(data.cancel);
      //      $mdDialog.show(confirm).then(function() {
      //        $scope.status = 'File accepted.';
      //        $scope.acceptTheCall (true);
      //      }, function() {
      //        $scope.acceptTheCall (false);
      //        $scope.status = 'File rejected.';
      //        alert ($scope.status);
      //      });
      //
      //    };
      //    $scope.showConfirm(params);
      //   });

      // *********************
      // CONFIGURE AND START EASYRTC
      // *********************

      //When connect to Room
      var loginSuccess = function (myId) {
        console.log("My easyrtcid is " + myId);
        $scope.$apply(function() { $scope.setMyId (myId);});
        $scope.createDragAnDrop(myId);

        ftEasyrtcService.buildFileReceiver(acceptRejectCB, blobAcceptor, receiveStatusCB);
      }
      //Failed to connect to Room
      var loginFailure = function(errorCode, message) {
        startupEasyrtcService.showError(errorCode, message);
        console.log(errorCode, message);
      }

      $scope.easyrtc = startupEasyrtcService.getEasyrtc();
      startupEasyrtcService.configureChanels(false);
      startupEasyrtcService.setAcceptChecker (function(easyrtcid, responsefn) {
        responsefn(true);
      });
      startupEasyrtcService.setRoomOccupantListener (function(roomName, otherPeers) {
        $scope.$apply(function() { $scope.UserList = otherPeers;});
      });
      startupEasyrtcService.setDataChannelOpenListener(function(easyrtcid, usesPeer) {
        console.log("Conected to ", easyrtcid);
        // $scope.createDragAnDrop(easyrtcid);
      });
      startupEasyrtcService.setDataChannelCloseListener(function(easyrtcid) {
        console.log("Disconect to ", easyrtcid);
      });
      callEasyrtcService.connect($scope.roomId, loginSuccess, loginFailure);

      // Automatically connect to peer
      $scope.conectionToPeer = function (easyrtcid){
        callEasyrtcService.call(
          easyrtcid,
          function(caller, mediatype) {
             console.log("Calling to ", easyrtcid);
          },
          function(errorCode, errorText) {
             console.log("Call failed Failed");
             $scope.noDCs[easyrtcid] = true;
          },
          function wasAccepted(yup) {}
        );
      }

      // *********************
      // CONFIGURE AND START FT_EASYRTC
      // *********************

      // **** Accept or reject a file from other
      function acceptRejectCB(otherGuy, fileNameList, wasAccepted) {
        // List the files being offered
        console.log("Files offered: " , fileNameList);
      }

      // **** Save a file
      function blobAcceptor(otherGuy, blob, filename) {
        ftEasyrtcService.saveAs(blob, filename);
      }

      // **** The receive messages from the status of transmission
      function receiveStatusCB(otherGuy, msg) {
        switch (msg.status) {
            case "started":
                console.log("Started transfer");
                break;
            case "eof":
                console.log("Finished file from" , otherGuy);
                break;
            case "done":
                console.log( "Stopped because ", msg.reason, " from" , otherGuy);
                break;
            case "started_file":
                console.log("Beginning receive of " , msg.name);
                break;
            case "progress":
                console.log(msg.name , " " , msg.received , "/" , msg.size);
                break;
            default:
                console.log("strange file receive cb message = ", JSON.stringify(msg));
        }
        return true;
      }

      // Create drag&drop
      $scope.createDragAnDrop = function (easyrtcid) {

        function updateStatusDiv(state) {
          switch (state.status) {
              case "waiting":
                  console.log("waiting for other party to accept transmission");
                  break;
              case "started_file":
                  console.log("started file: " + state.name);

              case "working":
                  console.log(state.name + ":" + state.position + "/" + state.size + "(" + state.numFiles + " files)");

                  break;
              case "rejected":
                  console.log("cancelled");

                  break;
              case "done":
                  console.log("done");

                  break;
          }
          return true;
        }

        var fileSender = null;
        function filesHandler(files) {
          console.log("Added files to dragAnDrop " , files);
            // if we haven't eastablished a connection to the other party yet, do so now,
            // and on completion, send the files. Otherwise send the files now.
            var timer = null;
            $scope.$apply(function() { $scope.filesToSend = files;});
            fileListsService.createOwnFileList($scope.filesToSend);


            if (callEasyrtcService.getConnectStatus(easyrtcid) === $scope.easyrtc.NOT_CONNECTED && $scope.noDCs[easyrtcid] === undefined) {
                // calls between firefrox and chrome ( version 30) have problems one way if you
                // use data channels.
                console.log("not conected to anybody");

            }
            else if (callEasyrtcService.getConnectStatus(easyrtcid) === $scope.easyrtc.IS_CONNECTED || $scope.noDCs[easyrtcid]) {
                if (!fileSender) {
                    fileSender = ftEasyrtcService.buildFileSender(easyrtcid, updateStatusDiv);
                }

                // fileSender(files, true /* assume binary */);
            }
            else {
                startupEasyrtcService.showError("user-error", "Wait for the connection to complete before adding more files!");
            }
        }
        //UPLOAD BUTTON
        $scope.uploadFiles = function(files) {
          filesHandler (files)
        }

        console.log("Creating dragAnDrop");
        ftEasyrtcService.buildDragNDropRegion($scope.dropAreaName+easyrtcid, filesHandler);
      }

      // *********************
      // SHARING FILE LIST WITH OTHER USERS
      // *********************
      $scope.fileLists = fileListsService.getFileLists();
      $scope.whoToUpdate;
      $scope.fileListPetition = function (easyrtcid){
        chatEasyrtcService.sendMessage("fileListPetition",  $scope.myId, easyrtcid);
      }

      $scope.fileListReceived = function (from , list){


      }

      $scope.fileListUpdate = function (from , list) {

      }
      $scope.sendFileList  = function ( easyrtcid ) {
        // chatEasyrtcService.sendMessage("fileListDeliver",  $scope.myId, easyrtcid, $scope.filesToSend);
        var mssg = {};
        chatEasyrtcService.createOwnFileList($scope.filesToSend);
        console.log("Object to send in the message" , mssg);
        var newMsg  = chatEasyrtcService.newMessage (
          "fileListDeliver",
          $scope.myId,
          easyrtcid,
          new Date(),
          mssg,
          null
        )
        console.log("FILES T SEND : " , newMsg);

        chatEasyrtcService.sendDataWS(newMsg.to, newMsg.msgType, newMsg);

      }


      // *********************
      // CALLBACK FOR RECEIVE SPECIAL MESSAGES USING CHAT Service
      // THIS WILL BE USED FOR SHARE THE FILE LIST OF EVERY USER
      // USER SEND A MESSAGE WITH THE PETITION OF USER FILE LIST.
      // THIS ANSWER WITH SPECIAL MESSAGE WITH THE LIST
      // *********************

      chatEasyrtcService.setSpecialChatMessageReceived (
        function (msg) {
          // console.log("INSIDE CALLBACK setSpecialChatMessageReceived" , msg);

          switch (msg.msgType) {
            case "fileListPetition":
              $scope.sendFileList (msg.from);
              break;
            case "fileListDeliver":
              console.log("FILEWlfldafkwdfsjeafd " , msg);
              break;
            default:
              console.log("Special Chat command no recognized: not recognized");
          }
        }
      )



}]);

fileTransferCntrl.controller ('createFileRoomCntrl', [ '$scope', '$stateParams', '$state', 'URLS',
    function($scope, $stateParams, $state, URLS) {
      $scope.baseUrl = URLS.createFileRoom+"/"+URLS.fileTransfer+"/";

}]);

// // *********************
// // CONFIGURE AND START CHAT_EASYRTC
// // *********************
//
// chatEasyrtcService.configureChat(
//   function( who ,msgType, msg) {
//      setTimeout(function() {
//          $scope.$apply(function () {
//              console.log("Message received!who: " , who," type:" , msgType, "  msg  ", msg );
//             //  $scope.chat.msgList.push(msg);
//             //  $scope.audMsgReceived();
//             chatEasyrtcService.updateMsgList (msg);
//             chatEasyrtcService.playSound(sounds.chatMessageAlert);
//          }, 0);
//      });
//   }
// );

// **** Custom init and connect to the room
// $scope.my_init = function () {
  // $scope.easyrtc.enableDataChannels(true);
  // $scope.easyrtc.enableVideo(false);
  // $scope.easyrtc.enableAudio(false);
  // $scope.easyrtc.setPeerListener($scope.msgReceived); //Chat

  //Listener new occupant
  // easyrtc.setRoomOccupantListener( $scope.loggedInListener );

  //Automatic accept checker
  // easyrtc.setAcceptChecker(function(easyrtcid, responsefn) {
  //   responsefn(true);
  // });

  //Conected to user
  // easyrtc.setDataChannelOpenListener(function(easyrtcid, usesPeer) {
  //   console.log("Conected to ", easyrtcid);
  //   // $scope.createDragAnDrop(easyrtcid);
  //
  // });

  //Disconected to user
  // easyrtc.setDataChannelCloseListener(function(easyrtcid) {
  //   console.log("Disconect to ", easyrtcid);
  // });

  // //When connect to Room
  // var loginSuccess = function (myId) {
  //   console.log("My easyrtcid is " + myId);
  //   $scope.$apply(function() { $scope.myId = myId;});
  //   $scope.createDragAnDrop(myId);
  //
  //   easyrtc_ft.buildFileReceiver(acceptRejectCB, blobAcceptor, receiveStatusCB);
  // }
  //
  // //Failed to connect to Room
  // var loginFailure = function(errorCode, message) {
  //   easyrtc.showError(errorCode, message);
  //   console.log(errorCode, message);
  // }

  //Connect to Room
  // easyrtc.connect($scope.roomId, loginSuccess, loginFailure);
// };
// $scope.my_init ();

// **** Function that controlls when a new peer is connected
// var loggedInListener = function (roomName, otherPeers) {
//   console.log("Logged in listener");
//    $scope.$apply(function() { $scope.UserList = otherPeers;});
//  };
