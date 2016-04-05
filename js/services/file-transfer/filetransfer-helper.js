var fileTransferHelper = angular.module('fileTransferHelper', []);


fileTransferHelper.factory('fileListsService', [
  function (){
    var externalFileLists = [];
    var whoToUpdate = [];
    var ownFileLists;

    var getFileLists = function () { return externalFileLists; }

    var createOwnFileList = function (filesToSend) {
      var ownFileLists = [];
      for (var i = 0; i < filesToSend.length; i++) {

          // get item
          // file = filesToSend[i];
          //or
          file = filesToSend[i];

          console.log(file.name);
      }

      return ownFileLists;
    }

    // var addList = function (data) {
    //   var newList = {
    //     easyrtcid : data.easyrtcid,
    //     list : data.list
    //   }
    //   fileLists.push = (newList);
    // }


    return {
      getFileLists : function (){
        return getFileLists();
      },
      createOwnFileList : function (filesToSend) {
        return createOwnFileList(filesToSend);
      },
    }





}]);
