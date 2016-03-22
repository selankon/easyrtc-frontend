var easyRtcApp = angular.module('easyRtcApp', [
  'ngRoute',
  'ui.router',
  'ngMaterial',
  'ngMessages',
  'ui.bootstrap',

  'audioVideoCntrl',
  'easyRtcApp.config',
  'meterialsControler',

]);
easyRtcApp.config(['$urlRouterProvider', '$stateProvider', '$httpProvider', 'URLS',
  function($urlRouterProvider, $stateProvider, $httpProvider, URLS) {

    $stateProvider
      .state(URLS.index, {
        url: '/'+URLS.index,
        templateUrl: 'partials/choice.html'
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

    $urlRouterProvider.otherwise('/'+URLS.createRoom);

}]);
