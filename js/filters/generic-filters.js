var filters = angular.module('genericFilters', []);

// This filter change the order of a ng-repeat, used on chat, adding the new messages on top instead on bottom
filters.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

//This select the correct font-awesome file icon for each file type.
filters.filter('fileIcon', function() {
  return function(type) {
    console.log("type icon: ", type );

    // MIME file names
    // http://www.freeformatter.com/mime-types-list.html
    if (type.indexOf("image") > -1)
              return "fa-file-image-o";
    else if (type.indexOf("video") > -1)
              return "fa-file-video-o";
    else if (type.indexOf("audio") > -1)
              return "fa-file-audio-o";
    else if ( (type.indexOf("html") > -1 )||
              (type.indexOf("bat") > -1 )||
              (type.indexOf("json") > -1 )||
              (type.indexOf("x-markdown") > -1 )||
              (type.indexOf("javascript") > -1 )
              ) return "fa-file-code-o";
    else if ( type.indexOf("zip") > -1  ||
              type.indexOf("rar") > -1  ||
              type.indexOf("rar") > -1  ||
              type.indexOf("x-gtar") > -1  ||
              type.indexOf("x-tar") > -1
            ) return "fa-file-archive-o";
    else if (type.indexOf("pdf") > -1)
              return "fa-file-pdf-o";
    else if (type.indexOf("text") > -1)
              return "fa-file-text-o";

    else return "fa-file-o";

    // switch (type) {
    //   case "text/html":
    //     // return '<i class="fa fa-file-code-o fa-lg"></i>';
    //     return "fa-file-code-o";
    //     break;
    //
    //   case "html":
    //     // return '<i class="fa fa-file-code-o fa-lg"></i>';
    //     return "fa-file-code-o";
    //     break;
    //   default:
    //     // return '<i class="fa fa-file-o fa-lg"></i>';
    //     return "fa-file-o";
    // }
  };
});
