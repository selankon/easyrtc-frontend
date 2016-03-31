var genericDirectives = angular.module('genericDirectives', []);

genericDirectives.directive('chat', function () {
    return {
        restrict: 'A',
        templateUrl: "js/directives/templates/chat.html",
        controller: 'chatCntrlAll',
        // scope: {
        //    'msgHandlerVar': '=' // two way binding
        // },
        link: function (scope, element, attrs) {
          // console.log("DIRECTIVE CALLED");
          // scope.chat = {msgList: '', msg: ''};
          // scope.chat.msgList = [];

          scope.$watch('newMsgHandler', function() {
            console.log('innerFunc called' , scope.msgContent , scope.newMsgHandler);
            console.log("first time ", scope.msgContent.msgType);
            // if ( scope.msgContent.msgType != "firstTime") {
              scope.msgReceived (scope.msgContent.msgType ,scope.msgContent.msg );
            // }
          })


          // scope.msgReceived = function (who, msgType, msg) {
          //       setTimeout(function() {
          //           scope.$apply(function () {
          //               console.log("Message received!" , msg, "  who  " , who);
          //               scope.chat.msgList.push(msg);
          //               scope.audMsgReceived();
          //           }, 0);
          //       });
          //
          // };


        }

    }
});
