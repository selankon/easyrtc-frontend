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
      if ( !(angular.isUndefined(list) || list === null)  ){
        for (x = 0 ; x < list.length ; x++){
          if (destiny == list[x].destiny) {
            // console.log("FINDED!!! ");
            return list[x];
          }
          // console.log("NOT YET  " , list[x].destiny);
        }
        return false;
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

    // Remove a list of files
    var removeList =  function (destiny, listOfLists) {
      for (x = 0 ; x < listOfLists.length ; x++ ) {
        if (listOfLists[x].destiny == destiny) {
          listOfLists.splice(x,1);
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
      console.log("ownFileListsOfList! " , ownFileListsOfList);
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
      removeList : function (destiny, listOfLists) {
        return removeList (destiny, listOfLists);
      },


    }
}]);


// RECEIVE AND MANAGE DATAS
fileTransferHelper.factory('fileListsClientService', [
  function (){

    var externalFileLists = [];
    var getExternalFileLists = function () { return externalFileLists; }

    // ************************
    // ***  OLD
    // ************************

    // // Check if the file list is in his last version
    // var isFileListUpdated = function (list, model) {
    //   if ( model.creationDate  == list.creationDate ) {
    //     return true;
    //   }
    //   else {
    //     return false;
    //   }
    //   return false;
    // }
    //
    //
    //



    // ************************
    // *** NEW ONES
    // ************************

    // Check if a user have a fileList registered
    var existList = function (from, listOfLists) {
      if (getFileListFromId(from, listOfLists)) {
        return true;
      }
      return false;
    }

    // Return the files list from specific user list
    var getFileListFromId = function (from, listOfLists) {
      for (x = 0 ; x < listOfLists.length ; x++ ) {
        if (listOfLists[x].id == from) {
          return listOfLists[x].fileLists;
        }
      }
      return false;
    }

    // Remove a list of files
    var removeList =  function (destiny, fileLists) {
      for (x = 0 ; x < fileLists.length ; x++ ) {
        if (fileLists[x].destiny == destiny) {
          fileLists.splice(x,1);
          return true;
        }
      }
      return false;
    }

    // ************************
    // *** REFACTORED OLD
    // ************************

    // Get a file the list of files inside the fileLists
    // getSingleFileList
    var getFilesFromList = function (easyrtcid, fileLists) {
      for (x = 0 ; x < fileLists.length ; x++ ) {
        if (fileLists[x].destiny == easyrtcid) {
          return fileLists[x].files;
        }
      }
      return false;
    }


    // Update a file list from a fileLists
    var updateModelList = function (newObj, fileLists) {
      for (x = 0 ; x < fileLists.length ; x++ ) {
        if (fileLists[x].destiny == newObj.destiny) {
          fileLists[x] = newObj;
          return true;
        }
      }
      return false;
    }

    // Get alls tored lists (privated and public) of a user
    var getAllListOfUser = function (easyrtcid, listOfLists) {
      for (x = 0 ; x < listOfLists.length ; x++ ) {
        if (listOfLists[x].id == easyrtcid) {
          return listOfLists[x];
        }
      }
      return false;
    }

    // Add a file list if doesn't exist
    var addSingleFileList = function (from , list) {


      // If not exist the lists of this user directly create it the lists
      if ( !(existList(from, externalFileLists)) ) {
        console.log("pushing list to externalFileLists...... ");
        var temp = {id : from , fileLists : []};
        temp.fileLists.push(list)
        externalFileLists.push (temp);
      }
      //If the list exists
      else {
        // You can have a private or a public file list, check if is one of this, in other words, if the file  list received exist inside the list
        var temp = getFileListFromId (from , externalFileLists);
        if (getFilesFromList (list.destiny , temp ) ) {
          // If exits update it
          console.log("Updating list...");
          updateModelList (list , temp );
        }
        // Else push it
        else {
          // var filelists = getFileListFromId (from , externalFileLists);
          temp.push(list);
        }
      }

      console.log("EXTERNAL FILE LIST " , externalFileLists);
    }


        // Check if a list is a public filelist (sender and destiny are the same)
        // var isPublicFileList = function (id, list) {
        //   if (list.destiny == id ) {
        //     return true;
        //   }
        //   return false;
        // }



    return {
      getExternalFileLists : function (){
        return getExternalFileLists();
      },
      addSingleFileList : function (from , list) {
        return addSingleFileList (from , list)
      },
      // getSingleFileList : function (from , list) {
      //   return getSingleFileList (from , list)
      // },
      getAllListOfUser : function (from , list) {
        return getAllListOfUser (from , list)
      },
      removeList : function (destiny, listOfLists) {
        return removeList (destiny, listOfLists);
      },
    }





}]);
