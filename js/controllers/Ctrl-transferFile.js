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
      $scope.filesToSend = [];
      // $scope.transferInProgress = true;

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

        ftEasyrtcService.buildFileReceiver(acceptRejectCB, blobAcceptor, receiveStatusCB);
      }
      //Failed to connect to Room
      var loginFailure = function(errorCode, message) {
        startupEasyrtcService.showError(errorCode, message);
        console.log(errorCode, message);
      }

      // Configuring easyrtc
      $scope.easyrtc = startupEasyrtcService.getEasyrtc();
      startupEasyrtcService.configureChanels(false);
      startupEasyrtcService.setAcceptChecker (acceptChecker);
      startupEasyrtcService.setRoomOccupantListener (function(roomName, otherPeers) {
        $scope.$apply(function() { $scope.UserList = otherPeers;});
      });
      startupEasyrtcService.setDataChannelOpenListener(function(easyrtcid, usesPeer) {
        console.log("Conected to ", easyrtcid);
      });
      startupEasyrtcService.setDataChannelCloseListener(function(easyrtcid) {
        console.log("Disconect to ", easyrtcid);
      });
      callEasyrtcService.connect($scope.roomId, loginSuccess, loginFailure);

      // Automatically connect to peer
      $scope.conectionToPeer = function (easyrtcid){
        // console.log("CONECTION TO PEER");
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
        console.log("Files offered: " , fileNameList , " from " , otherGuy);
        $scope.acceptChecker (otherGuy, fileNameList, wasAccepted);
        // wasAccepted(true);
      }

      // **** Save a file
      function blobAcceptor(otherGuy, blob, filename) {
        ftEasyrtcService.saveAs(blob, filename);
      }

      // **** File transfer messages status
      $scope.transactionStatus  = function  (msg) {
        return  $scope.transactionMsg = msg;
      }

      // **** Get file from a list
      $scope.getFileFromList = function (name , list ){
        for (x = 0 ; x < list.files.length ; x++){
          if (name == list.files[x].name) {
            return list.files[x];
          }
        }
      }

      // Get the bar object from a file objecy
      $scope.getBarFromFile = function (file){
        return file.bar;
      }

      // Get from a list the model of the file that we want to update the download attribute
      var updateProgressBar = function (received, size) {
        $scope.$apply(function() { $scope.actualBar.progress =  (received/size)*100 ; });
        console.log($scope.actualBar.progress , "  Actual bar progress ");
      }

      // **** The receive messages from the status of transmission
      $scope.actualBar; // Actual progress bar to be updated
      $scope.actualUserReceiver; // Actual user who is receiving your data
      var receiveStatusCB = function (otherGuy, msg) {
        // console.log("MSG!!!", msg);
        switch (msg.status) {
            case "started":
                console.log("Started transfer ");
                $scope.$apply(function() { $scope.transactionStatus ("Started transfer") });
                break;
            case "eof":
                console.log("Finished file from " , otherGuy);
                $scope.$apply(function() { $scope.transactionStatus ("Finished file from " + otherGuy) });
                break;
            case "done":
                console.log( "Stopped because ", msg.reason, " from" , otherGuy);
                $scope.$apply(function() { $scope.transactionStatus ("Stopped because " +  msg.reason + " from " + otherGuy) });
                break;
            case "started_file":
                console.log("Beginning receive of " , msg.name);
                $scope.$apply(
                  function() {
                    $scope.actualBar = $scope.getBarFromFile ($scope.getFileFromList (msg.name , $scope.selectedFileList) );
                    $scope.actualBar.progress = 0;
                    $scope.transactionStatus ("Beginning receive of " + msg.name)
                  });
                break;
            case "progress":
                updateProgressBar ( msg.received, msg.size, $scope.selectedFileList);
                break;
            default:
                $scope.$apply(function() { $scope.transactionStatus ("strange file receive cb message = "+ JSON.stringify(msg)) });
                console.log("strange file receive cb message = ", JSON.stringify(msg));
        }
        return true;
      }

      // **** The messages when you are sending to somebody
      function callbackStatusSend(state) {
        //SENDING TO PEOPLE
        $scope.transferInProgress = true;
        switch (state.status) {
            case "waiting":
                console.log("waiting for other party to accept transmission");
                break;
            case "started_file":
                // put the previous progress bar at 100 % due an error
                if ( !(angular.isUndefined($scope.actualBar) || $scope.actualBar === null)  ) {
                  updateProgressBar ( 1, 1, fileListsServerService.getListFromListOfList ( $scope.selectedDestiny ,$scope.ownFileList) );

                }
                console.log("started file: " + state.name);
                $scope.$apply(
                  function() {
                    $scope.actualBar =
                      $scope.getBarFromFile (
                        $scope.getFileFromList (state.name ,  fileListsServerService.getListFromListOfList ( $scope.selectedDestiny ,$scope.ownFileList))
                      );
                    $scope.actualBar.progress = 0;
                  });
            case "working":
                updateProgressBar ( state.position, state.size,  fileListsServerService.getListFromListOfList ( $scope.selectedDestiny ,$scope.ownFileList));
                console.log(state.name + ":" + state.position + "/" + state.size + "(" + state.numFiles + " files)");
                break;
            case "rejected":
                console.log("cancelled");
                break;
            case "done":
                updateProgressBar ( 1, 1, fileListsServerService.getListFromListOfList ( $scope.selectedDestiny ,$scope.ownFileList));
                console.log("done");

                break;
        }
        return true;
      }



      $scope.selectedDestiny  = function (list) {
          if ( !(angular.isUndefined(tab) || tab === null)  ) {
            $scope.selectedDestiny = list.destiny;
            console.log("Selected destiny " , list.destiny);
          }

      }

      // Watching if a specific drag and drop is created
      $scope.$watch('easyrtcidOfSelected', function(newValue, oldValue) {
          $timeout(function(){
            if (newValue !== oldValue) {
              $scope.createDragAnDrop (newValue);
            }
          }, 1000);
      });



      // If the destinyEasyrtcid = myId means that is public list
      $scope.filesAdded = function (files , destinyEasyrtcid) {
          $scope.filesToSend = fileListsServerService.addToListOfFileListObject(files, destinyEasyrtcid );
          $scope.ownFileList =  fileListsServerService.addToOwnFileListOfList(files, destinyEasyrtcid );
          $scope.selectedDestiny = destinyEasyrtcid;

          // If is a privated list, make the offer of the list to the user
          if ( !(destinyEasyrtcid == $scope.myId) ){
            $scope.sendPrivateFileList (destinyEasyrtcid);
          }
      }
      //UPLOAD BUTTON
      $scope.uploadFiles = function(files , easyrtcid) {
        // console.log("BTN browse files " , files, easyrtcid);
        $scope.filesAdded (files, easyrtcid)
      }

      // Create drag&drop
      $scope.createDragAnDrop = function (easyrtcid) {
        $scope.filesHandler = function (files) {
            // if we haven't eastablished a connection to the other party yet, do so now,
            // and on completion, send the files. Otherwise send the files now.
            console.log("Drag an drop handler from: " , easyrtcid);
            $scope.$apply(function() {$scope.filesAdded (files, easyrtcid);});
        }

        console.log("Creating dragAnDrop id : " , easyrtcid);
        ftEasyrtcService.buildDragNDropRegion($scope.dropAreaName+easyrtcid, $scope.filesHandler);
      }

      // Create the filesender and send the files
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
            console.log("GoingToSend next list: " , list);

            $scope.actualUserReceiver = easyrtcid
            fileSender(list.files , true /* assume binary */);
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
      $scope.selectedDestiny ;
      $scope.easyrtcidOfSelected ;
      $scope.selectedFileList ;
      // $scope.whoToUpdate;

      // Send a file list petition to somebody
      $scope.fileListPetition = function (easyrtcid){
        $scope.easyrtcidOfSelected = easyrtcid;
        chatEasyrtcService.sendMessage("fileListPetition",  $scope.myId, easyrtcid);
      }

      // When you receive a file list using the callback
      $scope.fileListReceived = function (from , list){
        fileListsClientService.addSingleFileList (from , list)
        $scope.$apply(function() {
          $scope.externalfileLists = fileListsClientService.getExternalFileLists();
          if (from == $scope.easyrtcidOfSelected) $scope.updateSelectedList(from);
        });
      }

      // When you recive a private file list
      $scope.privateListOffer = function (from , content){
        console.log("PRIVATE LIST OFER :@@@@@" , from, content);
        $mdDialog.show(
         $mdDialog.alert()
          //  .parent(angular.element(document.querySelector('#popupContainer')))
           .clickOutsideToClose(true)
           .title('Private list received')
           .textContent('You received a private list of files from '+from+', check the bottom tabs for download.')
           .ariaLabel('APrivate List received')
           .ok('Got it!')
          //  .targetEvent(ev)
       );
       $scope.easyrtcidOfSelected = from;
       $scope.fileListReceived (from , content);
      }

      // Update the list that is selected
      $scope.updateSelectedList = function (easyrtcid) {

        //This is for get the list for build the tabs
        $scope.tabs =  fileListsClientService.getAllListOfUser (easyrtcid , $scope.externalfileLists);

      }

      // $scope.updateSelectedFileList = function (list) {
      //   //This one is for get things of the file list that we are downloading, and get for example the progress bar
      //
      //   // $scope.selectedFileList =  fileListsClientService.getSingleFileList (list.destiny , $scope.tabs.fileLists);
      //   console.log(" AQUI TENGO KE UPDATERAR --- Selected file list :@" , $scope.selectedFileList);
      // }

      // For remove a list of the listOflist using the tabs
      $scope.removeTab = function ( list ) {
        fileListsServerService.removeList ( list.destiny , $scope.filesToSend);
        fileListsServerService.removeList ( list.destiny , $scope.ownFileList);
      }
      $scope.removeTabExternals = function ( list ) {
        // fileListsClientService.removeList ( list.destiny , $scope.externalfileLists);
        putavida ++ ;
      }

      // **** DOWNLOAD LIST FUNCTIONS

      // Send the public file list to somebody that requests
      $scope.sendPublicFileList = function (to){
        $scope.conectionToPeer(to)
        $scope.send (to, fileListsServerService.getListFromListOfList ($scope.myId , $scope.filesToSend) )
        $scope.ownFileList =  fileListsServerService.getListFromListOfList ($scope.myId , $scope.filesToSend) ;
      }

      // Send the own file list to other (ALWAYS PUBLIC LIST!! list where destiny easyrtcid == $scope.myId )
      $scope.sendFileList  = function ( easyrtcid ) {
        var newMsg  = chatEasyrtcService.newMessage (
          "fileListDeliver",
          $scope.myId,
          easyrtcid,
          new Date(),
          fileListsServerService.getListFromListOfList($scope.myId, $scope.ownFileList),
          null
        )

        chatEasyrtcService.sendDataWS(newMsg.to, newMsg.msgType, newMsg);

      }

      // Send a private file list offer to a user, getting the list asociated to his easyrtcid
      $scope.sendPrivateFileList = function (easyrtcid){
        var newMsg  = chatEasyrtcService.newMessage (
          "privateListOffer", //fileListDeliver
          $scope.myId,
          easyrtcid,
          new Date(),
          fileListsServerService.getListFromListOfList(easyrtcid, $scope.ownFileList),
          null
        )
        console.log("Sending private file list...");
        console.log(newMsg);
        chatEasyrtcService.sendDataWS(newMsg.to, newMsg.msgType, newMsg);
      }


      // This check if you are asking for download the public or the private list and call the needed function
      $scope.downloadPetiton = function (easyrtcidOfSelected , destiny){
        console.log("easyrtcidOfSelected " , easyrtcidOfSelected , "destiny " , destiny);
        // if is the public list of the selected
        if (easyrtcidOfSelected == destiny) {
            $scope.publicFileListDownloadPetition (easyrtcidOfSelected);
        }
        // If is the private list of selected
        else if (destiny == $scope.myId) {

        }
      }

      // Send a petition for download the public list of somebody
      $scope.privateFileListDownloadPetition = function (easyrtcid){
        var newMsg  = chatEasyrtcService.newMessage (
          "privateFileListDownloadPetition",
          $scope.myId,
          easyrtcid,
          new Date(),
          null
        )

        chatEasyrtcService.sendDataWS(newMsg.to, newMsg.msgType, newMsg);
      }
      // Send a petition for download the public list of somebody
      $scope.publicFileListDownloadPetition = function (easyrtcid){
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
            case "privateFileListDownloadPetition":
              $scope.sendPublicFileList(msg.from);
              break;
            case "privateListOffer":
              $scope.privateListOffer(msg.from, msg.content);
              break;
            default:
              console.log("Special Chat command no recognized: not recognized");
          }
        }
      )


      // *****************************

      // **** Accept checker file list download
      $scope.acceptChecker = function(otherGuy, fileNameList, responsefn) {
          var params = {
            title : "Download Files",
            textContent : null,
            ariaLabel : "Download Files",
            ok : "Download",
            cancel : "Reject"
          };
          if( $scope.easyrtc.getConnectionCount() > 0 ) {
            params.textContent = "Cancel file transfer list from " + $scope.easyrtc.idToName(otherGuy) + " ?";
          }
          else {
            params.textContent = "Accept download file list from " + $scope.easyrtc.idToName(otherGuy) + " ?";
          }
          console.log("incoming call", params.textContent);
          for (x = 0 ; x < fileNameList.length ; x++) {

          }

          $scope.acceptTheCall = function(wasAccepted) {
           //  document.getElementById("acceptCallBox").style.display = "none";
            if( wasAccepted && $scope.easyrtc.getConnectionCount() > 0 ) {
              $scope.easyrtc.hangupAll();
            }
            responsefn(wasAccepted);
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
             $scope.status = 'File accepted.';
             $scope.acceptTheCall (true);
           }, function() {
             $scope.acceptTheCall (false);
             $scope.status = 'File rejected.';
             alert ($scope.status);
           });

         };
         $scope.showConfirm(params);
       };



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
