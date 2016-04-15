var config_module = angular.module('easyRtcApp.config', [])
.constant("api", {
  "ip" : "localhost",
  "httpPort" : ":7070",
  "httpsPort" : ":7071"
})

.constant("URLS", {
  "index" : "choice",
  "createRoom" : "create",
  "audioVideo" : "AV",

  "createFileRoom" : "fileTransfer",
  "fileTransfer" : "ft"
})

.constant("mediaResources", {
  "chatMessageAlert" : "audio/messageReceived.mp3",
  "incomingCall" : "audio/tokyo_drift.mp3",
  "outgoingCall" : "audio/outgoing.mp3",
  "backgroundChoice" : "img/background.jpg"
})
