var blocJams = angular.module('blocJams', ['ui.router']);

blocJams.config(['$stateProvider', '$locationProvider', function ($stateProvider, $locationProvider) {

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    $stateProvider
        .state('landing', {
            url: '/',
            controller: 'LandingController',
            templateUrl: '/templates/landing.html'
        })
        .state('collection', {
            url: '/colletion',
            controller: 'CollectionController',
            templateUrl: '/templates/collection.html'
        })
        .state('album', {
            url: '/album',
            controller: 'AlbumController',
            templateUrl: '/templates/album.html'
        });

}]);


blocJams.controller('LandingController', ['$scope', function ($scope) {
    $scope.tagLine = "Turn the music up!";
    $scope.points = [
        {
            icon: 'ion-music-note',
            title: 'Choose your music',
            description: 'The world is full of music; why should you have to listen to music that someone else chose?'
        },
        {
            icon: 'ion-radio-waves',
            title: 'Unlimited, streaming, ad-free',
            description: 'No arbitrary limits. No distractions.'
        },
        {
            icon: 'ion-iphone',
            title: 'Mobile enabled',
            description: 'Listen to your music on the go. This streaming service is available on all mobile platforms.'
        }];

}]);


blocJams.directive('qmSellingPoints', function () {

    var linkFunction = function (scope, element, attributes) {
        var points = $('.point');

        var animatePoints = function (points) {
            angular.element(points).css({
                opacity: 1,
                transform: 'scaleX(1) translateY(0)'
            });
        };


        if ($(window).height() > 950) {
            angular.forEach(points, function (point) {
                animatePoints(point);
            });
        }

        var scrollDistance = $('.selling-points').offset().top - $(window).height() + 200;

        $(window).scroll(function (event) {
            if ($(window).scrollTop() >= scrollDistance) {
                angular.forEach(points, function (point) {
                    animatePoints(point);
                });
            }
        });
    };

    return {
        restrict: 'A',
        link: linkFunction
    }
});


blocJams.controller('CollectionController', ['$scope', function ($scope) {
    $scope.albums = [];
    for (var i = 0; i < 12; i++) {
        $scope.albums.push(angular.copy(albumPicasso));
    }
}]);


blocJams.filter('timeCode', function () {
    return function (timeInSeconds) {
        if (timeInSeconds) {
            var totalSeconds = parseFloat(timeInSeconds);
            var minutes = Math.floor(totalSeconds / 60) + "";
            var seconds = Math.floor(totalSeconds % 60) + "";

            return (minutes + ":" + seconds);
        } else {
            return null;
        }
    }
});


blocJams.service('SongPlayer', function () {
    var currentSoundFile = null;
    var currentVolume = 80;
    var trackIndex = function (album, song) {
        return album.songs.indexOf(song);
    };


    return {
        currentAlbum: null,
        currentSong: null,
        Playing: false,
        setSong: function (album, song) {
            if (currentSoundFile) {
                currentSoundFile.stop();
            }

            this.currentAlbum = album;
            this.currentSong = song;

            currentSoundFile = new buzz.sound(song.audioUrl, {
                formats: ['mp3'],
                preload: true
            });

            this.play();
            this.setVolume(currentVolume);
        },
        play: function () {
            this.Playing = true;
            currentSoundFile.play();

        },
        pause: function () {
            this.Playing = false;
            currentSoundFile.pause();
        },

        togglePlayPause: function () {
            if (this.pause()) {
                this.currentSoundFile.play();
                console.log("I am playing");
            } else {
                this.pause();
            }
        },
        setVolume: function (volume) {
            this.volume = currentVolume;
            if (currentSoundFile) {
                currentSoundFile.setVolume(volume);
            }
        },
        setTime: function (time) {
            if (currentSoundFile) {
                currentSoundFile.setTime(time);
            }
        },
        getTimePosition: function () {
            if (currentSoundFile) {
                currentSoundFile.bind('timeupdate', function (event) {
                    return this.getTime() / this.getDuration();
                });
            }
        },
        previousSong: function () {

            var currentSongIndex = trackIndex(this.currentAlbum, this.currentSong);
            currentSongIndex--;

            if (currentSongIndex < 0) {
                currentSongIndex = this.currentAlbum.songs.length - 1;
            }

            this.setSong(this.currentAlbum, this.currentAlbum.songs[currentSongIndex]);
            currentSoundFile.play();
        },
        nextSong: function () {

            var currentSongIndex = trackIndex(this.currentAlbum, this.currentSong);
            currentSongIndex++;

            if (currentSongIndex >= this.currentAlbum.songs.length) {
                currentSongIndex = 0;
            }

            this.setSong(this.currentAlbum, this.currentAlbum.songs[currentSongIndex]);
            currentSoundFile.play();
        }
    };
});


blocJams.controller('AlbumController', ['$scope', 'SongPlayer', function ($scope, SongPlayer) {
    $scope.album = albumPicasso;
    var albums = [albumPicasso, albumMarconi, albumMothership];
    var index = 1;
    $scope.switchAlbum = function (album) {
        $scope.album = albums[index];
        index++;
        if (index == albums.length) {
            index = 0;
        }
    };


    $scope.currentSong = function () {
        return SongPlayer.currentSong;
    }


    $scope.play = function (song) {

        if (song !== this.currentSong) {
            SongPlayer.setSong($scope.album, song);
            console.log('Not the current song');
        }
        
         else if (song === this.currentSong) {
             SongPlayer.togglePlayPause();
             console.log('it is the currentSong');
         }
        
    };

    $scope.pause = function () {
        SongPlayer.pause();
    };

    $scope.previousSong = function () {
        SongPlayer.previousSong();
    };

    $scope.nextSong = function () {
        SongPlayer.nextSong();
    };


    $scope.currentVolume = function (volume) {
        SongPlayer.setVolume(volume);
    };

}]);


// "qm-on-off-hover" directive : Mouse hover(leave) to show(hide) the play button 
/*
blocJams.directive('qmOnOffHover', function() {
    var linkFunction = function (scope, element, attributes) {
        

        var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
        var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';

        var songNumber = attributes.songNumber;
        
        // mouseover
        element.on("mouseover", function (event) {

            element[0].innerHTML = playButtonTemplate;

        });

        //mouseleave
        element.on("mouseleave", function () {
            if (element[0].innerHTML === playButtonTemplate) {
                element[0].innerHTML = songNumber;
            }
        });
        
    };

    return{
        restrict: 'A',
        link: linkFunction,
       
    };
      
});
*/  


blocJams.directive('slider', function () {

    return {
        templateUrl: '/templates/player_bar.html',
        restrict: 'E',
        scope: {},
        link: linkFunction
    };


    var linkFunction = function (scope, element, attributes) {
        element.bind('click', function (event) {
            var offsetX = event.pageX - $(this).offset().left;
            var barWidth = element[0].firstElementChild.clientWidth;
            var seekBarFillRatio = offsetX / barWidth;
        });
    };

});