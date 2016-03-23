var filters = angular.module('genericFilters', []);
filters.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});
