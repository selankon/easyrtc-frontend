var choiceCntrl = angular.module('choiceCntrl', []);


choiceCntrl.controller ('choicePageCntrl', [ '$scope', '$stateParams', '$state', 'URLS', 'mediaResources',
    function($scope, $stateParams, $state, URLS, mediaResources) {
      $scope.URLS = URLS;
      $scope.mediaResources = mediaResources;
      // $scope.baseUrl = URLS.createFileRoom+"/"+URLS.ft+"/";
      // $scope.createRoomBtn = function (){
      //   // console.log("FDASF ", $scope.roomId);
      //   $state.go($scope.baseUrl+":roomId", { "roomId": $scope.roomId});
      // }
}]);
