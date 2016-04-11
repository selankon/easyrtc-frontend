var fileTransferHelper = angular.module('fileTransferHelper', []);

fileTransferHelper.factory('fileListsServerService', [
  function (){
    var getBlankFileList = function () {
      return {
        creationDate : null ,
        destiny : null ,
        files : []
      };
    }
    var ownFileLists = getBlankFileList ();
    var ownFileListsOfList = []; // This two are for a "string" based filelist
    var fileList = getBlankFileList () ;
    var multipleFileList = []; // This two are for cantain a javascript fileList object

    var getOwnFileLists = function () {return ownFileLists ;}

    // File model to create the own file list ready to send
    var fileModel = function (file) {
      return {
        name : file.name,
        lastModifiedDate : file.lastModifiedDate,
        size : file.size,
        type : file.type,
        bar : {name : 'bar-'+file.name,
                progress : false} //Used for calculate the download percentage
      }
    }

    // Get a file list
    var getListFromListOfList = function (destiny , list) {
      for (x = 0 ; x < list.length ; x++){
        if (destiny == list[x].destiny) {
          // console.log("FINDED!!! ");
          return list[x];
        }
        // console.log("NOT YET  " , list[x].destiny);
      }
      return false;

    }

    // update list form listOfLists
    var updateList = function (newObj, listOfLists) {
      for (x = 0 ; x < listOfLists.length ; x++ ) {
        if (listOfLists[x].destiny == newObj.destiny) {
          listOfLists[x] = newObj;
          return true;
        }
      }
      return false;
    }

    var removeList =  function (destiny, listOfLists) {
      for (x = 0 ; x < listOfLists.length ; x++ ) {
        if (listOfLists[x].destiny == destiny) {
          listOfLists[x].splice(x,1);
          return true;
        }
      }
      return false;
    }

    // Creates a file list using strings for send to others
    var createOwnFileList = function (filesToSend, destiny) {
      if (filesToSend) {
        ownFileLists = getBlankFileList ();
        ownFileLists.creationDate = new Date();
        ownFileLists.destiny = destiny;
        for (var i = 0; i < filesToSend.length; i++) {
            file = filesToSend[i];
            ownFileLists.files.push( fileModel(file)  );
        }
        // console.log("CREATED OWN LIST " , ownFileLists);
        return ownFileLists;
      }
      return false;
    }

    // Add a list to a file list object list
    var addToListOfFileListObject = function (filesToSend, destiny){
      fileList = getBlankFileList ();
      fileList.creationDate = new Date();
      fileList.destiny = destiny;
      fileList.files = filesToSend;
      var temp = getListFromListOfList (destiny , multipleFileList);
      if ( temp == false){ // Check if exist
        multipleFileList.push ( fileList );
      } else { // If exist update it
        updateList(fileList,multipleFileList);
      }
      return multipleFileList;

    }

    // Array of ownFileLists objects
    var addToOwnFileListOfList = function (filesToSend, destiny) {
      var temp = getListFromListOfList (destiny , ownFileListsOfList);

      if ( temp == false){ // Check if exist
        ownFileListsOfList.push ( createOwnFileList(filesToSend, destiny) );
      } else { // If exist update it
        updateList( createOwnFileList(filesToSend, destiny) , ownFileListsOfList);
      }
      // console.log("ownFileListsOfList " , ownFileListsOfList);
      return ownFileListsOfList;
    }


    return {
      createOwnFileList : function (filesToSend) {
        return createOwnFileList(filesToSend);
      },
      // getOwnFileLists : function () {
      //   return getOwnFileLists();
      // },
      addToOwnFileListOfList : function (filesToSend, destiny) {
        return addToOwnFileListOfList (filesToSend, destiny);
      },
      addToListOfFileListObject : function (filesToSend, destiny) {
        return addToListOfFileListObject (filesToSend, destiny);
      },
      getListFromListOfList : function (destiny , list) {
        return getListFromListOfList (destiny , list);
      },
      removeList : function (obj, listOfLists) {
        return getListFromListOfList (obj, listOfLists);
      },


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
