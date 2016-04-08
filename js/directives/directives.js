var genericDirectives = angular.module('genericDirectives', []);


genericDirectives.directive('emojimenu', function () {
    return {
      restrict: 'A',
      templateUrl: "js/directives/templates/emoji-menu.html",
      controller: 'emojiMenuCntrl',

    }
});
genericDirectives.directive('privatemessagebtn', function () {
    return {
      restrict: 'A',
      templateUrl: "js/directives/templates/btn-privatemsg.html",
      scope: {
        easyrtcid: "=easyrtcid",
        changeDestiny: '&'
      }
    }
});

// used for prevent the click propagation on the emojimenu
genericDirectives.directive('myClick', function ($parse, $rootScope) {
    return {
        restrict: 'A',
        compile: function ($element, attrs) {
            var fn = $parse(attrs.myClick, null, true);
            return function myClick(scope, element) {
                element.on('click', function (event) {
                    var callback = function () {
                        fn(scope, { $event: event });
                    };
                    scope.$apply(callback);
                })
            }
        }
    }
})

genericDirectives.directive('chat', function () {
    return {
        restrict: 'A',
        templateUrl: "js/directives/templates/chat.html",
        controller: 'chatCntrlAll',
        // scope: {
        //    'msgHandlerVar': '=' // two way binding
        // },
        // link: function (scope, element, attrs) {
        //   // console.log("DIRECTIVE CALLED");
        //   // scope.chat = {msgList: '', msg: ''};
        //   // scope.chat.msgList = [];
        //
        //   scope.$watch('newMsgHandler', function() {
        //     console.log('innerFunc called' , scope.msgContent , scope.newMsgHandler);
        //     console.log("first time ", scope.msgContent.msgType);
        //     // if ( scope.msgContent.msgType != "firstTime") {
        //       // scope.msgReceived (scope.msgContent.msgType ,scope.msgContent.msg );
        //     // }
        //   })
        //
        //
        //   // scope.msgReceived = function (who, msgType, msg) {
        //   //       setTimeout(function() {
        //   //           scope.$apply(function () {
        //   //               console.log("Message received!" , msg, "  who  " , who);
        //   //               scope.chat.msgList.push(msg);
        //   //               scope.audMsgReceived();
        //   //           }, 0);
        //   //       });
        //   //
        //   // };
        //
        //
        // }

    }
});
