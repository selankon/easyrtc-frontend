var soundUtils = angular.module('soundUtils', []);

soundUtils.factory('soundPlayer', [
  function () {

    var createSoundObject = function (path) {
      var audio = new Audio(path);
      return audio;
    }

    var playLoop = function (audio, times) {
      var x = 1;
      audio.addEventListener('ended', function() {
        if (times) {
          x++
          if (x >= times){
            audio.pause();
            audio.currentTime = 0;
            return done;
          }
        }
        this.currentTime = 0;
        this.play();
      }, false);
      audio.play();

    }

    var play = function (audio){
      audio.play();
    }
    var stop = function (audio){
      audio.pause();
      audio.currentTime = 0;
    }
    // play single audio
    var playSound = function (path) {
      var audio = new Audio(path);
      audio.play();
      return audio;
    }

    // var stopAllSounds = function (path){
    //   var audio = new Audio(path);
    //   audio.stop();
    // }

    return {
      createSoundObject : function (path){
        return createSoundObject (path);
      },
      playLoop : function (audio, times){
        return playLoop (audio, times);
      },
      play : function (audio){
        return play (audio);
      },
      playSound : function (path){
        return playSound (path);
      },
      stop : function (audio){
        return stop (audio);
      },
      // stopAllSounds : function (path){
      //   return stopAllSounds (path);
      // },
    }

}]);
