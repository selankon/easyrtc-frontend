var easyrtcHelper = angular.module('easyrtcHelper', []);

easyrtcHelper.factory('chatEasyrtcService', [
  function () {

    var msgLists = {msgList: [], msg: ''};
    var callback;

    // Chat sound msg received
    var playSound = function (path){
      var audio = new Audio(path);
      audio.play();
    }

    // Configure chat callback function when a message is received
    var configureChat = function (chatCallback){
      console.log("*-- Easyrtc Service chat: configureChat");
      callback = chatCallback;
      easyrtc.setPeerListener(chatCallback); //Chat
    }

    // Send message
    var sendDataWS = function (destination, msgType, msgData, ackhandler) {
      easyrtc.sendDataWS(destination, msgType, msgData, ackhandler );
    }

    // When receive a message call the callback funtion
    var msgReceived = function (who ,msgType, msg){
      console.log("*-- Easyrtc Service chat: msgReceived");
      callback (who ,msgType, msg);
    }

    // Update chat msgList
    var updateMsgList = function (msg){
      console.log("*-- Easyrtc Service chat: updateMsgList");
      msgLists.msgList.push(msg)
    }

    return {
      configureChat : function (chatCallback) {
        return configureChat (chatCallback)
      },
      sendDataWS : function (destination, msgType, msgData, ackhandler) {
        return sendDataWS (destination, msgType, msgData, ackhandler)
      },
      getMsgLists : function () { return msgLists; } ,
      msgReceived : function (who ,msgType, msg) {
        return msgReceived(who ,msgType, msg);
      } ,
      playSound : function (path) { return playSound(path) },
      updateMsgList : function (msg) { return updateMsgList(msg) },

    }
}]);

easyrtcHelper.factory('easyrtcService', [
  function () {

    var getEasyrtc = function () { return easyrtc ; }

    // Configure data chanels that are connected
    var configureChanels = function (audioVideo) {
      console.log("*-- Easyrtc Service startup: configureChanels");
      easyrtc.enableDataChannels(true);
      easyrtc.enableVideo(audioVideo);  //For only file sharing
      easyrtc.enableAudio(audioVideo);  //For only file sharing
    }

    //Configure callback function for new occupant
    var setRoomOccupantListener = function  (loggedInListener) {
      console.log("*-- Easyrtc Service startup: setRoomOccupantListener");
      easyrtc.setRoomOccupantListener( loggedInListener );
    }

    // Accept checker funtion, use responsefn(true); for authomatic
    var setAcceptChecker = function  (acceptChecker) {
      console.log("*-- Easyrtc Service startup: setAcceptChecker");
      easyrtc.setAcceptChecker(acceptChecker);
    }

    // Connected to user
    var setDataChannelOpenListener = function (onUserConnection){
      console.log("*-- Easyrtc Service startup: setDataChannCelOpenListener");
      easyrtc.setDataChannelOpenListener (onUserConnection);
    }

    // On user disconect from channel
    var setDataChannelCloseListener = function (onUserDisconnection){
      console.log("*-- Easyrtc Service startup: setDataChannelCloseListener");
      easyrtc.setDataChannelCloseListener(onUserDisconnection);
    }

    // Connect to easyrtc server
    var connect = function (roomId, OnLoginSuccess, OnLoginFailure){
      console.log("*-- Easyrtc Service startup: connect");
      easyrtc.connect(roomId, OnLoginSuccess, OnLoginFailure);
    }

    // Call a peer
    var call = function (otherUser, callSuccessCB, callFailureCB, wasAcceptedCB){
      console.log("*-- Easyrtc Service: calling");
      easyrtc.call(otherUser, callSuccessCB, callFailureCB, wasAcceptedCB);
    }

    // Show errorCode
    var showError = function (errorCode, message){
      easyrtc.showError(errorCode, message);
    }

    return {
      getEasyrtc : function (){
        return getEasyrtc();
      },
      configureChanels : function ( audioVideo) {
        return configureChanels (audioVideo )
      },
      setRoomOccupantListener : function (loggedInListener) {
        return setRoomOccupantListener (loggedInListener)
      },
      setAcceptChecker : function (acceptChecker) {
        return setAcceptChecker (acceptChecker)
      },
      setDataChannelOpenListener : function (onUserConnection) {
        return setDataChannelOpenListener (onUserConnection)
      },
      setDataChannelCloseListener : function (onUserDisconnection) {
        return setDataChannelCloseListener (onUserDisconnection)
      },
      connect : function (roomId, OnLoginSuccess, OnLoginFailure) {
        return connect (roomId, OnLoginSuccess, OnLoginFailure)
      },
      call : function (otherUser, callSuccessCB, callFailureCB, wasAcceptedCB, streamNames) {
        return call (otherUser, callSuccessCB, callFailureCB, wasAcceptedCB, streamNames)
      },
      showError : function (errorCode, message) {
        return showError (errorCode, message)
      },
    }
}]);
