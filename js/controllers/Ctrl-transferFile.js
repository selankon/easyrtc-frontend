var fileTransferCntrl = angular.module('fileTransferCntrl', []);

fileTransferCntrl.controller ('fileRoomCntrl', [ '$scope', '$stateParams', '$state',  '$mdDialog',
    function($scope, $stateParams, $state, $mdDialog) {

      $scope.roomId = $stateParams.roomId;
      $scope.myId = false;
      $scope.noDCs = {}; // which users don't support data channels
      $scope.dropAreaName = "droparea_"

      // **** Accept file download
      // easyrtc.setAcceptChecker(function(easyrtcid, responsefn) {
      //     var params = {
      //       title : "Download File",
      //       textContent : null,
      //       ariaLabel : "Download File",
      //       ok : "Download",
      //       cancel : "Reject"
      //     };
      //     if( easyrtc.getConnectionCount() > 0 ) {
      //       params.textContent = "Cancel file transfer from " + easyrtc.idToName(easyrtcid) + " ?";
      //     }
      //     else {
      //       params.textContent = "Accept download file from " + easyrtc.idToName(easyrtcid) + " ?";
      //     }
      //     console.log("incoming call", params.textContent);
      //
      //     $scope.acceptTheCall = function(wasAccepted) {
      //      //  document.getElementById("acceptCallBox").style.display = "none";
      //       if( wasAccepted && easyrtc.getConnectionCount() > 0 ) {
      //         easyrtc.hangupAll();
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


      // **** Custom init and connect to the room
      $scope.my_init = function () {
        easyrtc.enableDataChannels(true);
        easyrtc.enableVideo(false);
        easyrtc.enableAudio(false);

        //Listener new occupant
        easyrtc.setRoomOccupantListener( loggedInListener );

        //Automatic accept checker
        easyrtc.setAcceptChecker(function(easyrtcid, responsefn) {
          responsefn(true);
        });

        //Conected to user
        easyrtc.setDataChannelOpenListener(function(easyrtcid, usesPeer) {
          console.log("Conected to ", easyrtcid);
          // $scope.createDragAnDrop(easyrtcid);

        });

        //Disconected to user
        easyrtc.setDataChannelCloseListener(function(easyrtcid) {
          console.log("Disconect to ", easyrtcid);
        });

        //When connect to Room
        var loginSuccess = function (myId) {
          console.log("My easyrtcid is " + myId);
          $scope.$apply(function() { $scope.myId = myId;});
          $scope.createDragAnDrop(myId);

          easyrtc_ft.buildFileReceiver(acceptRejectCB, blobAcceptor, receiveStatusCB);
        }

        //Failed to connect to Room
        var loginFailure = function(errorCode, message) {
          easyrtc.showError(errorCode, message);
          console.log(errorCode, message);
        }

        //Connect to Room
        easyrtc.connect($scope.roomId, loginSuccess, loginFailure);
      };
      $scope.my_init ();

      // **** Function that controlls when a new peer is connected
      function loggedInListener(roomName, otherPeers) {
         $scope.$apply(function() { $scope.UserList = otherPeers;});

       };

       // **** Automatically connect to peer
       $scope.conectionToPeer = function (easyrtcid){

         easyrtc.call(easyrtcid,
                 function(caller, mediatype) {
                    console.log("Connecting to ", easyrtcid);
                 },
                 function(errorCode, errorText) {
                    console.log("Connection Failed");
                    $scope.noDCs[easyrtcid] = true;
                 },
                 function wasAccepted(yup) {
                 }
         );
       }




      // **** Accept or reject a file from other
      function acceptRejectCB(otherGuy, fileNameList, wasAccepted) {

        // List the files being offered
        console.log("Files offered: " , fileNameList);

      }

      // **** Save a file
      function blobAcceptor(otherGuy, blob, filename) {
        easyrtc_ft.saveAs(blob, filename);
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
        // function filesHandler(files) {
        //   console.log("WADASAFDSGASGAS " , files);
        //     // if we haven't eastablished a connection to the other party yet, do so now,
        //     // and on completion, send the files. Otherwise send the files now.
        //     var timer = null;
        //     if (easyrtc.getConnectStatus(easyrtcid) === easyrtc.NOT_CONNECTED && $scope.noDCs[easyrtcid] === undefined) {
        //         // calls between firefrox and chrome ( version 30) have problems one way if you
        //         // use data channels.
        //         console.log("not conected");
        //
        //     }
        //     else if (easyrtc.getConnectStatus(easyrtcid) === easyrtc.IS_CONNECTED || $scope.noDCs[easyrtcid]) {
        //         if (!fileSender) {
        //             fileSender = easyrtc_ft.buildFileSender(easyrtcid, updateStatusDiv);
        //         }
        //
        //         $scope.$apply(function() { $scope.filesToSend = files;});
        //         fileSender(files, true /* assume binary */);
        //     }
        //     else {
        //         easyrtc.showError("user-error", "Wait for the connection to complete before adding more files!");
        //     }
        // }

        console.log("Creating dragAnDrop");
        easyrtc_ft.buildDragNDropRegion($scope.dropAreaName+easyrtcid, filesHandler);
      }




}]);

fileTransferCntrl.controller ('createFileRoomCntrl', [ '$scope', '$stateParams', '$state', 'URLS',
    function($scope, $stateParams, $state, URLS) {
      $scope.baseUrl = URLS.createFileRoom+"/"+URLS.fileTransfer+"/";

}]);