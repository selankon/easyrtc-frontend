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

.constant("sounds", {
  "chatMessageAlert" : "audio/messageReceived.mp3"
})
