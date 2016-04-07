var easyRtcApp = angular.module('easyRtcApp', [
  'emoji',
  'ngRoute',
  'ui.router',
  'ngMaterial',
  'ngSanitize',
  'ngMessages',
  'ngFileUpload',
  'ui.bootstrap',

  'chatCntrl',
  'emojiMenu',
  'choiceCntrl',
  'easyrtcHelper',
  'genericFilters',
  'audioVideoCntrl',
  'emojiMenuHelper',
  'fileTransferCntrl',
  'genericDirectives',
  'easyRtcApp.config',
  'fileTransferHelper',
  'meterialsControler',

]);
easyRtcApp.config(['$urlRouterProvider', '$stateProvider', '$httpProvider', 'URLS',
  function($urlRouterProvider, $stateProvider, $httpProvider, URLS) {

    $stateProvider
      .state(URLS.index, {
        url: '/'+URLS.index,
        templateUrl: 'partials/choice.html',
        controller: 'choicePageCntrl'
      })
      .state(URLS.createRoom, {
        url: '/'+URLS.createRoom,
        templateUrl: 'partials/audio-video/create-room.html',
        controller: 'createRoomCntrl'
      })
      .state(URLS.createRoom+'/'+URLS.audioVideo+'/:roomId', {
        url: '/'+URLS.createRoom+'/'+URLS.audioVideo+'/:roomId',
        templateUrl: 'partials/audio-video/AVroom.html',
        controller: 'audiovideoPage'
      })

      .state(URLS.createFileRoom, {
        url: '/'+URLS.createFileRoom,
        templateUrl: 'partials/file-transfer/create-file-room.html',
        controller: 'createFileRoomCntrl'
      })
      .state(URLS.createFileRoom+'/'+URLS.fileTransfer+'/:roomId', {
        url: '/'+URLS.createFileRoom+'/'+URLS.fileTransfer+'/:roomId',
        templateUrl: 'partials/file-transfer/FileRoom.html',
        controller: 'fileRoomCntrl'
      })
      .state('chat', {
        templateUrl: 'partials/chat/chat.html',
        controller: 'chatCntrlAll'
      })

    $urlRouterProvider.otherwise('/'+URLS.index);

}]);
