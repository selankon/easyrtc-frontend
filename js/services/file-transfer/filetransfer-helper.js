var fileTransferHelper = angular.module('fileTransferHelper', []);

fileTransferHelper.factory('fileListsServerService', [
  function (){
    var getBlankFileList = function () {
      return {
        creationDate : null ,
        files : [] };
    }
    var ownFileLists = getBlankFileList ();

    var getOwnFileLists = function () {return ownFileLists ;}

    // File model to create the own file list ready to send
    var fileModel = function (file) {
      return {
        name : file.name,
        lastModifiedDate : file.lastModifiedDate,
        size : file.size,
        type : file.type,
        bar : {name : 'bar'+file.name,
                progress : false} //Used for calculate the download percentage
      }
    }


    // Creates a file list using strings for send to others
    var createOwnFileList = function (filesToSend) {
      if (filesToSend) {
        ownFileLists = getBlankFileList ()
        ownFileLists.creationDate = new Date();
        for (var i = 0; i < filesToSend.length; i++) {
            file = filesToSend[i];
            ownFileLists.files.push( fileModel(file)  );
        }
        // ownFileLists.push ( { creationDate : new Date() } ); //Appending creation date (util for updates)
        console.log("CREATED OWN LIST " , ownFileLists);
        return ownFileLists;
      }
      return false;
    }


    return {
      createOwnFileList : function (filesToSend) {
        return createOwnFileList(filesToSend);
      },
      getOwnFileLists : function () {
        return getOwnFileLists();
      }
    }
}]);


// RECEIVE AND MANAGE DATAS
fileTransferHelper.factory('fileListsClientService', [
  function (){

    var externalFileLists = [];
    var getExternalFileLists = function () { return externalFileLists; }

    // Check if a user have a fileList registered
    var existFileList = function (from, listOfLists) {
      if (getSingleFileList(from, listOfLists) ) {
        return true;
      }
      return false;
    }


    // Check if the file list is in his last version
    var isFileListUpdated = function (list, model) {
      // var model = getSingleFileList (fileList.id, listOfLists);
      // console.log("FILE LIST " , list);
      // console.log("MODEL  " , model);
      if ( model.creationDate  == list.creationDate ) {
        // console.log("SAME DATE");
        return true;
      }
      else {
        // console.log("NOTSAMEDATE");
        return false;
      }
      return false;
    }

    // get a file list if exit if not return false
    var getSingleFileList = function (easyrtcid, listOfLists) {
      for (x = 0 ; x < listOfLists.length ; x++ ) {
        if (listOfLists[x].id == easyrtcid) {
          return listOfLists[x].fileList;
        }
      }
      return false;
    }


    // newObj = result of getSingleFileList
    var updateModelList = function (newObj, listOfLists) {

      for (x = 0 ; x < listOfLists.length ; x++ ) {
        if (listOfLists[x].id == newObj.id) {
          listOfLists[x].fileList = newObj.fileList;
          return true;
        }
      }
      return false;

    }

    // Add a file list if doesn't exist
    var addSingleFileList = function (from , list) {
      var temp = {id : from , fileList : list};

      // isFileListUpdated(temp.fileList, getSingleFileList (temp.id, externalFileLists) );

      if ( !existFileList(from, externalFileLists) ) {
        console.log("pushing...... ");
        externalFileLists.push (temp);
      }
      else if (!isFileListUpdated(temp.fileList, getSingleFileList (temp.id, externalFileLists) )) {
        updateModelList(temp, externalFileLists );
      }
      // console.log("AFTER!!! " , getSingleFileList (temp.id, externalFileLists) );
      // updateModelList(temp.fileList, getSingleFileList (temp.id, externalFileLists));
      // console.log("2 BFORe " , getSingleFileList (temp.id, externalFileLists) );
      console.log("EXTERNAL FILE LIST " , externalFileLists);
    }


    return {
      getExternalFileLists : function (){
        return getExternalFileLists();
      },
      addSingleFileList : function (from , list) {
        return addSingleFileList (from , list)
      },
      getSingleFileList : function (from , list) {
        return getSingleFileList (from , list)
      }
    }





}]);
