var progressbarUtils = angular.module('progressbarUtils', []);

progressbarUtils.factory ('progressbarGestion' ,[
  function (){

    var barList = [];

    var getBarList = function () {return barList;}

    // ***********
    // progressBar methods
    // ***********

    var getEmptyBar = function () {
      return {
        id : null,
        progress : false,
        size : 0,
        meta : {}
      }
    }

    var createBar = function ( id,  barList ){
      var temp = getEmptyBar ();
      temp.id = id;
      barList.push (temp);
    }

    var deleteBar = function (barId , barList){
      for (x = 0 ; x < barList.length ; x++ ) {
        if (barList[x].id == id) {
          barList.splice(x,1);
          return true;
        }
      }
      return false;
    }

    var getSingleBar = function (barId , barList){
      for (x = 0 ; x < barList.length ; x++) {
        if ( barList[x].id == barId ){
          return barList[x];
        }
      }
      return false;
    }

    var updateBar = function (actual, max, bar, barList) {
      bar.progress =  (actual/max)*100 ;
      console.log( "*** BAR ! - Actual bar progress " , bar);
      if (bar.progress >= 100 ) deleteBar (bar, barList);
    }


    // ***********
    // progressBar methods
    // ***********



    return {
      getBarList : function () {
        return getBarList();
      },
      getSingleBar : function (barId , barList) {
        return getSingleBar(barId , barList);
      },
      updateBar : function (actual, max, bar) {
        return updateBar(actual, max, bar);
      },
      createBar : function (id , to , barList) {
        return createBar(id , to , barList);
      },
    }




}]);
