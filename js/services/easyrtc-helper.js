var easyrtcHelper = angular.module('easyrtcHelper', []);

easyrtcHelper.factory('chatEasyrtcService', [
  function () {

    var msgLists = {msgList: [], chatList: [], newMsg: '' };
    var callback ;
    var specialChatMessageReceived = null; //This is a callback used for store special messages from chat. In this way, the users could send messages between theys specifing differents orders

    // Chat sound msg received
    var playSound = function (path){
      var audio = new Audio(path);
      audio.play();
    }

    // Set the callback for specials messages
    var setSpecialChatMessageReceived = function (callback){
      specialChatMessageReceived = callback;
    }

    // New message model structure for chat messages
    var newMessage = function (msgType, from, to, date, content, meta){
      return msgLists.newMsg  =  {
          msgType : msgType,
          from :  from,
          to: to,
          date : date,
          content : content,
          meta : meta
         };
    }

    // Configure chat callback function when a message is received
    var configureChat = function (chatCallback){
      console.log("*-- Easyrtc Service chat: configureChat");
      callback = chatCallback;
      easyrtc.setPeerListener(msgReceived); //Chat
    }

    // Send data
    var sendDataWS = function (destination, msgType, msgData, ackhandler) {
      easyrtc.sendDataWS(destination, msgType, msgData, ackhandler );
    }
    // Send data
    var sendMessage = function (msgType, from, to, msg, meta) {
      var newMsg  = newMessage (msgType, from, to, new Date(), msg, meta)
      sendDataWS(newMsg.to, newMsg.msgType, newMsg );
    }

    var checkIfIsChatMessage = function (msgType) {
      return msgType === "chatMessage" ? true : false;
    }

    // When receive a message call the callback funtion
    var msgReceived = function (who ,msgType, msg){
      console.log("*-- Easyrtc Service chat: msgReceived" , msg);
      if (checkIfIsChatMessage(msg.msgType)) {
        callback (who ,msgType, msg);
      } else if (specialChatMessageReceived && !(checkIfIsChatMessage(msg.msgType)) ) {
        specialChatMessageReceived(msg)
        updateMsgList (msg)

      }

    }

    // Update chat msgList
    var updateMsgList = function (msg){
      console.log("*-- Easyrtc Service chat: updateMsgList");
      if (checkIfIsChatMessage(msg.msgType)) {
        msgLists.chatList.push(msg);
      }

      // msgLists.chatList.push(msg);
      msgLists.msgList.push(msg);
    }

    return {
      configureChat : function (chatCallback) {
        return configureChat (chatCallback)
      },
      setSpecialChatMessageReceived : function (callback) {
        return setSpecialChatMessageReceived (callback)
      },
      sendDataWS : function (destination, msgType, msgData, ackhandler) {
        return sendDataWS (destination, msgType, msgData, ackhandler)
      },
      sendMessage : function (msgType, from, to, msg) {
        return sendMessage (msgType, from, to, msg)
      },
      getMsgLists : function () { return msgLists; } ,
      msgReceived : function (who ,msgType, msg) {
        return msgReceived(who ,msgType, msg);
      } ,
      playSound : function (path) { return playSound(path) },
      updateMsgList : function (msg) { return updateMsgList(msg) },
      newMessage : function (msgType, from, to, date, content, meta) {
        return newMessage(msgType, from, to, date, content, meta)
      },

    }
}]);

easyrtcHelper.factory('ftEasyrtcService', [
  function () {

    var getEasyrtc_ft = function () { return easyrtc_ft ; }

    // Build file sender for send files
    var buildFileSender = function (easyrtcid, updateStatusDiv){
      easyrtc_ft.buildFileSender(easyrtcid, updateStatusDiv);
    }

    // Build and localiza the drag and drop zone
    var buildDragNDropRegion = function ( dropAreaName , filesHandler ){
      easyrtc_ft.buildDragNDropRegion( dropAreaName, filesHandler);
    }

    // Build a file receiver
    var buildFileReceiver = function ( acceptRejectCB, blobAcceptor, receiveStatusCB ){
      easyrtc_ft.buildFileReceiver( acceptRejectCB, blobAcceptor, receiveStatusCB );
    }

    var saveAs = function (blob, filename) {
      easyrtc_ft.saveAs(blob, filename);
    }


    return {
      getEasyrtc_ft : function (){
        return getEasyrtc_ft();
      },
      buildFileSender : function (easyrtcid, updateStatusDiv){
        return buildFileSender(easyrtcid, updateStatusDiv);
      },
      buildDragNDropRegion : function (dropAreaName , filesHandler){
        return buildDragNDropRegion(dropAreaName , filesHandler);
      },
      buildFileReceiver : function ( acceptRejectCB, blobAcceptor, receiveStatusCB ){
        return buildFileReceiver( acceptRejectCB, blobAcceptor, receiveStatusCB );
      },
      saveAs : function (blob, filename) {
        return saveAs(blob, filename);
      }

    }

}]);

easyrtcHelper.factory('callEasyrtcService', [
  function () {

    // Enable / disable camera
    var enableCamera = function (bool,streamName) {
      easyrtc.enableCamera(bool,streamName);
    }
    // Enable / disable Micro
    var enableMicrophone = function (bool,streamName) {
      easyrtc.enableMicrophone(bool,streamName);
    }
    // HangupAll
    var hangupAll = function ( ) {
      easyrtc.hangupAll( );
    }

    // Call a peer
    var call = function (otherUser, callSuccessCB, callFailureCB, wasAcceptedCB){
      console.log("*-- Easyrtc Service call: calling");
      easyrtc.call(otherUser, callSuccessCB, callFailureCB, wasAcceptedCB);
    }

    // Connect to easyrtc server
    var connect = function (roomId, OnLoginSuccess, OnLoginFailure){
      console.log("*-- Easyrtc Service call: connect");
      easyrtc.connect(roomId, OnLoginSuccess, OnLoginFailure);
    }

    var getConnectStatus = function (easyrtcid) {
      easyrtc.getConnectStatus(easyrtcid) ;
    }

    // DisConnect to easyrtc server
    var disconnect = function (){
      console.log("*-- Easyrtc Service call: disconnect");
      easyrtc.disconnect();
    }

    // DisConnect to easyrtc server and liberate self video stream
    var disconnectAll = function (videoStream){
      console.log("*-- Easyrtc Service call: disconnect ALL");
      disconnect();
      hangupAll ()
      easyrtc.clearMediaStream( videoStream );
      easyrtc.setVideoObjectSrc( videoStream,"");
      easyrtc.closeLocalMediaStream();
      easyrtc.setRoomOccupantListener( function(){});
    }

    //Starts a media souyrce
    var initMediaSource = function (successCallback, errorCallback, streamName){
      console.log("*-- Easyrtc Service startup: initMediaSource");
      easyrtc.initMediaSource(successCallback, errorCallback, streamName);
    }

    //Set url of socket servrer
    var setStreamAcceptor = function (acceptor){
      console.log("*-- Easyrtc Service startup: setStreamAcceptor");
      easyrtc.setStreamAcceptor(acceptor);
    }

    //Set on stream closes
    var setOnStreamClosed = function (onStreamClosed){
      console.log("*-- Easyrtc Service startup: setOnStreamClosed");
      easyrtc.setOnStreamClosed(onStreamClosed);
    }

    //Set video object
    var setVideoObjectSrc = function (videoObject, stream) {
      console.log("*-- Easyrtc Service startup: setVideoObjectSrc");
      easyrtc.setVideoObjectSrc(videoObject, stream)
    }

    return {

      enableCamera : function (bool,streamName) {
        return enableCamera (bool,streamName)
      },
      enableMicrophone : function (bool,streamName) {
        return enableMicrophone (bool,streamName)
      },
      hangupAll : function ( ) {
          return hangupAll( );
      },
      call : function (otherUser, callSuccessCB, callFailureCB, wasAcceptedCB, streamNames) {
        return call (otherUser, callSuccessCB, callFailureCB, wasAcceptedCB, streamNames)
      },
      connect : function (roomId, OnLoginSuccess, OnLoginFailure) {
        return connect (roomId, OnLoginSuccess, OnLoginFailure)
      },
      getConnectStatus : function (easyrtcid) {
        return getConnectStatus(easyrtcid) ;
      },
      disconnect : function (){
        return disconnect();
      },
      disconnectAll : function (videoStream){
        return disconnectAll(videoStream);
      },
      initMediaSource : function (successCallback, errorCallback, streamName) {
        return initMediaSource (successCallback, errorCallback, streamName)
      },
      setStreamAcceptor : function (acceptor){
        return setStreamAcceptor(acceptor);
      },
      setOnStreamClosed : function (onStreamClosed){
        return setOnStreamClosed (onStreamClosed);
      },
      setVideoObjectSrc : function (videoObject, stream) {
        return setVideoObjectSrc (videoObject, stream)
      },
    }

}]);

easyrtcHelper.factory('startupEasyrtcService', [
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
      showError : function (errorCode, message) {
        return showError (errorCode, message)
      },
    }
}]);
