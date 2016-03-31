var choiceCntrl = angular.module('choiceCntrl', []);


choiceCntrl.controller ('choicePageCntrl', [ '$scope', '$stateParams', '$state', 'URLS',
    function($scope, $stateParams, $state, URLS) {
      $scope.URLS = URLS;
      // $scope.baseUrl = URLS.createFileRoom+"/"+URLS.ft+"/";
      // $scope.createRoomBtn = function (){
      //   // console.log("FDASF ", $scope.roomId);
      //   $state.go($scope.baseUrl+":roomId", { "roomId": $scope.roomId});
      // }
}]);
