var fileTransferCntrl = angular.module('fileTransferCntrl', []);

fileTransferCntrl.controller ('fileRoomCntrl', [ '$scope', '$stateParams', '$state',  '$mdDialog', 'Upload', '$timeout', 'startupEasyrtcService', 'callEasyrtcService', 'ftEasyrtcService', 'chatEasyrtcService', 'fileListsServerService', 'fileListsClientService',
    function($scope, $stateParams, $state, $mdDialog, Upload, $timeout, startupEasyrtcService, callEasyrtcService, ftEasyrtcService, chatEasyrtcService, fileListsServerService, fileListsClientService) {
      $scope.setMyId = function (value){
        $scope.myId = value;
      }
      $scope.roomId = $stateParams.roomId;
      $scope.setMyId (false);
      $scope.noDCs = {}; // which users don't support data channels
      $scope.dropAreaName = "droparea_";

      $scope.filesToSend ;
      // $scope.transferInProgress = true;




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

      var acceptChecker = function(easyrtcid, responsefn) {
        responsefn(true);
      }

      //When connect to Room
      var loginSuccess = function (myId) {
        console.log("My easyrtcid is " + myId);
        $scope.$apply(function() { $scope.setMyId (myId);});
        $scope.createDragAnDrop(myId);

        ftEasyrtcService.buildFileReceiver(acceptRejectCB, blobAcceptor, $scope.receiveStatusCB);
      }
      //Failed to connect to Room
      var loginFailure = function(errorCode, message) {
        startupEasyrtcService.showError(errorCode, message);
        console.log(errorCode, message);
      }

      $scope.easyrtc = startupEasyrtcService.getEasyrtc();
      startupEasyrtcService.configureChanels(false);
      startupEasyrtcService.setAcceptChecker (acceptChecker);
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
        wasAccepted(true);
      }

      // **** Save a file
      function blobAcceptor(otherGuy, blob, filename) {
        ftEasyrtcService.saveAs(blob, filename);
      }

      $scope.transactionStatus  = function  (msg) {
        return  $scope.transactionMsg = msg;
      }

      // $scope.findFileOnList = function (name , list ){
      //   for (x = 0 ; x < list.files.length ; x++){
      //     if (name == list.files[x].name) {
      //       return list.files[x];
      //     }
      //   }
      // }
      var actualBar;
      $scope.showFileProgress = function (name , list ){
        for (x = 0 ; x < list.files.length ; x++){
          if (name == list.files[x].name) {
            list.files[x].bar.progress = true;
            // $scope.actualBar = list.files[x].bar;
            console.log("list.files[x].bar.name" , list.files[x].bar.name);
            actualBar = angular.element( document.querySelector( list.files[x].bar.name ) );
            console.log("Actuaklbar" ,actualBar);
          }
        }
      }

      // Get from a list the model of the file that we want to update the download attribute
      var updateProgressBar = function (nameBar, received, size) {

        // console.log(nameBar , " NAMEBARRRRR");
        console.log(actualBar , " NAMEBARRRRR");
        // $scope.$apply(function() { actualBar.attr ('value' , (received/size)*100)  });


      }

      // **** The receive messages from the status of transmission
      $scope.receiveStatusCB = function (otherGuy, msg) {
        // console.log("MSG!!!", msg);
        switch (msg.status) {
            case "started":
                console.log("Started transfer");
                $scope.transactionStatus ("Started transfer");
                break;
            case "eof":
                console.log("Finished file from" , otherGuy);
                $scope.transactionStatus ("Finished file from" + otherGuy);
                break;
            case "done":
                console.log( "Stopped because ", msg.reason, " from" , otherGuy);
                $scope.transactionStatus ("Stopped because " +  msg.reason + " from" + otherGuy);
                break;
            case "started_file":
                console.log("Beginning receive of " , msg.name);
                $scope.showFileProgress (msg.name , $scope.selectedFileList);
                $scope.transactionStatus ("Beginning receive of " + msg.name);
                break;
            case "progress":
                // console.log(msg.name , " " , msg.received , "/" , msg.size);
                // $scope.transactionStatus (msg.name + " " + msg.received + "/" + msg.size);
                updateProgressBar (actualBar, msg.received, msg.size, $scope.selectedFileList);
                break;
            default:
                $scope.transactionStatus ("strange file receive cb message = "+ JSON.stringify(msg));
                console.log("strange file receive cb message = ", JSON.stringify(msg));
        }
        return true;
      }
      // $scope.plusultra  = function () {
      //   var i = 0;
      //   $scope.showFileProgress ("JSWhitePaper.zip", $scope.selectedFileList);
      //
      //   // updateProgressBar ($scope.actualBar, i=+10 ,8396469 , $scope.selectedFileList);
      //
      // }

      // Create drag&drop
      $scope.createDragAnDrop = function (easyrtcid) {


        function filesHandler(files) {
          console.log("Added files to dragAnDrop " , files);
            // if we haven't eastablished a connection to the other party yet, do so now,
            // and on completion, send the files. Otherwise send the files now.
            var timer = null;
            $scope.$apply(function() { $scope.filesToSend = files;});
            $scope.ownFileList = fileListsServerService.createOwnFileList($scope.filesToSend);

        }
        //UPLOAD BUTTON
        $scope.uploadFiles = function(files) {
          filesHandler (files)
        }

        console.log("Creating dragAnDrop");
        ftEasyrtcService.buildDragNDropRegion($scope.dropAreaName+easyrtcid, filesHandler);
      }

      function callbackStatusSend(state) {
        $scope.transferInProgress = true;
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

      $scope.send = function (easyrtcid, list) {
        var fileSender = null;
        if (callEasyrtcService.getConnectStatus(easyrtcid) === $scope.easyrtc.NOT_CONNECTED && $scope.noDCs[easyrtcid] === undefined) {
            // calls between firefrox and chrome ( version 30) have problems one way if you
            // use data channels.
            console.log("not conected to anybody");

        }
        else if (callEasyrtcService.getConnectStatus(easyrtcid) === $scope.easyrtc.IS_CONNECTED || $scope.noDCs[easyrtcid]) {
            if (!fileSender) {
                fileSender = ftEasyrtcService.buildFileSender(easyrtcid, callbackStatusSend);
            }
            console.log("GoingToSend");

            fileSender(list , true /* assume binary */);
        }
        else {
            startupEasyrtcService.showError("user-error", "Wait for the connection to complete before adding more files!");
        }
      }

      // *********************
      // SHARING FILE LIST WITH OTHER USERS
      // *********************
      $scope.externalfileLists = fileListsClientService.getExternalFileLists();
      $scope.ownFileList ;
      $scope.easyrtcidOfSelected ;
      $scope.selectedFileList ;
      // $scope.whoToUpdate;

      // Send a file list petition to somebody
      $scope.fileListPetition = function (easyrtcid){
        chatEasyrtcService.sendMessage("fileListPetition",  $scope.myId, easyrtcid);
        $scope.easyrtcidOfSelected = easyrtcid;
      }

      // When you receive a file list using the callback
      $scope.fileListReceived = function (from , list){
        fileListsClientService.addSingleFileList (from , list)
        $scope.$apply(function() {
          $scope.externalfileLists = fileListsClientService.getExternalFileLists();
          // console.log("$scope.externalfileLists " , $scope.externalfileLists);
          if (from == $scope.easyrtcidOfSelected) $scope.updateSelectedList(from);
        });
      }

      // Update the list that is selected
      $scope.updateSelectedList = function (easyrtcid) {
        $scope.selectedFileList =  fileListsClientService.getSingleFileList (easyrtcid , $scope.externalfileLists);
      }

      $scope.fileListViewUpdate = function (from , list) {

      }

      // Send the own file list to other
      $scope.sendFileList  = function ( easyrtcid ) {
        // chatEasyrtcService.sendMessage("fileListDeliver",  $scope.myId, easyrtcid, $scope.filesToSend);
        var msg = {};
        // var filelist = fileListsServerService.createOwnFileList($scope.filesToSend);
        var newMsg  = chatEasyrtcService.newMessage (
          "fileListDeliver",
          $scope.myId,
          easyrtcid,
          new Date(),
          fileListsServerService.getOwnFileLists(),
          null
        )

        chatEasyrtcService.sendDataWS(newMsg.to, newMsg.msgType, newMsg);

      }

      // **** DOWNLOAD FUNCTIONS

      // Send the public file list to somebody that requests
      $scope.sendPublicFileList = function (easyrtcid){
        console.log("SENDin TO ", easyrtcid);
        $scope.conectionToPeer(easyrtcid)
        $scope.send (easyrtcid, $scope.filesToSend)
      }

      // Send a petition for download the public list of somebody
      $scope.publicFileListDownloadPetition = function (easyrtcid){

        var msg = {};
        var newMsg  = chatEasyrtcService.newMessage (
          "publicFileListDownloadPetition",
          $scope.myId,
          easyrtcid,
          new Date(),
          null
        )

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
              $scope.fileListReceived(msg.from, msg.content);
              break;
            case "publicFileListDownloadPetition":
              $scope.sendPublicFileList(msg.from);
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
