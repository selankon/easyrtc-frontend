var meterialsControler = angular.module('meterialsControler', []);

meterialsControler.controller('ToastCtrl',
  function($scope, $mdToast, $mdDialog) {
    $scope.closeToast = function() {
      $mdToast
        .hide()
        .then(function() {
        });
    };
  });


//MATERIALS THINGS!
audioVideoCntrl.controller('tutoCntrl', function ($scope, $timeout, $mdSidenav, $log, $mdMedia, $mdToast, $mdDialog) {

    $scope.toggleLeft = buildDelayedToggler('left');
    $scope.toggleRight = buildToggler('right');
    $scope.isOpenRight = function(){
      return $mdSidenav('right').isOpen();
    };



    //FAB Toolbar
    $scope.demo = {
        isOpen: false,
        count: 0,
        selectedDirection: 'right'
      };
    $scope.$watch(function() { return $mdMedia('gt-sm'); }, function(is) {
      $scope.demo.isOpen = is;
    });

    // Toast
    var last = {
      bottom: false,
      top: true,
      left: false,
      right: true
    };
    $scope.toastPosition = angular.extend({},last);
    $scope.getToastPosition = function() {
      sanitizePosition();
      return Object.keys($scope.toastPosition)
        .filter(function(pos) { return $scope.toastPosition[pos]; })
        .join(' ');
    };
    function sanitizePosition() {
      var current = $scope.toastPosition;
      if ( current.bottom && last.top ) current.top = false;
      if ( current.top && last.bottom ) current.bottom = false;
      if ( current.right && last.left ) current.left = false;
      if ( current.left && last.right ) current.right = false;
      last = angular.extend({},current);
    }
    $scope.$watch('myId', function(newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.hideshowToast (newValue);
        }
    });
    $scope.hideshowToast = function(trigger) {
      if (trigger) $scope.hideToast ();
      else $scope.showSimpleToast ();
    };
    // $scope.showSimpleToast = function() {
    //   var pinTo = $scope.getToastPosition();
    //   $mdToast.show(
    //     $mdToast.simple()
    //       .textContent('Need login room!')
    //       .position(pinTo )
    //       .hideDelay(99999)
    //   );
    // };

    $scope.showSimpleToast = function() {
      var pinTo = $scope.getToastPosition();
        $mdToast.show({
          hideDelay   : 99999,
          position    : pinTo,
          templateUrl : 'partials/materials/toast.html',
          controller  : 'tutoCntrl'
        });
      };
    $scope.hideToast = function() {
      $mdToast.hide();
    };
    /**
     * Supplies a function that will continue to operate until the
     * time is up.
     */
    function debounce(func, wait, context) {
      var timer;
      return function debounced() {
        var context = $scope,
            args = Array.prototype.slice.call(arguments);
        $timeout.cancel(timer);
        timer = $timeout(function() {
          timer = undefined;
          func.apply(context, args);
        }, wait || 10);
      };
    }
    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildDelayedToggler(navID) {
      return debounce(function() {
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }, 200);
    }
    function buildToggler(navID) {
      return function() {
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }
    }
  })
  .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      $mdSidenav('left').close()
        .then(function () {
          $log.debug("close LEFT is done");
        });
    };
  })
  .controller('RightCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      $mdSidenav('right').close()
        .then(function () {
          $log.debug("close RIGHT is done");
        });
    };
  });
